import { Schema, model } from 'mongoose';

interface IRepair {
  ticketNo: string;
  date: Date;
  customerName: string;
  customerMobile?: string;
  customerMobile2?: string;
  customerAddress?: string;
  category?: string;
  design?: string;
  repairType?: string;
  itemDescription?: string;
  itemWeight?: number;
  problem?: string;
  estimate?: number;
  advance?: number;
  expectedDate?: Date;
  deliveryDate?: Date;
  karigarId?: string;
  status: 'Received' | 'In Progress' | 'Ready' | 'Delivered';
  note?: string;
  customerSignature?: string;
  authorizedSignatory?: string;
  createdAt: Date;
  updatedAt: Date;
}

const repairSchema = new Schema<IRepair>(
  {
    ticketNo: { type: String, required: true },
    date: { type: Date, required: true },
    customerName: { type: String, required: true },
    customerMobile: { type: String },
    customerMobile2: { type: String },
    customerAddress: { type: String },
    category: { type: String },
    design: { type: String },
    repairType: { type: String },
    itemDescription: { type: String },
    itemWeight: { type: Number },
    problem: { type: String },
    estimate: { type: Number, default: 0 },
    advance: { type: Number, default: 0 },
    expectedDate: { type: Date },
    deliveryDate: { type: Date },
    karigarId: { type: String },
    status: { type: String, enum: ['Received', 'In Progress', 'Ready', 'Delivered'], default: 'Received' },
    note: { type: String },
    customerSignature: { type: String },
    authorizedSignatory: { type: String },
  },
  { timestamps: true }
);

export const Repair = model<IRepair>('Repair', repairSchema);
