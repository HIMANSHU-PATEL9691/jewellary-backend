import { Router, Request, Response } from 'express';
import { Customer } from '../models/Customer';

const router = Router();

// Helper to strip dummy phone values before sending to client
const cleanCustomer = (doc: any) => {
  const obj = doc.toJSON ? doc.toJSON() : { ...doc };
  if (obj.phone && obj.phone.startsWith('no_phone_')) {
    obj.phone = '';
  }
  if (obj.phone2 && obj.phone2.startsWith('no_phone2_')) {
    obj.phone2 = '';
  }
  return obj;
};

// Get all customers
router.get('/', async (_req: Request, res: Response) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json(customers.map(cleanCustomer));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json(cleanCustomer(customer));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create customer
router.post('/', async (req: Request, res: Response) => {
  try {
    console.log('[Backend] Attempting to save new Customer to DB:', req.body);
    
    const customerData = { ...req.body };
    // Prevent E11000 duplicate key error for empty phone numbers
    if (!customerData.phone || customerData.phone.trim() === '') {
      customerData.phone = `no_phone_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
    // Prevent E11000 duplicate key error for empty secondary phone numbers
    if (!customerData.phone2 || customerData.phone2.trim() === '') {
      // Use a different prefix to avoid collisions if both are empty
      customerData.phone2 = `no_phone2_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }

    const customer = new Customer(customerData);
    await customer.save();
    console.log('[Backend] Customer saved successfully:', customer._id);
    res.status(201).json(cleanCustomer(customer));
  } catch (error: any) {
    console.error('[Backend] Error creating customer:', {
      message: error?.message,
      name: error?.name,
      details: error?.errors,
      body: req.body,
    });
    res.status(400).json({ error: error?.message || 'Bad Request', details: error?.errors || undefined });
  }

});

// Update customer
router.put('/:id', async (req: Request, res: Response) => {
  try {
    console.log(`[Backend] Attempting to update Customer ${req.params.id} with data:`, req.body);
    
    const updateData = { ...req.body };
    // Prevent E11000 duplicate key error if phone is cleared during an edit
    if (updateData.phone !== undefined && updateData.phone.trim() === '') {
      updateData.phone = `no_phone_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }
    // Prevent E11000 duplicate key error if secondary phone is cleared during an edit
    if (updateData.phone2 !== undefined && updateData.phone2.trim() === '') {
      // Use a different prefix to avoid collisions if both are empty
      updateData.phone2 = `no_phone2_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    }

    const customer = await Customer.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    console.log('[Backend] Customer updated successfully:', customer._id);
    res.json(cleanCustomer(customer));
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
