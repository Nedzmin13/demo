import express from 'express';
import {
    getProvinceBySigla,
    getAllProvincesForAdmin,
    updateProvince
} from '../controllers/provincesController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Rotte Admin (prima) ---
router.route('/admin').get(protect, getAllProvincesForAdmin);
router.route('/admin/:id').put(protect, updateProvince);

// --- Rotta Pubblica (dopo) ---
router.route('/:sigla').get(getProvinceBySigla);

export default router;