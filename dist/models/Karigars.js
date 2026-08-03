import { Schema, model } from 'mongoose';
const karigarSchema = new Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    companyName: { type: String },
    email: { type: String },
    category: { type: String },
    specialty: { type: String },
    gstNumber: { type: String },
    address: { type: String },
    note: { type: String },
    pendingWeight: { type: Number, default: 0 },
}, { timestamps: true });
export const Karigars = model('Karigars', karigarSchema);
