import mongoose from 'mongoose';

const dailyLogSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  // Inputs
  weight: { type: Number, default: 0 },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  sleep: { type: Number, default: 0 },
  steps: { type: Number, default: 0 },
  water: { type: Number, default: 0 },
  veggies: { type: Number, default: 0 },
  hunger: { type: Number, min: 1, max: 10, default: 5 }, // 1-10 scale
  digestion: { type: String, enum: ['Good', 'Average', 'Poor', ''], default: '' },
  notes: { type: String, default: '' },
  
  // Calculated Fields
  calculatedStats: {
    proteinCalories: { type: Number },
    carbCalories: { type: Number },
    fatCalories: { type: Number },
    totalMacroCalories: { type: Number },
    proteinPercentage: { type: Number },
    carbPercentage: { type: Number },
    fatPercentage: { type: Number },
  },
  
  // Compliance Status (stored for history or calculated on fly - storing is easier for querying)
  compliance: {
    calories: { type: String, enum: ['green', 'yellow', 'red'] },
    protein: { type: String, enum: ['green', 'yellow', 'red'] },
    carbs: { type: String, enum: ['green', 'yellow', 'red'] },
    fat: { type: String, enum: ['green', 'yellow', 'red'] },
    fiber: { type: String, enum: ['green', 'yellow', 'red'] },
    sleep: { type: String, enum: ['green', 'yellow', 'red'] }, // Assuming target exists
    steps: { type: String, enum: ['green', 'yellow', 'red'] }, // Assuming target exists
  }
}, {
  timestamps: true,
});

// Compound index to ensure one log per day per client
dailyLogSchema.index({ clientId: 1, date: 1 }, { unique: true });

const DailyLog = mongoose.model('DailyLog', dailyLogSchema);

export default DailyLog;
