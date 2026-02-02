const Exam = require('../models/Exam');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { notifyStudents, notifyInstructor } = require('../utils/notificationManager');
const { spawn } = require('child_process'); 
const fs = require('fs'); 
const path = require('path'); 

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
exports.getAllExams = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = Exam.find();
    } 
    else if (req.user.role === 'instructor') {
      query = Exam.find({ instructor: req.user.id });
    }
    else {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const exams = await query
      .populate('instructor', 'name email')
      .populate('students', 'name email')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get exams for logged-in user (student or instructor)
// @route   GET /api/exams/my-exams
// @access  Private (Student/Instructor)
exports.getMyExams = async (req, res) => {
  try {
    let exams = [];
    if (req.user.role === 'student') {
      exams = await Exam.find({ students: req.user._id })
        .populate('instructor', 'name')
        .sort({ date: 1 });
    } else if (req.user.role === 'instructor') {
      exams = await Exam.find({ instructor: req.user._id })
        .populate('students', 'name')
        .sort({ date: 1 });
    }

    res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('instructor', 'name email')
      .populate('students', 'name email');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.createExam = async (req, res) => {
  try {
    const { 
      subject, 
      date, 
      startTime, 
      endTime, 
      roomNumber, 
      instructor, 
      capacity, 
      description,
      targetBranch, 
      targetSemester 
    } = req.body;

    const instructorExists = await User.findOne({ _id: instructor, role: 'instructor' });

    if (!instructorExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid instructor ID or user is not an instructor',
      });
    }

    let studentIds = [];
    if (targetBranch && targetSemester) {
     
      const branches = targetBranch.split(',').map(b => new RegExp(`^${b.trim()}$`, 'i'));
      
      const studentsToNotify = await User.find({
        role: 'student',
        'academicDetails.branch': { $in: branches }, 
        'academicDetails.semester': targetSemester,
      });
      
      studentIds = studentsToNotify.map(s => s._id);
    }

    const exam = await Exam.create({
      subject,
      date,
      startTime,
      endTime,
      roomNumber,
      instructor,
      students: studentIds,
      capacity,
      description,
      targetBranch, 
      targetSemester 
    });

    const populatedExam = await Exam.findById(exam._id)
      .populate('instructor', 'name email')
      .populate('students', 'name email');

    if (populatedExam.instructor) {
      await notifyInstructor(populatedExam.instructor._id, populatedExam, 'EXAM_ASSIGNED_INSTRUCTOR');
    }

    if (populatedExam.students.length > 0) {
      await notifyStudents(studentIds, populatedExam, 'EXAM_ADDED');
    }

    res.status(201).json({
      success: true,
      data: populatedExam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const { 
      subject, 
      date, 
      startTime, 
      endTime, 
      roomNumber, 
      instructor, 
      capacity, 
      description,
      targetBranch, 
      targetSemester 
    } = req.body;

    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }
    
    if (instructor) {
      const instructorExists = await User.findOne({ _id: instructor, role: 'instructor' });
      if (!instructorExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid instructor ID or user is not an instructor',
        });
      }
    }

    let studentIds = exam.students; 
   
    if (targetBranch || targetSemester) {
      const newBranch = targetBranch || exam.targetBranch;
      const newSemester = targetSemester || exam.targetSemester;
      
      if (newBranch && newSemester) {
       
        const branches = newBranch.split(',').map(b => new RegExp(`^${b.trim()}$`, 'i'));

        const studentsToNotify = await User.find({
          role: 'student',
          'academicDetails.branch': { $in: branches }, 
          'academicDetails.semester': newSemester,
        });
        studentIds = studentsToNotify.map(s => s._id);
      }
    }

    if (subject) exam.subject = subject;
    if (date) exam.date = date;
    if (startTime) exam.startTime = startTime;
    if (endTime) exam.endTime = endTime;
    if (roomNumber) exam.roomNumber = roomNumber;
    if (instructor) exam.instructor = instructor;
    exam.students = studentIds; 
    if (capacity) exam.capacity = capacity;
    if (description !== undefined) exam.description = description;
    if (targetBranch) exam.targetBranch = targetBranch;
    if (targetSemester) exam.targetSemester = targetSemester;

    await exam.save();
    
    if (exam.instructor) {
        await notifyInstructor(exam.instructor, exam, 'EXAM_ASSIGNED_INSTRUCTOR');
    }

    if (exam.students.length > 0) {
      await notifyStudents(exam.students, exam, 'EXAM_UPDATED');
    }

    const updatedExam = await Exam.findById(exam._id)
      .populate('instructor', 'name email')
      .populate('students', 'name email');

    res.status(200).json({
      success: true,
      data: updatedExam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete an exam
// @route   DELETE /api/exams/:id
// @access  Admin
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    // --- FIX: Notify users before deletion ---
    const userIds = [...exam.students, exam.instructor];
    const message = `🚨 Alert: The exam "${exam.subject}" scheduled for ${new Date(exam.date).toLocaleDateString()} has been CANCELLED.`;

    for (const userId of userIds) {
       if (userId) {
         await Notification.create({ 
           user: userId, 
           message: message, 
           link: '/app/dashboard',
           read: false
         });
       }
    }

    await exam.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Exam deleted and students notified',
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Add a student to an exam
// @route   POST /api/exams/:id/add-student
// @access  Admin
exports.addStudentToExam = async (req, res) => {
  res.status(400).json({ success: false, message: 'This route is deprecated. Use targetBranch/targetSemester on the exam.' });
};

// @desc    Remove a student from an exam
// @route   POST /api/exams/:id/remove-student
// @access  Admin
exports.removeStudentFromExam = async (req, res) => {
  try {
    const { studentId } = req.body;
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    exam.students = exam.students.filter(
      (id) => id.toString() !== studentId
    );

    await exam.save();
    
    res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Parse an uploaded syllabus PDF
// @route   POST /api/exams/parse-syllabus
// @access  Admin
exports.parseSyllabus = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    // Placeholder - Implement syllabus parsing logic
    res.status(200).json({ 
      success: true, 
      message: 'Syllabus uploaded, parsing not yet implemented.',
      file: req.file 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Parse an uploaded datesheet PDF
// @route   POST /api/exams/parse-datesheet
// @access  Admin
exports.parseDatesheet = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const scriptPath = path.join(process.cwd(), 'src', 'routes', 'agents', 'pdf_exam_agent.py');

    if (!fs.existsSync(scriptPath)) {
      return res.status(500).json({ success: false, message: 'Python agent script not found.' });
    }

    const pyProcess = spawn('python', [scriptPath, filePath]);

    let results = '';
    let errorData = '';

    pyProcess.stdout.on('data', (data) => {
      results += data.toString();
    });

    pyProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pyProcess.on('close', (code) => {
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete temp file:", err.message);
      });

      if (code !== 0) {
        console.error(`Python script error: ${errorData}`);
        return res.status(500).json({
          success: false,
          message: 'Failed to parse PDF.',
          error: errorData,
        });
      }

      try {
        const jsonData = JSON.parse(results);
        res.status(200).json({
          success: true,
          data: jsonData,
        });
      } catch (e) {
        res.status(500).json({
          success: false,
          message: 'Failed to parse script output.',
          error: results,
        });
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};