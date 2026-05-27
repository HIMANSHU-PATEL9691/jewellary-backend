import { Schema, model } from 'mongoose';

interface IGirvi {
  date: string;
  loanNo: string;
  customerName: string;
  customerMobile: string;
  customerMobile2?: string;
  customerAddress?: string;
  itemType: string;
  itemCategory?: string;
  itemDescription: string;
  grossWeight: number;
  netWeight: number;
  purity: string;
  marketValue: number;
  loanAmount: number;
  interestPct: number;
  tenureMonths: number;
  documentType?: string;
  documentNumber?: string;
  imageUrl?: string;
  dueDate?: string;
  status: string;
  note?: string;
}

const girviSchema = new Schema<IGirvi>({
  date: { type: String, required: true },
  loanNo: { type: String, required: true },
  customerName: { type: String, required: true },
  customerMobile: { type: String, required: true },
  customerMobile2: { type: String },
  customerAddress: { type: String },
  itemType: { type: String, enum: ['Gold', 'Silver'], required: true },
  itemCategory: { type: String },
  itemDescription: { type: String, required: true },
  grossWeight: { type: Number, required: true },
  netWeight: { type: Number, required: true },
  purity: { type: String, required: true },
  marketValue: { type: Number, required: true },
  loanAmount: { type: Number, required: true },
  interestPct: { type: Number, required: true },
  tenureMonths: { type: Number, required: true },
  documentType: { type: String, enum: ['Invoice', 'Receipt', 'Bill'] },
  documentNumber: { type: String },
  imageUrl: { type: String },
  dueDate: { type: String },
  status: { type: String, enum: ['Active', 'Closed', 'Auctioned'], default: 'Active' },
  note: { type: String },
}, { timestamps: true });

export const Girvi = model<IGirvi>('Girvi', girviSchema);