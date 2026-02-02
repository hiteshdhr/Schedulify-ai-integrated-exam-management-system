const express = require('express');
const { searchNotes } = require('../controllers/noteController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All note routes are protected
router.use(protect);

router.get('/search', authorize('student'), searchNotes);

// You can add more routes here later for Admins to *create* notes

module.exports = router;