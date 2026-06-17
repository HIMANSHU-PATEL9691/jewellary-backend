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
      if (!normalizedProductId || normalizedProductId.startsWith('manual-')) {
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

      if (!inventory) {
        throw new Error(`Inventory item not found for productId: ${item.productId}`);
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

router.post('/', async (req: Request, res: Response) => {
  try {
    const session = await Inventory.startSession();
    session.startTransaction();

    try {
      const invoice = new Invoice(req.body);
      const savedInvoice = await invoice.save({ session });

      // Deduct inventory based on invoice items
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
    } catch (error: any) {
      await session.abortTransaction();
      session.endSession();
      console.error('[POST /api/invoices] deduction failed:', error);
      res.status(400).json({ error: error?.message || 'Failed to deduct inventory' });
    }
  } catch (error: any) {
    console.error('[POST /api/invoices] session failed:', error);
    res.status(500).json({ error: error?.message || 'Failed to create invoice' });
  }
});



router.put('/:id', async (req: Request, res: Response) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
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
