const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { // The user to notify
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  link: { // e.g., /app/exams
    type: String,
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);