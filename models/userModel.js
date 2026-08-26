const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const mongoosePaginate = require('mongoose-paginate-v2');
const config = require('../config');

const userSchema = new Schema(
    {
        firstName: { type: String },
        lastName: { type: String },
        email: { type: String, lowercase: true, trim: true, match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'] },
        mobileNumber: { type: String, trim: true, match: [/^[6-9]\d{9}$/, 'Invalid mobile number'] },
        countryCode: { type: String },
        password: { type: String, select: false },
        profilePic: { type: String },
        address: { type: String },
        dateOfBirth: { type: String },
        otp: { type: String },
        otpExpireTime: { type: Number, default: null },
        otpVerify: { type: Boolean, default: false },
        addressId: { type: Schema.Types.ObjectId, ref: 'address' },
        status: {
            type: String,
            enum: ['ACTIVE', 'BLOCK', 'DELETE'],
            default: 'ACTIVE',
        },
        userType: {
            type: String,
            enum: ['ADMIN', 'USER'],
            default: 'USER',
        },
    },
    { timestamps: true }
);

userSchema.plugin(mongoosePaginate);

userSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
    },
});

const userModel = mongoose.model('user', userSchema);

userModel.seedDefaultAdmin = async () => {
    try {
        const email = String(config.admin.email).toLowerCase().trim();
        const matchingAdmin = await userModel.findOne({
            email,
            status: { $ne: 'DELETE' },
            userType: 'ADMIN',
        });
        if (matchingAdmin) {
            if (matchingAdmin.mobileNumber !== config.admin.mobileNumber) {
                matchingAdmin.mobileNumber = config.admin.mobileNumber;
                await matchingAdmin.save();
                console.log(`Default admin mobile updated to ${config.admin.mobileNumber}.`);
            } else {
                console.log('Default admin already exists.');
            }
            return;
        }

        await userModel.deleteMany({ userType: 'ADMIN' });
        await userModel.create({
            firstName: config.admin.firstName,
            lastName: config.admin.lastName,
            email,
            mobileNumber: config.admin.mobileNumber,
            countryCode: config.admin.countryCode,
            password: await bcrypt.hash(config.admin.password, 10),
            userType: 'ADMIN',
            otpVerify: true,
        });
        console.log(`Default admin created: ${email}`);
    } catch (error) {
        console.error('Default admin seed error:', error.message);
    }
};

module.exports = userModel;
