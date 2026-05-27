import { Schema, model } from 'mongoose';

interface IInventory {
  name: string;
  category: string;
  subcategory?: string;
  note?: string;
  huid?: string;
  purity: string;
  grossWeight: number;
  netWeight: number;
  stoneWeight: number;
  wastagePct: number;
  makingCharge: number;
  gstPct: number;
  ratePerGram: number;
  stock: number;
  barcode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const inventorySchema = new Schema<IInventory>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true, default: 'Gold' },
    subcategory: { type: String },
    note: { type: String },
    huid: { type: String },
    purity: { type: String, default: '22K' },
    grossWeight: { type: Number, required: true, default: 0 },
    netWeight: { type: Number, required: true, default: 0 },
    stoneWeight: { type: Number, required: true, default: 0 },
    wastagePct: { type: Number, required: true, default: 8 },
    makingCharge: { type: Number, required: true, default: 500 },
    gstPct: { type: Number, required: true, default: 3 },
    ratePerGram: { type: Number, required: true, default: 7200 },
    stock: { type: Number, required: true, default: 1 },
    barcode: { type: String },
  },
  { timestamps: true }
);

export const Inventory = model<IInventory>('Inventory', inventorySchema);
