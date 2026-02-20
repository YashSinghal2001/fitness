const DailyLog = require('../models/DailyLog');
const NutritionPlan = require('../models/NutritionPlan');
const Goal = require('../models/Goal');

const DEFAULT_CLIENT_ID = "507f1f77bcf86cd799439011";

// @desc    Get client dashboard data
// @route   GET /api/client/dashboard
// @access  Public (Temporary)
const getClientDashboard = async (req, res) => {
  try {
    const userId = DEFAULT_CLIENT_ID;

    // Get today's log
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayLog = await DailyLog.findOne({
      clientId: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // Get active goals
    const activeGoals = await Goal.find({ userId: userId, completed: false });

    // Get active nutrition plan
    const nutritionPlan = await NutritionPlan.findOne({ clientId: userId }).sort({ createdAt: -1 });

    res.json({
      todayLog,
      activeGoalsCount: activeGoals.length,
      hasNutritionPlan: !!nutritionPlan,
      nutritionPlanSummary: nutritionPlan ? {
        calories: nutritionPlan.dailyMacroTargets?.calories || 0,
        protein: nutritionPlan.dailyMacroTargets?.protein || 0,
        carbs: nutritionPlan.dailyMacroTargets?.carbs || 0,
        fats: nutritionPlan.dailyMacroTargets?.fats || 0
      } : null
    });

  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get client reports (weekly summaries)
// @route   GET /api/client/reports
// @access  Public (Temporary)
const getClientReports = async (req, res) => {
    try {
        const userId = DEFAULT_CLIENT_ID;
        const logs = await DailyLog.find({ clientId: userId }).sort({ date: -1 }).limit(7);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
}

module.exports = {
  getClientDashboard,
  getClientReports
};
