const Goal = require('../models/Goal');

// @desc    Create new goal
// @route   POST /api/goals
// @access  Private (Client)
const createGoal = async (req, res) => {
  const { title, description, targetValue, currentValue, deadline, category } = req.body;

  const goal = await Goal.create({
    client: req.user._id,
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
// @access  Private (Client)
const getGoals = async (req, res) => {
  const goals = await Goal.find({ client: req.user._id }).sort({ deadline: 1 });
  res.json(goals);
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private (Client)
const updateGoal = async (req, res) => {
  const goal = await Goal.findById(req.params.id);

  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  // Ensure user owns the goal
  if (goal.client.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized');
  }

  const updatedGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(updatedGoal);
};

module.exports = { createGoal, getGoals, updateGoal };
