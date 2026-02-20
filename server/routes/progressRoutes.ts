import express from 'express';
import {
  updateBodyMeasurements,
  getBodyMeasurements,
  getStats,
  getReportingStats
} from '../controllers/progressController';

const router = express.Router();

router.route('/measurements')
.put(updateBodyMeasurements as any)
.get(getBodyMeasurements as any);

router.get('/stats', getStats as any);
router.get('/reporting', getReportingStats as any);

export default router;
