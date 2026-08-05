import { Router, Request, Response } from 'express';
import { Invoice } from '../models/Invoice';
import { Inventory } from '../models/Inventory';

const router = Router();


function parseItemWeights(item: { productId: string; grossWeight?: number; netWeight: number; stoneWeight?: number }) {
  let grossWt = item.grossWeight;
  let stoneWt = item.stoneWeight;
  let netWt = item.netWeight;

  if ((grossWt === undefined || grossWt === null) && item.productId && typeof item.productId === 'string' && item.productId.includes('__GW_')) {
    const parts = item.productId.split('__GW_');
    if (parts[1]) {
      const sub = parts[1].split('__SW_');
      if (sub[0]) grossWt = Number(sub[0]);
      if (sub[1]) stoneWt = Number(sub[1]);
    }
  }

  const net = Number(netWt || 0);
  const gross = Number(grossWt !== undefined && grossWt !== null && !isNaN(Number(grossWt)) ? grossWt : net);
  const stone = Number(stoneWt !== undefined && stoneWt !== null && !isNaN(Number(stoneWt)) ? stoneWt : 0);

  return { grossWt: gross, netWt: net, stoneWt: stone };
}

// Restore inventory stock/weight when invoice is deleted or items are removed
function normalizeInvoiceProductId(productId: string) {
  if (!productId || typeof productId !== 'string') return productId;
  if (productId === 'manual') return 'manual';
  if (productId.startsWith('manual-')) return productId;
  if (productId.includes('__GW_')) {
    return productId.split('__GW_')[0];
  }
  return productId;
}

function extractIdentifiersFromName(name: string) {
  if (!name || typeof name !== 'string') return { cleanName: name || '', huid: null, barcode: null };

  let huid: string | null = null;
  let barcode: string | null = null;

  const huidMatch = name.match(/\(HUID:\s*([^)]+)\)/i);
  if (huidMatch && huidMatch[1]) {
    huid = huidMatch[1].trim();
  }

  const bcMatch = name.match(/\(BC:\s*([^)]+)\)/i);
  if (bcMatch && bcMatch[1]) {
    barcode = bcMatch[1].trim();
  }

  const cleanName = name
    .replace(/\(HUID:\s*[^)]+\)/gi, '')
    .replace(/\(BC:\s*[^)]+\)/gi, '')
    .trim();

  return { cleanName, huid, barcode };
}

async function findInventoryItemForItem(
  item: { productId?: string; name?: string },
  session: any = null
) {
  const productId = item.productId || '';
  const normalizedProductId = normalizeInvoiceProductId(productId);
  const { cleanName, huid: extractedHuid, barcode: extractedBc } = extractIdentifiersFromName(item.name || '');

  // 1. Try by _id if valid ObjectId string
  if (normalizedProductId && !normalizedProductId.startsWith('manual-') && normalizedProductId !== 'manual') {
    try {
      const inv = session
        ? await Inventory.findById(normalizedProductId).session(session)
        : await Inventory.findById(normalizedProductId);
      if (inv) return inv;
    } catch {
      // ignore cast error
    }
  }

  // 2. Build array of queries to attempt
  const queries: Array<Record<string, any>> = [];

  if (normalizedProductId && !normalizedProductId.startsWith('manual-') && normalizedProductId !== 'manual') {
    queries.push({ huid: normalizedProductId });
    queries.push({ barcode: normalizedProductId });
    queries.push({ name: normalizedProductId });
    queries.push({ _id: normalizedProductId });
  }

  if (extractedHuid) {
    queries.push({ huid: extractedHuid });
  }

  if (extractedBc) {
    queries.push({ barcode: extractedBc });
  }

  if (cleanName) {
    queries.push({ name: cleanName });
    queries.push({ huid: cleanName });
    queries.push({ barcode: cleanName });
  }

  if (item.name && item.name !== cleanName) {
    queries.push({ name: item.name });
  }

  for (const q of queries) {
    try {
      const found = session
        ? await Inventory.findOne(q).session(session)
        : await Inventory.findOne(q);
      if (found) return found;
    } catch {
      // ignore query error
    }
  }

  return null;
}

