const express = require('express');
const authController = require('../controllers/authController');
const tagController = require('../controllers/tagController');

const router = express.Router();

/**
 * @openapi
 * /http/api/tags:
 *   get:
 *     summary: Get all tags have been created on the system
 *     tags:
 *      - Tags
 *     parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *         type: number
 *         default: 25
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
router.get('/', tagController.getAllTags);

/**
 * @openapi
 * /http/api/tags:
 *   post:
 *     summary: Create a new tag **ADMIN ONLY**
 *     tags:
 *      - Tags
 *     requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *                  maxLength: 30
 *                group:
 *                  type: string
 *                  enum: [format, genre, theme]
 *                description:
 *                  type: string
 *                  maxLength: 100
 *              required:
 *                - name
 *                - description
 *                - group
 *              example:
 *                name: New tag
 *                group: format
 *                description: this is a new tag
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
  '/',
  authController.protect,
  authController.restrictTo('admin'),
  tagController.createTag
);

/**
 * @openapi
 * /http/api/tags/{id}:
 *   get:
 *     summary: Get the specific tag have been created on the system
 *     description: Provide id of the tag need to get
 *     tags:
 *      - Tags
 *     parameters:
 *      - in: path
 *        name: id
 *        schema:
 *         type: string
 *         default: 632c633bdccdaf2b0841400c
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
router.get('/:id', tagController.getTag);

/**
 * @openapi
 * /http/api/tags/{id}:
 *   patch:
 *     summary: Update the specific tag **ADMIN ONLY**
 *     description: Provide id of the tag need to update
 *     tags:
 *      - Tags
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
 *                name:
 *                  type: string
 *                  maxLength: 30
 *                group:
 *                  type: string
 *                  enum: [format, genre, theme]
 *                description:
 *                  type: string
 *                  maxLength: 100
 *              required:
 *                - name
 *                - description
 *                - group
 *              example:
 *                name: Update tag
 *                group: genre
 *                description: This tag need to be updated
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
  '/:id',
  authController.protect,
  authController.restrictTo('admin'),
  tagController.updateTag
);

/**
 * @openapi
 * /http/api/tags/{id}:
 *   delete:
 *     summary: Delete the specific tag have been created on the system **ADMIN ONLY**
 *     description: Provide id of the tag need to delete
 *     tags:
 *      - Tags
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
  authController.restrictTo('admin'),
  tagController.deleteTag
);

module.exports = router;
