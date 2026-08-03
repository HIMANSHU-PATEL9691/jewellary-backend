import { Schema, model } from 'mongoose';
const salesSchema = new Schema({
    customerId: { type: String, required: true },
    items: [
        {
            itemName: { type: String, required: true },
            quantity: { type: Number, required: true },
            rate: { type: Number, required: true },
            amount: { type: Number, required: true },
        },
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'partial'], default: 'pending' },
    notes: { type: String },
}, { timestamps: true });
export const Sales = model('Sales', salesSchema);
