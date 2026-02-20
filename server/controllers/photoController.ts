import { Request, Response } from 'express';
import ProgressPhoto from '../models/ProgressPhoto';

const DEFAULT_CLIENT_ID = "507f1f77bcf86cd799439011";

interface FileRequest extends Request {
  files?: any;
}

// @desc    Upload progress photos (Front, Side, Rear)
// @route   POST /api/photos
// @access  Public (Temporary)
const uploadPhotos = async (req: FileRequest, res: Response) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    res.status(400);
    throw new Error('No files uploaded');
  }

  const { date } = req.body;
  const photoDate = date ? new Date(date) : new Date();

  const photoData: any = {
    userId: DEFAULT_CLIENT_ID,
    date: photoDate,
  };

  if (req.files['front']) {
    photoData.front = {
      url: req.files['front'][0].path,
      publicId: req.files['front'][0].filename
    };
  }

  if (req.files['side']) {
    photoData.side = {
      url: req.files['side'][0].path,
      publicId: req.files['side'][0].filename
    };
  }

  if (req.files['rear']) {
    photoData.rear = {
      url: req.files['rear'][0].path,
      publicId: req.files['rear'][0].filename
    };
  }

  const progressPhoto = await ProgressPhoto.create(photoData);

  res.status(201).json(progressPhoto);
};

// @desc    Get progress photos by client ID
// @route   GET /api/photos/:clientId
// @access  Public (Temporary)
const getPhotos = async (req: Request, res: Response) => {
  const { clientId } = req.params;
  
  // If clientId is 'me' or undefined, use DEFAULT_CLIENT_ID
  const targetId = (clientId === 'me' || !clientId) ? DEFAULT_CLIENT_ID : clientId;

  const photos = await ProgressPhoto.find({ userId: targetId }).sort({ date: -1 });

  res.json(photos);
};

// @desc    Get progress photos for comparison
// @route   GET /api/photos/compare
// @access  Public (Temporary)
const getComparePhotos = async (req: Request, res: Response) => {
  const photos = await ProgressPhoto.find({ userId: DEFAULT_CLIENT_ID }).sort({ date: -1 });
  res.json(photos);
};

export {
  uploadPhotos,
  getPhotos,
  getComparePhotos
};