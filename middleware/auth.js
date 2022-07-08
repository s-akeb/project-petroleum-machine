const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');
module.exports = {
    // For User
    jwtTokenUser: async (req, res, next) => {
        try {
            let decode = await jwt.verify(req.headers.token, 'secret');
            if (decode) {
                let userData = await userModel.findOne({ _id: decode.userId, userType: 'USER' });
                if (userData) {
                    if (userData.status == 'BLOCK') {
                        return res.send({ reponseCode: 402, responseMessage: 'Your account has been blocked by admin.', responseResult: [] },);
                    }
                    else if (userData.status == 'DELETE') {
                        return res.send({ reponseCode: 402, responseMessage: 'Your account has been deleted.', responseResult: [] },);
                    }
                    else {
                        req.userId = userData._id;
                        next()
                    }
                }
            }
        } catch (error) {
            return res.send({
                responseCode: 501,
                responseMessage: "Something went wrong!",
                responseResult: error.message,
            });
        }
    },
    // For Admin    
    jwtTokenAdmin: async (req, res, next) => {
        try {
            let decode = await jwt.verify(req.headers.token, 'secret');
            if (decode) {
                let adminData = await userModel.findOne({ _id: decode.adminId, userType: 'ADMIN' });
                if (adminData) {
                    if (adminData.status == 'BLOCK') {
                        return res.send({ reponseCode: 402, responseMessage: 'Your account has been blocked by admin.', responseResult: [] },);
                    }
                    else if (adminData.status == 'DELETE') {
                        return res.send({ reponseCode: 402, responseMessage: 'Your account has been deleted.', responseResult: [] },);
                    }
                    else {
                        req.adminId = adminData._id;
                        next()
                    }
                }
            }
        } catch (error) {
            return res.send({
                responseCode: 501,
                responseMessage: "Something went wrong!",
                responseResult: error.message,
            });
        }
    },
};
