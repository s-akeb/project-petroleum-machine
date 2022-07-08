const machineModel = require('../models/machineModel');
const userModel = require('../models/userModel');
const commonFunction = require('../helper/commonFunction');
const bcrypt = require('bcryptjs');
const qrCode = require('qrcode');
const { db } = require('../models/machineModel');
const cloudinary = require('cloudinary').v2
module.exports = {
    addMachine: async (req, res) => {
        try {
            let query = { $and: [{ _id: req.adminId }, { status: { $ne: "DELETE" } }, { userType: 'ADMIN' }], };
            let adminResult = await userModel.findOne(query);
            if (adminResult) {
                let query = { $and: [{ machineName: req.body.machineName }, { status: { $ne: "DELETE" } }, { userType: 'ADMIN' }], };
                let machineResult = await machineModel.findOne(query);
                if (!machineResult) {
                    req.body.machineName = req.body.machineName
                    req.body.serialNo = commonFunction.generatedSN(await machineModel.count())
                    let nozzel = req.body.nozzel
                    if (nozzel > 4) {
                        return res.send({ reponseCode: 400, responseMessage: 'Nozzel limit exceed!!', result: [] })
                    }
                    let data = req.body
                    if (data) {
                        let image = [];
                        for (let index = 0; index < req.files.length; index++) {
                            let files = await commonFunction.uploadImage(req.files[index].path);
                            image.push(files)
                        }
                        req.body.image = image
                        let stringData = JSON.stringify(data)
                        let qr = await qrCode.toDataURL(stringData)
                        let qrImage = await commonFunction.uploadImage(qr)
                        let qrImg
                        req.body.qrImg = qrImage
                        req.body.url = qrImg
                        let addMachineQrCode = await new machineModel(req.body).save()
                        if (addMachineQrCode) {
                            return res.send({ reponseCode: 200, responseMessage: 'Machine registered and your qrCode', responseResult: addMachineQrCode, image })
                        }
                    }
                }
                else {
                    return res.send({ reponseCode: 409, responseMessage: 'Machine name already exists', result: [] })
                }
            }
        } catch (error) {
            return res.send({ reponseCode: 501, responseMessage: 'Something went worng', result: error.message })
        }
    },
    updateMachine: async (req, res) => {
        try {
            let query = { $and: [{ _id: req.adminId }, { status: { $ne: "DELETE" } }, { userType: 'ADMIN' }], };
            let admin = await userModel.findOne(query);
            if (admin) {
                let query = { $and: [{ machineName: req.body.machineName }, { status: { $ne: "DELETE" } }, { userType: 'ADMIN' }], };
                let machine = await machineModel.findOne(query);
                if (!machine) {
                    return res.send({ reponseCode: 404, responseMessage: 'Machine not found .', responseResult: [] });
                } else {
                    let nozzel = req.body.nozzel
                    if (nozzel > 4) {
                        return res.send({ reponseCode: 400, responseMessage: 'Nozzel limit exceed', result: [] })
                    }
                    else {
                        let machineData = await machineModel.findByIdAndUpdate({ _id: machine._id }, { $set: req.body }, { new: true })
                        if (machineData) {
                            let stringData = JSON.stringify(machineData)
                            let qr = await qrCode.toDataURL(stringData)
                            let qrImage = await commonFunction.uploadImage(qr)
                            req.body.qrImg = qrImage
                            let machineQr = await machineModel.findByIdAndUpdate({ _id: machine._id }, { $set: { qrImg: req.body.qrImg } }, { new: true })
                            if (machineQr) {
                                return res.send({ reponseCode: 200, responseMessage: 'Succesfully updated', responseResult: machineQr });
                            }
                        }
                    }
                }
            }
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: 'Something went wrong', responseResult: error.message });
        }
    },
    machineList: async (req, res) => {
        try {
            let query = { status: { $ne: "DELETE" }, userType: "ADMIN" }
            if (req.query.search) {
                query.$or = [
                    { machineName: { $regex: req.query.search }, $option: 'i' },
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
            let machineData = await machineModel.paginate(query, options);
            if (machineData.docs.length == 0) {
                res.send({ responseCode: 404, responseMessage: 'User data not found!', responseResult: [] })
            } else {
                res.send({ responseCode: 200, responseMessage: 'User data found!', responseResult: machineData })
            }
        } catch (error) {
            res.send({ responseCode: 501, responseMessage: 'Something went wrong!', responseResult: error.message })
        }
    },
    deleteMachine: async (req, res) => {
        try {
            let query1 = { $and: [{ _id: req.adminId }, { status: { $ne: "DELETE" } }, { userType: 'ADMIN' }], };
            let admin = await userModel.findOne(query1);
            if (admin) {
                let query = { $and: [{ machineName: req.body.machineName }, { status: { $ne: "DELETE" } }, { userType: 'ADMIN' }], };
                let machine = await machineModel.findOne(query);
                if (!machine) {
                    return res.send({ reponseCode: 404, responseMessage: 'Machine not found .', responseResult: [] });
                } else {
                    let deleteMachine = await machineModel.deleteOne({ _id: machine._id })
                    if (deleteMachine) {
                        return res.send({ reponseCode: 200, responseMessage: 'Machine deleted.', responseResult: machine });

                    }
                }
            }
        } catch (error) {
            return res.send({ reponseCode: 501, responseMessage: 'Something went wrong.', responseResult: error.message });

        }
    },
};