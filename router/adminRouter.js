const router = require('express').Router();
const adminController = require('../controller/adminController');
const auth = require('../middleware/auth');
const v = require('../middleware/validate');

/**
 * @swagger
 * /admin/adminResendOtp:
 *   put:
 *     tags: [ADMIN]
 *     summary: Resend admin OTP
 *     parameters:
 *       - in: formData
 *         name: email
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: OTP sent
 */
router.put('/adminResendOtp', v.emailOnly, adminController.adminResendOtp);

/**
 * @swagger
 * /admin/adminOtpVerify:
 *   put:
 *     tags: [ADMIN]
 *     summary: Verify admin OTP
 *     parameters:
 *       - in: formData
 *         name: email
 *         required: true
 *         type: string
 *       - in: formData
 *         name: otp
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Admin verified
 */
router.put('/adminOtpVerify', v.otpVerify, adminController.adminOtpVerify);

/**
 * @swagger
 * /admin/adminForgotPassword:
 *   put:
 *     tags: [ADMIN]
 *     summary: Send admin forgot-password OTP
 *     parameters:
 *       - in: formData
 *         name: email
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: OTP sent
 */
router.put('/adminForgotPassword', v.emailOnly, adminController.adminForgotPassword);

/**
 * @swagger
 * /admin/adminResetPassword:
 *   put:
 *     tags: [ADMIN]
 *     summary: Reset admin password using OTP
 *     parameters:
 *       - in: formData
 *         name: email
 *         required: true
 *         type: string
 *       - in: formData
 *         name: otp
 *         required: true
 *         type: string
 *       - in: formData
 *         name: newPassword
 *         required: true
 *         type: string
 *       - in: formData
 *         name: confirmNewPassword
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Password reset
 */
router.put(
    '/adminResetPassword',
    v.resetPassword,
    adminController.adminResetPassword
);

/**
 * @swagger
 * /admin/adminLogin:
 *   post:
 *     tags: [ADMIN]
 *     summary: Admin login
 *     parameters:
 *       - in: formData
 *         name: email
 *         required: true
 *         type: string
 *       - in: formData
 *         name: password
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/adminLogin', v.login, adminController.adminLogin);

/**
 * @swagger
 * /admin/adminViewProfile:
 *   get:
 *     tags: [ADMIN]
 *     summary: View admin profile
 *     security:
 *       - token: []
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Profile fetched
 */
router.get('/adminViewProfile', auth.jwtTokenAdmin, adminController.adminViewProfile);

/**
 * @swagger
 * /admin/adminEditProfile:
 *   put:
 *     tags: [ADMIN]
 *     summary: Edit admin profile
 *     security:
 *       - token: []
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         type: string
 *       - in: formData
 *         name: email
 *         type: string
 *       - in: formData
 *         name: firstName
 *         type: string
 *       - in: formData
 *         name: lastName
 *         type: string
 *       - in: formData
 *         name: mobileNumber
 *         type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/adminEditProfile', auth.jwtTokenAdmin, v.editProfile, adminController.adminEditProfile);

/**
 * @swagger
 * /admin/adminChangePassword:
 *   put:
 *     tags: [ADMIN]
 *     summary: Change admin password
 *     security:
 *       - token: []
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         type: string
 *       - in: formData
 *         name: password
 *         required: true
 *         type: string
 *       - in: formData
 *         name: newPassword
 *         required: true
 *         type: string
 *       - in: formData
 *         name: confirmNewPassword
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Password changed
 */
router.put(
    '/adminChangePassword',
    auth.jwtTokenAdmin,
    v.changePassword,
    adminController.adminChangePassword
);

module.exports = router;
