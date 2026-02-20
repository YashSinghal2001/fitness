const express = require('express');
const { createNutritionPlan, getNutritionPlanByClientId } = require('../controllers/nutritionController');

const router = express.Router();

router.post('/', createNutritionPlan);
router.get('/:clientId', getNutritionPlanByClientId);

module.exports = router;
