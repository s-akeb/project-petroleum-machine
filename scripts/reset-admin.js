require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const config = require('../config');

(async () => {
    await mongoose.connect(config.mongoUri);
    const users = mongoose.connection.collection('users');

    const deleted = await users.deleteMany({ userType: 'ADMIN' });
    console.log(`Removed ${deleted.deletedCount} existing admin(s).`);

    const email = String(config.admin.email).toLowerCase().trim();
    await users.insertOne({
        firstName: config.admin.firstName,
        lastName: config.admin.lastName,
        email,
        mobileNumber: config.admin.mobileNumber,
        countryCode: config.admin.countryCode,
        password: await bcrypt.hash(config.admin.password, 10),
        otpVerify: true,
        otpExpireTime: null,
        status: 'ACTIVE',
        userType: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    console.log('New admin created.');
    console.log(`Email: ${email}`);
    console.log('Password: (from DEFAULT_ADMIN_PASSWORD in .env)');
    await mongoose.disconnect();
})().catch(async (error) => {
    console.error(error.message);
    process.exit(1);
});
