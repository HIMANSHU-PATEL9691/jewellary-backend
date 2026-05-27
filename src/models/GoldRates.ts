import { Schema, model } from 'mongoose';

interface IGoldRates {
  gold24: number;
  gold22: number;
  gold18: number;
  silver: number;
  createdAt: Date;
  updatedAt: Date;
}

const goldRatesSchema = new Schema<IGoldRates>(
  {
    gold24: { type: Number, required: true, default: 0 },
    gold22: { type: Number, required: true, default: 0 },
    gold18: { type: Number, required: true, default: 0 },
    silver: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const GoldRates = model<IGoldRates>('GoldRates', goldRatesSchema);
