const mongoose = require('mongoose');

const nutritionPlanSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  planType: {
    type: String,
    required: true,
  },
  period: {
    type: String,
    required: true,
  },
  checkInDate: {
    type: Date,
    required: true,
  },
  cardio: {
    totalCardioMinutes: { type: Number, required: true },
    avgHeartRate: { type: Number, required: true },
    dailyStepGoal: { type: Number, required: true },
  },
  water: {
    dailyTarget: { type: String, default: '4 liters' },
  },
  salt: [{
    amount: { type: String, required: true }, // e.g., "1/4 tsp"
    notes: { type: String }, // e.g., "(1.5g)"
  }],
  meals: [{
    name: { type: String, required: true }, // e.g., "Wake Up", "08:00"
    nonVegOption: { type: String },
    vegOption: { type: String },
    quantity: { type: String },
    unit: { type: String },
    supplements: [{
      name: { type: String },
      dosage: { type: String },
    }],
    notes: { type: String },
    macros: {
      protein: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
      fats: { type: Number, default: 0 },
      calories: { type: Number, default: 0 },
    }
  }],
  dailyMacroTargets: {
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
    calories: { type: Number, required: true },
  }
}, {
  timestamps: true,
});

nutritionPlanSchema.index({ client: 1, checkInDate: -1 });

// Validation: Macro totals equal daily target
nutritionPlanSchema.pre('save', async function () {
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  let totalCalories = 0;

  if (this.meals && this.meals.length > 0) {
    this.meals.forEach((meal) => {
      if (meal.macros) {
        totalProtein += meal.macros.protein || 0;
        totalCarbs += meal.macros.carbs || 0;
        totalFats += meal.macros.fats || 0;
        totalCalories += meal.macros.calories || 0;
      }
    });
  }

  // Allow small margin for floating point errors (e.g., 1.0)
  const EPSILON = 1.0;
  const CALORIE_EPSILON = 5.0; // Slightly larger margin for calories

  if (this.dailyMacroTargets) {
      if (Math.abs(totalProtein - this.dailyMacroTargets.protein) > EPSILON) {
         throw new Error(`Total protein (${totalProtein}) does not match daily target (${this.dailyMacroTargets.protein})`);
      }
      if (Math.abs(totalCarbs - this.dailyMacroTargets.carbs) > EPSILON) {
         throw new Error(`Total carbs (${totalCarbs}) does not match daily target (${this.dailyMacroTargets.carbs})`);
      }
      if (Math.abs(totalFats - this.dailyMacroTargets.fats) > EPSILON) {
         throw new Error(`Total fats (${totalFats}) does not match daily target (${this.dailyMacroTargets.fats})`);
      }
      if (Math.abs(totalCalories - this.dailyMacroTargets.calories) > CALORIE_EPSILON) {
         throw new Error(`Total calories (${totalCalories}) does not match daily target (${this.dailyMacroTargets.calories})`);
      }
  }
});

const NutritionPlan = mongoose.model('NutritionPlan', nutritionPlanSchema);

module.exports = NutritionPlan;
