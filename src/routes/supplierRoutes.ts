import { Router } from 'express';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier
} from '../controllers/supplierController';

const router = Router();

router.route('/').get(getSuppliers).post(createSupplier);
router.route('/:id').put(updateSupplier).delete(deleteSupplier);

export default router;