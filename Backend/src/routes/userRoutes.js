const express = require('express');
const {
  getAllUsers,
  getUsersByRole,
  getUser,
  updateUser,
  deleteUser,
  updateMyPreferences,
  updateMyAcademicDetails,
  // Import new controllers
  saveMySchedule,
  getMySchedule,
  updateNotificationSettings
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// --- PROTECTED ROUTES (All Roles) ---
router.use(protect);

router.put('/my-preferences', updateMyPreferences);
router.put('/my-academic-details', updateMyAcademicDetails);

// --- ADD THESE NEW ROUTES ---
router.put('/my-schedule', saveMySchedule);
router.get('/my-schedule', getMySchedule);
router.put('/notification-settings', updateNotificationSettings);
// ---------------------------

// --- ADMIN-ONLY ROUTES ---
router.use(authorize('admin'));

router.get('/', getAllUsers);
router.get('/role/:role', getUsersByRole);
router.get('/:id', getUser); 
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;