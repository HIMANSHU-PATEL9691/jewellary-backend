import { Schema, model } from 'mongoose';

interface ICustomer {
  name: string;
  phone: string;
  phone2?: string;
  address: string;
  gstNumber?: string;
  pan?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    phone2: { type: String },
    address: { type: String, required: true },
    gstNumber: { type: String },
    pan: { type: String },
    notes: { type: String, required: true },
  },
  { timestamps: true }
);

export const Customer = model<ICustomer>('Customer', customerSchema);
