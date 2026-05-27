import { Router, Request, Response } from 'express';
import { Expenses } from '../models/Expenses';

const router = Router();

// Get all expenses
router.get('/', async (_req: Request, res: Response) => {
  try {
    const expenses = await Expenses.find().sort({ createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Get expense by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const expense = await Expenses.findById(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

// Create expense
router.post('/', async (req: Request, res: Response) => {
  try {
    const expense = new Expenses(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update expense
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const expense = await Expenses.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete expense
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const expense = await Expenses.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

export default router;
