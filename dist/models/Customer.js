import { Schema, model } from 'mongoose';
const customerSchema = new Schema({
    name: { type: String, required: true },
    phone: { type: String },
    phone2: { type: String },
    address: { type: String, required: true },
    gstNumber: { type: String },
    pan: { type: String },
    notes: { type: String },
}, { timestamps: true });
export const Customer = model('Customer', customerSchema);
