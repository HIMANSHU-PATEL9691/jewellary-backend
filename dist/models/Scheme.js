import { Schema, model } from 'mongoose';
const schemeSchema = new Schema({
    schemeNo: { type: String, required: true },
    date: { type: String, required: true },
    customerName: { type: String, required: true },
    customerMobile: { type: String },
    planName: { type: String, required: true },
    monthlyAmount: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    paidMonths: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    maturityDate: { type: String },
    status: { type: String, default: 'Active' },
}, { timestamps: true });
export const Scheme = model('Scheme', schemeSchema);
