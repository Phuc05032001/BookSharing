const express = require('express');
const authController = require('../controllers/authController');
const conversationController = require('../controllers/conversationController');

const router = express.Router();

/**
 * @openapi
 * /http/api/support/conversation:
 *   post:
 *     summary: Create a new support conversation **CUSTOMER ONLY**
 *     tags:
 *      - Conversation
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *              type: object
 *              properties:
 *                senderId:
 *                  type: string
 *              required:
 *                - senderId
 *              example:
 *                senderId: 62f5cfc3d2a9b8a2d2f0d262
 *     responses:
 *      201:
 *        description: Created
 *      401:
 *        description: Unauthorized
 *      403:
 *        description: Forbidden
 *      404:
 *        description: Not Found
 *      500:
 *        description: Internal Server Error
 */
router.post(
  '/',
  authController.protect,
  authController.restrictTo('customer'),
  conversationController.createConversation
);

/**
 * @openapi
 * /http/api/support/conversation/{userId}:
 *   get:
 *     summary: Get all conversation of specified user have been created on the system **MANAGER, CUSTOMER ONLY**
 *     description: Provide id of user to get all conversation
 *     tags:
 *      - Conversation
 *     parameters:
 *      - in: path
 *        name: userId
 *        schema:
 *         type: string
 *         default: 62f5cf75d2a9b8a2d2f0d25c
 *        required:
 *          - userId
 *     responses:
 *      200:
 *        description: Success
 *      401:
 *        description: Unauthorized
 *      403:
 *        description: Forbidden
 *      409:
 *        description: Conflict
 *      500:
 *        description: Internal Server Error
 */
router.get(
  '/:userId',
  authController.protect,
  authController.restrictTo('customer', 'manager'),
  conversationController.getConversation
);

module.exports = router;
