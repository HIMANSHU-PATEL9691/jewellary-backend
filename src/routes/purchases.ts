import { Router, Request, Response } from 'express';
import { Purchases } from '../models/Purchases';

const router = Router();

// Get all purchases
router.get('/', async (_req: Request, res: Response) => {
  try {
    const purchases = await Purchases.find().sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchases' });
  }
});

// Get purchase by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const purchase = await Purchases.findById(req.params.id);
    if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch purchase' });
  }
});

// Create purchase
router.post('/', async (req: Request, res: Response) => {
  try {
    const purchase = new Purchases(req.body);
    await purchase.save();
    res.status(201).json(purchase);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update purchase
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const purchase = await Purchases.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
    res.json(purchase);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete purchase
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const purchase = await Purchases.findByIdAndDelete(req.params.id);
    if (!purchase) return res.status(404).json({ error: 'Purchase not found' });
    res.json({ message: 'Purchase deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete purchase' });
  }
});

export default router;
