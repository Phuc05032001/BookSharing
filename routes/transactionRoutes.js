const express = require('express');
const transactionController = require('../controllers/transactionController');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @openapi
 * /http/api/transactions/checkoutSession/{bookId}:
 *   get:
 *     summary: From the book data, starting checkout session for purchasing the book
 *     description: Provide id of the book
 *     tags:
 *      - Transactions
 *     parameters:
 *      - in: path
 *        name: bookId
 *        schema:
 *         type: string
 *         default: 630d799e8357beaf95fad784
 *         description: Id of the book
 *        required:
 *          - bookId
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not Found
 */
router.get(
  '/checkoutSession/:bookId',
  authController.protect,
  transactionController.getCheckoutSession
);

router.get('/checkoutSuccess', transactionController.createTransactionCheckout);

/**
 * @openapi
 * /http/api/transactions:
 *   get:
 *     summary: Get all transactions have been performed on the system **MANAGER ONLY**
 *     tags:
 *      - Transactions
 *     parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *         type: number
 *         default: 30
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
  authController.restrictTo('manager'),
  transactionController.getAllTransactions
);

/**
 * @openapi
 * /http/api/transactions/{id}:
 *   delete:
 *     summary: Delete the specific transaction have been performed on the system **MANAGER ONLY**
 *     description: Provide id of the transaction need to get
 *     tags:
 *      - Transactions
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         default: 631b17ca09316594539f8eb0
 *        required:
 *          - id
 *     responses:
 *      204:
 *        description: No Content
 *      500:
 *        description: Internal Server Error
 *      403:
 *        description: Forbidden
 *      404:
 *        description: Not Found
 *      401:
 *        description: Unauthorized
 */
router.delete(
  '/:id',
  authController.protect,
  authController.restrictTo('manager'),
  transactionController.deleteTransaction
);

/**
 * @openapi
 * /http/api/transactions/myInventory:
 *   get:
 *     summary: Get all transactions has been performed by logged in user
 *     tags:
 *      - Transactions
 *     parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *         type: number
 *         default: 30
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
 *      401:
 *        description: Unauthorized
 */
router.get(
  '/myInventory',
  authController.protect,
  transactionController.getUserSuccessTransaction
);

/**
 * @openapi
 * /http/api/transactions/isOwnBook/{bookId}:
 *   get:
 *     summary: Get the transaction data of user who has successfully purchased the book
 *     description: Provide id of the book. If user has successfully purchased the book, return the transaction data. If not, return null
 *     tags:
 *      - Transactions
 *     parameters:
 *      - in: path
 *        name: bookId
 *        schema:
 *         type: string
 *         default: 630d799e8357beaf95fad784
 *         description: Id of the book
 *        required:
 *          - bookId
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      401:
 *        description: Unauthorized
 */
router.get(
  '/isOwnBook/:bookId',
  authController.protect,
  transactionController.getTransactionOfBook
);

module.exports = router;
