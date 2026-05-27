import { Router, Request, Response } from 'express';
import { Advance } from '../models/Advance';

const router = Router();

// Get all advances
router.get('/', async (_req: Request, res: Response) => {
  try {
    const advances = await Advance.find().sort({ createdAt: -1 });
    res.json(advances);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch advances' });
  }
});

// Create advance
router.post('/', async (req: Request, res: Response) => {
  try {
    const advance = new Advance(req.body);
    await advance.save();
    res.status(201).json(advance);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update advance
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const advance = await Advance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!advance) return res.status(404).json({ error: 'Advance not found' });
    res.json(advance);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete advance
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const advance = await Advance.findByIdAndDelete(req.params.id);
    if (!advance) return res.status(404).json({ error: 'Advance not found' });
    res.json({ message: 'Advance deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete advance' });
  }
});

export default router;