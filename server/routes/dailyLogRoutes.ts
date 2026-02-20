import express from 'express';
import { createDailyLog, getDailyLogs } from '../controllers/dailyLogController';

const router = express.Router();

router.post('/', createDailyLog);
router.get('/:clientId', getDailyLogs);

export default router;