import express from 'express';
import {
  uploadPhotos,
  getPhotos,
  getComparePhotos,
} from '../controllers/photoController';
import upload from '../middleware/uploadMiddleware';

const router = express.Router();

router.get('/compare', getComparePhotos as any);

router.route('/')
  .post(upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'side', maxCount: 1 },
    { name: 'rear', maxCount: 1 }
  ]), uploadPhotos as any);

router.route('/:clientId')
  .get(getPhotos as any);

// Also support GET /api/photos for current user (optional, but good practice)
router.route('/')
  .get(getPhotos as any);

export default router;