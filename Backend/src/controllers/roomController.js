const Room = require('../models/Room');
const Exam = require('../models/Exam');

// @desc    Suggest best available rooms for an exam
// @route   GET /api/rooms/suggest?capacity=...&date=...&startTime=...&endTime=...
// @access  Admin
exports.suggestRooms = async (req, res) => {
  const { capacity, date, startTime, endTime } = req.query;

  if (!capacity || !date || !startTime || !endTime) {
    return res.status(400).json({ success: false, message: 'Missing required query parameters.' });
  }
  
  try {
    // 1. Find occupied rooms
    const occupiedRooms = await Exam.find({
      date: new Date(date),
      startTime: { $lt: endTime },
      endTime: { $gt: startTime }
    }).select('roomNumber');
    const occupiedRoomNames = occupiedRooms.map(e => e.roomNumber);

    // 2. Find available rooms with enough capacity
    const availableRooms = await Room.find({
      capacity: { $gte: parseInt(capacity) },
      name: { $nin: occupiedRoomNames }
    });

    // 3. Score the rooms (Rule-Based Logic)
    const scoredRooms = availableRooms.map(room => {
      let score = 100;
      // Rule 1: Penalize wasted space. (Lower diff = better score)
      const capacityDiff = room.capacity - parseInt(capacity);
      score -= capacityDiff; // A room of 50 for 45 (score 95) is better than 100 for 45 (score 45)
      
      // Rule 2: Penalize high usage. (Lower usage = better score)
      score -= (room.usageCount * 0.1); 

      return { ...room.toObject(), score: score };
    });

    // 4. Sort by highest score
    const suggestions = scoredRooms.sort((a, b) => b.score - a.score);

    res.status(200).json({ success: true, data: suggestions });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};