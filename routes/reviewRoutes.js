const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @openapi
 * /http/api/reviews:
 *   get:
 *     summary: Get all reviews have been given on all books
 *     tags:
 *      - Reviews
 *     parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *         type: number
 *         default: 65
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
 */
router.get('/', reviewController.getAllReviews);

/**
 * @openapi
 * /http/api/reviews/{bookId}:
 *   post:
 *     summary: Create a new review on Book **CUSTOMER ONLY**
 *     description: Provide id of the book to be review, then the review content
 *     tags:
 *      - Reviews
 *     parameters:
 *      - in: path
 *        name: bookId
 *        schema:
 *         type: string
 *         default: 630d799e8357beaf95fad746
 *        required:
 *          - bookId
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *              type: object
 *              properties:
 *                review:
 *                  type: string
 *                  maxLength: 500
 *                rating:
 *                  type: number
 *                  minimum: 1
 *                  maximum: 5
 *              required:
 *                - review
 *                - rating
 *              example:
 *                review: This is review of the book
 *                rating: 4
 *     responses:
 *      201:
 *        description: Created
 *      500:
 *        description: Internal Server Error
 *      409:
 *        description: Conflict
 *      403:
 *        description: Forbidden
 *      401:
 *        description: Unauthorized
 */
router.post(
  '/:bookId',
  authController.protect,
  authController.restrictTo('customer'),
  reviewController.createReview
);

/**
 * @openapi
 * /http/api/reviews/{id}:
 *   get:
 *     summary: Get the specific review have been given on the book
 *     description: Provide id of review need to get
 *     tags:
 *      - Reviews
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         default: 63181d05b6deed98a6c797e2
 *        required:
 *          - id
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      404:
 *        description: Not Found
 */
router.get('/:id', reviewController.getReview);

/**
 * @openapi
 * /http/api/reviews/{id}:
 *   delete:
 *     summary: Delete the specific review have been given on the book **MANAGER, CUSTOMER ONLY**
 *     description: Provide id of review need to delete
 *     tags:
 *      - Reviews
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         default: 632c633bdccdaf2b0841400c
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
  authController.restrictTo('manager', 'customer'),
  reviewController.deleteReview
);

module.exports = router;
