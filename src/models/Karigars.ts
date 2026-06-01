import { Schema, model } from 'mongoose';

interface IKarigar {
  name: string;
  mobile: string;
  mobile2?: string;
  companyName?: string;
  email?: string;
  category?: string;
  specialty?: string;
  gstNumber?: string;
  address?: string;
  note?: string;
  pendingWeight: number;
  createdAt: Date;
  updatedAt: Date;
}

const karigarSchema = new Schema<IKarigar>(
  {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    mobile2: { type: String },
    companyName: { type: String },
    email: { type: String },
    category: { type: String },
    specialty: { type: String },
    gstNumber: { type: String },
    address: { type: String },
    note: { type: String },
    pendingWeight: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Karigars = model<IKarigar>('Karigars', karigarSchema);