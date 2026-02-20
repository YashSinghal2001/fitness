const express = require('express');
const { createWorkout, getWorkoutHistory, getWorkoutById } = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').post(createWorkout);
router.route('/history').get(getWorkoutHistory);
router.route('/:id').get(getWorkoutById);

module.exports = router;
