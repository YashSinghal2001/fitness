const express = require('express');
const {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getAdminAnalytics,
  getAllReports
} = require('../controllers/adminController');

const router = express.Router();

router.route('/clients')
  .get(getClients)
  .post(createClient);

router.route('/clients/:id')
  .put(updateClient)
  .delete(deleteClient);

router.route('/analytics')
  .get(getAdminAnalytics);

router.route('/reports')
  .get(getAllReports);

module.exports = router;
