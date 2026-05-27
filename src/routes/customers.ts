import { Router, Request, Response } from 'express';
import { Customer } from '../models/Customer';

const router = Router();

// Get all customers
router.get('/', async (_req: Request, res: Response) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create customer
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('[Backend] Attempting to save new Customer to DB:', req.body);
    const customer = new Customer(req.body);
    await customer.save();
    console.log('[Backend] Customer saved successfully:', customer._id);
    res.status(201).json(customer);
  } catch (error: any) {
    console.error('[Backend] Error creating customer:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', async (req: Request, res: Response) => {
  try {
    console.log(`[Backend] Attempting to update Customer ${req.params.id} with data:`, req.body);
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    console.log('[Backend] Customer updated successfully:', customer._id);
    res.json(customer);
  } catch (error: any) {
    console.error('[Backend] Error updating customer:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;
