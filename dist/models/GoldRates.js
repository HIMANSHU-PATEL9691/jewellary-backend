import { Schema, model } from 'mongoose';
const goldRatesSchema = new Schema({
    gold24: { type: Number, required: true, default: 0 },
    gold22: { type: Number, required: true, default: 0 },
    gold20: { type: Number, required: true, default: 0 },
    gold18: { type: Number, required: true, default: 0 },
    silver: { type: Number, required: true, default: 0 },
}, { timestamps: true });
export const GoldRates = model('GoldRates', goldRatesSchema);
