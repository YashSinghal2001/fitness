import express from 'express';
import { createWorkout, getWorkoutHistory, getWorkoutById } from '../controllers/workoutController';

const router = express.Router();

router.route('/').post(createWorkout as any);
router.route('/history').get(getWorkoutHistory as any);
router.route('/:id').get(getWorkoutById as any);

export default router;