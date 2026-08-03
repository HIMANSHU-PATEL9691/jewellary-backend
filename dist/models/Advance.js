import { Schema, model } from 'mongoose';
const advanceSchema = new Schema({
    date: { type: String, required: true },
    customerId: { type: String },
    customerName: { type: String, required: true },
    customerMobile: { type: String, required: true },
    metal: { type: String, required: true, enum: ['Gold', 'Silver'] },
    purity: { type: String, required: true },
    ratePerGram: { type: Number, required: true },
    amount: { type: Number, required: true },
    weightLocked: { type: Number, required: true },
    note: { type: String },
    status: { type: String, default: 'Active', enum: ['Active', 'Redeemed', 'Cancelled'] },
}, { timestamps: true, collection: 'advances' });
export const Advance = model('Advance', advanceSchema);
