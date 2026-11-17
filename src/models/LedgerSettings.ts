import { Schema, model, Document } from 'mongoose';

export interface ILedgerSettings extends Document {
  cashOpeningBalance: number;
  onlineOpeningBalance: number;
  customCategories: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ledgerSettingsSchema = new Schema<ILedgerSettings>(
  {
    cashOpeningBalance: { type: Number, default: 0 },
    onlineOpeningBalance: { type: Number, default: 0 },
    customCategories: { type: [String], default: [] },
  },
  { timestamps: true }
);

ledgerSettingsSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret.__v;
    return ret;
  },
});

export const LedgerSettings = model<ILedgerSettings>('LedgerSettings', ledgerSettingsSchema);
