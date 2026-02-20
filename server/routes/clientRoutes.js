const express = require('express');
const { getClientDashboard, getClientReports } = require('../controllers/clientController');

const router = express.Router();

router.get('/dashboard', getClientDashboard);
router.get('/reports', getClientReports);

module.exports = router;
