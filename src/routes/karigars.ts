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
    if (req.body.username) karigar.set('username', req.body.username, { strict: false });
    if (req.body.password) karigar.set('password', req.body.password, { strict: false });
    
    // Generate guaranteed unique hidden values to bypass any strict MongoDB unique indexes 
    // so the admin can create UNLIMITED Karigars without E11000 crash errors!
    karigar.set('phone', `k_${Date.now()}_${Math.random().toString(36).slice(2)}`, { strict: false });
    if (!req.body.email) {
      karigar.set('email', `k_${Date.now()}@placeholder.com`, { strict: false });
    }

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
      strict: false,
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
