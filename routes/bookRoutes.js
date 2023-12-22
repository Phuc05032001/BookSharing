const express = require('express');
const authController = require('../controllers/authController');
const bookController = require('../controllers/bookController');

const router = express.Router();

/**
 * @openapi
 * /http/api/books:
 *   get:
 *     summary: Get all books have been uploaded on the system
 *     tags:
 *      - Books
 *     parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *         type: number
 *         default: 10
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
router.get('/', authController.protect, bookController.getAllBooks);

/**
 * @openapi
 * /http/api/books:
 *   post:
 *     summary: Uploaded new book to the system **CUSTOMER ONLY**
 *     tags:
 *      - Books
 *     requestBody:
 *      content:
 *       multipart/form-data:
 *        schema:
 *         type: object
 *         properties:
 *          bookTitle:
 *            type: string
 *            description: Title of the book
 *            maxLength: 70
 *          price:
 *            type: number
 *            description: Price of the book
 *          summary:
 *            type: string
 *            description: Short summary about the book
 *            maxLength: 150
 *          description:
 *            type: string
 *            description: Description about the book
 *            maxLength: 600
 *          tags:
 *            type: string
 *            description: Tag of the book (provide tagId)
 *          bookFile:
 *            type: string
 *            format: binary
 *            description: Document file of the book
 *          bookCover:
 *            type: string
 *            format: binary
 *            description: Image cover of the book
 *         required:
 *          - bookTitle
 *          - price
 *          - summary
 *          - description
 *          - tags
 *          - bookFile
 *          - bookCover
 *         example:
 *          bookTitle: New Book Title
 *          price: 45
 *          summary: This is a summary for uploaded new book API
 *          description: This is a description for uploaded new book API
 *          tags: 6304470b8492077f82c19d8a
 *      encoding:
 *       bookCover:
 *        content-type: image/jpg, image/jpeg, image/png
 *       bookFile:
 *        content-type: application/pdf
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
 *      400:
 *        description: Bad Request
 */
router.post(
  '/',
  authController.protect,
  authController.restrictTo('customer'),
  bookController.handlingUploadFile,
  bookController.uploadAndSave,
  bookController.submitBook
);

/**
 * @openapi
 * /http/api/books/{id}:
 *   get:
 *     summary: Get the specific book have been uploaded on the system
 *     description: Provide id of book need to get
 *     tags:
 *      - Books
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         default: 630d799e8357beaf95fad734
 *        required:
 *          - id
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      404:
 *        description: Not Found
 *      401:
 *        description: Unauthorized
 */
router.get('/:id', authController.protect, bookController.getBook);

/**
 * @openapi
 * /http/api/books/reading/{id}:
 *   get:
 *     summary: Get the specific document file of book have been uploaded on the system
 *     description: Provide id of book need to get document file for reading
 *     tags:
 *      - Books
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         default: 63196a4e5a17de3cc0469b9d
 *         description: Id of the book
 *        required:
 *          - id
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      404:
 *        description: Not Found
 *      401:
 *        description: Unauthorized
 */
router.get('/reading/:id', authController.protect, bookController.getBookFile);

/**
 * @openapi
 * /http/api/books/{id}:
 *   patch:
 *     summary: Update the specific book has been uploaded on the system **ADMIN, CUSTOMER ONLY**
 *     description: Provide id of book need to update, then the updated data
 *     tags:
 *      - Books
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         default: 63196a4e5a17de3cc0469b9d
 *        required:
 *          - id
 *     requestBody:
 *      content:
 *       multipart/form-data:
 *        schema:
 *         type: object
 *         properties:
 *          bookTitle:
 *            type: string
 *            description: Title of the book
 *            maxLength: 70
 *          price:
 *            type: number
 *            description: Price of the book
 *          summary:
 *            type: string
 *            description: Short summary about the book
 *            maxLength: 150
 *          description:
 *            type: string
 *            description: Description about the book
 *            maxLength: 600
 *          tags:
 *            type: string
 *            description: Tag of the book (provide tagId)
 *          bookFile:
 *            type: string
 *            format: binary
 *            description: Document file of the book
 *          bookCover:
 *            type: string
 *            format: binary
 *            description: Image cover of the book
 *         required:
 *          - bookTitle
 *          - price
 *          - summary
 *          - description
 *          - tags
 *          - bookFile
 *          - bookCover
 *         example:
 *          bookTitle: New Book Title
 *          price: 45
 *          summary: This is a summary for uploaded new book API
 *          description: This is a description for uploaded new book API
 *          tags: 6304470b8492077f82c19d8a
 *      encoding:
 *       bookCover:
 *        content-type: image/jpg, image/jpeg, image/png application/pdf
 *       bookFile:
 *        content-type: application/pdf
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      409:
 *        description: Conflict
 *      403:
 *        description: Forbidden
 *      404:
 *        description: Not Found
 *      401:
 *        description: Unauthorized
 *      400:
 *        description: Bad Request
 */
router.patch(
  '/:id',
  authController.protect,
  authController.restrictTo('admin', 'customer'),
  bookController.handlingUploadFile,
  bookController.handingBookEdited,
  bookController.uploadAndSave,
  bookController.updateBook
);

/**
 * @openapi
 * /http/api/books/{id}:
 *   delete:
 *     summary: Delete the specific book have been uploaded on the system **ADMIN, CUSTOMER ONLY**
 *     description: Provide id of book need to delete
 *     tags:
 *      - Books
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
 *      409:
 *        description: Conflict
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
  authController.restrictTo('admin', 'customer'),
  bookController.deleteBook
);

/**
 * @openapi
 * /http/api/books/setBookStatus/{id}:
 *   patch:
 *     summary: Update the approving status of uploaded book **MANAGER ONLY**
 *     description: Provide id of book need to update status, then the updated type and reason
 *     tags:
 *      - Books
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         default: 632c633bdccdaf2b0841400c
 *        required:
 *          - id
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *              type: object
 *              properties:
 *                status:
 *                  type: string
 *                  enum: [pending, approved, rejected]
 *                reason:
 *                  type: string
 *                  maxLength: 36
 *              required:
 *                - status
 *                - reason
 *              example:
 *                status: rejected
 *                reason: This book content is now allowed
 *     responses:
 *      200:
 *        description: Success
 *      500:
 *        description: Internal Server Error
 *      409:
 *        description: Conflict
 *      403:
 *        description: Forbidden
 *      404:
 *        description: Not Found
 *      401:
 *        description: Unauthorized
 */
router.patch(
  '/setBookStatus/:id',
  authController.protect,
  authController.restrictTo('manager'),
  bookController.setBookStatus
);

module.exports = router;
