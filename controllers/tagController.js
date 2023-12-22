const mongoose = require('mongoose');
const Tag = require('../models/tagModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const Book = require('../models/bookModel');

exports.createTag = catchAsync(async (req, res, next) => {
  const tag = await Tag.findOne({
    name: req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1),
  });
  if (tag) return next(new AppError('Tag is already exists!', 409));

  const newTag = await Tag.create({
    name: req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1),
    group: req.body.group,
    description:
      req.body.description.charAt(0).toUpperCase() +
      req.body.description.slice(1),
  });

  res.status(201).json({
    status: 'success',
    data: {
      tag: newTag,
    },
  });
});

exports.getAllTags = catchAsync(async (req, res, next) => {
  const totalData = new APIFeatures(
    Tag.countDocuments(),
    req.query
  ).countFilter();
  const results = await totalData.query;
  const numOfPagesResults = results / req.query.limit;

  //get filter data
  const data = new APIFeatures(Tag.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const tags = await data.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: results,
    resultsPage: Math.ceil(numOfPagesResults),
    data: {
      tags,
    },
  });
});

exports.getTag = catchAsync(async (req, res, next) => {
  const tag = await Tag.findById(req.params.id);

  if (!tag) {
    return next(new AppError('No tag found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tag,
    },
  });
});

exports.updateTag = catchAsync(async (req, res, next) => {
  const tag = await Tag.findOne({
    name: req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1),
  });
  if (tag)
    return next(
      new AppError('That tag name is already used by another tag', 409)
    );

  const tagUpdated = await Tag.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name.charAt(0).toUpperCase() + req.body.name.slice(1),
      group: req.body.group,
      description:
        req.body.description.charAt(0).toUpperCase() +
        req.body.description.slice(1),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!tagUpdated) {
    return next(new AppError('No tag found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tagUpdated,
    },
  });
});

exports.deleteTag = catchAsync(async (req, res, next) => {
  const check = await Book.find({
    tags: {
      $in: [mongoose.Types.ObjectId(req.params.id)],
    },
  });
  if (check.length !== 0) {
    return next(
      new AppError(`Tag has been assigned to book can't be deleted`, 409)
    );
  }

  const tag = await Tag.findByIdAndDelete(req.params.id);
  if (!tag) {
    return next(new AppError('No tag found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
