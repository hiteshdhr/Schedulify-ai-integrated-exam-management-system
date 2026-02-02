const Notification = require('../models/Notification');

// A simple, local template engine
const templates = {
  EXAM_ADDED: (exam) => 
    `You've been added to ${exam.subject} on ${new Date(exam.date).toLocaleDateString()} in room ${exam.roomNumber}.`,
  EXAM_UPDATED: (exam) =>
    `Notice: The details for your ${exam.subject} exam have been updated.`,
  // --- ADD THIS TEMPLATE ---
  EXAM_ASSIGNED_INSTRUCTOR: (exam) =>
    `You have been assigned as the instructor for ${exam.subject} on ${new Date(exam.date).toLocaleDateString()} in room ${exam.roomNumber}.`,
};

// Function to create a notification in the DB
const createNotification = async (userId, message, link) => {
  try {
    await Notification.create({
      user: userId,
      message: message,
      link: link || '/app/dashboard'
    });
  } catch (error) {
    console.error(`Failed to create notification for user ${userId}:`, error.message);
  }
};

// Public function to be called by other controllers
exports.notifyStudents = async (studentIds, exam, type = 'EXAM_ADDED') => {
  // --- FIX: Use correct template for updates ---
  const message = templates[type](exam);
  if (!message) return;

  for (const id of studentIds) {
    await createNotification(id, message, '/app/exams/${exam._id}');
  }
};

// --- ADD THIS NEW FUNCTION ---
// Public function to notify the instructor
exports.notifyInstructor = async (instructorId, exam, type = 'EXAM_ASSIGNED_INSTRUCTOR') => {
  const message = templates[type](exam);
  if (!message) return;

  // The link for an instructor might be different, e.g., their schedule
  await createNotification(instructorId, message, '/app/scheduler');
};
// --- END OF ADDITION ---