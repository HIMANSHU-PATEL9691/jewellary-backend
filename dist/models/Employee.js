import { Schema, model } from 'mongoose';
const employeeSchema = new Schema({
    name: { type: String, required: true },
    phone: { type: String },
    role: { type: String, required: true },
    salary: { type: Number, required: true, default: 0 },
    joinDate: { type: String, required: true },
    status: { type: String, default: 'Active' },
    totalPaid: { type: Number, default: 0 },
    notes: { type: String },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
employeeSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
export const Employee = model('Employee', employeeSchema);
