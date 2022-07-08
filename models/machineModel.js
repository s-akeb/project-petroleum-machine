const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate')
const mongooseSerial = require("mongoose-serial")    // for serial number
const machineSchema = new Schema({
    machineName: {
        type: String
    },
    machineColor: {
        type: String
    },
    machineType: {            //like Digital
        type: String
    },
    machineCapacity: {
        type: String
    },
    machinePaymentMode: {
        type: String
    },
    machineFuelType: {
        type: String
    },
    nozzel: {
        type: Number,
    },
    image: {
        type:[String]
    },
    qrImg: {
        type: String
    },
    serialNumber: {
        type: String
    },
    active: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },
    userType: {
        type: String,
        enum: ["ADMIN", "USER"],
        default: "ADMIN"
    }
},
    { timestamps: true }
);
machineSchema.plugin(mongoosePaginate)
const machineModel = mongoose.model('admin', machineSchema);
module.exports = machineModel
