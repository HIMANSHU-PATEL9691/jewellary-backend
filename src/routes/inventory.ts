import { Router, Request, Response } from 'express';
import { Inventory } from '../models/Inventory';

const router = Router();

// Get all inventory items
router.get('/', async (_req: Request, res: Response) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get inventory item by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Create inventory item
router.post('/', async (req: Request, res: Response) => {
  try {
    const item = new Inventory(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update inventory item
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete inventory item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

export default router;
