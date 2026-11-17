import { Router, Request, Response } from 'express';
import { FinancialTransaction } from '../models/FinancialTransaction';

const router = Router();

function generateTransactionId() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TXN-${ymd}-${rand}`;
}

// Get all non-deleted transactions
router.get('/', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, method, type } = req.query;
    const filter: any = { isDeleted: false };

    if (startDate && endDate) {
      filter.date = { $gte: String(startDate), $lte: String(endDate) };
    } else if (startDate) {
      filter.date = { $gte: String(startDate) };
    } else if (endDate) {
      filter.date = { $lte: String(endDate) };
    }

    if (method && method !== 'All') {
      filter.method = method;
    }

    if (type && type !== 'All') {
      filter.type = type;
    }

    const transactions = await FinancialTransaction.find(filter).sort({ date: -1, createdAt: -1 }).lean();
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch financial transactions' });
  }
});

// Get single transaction
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const txn = await FinancialTransaction.findById(req.params.id);
    if (!txn || txn.isDeleted) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(txn);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch transaction' });
  }
});

// Create transaction (supports IN, OUT, and internal TRANSFER)
router.post('/', async (req: Request, res: Response) => {
  try {
    const payload = { ...req.body };
    if (!payload.transactionId) {
      payload.transactionId = generateTransactionId();
    }
    if (!payload.date) {
      payload.date = new Date().toISOString();
    }

    // Mark internal transfers
    if (payload.type === 'TRANSFER' || payload.transferType) {
      payload.isInternalTransfer = true;
    }

    const txn = new FinancialTransaction(payload);
    await txn.save();
    res.status(201).json(txn);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create transaction' });
  }
});

// Update transaction
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const txn = await FinancialTransaction.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!txn) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(txn);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update transaction' });
  }
});

// Soft-delete transaction (never delete permanently)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const txn = await FinancialTransaction.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    if (!txn) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction marked as deleted', id: txn._id });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete transaction' });
  }
});

export default router;
