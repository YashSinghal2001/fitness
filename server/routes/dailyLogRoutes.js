const express = require('express');
const { createDailyLog, getDailyLogs } = require('../controllers/dailyLogController');

const router = express.Router();

router.post('/', createDailyLog);
router.get('/:clientId', getDailyLogs);

module.exports = router;
