require('dotenv').config();

module.exports = {
    port: process.env.PORT || 8888,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
    cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    },
    mail: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    admin: {
        firstName: process.env.DEFAULT_ADMIN_FIRST_NAME || 'Sakeb',
        lastName: process.env.DEFAULT_ADMIN_LAST_NAME || 'Ahmad',
        email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com',
        mobileNumber: process.env.DEFAULT_ADMIN_MOBILE || '82943394429',
        countryCode: '+91',
        password: process.env.DEFAULT_ADMIN_PASSWORD || 'S1234',
    },
};
