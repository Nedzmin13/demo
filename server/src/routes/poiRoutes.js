// server/routes/poiRoutes.js

import express from 'express';
import {
    getFeaturedPoisByProvince,
    getPoiDetailsById,
    createPoi,
    updatePoi,
    deletePoi,
    addImagesToPoi,
    deleteImage
} from '../controllers/poiController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// --- ROTTE PUBBLICHE ---
router.route('/featured-by-province/:provinceId').get(getFeaturedPoisByProvince);
router.route('/:id').get(getPoiDetailsById);

// --- ROTTE ADMIN (con prefisso /admin) ---
router.route('/admin').post(protect, upload.array('images'), createPoi);

router.route('/admin/:id/details').get(protect, getPoiDetailsById);

// ---> CORREZIONE QUI <---
// Aggiunto upload.any() per permettere al server di leggere il body multipart/form-data
router.route('/admin/:id')
    .put(protect, upload.any(), updatePoi) // <--- MODIFICA
    .delete(protect, deletePoi);

router.route('/admin/:id/images')
    .post(protect, upload.array('newImages'), addImagesToPoi);

router.route('/admin/images/:imageId')
    .delete(protect, deleteImage);

export default router;