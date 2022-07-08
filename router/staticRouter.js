const router = require('express').Router()
const staticController = require('../controller/staticController')

/**
* @swagger
* /static/listStatic:
*   get:
*     tags:
*       - STATIC FIELD
*     description: Creating Docs for STATIC
*     produces:
*       - application/json
*     responses:
*       200:
*         description: Get List Static successfully.
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.get('/listStatic', staticController.listStatic);
/**
* @swagger
* /static/viewStatic:
*   get:
*     tags:
*       - STATIC FIELD
*     description: Creating Docs for STATIC
*     produces:
*       - application/json
*     parameters:
*       - name: type
*         description: query is required.
*         in: query
*         required: true
*     responses:
*       200:
*         description: View List Static successfully.
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.get('/viewStatic/', staticController.viewStatic);
/**
* @swagger
* /static/editStatic:
*   put:
*     tags:
*       - STATIC FIELD
*     description: Creating Docs for STATIC
*     produces:
*       - application/json
*     parameters:
*       - name: _id
*         description: id is required.
*         in: header
*         required: true
*       - name: type
*         in: formData
*         required: false
*       - name: title
*         in: formData
*         required: false
*     responses:
*       200:
*         description: View List Static successfully.
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.put('/editStatic', staticController.editStatic);
module.exports = router



