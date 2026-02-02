const User = require('../models/User');


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getUsersByRole = async (req, res) => {
  try {
    const users = await User.find({ role: req.params.role }).select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { name, email, role }, {
      new: true,
      runValidators: true,
    }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMyPreferences = async (req, res) => {
  try {
    const { studyLength, breakLength, preferredTime } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { 'preferences.studyLength': studyLength, 'preferences.breakLength': breakLength, 'preferences.preferredTime': preferredTime } },
      { new: true, runValidators: true }
    ).select('-password');
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.updateMyAcademicDetails = async (req, res) => {
  try {
    const { institution, branch, semester } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { 'academicDetails.institution': institution, 'academicDetails.branch': branch, 'academicDetails.semester': semester } },
      { new: true, runValidators: true }
    ).select('-password');
    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.saveMySchedule = async (req, res) => {
  try {
    const scheduleData = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { studySchedule: scheduleData } },
      { new: true }
    ).select('-password');
    res.status(200).json({ success: true, message: 'Schedule saved', data: updatedUser.studySchedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getMySchedule = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('studySchedule');
    res.status(200).json({ success: true, data: user.studySchedule || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.updateNotificationSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (req.body.email !== undefined) user.notificationSettings.email = req.body.email;
    if (req.body.push !== undefined) user.notificationSettings.push = req.body.push;
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};