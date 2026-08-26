const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const staticSchema = new Schema(
    {
        type: { type: String },
        title: { type: String },
        description: { type: String },
        status: {
            type: String,
            enum: ['ACTIVE', 'BLOCK', 'DELETE'],
            default: 'ACTIVE',
        },
        userType: {
            type: String,
            enum: ['ADMIN', 'USER'],
            default: 'USER',
        },
    },
    { timestamps: true }
);

const staticModel = mongoose.model('static', staticSchema);

staticModel.seedStaticContent = async () => {
    try {
        const existing = await staticModel.find({ status: { $ne: 'DELETE' } });
        if (existing.length) {
            console.log('Static content already exists.');
            return;
        }
        await staticModel.insertMany([
            {
                type: 'T&C',
                title: 'Terms and Conditions',
                description:
                    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s.',
            },
            {
                type: 'P&P',
                title: 'Privacy Policy',
                description:
                    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s.',
            },
            {
                type: 'AboutUs',
                title: 'About Us',
                description:
                    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s.',
            },
        ]);
        console.log('Static content created.');
    } catch (error) {
        console.error('Static seed error:', error.message);
    }
};

module.exports = staticModel;
