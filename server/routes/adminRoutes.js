const express = require('express');
const {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getAdminAnalytics,
  getAllReports,
  updateClientNutrition,
  updateClientWorkout
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(admin);

router.route('/clients')
  .get(getClients)
  .post(createClient);

router.route('/clients/:id')
  .put(updateClient)
  .delete(deleteClient);

// New routes as per requirements
router.get('/client/:id', getClientById);
router.put('/client/:id/nutrition', updateClientNutrition);
router.put('/client/:id/workout', updateClientWorkout);

router.route('/analytics')
  .get(getAdminAnalytics);

router.route('/reports')
  .get(getAllReports);

module.exports = router;
