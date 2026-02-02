const Task = require('../models/Task');
const Exam = require('../models/Exam');
const mongoose = require('mongoose');

// Helper Function to get 6-week date range
const getWeekRanges = () => {
  const weeks = [];
  const now = new Date();
  
  now.setUTCHours(0, 0, 0, 0);
  now.setDate(now.getDate() - now.getUTCDay()); // Start of current week (Sunday)

  for (let i = 0; i < 6; i++) {
    const endDate = new Date(now);
    const startDate = new Date(now.setDate(now.getDate() - 7));
    
    const startOfYear = new Date(startDate.getFullYear(), 0, 1);
    const pastDaysOfYear = (startDate - startOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

    weeks.push({
      weekName: `Week ${weekNumber}`,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
  }
  return weeks.reverse(); // Chronological order
};

// @desc    Get performance data for logged-in user
// @route   GET /api/analytics/my-performance
// @access  Private
exports.getMyPerformance = async (req, res) => {
  try {
    const userId = req.user._id;
    const weekRanges = getWeekRanges();
    
    // --- THIS IS THE REAL QUERY ---
    const tasksData = await Task.aggregate([
      {
        $match: {
          user: userId,
          updatedAt: { $gte: weekRanges[0].startDate } // Only from the last 6 weeks
        }
      },
      {
        $bucket: {
          groupBy: "$updatedAt",
          boundaries: weekRanges.map(w => w.startDate).concat(weekRanges[5].endDate),
          default: "Other",
          output: {
            completedTasks: {
              $sum: { $cond: [ "$completed", 1, 0 ] } // Count if completed
            },
            studyHours: { $sum: "$studyHours" } // --- REAL QUERY for studyHours ---
          }
        }
      }
    ]);

    // TODO: Get Exam Scores per week
    // You need to add an 'examScore' field to your Exam model
    // and then run a query similar to the one above.

    // Merge the data
    const dataMap = new Map(tasksData.map((t, index) => [
      weekRanges[index].weekName,
      t
    ]));
    
    const performanceData = weekRanges.map(week => {
      const weekData = dataMap.get(week.weekName);
      return {
        week: week.weekName,
        completedTasks: weekData?.completedTasks || 0,
        studyHours: weekData?.studyHours || 0, // --- Using real data ---
        examScores: [],  // TODO: Replace with real data from Exam query
      };
    });

    res.status(200).json({
      success: true,
      data: performanceData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get system-wide performance data
// @route   GET /api/analytics/system-performance
// @access  Admin
exports.getSystemPerformance = async (req, res) => {
  try {
    const weekRanges = getWeekRanges();
    
    // --- THIS IS THE REAL QUERY ---
    const tasksData = await Task.aggregate([
      {
        $match: {
          updatedAt: { $gte: weekRanges[0].startDate }
        }
      },
      {
        $bucket: {
          groupBy: "$updatedAt",
          boundaries: weekRanges.map(w => w.startDate).concat(weekRanges[5].endDate),
          default: "Other",
           output: {
            completedTasks: {
              $sum: { $cond: [ "$completed", 1, 0 ] }
            },
            studyHours: { $sum: "$studyHours" } // --- REAL QUERY for studyHours ---
          }
        }
      }
    ]);
    
    // TODO: Get ALL Exam Scores per week

    // Merge the data
    const dataMap = new Map(tasksData.map((t, index) => [
      weekRanges[index].weekName,
      t
    ]));
    
    const performanceData = weekRanges.map(week => {
      const weekData = dataMap.get(week.weekName);
      return {
        week: week.weekName,
        completedTasks: weekData?.completedTasks || 0,
        studyHours: weekData?.studyHours || 0, // --- Using real data ---
        examScores: [],  // TODO: Replace with real data
      };
    });

    res.status(200).json({
      success: true,
      data: performanceData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};