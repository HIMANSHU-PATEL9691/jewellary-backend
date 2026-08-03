import mongoose, { Schema } from 'mongoose';
const SupplierTransactionSchema = new Schema({
    date: { type: String, required: true },
    type: { type: String, enum: ['Credit', 'Debit'], required: true },
    metal: { type: String, enum: ['Gold', 'Silver'], required: true },
    purity: { type: String, default: '22K' },
    weight: { type: Number, required: true },
    note: { type: String, default: '' }
});
const SupplierSchema = new Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    companyNo: { type: String, required: true },
    email: { type: String, default: '' },
    category: { type: String, required: true },
    gstNumber: { type: String, default: '' },
    address: { type: String, required: true },
    note: { type: String, default: '' },
    balanceGold: { type: Number, default: 0 },
    balanceSilver: { type: Number, default: 0 },
    outstanding: { type: Number, default: 0 },
    transactions: { type: [SupplierTransactionSchema], default: [] }
}, { timestamps: true });
export const Supplier = mongoose.model('Supplier', SupplierSchema);
