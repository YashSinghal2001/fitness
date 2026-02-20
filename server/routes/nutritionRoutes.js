const express = require('express');
const { createNutritionPlan, getNutritionPlanByClientId } = require('../controllers/nutritionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createNutritionPlan);
router.get('/:clientId', getNutritionPlanByClientId);

module.exports = router;
