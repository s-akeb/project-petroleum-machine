const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const config = require('../config');
const { fail } = require('../helper/apiResponse');

const getToken = (req) => {
    if (req.headers.token) return req.headers.token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    return null;
};

module.exports = {
    jwtTokenUser: async (req, res, next) => {
        try {
            const token = getToken(req);
            if (!token) {
                return fail(res, 401, 'Token is required.');
            }
            const decode = jwt.verify(token, config.jwtSecret);
            const userData = await userModel.findOne({ _id: decode.userId, userType: 'USER' });
            if (!userData) {
                return fail(res, 401, 'Unauthorized user.');
            }
            if (userData.status === 'BLOCK') {
                return fail(res, 403, 'Your account has been blocked by admin.');
            }
            if (userData.status === 'DELETE') {
                return fail(res, 403, 'Your account has been deleted.');
            }
            req.userId = userData._id;
            return next();
        } catch (error) {
            return fail(res, 401, 'Invalid or expired token.');
        }
    },

    jwtTokenAdmin: async (req, res, next) => {
        try {
            const token = getToken(req);
            if (!token) {
                return fail(res, 401, 'Token is required.');
            }
            const decode = jwt.verify(token, config.jwtSecret);
            const adminData = await userModel.findOne({ _id: decode.adminId, userType: 'ADMIN' });
            if (!adminData) {
                return fail(res, 401, 'Unauthorized admin.');
            }
            if (adminData.status === 'BLOCK') {
                return fail(res, 403, 'Your account has been blocked by admin.');
            }
            if (adminData.status === 'DELETE') {
                return fail(res, 403, 'Your account has been deleted.');
            }
            req.adminId = adminData._id;
            return next();
        } catch (error) {
            return fail(res, 401, 'Invalid or expired token.');
        }
    },
};
