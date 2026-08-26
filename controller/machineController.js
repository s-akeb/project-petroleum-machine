const qrCode = require('qrcode');
const machineModel = require('../models/machineModel');
const userModel = require('../models/userModel');
const commonFunction = require('../helper/commonFunction');
const { buildListQuery } = require('../helper/queryHelper');
const { ok, fail } = require('../helper/apiResponse');

const findAdmin = (adminId) =>
    userModel.findOne({ _id: adminId, status: { $ne: 'DELETE' }, userType: 'ADMIN' });

const findMachine = (req) => {
    const data = { ...req.query, ...req.body };
    const filter = { status: { $ne: 'DELETE' } };
    if (data._id) filter._id = data._id;
    else if (data.machineName) filter.machineName = data.machineName;
    else return null;
    return machineModel.findOne(filter);
};

const generateQr = async (machine) => {
    const qr = await qrCode.toDataURL(JSON.stringify({
        machineName: machine.machineName,
        serialNumber: machine.serialNumber,
        machineFuelType: machine.machineFuelType,
        nozzel: machine.nozzel,
    }));
    return commonFunction.uploadImage(qr);
};

module.exports = {
    addMachine: async (req, res) => {
        try {
            const admin = await findAdmin(req.adminId);
            if (!admin) return fail(res, 401, 'Unauthorized admin.');

            const existing = await machineModel.findOne({
                machineName: req.body.machineName,
                status: { $ne: 'DELETE' },
            });
            if (existing) return fail(res, 409, 'Machine name already exists.');

            const nozzel = Number(req.body.nozzel);
            if (Number.isNaN(nozzel) || nozzel > 4 || nozzel < 1) {
                return fail(res, 400, 'Nozzle must be a number between 1 and 4.');
            }

            const images = [];
            if (req.files && req.files.length) {
                for (const file of req.files) {
                    images.push(await commonFunction.uploadImage(file.path));
                }
            }

            const serialNumber = commonFunction.generatedSN(await machineModel.countDocuments());
            const payload = {
                machineName: req.body.machineName,
                machineColor: req.body.machineColor,
                machineType: req.body.machineType,
                machineCapacity: req.body.machineCapacity,
                machinePaymentMode: req.body.machinePaymentMode,
                machineFuelType: req.body.machineFuelType,
                nozzel,
                image: images,
                serialNumber,
            };
            payload.qrImg = await generateQr(payload);
            const machine = await machineModel.create(payload);
            return ok(res, 'Machine registered successfully.', machine);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    updateMachine: async (req, res) => {
        try {
            const admin = await findAdmin(req.adminId);
            if (!admin) return fail(res, 401, 'Unauthorized admin.');

            const machine = await findMachine(req);
            if (!machine) return fail(res, 404, 'Machine not found. Pass _id or machineName.');

            if (req.body.nozzel !== undefined) {
                const nozzel = Number(req.body.nozzel);
                if (Number.isNaN(nozzel) || nozzel > 4 || nozzel < 1) {
                    return fail(res, 400, 'Nozzle must be a number between 1 and 4.');
                }
                req.body.nozzel = nozzel;
            }

            const allowed = [
                'machineName',
                'machineColor',
                'machineType',
                'machineCapacity',
                'machinePaymentMode',
                'machineFuelType',
                'nozzel',
            ];
            const updates = {};
            allowed.forEach((field) => {
                if (req.body[field] !== undefined) updates[field] = req.body[field];
            });
            if (req.files && req.files.length) {
                updates.image = [];
                for (const file of req.files) {
                    updates.image.push(await commonFunction.uploadImage(file.path));
                }
            }

            const updated = await machineModel.findByIdAndUpdate(machine._id, { $set: updates }, { new: true });
            updated.qrImg = await generateQr(updated);
            await updated.save();
            return ok(res, 'Machine updated successfully.', updated);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    machineList: async (req, res) => {
        try {
            const { query, options } = buildListQuery(
                { status: { $ne: 'DELETE' } },
                req,
                ['machineName']
            );
            if (req.query.nozzel) {
                query.nozzel = Number(req.query.nozzel);
            }
            const machineData = await machineModel.paginate(query, options);
            if (!machineData.docs.length) {
                return fail(res, 404, 'Machine data not found.');
            }
            return ok(res, 'Machine list found successfully.', machineData);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },

    deleteMachine: async (req, res) => {
        try {
            const admin = await findAdmin(req.adminId);
            if (!admin) return fail(res, 401, 'Unauthorized admin.');

            const machine = await findMachine(req);
            if (!machine) return fail(res, 404, 'Machine not found. Pass _id or machineName.');

            const deleted = await machineModel.findByIdAndUpdate(
                machine._id,
                { status: 'DELETE', active: false },
                { new: true }
            );
            return ok(res, 'Machine deleted successfully.', deleted);
        } catch (error) {
            return fail(res, 500, 'Something went wrong.', error.message);
        }
    },
};