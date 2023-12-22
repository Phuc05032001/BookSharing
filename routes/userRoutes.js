const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

/**
 * @openapi
 * /http/api/users/register:
 *   post:
 *     summary: Register new account on the system
 *     tags:
 *      - Authentication
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *          type: object
 *          properties:
 *            fullName:
 *              type: string
 *              maxLength: 40
 *            email:
 *             type: string
 *             format: email
 *            password:
 *             type: string
 *             format: password
 *            passwordConfirm:
 *             type: string
 *             format: password
 *          required:
 *            - fullName
 *            - email
 *            - password
 *            - passwordConfirm
 *          example:
 *            fullName: John Smith
 *            email: me@example.com
 *            password: myPassword@123
 *            passwordConfirm: myPassword@123
 *     responses:
 *      200:
 *        description: Success
 *      409:
 *        description: Conflict
 *      500:
 *        description: Internal Server Error
 */
router.post('/register', authController.register);

/**
 * @openapi
 * /http/api/users/login:
 *   post:
 *     summary: Login user to get the token cookie for authorization
 *     tags:
 *      - Authentication
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *          type: object
 *          properties:
 *            email:
 *             type: string
 *             format: email
 *            password:
 *             type: string
 *             format: password
 *          required:
 *            - email
 *            - password
 *          example:
 *            email: me@example.com
 *            password: myPassword@123
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 */
router.post('/login', authController.login);

router.post(
  '/googleLogin',
  authController.googleLoginAccount,
  authController.googleLoginSession
);

/**
 * @openapi
 * /http/api/users/logout:
 *   get:
 *     summary: Logout user to remove the token cookie for authorization
 *     tags:
 *      - Authentication
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      401:
 *        description: Unauthorized
 */
router.get('/logout', authController.protect, authController.logoutSession);

/**
 * @openapi
 * /http/api/users/updateMyInfo:
 *   patch:
 *     summary: Update information of logged in user account
 *     tags:
 *      - Authentication
 *     requestBody:
 *      content:
 *       multipart/form-data:
 *        schema:
 *         type: object
 *         properties:
 *          fullName:
 *            type: string
 *            maxLength: 40
 *          gender:
 *            type: string
 *            enum: [male, female]
 *          phoneNumber:
 *            type: string
 *            pattern: '/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/g'
 *          dateOfBirth:
 *            type: string
 *            format: date
 *          address:
 *            type: string
 *            minLength: 5
 *          country:
 *            type: string
 *            minLength: 3
 *          city:
 *            type: string
 *            minLength: 3
 *          zipCode:
 *            type: integer
 *            minimum: 10000
 *            maximum: 99999
 *          specialization:
 *            type: string
 *            minLength: 5
 *          photo:
 *            type: string
 *            format: binary
 *         required:
 *          - fullName
 *          - gender
 *          - phoneNumber
 *          - address
 *          - dateOfBirth
 *          - country
 *          - city
 *          - zipCode
 *          - specialization
 *         example:
 *          fullName: A New Full Name
 *          gender: female
 *          phoneNumber: 01236456789
 *          dateOfBirth: 2010-07-21
 *          address: 12 Street Address
 *          country: United States
 *          city: Los Angeles
 *          zipCode: 92837
 *          specialization: Business Expert
 *      encoding:
 *       photo:
 *        content-type: image/jpg, image/jpeg, image/png
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      401:
 *        description: Unauthorized
 */
router.patch(
  '/updateMyInfo',
  authController.protect,
  userController.handlingUploadFile,
  userController.uploadUserPhoto,
  userController.updateMyInfo
);

/**
 * @openapi
 * /http/api/users/updateMyPassword:
 *   patch:
 *     summary: Update password of logged in user account
 *     tags:
 *      - Authentication
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *          type: object
 *          properties:
 *            currentPassword:
 *             type: string
 *             format: password
 *            newPassword:
 *             type: string
 *             format: password
 *            passwordConfirm:
 *             type: string
 *             format: password
 *          required:
 *            - currentPassword
 *            - newPassword
 *            - passwordConfirm
 *          example:
 *            currentPassword: myPassword@123
 *            newPassword: newPassword@123
 *            passwordConfirm: newPassword@123
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      400:
 *        description: Bad Request
 *      401:
 *        description: Unauthorized
 */
router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

/**
 * @openapi
 * /http/api/users/updateMyEmail:
 *   patch:
 *     summary: Update email of logged in user account
 *     tags:
 *      - Authentication
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *          type: object
 *          properties:
 *            email:
 *             type: string
 *             format: email
 *          required:
 *            - email
 *          example:
 *            email: myNewEmail@example.com
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      409:
 *        description: Conflict
 *      401:
 *        description: Unauthorized
 */
router.patch(
  '/updateMyEmail',
  authController.protect,
  authController.UpdateEmail
);

/**
 * @openapi
 * /http/api/users/deactivateAccount:
 *   patch:
 *     summary: Deactivate account of logged in user account
 *     tags:
 *      - Authentication
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      401:
 *        description: Unauthorized
 */
router.patch(
  '/deactivateAccount',
  authController.protect,
  userController.deactivateAccount
);

