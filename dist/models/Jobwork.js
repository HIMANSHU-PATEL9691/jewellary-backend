import { Schema, model } from 'mongoose';
const jobworkSchema = new Schema({
    jobNo: { type: String, required: true },
    date: { type: String, required: true },
    karigarId: { type: String, required: true },
    karigarName: { type: String, required: true },
    itemDescription: { type: String, required: true },
    metal: { type: String, default: 'Gold' },
    purity: { type: String, default: '22K' },
    issuedWeight: { type: Number, default: 0 },
    receivedWeight: { type: Number, default: 0 },
    wastage: { type: Number, default: 0 },
    makingCharge: { type: Number, default: 0 },
    dueDate: { type: String },
    status: {
        type: String,
        enum: ['Issued', 'In Progress', 'Received', 'Settled'],
        default: 'Issued'
    },
    note: { type: String },
}, { timestamps: true });
export const Jobwork = model('Jobwork', jobworkSchema);
