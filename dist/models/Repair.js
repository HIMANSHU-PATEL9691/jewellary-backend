import { Schema, model } from 'mongoose';
const repairSchema = new Schema({
    ticketNo: { type: String, required: true },
    date: { type: Date, required: true },
    customerName: { type: String, required: true },
    customerMobile: { type: String },
    customerMobile2: { type: String },
    customerAddress: { type: String },
    category: { type: String },
    design: { type: String },
    repairType: { type: String },
    itemDescription: { type: String },
    itemWeight: { type: Number },
    problem: { type: String },
    advance: { type: Number, default: 0 },
    expectedDate: { type: Date },
    deliveryDate: { type: Date },
    karigarId: { type: String },
    status: { type: String, enum: ['Received', 'In Progress', 'Ready', 'Delivered'], default: 'Received' },
    note: { type: String },
    customerSignature: { type: String },
    authorizedSignatory: { type: String },
}, { timestamps: true });
export const Repair = model('Repair', repairSchema);
