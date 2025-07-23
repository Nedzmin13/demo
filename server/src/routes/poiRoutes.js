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

// --- Rotte Admin ---
router.route('/')
    .post(protect, upload.array('images'), createPoi);

router.route('/:id/details')
    .get(protect, getPoiDetailsById);

router.route('/:id')
    .put(protect, updatePoi) // L'update gestisce solo il testo
    .delete(protect, deletePoi);

// Rotta separata per aggiungere immagini a un POI esistente
router.route('/:id/images')
    .post(protect, upload.array('newImages'), addImagesToPoi);

router.route('/images/:imageId')
    .delete(protect, deleteImage);


// --- Rotte Pubbliche ---
router.route('/featured-by-province/:provinceId')
    .get(getFeaturedPoisByProvince);

router.route('/:id')
    .get(getPoiDetailsById); // La rotta pubblica per i dettagli

export default router;