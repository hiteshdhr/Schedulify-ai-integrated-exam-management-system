const jwt = require('jsonwebtoken');
const User = require('../models/User');
//const sendEmail = require('../utils/sendEmail'); // You'll create this file

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// --- CORRECTED FUNCTION ---
exports.forgotPassword = async (req, res) => {
  let user; // --- FIX: Defined user outside try block
  try {
    const { email } = req.body;

    user = await User.findOne({ email }); // --- FIX: Assigned to user

    if (!user) {
      // We send 200 even if user not found for security
      // This prevents attackers from guessing which emails are registered.
      return res.status(200).json({ 
        success: true, 
        message: 'If a user with that email exists, a reset link has been sent.' 
      });
    }

    // 1. Get reset token from the model method
    const resetToken = user.getPasswordResetToken();

    // 2. Save the user (with the new token and expiry)
    await user.save({ validateBeforeSave: false });

    // 3. Create reset URL (This URL must point to your *React* app)
    // Example: http://localhost:5173/auth/reset-password/YOUR_TOKEN_HERE
    const resetUrl = `http://localhost:5174/auth/reset-password/${resetToken}`;
    // NOTE: In production, you'll change the host to your frontend's domain

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;
    
    // 4. Send the email
    
      // await sendEmail({
      //   email: user.email,
      //   subject: 'Schedulify - Password Reset Token',
      //   message: message,
      // });
      
      // FOR DEVELOPMENT: Log to console instead of sending email
      console.log('--- PASSWORD RESET REQUEST ---');
      console.log(`User: ${user.email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log('------------------------------');


      res.status(200).json({ 
        success: true, 
        message: 'Password reset link sent to your email' 
      });

    } catch (error) {
      if (user) { // --- FIX: This check now works ---
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
    }
    

   console.error(error); 
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};