import { Router, Request, Response } from 'express';
import { Invoice } from '../models/Invoice';
import { Inventory } from '../models/Inventory';

const router = Router();


// Restore inventory stock/weight when invoice is deleted or items are removed
async function restoreInventoryFromInvoiceItems(
  invoiceItems: Array<{ productId: string; netWeight: number; qty: number }>,
  session: any = null,
) {
  const ownSession = session ?? await Inventory.startSession();
  const manageSession = !session;

  try {
    if (manageSession) {
      ownSession.startTransaction();
    }

    for (const item of invoiceItems) {
      const normalizedProductId = normalizeInvoiceProductId(item.productId);
      if (
        !normalizedProductId ||
        normalizedProductId === 'manual' ||
        normalizedProductId.startsWith('manual-')
      ) {
        continue;
      }

      let inventory = null as any;

      // Try to find inventory by _id first
      try {
        inventory = await Inventory.findById(normalizedProductId).session(ownSession);
      } catch {
        // ignore cast errors
      }

      // If not found, try by huid
      if (!inventory) {
        inventory = await Inventory.findOne({ huid: normalizedProductId }).session(ownSession);
      }

      // If still not found, try as _id string
      if (!inventory) {
        try {
          inventory = await Inventory.findOne({ _id: normalizedProductId }).session(ownSession);
        } catch {
          // ignore
        }
      }

      if (!inventory) {
        continue; // Skip if inventory not found during restoration
      }

      const restoreStock = item.qty;
      const restoreWt = item.netWeight * item.qty;

      inventory.stock = inventory.stock + restoreStock;
      inventory.netWeight = inventory.netWeight + restoreWt;

      await inventory.save({ session: ownSession });
    }

    if (manageSession) {
      await ownSession.commitTransaction();
    }
  } catch (err) {
    if (manageSession) {
      await ownSession.abortTransaction();
    }
    throw err;
  } finally {
    if (manageSession) {
      ownSession.endSession();
    }
  }
}

// Deduct inventory stock/weight when invoice is created
function normalizeInvoiceProductId(productId: string) {
  if (!productId || typeof productId !== 'string') return productId;
  if (productId === 'manual') return 'manual';
  if (productId.startsWith('manual-')) return productId;
  if (productId.includes('__GW_')) {
    return productId.split('__GW_')[0];
  }
  return productId;
}

