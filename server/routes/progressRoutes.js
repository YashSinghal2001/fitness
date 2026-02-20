const express = require('express');
const {
  updateBodyMeasurements,
  getBodyMeasurements,
  getStats,
  getReportingStats
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/measurements')
.put(updateBodyMeasurements)
.get(getBodyMeasurements);

router.get('/stats', getStats);
router.get('/reporting', getReportingStats);

module.exports = router;
