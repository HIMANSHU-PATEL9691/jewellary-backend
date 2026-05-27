import { Router, Request, Response } from 'express';
import { Girvi } from '../models/Girvi';

const router = Router();

// Get all girvi records
router.get('/', async (_req: Request, res: Response) => {
  try {
    const records = await Girvi.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch girvi records' });
  }
});

// Create new girvi record
router.post('/', async (req: Request, res: Response) => {
  try {
    const record = new Girvi(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update girvi record
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const record = await Girvi.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json(record);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete girvi record
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const record = await Girvi.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

export default router;