const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: Number, required: true },
  weight: { type: Number, default: 0 },
  notes: { type: String, default: '' }
});

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  workoutDate: {
    type: Date,
    default: Date.now,
  },
  duration: {
    type: Number,
    required: true, // in minutes
  },
  caloriesBurned: {
    type: Number,
    default: 0,
  },
  exercises: [exerciseSchema],
}, {
  timestamps: true,
});

workoutSchema.index({ userId: 1, workoutDate: -1 });

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;
