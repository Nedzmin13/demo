import express from 'express';
import {
    getFeaturedPoisByProvince,
    getPoiDetailsById, // Importiamo solo questa
    createPoi, updatePoi, deletePoi,
    addImagesToPoi, deleteImage
} from '../controllers/poiController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// --- Rotte Admin ---
router.route('/').post(protect, upload.array('images'), createPoi);

// La rotta per i dettagli usata dal modale di modifica
router.route('/:id/details').get(protect, getPoiDetailsById); // USA LA FUNZIONE CORRETTA

router.route('/:id')
    .put(protect, updatePoi)
    .delete(protect, deletePoi);

router.route('/:id/images').post(protect, upload.array('newImages'), addImagesToPoi);
router.route('/images/:imageId').delete(protect, deleteImage);

// --- Rotte Pubbliche ---
router.route('/featured-by-province/:provinceId').get(getFeaturedPoisByProvince);
router.route('/:id').get(getPoiDetailsById); // Anche la rotta pubblica usa la stessa funzione

export default router;