const ProgressPhoto = require('../models/ProgressPhoto');
const cloudinary = require('../utils/cloudinary');

const DEFAULT_CLIENT_ID = "507f1f77bcf86cd799439011";

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// @desc    Upload progress photos (Front, Side, Rear)
// @route   POST /api/photos
// @access  Public (Temporary)
const uploadPhotos = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400);
    throw new Error('No files uploaded');
  }

  const { date } = req.body;
  const photoDate = date ? new Date(date) : new Date();

  const photoData = {
    userId: DEFAULT_CLIENT_ID,
    date: photoDate,
  };
  
  const folder = 'gym-progress';

  try {
    if (req.files['front']) {
      const result = await uploadToCloudinary(req.files['front'][0].buffer, folder);
      photoData.front = {
        url: result.secure_url,
        publicId: result.public_id
      };
    }

    if (req.files['side']) {
      const result = await uploadToCloudinary(req.files['side'][0].buffer, folder);
      photoData.side = {
        url: result.secure_url,
        publicId: result.public_id
      };
    }

    if (req.files['rear']) {
      const result = await uploadToCloudinary(req.files['rear'][0].buffer, folder);
      photoData.rear = {
        url: result.secure_url,
        publicId: result.public_id
      };
    }

    const progressPhoto = await ProgressPhoto.create(photoData);

    res.status(201).json(progressPhoto);
  } catch (error) {
    res.status(500);
    throw new Error('Image upload failed: ' + error.message);
  }
};

// @desc    Get progress photos by client ID
// @route   GET /api/photos/:clientId
// @access  Public (Temporary)
const getPhotos = async (req, res) => {
  const { clientId } = req.params;
  
  // If clientId is 'me' or undefined, use DEFAULT_CLIENT_ID
  const targetId = (clientId === 'me' || !clientId) ? DEFAULT_CLIENT_ID : clientId;

  const photos = await ProgressPhoto.find({ userId: targetId }).sort({ date: -1 });

  res.json(photos);
};

// @desc    Get progress photos for comparison
// @route   GET /api/photos/compare
// @access  Public (Temporary)
const getComparePhotos = async (req, res) => {
  const photos = await ProgressPhoto.find({ userId: DEFAULT_CLIENT_ID }).sort({ date: -1 });
  res.json(photos);
};

module.exports = {
  uploadPhotos,
  getPhotos,
  getComparePhotos
};
