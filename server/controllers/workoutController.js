const Workout = require('../models/Workout');

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private (Client)
const createWorkout = async (req, res) => {
  const { name, exercises, duration, caloriesBurned } = req.body;

  if (!exercises || exercises.length === 0) {
    res.status(400);
    throw new Error('No exercises added');
  }

  try {
    const workout = new Workout({
      client: req.user._id,
      name,
      exercises,
      duration,
      caloriesBurned,
      workoutDate: new Date(),
    });

    const createdWorkout = await workout.save();

    res.status(201).json(createdWorkout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get workout history
// @route   GET /api/workouts/history or GET /api/client/workouts
// @access  Private (Client)
const getWorkoutHistory = async (req, res) => {
  try {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    
    const dateFrom = req.query.dateFrom ? new Date(req.query.dateFrom) : null;
    const dateTo = req.query.dateTo ? new Date(req.query.dateTo) : null;

    const keyword = req.query.keyword
      ? {
          name: {
            $regex: req.query.keyword,
            $options: 'i',
          },
        }
      : {};

    // Use req.user._id and 'client' field
    let query = { client: req.user._id, ...keyword };

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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get workout by ID
// @route   GET /api/workouts/:id
// @access  Private (Client)
const getWorkoutById = async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (workout) {
        // Ensure user owns the workout
        if (workout.client.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        res.json(workout);
    } else {
        res.status(404).json({ message: 'Workout not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createWorkout, getWorkoutHistory, getWorkoutById };