//account recovery
/**
 * @openapi
 * /http/api/users/forgotPassword:
 *   post:
 *     summary: Sending token for recovery user account password
 *     tags:
 *      - Authentication
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *          type: object
 *          properties:
 *            email:
 *             type: string
 *             format: email
 *          required:
 *            - email
 *          example:
 *            email: myEmail@example.com
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      404:
 *        description: Not Found
 */
router.post('/forgotPassword', authController.forgotPassword);
/**
 * @openapi
 * /http/api/users/resetPassword/{token}:
 *   patch:
 *     summary: From recovery password token, reset user account password
 *     description: Provide recovery password token and new password to reset user account password
 *     tags:
 *      - Authentication
 *     parameters:
 *      - in: path
 *        name: token
 *        schema:
 *         type: string
 *         default: 4fecf7d5db3b83e70048cab589bbf20e4f4007ce59c91ac83eaf70cd4268bc28
 *        required:
 *          - token
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *          type: object
 *          properties:
 *            password:
 *             type: string
 *             format: password
 *            passwordConfirm:
 *             type: string
 *             format: password
 *          required:
 *            - password
 *            - passwordConfirm
 *          example:
 *            password: newPassword@123
 *            passwordConfirm: newPassword@123
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      400:
 *        description: Bad Request
 */
router.patch('/resetPassword/:token', authController.resetPassword);

/**
 * @openapi
 * /http/api/users/sendEmailVerification:
 *   post:
 *     summary: Sending user account verification email
 *     tags:
 *      - Authentication
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *         schema:
 *          type: object
 *          properties:
 *            email:
 *             type: string
 *             format: email
 *          required:
 *            - email
 *          example:
 *            email: myEmail@example.com
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      404:
 *        description: Not Found
 */
router.post('/sendEmailVerification', authController.sendEmailVerification);
/**
 * @openapi
 * /http/api/users/emailVerify/{verifyToken}:
 *   get:
 *     summary: From account verification token, verify user account
 *     description: Provide account verification token to verify
 *     tags:
 *      - Authentication
 *     parameters:
 *      - in: path
 *        name: verifyToken
 *        schema:
 *         type: string
 *         default: 4fecf7d5db3b83e70048cab589bbf20e4f4007ce59c91ac83eaf70cd4268bc28
 *        required:
 *          - token
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      400:
 *        description: Bad Request
 */
router.get('/emailVerify/:verifyToken', authController.emailVerification);

//manage account
/**
 * @openapi
 * /http/api/users:
 *   get:
 *     summary: Get all user accounts have been registered on the system
 *     tags:
 *      - Users
 *     parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *         type: number
 *         default: 20
 *      - in: query
 *        name: page
 *        schema:
 *         type: number
 *         default: 1
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      403:
 *        description: Forbidden
 *      401:
 *        description: Unauthorized
 */
router.get(
  '/',
  authController.protect,
  authController.restrictTo('admin'),
  userController.getAllUsers
);

/**
 * @openapi
 * /http/api/users/{id}:
 *   get:
 *     summary: Get the specific user account has been registered on the system
 *     description: Provide id of the user account need to get
 *     tags:
 *      - Users
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         default: 62f5cfc3d2a9b8a2d2f0d262
 *        required:
 *          - id
 *     responses:
 *      200:
 *        description: Success
 *      403:
 *        description: Forbidden
 *      500:
 *        description: Internal Server Error
 *      404:
 *        description: Not Found
 *      401:
 *        description: Unauthorized
 */
router.get('/:id', authController.protect, userController.getUser);

/**
 * @openapi
 * /http/api/users/setAccountStatus/{id}:
 *   patch:
 *     summary: Update the status of user account **ADMIN ONLY**
 *     description: Provide id of the user account need to update the status to (active, disabled)
 *     tags:
 *      - Users
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         default: 62f5cfc3d2a9b8a2d2f0d262
 *        required:
 *          - id
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *              type: object
 *              properties:
 *                active:
 *                  type: string
 *                  enum: [true, false]
 *              required:
 *                - active
 *              example:
 *                active: "true"
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      403:
 *        description: Forbidden
 *      404:
 *        description: Not Found
 *      401:
 *        description: Unauthorized
 */
router.patch(
  '/setAccountStatus/:id',
  authController.protect,
  authController.restrictTo('admin'),
  userController.setAccountStatus
);

/**
 * @openapi
 * /http/api/users/setAccountRole/{id}:
 *   patch:
 *     summary: Update the role of user account **ADMIN ONLY**
 *     description: Provide id of the user account need to update the role to (manager, customer)
 *     tags:
 *      - Users
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         default: 62f5cfc3d2a9b8a2d2f0d262
 *        required:
 *          - id
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *              type: object
 *              properties:
 *                role:
 *                  type: string
 *                  enum: [manager, customer]
 *              required:
 *                - role
 *              example:
 *                role: "customer"
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      403:
 *        description: Forbidden
 *      404:
 *        description: Not Found
 *      401:
 *        description: Unauthorized
 */
router.patch(
  '/setAccountRole/:id',
  authController.protect,
  authController.restrictTo('admin'),
  userController.setAccountRole
);

module.exports = router;
