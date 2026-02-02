// src/routes/agentRoutes.js
const express = require('express');
const { protect } = require('../middleware/auth');
const axios = require('axios'); // <-- ADD THIS

const router = express.Router();

// This is the new chatbot query route
const parseQuery = async (req, res) => {
  const { query } = req.body;
  
  // This URL must match the port you set in intent_chatbot.py
  const chatbotServiceUrl = 'http://localhost:5002/chat'; 

  try {
    const response = await axios.post(chatbotServiceUrl, {
      query: query,
    });
    
    // Forward the response from the Python service
    res.status(200).json(response.data);

  } catch (error) {
    console.error('Chatbot service error:', error.message);
    const errMessage = error.response?.data?.message || 'The chatbot service is unavailable.';
    res.status(500).json({
      success: false,
      message: errMessage,
    });
  }
};

// 🧠 AI query route (now points to our new function)
router.post('/query', protect, parseQuery);

module.exports = router;