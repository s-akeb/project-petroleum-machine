const router = require('express').Router();
const machineController = require('../controller/machineController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const v = require('../middleware/validate');

/**
 * @swagger
 * /machine/addMachine:
 *   post:
 *     tags: [PETROLEUM MACHINE]
 *     summary: Register a petroleum machine
 *     security:
 *       - token: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         type: string
 *         description: Admin token
 *       - in: formData
 *         name: machineName
 *         required: true
 *         type: string
 *       - in: formData
 *         name: machineColor
 *         required: true
 *         type: string
 *       - in: formData
 *         name: machineType
 *         type: string
 *       - in: formData
 *         name: machineCapacity
 *         required: true
 *         type: string
 *       - in: formData
 *         name: nozzel
 *         required: true
 *         type: integer
 *         description: Number of nozzles (1-4)
 *       - in: formData
 *         name: machineFuelType
 *         required: true
 *         type: string
 *       - in: formData
 *         name: machinePaymentMode
 *         type: string
 *       - in: formData
 *         name: image
 *         type: file
 *     responses:
 *       200:
 *         description: Machine added
 */
router.post(
    '/addMachine',
    auth.jwtTokenAdmin,
    upload.array('image', 15),
    v.addMachine,
    machineController.addMachine
);

/**
 * @swagger
 * /machine/updateMachine:
 *   put:
 *     tags: [PETROLEUM MACHINE]
 *     summary: Update a machine by _id or machineName
 *     security:
 *       - token: []
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         type: string
 *       - in: formData
 *         name: _id
 *         type: string
 *       - in: formData
 *         name: machineName
 *         type: string
 *       - in: formData
 *         name: machineColor
 *         type: string
 *       - in: formData
 *         name: machineType
 *         type: string
 *       - in: formData
 *         name: machineCapacity
 *         type: string
 *       - in: formData
 *         name: nozzel
 *         type: integer
 *       - in: formData
 *         name: machineFuelType
 *         type: string
 *       - in: formData
 *         name: machinePaymentMode
 *         type: string
 *       - in: formData
 *         name: image
 *         type: file
 *     responses:
 *       200:
 *         description: Machine updated
 */
router.put('/updateMachine', auth.jwtTokenAdmin, upload.array('image', 15), v.updateMachine, machineController.updateMachine);

/**
 * @swagger
 * /machine/machineList:
 *   get:
 *     tags: [PETROLEUM MACHINE]
 *     summary: Paginated machine list
 *     security:
 *       - token: []
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         type: string
 *       - in: query
 *         name: search
 *         type: string
 *       - in: query
 *         name: nozzel
 *         type: integer
 *       - in: query
 *         name: page
 *         type: integer
 *       - in: query
 *         name: limit
 *         type: integer
 *       - in: query
 *         name: fromDate
 *         type: string
 *       - in: query
 *         name: toDate
 *         type: string
 *     responses:
 *       200:
 *         description: Machines found
 */
router.get('/machineList', auth.jwtTokenAdmin, v.listQuery, machineController.machineList);

/**
 * @swagger
 * /machine/deleteMachine:
 *   delete:
 *     tags: [PETROLEUM MACHINE]
 *     summary: Soft-delete a machine by _id or machineName
 *     security:
 *       - token: []
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         type: string
 *       - in: formData
 *         name: _id
 *         type: string
 *       - in: formData
 *         name: machineName
 *         type: string
 *     responses:
 *       200:
 *         description: Machine deleted
 */
router.delete('/deleteMachine', auth.jwtTokenAdmin, v.deleteMachine, machineController.deleteMachine);

module.exports = router;
