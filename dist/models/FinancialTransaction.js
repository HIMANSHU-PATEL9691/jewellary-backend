import { Schema, model } from 'mongoose';
const financialTransactionSchema = new Schema({
    transactionId: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ['IN', 'OUT', 'TRANSFER'] },
    method: { type: String, required: true, enum: ['Cash', 'UPI', 'Online', 'Bank', 'Cheque'] },
    category: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: String, required: true },
    personName: { type: String, required: true },
    personType: { type: String, enum: ['Customer', 'Supplier', 'Employee', 'Bank', 'Other'], default: 'Other' },
    personId: { type: String },
    billNumber: { type: String },
    bankAccountId: { type: String },
    bankAccountName: { type: String },
    targetBankAccountId: { type: String },
    targetBankAccountName: { type: String },
    transferType: { type: String, enum: ['Cash to Bank', 'Bank to Cash', 'Bank to Bank', 'Cash to Online'] },
    isInternalTransfer: { type: Boolean, default: false },
    referenceNo: { type: String },
    description: { type: String },
    attachmentUrl: { type: String },
    sourceModule: {
        type: String,
        default: 'Manual',
        enum: ['Manual', 'Sales', 'Purchase', 'Expense', 'Order', 'Repair', 'Girvi', 'Advance'],
    },
    sourceId: { type: String },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
financialTransactionSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
    },
});
export const FinancialTransaction = model('FinancialTransaction', financialTransactionSchema);
