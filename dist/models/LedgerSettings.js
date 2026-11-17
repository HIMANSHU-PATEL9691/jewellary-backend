import { Schema, model } from 'mongoose';
const ledgerSettingsSchema = new Schema({
    cashOpeningBalance: { type: Number, default: 0 },
    onlineOpeningBalance: { type: Number, default: 0 },
    customCategories: { type: [String], default: [] },
}, { timestamps: true });
ledgerSettingsSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
    },
});
export const LedgerSettings = model('LedgerSettings', ledgerSettingsSchema);
