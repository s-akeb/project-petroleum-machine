const staticModel = require('../models/staticModel');
const { ok, fail } = require('../helper/apiResponse');

module.exports = {
    listStatic: async (req, res) => {
        try {
            const staticData = await staticModel.find({ status: 'ACTIVE' });
            if (!staticData.length) return fail(res, 404, 'Static data not found.');
            return ok(res, 'Static data found.', staticData);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    viewStatic: async (req, res) => {
        try {
            const staticData = await staticModel.find({
                type: req.query.type,
                status: 'ACTIVE',
            });
            if (!staticData.length) return fail(res, 404, 'Static data not found.');
            return ok(res, 'Static data found.', staticData);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    editStatic: async (req, res) => {
        try {
            const staticData = await staticModel.findOne({
                _id: req.body._id,
                status: 'ACTIVE',
            });
            if (!staticData) return fail(res, 404, 'Static data not found.');

            const allowed = ['type', 'title', 'description'];
            const updates = {};
            allowed.forEach((field) => {
                if (req.body[field] !== undefined) updates[field] = req.body[field];
            });
            const updated = await staticModel.findByIdAndUpdate(
                staticData._id,
                { $set: updates },
                { new: true }
            );
            return ok(res, 'Static data updated successfully.', updated);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },
};