const express = require('express');
const statisticsController = require('../controllers/statisticsController');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * @openapi
 * /http/api/statistics/accounts:
 *   get:
 *     summary: Get user accounts statistics on the system **ADMIN ONLY**
 *     tags:
 *      - Statistics
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
  '/accounts',
  authController.protect,
  authController.restrictTo('admin'),
  statisticsController.accountsStatistics
);

/**
 * @openapi
 * /http/api/statistics/accountsCreatedYearly:
 *   get:
 *     summary: Get users accounts created statistics by each year on the system **ADMIN ONLY**
 *     tags:
 *      - Statistics
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
  '/accountsCreatedYearly',
  authController.protect,
  authController.restrictTo('admin'),
  statisticsController.accountsCreatedYearly
);

/**
 * @openapi
 * /http/api/statistics/books:
 *   get:
 *     summary: Get statistics about books on the system **ADMIN, MANAGER ONLY**
 *     tags:
 *      - Statistics
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
  '/books',
  authController.protect,
  authController.restrictTo('admin', 'manager'),
  statisticsController.booksStatistics
);

/**
 * @openapi
 * /http/api/statistics/booksUploadedMonthly:
 *   get:
 *     summary: Get statistics about books uploaded by each month on the system **ADMIN,MANAGER ONLY**
 *     tags:
 *      - Statistics
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
  '/booksUploadedMonthly',
  authController.protect,
  authController.restrictTo('admin', 'manager'),
  statisticsController.booksUploadedMonthly
);

/**
 * @openapi
 * /http/api/statistics/booksSoldMonthly:
 *   get:
 *     summary: Get statistics about books sold by each month on the system **ADMIN,MANAGER ONLY**
 *     tags:
 *      - Statistics
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
  '/booksSoldMonthly',
  authController.protect,
  authController.restrictTo('admin', 'manager'),
  statisticsController.booksSoldMonthly
);

/**
 * @openapi
 * /http/api/statistics/topFiveBooksSales:
 *   get:
 *     summary: Get data about top five books have highest sales on the system **MANAGER ONLY**
 *     tags:
 *      - Statistics
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
  '/topFiveBooksSales',
  authController.protect,
  authController.restrictTo('manager'),
  statisticsController.topFiveBooksSales
);

/**
 * @openapi
 * /http/api/statistics/topFiveBooksRevenue:
 *   get:
 *     summary: Get data about top five books have highest revenue on the system **MANAGER ONLY**
 *     tags:
 *      - Statistics
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
  '/topFiveBooksRevenue',
  authController.protect,
  authController.restrictTo('manager'),
  statisticsController.topFiveBooksRevenue
);

/**
 * @openapi
 * /http/api/statistics/totalRevenueMonthly:
 *   get:
 *     summary: Get statistics about total revenue by each month on the system **MANAGER ONLY**
 *     tags:
 *      - Statistics
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
  '/totalRevenueMonthly',
  authController.protect,
  authController.restrictTo('manager'),
  statisticsController.totalRevenueMonthly
);

module.exports = router;
