const express = require('express');
const authController = require('../controllers/authController');
const messageController = require('../controllers/messageController');

const router = express.Router();

/**
 * @openapi
 * /http/api/support/message:
 *   post:
 *     summary: Create a new message **MANAGER, CUSTOMER ONLY**
 *     description: Provide id of sender user, id of the conversation and text of the message
 *     tags:
 *      - Message
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *              type: object
 *              properties:
 *                sender:
 *                  type: string
 *                text:
 *                  type: string
 *                conversationId:
 *                  type: string
 *              required:
 *                - sender
 *                - text
 *                - conversationId
 *              example:
 *                sender: 62f5d118fc13ae547b00020f
 *                text: 'Hello! I need some help'
 *                conversationId: 6333c46eb49c51cd6d263a4c
 *     responses:
 *      201:
 *        description: Created
 *      500:
 *        description: Internal Server Error
 *      403:
 *        description: Forbidden
 *      401:
 *        description: Unauthorized
 */
router.post(
  '/',
  authController.protect,
  authController.restrictTo('customer', 'manager'),
  messageController.newMessageConversation
);

/**
 * @openapi
 * /http/api/support/message/{conversationId}:
 *   get:
 *     summary: Get all messages of conversation have been created on the system **MANAGER, CUSTOMER ONLY**
 *     description: Provide id of conversation to get all message of that conversation
 *     tags:
 *      - Message
 *     parameters:
 *      - in: path
 *        name: conversationId
 *        schema:
 *         type: string
 *         default: 63207ebb19b4e9dc99d91d9a
 *        required:
 *          - conversationId
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
  '/:conversationId',
  authController.protect,
  authController.restrictTo('customer', 'manager'),
  messageController.getMessageConversation
);

module.exports = router;
