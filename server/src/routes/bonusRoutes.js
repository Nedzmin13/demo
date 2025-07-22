// server/src/routes/bonusRoutes.js
import express from 'express';
import { getBonuses, createBonus, updateBonus, deleteBonus } from '../controllers/bonusesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rotta pubblica
router.route('/').get(getBonuses);

// Rotte Admin
router.route('/admin').post(protect, createBonus);
router.route('/admin/:id')
    .put(protect, updateBonus)
    .delete(protect, deleteBonus);

export default router;