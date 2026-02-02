const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
    },
    
    preferences: {
      studyLength: {
        type: Number,
        default: 60,
      },
      breakLength: {
        type: Number,
        default: 10,
      },
      preferredTime: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'any'],
        default: 'any',
      },
    },

    academicDetails: {
      institution: {
        type: String,
        trim: true,
      },
      branch: {
        type: String,
        trim: true,
      },
      semester: {
        type: Number,
      },
    },

    
    studySchedule: {
      totalStudyHours: Number,
      efficiency: Number,
      week: [
        {
          day: String,
          sessions: [
            {
              subject: String,
              priority: String,
              startTime: String,
              endTime: String,
             
              type: { type: String }, 
            }
          ]
        }
      ]
    },
   

    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: false }
    },

    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);