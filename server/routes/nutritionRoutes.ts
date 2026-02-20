import express from 'express';
import { createNutritionPlan, getNutritionPlanByClientId } from '../controllers/nutritionController';

const router = express.Router();

router.post('/', createNutritionPlan);
router.get('/:clientId', getNutritionPlanByClientId);

export default router;