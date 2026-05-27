import { Request, Response } from 'express';
import { Supplier } from '../models/Supplier';

export const getSuppliers = async (_req: Request, res: Response) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suppliers', error });
  }
};

export const createSupplier = async (req: Request, res: Response) => {
  try {
    const newSupplier = new Supplier(req.body);
    const savedSupplier = await newSupplier.save();
    res.status(201).json(savedSupplier);
  } catch (error) {
    res.status(500).json({ message: 'Error creating supplier', error });
  }
};

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedSupplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json(updatedSupplier);
  } catch (error) {
    res.status(500).json({ message: 'Error updating supplier', error });
  }
};

export const deleteSupplier = async (req: Request, res: Response) => {
  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!deletedSupplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }
    res.status(200).json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting supplier', error });
  }
};
