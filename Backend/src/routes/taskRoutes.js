const express = require('express');
const {
  createTask,
  getMyTasks,
  getTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// All routes are protected
router.use(protect);

router.get('/my-tasks', getMyTasks);

router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('dueDate').notEmpty().withMessage('Due date is required'),
  ],
  createTask
);

router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;