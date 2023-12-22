const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: String,
  sender: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
