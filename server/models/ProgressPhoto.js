const mongoose = require('mongoose');

const progressPhotoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  front: {
    url: String,
    publicId: String
  },
  side: {
    url: String,
    publicId: String
  },
  rear: {
    url: String,
    publicId: String
  }
}, {
  timestamps: true,
});

progressPhotoSchema.index({ userId: 1, date: -1 });

const ProgressPhoto = mongoose.model('ProgressPhoto', progressPhotoSchema);

module.exports = ProgressPhoto;
