const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const machineSchema = new Schema(
    {
        machineName: { type: String, trim: true, minlength: 2, maxlength: 80 },
        machineColor: { type: String },
        machineType: { type: String },
        machineCapacity: { type: String },
        machinePaymentMode: { type: String },
        machineFuelType: { type: String },
        nozzel: { type: Number, min: 1, max: 4 },
        image: { type: [String], default: [] },
        qrImg: { type: String },
        serialNumber: { type: String },
        active: { type: Boolean, default: true },
        status: {
            type: String,
            enum: ['ACTIVE', 'BLOCK', 'DELETE'],
            default: 'ACTIVE',
        },
        userType: {
            type: String,
            enum: ['ADMIN', 'USER'],
            default: 'ADMIN',
        },
    },
    { timestamps: true }
);

machineSchema.plugin(mongoosePaginate);

const machineModel = mongoose.model('machine', machineSchema);
module.exports = machineModel;
