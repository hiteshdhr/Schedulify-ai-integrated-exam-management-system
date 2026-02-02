
const dotenv = require('dotenv');
dotenv.config();


const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const examRoutes = require('./routes/examRoutes');

const taskRoutes = require('./routes/taskRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const searchRoutes = require('./routes/searchRoutes');
const agentRoutes = require('./routes/agentRoutes');
const roomRoutes = require('./routes/roomRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const noteRoutes = require('./routes/noteRoutes');
const schedulerRoutes = require('./routes/schedulerRoutes'); 

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Schedulify API',
    version: '1.0.0',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);

app.use('/api/tasks', taskRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/scheduler', schedulerRoutes); 

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

module.exports = app;