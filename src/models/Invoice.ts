import { Schema, model } from 'mongoose';

interface IInvoiceItem {
  productId: string;
  name: string;
  purity: string;
  netWeight: number;
  ratePerGram: number;
  makingCharge: number;
  stoneCharge: number;
  gstPct: number;
  qty: number;
}

interface IInvoice {
  number: string;
  type: 'GST' | 'NON-GST';
  customerId?: string;
  customerName: string;
  customerMobile?: string;
  items: IInvoiceItem[];
  discount: number;
  oldGoldAmount: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'EMI';
  subtotal: number;
  gstAmount: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  purity: { type: String, required: true },
  netWeight: { type: Number, required: true },
  ratePerGram: { type: Number, required: true },
  makingCharge: { type: Number, required: true },
  stoneCharge: { type: Number, required: true },
  gstPct: { type: Number, required: true },
  qty: { type: Number, required: true },
});

const invoiceSchema = new Schema<IInvoice>(
  {
    number: { type: String, required: true, unique: true },
    type: { type: String, enum: ['GST', 'NON-GST'], required: true },
    customerId: { type: String },
    customerName: { type: String, required: true },
    customerMobile: { type: String },
    items: { type: [invoiceItemSchema], required: true },
    discount: { type: Number, required: true, default: 0 },
    oldGoldAmount: { type: Number, required: true, default: 0 },
    paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card', 'EMI'], required: true },
    subtotal: { type: Number, required: true },
    gstAmount: { type: Number, required: true },
    total: { type: Number, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

export const Invoice = model<IInvoice>('Invoice', invoiceSchema);
