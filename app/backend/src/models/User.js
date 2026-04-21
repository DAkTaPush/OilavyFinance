const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    default: null,
  },
  firstName: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    enum: ['ru', 'uz'],
    default: 'ru',
  },
  fullName: {
    type: String,
    default: null,
  },
  currency: {
    type: String,
    enum: ['sum', 'rub'],
    default: 'sum',
  },
  onboardingStep: {
    type: String,
    default: null,
  },
  tempCardNumber: {
    type: String,
    default: null,
  },
  tempCardCurrency: {
    type: String,
    default: null,
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
