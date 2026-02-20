const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  schedule: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    exercises: [{
      name: { type: String, required: true },
      sets: { type: Number, required: true },
      reps: { type: Number, required: true },
      notes: { type: String, default: '' }
    }]
  }],
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
});

workoutPlanSchema.index({ client: 1 });

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

module.exports = WorkoutPlan;
