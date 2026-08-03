import { Schema, model } from 'mongoose';
const expensesSchema = new Schema({
    description: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: String, required: true },
    paymentMode: { type: String },
    notes: { type: String },
}, { timestamps: true });
export const Expenses = model('Expenses', expensesSchema);
