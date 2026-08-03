import { Schema, model } from 'mongoose';
const invoiceItemSchema = new Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    purity: { type: String },
    hsnCode: { type: String },
    grossWeight: { type: Number },
    netWeight: { type: Number, required: true },
    stoneWeight: { type: Number },
    ratePerGram: { type: Number, required: true },
    makingCharge: { type: Number, required: true },
    stoneCharge: { type: Number, required: true },
    gstPct: { type: Number, required: true },
    qty: { type: Number, required: true },
});
const invoicePaymentSchema = new Schema({
    date: { type: Date, required: true, default: Date.now },
    amount: { type: Number, required: true },
    mode: { type: String, required: true },
    note: { type: String },
});
const invoiceSchema = new Schema({
    number: { type: String, required: true, unique: true },
    type: { type: String, enum: ['GST', 'NON-GST'], required: true },
    customerId: { type: String },
    customerName: { type: String, required: true },
    customerMobile: { type: String },
    items: { type: [invoiceItemSchema], required: true },
    discount: { type: Number, required: true, default: 0 },
    oldGoldAmount: { type: Number, required: true, default: 0 },
    paymentMode: { type: String, enum: ['Cash', 'UPI', 'Card', 'EMI'], required: true },
    subtotal: { type: Number, required: true },
    gstAmount: { type: Number, required: true },
    total: { type: Number, required: true },
    amountPaid: { type: Number },
    balanceDue: { type: Number },
    payments: { type: [invoicePaymentSchema], default: [] },
    customerAddress: { type: String },
    customerSignature: { type: String },
    authorizedSignatory: { type: String },
    createdAt: { type: Date, required: true, default: Date.now },
}, { timestamps: true });
export const Invoice = model('Invoice', invoiceSchema);
