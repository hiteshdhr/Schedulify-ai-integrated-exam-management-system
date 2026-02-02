const express = require('express');
const { runScheduler } = require('../controllers/schedulerController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();


router.post('/run', protect, authorize('admin'), runScheduler);

module.exports = router;