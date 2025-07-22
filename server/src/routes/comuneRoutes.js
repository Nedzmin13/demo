import express from 'express';
import {
    getComuneBySlug, getAllComuniForAdmin, getComuneByIdForAdmin,
    updateComune, addComuneImages, deleteComuneImage
} from '../controllers/comuniController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// --- Rotte Admin ---
router.route('/').get(protect, getAllComuniForAdmin);

router.route('/admin/:id')
    .get(protect, getComuneByIdForAdmin)
    // --- CORREZIONE QUI: Rimuovi upload.array() ---
    .put(protect, updateComune);

router.route('/admin/:id/images')
    // Questa è la rotta che deve gestire l'upload
    .post(protect, upload.array('newImages'), addComuneImages);

router.route('/admin/images/:imageId').delete(protect, deleteComuneImage);

// --- Rotte Pubbliche ---
router.route('/:slug').get(getComuneBySlug);

export default router;