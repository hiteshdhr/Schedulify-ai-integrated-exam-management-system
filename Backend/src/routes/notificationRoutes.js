const express = require('express');
const { getMyNotifications, markNotificationAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/my', protect, getMyNotifications);

router.put('/read/:id', protect, markNotificationAsRead);

module.exports = router;