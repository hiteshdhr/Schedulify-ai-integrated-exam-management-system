const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  keywords: { // For keyword matching
    type: [String],
    required: true,
  },
  content: { // The summarized notes
    type: String,
    required: true,
  },
}, { timestamps: true });

// We'll use MongoDB's built-in text search.
// This is 100% local and very powerful.
noteSchema.index({
  topic: 'text',
  keywords: 'text',
});

module.exports = mongoose.model('Note', noteSchema);