async function applyInventoryDeductionFromInvoiceItems(
  invoiceItems: Array<{ productId: string; netWeight: number; qty: number }>,
  session: any = null,
) {
  const ownSession = session ?? await Inventory.startSession();
  const manageSession = !session;

  try {
    if (manageSession) {
      ownSession.startTransaction();
    }

    for (const item of invoiceItems) {
      const normalizedProductId = normalizeInvoiceProductId(item.productId);
      if (!normalizedProductId || normalizedProductId.startsWith('manual-')) {
        continue;
      }

      // productId may be an actual Inventory document _id or some other identifier.
      // Try multiple matching strategies.
      let inventory = null as any;

      // 1) Try _id match (works only if productId is a valid ObjectId)
      try {
        inventory = await Inventory.findById(normalizedProductId).session(ownSession);
      } catch {
        // ignore cast errors
      }

      // 2) If not found, try matching by huid
      if (!inventory) {
        inventory = await Inventory.findOne({ huid: normalizedProductId }).session(ownSession);
      }

      // 3) If still not found, try matching by _id as plain string
      // (in case mongoose is able to treat it without cast)
      if (!inventory) {
        try {
          inventory = await Inventory.findOne({ _id: normalizedProductId }).session(ownSession);
        } catch {
          // ignore
        }
      }

      // Skip placeholder/manual lines even if they reach this point (safety net)
      if (item.productId === 'manual' || normalizedProductId === 'manual') {
        continue;
      }

      if (!inventory) {
        throw new Error(
          `Inventory item not found for productId: ${item.productId} (normalized: ${normalizedProductId}, qty: ${item.qty}, netWeight: ${item.netWeight})`,
        );
      }

      const deductStock = item.qty;
      const deductWt = item.netWeight * item.qty;



      if (inventory.stock < deductStock) {
        throw new Error(`Insufficient stock for ${inventory._id}`);
      }
      if (inventory.netWeight < deductWt) {
        throw new Error(`Insufficient wt for ${inventory._id}`);
      }

      inventory.stock = inventory.stock - deductStock;
      inventory.netWeight = inventory.netWeight - deductWt;

      await inventory.save({ session: ownSession });
    }

    if (manageSession) {
      await ownSession.commitTransaction();
    }
  } catch (err) {
    if (manageSession) {
      await ownSession.abortTransaction();
    }
    throw err;
  } finally {
    if (manageSession) {
      ownSession.endSession();
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

router.post('/', async (req: Request, res: Response) => {
  const maxAttempts = 10;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const session = await Inventory.startSession();
    session.startTransaction();

    try {
      const invoicePayload = { ...req.body };

      // On retries, regenerate number (only if it's duplicate-prone / provided).
      if (attempt > 1) {
        invoicePayload.number = generateNewInvoiceNumber(req.body?.number);
      }

      const invoice = new Invoice(invoicePayload);
      const savedInvoice = await invoice.save({ session });

      // Deduct inventory based on invoice items (only after invoice save succeeds)
      await applyInventoryDeductionFromInvoiceItems(
        savedInvoice.items.map((it) => ({
          productId: it.productId,
          netWeight: it.netWeight,
          qty: it.qty,
        })),
        session,
      );

      await session.commitTransaction();
      session.endSession();

      res.status(201).json(savedInvoice);
      return;
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();

      // If invoice number duplicated, retry with new number.
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
  const session = await Inventory.startSession();
  session.startTransaction();

  try {
    const existingInvoice = await Invoice.findById(req.params.id).session(session);
    if (!existingInvoice) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Restore old inventory (based on old items)
    await restoreInventoryFromInvoiceItems(
      existingInvoice.items.map((it) => ({
        productId: it.productId,
        netWeight: it.netWeight,
        qty: it.qty,
      })),
      session,
    );

    // Update invoice
    const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      session,
    });

    if (!updatedInvoice) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Deduct new inventory (based on updated items)
    await applyInventoryDeductionFromInvoiceItems(
      updatedInvoice.items.map((it) => ({
        productId: it.productId,
        netWeight: it.netWeight,
        qty: it.qty,
      })),
      session,
    );

    await session.commitTransaction();
    session.endSession();

    return res.json(updatedInvoice);
  } catch (error: any) {
    await session.abortTransaction();
    session.endSession();

    console.error('[PUT /api/invoices] failed:', error);
    const msg = error?.message || 'Failed to update invoice';

    // Duplicate invoice number on update (unique index)
    if (isDuplicateInvoiceNumberError(error)) {
      return res.status(409).json({ error: 'Invoice number already exists.' });
    }

    return res.status(400).json({ error: msg });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const session = await Inventory.startSession();
    session.startTransaction();

    try {
      const invoice = await Invoice.findById(req.params.id).session(session);
      if (!invoice) {
        session.endSession();
        return res.status(404).json({ error: 'Invoice not found' });
      }

      // Restore inventory before deleting
      await restoreInventoryFromInvoiceItems(
        invoice.items.map((it) => ({
          productId: it.productId,
          netWeight: it.netWeight,
          qty: it.qty,
        })),
        session,
      );

      // Delete the invoice
      await Invoice.findByIdAndDelete(req.params.id).session(session);

      await session.commitTransaction();
      session.endSession();

      res.json({ message: 'Invoice deleted and inventory restored' });
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      console.error('[DELETE /api/invoices] failed:', error);
      res.status(400).json({ error: error?.message || 'Failed to delete invoice' });
    }
  } catch (error: any) {
    console.error('[DELETE /api/invoices] session failed:', error);
    res.status(500).json({ error: error?.message || 'Failed to delete invoice' });
  }
});


export default router;
