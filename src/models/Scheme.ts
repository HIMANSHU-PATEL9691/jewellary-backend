import { Schema, model } from 'mongoose';

interface IScheme {
  schemeNo: string;
  date: string;
  customerName: string;
  customerMobile?: string;
  planName: string;
  monthlyAmount: number;
  tenureMonths: number;
  paidMonths: number;
  totalPaid: number;
  maturityDate?: string;
  status: string;
}

const schemeSchema = new Schema<IScheme>(
  {
    schemeNo: { type: String, required: true },
    date: { type: String, required: true },
    customerName: { type: String, required: true },
    customerMobile: { type: String },
    planName: { type: String, required: true },
    monthlyAmount: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    paidMonths: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    maturityDate: { type: String },
    status: { type: String, default: 'Active' },
  },
  { timestamps: true }
);

export const Scheme = model<IScheme>('Scheme', schemeSchema);