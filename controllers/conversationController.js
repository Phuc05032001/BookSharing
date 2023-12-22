const Conversation = require('../models/conversationModel');
const User = require('../models/userModel');
const Message = require('../models/messageModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createConversation = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.body.senderId);
  if (!user)
    return next(new AppError(`User with provided id is not found!`, 404));

  const conversations = await Conversation.find({
    members: { $in: [req.body.senderId] },
  });
  if (conversations.length > 0)
    return next(
      new AppError(`This customer user already have conversation!`, 409)
    );

  const managerUser = await User.find({ role: 'manager' });
  const randomManager = Math.floor(Math.random() * managerUser.length);
  const userManagerId = managerUser[randomManager]._id;
  const newConversation = await Conversation.create({
    members: [req.body.senderId, userManagerId.toString()],
  });

  await Message.create({
    conversationId: newConversation._id.toString(),
    sender: userManagerId.toString(),
    text: 'Hi! If you have any problems or require to change something! Please provide details information and supporter will reply as soon as possible 👍',
  });

  res.status(201).json({
    status: 'success',
    data: {
      newConversation,
    },
  });
});

exports.getConversation = catchAsync(async (req, res, next) => {
  const conversations = await Conversation.find({
    members: { $in: [req.params.userId] },
  });

  if (conversations.length === 0)
    return next(new AppError(`This user doesn't have any conversations!`, 404));

  res.status(200).json({
    status: 'success',
    data: {
      conversations,
    },
  });
});
