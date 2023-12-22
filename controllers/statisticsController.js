const User = require('../models/userModel');
const Book = require('../models/bookModel');
const Transaction = require('../models/transactionModel');
const catchAsync = require('../utils/catchAsync');

exports.accountsStatistics = catchAsync(async (req, res, next) => {
  const totalAccounts = await User.countDocuments();
  const totalManagers = await User.countDocuments({ role: 'manager' });
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  const totalActiveAccounts = await User.countDocuments({ active: true });

  res.status(200).json({
    status: 'success',
    data: {
      totalAccounts,
      totalManagers,
      totalCustomers,
      totalActiveAccounts,
    },
  });
});

exports.accountsCreatedYearly = catchAsync(async (req, res, next) => {
  const totalAccountsEachYear = await User.aggregate([
    { $project: { year: { $year: '$createdAt' } } },
    {
      $group: {
        _id: '$year',
        Count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        Year: '$_id',
        Count: 1,
      },
    },
    {
      $sort: {
        Year: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalAccountsEachYear,
    },
  });
});

exports.booksStatistics = catchAsync(async (req, res, next) => {
  const totalBooks = await Book.countDocuments();
  const totalPublished = await Book.countDocuments({
    approvingStatus: 'approved',
  });
  const totalUnpublished = await Book.countDocuments({
    approvingStatus: 'rejected',
  });

  const totalSold = await Transaction.aggregate([
    {
      $group: {
        _id: '$book',
        soldCount: { $sum: 1 },
      },
    },
    { $project: { soldCount: 1 } },
  ]);

  const Revenue = await Transaction.aggregate([
    {
      $group: {
        _id: null,
        average: { $avg: '$price' },
        total: { $sum: '$price' },
      },
    },
    { $project: { _id: 0, average: 1, total: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalBooks,
      totalPublished,
      totalUnpublished,
      totalSold: totalSold.length,
      Revenue,
    },
  });
});

exports.booksUploadedMonthly = catchAsync(async (req, res, next) => {
  const totalBooksEachMonth = await User.aggregate([
    { $project: { month: { $month: '$createdAt' } } },
    {
      $group: {
        _id: '$month',
        Count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        Month: '$_id',
        Count: 1,
      },
    },
    {
      $sort: {
        Month: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalBooksEachMonth,
    },
  });
});

exports.booksSoldMonthly = catchAsync(async (req, res, next) => {
  const totalSoldEachMonth = await Transaction.aggregate([
    { $project: { month: { $month: '$createdAt' } } },
    {
      $group: {
        _id: '$month',
        Count: {
          $sum: 1,
        },
      },
    },
    {
      $project: {
        _id: 0,
        Month: '$_id',
        Count: 1,
      },
    },
    {
      $sort: {
        Month: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalSoldEachMonth,
    },
  });
});

exports.topFiveBooksSales = catchAsync(async (req, res, next) => {
  const topFiveBooksSales = await Transaction.aggregate([
    {
      $group: {
        _id: '$book',
        Count: {
          $sum: 1,
        },
      },
    },
    { $sort: { Count: -1 } },
    { $limit: 5 },
    { $project: { _id: 1, Count: 1 } },
  ]);

  await Book.populate(topFiveBooksSales, {
    path: '_id',
    select: 'bookTitle author -tags',
  });

  res.status(200).json({
    status: 'success',
    data: {
      topFiveBooksSales,
    },
  });
});

exports.topFiveBooksRevenue = catchAsync(async (req, res, next) => {
  const topFiveBooksRevenue = await Transaction.aggregate([
    {
      $group: {
        _id: '$book',
        Count: {
          $sum: '$price',
        },
      },
    },
    { $sort: { Count: -1 } },
    { $limit: 5 },
    { $project: { _id: 1, Count: 1 } },
  ]);

  await Book.populate(topFiveBooksRevenue, {
    path: '_id',
    select: 'bookTitle author -tags',
  });

  res.status(200).json({
    status: 'success',
    data: {
      topFiveBooksRevenue,
    },
  });
});

exports.totalRevenueMonthly = catchAsync(async (req, res, next) => {
  const totalRevenueMonthly = await Transaction.aggregate([
    {
      $group: {
        _id: { $month: '$createdAt' },
        Count: {
          $sum: '$price',
        },
      },
    },
    {
      $project: {
        _id: 0,
        Month: '$_id',
        Count: 1,
      },
    },
    {
      $sort: {
        Month: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalRevenueMonthly,
    },
  });
});
