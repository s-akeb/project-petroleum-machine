const nodeMailer = require('nodemailer');
const { count } = require('../models/machineModel');
const cloudinary = require('cloudinary').v2

cloudinary.config({
    cloud_name: 'dzvsohwsk',
    api_key: '642793952713843',
    api_secret: '-60Jrj44mYm_nbGjDQZ_NbE1KE0',
    secure: true
});
module.exports = {
    otp: () => {
        let randomNumber = Math.random();
        let sixDigit = Math.floor(randomNumber * 100000) + 100000;
        return sixDigit;
    },
    sendMail: async (email, subject, text) => {
        try {
            let transporter = nodeMailer.createTransport({
                service: "gmail",
                port: 587,
                secure: false,
                auth: {
                    user: "pqc-trainee@mobiloitte.com",
                    pass: "Mobiloitte1",
                },
            });
            let options = {
                from: "pqc-trainee@mobiloitte.com",
                to: email,
                subject: subject,
                text: text,
            }
            return await transporter.sendMail(options)
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong !", responseResult: error });
        }
    },
    // For Generate Random Serial number
    generatedSN(count) {
        var str = "" + count
        var pad = "001100"
        var ans = pad.substring(0, pad.length - str.length) + str
        return "MCN-" + ans;
    },
    // For Multiple file upload in cloudinary:
    uploadImage: async (image) => {
        try {
            let upload = await cloudinary.uploader.upload(image);
            return upload.secure_url;
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong !", responseResult: error });
        }
    },
};