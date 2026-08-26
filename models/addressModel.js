const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        street: { type: String },
        area: { type: String },
        city: { type: String },
        state: { type: String },
        country: { type: String },
        pin: { type: String },
        status: {
            type: String,
            enum: ['ACTIVE', 'BLOCK', 'DELETE'],
            default: 'ACTIVE',
        },
    },
    { timestamps: true }
);

const addressModel = mongoose.model('address', addressSchema);
module.exports = addressModel;
