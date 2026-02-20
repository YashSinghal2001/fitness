import { Request, Response } from 'express';
import NutritionPlan from '../models/NutritionPlan';
import User from '../models/User';

// @desc    Create a new nutrition plan
// @route   POST /api/nutrition
// @access  Public (Temporary)
export const createNutritionPlan = async (req: Request, res: Response) => {
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

    // Validate client exists (optional now, but good to keep)
    // const client = await User.findById(clientId);
    
    const nutritionPlan = new NutritionPlan({
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
    });

    await nutritionPlan.save();

    res.status(201).json(nutritionPlan);
  } catch (error: any) {
    console.error('Error creating nutrition plan:', error);
    if (error.name === 'ValidationError') {
       return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get nutrition plan by client ID
// @route   GET /api/nutrition/:clientId
// @access  Public (Temporary)
export const getNutritionPlanByClientId = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params;
    
    // Auth check removed

    const plan = await NutritionPlan.findOne({ clientId }).sort({ createdAt: -1 });

    if (!plan) {
      return res.status(404).json({ message: 'Nutrition plan not found' });
    }

    res.json(plan);
  } catch (error) {
    console.error('Error fetching nutrition plan:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};