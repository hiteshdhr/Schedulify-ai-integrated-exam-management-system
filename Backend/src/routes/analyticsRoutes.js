const express = require('express');
const {
  getMyPerformance,
  getSystemPerformance,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/my-performance', protect, getMyPerformance);
router.get(
  '/system-performance',
  protect,
  authorize('admin'),
  getSystemPerformance
);

module.exports = router;