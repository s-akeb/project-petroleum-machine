const nodeMailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;
const config = require('../config');

cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret,
    secure: true,
});

module.exports = {
    otp: () => Math.floor(100000 + Math.random() * 900000),

    sendMail: async (email, subject, text) => {
        if (!config.mail.user || !config.mail.pass) {
            console.warn('Mail credentials missing; skipping send.');
            return false;
        }
        try {
            const transporter = nodeMailer.createTransport({
                service: 'gmail',
                port: 587,
                secure: false,
                auth: {
                    user: config.mail.user,
                    pass: config.mail.pass,
                },
            });
            return await transporter.sendMail({
                from: config.mail.user,
                to: email,
                subject,
                text,
            });
        } catch (error) {
            console.error('sendMail failed:', error.message);
            return false;
        }
    },

    generatedSN: (count) => {
        const str = String(count);
        const pad = '001100';
        return `MCN-${pad.substring(0, Math.max(pad.length - str.length, 0))}${str}`;
    },

    uploadImage: async (image) => {
        try {
            const upload = await cloudinary.uploader.upload(image);
            return upload.secure_url;
        } catch (error) {
            console.error('Cloudinary upload failed:', error.message);
            return image;
        }
    },
};