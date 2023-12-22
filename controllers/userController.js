const multer = require('multer');
const { photoToCloudinary } = require('../utils/cloudinary');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

//photo buffer
const multerFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jfif' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/pjpeg' ||
    file.mimetype === 'image/pjp'
  ) {
    cb(null, true);
  } else {
    cb(
      new AppError('Not an valid image! Please upload only images.', 400),
      false
    );
  }
};

exports.handlingUploadFile = multer({
  storage: multer.memoryStorage(),
  fileFilter: multerFilter,
}).single('photo');

//upload photos
exports.uploadUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}`;

  const uploadResult = await photoToCloudinary(
    req.file.buffer,
    req.file.filename
  );
  req.profileImageUrl = uploadResult.url;

  next();
});

//user data
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMyInfo = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  if (req.body.email) {
    return next(
      new AppError(
        'This route is not for email updates. Please use /updateMyEmail.',
        400
      )
    );
  }

  const filteredBody = filterObj(
    req.body,
    'fullName',
    'gender',
    'dateOfBirth',
    'phoneNumber',
    'country',
    'address',
    'city',
    'zipCode',
    'specialization'
  );
  if (req.file) filteredBody.photo = req.profileImageUrl;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

//deactivate account
exports.deactivateAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: 'none',
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', 'loggedout', cookieOptions);

  res.status(200).json({
    status: 'success',
    message: 'User account is deactivated successfully!',
  });
});

//all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  //get total filter
  const totalData = new APIFeatures(
    User.countDocuments(),
    req.query
  ).countFilter();
  const results = await totalData.query;
  const numOfPagesResults = results / req.query.limit;

  //get filter data
  const data = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  let users = await data.query;
  users = users.filter((el) => el.role !== 'admin');

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: results,
    resultsPage: Math.ceil(numOfPagesResults),
    data: {
      users,
    },
  });
});

//get one user
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user || user.role === 'admin')
    return next(new AppError('No user found with that ID', 404));

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

//admin disable or reactivate account
exports.setAccountStatus = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, {
    active: req.body.active,
  });

  if (!user) return next(new AppError('No user found with that ID', 404));

  res.status(200).json({
    status: 'success',
    message: 'Account status changed successfully!',
  });
});

exports.setAccountRole = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, {
    role: req.body.role,
  });

  if (!user) return next(new AppError('No user found with that ID', 404));

  res.status(200).json({
    status: 'success',
    message: 'Account role changed successfully!',
  });
});
