const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
    uppercase: true,
    trim: true,
  },
  ownerId: {
    type: Number,
    required: true,
  },
  members: {
    type: [Number],
    default: [],
  },
  name: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Family', familySchema);
