const router = require('express').Router();
const userController = require('../controller/userController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const v = require('../middleware/validate');

/**
 * @swagger
 * /user/signUp:
 *   post:
 *     tags: [USER]
 *     summary: Register a new user
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: firstName
 *         required: true
 *         type: string
 *       - in: formData
 *         name: lastName
 *         required: true
 *         type: string
 *       - in: formData
 *         name: email
 *         required: true
 *         type: string
 *       - in: formData
 *         name: password
 *         required: true
 *         type: string
 *       - in: formData
 *         name: confirmPassword
 *         required: true
 *         type: string
 *       - in: formData
 *         name: countryCode
 *         required: true
 *         type: string
 *       - in: formData
 *         name: mobileNumber
 *         required: true
 *         type: string
 *       - in: formData
 *         name: image
 *         required: true
 *         type: file
 *       - in: formData
 *         name: address
 *         type: string
 *       - in: formData
 *         name: dateOfBirth
 *         type: string
 *       - in: formData
 *         name: street
 *         type: string
 *       - in: formData
 *         name: area
 *         type: string
 *       - in: formData
 *         name: city
 *         type: string
 *       - in: formData
 *         name: state
 *         type: string
 *       - in: formData
 *         name: country
 *         type: string
 *       - in: formData
 *         name: pin
 *         type: string
 *     responses:
 *       200:
 *         description: Signup successful
 *       409:
 *         description: Email or mobile already exists
 */
router.post(
    '/signUp',
    upload.single('image'),
    v.signUp,
    userController.signUp
);

/**
 * @swagger
 * /user/otpVerify:
 *   put:
 *     tags: [USER]
 *     summary: Verify signup OTP
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
 *         description: User verified
 */
router.put('/otpVerify', v.otpVerify, userController.otpVerify);

/**
 * @swagger
 * /user/resendOTP:
 *   put:
 *     tags: [USER]
 *     summary: Resend OTP
 *     parameters:
 *       - in: formData
 *         name: email
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: OTP sent
 */
router.put('/resendOTP', v.emailOnly, userController.resendOtp);

/**
 * @swagger
 * /user/forgotPassword:
 *   put:
 *     tags: [USER]
 *     summary: Send forgot-password OTP
 *     parameters:
 *       - in: formData
 *         name: email
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: OTP sent
 */
router.put('/forgotPassword', v.emailOnly, userController.forgotPassword);

/**
 * @swagger
 * /user/resetPassword:
 *   put:
 *     tags: [USER]
 *     summary: Reset password using OTP
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
    '/resetPassword',
    v.resetPassword,
    userController.resetPassword
);

/**
 * @swagger
 * /user/login:
 *   post:
 *     tags: [USER]
 *     summary: User login
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
router.post('/login', v.login, userController.login);

/**
 * @swagger
 * /user/viewProfile:
 *   get:
 *     tags: [USER]
 *     summary: View logged-in user profile
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
router.get('/viewProfile', auth.jwtTokenUser, userController.viewProfile);

/**
 * @swagger
 * /user/editProfile:
 *   put:
 *     tags: [USER]
 *     summary: Edit logged-in user profile
 *     security:
 *       - token: []
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         type: string
 *       - in: formData
 *         name: firstName
 *         type: string
 *       - in: formData
 *         name: lastName
 *         type: string
 *       - in: formData
 *         name: countryCode
 *         type: string
 *       - in: formData
 *         name: mobileNumber
 *         type: string
 *       - in: formData
 *         name: address
 *         type: string
 *       - in: formData
 *         name: dateOfBirth
 *         type: string
 *       - in: formData
 *         name: street
 *         type: string
 *       - in: formData
 *         name: area
 *         type: string
 *       - in: formData
 *         name: city
 *         type: string
 *       - in: formData
 *         name: state
 *         type: string
 *       - in: formData
 *         name: country
 *         type: string
 *       - in: formData
 *         name: pin
 *         type: string
 *       - in: formData
 *         name: image
 *         type: file
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/editProfile', auth.jwtTokenUser, upload.single('image'), v.editProfile, userController.editProfile);

/**
 * @swagger
 * /user/getProfile:
 *   get:
 *     tags: [USER]
 *     summary: Get logged-in user profile
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
router.get('/getProfile', auth.jwtTokenUser, userController.getProfile);

/**
 * @swagger
 * /user/changePassword:
 *   put:
 *     tags: [USER]
 *     summary: Change password
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
    '/changePassword',
    auth.jwtTokenUser,
    v.changePassword,
    userController.changePassword
);

/**
 * @swagger
 * /user/listUser:
 *   get:
 *     tags: [USER]
 *     summary: Paginated user list (admin)
 *     security:
 *       - token: []
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         type: string
 *         description: Admin token
 *       - in: query
 *         name: search
 *         type: string
 *       - in: query
 *         name: page
 *         type: integer
 *       - in: query
 *         name: limit
 *         type: integer
 *       - in: query
 *         name: fromDate
 *         type: string
 *         description: ISO date
 *       - in: query
 *         name: toDate
 *         type: string
 *         description: ISO date
 *     responses:
 *       200:
 *         description: Users found
 */
router.get('/listUser', auth.jwtTokenAdmin, v.listQuery, userController.listUser);

/**
 * @swagger
 * /user/userMachineList:
 *   get:
 *     tags: [USER]
 *     summary: Paginated machine catalog for users
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
router.get('/userMachineList', auth.jwtTokenUser, v.listQuery, userController.userMachineList);

/**
 * @swagger
 * /user/getIfsc:
 *   get:
 *     tags: [USER]
 *     summary: Lookup Indian IFSC bank details
 *     parameters:
 *       - in: query
 *         name: ifscCode
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: IFSC details found
 */
router.get('/getIfsc', v.getIfsc, userController.getIfsc);

module.exports = router;
