import { Router, Request, Response } from 'express';
import { Repair } from '../models/Repair';

const router = Router();

// Get all repairs
router.get('/', async (_req: Request, res: Response) => {
  try {
    const repairs = await Repair.find().sort({ createdAt: -1 });
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repairs' });
  }
});

// Get repair by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const repair = await Repair.findById(req.params.id);
    if (!repair) return res.status(404).json({ error: 'Repair not found' });
    res.json(repair);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch repair' });
  }
});

// Create repair
router.post('/', async (req: Request, res: Response) => {
  try {
    const repair = new Repair(req.body);
    await repair.save();
    res.status(201).json(repair);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update repair
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const repair = await Repair.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!repair) return res.status(404).json({ error: 'Repair not found' });
    res.json(repair);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete repair
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const repair = await Repair.findByIdAndDelete(req.params.id);
    if (!repair) return res.status(404).json({ error: 'Repair not found' });
    res.json({ message: 'Repair deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete repair' });
  }
});

export default router;
