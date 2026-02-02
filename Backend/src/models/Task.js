const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Please provide a due date'],
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    studyHours: { // --- I'VE ADDED THIS ---
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);