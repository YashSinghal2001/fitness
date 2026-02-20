import { Request, Response } from 'express';
import Workout from '../models/Workout';

const DEFAULT_CLIENT_ID = "507f1f77bcf86cd799439011";

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Public (Temporary)
const createWorkout = async (req: Request, res: Response) => {
  const { name, exercises, duration, caloriesBurned } = req.body;

  if (!exercises || exercises.length === 0) {
    res.status(400);
    throw new Error('No exercises added');
  }

  const workout = new Workout({
    userId: DEFAULT_CLIENT_ID,
    name,
    exercises,
    duration,
    caloriesBurned,
    workoutDate: new Date(),
  });

  const createdWorkout = await workout.save();

  res.status(201).json(createdWorkout);
};

// @desc    Get workout history
// @route   GET /api/workouts/history
// @access  Public (Temporary)
const getWorkoutHistory = async (req: Request, res: Response) => {
  const pageSize = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;
  
  const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom as string) : null;
  const dateTo = req.query.dateTo ? new Date(req.query.dateTo as string) : null;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  let query: any = { userId: DEFAULT_CLIENT_ID, ...keyword };

  if (dateFrom && dateTo) {
    query.workoutDate = { $gte: dateFrom, $lte: dateTo };
  } else if (dateFrom) {
    query.workoutDate = { $gte: dateFrom };
  } else if (dateTo) {
    query.workoutDate = { $lte: dateTo };
  }

  const count = await Workout.countDocuments(query);
  const workouts = await Workout.find(query)
    .sort({ workoutDate: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({ workouts, page, pages: Math.ceil(count / pageSize) });
};

// @desc    Get workout by ID
// @route   GET /api/workouts/:id
// @access  Public (Temporary)
const getWorkoutById = async (req: Request, res: Response) => {
  const workout = await Workout.findById(req.params.id);

  if (workout) {
    res.json(workout);
  } else {
    res.status(404);
    throw new Error('Workout not found');
  }
};

export { createWorkout, getWorkoutHistory, getWorkoutById };