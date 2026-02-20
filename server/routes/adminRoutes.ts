import express from 'express';
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getAdminAnalytics,
  getAllReports
} from '../controllers/adminController';

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

export default router;