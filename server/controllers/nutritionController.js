const NutritionPlan = require('../models/NutritionPlan');
const User = require('../models/User');

// @desc    Create a new nutrition plan
// @route   POST /api/nutrition
// @access  Private (Admin)
const createNutritionPlan = async (req, res) => {
  try {
    const {
      clientId,
      clientName,
      planType,
      period,
      checkInDate,
      cardio,
      water,
      salt,
      meals,
      dailyMacroTargets
    } = req.body;

    // Validate client exists
    const client = await User.findById(clientId);
    if (!client) {
        return res.status(404).json({ message: 'Client not found' });
    }

    // Check authorization: only admin/coach can create plans
    if (req.user.role !== 'admin' || (client.coach && client.coach.toString() !== req.user._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to create plan for this client' });
    }
    
    const nutritionPlan = new NutritionPlan({
      client: clientId,
      clientName: clientName || client.name,
      planType,
      period,
      checkInDate,
      cardio,
      water,
      salt,
      meals,
      dailyMacroTargets
    });

    await nutritionPlan.save();

    res.status(201).json(nutritionPlan);
  } catch (error) {
    console.error('Error creating nutrition plan:', error);
    if (error.name === 'ValidationError') {
       return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get nutrition plan by client ID
// @route   GET /api/nutrition/:clientId
// @access  Private
const getNutritionPlanByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Auth check
    if (req.user.role === 'client') {
        if (clientId !== 'me' && clientId !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
    } else if (req.user.role === 'admin') {
        const client = await User.findById(clientId);
        if (!client) {
             return res.status(404).json({ message: 'Client not found' });
        }
        if (client.coach && client.coach.toString() !== req.user._id.toString()) {
             return res.status(403).json({ message: 'Not authorized' });
        }
    }

    const targetId = clientId === 'me' ? req.user._id : clientId;

    const plan = await NutritionPlan.findOne({ client: targetId }).sort({ createdAt: -1 });

    if (!plan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Error fetching nutrition plan:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createNutritionPlan,
  getNutritionPlanByClientId
};
