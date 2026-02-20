import mongoose from 'mongoose';

const bodyMeasurementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  chest: { type: Number, required: true },
  leftArm: { type: Number, required: true },
  rightArm: { type: Number, required: true },
  stomach: { type: Number, required: true }, // Navel
  waist: { type: Number, required: true }, // 2" Below Navel
  hips: { type: Number, required: true }, // Widest
  leftLeg: { type: Number, required: true },
  rightLeg: { type: Number, required: true },
}, {
  timestamps: true,
});

bodyMeasurementSchema.index({ userId: 1, date: -1 });

const BodyMeasurement = mongoose.model('BodyMeasurement', bodyMeasurementSchema);

export default BodyMeasurement;
