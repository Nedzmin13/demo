import express from 'express';
import {
    getAllRegions,
    getRegionByName,
    getAllRegionsForAdmin,
    updateRegion
} from '../controllers/regionsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Rotte Admin (le mettiamo prima) ---
router.route('/admin').get(protect, getAllRegionsForAdmin);
router.route('/admin/:id').put(protect, updateRegion);

// --- Rotte Pubbliche (le mettiamo dopo) ---
router.route('/').get(getAllRegions);
router.route('/:name').get(getRegionByName);

export default router;