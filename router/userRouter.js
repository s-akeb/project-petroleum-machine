const router = require('express').Router();
const userController = require('../controller/userController');
const adminController = require('../controller/adminController');  
const auth = require('../middleware/auth');
const multer = require('multer')
const upload = multer({dest:'imageUpload'})

// For User
/**
* @swagger
* /user/signUp:
*   post:
*     tags:
*       - USER FIELD
*     description: Creating Docs for USER
*     produces:
*       - application/json
*     parameters:
*       - name: firstName
*         description: firstName is required.
*         in: formData
*         required: true
*       - name: lastName
*         description: lastName is required.
*         in: formData
*         required: true
*       - name: email
*         description: email is required.
*         in: formData
*         required: true
*       - name: password
*         description: password is required.
*         in: formData
*         required: true
*       - name: confirmPassword
*         description: confirmPassword is required.
*         in: formData
*         required: true
*       - name: countryCode
*         description: countryCode is required.
*         in: formData
*         required: true
*       - name: mobileNumber
*         description: mobileNumber is required.
*         in: formData
*         required: true
*       - name: image
*         description: image is required.
*         in: formData
*         type: file
*         required: true
*       - name: address
*         in: formData
*         required: false
*       - name: dateOfBirth
*         in: formData
*         required: false
*       - name: street
*         in: formData
*         required: false
*       - name: area
*         in: formData
*         required: false
*       - name: city
*         in: formData
*         required: false
*       - name: state
*         in: formData
*         required: false
*       - name: country
*         in: formData
*         required: false
*       - name: pin
*         in: formData
*         required: false
*     responses:
*       200:
*         description: signUp successfully!!.
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.post("/signUp",upload.single('image'),userController.signUp);
/** 
* @swagger
* /user/otpVerify:
*   put:
*     tags:
*       - USER FIELD
*     description: Creating Docs for USER
*     produces:
*       - application/json
*     parameters:
*       - name: email
*         description: email is required.
*         in: formData
*         required: true
*       - name: otp
*         description: otp is required.
*         in: formData
*         required: true
*     responses:
*       200:
*         description: otp verify successfully!!
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.put("/otpVerify", userController.otpVerify);
/**
* @swagger
* /user/resendOtp:
*   put:
*     tags:
*       - USER FIELD
*     description: Creating Docs for USER
*     produces:
*       - application/json
*     parameters:
*       - name: email
*         description: email is required.
*         in: formData
*         required: true
*     responses:
*       200:
*         description: Resend otp successfully.
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.put("/resendOTP", userController.resendOtp);
/**
* @swagger
* /user/forgotPassword:
*   put:
*     tags:
*       - USER FIELD
*     description: Creating Docs for USER
*     produces:
*       - application/json
*     parameters:
*       - name: email
*         description: email is required.
*         in: formData
*         required: true
*     responses:
*       200:
*         description: otp send successfully.
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.put("/forgotPassword", userController.forgotPassword);
/**
* @swagger
* /user/resetPassword:
*   put:
*     tags:
*       - USER FIELD
*     description: Creating Docs for USER
*     produces:
*       - application/json
*     parameters:
*       - name: email
*         description: email is required.
*         in: formData
*         required: true
*       - name: otp
*         description: otp is required.
*         in: formData
*         required: true
*       - name: newPassword
*         description: newPassword is required.
*         in: formData
*         required: true
*       - name: confirmNewPassword
*         description: confirmNewPassword is required.
*         in: formData
*         required: true
*     responses:
*       200:
*         description: Reset password successfully !
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.put("/resetPassword", userController.resetPassword);
/**
* @swagger
* /user/login:
*   post:
*     tags:
*       - USER FIELD
*     description: Creating Docs for USER
*     produces:
*       - application/json
*     parameters:
*       - name: email
*         description: email is required.
*         in: formData
*         required: true
*       - name: password
*         description: password is required.
*         in: formData
*         required: true
*     responses:
*       200:
*         description: User Login successfully.
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.post("/login", userController.login);
/**
* @swagger
* /user/viewProfile:
*   get:
*     tags:
*       - USER FIELD
*     description: Creating Docs for USER
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token is required.
*         in: header
*         required: true
*     responses:
*       200:
*         description: Profile View Successfully !
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.get("/viewProfile/", auth.jwtTokenUser,userController.viewProfile);
/**
* @swagger
* /user/editProfile:
*   put:
*     tags:
*       - USER FIELD
*     description: Creating Docs for USER
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token is required.
*         in: header
*         required: true
*       - name: firstName
*         in: formData
*         required: false
*       - name: lastName
*         in: formData
*         required: false
*       - name: countryCode
*         in: formData
*         required: false
*       - name: mobileNumber
*         in: formData
*         required: false
*       - name: address
*         in: formData
*         required: false
*       - name: dateOfBirth
*         in: formData
*         required: false
*       - name: street
*         in: formData
*         required: false
*       - name: area
*         in: formData
*         required: false
*       - name: city
*         in: formData
*         required: false
*       - name: state
*         in: formData
*         required: false
*       - name: country
*         in: formData
*         required: false
*       - name: pin
*         in: formData
*         required: false
*     responses:
*       200:
*         description: Profile updated successfully !.
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.put("/editProfile", auth.jwtTokenUser,userController.editProfile);
/**
* @swagger
* /user/getProfile:
*   get:
*     tags:
*       - USER FIELD
*     description: Creating Docs for USER
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token is required.
*         in: header
*         required: true
*     responses:
*       200:
*         description: Get Profile successfully.
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.get("/getProfile/", auth.jwtTokenUser,userController.getProfile);
/**
* @swagger
* /user/changePassword:
*   put:
*     tags:
*       - USER FIELD
*     description: Creating Docs for USER
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token is required.
*         in: header
*         required: true
*       - name: password
*         description: password is required.
*         in: formData
*         required: true
*       - name: newPassword
*         description: newPassword is required.
*         in: formData
*         required: true
*       - name: confirmNewPassword
*         description: confirmNewPassword is required.
*         in: formData
*         required: true
*     responses:
*       200:
*         description: Password changed successfully.
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.put("/changePassword", auth.jwtTokenUser,userController.changePassword);
/**
* @swagger
* /user/listUser:
*  get:
*     tags:
*       - USER FIELD
*     description: Creating Docs for USER
*     produces:
*       - application/json
*     parameters:
*       - name: lastName
*         in: query
*         required: false
*       - name: email
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
*          description: User data found successfully!!
*        404:
*          description: DATA NOT FOUND.
*        500:
*          description: Internal server error. 
*/
router.get('/listUser',userController.listUser);
/**
* @swagger
* /user/userMachineList:
*  get:
*     tags:
*       - USER FIELD
*     description: Creating Docs for USER
*     produces:
*       - application/json
*     parameters:
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
*          description: Machine List Found successfully!!
*        404:
*          description: DATA NOT FOUND.
*        500:
*          description: Internal server error. 
*/
router.get('/userMachineList', userController.userMachineList);
/**
* @swagger
* /user/getIfsc:
*   get:
*     tags:
*       - USER FIELD
*     description: Creating Docs for USER
*     produces:
*       - application/json
*     parameters:
*       - name: ifscCode
*         description: ifscCode is required.
*         in: query
*         required: true
*     responses:
*       200:
*         description: Resend otp successfully.
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.get("/getIfsc", userController.getIfsc);

// For Admin
/**
* @swagger
* /admin/adminResendOtp:
*   put:
*     tags:
*       - ADMIN FIELD
*     description: Creating Docs for ADMIN
*     produces:
*       - application/json
*     parameters:
*       - name: email
*         description: email is required.
*         in: formData
*         required: true
*     responses:
*       200:
*         description: ResendOtp successfully!!
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.put("/adminResendOtp", adminController.adminResendOtp);
/**
* @swagger
* /admin/adminOtpVerify:
*   put:
*     tags:
*       - ADMIN FIELD
*     description: Creating Docs for ADMIN
*     produces:
*       - application/json
*     parameters:
*       - name: email
*         description: email is required.
*         in: formData
*         required: true
*       - name: otp
*         description: otp is required.
*         in: formData
*         required: true
*     responses:
*       200:
*         description: OtpVerify successfully!!
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.put("/adminOtpVerify", adminController.adminOtpVerify);
/**
* @swagger
* /admin/adminForgotPassword:
*   put:
*     tags:
*       - ADMIN FIELD
*     description: Creating Docs for ADMIN
*     produces:
*       - application/json
*     parameters:
*       - name: email
*         description: email is required.
*         in: formData
*         required: true
*     responses:
*       200:
*         description: Otp send successfully!!
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.put("/adminForgotPassword", adminController.adminForgotPassword);
/**
* @swagger
* /admin/adminResetPassword:
*  put:
*     tags:
*       - ADMIN FIELD
*     description: Creating Docs for ADMIN
*     produces:
*       - application/json
*     parameters:
*       - name: email
*         description: email is required.
*         in: formData
*         required: true
*       - name: otp
*         description: otp is required.
*         in: formData
*         required: true
*       - name: newPassword
*         description: newPassword is required.
*         in: formData
*         required: true
*       - name: confirmNewPassword
*         description: confirmNewPassword is required.
*         in: formData
*         required: true
*     responses:
*        200:
*          description: ResetPassword successfully.
*        404:
*          description: DATA NOT FOUND.
*        500:
*          description: Internal server error.  
*/
router.put("/adminResetPassword", adminController.adminResetPassword);
/**
* @swagger
* /admin/adminlogin:
*  post:
*     tags:
*       - ADMIN FIELD
*     description: Creating Docs for ADMIN
*     produces:
*       - application/json
*     parameters:
*       - name: email
*         description: email is required.
*         in: formData
*         required: true
*       - name: password
*         description: password is required.
*         in: formData
*         required: true
*     responses:
*        200:
*          description: Login successfully.
*        404:
*          description: DATA NOT FOUND.
*        500:
*          description: Internal server error. 
*/
router.post("/adminLogin", adminController.adminLogin);
/**
* @swagger
* /admin/adminViewProfile:
*  get:
*     tags:
*       - ADMIN FIELD
*     description: Creating Docs for ADMIN
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token is required.
*         in: header
*         required: true
*     responses:
*        200:
*          description: Admin View Profile successfully.
*        404:
*          description: DATA NOT FOUND.
*        500:
*          description: Internal server error. 
*/
router.get("/adminViewProfile", auth.jwtTokenAdmin,adminController.adminViewProfile);
/**
* @swagger
* /admin/adminEditProfile:
*   put:
*     tags:
*       - ADMIN FIELD
*     description: Creating Docs for ADMIN
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token is required.
*         in: header
*         required: true
*       - name: email
*         in: formData
*         required: false
*       - name: firstName
*         in: formData
*         required: false
*       - name: lastName
*         in: formData
*         required: false
*       - name: mobileNumber
*         in: formData
*         required: false
*     responses:
*       200:
*         description: Edited Profile successfull!!
*       404:
*         description: DATA NOT FOUND.
*       500:
*         description: Internal server error.
*/
router.put("/adminEditProfile", auth.jwtTokenAdmin,adminController.adminEditProfile);
/**
* @swagger
* /admin/adminChangePassword:
*  put:
*     tags:
*       - ADMIN FIELD
*     description: Creating Docs for ADMIN
*     produces:
*       - application/json
*     parameters:
*       - name: token
*         description: token is required.
*         in: header
*         required: true
*       - name: password
*         description: password is required.
*         in: formData
*         required: true
*       - name: newPassword
*         description: newPassword is required.
*         in: formData
*         required: true
*       - name: confirmNewPassword
*         description: confirmNewPassword is required.
*         in: formData
*         required: true
*     responses:
*        200:
*          description: Password Changed successfully!!
*        404:
*          description: DATA NOT FOUND.
*        500:
*          description: Internal server error. 
*/
router.put("/adminChangePassword", auth.jwtTokenAdmin,adminController.adminChangePassword);
module.exports = router