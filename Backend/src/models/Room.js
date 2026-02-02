const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { // e.g., "Hall A-101"
    type: String,
    required: [true, 'Please provide a room name'],
    trim: true,
    unique: true,
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide room capacity'],
  },
  // For the "fitness score"
  usageCount: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Room', roomSchema);