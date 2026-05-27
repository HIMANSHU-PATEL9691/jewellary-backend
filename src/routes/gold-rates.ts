import { Router, Request, Response } from 'express';
import { GoldRates } from '../models/GoldRates';

const router = Router();

// Get all gold rates
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rates = await GoldRates.find().sort({ date: -1 });
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gold rates' });
  }
});

// Get gold rate by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const rate = await GoldRates.findById(req.params.id);
    if (!rate) return res.status(404).json({ error: 'Gold rate not found' });
    res.json(rate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gold rate' });
  }
});

// Create gold rate
router.post('/', async (req: Request, res: Response) => {
  try {
    const rate = new GoldRates(req.body);
    await rate.save();
    res.status(201).json(rate);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update gold rate
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const rate = await GoldRates.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!rate) return res.status(404).json({ error: 'Gold rate not found' });
    res.json(rate);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete gold rate
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const rate = await GoldRates.findByIdAndDelete(req.params.id);
    if (!rate) return res.status(404).json({ error: 'Gold rate not found' });
    res.json({ message: 'Gold rate deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete gold rate' });
  }
});

export default router;
