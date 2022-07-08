const userModel = require('../models/userModel');
const commonFunction = require('../helper/commonFunction');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
    adminResendOtp: async (req, res) => {
        try {
            let query = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }], }, { status: { $ne: "DELETE" } }, { userType: "ADMIN" }], };
            let adminResult = await userModel.findOne(query);
            if (!adminResult) {
                return res.send({ reponseCode: 404, responseMessage: 'Admin not found .', responseResult: [], });
            } else {
                let otp = commonFunction.otp();
                let expireTime = Date.now() + 5 * 60 * 1000;
                let subject = 'OTP for verify';
                let text = `${otp}`;
                let mailResult = await commonFunction.sendMail(adminResult.email, subject, text);
                if (mailResult) {
                    let updateAdmin = await userModel.findByIdAndUpdate({ _id: adminResult._id }, { $set: { otpVerify: false, otp: otp, otpExpireTime: expireTime } }, { new: true })
                    if (updateAdmin) {
                        return res.send({ reponseCode: 200, responseMessage: 'OTP send successfully .', responseResult: updateAdmin, });
                    }
                }
            }
        } catch (error) {
            return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });
        }
    },
    adminOtpVerify: async (req, res) => {
        try {
            let resultVerify = await userModel.findOne({ $and: [{ $or: [{ email: req.body.email }] }, { status: { $ne: "DELETE" } }, { userType: 'ADMIN' }], },)
            if (!resultVerify) {
                return res.send({ reponseCode: 404, responseMessage: 'Admin not found .', responseResult: [] },);
            } else {
                if (resultVerify.otpVerify == true) {
                    return res.send({ responseCode: 409, responseMessage: 'Admin already verified .', responseResult: resultVerify })
                }
                else {
                    let currentTime = Date.now();
                    if (req.body.otp == resultVerify.otp) {
                        if (resultVerify.otpExpireTime >= currentTime) {
                            let resVerify = await userModel.findByIdAndUpdate({ _id: resultVerify._id }, { $set: { otpVerify: true } }, { new: true },)
                            if (resVerify) {
                                return res.send({ reponseCode: 200, responseMessage: 'Admin verify successfully !', result: [] },);
                            }
                        } else {
                            res.send({ reponseCode: 410, responseMessage: 'OTP Time is Expired .', result: [] },);
                        }
                    } else {
                        res.send({ reponseCode: 400, responseMessage: 'Wrong OTP .', result: [] },);
                    }

                }
            }
        } catch (er) {
            return res.send({ reponseCode: 501, responseMessage: 'Something went worng .', result: er.message })
        }
    },
    adminForgotPassword: async (req, res) => {
        try {
            let query = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }], }, { status: { $ne: "DELETE" } }, { userType: 'ADMIN' }], };
            let adminResult = await userModel.findOne(query);
            if (!adminResult) {
                return res.send({ reponseCode: 404, responseMessage: 'Admin not found .', responseResult: [], });
            }
            else {
                let otpForgot = commonFunction.otp()
                req.body.otpExpireTime = Date.now() + 5 * 60 * 1000;
                let subject = 'OTP varification for forgot password';
                let text = `Your OTP for verification is : ${otpForgot}`;
                let send = await commonFunction.sendMail(req.body.email, subject, text,)
                if (send) {
                    let otpUpdate = await userModel.findOneAndUpdate({ _id: adminResult._id }, { $set: { otp: otpForgot, otpVerify: false, } }, { new: true })
                    if (otpUpdate) {
                        return res.send({ reponseCode: 200, responseMessage: 'OTP send successfully !', result: otpUpdate },);
                    }
                }
            }
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong !", responseResult: error.message, });
        }
    },
    adminResetPassword: async (req, res) => {
        try {
            let query = { $and: [{ email: req.body.email }, { status: { $ne: "DELETE" } }, { userType: 'ADMIN' }], };
            let adminResult = await userModel.findOne(query);
            if (!adminResult) {
                return res.send({ reponseCode: 404, responseMessage: 'Admin not found .', responseResult: [], });
            }
            else {
                let currentTime = Date.now();
                if (req.body.otp == adminResult.otp) {
                    if (adminResult.otpExpireTime >= currentTime) {
                        if (req.body.newPassword == req.body.confirmNewPassword) {
                            req.body.newPassword = bcrypt.hashSync(req.body.newPassword)
                            let adminUpdate = await userModel.findByIdAndUpdate({ _id: adminResult._id }, { $set: { password: req.body.newPassword, otpVerify: true, } }, { new: true })
                            if (adminUpdate) {
                                return res.send({ reponseCode: 200, responseMessage: 'Reset password successfully !', result: adminUpdate },);
                            }
                        } else {
                            return res.send({ responseCode: 400, responseMessage: "newPassword and confirmNewPassword didn't matched .", responseResult: [] })
                        }
                    } else {
                        res.send({ reponseCode: 410, responseMessage: 'OTP is Expired .', result: [] },);
                    }
                } else {
                    res.send({ reponseCode: 400, responseMessage: 'Wrong OTP .', result: [] },);
                }
            }
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong !", responseResult: error.message, });
        }
    },
    adminLogin: async (req, res) => {
        try {
            let query = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.user },], }, { status: { $ne: "DELETE" } }, { userType: "ADMIN" },], };
            let adminResult = await userModel.findOne(query);
            if (!adminResult) {
                return res.send({ reponseCode: 404, responseMessage: 'Admin not found .', responseResult: [], });
            }
            else {
                if (adminResult.otpVerify == false) {
                    return res.send({ reponseCode: 401, responseMessage: 'Admin not verified .', responseResult: [] },);
                }
                else {
                    let passCheck = bcrypt.compareSync(req.body.password, adminResult.password);
                    if (passCheck == false) {
                        return res.send({ reponseCode: 401, responseMessage: 'Incorrect password.', })
                    }
                    else {
                        let data = {
                            adminId: adminResult._id,
                            email: adminResult.email
                        }
                        let token = jwt.sign(data, 'secret', { expiresIn: '1h' })           // here 15 is define in sec eg:-  '1h', '2 days'     
                        return res.send({ reponseCode: 200, responseMessage: 'Admin Login Successfully !', responseResult: token },);
                    }

                }
            }
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong !", responseResult: error.message, });
        }
    },
    adminViewProfile: async (req, res) => {
        try {
            let query = { _id: req.adminId, status: 'ACTIVE', userType: "ADMIN" };
            let adminData = await userModel.findOne(query);
            console.log(adminData)
            if (!adminData) {
                return res.send({ reponseCode: 404, responseMessage: 'Admin not found .', responseResult: [], });
            } else {
                return res.send({ reponseCode: 200, responseMessage: 'Login Successfully !', responseResult: adminData },);
            }
        } catch (error) {
            return res.send({
                responseCode: 501,
                responseMessage: "Something went wrong!",
                responseResult: error.message,
            });
        }
    },
    adminEditProfile: async (req, res) => {
        try {
            let query = { $and: [{ _id: req.adminId }, { status: 'ACTIVE' }, { userType: 'ADMIN' }], };
            let adminResult = await userModel.findOne(query);
            if (!adminResult) {
                return res.send({ reponseCode: 404, responseMessage: 'Admin not found .', responseResult: [], });
            }
            else {
                let adminUpdate = await userModel.findByIdAndUpdate({ _id: adminResult._id }, { $set: req.body }, { new: true })
                if (adminUpdate) {
                    return res.send({ reponseCode: 200, responseMessage: 'Profile updated successfully !', result: adminUpdate },);
                }
            }
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong !", responseResult: error.message, });
        }
    },
    adminChangePassword: async (req, res) => {
        try {
            let query = { $and: [{ _id: req.adminId }, { status: { $ne: "DELETE" } }, { userType: 'ADMIN' }], };
            let adminResult = await userModel.findOne(query);
            if (!adminResult) {
                return res.send({ reponseCode: 404, responseMessage: 'User not found .', responseResult: [], });
            }
            else {
                let passCheck = bcrypt.compareSync(req.body.password, adminResult.password);
                if (passCheck == false) {
                    return res.send({ reponseCode: 401, responseMessage: 'Incorrect password.', })
                }
                else {
                    let newPassword = req.body.newPassword;
                    let confirmNewPassword = req.body.confirmNewPassword
                    if (newPassword != confirmNewPassword) {
                        res.send({ reponseCode: 401, responseMessage: 'password do not match.', })
                    }
                    else {
                        req.body.newPassword = bcrypt.hashSync(newPassword)
                        let adminUpdate = await userModel.findByIdAndUpdate({ _id: adminResult._id }, { $set: { password: req.body.newPassword, } }, { new: true })
                        if (adminUpdate) {
                            return res.send({ reponseCode: 200, responseMessage: 'Password changed successfully', result: adminUpdate },);
                        }
                    }
                }
            }
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!", responseResult: error.message, });
        }
    },
};
