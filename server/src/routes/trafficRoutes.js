import express from 'express';
import { getAllTrafficAlerts, createTrafficAlert, updateTrafficAlert, deleteTrafficAlert } from '../controllers/trafficController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getAllTrafficAlerts);
router.route('/admin').post(protect, createTrafficAlert);
router.route('/admin/:id').put(protect, updateTrafficAlert).delete(protect, deleteTrafficAlert);

export default router;