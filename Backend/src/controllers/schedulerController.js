const User = require('../models/User');
const Room = require('../models/Room');
const Exam = require('../models/Exam');
const { notifyStudents, notifyInstructor } = require('../utils/notificationManager');
const axios = require('axios');

/**
 * Helper function to find all courses a student is enrolled in
 */
const getCoursesForStudent = (student, allExams) => {
  const studentCourses = [];
  if (student.academicDetails && student.academicDetails.branch && student.academicDetails.semester) {
    for (const exam of allExams) {
      // Logic for matching student to exam based on branch/semester
      // We need to handle comma-separated branches here too for the solver to work best
      const targetBranches = exam.targetBranch 
        ? exam.targetBranch.split(',').map(b => b.trim().toLowerCase()) 
        : [];
        
      const studentBranch = student.academicDetails.branch.toLowerCase();

      if (targetBranches.includes(studentBranch) &&
          exam.targetSemester === student.academicDetails.semester) {
        studentCourses.push(exam.course_id);
      }
    }
  }
  return studentCourses;
};


// @desc    Run the automated scheduler
// @route   POST /api/scheduler/run
// @access  Admin
exports.runScheduler = async (req, res) => {
  try {
    // 1. Get the list of exams-to-be-scheduled from the admin
    const { examsToSchedule, timeslots } = req.body;
    if (!examsToSchedule || !timeslots || !examsToSchedule.length || !timeslots.length) {
      return res.status(400).json({ success: false, message: 'Missing exams or timeslots payload.' });
    }

    // 2. Fetch all required data from MongoDB
    const students = await User.find({ role: 'student' }).select('academicDetails');
    const rooms = await Room.find().select('name capacity');
    const instructors = await User.find({ role: 'instructor' }).select('_id name');

    // 3. Format all data for the Python solver
    const solverPayload = {
      exams: examsToSchedule, 
      rooms: rooms.map(r => ({ room_id: r.name, capacity: r.capacity })),
      instructors: instructors.map(i => ({ instructor_id: i._id.toString(), name: i.name })),
      timeslots: timeslots, 
      students: students.map(s => ({
        student_id: s._id.toString(),
        course_ids: getCoursesForStudent(s, examsToSchedule)
      })),
    };

    // 4. Call the Python Solver Service
    let solverResponse;
    try {
      solverResponse = await axios.post('http://localhost:5001/generate_schedule', solverPayload, {
        timeout: 60000 
      });
    } catch (error) {
      console.error("Solver service error:", error.message);
      const errMessage = error.response?.data?.message || error.message;
      throw new Error(`Solver service failed: ${errMessage}`);
    }

    if (!solverResponse.data || !solverResponse.data.success) {
      throw new Error(solverResponse.data.message || 'Failed to generate schedule');
    }

    const generatedSchedule = solverResponse.data.schedule;

    // 5. Clear old exams 
    await Exam.deleteMany({});
    console.log(`Cleared old exams.`);

    // 6. Bulk-create the new, solved exams in your database
    const createdExams = await Exam.insertMany(generatedSchedule);
    console.log(`Successfully inserted ${createdExams.length} new exams.`);

    // 7. Auto-enroll students and send notifications
    for (const exam of createdExams) {
      
      // --- FIX: Handle comma-separated branches (e.g. "cse, it") ---
      let branchQuery = {};
      if (exam.targetBranch) {
          // Creates regex for each branch: "cse" -> /^cse$/i, "it" -> /^it$/i
          const branches = exam.targetBranch.split(',').map(b => new RegExp(`^${b.trim()}$`, 'i'));
          branchQuery = { $in: branches };
      }
      
      const studentsToNotify = await User.find({
        role: 'student',
        'academicDetails.branch': branchQuery, // Matches ANY of the branches in the list
        'academicDetails.semester': exam.targetSemester,
      });
      // -------------------------------------------------------------
      
      const studentIds = studentsToNotify.map(s => s._id);

      // Update the exam document with the array of student IDs
      await Exam.updateOne({ _id: exam._id }, { $set: { students: studentIds } });

      // Notify the instructor and all enrolled students
      if (exam.instructor) {
          await notifyInstructor(exam.instructor, exam, 'EXAM_ASSIGNED_INSTRUCTOR');
      }
      
      if (studentIds.length > 0) {
          await notifyStudents(studentIds, exam, 'EXAM_ADDED');
      }
    }

    res.status(201).json({
      success: true,
      message: `Successfully generated and saved ${createdExams.length} exams.`,
      data: createdExams,
    });

  } catch (error) {
    console.error("runScheduler Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};