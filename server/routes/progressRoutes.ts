import express from 'express';
import {
  updateBodyMeasurements,
  getBodyMeasurements,
  getStats,
  getReportingStats
} from '../controllers/progressController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/measurements')
  .put(protect, updateBodyMeasurements as any)
  .get(protect, getBodyMeasurements as any);

router.get('/stats', protect, getStats as any);
router.get('/reporting', protect, getReportingStats as any);

export default router;
