const Exam = require('../models/Exam');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Search exams, tasks, and users
// @route   GET /api/search?q=...
// @access  Private
exports.searchAll = async (req, res) => {
  try {
    const { q } = req.query;
    const user = req.user;

    if (!q) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const regex = new RegExp(q, 'i'); // Case-insensitive regex

    // --- Start Real Database Queries ---

    // 1. Search Exams
    let examQuery = { subject: regex };
    if (user.role === 'student') {
      examQuery.students = user.id;
    } else if (user.role === 'instructor') {
      examQuery.instructor = user._id;
    }
    const exams = await Exam.find(examQuery)
      .limit(5)
      .populate('instructor', 'name');

    // 2. Search Tasks (Users only see their own)
    const tasks = await Task.find({ 
        user: user._id, 
        title: regex 
      })
      .limit(5);

    // 3. Search Users (Only Admins can search)
    let users = [];
    if (user.role === 'admin') {
      users = await User.find({
        $or: [
            { name: regex }, 
            { email: regex }
        ]
      })
      .limit(5)
      .select('name email role');
    }
    // --- End Real Database Queries ---

    res.status(200).json({
      success: true,
      data: {
        exams,
        tasks,
        users,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};