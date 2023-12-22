const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.ObjectId,
    ref: 'Book',
    required: [true, 'Transaction must have at least one Book!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Transaction must be perform by the user'],
  },
  price: {
    type: Number,
    required: [true, 'Transaction must have a price.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

//query middleware
transactionSchema.pre(/^find/, function (next) {
  this.where({})
    .populate({ path: 'user', select: 'id fullName email photo' })
    .populate({
      path: 'book',
      select: 'bookTitle summary price bookCover -tags',
    });
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
