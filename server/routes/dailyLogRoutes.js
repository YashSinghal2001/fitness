const express = require('express');
const { createDailyLog, getDailyLogs } = require('../controllers/dailyLogController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createDailyLog);
router.get('/:clientId', getDailyLogs);

module.exports = router;
