const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
    index: true,
  },
  cardNumber: {
    type: String,
    required: true,
  },
  holderName: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    enum: ['sum', 'rub'],
    default: 'sum',
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Card', cardSchema);
