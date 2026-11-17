import { Schema, model } from 'mongoose';
const bankAccountSchema = new Schema({
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    ifscCode: { type: String },
    branch: { type: String },
    openingBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });
bankAccountSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
    },
});
export const BankAccount = model('BankAccount', bankAccountSchema);
