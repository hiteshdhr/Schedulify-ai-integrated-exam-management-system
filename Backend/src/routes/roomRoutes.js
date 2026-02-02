const express = require('express');
const { suggestRooms } = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/suggest', protect, authorize('admin'), suggestRooms);

module.exports = router;