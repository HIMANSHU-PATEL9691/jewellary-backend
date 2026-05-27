import { Schema, model } from 'mongoose';

interface ISupplier {
  name: string;
  mobile: string;
  companyNo: string;
  email?: string;
  category?: string;
  gstNumber?: string;
  address: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const supplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    companyNo: { type: String, required: true },
    email: { type: String },
    category: { type: String },
    gstNumber: { type: String },
    address: { type: String, required: true },
    note: { type: String, required: true },
  },
  { timestamps: true }
);

export const Supplier = model<ISupplier>('Supplier', supplierSchema);
