import express from 'express';
import { getAllStrikes, createStrike, updateStrike, deleteStrike } from '../controllers/strikesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getAllStrikes);
router.route('/admin').post(protect, createStrike);
router.route('/admin/:id').put(protect, updateStrike).delete(protect, deleteStrike);

export default router;