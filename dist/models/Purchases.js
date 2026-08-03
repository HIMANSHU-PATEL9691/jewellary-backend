import { Schema, model } from 'mongoose';
const purchasesSchema = new Schema({
    type: { type: String, enum: ['GST', 'NON-GST'], default: 'NON-GST' },
    billNo: { type: String, required: true },
    date: { type: String, required: true },
    supplierId: { type: String },
    supplierName: { type: String, required: true },
    metal: { type: String, required: true, default: 'Gold' },
    purity: { type: String },
    weight: { type: Number, required: true },
    ratePerGram: { type: Number, required: true },
    makingCharge: { type: Number, default: 0 },
    gstPct: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMode: { type: String, default: 'Cash' },
    note: { type: String },
}, { timestamps: true });
export const Purchases = model('Purchases', purchasesSchema);
