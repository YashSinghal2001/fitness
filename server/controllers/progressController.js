const BodyMeasurement = require('../models/BodyMeasurement');
const Workout = require('../models/Workout');
const DailyLog = require('../models/DailyLog');

// @desc    Update body measurements
// @route   PUT /api/progress/measurements
// @access  Private (Client)
const updateBodyMeasurements = async (req, res) => {
  const { date, chest, leftArm, rightArm, stomach, waist, hips, leftLeg, rightLeg } = req.body;

  try {
    const measurement = await BodyMeasurement.create({
      client: req.user._id,
      date: date ? new Date(date) : new Date(),
      chest,
      leftArm,
      rightArm,
      stomach,
      waist,
      hips,
      leftLeg,
      rightLeg,
    });

    res.status(201).json(measurement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get body measurements history
// @route   GET /api/progress/measurements
// @access  Private (Client)
const getBodyMeasurements = async (req, res) => {
  try {
    const measurements = await BodyMeasurement.find({ client: req.user._id }).sort({ date: 1 });
    
    if (measurements.length === 0) {
      return res.json({ history: [], stats: null });
    }

    const first = measurements[0];
    const last = measurements[measurements.length - 1];
    const previous = measurements.length > 1 ? measurements[measurements.length - 2] : null;

    const calculateDeltas = (key) => {
      const currentVal = last[key] || 0;
      const firstVal = first[key] || 0;
      const prevVal = previous ? (previous[key] || 0) : currentVal;

      return {
        current: currentVal,
        deltaFirst: Number((currentVal - firstVal).toFixed(2)),
        deltaLast: Number((currentVal - prevVal).toFixed(2)),
        totalReduction: Number((firstVal - currentVal).toFixed(2))
      };
    };

    const fields = ['chest', 'leftArm', 'rightArm', 'stomach', 'waist', 'hips', 'leftLeg', 'rightLeg'];
    const stats = {};

    fields.forEach(field => {
      stats[field] = calculateDeltas(field);
    });

    res.json({
      history: measurements,
      stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/progress/stats
// @access  Private (Client)
const getStats = async (req, res) => {
  try {
    const totalWorkouts = await Workout.countDocuments({ client: req.user._id });
    
    const workouts = await Workout.find({ client: req.user._id });
    const totalCalories = workouts.reduce((acc, curr) => acc + (curr.caloriesBurned || 0), 0);
    const totalDuration = workouts.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    
    // Calculate streak
    const workoutDates = workouts
      .map(w => w.workoutDate.toISOString().split('T')[0])
      .sort()
      .reverse(); // Newest first

    const uniqueDates = [...new Set(workoutDates)];
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDates.length > 0) {
      if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
          streak = 1;
          // Check consecutive days backwards
          for (let i = 0; i < uniqueDates.length - 1; i++) {
              const current = new Date(uniqueDates[i]);
              const next = new Date(uniqueDates[i+1]);
              const diffTime = Math.abs(current.getTime() - next.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
              
              if (diffDays === 1) {
                  streak++;
              } else {
                  break;
              }
          }
      }
    }

    res.json({
      totalWorkouts,
      totalCalories,
      totalDuration,
      streak,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get reporting dashboard stats
// @route   GET /api/progress/reporting
// @access  Private (Client)
const getReportingStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if not specified
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) start.setDate(start.getDate() - 30);

    const logs = await DailyLog.find({
      client: req.user._id,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    // Helper to calculate average
    const average = (arr) => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 0;

    // Prepare trend arrays
    const trends = logs.map(log => ({
      date: log.date,
      weight: log.weight || 0,
      calories: log.calories || 0,
      protein: log.protein || 0,
      carbs: log.carbs || 0,
      fat: log.fat || 0,
      sleep: log.sleep || 0,
      steps: log.steps || 0,
      water: log.water || 0,
      hunger: log.hunger || 0,
      digestion: log.digestion === 'Good' ? 3 : log.digestion === 'Average' ? 2 : log.digestion === 'Poor' ? 1 : 0
    }));

    // Calculate averages
    const averages = {
      weight: average(trends.filter(t => t.weight > 0).map(t => t.weight)),
      calories: average(trends.filter(t => t.calories > 0).map(t => t.calories)),
      protein: average(trends.filter(t => t.protein > 0).map(t => t.protein)),
      carbs: average(trends.filter(t => t.carbs > 0).map(t => t.carbs)),
      fat: average(trends.filter(t => t.fat > 0).map(t => t.fat)),
      sleep: average(trends.filter(t => t.sleep > 0).map(t => t.sleep)),
      steps: average(trends.filter(t => t.steps > 0).map(t => t.steps)),
      water: average(trends.filter(t => t.water > 0).map(t => t.water)),
      hunger: average(trends.filter(t => t.hunger > 0).map(t => t.hunger)),
      digestion: average(trends.filter(t => t.digestion > 0).map(t => t.digestion)),
    };

    res.json({
      trends,
      averages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  updateBodyMeasurements,
  getBodyMeasurements,
  getStats,
  getReportingStats
};
