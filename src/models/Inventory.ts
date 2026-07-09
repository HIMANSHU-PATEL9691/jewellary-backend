import { Schema, model, Document } from 'mongoose';

export interface IInventory extends Document {
  name: string;
  category: string;
  subcategory?: string;
  note?: string;
  huid?: string;
  hsnCode?: string;
  purity?: string;
  grossWeight: number;
  netWeight: number;
  stoneWeight: number;
  makingCharge: number;
  makingChargePct?: number;
  gstPct: number;
  ratePerGram: number;
  stock: number;
  barcode: string;
  imageUrl?: string;
  imageUrls?: string[];
  type?: 'GST' | 'NON-GST';
}

const InventorySchema = new Schema<IInventory>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: String,
  note: String,
  huid: String,
  hsnCode: { type: String, default: '71131910' },
  purity: String,
  grossWeight: Number,
  netWeight: { type: Number, required: true },
  stoneWeight: Number,
  makingCharge: Number,
  makingChargePct: Number,
  gstPct: Number,
  ratePerGram: Number,
  stock: { type: Number, default: 1 },
  barcode: { type: String, unique: true, required: true },
  imageUrl: String,
  imageUrls: [String],
  type: { type: String, enum: ['GST', 'NON-GST'], default: 'NON-GST' },
}, { timestamps: true, collection: 'inventory' });

export const Inventory = model<IInventory>('Inventory', InventorySchema);