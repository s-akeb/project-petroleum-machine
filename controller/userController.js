const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ifsc = require('ifsc');
const userModel = require('../models/userModel');
const addressModel = require('../models/addressModel');
const machineModel = require('../models/machineModel');
const commonFunction = require('../helper/commonFunction');
const { buildListQuery } = require('../helper/queryHelper');
const { ok, fail } = require('../helper/apiResponse');
const config = require('../config');

const ADDRESS_FIELDS = ['street', 'area', 'city', 'state', 'country', 'pin'];

const pickAddress = (body) =>
    ADDRESS_FIELDS.reduce((acc, field) => {
        if (body[field] !== undefined) acc[field] = body[field];
        return acc;
    }, {});

module.exports = {
    signUp: async (req, res) => {
        try {
            const existing = await userModel.findOne({
                $and: [
                    { $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }] },
                    { status: { $ne: 'DELETE' } },
                    { userType: 'USER' },
                ],
            });
            if (existing) {
                if (existing.email === req.body.email) {
                    return fail(res, 409, 'Email already exists.');
                }
                return fail(res, 409, 'Mobile number already exists.');
            }
            if (req.body.password !== req.body.confirmPassword) {
                return fail(res, 400, 'Password and confirm password do not match.');
            }
            if (!req.file) {
                return fail(res, 400, 'Profile image is required.');
            }

            const otp = commonFunction.otp();
            const profilePic = await commonFunction.uploadImage(req.file.path);
            await commonFunction.sendMail(req.body.email, 'Signup OTP', `Your OTP: ${otp}`);

            const userSave = await userModel.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                mobileNumber: req.body.mobileNumber,
                countryCode: req.body.countryCode,
                password: await bcrypt.hash(req.body.password, 10),
                profilePic,
                address: req.body.address,
                dateOfBirth: req.body.dateOfBirth,
                otp,
                otpExpireTime: Date.now() + 5 * 60 * 1000,
                otpVerify: false,
            });

            const saveAddress = await addressModel.create({
                userId: userSave._id,
                ...pickAddress(req.body),
            });
            const updateUser = await userModel.findByIdAndUpdate(
                userSave._id,
                { addressId: saveAddress._id },
                { new: true }
            ).populate('addressId');

            return ok(res, 'Signup successful. Please verify OTP.', { user: updateUser, otp });
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    otpVerify: async (req, res) => {
        try {
            const user = await userModel.findOne({
                email: req.body.email,
                status: { $ne: 'DELETE' },
                userType: 'USER',
            });
            if (!user) return fail(res, 404, 'User not found.');
            if (user.otpVerify) return fail(res, 409, 'User already verified.');
            if (String(req.body.otp) !== String(user.otp)) return fail(res, 400, 'Wrong OTP.');
            if (user.otpExpireTime < Date.now()) return fail(res, 410, 'OTP is expired.');

            const verified = await userModel.findByIdAndUpdate(
                user._id,
                { otpVerify: true },
                { new: true }
            );
            return ok(res, 'User verified successfully.', verified);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    resendOtp: async (req, res) => {
        try {
            const user = await userModel.findOne({
                email: req.body.email,
                status: { $ne: 'DELETE' },
            });
            if (!user) return fail(res, 404, 'User not found.');

            const otp = commonFunction.otp();
            const otpExpireTime = Date.now() + 5 * 60 * 1000;
            await commonFunction.sendMail(user.email, 'OTP for verify', `Your OTP: ${otp}`);
            const updated = await userModel.findByIdAndUpdate(
                user._id,
                { otpVerify: false, otp, otpExpireTime },
                { new: true }
            );
            return ok(res, 'OTP sent successfully.', { user: updated, otp });
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    forgotPassword: async (req, res) => {
        try {
            const user = await userModel.findOne({
                $and: [
                    { $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }] },
                    { status: { $ne: 'DELETE' } },
                    { userType: 'USER' },
                ],
            });
            if (!user) return fail(res, 404, 'User not found.');

            const otp = commonFunction.otp();
            const otpExpireTime = Date.now() + 5 * 60 * 1000;
            await commonFunction.sendMail(user.email, 'OTP for forgot password', `Your OTP: ${otp}`);
            const updated = await userModel.findByIdAndUpdate(
                user._id,
                { otp, otpExpireTime, otpVerify: false },
                { new: true }
            );
            return ok(res, 'OTP sent successfully.', { user: updated, otp });
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    resetPassword: async (req, res) => {
        try {
            const user = await userModel.findOne({
                email: req.body.email,
                status: { $ne: 'DELETE' },
                userType: 'USER',
            });
            if (!user) return fail(res, 404, 'User not found.');
            if (String(req.body.otp) !== String(user.otp)) return fail(res, 400, 'Wrong OTP.');
            if (user.otpExpireTime < Date.now()) return fail(res, 410, 'OTP is expired.');
            if (req.body.newPassword !== req.body.confirmNewPassword) {
                return fail(res, 400, 'New password and confirm password do not match.');
            }

            const updated = await userModel.findByIdAndUpdate(
                user._id,
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

    login: async (req, res) => {
        try {
            const user = await userModel.findOne({
                email: req.body.email,
                status: { $ne: 'DELETE' },
            }).select('+password');
            if (!user) return fail(res, 404, 'User not found.');
            if (!user.otpVerify) return fail(res, 401, 'User is not verified.');

            const passCheck = await bcrypt.compare(req.body.password, user.password);
            if (!passCheck) return fail(res, 401, 'Incorrect password.');

            const token = jwt.sign(
                { userId: user._id, email: user.email },
                config.jwtSecret,
                { expiresIn: config.jwtExpiresIn }
            );
            const safeUser = user.toJSON();
            delete safeUser.password;
            return ok(res, 'Login successful.', { user: safeUser, token });
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    viewProfile: async (req, res) => {
        try {
            const user = await userModel
                .findOne({ _id: req.userId, status: 'ACTIVE', userType: 'USER' })
                .populate('addressId');
            if (!user) return fail(res, 404, 'User not found.');
            return ok(res, 'Profile fetched successfully.', user);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    editProfile: async (req, res) => {
        try {
            const user = await userModel.findOne({
                _id: req.userId,
                status: 'ACTIVE',
                userType: 'USER',
            });
            if (!user) return fail(res, 404, 'User not found.');

            const allowed = ['firstName', 'lastName', 'countryCode', 'mobileNumber', 'address', 'dateOfBirth'];
            const updates = {};
            allowed.forEach((field) => {
                if (req.body[field] !== undefined) updates[field] = req.body[field];
            });
            if (req.file) {
                updates.profilePic = await commonFunction.uploadImage(req.file.path);
            }

            const updatedUser = await userModel.findByIdAndUpdate(user._id, { $set: updates }, { new: true });
            const addressUpdates = pickAddress(req.body);
            if (user.addressId && Object.keys(addressUpdates).length) {
                await addressModel.findByIdAndUpdate(user.addressId, { $set: addressUpdates });
            }
            const populated = await userModel.findById(updatedUser._id).populate('addressId');
            return ok(res, 'Profile updated successfully.', populated);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    getProfile: async (req, res) => {
        try {
            const user = await userModel
                .findOne({ _id: req.userId, status: 'ACTIVE', userType: 'USER' })
                .populate('addressId');
            if (!user) return fail(res, 404, 'User not found.');
            return ok(res, 'Profile fetched successfully.', user);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    changePassword: async (req, res) => {
        try {
            const user = await userModel.findOne({
                _id: req.userId,
                status: { $ne: 'DELETE' },
                userType: 'USER',
            }).select('+password');
            if (!user) return fail(res, 404, 'User not found.');

            const passCheck = await bcrypt.compare(req.body.password, user.password);
            if (!passCheck) return fail(res, 401, 'Incorrect password.');
            if (req.body.newPassword !== req.body.confirmNewPassword) {
                return fail(res, 400, 'New password and confirm password do not match.');
            }

            await userModel.findByIdAndUpdate(user._id, {
                password: await bcrypt.hash(req.body.newPassword, 10),
            });
            return ok(res, 'Password changed successfully.');
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    listUser: async (req, res) => {
        try {
            const { query, options } = buildListQuery(
                { status: { $ne: 'DELETE' }, userType: 'USER' },
                req,
                ['firstName', 'lastName', 'email']
            );
            options.populate = 'addressId';
            const userData = await userModel.paginate(query, options);
            if (!userData.docs.length) {
                return fail(res, 404, 'User data not found.', userData);
            }
            return ok(res, 'User data found.', userData);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    userMachineList: async (req, res) => {
        try {
            const { query, options } = buildListQuery(
                { status: { $ne: 'DELETE' } },
                req,
                ['machineName']
            );
            if (req.query.nozzel) {
                query.nozzel = Number(req.query.nozzel);
            }
            const machineData = await machineModel.paginate(query, options);
            if (!machineData.docs.length) {
                return fail(res, 404, 'Machine data not found.');
            }
            return ok(res, 'Machine list found successfully.', machineData);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    getIfsc: async (req, res) => {
        try {
            const code = String(req.query.ifscCode || '').toUpperCase();
            const isValid = ifsc.validate(code);
            if (!isValid) return fail(res, 400, 'Invalid IFSC.');
            const data = await ifsc.fetchDetails(code);
            return ok(res, 'IFSC details found.', data);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },
};
