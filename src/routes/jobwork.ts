import { Router, Request, Response } from 'express';
import { Jobwork } from '../models/Jobwork';

const router = Router();

// Get all jobwork
router.get('/', async (_req: Request, res: Response) => {
  try {
    const jobwork = await Jobwork.find().sort({ createdAt: -1 });
    res.json(jobwork);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobwork' });
  }
});

// Get jobwork by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const job = await Jobwork.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Jobwork not found' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobwork' });
  }
});

// Create jobwork
router.post('/', async (req: Request, res: Response) => {
  try {
    const job = new Jobwork(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update jobwork
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const job = await Jobwork.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) return res.status(404).json({ error: 'Jobwork not found' });
    res.json(job);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete jobwork
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const job = await Jobwork.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ error: 'Jobwork not found' });
    res.json({ message: 'Jobwork deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete jobwork' });
  }
});

export default router;
