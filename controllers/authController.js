const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const createToken = (payload) => {
  const token = jwt.sign({ id: payload }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

const createLogoutCookie = (res) => {
  const cookieOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  };
  res.cookie('jwt', 'logged out', cookieOptions);
};

const createSendVerificationRequest = async (req, res, next, user) => {
  const verifyToken = user.createEmailVerificationToken();

  await user.save({ validateBeforeSave: false });

  /* istanbul ignore next */
  try {
    const verifyURL = `${req.protocol}://${req.get(
      'host'
    )}/http/api/users/emailVerify/${verifyToken}`;

    await new Email(user, verifyURL).sendVerificationEmail();

    res.status(200).json({
      status: 'success',
      message: 'Verification email have been sent to your email address!',
    });
  } catch (err) {
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    /* istanbul ignore next */
    return next(
      new AppError(
        'There was an error when sending the verification email. Try again later!'
      ),
      500
    );
  }
};

//FUNCTIONALITY
exports.register = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) return next(new AppError('User is already registered!', 409));

  const newUser = await User.create({
    fullName: req.body.fullName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    address: req.body.address,
    phoneNumber: req.body.phoneNumber,
    zipCode: req.body.zipCode,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    state: req.body.state,
    city: req.body.city,
    region: req.body.region,
    role: 'customer',
    active: true,
    isConfirmed: false,
    socialProvider: undefined,
    socialId: undefined,
  });

  createSendVerificationRequest(req, res, next, newUser);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('Please provide your email and password!', 400));

  const user = await User.findOne({ email }).select('+password');

  if (
    !user ||
    !(await user.correctPassword(password, user.password)) ||
    user.isConfirmed === false
  ) {
    return next(
      new AppError(
        `Incorrect Email, Password or Your Account haven't been Confirmed!`,
        401
      )
    );
  }

  if (user.active === false) {
    return next(
      new AppError(
        'Your account have been deactivated! please sent an email to support@BookSharing.io for reactivate your account',
        403
      )
    );
  }

  const token = createToken(user._id);

  //sendCookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  };
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  user.createdAt = undefined;
  user.__v = undefined;

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});

//protected routes
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  /* istanbul ignore next */
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in or cookies has been disabled. Please try to login again!',
        401
      )
    );
  }

  //verify token
  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  //Check user
  const currentUser = await User.findById(decoded.id);
  /* istanbul ignore next */
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  /* istanbul ignore next */
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  req.user = currentUser;
  next();
});

//logout session cookie
exports.logoutSession = (req, res) => {
  createLogoutCookie(res);
  res.status(200).json({ status: 'success', message: 'You have logged out!' });
};

//role restricted
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };

//forgot Password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user || user.socialProvider) {
    return next(
      new AppError(
        'Password reset token have been sent to your email address!',
        404
      )
    );
  }

  // Generate the random reset token and send it to the user email
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  let resetURL = '';
  resetURL = `http://localhost:3000/reset-password/${resetToken}`;

  /* istanbul ignore next */
  try {
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Password reset token have been sent to your email address!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error when sending the email. Try again later!'
      ),
      500
    );
  }
});

//reset password
/* istanbul ignore next */
exports.resetPassword = catchAsync(async (req, res, next) => {
  //Encrypt, get user
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  console.log(user);

  // Check reset token, set new password
  if (!user) {
    return next(
      new AppError('Password reset token is invalid or has expired', 400)
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message:
      'Your account password has been reset! Please login with your new password',
  });
});

//send email verification
exports.sendEmailVerification = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  //console.log(user);
  if (!user || user.socialProvider || user.isConfirmed) {
    return next(
      new AppError(
        'Verification email have been sent to your email address!',
        404
      )
    );
  }

  if (user && !user.isConfirmed) {
    createSendVerificationRequest(req, res, next, user);
  }
});

//email verification
/* istanbul ignore next */
exports.emailVerification = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.verifyToken)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
  });

  if (!user) {
    return next(new AppError('Verification Token is invalid!', 400));
  }
  user.isConfirmed = true;
  user.emailVerificationToken = undefined;
  await user.save({ validateBeforeSave: false });

  //ENVIRONMENT
  let redirectUrl = '';
  if (process.env.NODE_ENV === 'development') {
    redirectUrl = 'http://localhost:3000/email-verification/success';
  } else if (process.env.NODE_ENV === 'production') {
    redirectUrl = 'http://localhost:3000/email-verification/success';
  }

  res.redirect(301, redirectUrl);
});

//update user password
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');

  /* istanbul ignore next */
  if (user.socialProvider) {
    return next(
      new AppError(
        `You can't update your account password when login with ${user.socialProvider}`,
        401
      )
    );
  }

  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(
      new AppError('Your current password is wrong!. Please try again', 401)
    );
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createLogoutCookie(res);

  res.status(200).json({
    success: true,
    message: 'Your account password was updated! Please log in again',
  });
});

//googleLogin
/* istanbul ignore next */
exports.googleLoginAccount = catchAsync(async (req, res, next) => {
  //decode credential
  const base64Url = req.body.credential.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const buff = Buffer.from(base64, 'base64');
  const payloadinit = buff.toString('ascii');
  const payload = JSON.parse(payloadinit);

  //set userData
  const userGoogleId = payload.sub;
  const userEmail = payload.email;
  const userDisplayName = payload.name;

  //check user for create account and login
  const isExistingUser = await User.findOne({ email: userEmail });

  if (!isExistingUser) {
    const user = new User({
      socialId: userGoogleId,
      email: userEmail,
      fullName: userDisplayName,
      socialProvider: 'google',
      isConfirmed: true,
    });
    await user.save({ validateBeforeSave: false });
    req.user = user;
    next();
  }

  if (isExistingUser) {
    req.user = isExistingUser;
    next();
  }
});

/* istanbul ignore next */
exports.googleLoginSession = catchAsync(async (req, res, next) => {
  const { user } = req;
  const token = createToken(user._id);

  //sendCookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  };
  res.cookie('jwt', token, cookieOptions);

  res.status(200).json({
    success: true,
    token,
    data: {
      user,
    },
  });
});

//update user email
exports.UpdateEmail = catchAsync(async (req, res, next) => {
  /* istanbul ignore next */
  if (req.user.socialProvider) {
    return next(
      new AppError(
        `You can't update your account email when login with ${req.user.socialProvider}`,
        401
      )
    );
  }

  const existUser = await User.findOne({ email: req.body.email });
  if (existUser && existUser.email === req.body.email) {
    return next(
      new AppError(
        'That email have been already used by another user or duplicate with the old one in your account',
        409
      )
    );
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      email: req.body.email,
      isConfirmed: false,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  createLogoutCookie(res);
  createSendVerificationRequest(req, res, next, user);
});
