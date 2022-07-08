const router = require('express').Router();
const machineController = require('../controller/machineController');
const multer = require('multer');
var upload = multer({dest: 'imageUpload'});
const auth = require('../middleware/auth');


// For Machine Router
/**
* @swagger
* /machine/addMachine:
*   post:
*     tags:
*       - PETROLEUM MACHINE
*     description: Creating Docs for Machine
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: Admin Token is required.
*         in: header
*         required: true
*       - name: machineName
*         description: machineName is required.
*         in: formData
*         required: true
*       - name: machineColor
*         description: machineColor is required.
*         in: formData
*         required: true
*       - name: machineType
*         description: Digital or Not.
*         in: formData
*         required: false
*       - name: machineCapacity
*         description: machineCapacity is required.
*         in: formData
*         required: true
*       - name: nozzel
*         description: nozzel is required.
*         in: formData
*         required: true
*       - name: machineFuelType
*         description: machineFuelType is required.
*         in: formData
*         required: true
*       - name: machinePaymentMode
*         description: machinePaymentMode Online/Offline.
*         in: formData
*         required: false
*       - name: image
*         description: image is required.
*         in: formData
*         type: file
*         required: true
*     responses:
*       200:
*         description: Machine Added successfully!!
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.post('/addMachine', auth.jwtTokenAdmin,upload.array('image', 15), machineController.addMachine);
/**
* @swagger
* /machine/updateMachine:
*   put:
*     tags:
*       - PETROLEUM MACHINE
*     description: Creating Docs for Machine
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: Admin Token is required.
*         in: header
*         required: true
*       - name: machineName
*         description: machineName is required.
*         in: formData
*         required: true
*       - name: machineColor
*         in: formData
*         required: false
*       - name: machineCapacity
*         in: formData
*         required: false
*       - name: nozzel
*         description: nozzel is required.
*         in: formData
*         required: true
*       - name: machineFueltype
*         in: formData
*         required: false
*       - name: image
*         in: formData
*         type: file
*         required: false
*     responses:
*       200:
*         description: Machine Updated successfully.
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.put('/updateMachine', auth.jwtTokenAdmin,upload.array('image', 15),machineController.updateMachine);
/**
* @swagger
* /machine/machineList:
*  get:
*     tags:
*       - PETROLEUM MACHINE
*     description: Creating Docs for Machine
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: Admin Token is required.
*         in: header
*         required: true
*       - name: machineName
*         in: query
*         required: false
*       - name: nozzel
*         in: query
*         required: false
*       - name: fromDate
*         in: query
*         required: false
*       - name: toDate
*         in: query
*         required: false
*       - name: fromDate & toDate
*         in: query
*         required: false
*     responses:
*        200:
*          description: Machine List listed successfully!!
*        404:
*          description: DATA NOT FOUND.
*        500:
*          description: Internal server error. 
*/
router.get('/machineList', auth.jwtTokenAdmin,machineController.machineList);  
/**
* @swagger
* /machine/deleteMachine:
*  delete:
*     tags:
*       - PETROLEUM MACHINE
*     description: Creating Docs for Machine
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: Admin Token is required.
*         in: header
*         required: true
*       - name: machineName
*         description: machineName is required.
*         in: formData
*         required: true
*     responses:
*        200:
*          description: Machine Deleted successfully!!
*        404:
*          description: DATA NOT FOUND.
*        500:
*          description: Internal server error. 
*/
router.delete('/deleteMachine/', auth.jwtTokenAdmin,machineController.deleteMachine);    
module.exports = router
