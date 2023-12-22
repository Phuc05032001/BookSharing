const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tag Name is required'],
    trim: true,
    maxLength: [30, 'Tag Name must have less of equal than 30 characters'],
  },
  group: {
    type: String,
    required: [true, 'Tag Group is required'],
    enum: {
      values: ['format', 'genre', 'theme'],
      message: 'Tag Group should defined by (format, genre, theme)',
    },
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxLength: [100, 'Description must have less of equal than 100 characters'],
  },
});

const Tag = mongoose.model('Tag', tagSchema);
module.exports = Tag;