async function restoreInventoryFromInvoiceItems(
  invoiceItems: Array<{ productId: string; name?: string; grossWeight?: number; netWeight: number; stoneWeight?: number; qty: number }>,
  session: any = null,
) {
  for (const item of invoiceItems) {
    const inventory = await findInventoryItemForItem(item, session);

    if (!inventory) {
      console.warn(
        `[Inventory Restoration] Item not found for productId: ${item.productId}, name: ${item.name}`
      );
      continue;
    }

    const { grossWt: restoreGrossWt, netWt: restoreNetWt, stoneWt: restoreStoneWt } = parseItemWeights(item as any);
    const restoreStock = Number(item.qty || 1);

    const currentStock = Number(inventory.stock ?? 0);
    const currentNetWt = Number(inventory.netWeight ?? 0);
    const currentGrossWt = Number(inventory.grossWeight !== undefined && inventory.grossWeight !== null ? inventory.grossWeight : currentNetWt);
    const currentStoneWt = Number(inventory.stoneWeight ?? 0);

    inventory.stock = currentStock + restoreStock;
    inventory.grossWeight = Number((currentGrossWt + restoreGrossWt).toFixed(3));
    inventory.stoneWeight = Number((currentStoneWt + restoreStoneWt).toFixed(3));
    inventory.netWeight = Number((currentNetWt + restoreNetWt).toFixed(3));

    if (session) {
      await inventory.save({ session });
    } else {
      await inventory.save();
    }
  }
}

async function applyInventoryDeductionFromInvoiceItems(
  invoiceItems: Array<{ productId: string; name?: string; grossWeight?: number; netWeight: number; stoneWeight?: number; qty: number }>,
  session: any = null,
) {
  for (const item of invoiceItems) {
    const inventory = await findInventoryItemForItem(item, session);

    if (!inventory) {
      console.warn(
        `[Inventory Deduction] Item not found for productId: ${item.productId}, name: ${item.name}`
      );
      continue;
    }

    const { grossWt: deductGrossWt, netWt: deductNetWt, stoneWt: deductStoneWt } = parseItemWeights(item as any);
    const deductStock = Number(item.qty || 1);

    const currentStock = Number(inventory.stock ?? 0);
    const currentNetWt = Number(inventory.netWeight ?? 0);
    const currentGrossWt = Number(inventory.grossWeight !== undefined && inventory.grossWeight !== null ? inventory.grossWeight : currentNetWt);
    const currentStoneWt = Number(inventory.stoneWeight ?? 0);

    inventory.stock = Math.max(0, currentStock - deductStock);
    inventory.grossWeight = Math.max(0, Number((currentGrossWt - deductGrossWt).toFixed(3)));
    inventory.stoneWeight = Math.max(0, Number((currentStoneWt - deductStoneWt).toFixed(3)));
    inventory.netWeight = Math.max(0, Number((currentNetWt - deductNetWt).toFixed(3)));

    if (session) {
      await inventory.save({ session });
    } else {
      await inventory.save();
    }
  }
}

