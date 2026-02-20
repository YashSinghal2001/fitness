const express = require('express');
const { getClientProfile, getClientDashboard, getClientReports, getClientNutrition } = require('../controllers/clientController');
const { getWorkoutHistory } = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All routes are protected

router.get('/me', getClientProfile);
router.get('/dashboard', getClientDashboard);
router.get('/reports', getClientReports);
router.get('/nutrition', getClientNutrition);
router.get('/workouts', getWorkoutHistory);

module.exports = router;
