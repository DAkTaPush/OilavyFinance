const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: true,
  },
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    default: null,
  },
  type: {
    type: String,
    enum: ['expense', 'income', 'transfer'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    default: 'другое',
  },
  description: {
    type: String,
    default: '',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Индексы для быстрых запросов по семье и пользователю
transactionSchema.index({ familyId: 1, date: -1 });
transactionSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
