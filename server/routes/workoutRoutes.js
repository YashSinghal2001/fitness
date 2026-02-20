const express = require('express');
const { createWorkout, getWorkoutHistory, getWorkoutById } = require('../controllers/workoutController');

const router = express.Router();

router.route('/').post(createWorkout);
router.route('/history').get(getWorkoutHistory);
router.route('/:id').get(getWorkoutById);

module.exports = router;
