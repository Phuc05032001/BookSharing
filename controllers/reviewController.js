const Review = require('../models/reviewModel');
const Transaction = require('../models/transactionModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const totalData = new APIFeatures(
    Review.countDocuments(),
    req.query
  ).countFilter();
  const results = await totalData.query;
  const numOfPagesResults = results / req.query.limit;

  const data = new APIFeatures(
    Review.find().populate({
      path: 'book',
      select: 'bookTitle author -tags',
    }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const reviews = await data.query;

  res.status(200).json({
    status: 'success',
    results: results,
    resultsPage: Math.ceil(numOfPagesResults),
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const userTransaction = await Transaction.find({
    user: req.user._id,
    book: req.params.bookId,
  });
  if (userTransaction.length === 0) {
    return next(
      new AppError('You need to buy this book before review it!', 404)
    );
  }

  const userReview = await Review.find({
    user: req.user._id,
    book: req.params.bookId,
  });
  if (userReview.length !== 0) {
    return next(new AppError('You have already reviewed this book!', 409));
  }

  const newReview = await Review.create({
    ...req.body,
    user: req.user._id,
    book: req.params.bookId,
  });

  res.status(201).json({ status: 'success', data: newReview });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  if (
    !review ||
    (req.user.role === 'customer' &&
      req.user._id.equals(review.user._id) === false)
  )
    return next(new AppError('No review found with that ID', 404));

  if (
    req.user.role === 'manager' ||
    (req.user.role === 'customer' && req.user._id.equals(review.user._id))
  ) {
    await Review.findByIdAndDelete(req.params.id);
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});
