import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplierTransaction {
  date: string;
  type: 'Credit' | 'Debit';
  metal: 'Gold' | 'Silver';
  purity: string;
  weight: number;
  note: string;
}

export interface ISupplier extends Document {
  name: string;
  mobile: string;
  companyNo: string;
  email?: string;
  category: string;
  gstNumber?: string;
  address: string;
  note: string;
  balanceGold: number;
  balanceSilver: number;
  outstanding: number;
  transactions: ISupplierTransaction[];
}

const SupplierTransactionSchema = new Schema<ISupplierTransaction>({
  date: { type: String, required: true },
  type: { type: String, enum: ['Credit', 'Debit'], required: true },
  metal: { type: String, enum: ['Gold', 'Silver'], required: true },
  purity: { type: String, default: '22K' },
  weight: { type: Number, required: true },
  note: { type: String, default: '' }
});

const SupplierSchema = new Schema<ISupplier>({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  companyNo: { type: String, required: true },
  email: { type: String, default: '' },
  category: { type: String, required: true },
  gstNumber: { type: String, default: '' },
  address: { type: String, required: true },
  note: { type: String, default: '' },
  balanceGold: { type: Number, default: 0 },
  balanceSilver: { type: Number, default: 0 },
  outstanding: { type: Number, default: 0 },
  transactions: { type: [SupplierTransactionSchema], default: [] }
}, { timestamps: true });

export const Supplier = mongoose.model<ISupplier>('Supplier', SupplierSchema);