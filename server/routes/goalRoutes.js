const express = require('express');
const { createGoal, getGoals, updateGoal } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createGoal)
  .get(getGoals);

router.route('/:id').put(updateGoal);

module.exports = router;
