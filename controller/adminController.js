const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const commonFunction = require('../helper/commonFunction');
const { ok, fail } = require('../helper/apiResponse');
const config = require('../config');

module.exports = {
    adminResendOtp: async (req, res) => {
        try {
            const admin = await userModel.findOne({
                $and: [
                    { $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }] },
                    { status: { $ne: 'DELETE' } },
                    { userType: 'ADMIN' },
                ],
            });
            if (!admin) return fail(res, 404, 'Admin not found.');

            const otp = commonFunction.otp();
            const otpExpireTime = Date.now() + 5 * 60 * 1000;
            await commonFunction.sendMail(admin.email, 'OTP for verify', `Your OTP: ${otp}`);
            const updated = await userModel.findByIdAndUpdate(
                admin._id,
                { otpVerify: false, otp, otpExpireTime },
                { new: true }
            );
            return ok(res, 'OTP sent successfully.', { admin: updated, otp });
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    adminOtpVerify: async (req, res) => {
        try {
            const admin = await userModel.findOne({
                email: req.body.email,
                status: { $ne: 'DELETE' },
                userType: 'ADMIN',
            });
            if (!admin) return fail(res, 404, 'Admin not found.');
            if (admin.otpVerify) return fail(res, 409, 'Admin already verified.');
            if (String(req.body.otp) !== String(admin.otp)) return fail(res, 400, 'Wrong OTP.');
            if (admin.otpExpireTime < Date.now()) return fail(res, 410, 'OTP is expired.');

            const verified = await userModel.findByIdAndUpdate(
                admin._id,
                { otpVerify: true },
                { new: true }
            );
            return ok(res, 'Admin verified successfully.', verified);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    adminForgotPassword: async (req, res) => {
        try {
            const admin = await userModel.findOne({
                $and: [
                    { $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }] },
                    { status: { $ne: 'DELETE' } },
                    { userType: 'ADMIN' },
                ],
            });
            if (!admin) return fail(res, 404, 'Admin not found.');

            const otp = commonFunction.otp();
            const otpExpireTime = Date.now() + 5 * 60 * 1000;
            await commonFunction.sendMail(admin.email, 'OTP for forgot password', `Your OTP: ${otp}`);
            const updated = await userModel.findByIdAndUpdate(
                admin._id,
                { otp, otpExpireTime, otpVerify: false },
                { new: true }
            );
            return ok(res, 'OTP sent successfully.', { admin: updated, otp });
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    adminResetPassword: async (req, res) => {
        try {
            const admin = await userModel.findOne({
                email: req.body.email,
                status: { $ne: 'DELETE' },
                userType: 'ADMIN',
            });
            if (!admin) return fail(res, 404, 'Admin not found.');
            if (String(req.body.otp) !== String(admin.otp)) return fail(res, 400, 'Wrong OTP.');
            if (admin.otpExpireTime < Date.now()) return fail(res, 410, 'OTP is expired.');
            if (req.body.newPassword !== req.body.confirmNewPassword) {
                return fail(res, 400, 'New password and confirm password do not match.');
            }

            const updated = await userModel.findByIdAndUpdate(
                admin._id,
                {
                    password: await bcrypt.hash(req.body.newPassword, 10),
                    otpVerify: true,
                },
                { new: true }
            );
            return ok(res, 'Password reset successfully.', updated);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    adminLogin: async (req, res) => {
        try {
            const admin = await userModel.findOne({
                $and: [
                    { $or: [{ email: req.body.email }, { mobileNumber: req.body.email }] },
                    { status: { $ne: 'DELETE' } },
                    { userType: 'ADMIN' },
                ],
            }).select('+password');
            if (!admin) return fail(res, 404, 'Admin not found.');
            if (!admin.otpVerify) return fail(res, 401, 'Admin is not verified.');

            const passCheck = await bcrypt.compare(req.body.password, admin.password);
            if (!passCheck) return fail(res, 401, 'Incorrect password.');

            const token = jwt.sign(
                { adminId: admin._id, email: admin.email },
                config.jwtSecret,
                { expiresIn: config.jwtExpiresIn }
            );
            const safeAdmin = admin.toJSON();
            delete safeAdmin.password;
            return ok(res, 'Admin login successful.', { admin: safeAdmin, token });
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    adminViewProfile: async (req, res) => {
        try {
            const admin = await userModel.findOne({
                _id: req.adminId,
                status: 'ACTIVE',
                userType: 'ADMIN',
            });
            if (!admin) return fail(res, 404, 'Admin not found.');
            return ok(res, 'Admin profile fetched successfully.', admin);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    adminEditProfile: async (req, res) => {
        try {
            const admin = await userModel.findOne({
                _id: req.adminId,
                status: 'ACTIVE',
                userType: 'ADMIN',
            });
            if (!admin) return fail(res, 404, 'Admin not found.');

            const allowed = ['firstName', 'lastName', 'email', 'mobileNumber', 'countryCode'];
            const updates = {};
            allowed.forEach((field) => {
                if (req.body[field] !== undefined) updates[field] = req.body[field];
            });
            const updated = await userModel.findByIdAndUpdate(admin._id, { $set: updates }, { new: true });
            return ok(res, 'Profile updated successfully.', updated);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    adminChangePassword: async (req, res) => {
        try {
            const admin = await userModel.findOne({
                _id: req.adminId,
                status: { $ne: 'DELETE' },
                userType: 'ADMIN',
            }).select('+password');
            if (!admin) return fail(res, 404, 'Admin not found.');

            const passCheck = await bcrypt.compare(req.body.password, admin.password);
            if (!passCheck) return fail(res, 401, 'Incorrect password.');
            if (req.body.newPassword !== req.body.confirmNewPassword) {
                return fail(res, 400, 'New password and confirm password do not match.');
            }

            await userModel.findByIdAndUpdate(admin._id, {
                password: await bcrypt.hash(req.body.newPassword, 10),
            });
            return ok(res, 'Password changed successfully.');
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },
};
