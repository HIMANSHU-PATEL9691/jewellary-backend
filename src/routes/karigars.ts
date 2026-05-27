import { Router, Request, Response } from 'express';
import { Karigars } from '../models/Karigars';

const router = Router();

// Get all karigars
router.get('/', async (_req: Request, res: Response) => {
  try {
    const karigars = await Karigars.find().sort({ createdAt: -1 });
    res.json(karigars);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch karigars' });
  }
});

// Get karigars by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const karigar = await Karigars.findById(req.params.id);
    if (!karigar) return res.status(404).json({ error: 'Karigar not found' });
    res.json(karigar);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch karigar' });
  }
});

// Create karigar
router.post('/', async (req: Request, res: Response) => {
  try {
    const karigar = new Karigars(req.body);
    await karigar.save();
    res.status(201).json(karigar);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update karigar
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const karigar = await Karigars.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!karigar) return res.status(404).json({ error: 'Karigar not found' });
    res.json(karigar);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete karigar
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const karigar = await Karigars.findByIdAndDelete(req.params.id);
    if (!karigar) return res.status(404).json({ error: 'Karigar not found' });
    res.json({ message: 'Karigar deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete karigar' });
  }
});

export default router;
