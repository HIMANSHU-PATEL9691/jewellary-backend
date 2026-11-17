import { Schema, model, Document } from 'mongoose';

export interface IBankAccount extends Document {
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode?: string;
  branch?: string;
  openingBalance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bankAccountSchema = new Schema<IBankAccount>(
  {
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    ifscCode: { type: String },
    branch: { type: String },
    openingBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

bankAccountSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

export const BankAccount = model<IBankAccount>('BankAccount', bankAccountSchema);
