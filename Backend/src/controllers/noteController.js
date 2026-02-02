const Note = require('../models/Note');

// @desc    Search for notes (used by agent)
// @route   GET /api/notes/search?q=...
// @access  Private (Student)
exports.searchNotes = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const notes = await Note.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } } // Sort by relevance
    ).sort({ score: { $meta: 'textScore' } }).limit(5);

    res.status(200).json({ success: true, data: notes });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};