import { Router } from 'express';
import { Inventory } from '../models/Inventory';
const router = Router();
// Get all inventory items
router.get('/', async (_req, res) => {
    try {
        const items = await Inventory.find().sort({ createdAt: -1 });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});
// Get inventory item by ID
router.get('/:id', async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item)
            return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch item' });
    }
});
// Create inventory item
router.post('/', async (req, res) => {
    try {
        const item = new Inventory(req.body);
        await item.save();
        res.status(201).json(item);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Update inventory item
router.put('/:id', async (req, res) => {
    try {
        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        delete updateData.__v;
        const item = await Inventory.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!item)
            return res.status(404).json({ error: 'Item not found' });
        res.json(item);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to update item' });
    }
});
// Delete inventory item
router.delete('/:id', async (req, res) => {
    try {
        const item = await Inventory.findByIdAndDelete(req.params.id);
        if (!item)
            return res.status(404).json({ error: 'Item not found' });
        res.json({ message: 'Item deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete item' });
    }
});
export default router;
