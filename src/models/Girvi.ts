import { Schema, model, Document } from 'mongoose';

export interface IGirvi extends Document {
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
  forwardedTo?: string;
  forwardedShopName?: string;
  forwardedShopGstNo?: string;
  forwardedShopAddress?: string;
  forwardedAmount?: number;
  forwardedInterestPct?: number;
  forwardedImageUrl?: string;
  customerSignature?: string;
  authorizedSignatory?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const girviSchema = new Schema<IGirvi>(
  {
    date: { type: String, required: true },
    loanNo: { type: String, required: true },
    customerName: { type: String, required: true },
    customerMobile: { type: String },
    customerMobile2: { type: String },
    customerAddress: { type: String },
    itemType: { type: String, required: true },
    itemCategory: { type: String },
    itemDescription: { type: String, required: true },
    grossWeight: { type: Number, required: true },
    netWeight: { type: Number, required: true },
    purity: { type: String, required: true },
    marketValue: { type: Number, required: true },
    loanAmount: { type: Number, required: true },
    interestPct: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    documentType: { type: String },
    documentNumber: { type: String },
    imageUrl: { type: String },
    dueDate: { type: String },
    status: { type: String, required: true, default: 'Active' },
    forwardedTo: { type: String },
    forwardedShopName: { type: String },
    forwardedShopGstNo: { type: String },
    forwardedShopAddress: { type: String },
    forwardedAmount: { type: Number },
    forwardedInterestPct: { type: Number },
    forwardedImageUrl: { type: String },
    customerSignature: { type: String },
    authorizedSignatory: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

girviSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Girvi = model<IGirvi>('Girvi', girviSchema);