import { Router, Request, Response } from 'express';
import { Supplier } from '../models/Supplier';

const router = Router();

// Get all suppliers
router.get('/', async (_req: Request, res: Response) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Get supplier by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// Create supplier
router.post('/', async (req: Request, res: Response) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update supplier
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json(supplier);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete supplier
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
    res.json({ message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

export default router;
