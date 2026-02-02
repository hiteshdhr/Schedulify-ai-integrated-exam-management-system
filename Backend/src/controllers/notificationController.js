const Notification = require('../models/Notification');

// @desc    Get my unread notifications
// @route   GET /api/notifications/my
// @access  Private
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      // --- FIX: Use req.user._id (the ObjectId) instead of req.user.id (the string)
      user: req.user._id, 
      read: false
    }).sort({ createdAt: -1 }).limit(10);
    
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    // --- FIX: Corrected 5.00 to 500
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Ensure the user owns this notification
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Mark as read and save
    notification.read = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};