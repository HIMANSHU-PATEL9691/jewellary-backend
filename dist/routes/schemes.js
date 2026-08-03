import { Router } from 'express';
import { Scheme } from '../models/Scheme';
const router = Router();
// Get all schemes
router.get('/', async (_req, res) => {
    try {
        const schemes = await Scheme.find().sort({ createdAt: -1 });
        res.json(schemes);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch schemes' });
    }
});
// Get scheme by ID
router.get('/:id', async (req, res) => {
    try {
        const scheme = await Scheme.findById(req.params.id);
        if (!scheme)
            return res.status(404).json({ error: 'Scheme not found' });
        res.json(scheme);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch scheme' });
    }
});
// Create scheme
router.post('/', async (req, res) => {
    try {
        const scheme = new Scheme(req.body);
        await scheme.save();
        res.status(201).json(scheme);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to create scheme' });
    }
});
// Update scheme
router.put('/:id', async (req, res) => {
    try {
        const scheme = await Scheme.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!scheme)
            return res.status(404).json({ error: 'Scheme not found' });
        res.json(scheme);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to update scheme' });
    }
});
// Delete scheme
router.delete('/:id', async (req, res) => {
    try {
        const scheme = await Scheme.findByIdAndDelete(req.params.id);
        if (!scheme)
            return res.status(404).json({ error: 'Scheme not found' });
        res.json({ message: 'Scheme deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete scheme' });
    }
});
export default router;
