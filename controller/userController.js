const userModel = require('../models/userModel');
const addressModel = require('../models/addressModel');
const commonFunction = require('../helper/commonFunction');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const machineModel = require('../models/machineModel');
const ifsc = require('ifsc');

module.exports = {
    signUp: async (req, res) => {
        try {
            let result = await userModel.findOne({ $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }] }, { status: { $ne: "DELETE" } }, { userType: 'USER' }], },)
            if (result) {
                if (result.email == req.body.email) {
                    return res.send({ reponseCode: 409, responseMessage: 'Email already exists', result: [] })
                }
                else {
                    if (result.mobileNumber == req.body.mobileNumber) {
                        return res.send({ reponseCode: 409, responseMessage: 'Mobile number already exists', result: [] })
                    }
                }
            }
            else {
                req.body.otp = commonFunction.otp();
                req.body.otpExpireTime = Date.now() + 5 * 60 * 1000;
                let password = req.body.password;
                let conpass = req.body.confirmPassword
                if (password != conpass) {
                    res.send({ reponseCode: 401, responseMessage: 'password do not match.', })
                }
                else {
                    req.body.password = bcrypt.hashSync(password)
                    let profilePic = req.file.path
                    req.body.profilePic = await commonFunction.uploadImage(profilePic);
                    req.body.profilePic = req.body.profilePic
                    let subject = 'signUP OTP';
                    let text = `Your OTP : ${req.body.otp}`;
                    let mail = await commonFunction.sendMail(req.body.email, subject, text,)
                    if (mail) {
                        let userSave = await new userModel(req.body).save()
                        if (userSave) {
                            req.body.userId = userSave._id;
                            let saveAddress = await new addressModel(req.body).save();
                            if (saveAddress) {
                                let updateUser = await userModel.findByIdAndUpdate({ _id: userSave._id }, { $set: { addressId: saveAddress._id, otp: req.body.otp } }, { new: true })
                                if (updateUser) {
                                    return res.send({ reponseCode: 200, responseMessage: 'Signup successfully', result: updateUser, saveAddress })
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (error) {
            return res.send({ reponseCode: 501, responseMessage: 'Something went worng', result: error.message })
        }
    },
    otpVerify: async (req, res) => {
        try {
            let resultVerify = await userModel.findOne({ $and: [{ $or: [{ email: req.body.email }] }, { status: { $ne: "DELETE" } }, { userType: 'USER' }], },)
            if (!resultVerify) {
                return res.send({ reponseCode: 404, responseMessage: 'User not found', responseResult: [] },);
            } else {
                if (resultVerify.otpVerify == true) {
                    return res.send({ responseCode: 409, responseMessage: 'User already verified.', responseResult: resultVerify })
                }
                else {
                    let currentTime = Date.now();
                    if (req.body.otp == resultVerify.otp) {
                        if (resultVerify.otpExpireTime >= currentTime) {
                            let resVerify = await userModel.findByIdAndUpdate({ _id: resultVerify._id }, { $set: { otpVerify: true } }, { new: true },)
                            if (resVerify) {

                                return res.send({ reponseCode: 200, responseMessage: 'User verify successfully', result: resVerify },);
                            }
                        } else {
                            res.send({ reponseCode: 410, responseMessage: 'OTP is Expired', result: [] },);
                        }
                    } else {
                        res.send({ reponseCode: 400, responseMessage: 'Wrong OTP', result: [] },);
                    }

                }
            }
        } catch (er) {
            return res.send({ reponseCode: 501, responseMessage: 'Something went worng', result: er.message })
        }
    },
    resendOtp: async (req, res) => {
        try {
            let query = { $and: [{ $or: [{ email: req.body.email }], }, { status: { $ne: "DELETE" } },], };
            let userResult = await userModel.findOne(query);
            if (!userResult) {
                return res.send({ reponseCode: 404, responseMessage: 'User not found .', responseResult: [], });
            } else {
                let otp = commonFunction.otp();
                let expireTime = Date.now() + 5 * 60 * 1000;
                let subject = 'OTP for verify';
                let text = `${otp}`;
                let mailResult = await commonFunction.sendMail(userResult.email, subject, text);
                if (mailResult) {
                    let updateUser = await userModel.findByIdAndUpdate({ _id: userResult._id }, { $set: { otpVerify: false, otp: otp, otpExpireTime: expireTime } }, { new: true })
                    if (updateUser) {
                        return res.send({ reponseCode: 200, responseMessage: 'OTP send successfully .', responseResult: updateUser, });
                    }
                }
            }
        } catch (error) {
            return res.send({ reponseCode: 501, responseMessage: 'Something went wrong .', responseResult: error.message, });
        }
    },
    forgotPassword: async (req, res) => {
        try {
            let query = { $and: [{ $or: [{ email: req.body.email }, { mobileNumber: req.body.mobileNumber }], }, { status: { $ne: "DELETE" } }, { userType: 'USER' }], };
            let userResult = await userModel.findOne(query);
            if (!userResult) {
                return res.send({ reponseCode: 404, responseMessage: 'User not found .', responseResult: [], });
            }
            else {
                let otpForgot = commonFunction.otp()
                // let otpTime = Date.now()
                req.body.otpExpireTime = Date.now() + 5 * 60 * 1000;
                // otpTime = req.body.otpExpireTime
                let subject = 'OTP varification for forgot password';
                let text = `Your OTP for verification : ${otpForgot}`;
                let send = await commonFunction.sendMail(req.body.email, subject, text,)
                if (send) {
                    let otpUpdate = await userModel.findOneAndUpdate({ _id: userResult._id }, { $set: { otp: otpForgot, otpVerify: false, } }, { new: true })
                    if (otpUpdate) {
                        return res.send({ reponseCode: 200, responseMessage: 'OTP send successfully', result: otpUpdate },);
                    }
                }
            }
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!", responseResult: error.message, });
        }
    },
    resetPassword: async (req, res) => {
        try {
            let query = { $and: [{ email: req.body.email }, { status: { $ne: "DELETE" } }, { userType: 'USER' }], };
            let userResult1 = await userModel.findOne(query);
            if (!userResult1) {
                return res.send({ reponseCode: 404, responseMessage: 'User not found .', responseResult: [], });
            }
            else {
                let currentTime = Date.now();
                console.log('214=====>', req.body.otp);
                console.log('215=====>', userResult1.otp);
                if (req.body.otp == userResult1.otp) {
                    if (userResult1.otpExpireTime >= currentTime) {
                        if (req.body.newPassword == req.body.confirmNewPassword) {
                            req.body.newPassword = bcrypt.hashSync(req.body.newPassword)
                            let userUpdate = await userModel.findByIdAndUpdate({ _id: userResult1._id }, { $set: { password: req.body.newPassword, otpVerify: true, } }, { new: true })
                            if (userUpdate) {
                                return res.send({ reponseCode: 200, responseMessage: 'Reset password successfully', result: userUpdate },);
                            }
                        } else {
                            return res.send({ responseCode: 400, responseMessage: "newPassword and confirmNewPassword didn't matched.", responseResult: [] })
                        }
                    } else {
                        res.send({ reponseCode: 410, responseMessage: 'OTP is Expired', result: [] },);
                    }
                } else {
                    res.send({ reponseCode: 400, responseMessage: 'Wrong OTP', result: [] },);
                }
            }
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!", responseResult: error.message, });
        }
    },
    login: async (req, res) => {
        try {
            let query = {$and: [{$or: [ { email: req.body.email },], }, { status: { $ne: "DELETE" } },],}
            let userResult = await userModel.findOne(query)
            if (!userResult) {
                return res.send({ responseCode: 404, responseMessage: "user not found ", result: [] })
            }
            else {
                if (userResult.otpVerify == false) {
  
                    return res.send({ responseCode: 401, responseMessage: "user not verify", result: [] })
                }
                else {
                    let passCheck = bcrypt.compareSync(req.body.password, userResult.password)
                    if (passCheck == false) {
                        return res.send({ responseCode: 401, responseMessage: "incorrect password", result: [] })
                    }
                    else {
                        let data = {
                            userId: userResult._id,
                            email: userResult.email
                        }
                        let token = jwt.sign(data, 'secret', { expiresIn: '1h' })
                        return res.send({ responseCode: 200, responseMessage: "login successfull", responseResult: userResult, token })
                    }
                }
            }
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: 'something went wrong.', responseResult: error.message })
  
        }
  
    },
    viewProfile: async (req, res) => {
        try {
            let query = { _id: req.userId, status: 'ACTIVE', userType: "USER" };
            let usersData = await userModel.findOne(query);
            console.log(usersData)
            if (!usersData) {
                return res.send({ reponseCode: 404, responseMessage: 'User not found .', responseResult: [], });
            } else {
                return res.send({ reponseCode: 200, responseMessage: 'Profile View Successfully !', responseResult: usersData },);
            }
        } catch (error) {
            return res.send({
                responseCode: 501,
                responseMessage: "Something went wrong!",
                responseResult: error.message,
            });
        }
    },
    editProfile: async (req, res) => {
        try {
            // let query = { $and: [{ email: req.body.email }, { status: { $ne: "DELETE" } }, { userType: 'USER' }], };
            let query = { $and: [{ _id: req.userId }, { status: 'ACTIVE' }, { userType: 'USER' }], };    // this is used for JWT 
            let userResult = await userModel.findOne(query);
            if (!userResult) {
                return res.send({ reponseCode: 404, responseMessage: 'User not found .', responseResult: [], });
            }
            else {
                let userUpdate = await userModel.findByIdAndUpdate({ _id: userResult._id }, { $set: req.body }, { new: true })
                if (userUpdate) {
                    return res.send({ reponseCode: 200, responseMessage: 'Profile updated successfully !', result: userUpdate },);
                }
            }
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong !", responseResult: error.message, });
        }
    },
    getProfile: async (req, res) => {
        try {
            let query = { _id: req.userId, status: 'ACTIVE', userType: "USER" };
            let usersData = await userModel.findOne(query);
            console.log(usersData)
            if (!usersData) {
                return res.send({ reponseCode: 404, responseMessage: 'User not found .', responseResult: [], });
            } else {
                return res.send({ reponseCode: 200, responseMessage: 'Get Profile Successfully !', responseResult: usersData },);
            }
        } catch (error) {
            return res.send({
                responseCode: 501,
                responseMessage: "Something went wrong!",
                responseResult: error.message,
            });
        }
    },
    changePassword: async (req, res) => {
        try {
            let query = { $and: [{ _id: req.userId }, { status: { $ne: "DELETE" } }, { userType: 'USER' }], };
            let userResult = await userModel.findOne(query);
            if (!userResult) {
                return res.send({ reponseCode: 404, responseMessage: 'User not found .', responseResult: [], });
            }
            else {
                let passCheck = bcrypt.compareSync(req.body.password, userResult.password);
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
                        //req.body.newPassword=bcrypt.hashSync(newPassword)
                        req.body.newPassword = bcrypt.hashSync(newPassword)
                        let userUpdate = await userModel.findByIdAndUpdate({ _id: userResult._id }, { $set: { password: req.body.newPassword, } }, { new: true })
                        if (userUpdate) {
                            return res.send({ reponseCode: 200, responseMessage: 'Password changed successfully', result: userUpdate },);
                        }
                    }
                }
            }
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!", responseResult: error.message, });
        }
    },
    listUser: async (req, res) => {
        try {
            let query = { status: { $ne: "DELETE" }, userType: 'USER' };

            if (req.query.search) {
                query.$or = [
                    { lastName: { $regex: req.query.search, $options: 'i' } },
                    { email: { $regex: req.query.search, $options: 'i' } },
                ]
            };
            let options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                sort: { createdAt: -1 },
                populate: 'addressId'
            };
            // fromDate = 15/04/2022, toDate = 20/04/2022
            if (req.query.fromDate) {
                query.createdAt = { $gte: req.body.fromDate }
            }
            if (req.query.toDate) {
                query.createdAt = { $lte: req.body.toDate }
            }
            if (req.query.fromDate && req.query.toDate) {
                query.$and[{ createdAt: { $gte: req.body.fromDate } }, { createdAt: { $lte: req.body.toDate } }]
            }
            let userData = await userModel.paginate(query, options);
            console.log(userData);
            if (userData.docs.length == 0) {
                res.send({
                    responseCode: 404,
                    responseMessage: " data not found!",
                    responseResult: userData,
                });
            } else {
                console.log(userData);
                res.send({
                    responseCode: 200,
                    responseMessage: " User data found!",
                    responseResult: userData,
                });
            }
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong!", responseResult: error.message });
        }
    },
    userMachineList: async (req, res) => {
        try {
            let query = { status: { $ne: "DELETE" }, userType: "ADMIN" }
            if (req.query.search) {
                query.$or = [
                    { machineName: { $regex: req.query.search, $option: 'i' } },
                    { nozzel: { $regex: req.query.search, $option: 'i' } },
                ]
            }
            let options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.body.limit) || 10,
                sort: { createdAt: -1 },
            };
            if (req.query.fromDate) {
                query.createdAt = { $gte: req.body.fromDate }
            }
            if (req.query.toDate) {
                query.createdAt = { $lte: req.body.toDate }
            }
            if (req.query.fromDate && req.query.toDate) {
                query.$and = [{ createdAt: { $gte: req.body.fromDate } }, { createdAt: { $lte: req.body.toDate } }]
            }
            let adminData = await machineModel.paginate(query, options);
            if (adminData.docs.length == 0) {
                res.send({ responseCode: 404, responseMessage: 'Machine data not found!', responseResult: [] })
            } else {
                res.send({ responseCode: 200, responseMessage: 'Machine List Found successfully!!', responseResult: adminData })
            }
        } catch (error) {
            res.send({ responseCode: 501, responseMessage: 'Something went wrong!', responseResult: error.message })
        }
    },
    //Bank IFSC CODE 
    getIfsc: async(req,res)=>{
        try {
           let upper = req.query.ifscCode.toUpperCase();
           let check = await ifsc.validate(upper)
           if(check == false){
            return res.send({ reponseCode: 400, responseMessage: 'Invalid IFSC!!', responseResult: [] });
           }
           let data = await ifsc.fetchDetails(upper);
           return res.send({ reponseCode: 200, responseMessage: 'Data found!!', responseResult: data });
        } catch (error) {
            return res.send({ reponseCode: 501, responseMessage: 'Something went wrong!.', responseResult: error.message });
        }
    }
};