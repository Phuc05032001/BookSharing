const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  members: {
    type: Array,
  },
  createdAt: { type: Date, default: Date.now },
});

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
