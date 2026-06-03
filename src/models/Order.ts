import { Schema, model, Document } from 'mongoose';

export interface IOrder extends Document {
  orderNo: string;
  date: string;
  customerName: string;
  customerMobile?: string;
  customerAddress?: string;
  itemDescription: string;
  metal: string;
  purity?: string;
  estimatedWeight?: number;
  estimatedPrice?: number;
  advancePaid?: number;
  dueDate?: string;
  status: string;
  note?: string;
  customerSignature?: string;
  authorizedSignatory?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderNo: { type: String, required: true },
    date: { type: String, required: true },
    customerName: { type: String, required: true },
    customerMobile: { type: String },
    customerAddress: { type: String },
    itemDescription: { type: String, required: true },
    metal: { type: String, required: true, default: 'Gold' },
    purity: { type: String },
    estimatedWeight: { type: Number, default: 0 },
    estimatedPrice: { type: Number, default: 0 },
    advancePaid: { type: Number, default: 0 },
    dueDate: { type: String },
    status: { type: String, default: 'Pending' },
    note: { type: String },
    customerSignature: { type: String },
    authorizedSignatory: { type: String },
  },
  { timestamps: true }
);

// Make sure the _id maps to id for the frontend
orderSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Order = model<IOrder>('Order', orderSchema);