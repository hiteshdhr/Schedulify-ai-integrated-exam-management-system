const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  forgotPassword 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/me', protect, getMe);

// 2. Add the new route
router.post('/forgot-password', forgotPassword);

module.exports = router;