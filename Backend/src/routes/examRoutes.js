const express = require('express');
const {
  createExam,
  getAllExams,
  getExam,
  getMyExams,
  updateExam,
  deleteExam,
  addStudentToExam,
  removeStudentFromExam,
  parseSyllabus,
  parseDatesheet, // <--- ADD THIS
} = require('../controllers/examController');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
// --- ADD THIS ---
const upload = require('../middleware/upload');
// --- END OF ADDITION ---

const router = express.Router();

router.get('/my-exams', protect, getMyExams);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('subject').notEmpty().withMessage('Subject is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required'),
    body('roomNumber').notEmpty().withMessage('Room number is required'),
    body('instructor').notEmpty().withMessage('Instructor is required'),
  ],
  createExam
);

router.get('/', protect, getAllExams);

router.get('/:id', protect, getExam);

router.put('/:id', protect, authorize('admin'), updateExam);

router.delete('/:id', protect, authorize('admin'), deleteExam);

router.post('/:id/add-student', protect, authorize('admin'), addStudentToExam);

router.post('/:id/remove-student', protect, authorize('admin'), removeStudentFromExam);

router.post(
  '/parse-syllabus',
  protect,
  authorize('admin'),
  upload.single('syllabus'), // 'syllabus' must match the form field name
  parseSyllabus
);

// --- ADD THIS NEW ROUTE ---
router.post(
  '/parse-datesheet',
  protect,
  authorize('admin'),
  upload.single('datesheet'), // 'datesheet' must match the form field name
  parseDatesheet
);
// --- END OF ADDITION ---

module.exports = router;