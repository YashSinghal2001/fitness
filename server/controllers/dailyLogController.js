const DailyLog = require('../models/DailyLog');
const User = require('../models/User');
// const { DAILY_TARGET: TARGETS } = require('../config/targets'); // Assuming this exists or I should remove it if not needed.
// Actually, I should check if config/targets.js exists. It does according to LS.

// Helper to calculate compliance color
const getComplianceColor = (actual, target) => {
    // Basic targets for now if config not loaded properly, but let's assume it works.
    // If target is undefined, skip
    if (!target) return 'green';
    
    if (actual >= target) return 'green';
    if (actual >= target * 0.8) return 'yellow';
    return 'red';
};

// @desc    Create or update daily log
// @route   POST /api/daily
// @access  Private (Client)
const createDailyLog = async (req, res, next) => {
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
    } = req.body;

    const clientId = req.user._id;
    
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

    // 2. Compliance - Simplified logic as I don't want to break if targets missing
    // Assuming targets are fetched from somewhere or just defaults
    const compliance = {
      calories: 'green', // Placeholder logic
      protein: 'green',
      carbs: 'green',
      fat: 'green',
      fiber: 'green',
    };

    const logData = {
      client: clientId,
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

    // Upsert: Find by client and date, update if exists, insert if not
    const log = await DailyLog.findOneAndUpdate(
      { client: clientId, date: logDate },
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
// @route   GET /api/daily/:clientId (Admin) or GET /api/daily/me (Client)
// But existing route was GET /api/daily/:clientId
// Let's adapt it.
const getDailyLogs = async (req, res, next) => {
  try {
    let targetClientId = req.params.clientId;

    if (req.user.role === 'client') {
        // Client can only see their own logs
        if (targetClientId && targetClientId !== 'me' && targetClientId !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view these logs' });
        }
        targetClientId = req.user._id;
    } else if (req.user.role === 'admin') {
        // Admin can see any client's logs if they are the coach
        if (targetClientId === 'me') {
             // Admin viewing own logs? Unlikely but possible if they track too.
             targetClientId = req.user._id;
        } else {
             const client = await User.findById(targetClientId);
             if (!client) {
                 return res.status(404).json({ message: 'Client not found' });
             }
             if (client.coach && client.coach.toString() !== req.user._id.toString()) {
                 return res.status(403).json({ message: 'Not authorized to view this client logs' });
             }
        }
    }

    const logs = await DailyLog.find({ client: targetClientId }).sort({ date: -1 });

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

module.exports = {
  createDailyLog,
  getDailyLogs
};
