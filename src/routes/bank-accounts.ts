import { Router, Request, Response } from 'express';
import { BankAccount } from '../models/BankAccount';

const router = Router();

// Get all active bank accounts
router.get('/', async (_req: Request, res: Response) => {
  try {
    const accounts = await BankAccount.find({ isActive: true }).sort({ createdAt: 1 }).lean();
    res.json(accounts);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch bank accounts' });
  }
});

// Create bank account
router.post('/', async (req: Request, res: Response) => {
  try {
    const account = new BankAccount(req.body);
    await account.save();
    res.status(201).json(account);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create bank account' });
  }
});

// Update bank account
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const account = await BankAccount.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!account) return res.status(404).json({ error: 'Bank account not found' });
    res.json(account);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to update bank account' });
  }
});

// Deactivate / delete bank account
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const account = await BankAccount.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!account) return res.status(404).json({ error: 'Bank account not found' });
    res.json({ message: 'Bank account deactivated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to deactivate bank account' });
  }
});

export default router;
