const router = require('express').Router();
const staticController = require('../controller/staticController');
const auth = require('../middleware/auth');
const v = require('../middleware/validate');

/**
 * @swagger
 * /static/listStatic:
 *   get:
 *     tags: [STATIC]
 *     summary: List all active static pages
 *     responses:
 *       200:
 *         description: Static data found
 */
router.get('/listStatic', staticController.listStatic);

/**
 * @swagger
 * /static/viewStatic:
 *   get:
 *     tags: [STATIC]
 *     summary: View static page by type (T&C, P&P, AboutUs)
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Static data found
 */
router.get('/viewStatic', v.viewStatic, staticController.viewStatic);

/**
 * @swagger
 * /static/editStatic:
 *   put:
 *     tags: [STATIC]
 *     summary: Update static content
 *     security:
 *       - token: []
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         type: string
 *         description: Admin token
 *       - in: formData
 *         name: _id
 *         required: true
 *         type: string
 *       - in: formData
 *         name: type
 *         type: string
 *       - in: formData
 *         name: title
 *         type: string
 *       - in: formData
 *         name: description
 *         type: string
 *     responses:
 *       200:
 *         description: Static data updated
 */
router.put('/editStatic', auth.jwtTokenAdmin, v.editStatic, staticController.editStatic);

module.exports = router;
