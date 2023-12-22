const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Book = require('../models/bookModel');
const Transaction = require('../models/transactionModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const book = await Book.findById(req.params.bookId);
  if (!book) {
    return next(new AppError('No book found with that ID', 404));
  }

  //2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get(
      'host'
    )}/http/api/transactions/checkoutSuccess/?book=${book._id}&user=${
      req.user._id
    }&price=${book.price}`,
    cancel_url: `${process.env.CLIENT_URL_DEVELOPMENT}/book/${book._id}`,
    customer_email: req.user.email,
    client_reference_id: req.params.bookId,
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: book.price * 100, //*amount is calculated by cents (1$ = 100 cents)
          product_data: {
            name: book.bookTitle,
            description: book.summary,
            images: [book.bookCover],
          },
        },
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});

/* istanbul ignore next */
exports.createTransactionCheckout = catchAsync(async (req, res, next) => {
  const { book, user, price } = req.query;

  if (!book || !user || !price) return next();
  await Transaction.create({ book, user, price });

  res.redirect(`${process.env.CLIENT_URL_DEVELOPMENT}/book/${book}`);
});

exports.getAllTransactions = catchAsync(async (req, res, next) => {
  const totalData = new APIFeatures(
    Transaction.countDocuments(),
    req.query
  ).countFilter();
  const results = await totalData.query;
  const numOfPagesResults = results / req.query.limit;

  const data = new APIFeatures(Transaction.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const transactions = await data.query;

  res.status(200).json({
    status: 'success',
    results: results,
    resultsPage: Math.ceil(numOfPagesResults),
    data: {
      transactions,
    },
  });
});

exports.deleteTransaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.findByIdAndDelete(req.params.id);
  if (!transaction) {
    return next(new AppError('No transaction found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getTransactionOfBook = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.find({
    book: req.params.bookId,
    user: req.user._id,
  });

  res.status(200).json({
    status: 'success',
    data: { transaction },
  });
});

exports.getUserSuccessTransaction = catchAsync(async (req, res, next) => {
  const transactionTotal = await Transaction.countDocuments({
    user: req.user._id,
  });
  const numberOfTransaction = transactionTotal / req.query.limit;

  const data = new APIFeatures(
    Transaction.find({ user: req.user._id }),
    req.query
  )
    .sort()
    .paginate();
  const transaction = await data.query;

  res.status(200).json({
    status: 'success',
    transactionTotal,
    totalPage: Math.ceil(numberOfTransaction),
    data: { transaction },
  });
});
