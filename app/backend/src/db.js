const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI не задан в .env');
    }

    await mongoose.connect(uri);
    console.log('[DB] MongoDB подключена успешно');
  } catch (err) {
    console.error('[DB] Ошибка подключения:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
