const DailyLog = require('../models/DailyLog');
const NutritionPlan = require('../models/NutritionPlan');
const Goal = require('../models/Goal');

// @desc    Get client profile
// @route   GET /api/client/me
// @access  Private (Client)
const getClientProfile = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Get client dashboard data
// @route   GET /api/client/dashboard
// @access  Private (Client)
const getClientDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get today's log
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayLog = await DailyLog.findOne({
      client: userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    // Get active goals
    const activeGoals = await Goal.find({ client: userId, completed: false });

    // Get active nutrition plan
    const nutritionPlan = await NutritionPlan.findOne({ client: userId }).sort({ createdAt: -1 });

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
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get client reports (weekly summaries)
// @route   GET /api/client/reports
// @access  Private (Client)
const getClientReports = async (req, res) => {
    try {
        const userId = req.user._id;
        const logs = await DailyLog.find({ client: userId }).sort({ date: -1 }).limit(7);
        res.json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Get client nutrition plan
// @route   GET /api/client/nutrition
// @access  Private (Client)
const getClientNutrition = async (req, res) => {
    try {
        const userId = req.user._id;
        const nutritionPlan = await NutritionPlan.findOne({ client: userId }).sort({ createdAt: -1 });
        if (!nutritionPlan) {
            return res.status(404).json({ message: 'Nutrition plan not found' });
        }
        res.json(nutritionPlan);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
}

// @desc    Get client workouts
// @route   GET /api/client/workouts
// @access  Private (Client)
const getClientWorkouts = async (req, res) => {
    // This is a placeholder as the user asked for GET /api/client/workouts
    // But I don't see a workout controller yet. Assuming I should add it here or in workoutController
    // Since the requirement listed "Client Routes: GET /api/client/workouts", I'll add it here for now or delegate to workoutController.
    // However, usually resources have their own controllers.
    // Let's check workoutController.js content first.
    // For now I will leave it and check workoutController later.
    res.status(501).json({ message: 'Not implemented' });
}

module.exports = {
  getClientProfile,
  getClientDashboard,
  getClientReports,
  getClientNutrition
};