router.get('/', async (_req: Request, res: Response) => {

  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

function isDuplicateInvoiceNumberError(error: any) {
  const msg = typeof error?.message === 'string' ? error.message : '';
  return msg.includes('duplicate key error') && msg.includes('number');
}

function generateNewInvoiceNumber(baseNumber?: string) {
  // Keep INV sequence style: INV-000001, INV-000002, ...
  // If baseNumber already matches INV-<digits>, increment it.
  // Otherwise fallback to current timestamp (still prefixed with INV-).
  if (baseNumber && typeof baseNumber === 'string') {
    const m = baseNumber.match(/^(INV-)(\d+)$/i);
    if (m) {
      const prefix = m[1];
      const digits = m[2];
      const width = digits.length;
      const next = String(Number(digits) + 1).padStart(width, '0');
      return `${prefix}${next}`;
    }

    const m2 = baseNumber.match(/^(INV-\s*?)(\d+)$/i);
    if (m2) {
      const prefix = m2[1].replace(/\s+/g, '');
      const digits = m2[2];
      const width = digits.length;
      const next = String(Number(digits) + 1).padStart(width, '0');
      return `${prefix}${next}`;
    }
  }

  const now = Date.now();
  const rand = Math.floor(Math.random() * 1000);
  return `INV-${now}${rand}`;
}

async function getOptionalTransactionSession() {
  let session: any = null;
  let isTransaction = false;
  try {
    session = await Inventory.startSession();
    try {
      session.startTransaction();
      isTransaction = true;
    } catch {
      isTransaction = false;
    }
  } catch {
    session = null;
    isTransaction = false;
  }
  return { session, isTransaction };
}

router.post('/', async (req: Request, res: Response) => {
  const maxAttempts = 10;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { session, isTransaction } = await getOptionalTransactionSession();

    try {
      const invoicePayload = { ...req.body };

      // On retries, regenerate number (only if duplicate-prone)
      if (attempt > 1) {
        invoicePayload.number = generateNewInvoiceNumber(req.body?.number);
      }

      // Recalculate invoice totals using: netWeight * ratePerGram + makingCharge
      const items = Array.isArray(invoicePayload.items) ? invoicePayload.items : [];

      let itemSubtotal = 0;
      let gstAmount = 0;

      items.forEach((it: any) => {
        const netWeight = Number(it?.netWeight ?? 0);
        const ratePerGram = Number(it?.ratePerGram ?? 0);
        const makingCharge = Number(it?.makingCharge ?? 0);
        const lineBase = netWeight * ratePerGram + makingCharge;
        
        const gstPct = Number(it?.gstPct ?? 0);
        itemSubtotal += lineBase;
        if (invoicePayload.type === 'GST') {
          gstAmount += lineBase * (gstPct / 100);
        }
      });

      invoicePayload.items = items;
      invoicePayload.subtotal = itemSubtotal;
      invoicePayload.gstAmount = gstAmount;

      const preRound = itemSubtotal + gstAmount - (Number(invoicePayload.discount) || 0) - (Number(invoicePayload.oldGoldAmount) || 0);
      invoicePayload.total = Math.round(preRound);

      if (invoicePayload.createdAt) {
        invoicePayload.createdAt = new Date(invoicePayload.createdAt);
      }

      const invoice = new Invoice(invoicePayload);
      const savedInvoice = session ? await invoice.save({ session }) : await invoice.save();

      // Deduct inventory based on invoice items
      await applyInventoryDeductionFromInvoiceItems(
        savedInvoice.items.map((it: any) => ({
          productId: it.productId,
          name: it.name,
          grossWeight: it.grossWeight,
          netWeight: it.netWeight,
          stoneWeight: it.stoneWeight,
          qty: it.qty,
        })),
        session,
      );

      if (isTransaction && session) {
        await session.commitTransaction();
      }
      if (session) {
        session.endSession();
      }

      res.status(201).json(savedInvoice);
      return;
    } catch (error: any) {
      if (isTransaction && session) {
        await session.abortTransaction().catch(() => {});
      }
      if (session) {
        session.endSession();
      }

      if (isDuplicateInvoiceNumberError(error) && attempt < maxAttempts) {
        continue;
      }

      console.error('[POST /api/invoices] failed:', error);
      const msg = error?.message || 'Failed to create invoice';

      if (isDuplicateInvoiceNumberError(error)) {
        res.status(409).json({ error: 'Invoice number already exists. Please regenerate with a new number.' });
        return;
      }

      res.status(400).json({ error: msg });
      return;
    }
  }

  res.status(500).json({ error: 'Failed to create invoice after multiple attempts due to duplicate invoice number.' });
});

router.put('/:id', async (req: Request, res: Response) => {
  const { session, isTransaction } = await getOptionalTransactionSession();

  try {
    const existingInvoice = session
      ? await Invoice.findById(req.params.id).session(session)
      : await Invoice.findById(req.params.id);

    if (!existingInvoice) {
      if (isTransaction && session) await session.abortTransaction().catch(() => {});
      if (session) session.endSession();
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Restore old inventory
    await restoreInventoryFromInvoiceItems(
      existingInvoice.items.map((it: any) => ({
        productId: it.productId,
        name: it.name,
        grossWeight: it.grossWeight,
        netWeight: it.netWeight,
        stoneWeight: it.stoneWeight,
        qty: it.qty,
      })),
      session,
    );

    const updatePayload = { ...req.body };
    if (updatePayload.createdAt) {
      updatePayload.createdAt = new Date(updatePayload.createdAt);
    }

    const options: any = { new: true, runValidators: true };
    if (session) options.session = session;

    const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, updatePayload, options);

    if (!updatedInvoice) {
      if (isTransaction && session) await session.abortTransaction().catch(() => {});
      if (session) session.endSession();
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Deduct new inventory
    await applyInventoryDeductionFromInvoiceItems(
      updatedInvoice.items.map((it: any) => ({
        productId: it.productId,
        name: it.name,
        grossWeight: it.grossWeight,
        netWeight: it.netWeight,
        stoneWeight: it.stoneWeight,
        qty: it.qty,
      })),
      session,
    );

    if (isTransaction && session) {
      await session.commitTransaction();
    }
    if (session) {
      session.endSession();
    }

    return res.json(updatedInvoice);
  } catch (error: any) {
    if (isTransaction && session) {
      await session.abortTransaction().catch(() => {});
    }
    if (session) {
      session.endSession();
    }

    console.error('[PUT /api/invoices] failed:', error);
    const msg = error?.message || 'Failed to update invoice';

    if (isDuplicateInvoiceNumberError(error)) {
      return res.status(409).json({ error: 'Invoice number already exists.' });
    }

    return res.status(400).json({ error: msg });
  }
});

// Update only invoice date (no inventory changes, no item/payment changes)
const updateInvoiceDateHandler = async (req: Request, res: Response) => {
  try {
    if (!req.body?.createdAt) {
      return res.status(400).json({ error: 'createdAt is required' });
    }

    const parsedDate = new Date(req.body.createdAt);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid createdAt date' });
    }

    const existingInvoice = await Invoice.findById(req.params.id);
    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    existingInvoice.createdAt = parsedDate;
    (existingInvoice.payments || []).forEach((p: any) => {
      p.date = parsedDate;
    });

    const updatedInvoice = await existingInvoice.save({ validateBeforeSave: false });
    
    if (!updatedInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    return res.json(updatedInvoice);
  } catch (error: any) {
    console.error('[PUT/PATCH /api/invoices/:id/date] failed:', error);
    return res.status(400).json({ error: error?.message || 'Failed to update invoice date' });
  }
};

router.put('/:id/date', updateInvoiceDateHandler);
router.patch('/:id/date', updateInvoiceDateHandler);

router.delete('/:id', async (req: Request, res: Response) => {
  const { session, isTransaction } = await getOptionalTransactionSession();

  try {
    const invoice = session
      ? await Invoice.findById(req.params.id).session(session)
      : await Invoice.findById(req.params.id);

    if (!invoice) {
      if (isTransaction && session) await session.abortTransaction().catch(() => {});
      if (session) session.endSession();
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Restore inventory before deleting
    await restoreInventoryFromInvoiceItems(
      invoice.items.map((it: any) => ({
        productId: it.productId,
        name: it.name,
        grossWeight: it.grossWeight,
        netWeight: it.netWeight,
        stoneWeight: it.stoneWeight,
        qty: it.qty,
      })),
      session,
    );

    // Delete the invoice
    if (session) {
      await Invoice.findByIdAndDelete(req.params.id).session(session);
    } else {
      await Invoice.findByIdAndDelete(req.params.id);
    }

    if (isTransaction && session) {
      await session.commitTransaction();
    }
    if (session) {
      session.endSession();
    }

    res.json({ message: 'Invoice deleted and inventory restored' });
  } catch (error: any) {
    if (isTransaction && session) {
      await session.abortTransaction().catch(() => {});
    }
    if (session) {
      session.endSession();
    }

    console.error('[DELETE /api/invoices] failed:', error);
    res.status(400).json({ error: error?.message || 'Failed to delete invoice' });
  }
});


export default router;
