import { Request, Response, NextFunction } from 'express';
import DailyLog from '../models/DailyLog';
import { DAILY_TARGET as TARGETS } from '../config/targets';
import APIFeatures from '../utils/apiFeatures';

const DEFAULT_CLIENT_ID = "507f1f77bcf86cd799439011";

// Helper to calculate compliance color
const getComplianceColor = (actual: number, target: number) => {
  if (actual >= target) return 'green';
  if (actual >= target * 0.8) return 'yellow';
  return 'red';
};

// @desc    Create or update daily log
// @route   POST /api/daily
// @access  Public (Temporary)
export const createDailyLog = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      date,
      weight,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sleep,
      steps,
      water,
      veggies,
      hunger,
      digestion,
      notes,
      clientId: providedClientId // Allow passing clientId
    } = req.body;

    const clientId = providedClientId || DEFAULT_CLIENT_ID;
    
    // Normalize date to start of day to ensure unique index works per day
    const logDate = new Date(date);
    logDate.setHours(0, 0, 0, 0);

    // 1. Calculations
    const proteinCalories = (protein || 0) * 4;
    const carbCalories = (carbs || 0) * 4;
    const fatCalories = (fat || 0) * 9;
    const totalMacroCalories = proteinCalories + carbCalories + fatCalories;
    
    // Percentages (avoid division by zero)
    const total = totalMacroCalories || 1; 
    const proteinPercentage = Math.round((proteinCalories / total) * 100);
    const carbPercentage = Math.round((carbCalories / total) * 100);
    const fatPercentage = Math.round((fatCalories / total) * 100);

    // 2. Compliance
    const compliance = {
      calories: getComplianceColor(calories || 0, TARGETS.calories),
      protein: getComplianceColor(protein || 0, TARGETS.protein),
      carbs: getComplianceColor(carbs || 0, TARGETS.carbs),
      fat: getComplianceColor(fat || 0, TARGETS.fat),
      fiber: getComplianceColor(fiber || 0, TARGETS.fiber),
    };

    const logData = {
      clientId,
      date: logDate,
      weight,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sleep,
      steps,
      water,
      veggies,
      hunger,
      digestion,
      notes,
      calculatedStats: {
        proteinCalories,
        carbCalories,
        fatCalories,
        totalMacroCalories,
        proteinPercentage,
        carbPercentage,
        fatPercentage,
      },
      compliance
    };

    // Upsert: Find by clientId and date, update if exists, insert if not
    const log = await DailyLog.findOneAndUpdate(
      { clientId, date: logDate },
      logData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({
      status: 'success',
      data: {
        log
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily logs for a client
// @route   GET /api/daily/:clientId
// @access  Public (Temporary)
export const getDailyLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let { clientId } = req.params;
    if (!clientId || clientId === 'undefined') {
        clientId = DEFAULT_CLIENT_ID;
    }
    
    const features = new APIFeatures(DailyLog.find({ clientId }), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    
    const logs = await features.query;

    res.status(200).json({
      status: 'success',
      results: logs.length,
      data: {
        logs
      }
    });
  } catch (error) {
    next(error);
  }
};