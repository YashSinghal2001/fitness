import express from 'express';
import { getClientDashboard, getClientReports } from '../controllers/clientController';

const router = express.Router();

router.get('/dashboard', getClientDashboard);
router.get('/reports', getClientReports);

export default router;