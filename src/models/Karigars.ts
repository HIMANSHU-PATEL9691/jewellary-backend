import { Schema, model } from 'mongoose';

interface IKarigar {
  name: string;
  mobile: string;
  mobile2?: string;
  companyName: string;
  email?: string;
  category: string;
  gstNumber?: string;
  address: string;
  note: string;
  pendingWeight: number;
  createdAt: Date;
  updatedAt: Date;
}

const karigarSchema = new Schema<IKarigar>(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    mobile2: { type: String },
    companyName: { type: String, required: true },
    email: { type: String },
    category: { type: String, required: true },
    gstNumber: { type: String },
    address: { type: String, required: true },
    note: { type: String, required: true },
    pendingWeight: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Karigars = model<IKarigar>('Karigars', karigarSchema);