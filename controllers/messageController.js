const Message = require('../models/messageModel');
const Conversation = require('../models/conversationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.newMessageConversation = catchAsync(async (req, res, next) => {
  const conversation = await Conversation.find({
    _id: req.body.conversationId,
  });
  if (conversation.length === 0)
    return next(new AppError(`Conversation does not exist!`, 404));

  const newMessage = await Message.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      newMessage,
    },
  });
});

exports.getMessageConversation = catchAsync(async (req, res, next) => {
  const messages = await Message.find({
    conversationId: req.params.conversationId,
  });

  if (messages.length === 0)
    return next(new AppError(`Conversation does not exist!`, 404));

  res.status(200).json({
    status: 'success',
    data: {
      messages,
    },
  });
});
