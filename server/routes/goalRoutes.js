const express = require('express');
const { createGoal, getGoals, updateGoal } = require('../controllers/goalController');

const router = express.Router();

router.route('/')
  .post(createGoal)
  .get(getGoals);

router.route('/:id').put(updateGoal);

module.exports = router;
