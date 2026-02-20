import express from 'express';
import { createGoal, getGoals, updateGoal } from '../controllers/goalController';

const router = express.Router();

router.route('/')
  .post(createGoal as any)
  .get(getGoals as any);

router.route('/:id').put(updateGoal as any);

export default router;