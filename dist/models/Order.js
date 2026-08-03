import { Schema, model } from 'mongoose';
const orderSchema = new Schema({
    orderNo: { type: String, required: true },
    date: { type: String, required: true },
    customerName: { type: String, required: true },
    customerMobile: { type: String },
    customerAddress: { type: String },
    itemDescription: { type: String, required: true },
    metal: { type: String, required: true, default: 'Gold' },
    purity: { type: String },
    fixedPrice: { type: Number, default: 0 },
    advancePaid: { type: Number, default: 0 },
    dueDate: { type: String },
    status: { type: String, default: 'Pending' },
    note: { type: String },
    customerSignature: { type: String },
    authorizedSignatory: { type: String },
}, { timestamps: true });
// Make sure the _id maps to id for the frontend
orderSchema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
    }
});
export const Order = model('Order', orderSchema);
