import { Request, Response } from 'express';
import Goal from '../models/Goal';

const DEFAULT_CLIENT_ID = "507f1f77bcf86cd799439011";

// @desc    Create new goal
// @route   POST /api/goals
// @access  Public (Temporary)
const createGoal = async (req: Request, res: Response) => {
  const { title, description, targetValue, currentValue, deadline, category } = req.body;

  const goal = await Goal.create({
    userId: DEFAULT_CLIENT_ID,
    title,
    description,
    targetValue,
    currentValue,
    deadline,
    category,
  });

  res.status(201).json(goal);
};

// @desc    Get goals
// @route   GET /api/goals
// @access  Public (Temporary)
const getGoals = async (req: Request, res: Response) => {
  const goals = await Goal.find({ userId: DEFAULT_CLIENT_ID }).sort({ deadline: 1 });
  res.json(goals);
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Public (Temporary)
const updateGoal = async (req: Request, res: Response) => {
  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  // Auth check removed

  const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(updatedGoal);
};

export { createGoal, getGoals, updateGoal };