import { Router, Request, Response } from 'express';
import { Sales } from '../models/Sales';

const router = Router();

// Get all sales
router.get('/', async (_req: Request, res: Response) => {
  try {
    const sales = await Sales.find().sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Get sale by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const sale = await Sales.findById(req.params.id);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(sale);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sale' });
  }
});

// Create sale
router.post('/', async (req: Request, res: Response) => {
  try {
    const sale = new Sales(req.body);
    await sale.save();
    res.status(201).json(sale);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update sale
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const sale = await Sales.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(sale);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete sale
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const sale = await Sales.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json({ message: 'Sale deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sale' });
  }
});

export default router;
