const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Please provide an exam date'],
    },
    startTime: {
      type: String,
      required: [true, 'Please provide a start time'],
    },
    endTime: {
      type: String,
      required: [true, 'Please provide an end time'],
    },
    roomNumber: {
      type: String,
      required: [true, 'Please provide a room number'],
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please assign an instructor'],
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    capacity: {
      type: Number,
      default: 30,
    },
    description: {
      type: String,
      trim: true,
    },
    
    // --- ADD THIS NEW SECTION ---
    // Target criteria for notifications
    targetBranch: {
      type: String,
      trim: true,
    },
    targetSemester: {
      type: Number,
    },
    // --- END OF ADDITION ---
  },
  {
    timestamps: true,
  }
);

examSchema.index({ date: 1, roomNumber: 1 });
examSchema.index({ instructor: 1 });
examSchema.index({ students: 1 });

module.exports = mongoose.model('Exam', examSchema);