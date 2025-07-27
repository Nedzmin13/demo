import express from 'express';
import {
    getAllItineraries,
    getItineraryById,
    createItinerary,
    updateItinerary,
    deleteItinerary,
    addItineraryImages,
    deleteItineraryImage
} from '../controllers/itinerariesController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/').get(getAllItineraries);
router.route('/:id').get(getItineraryById);

// --- Rotte Admin ---
router.route('/admin/all').get(protect, getAllItineraries);

// La creazione riceve testo e file con nome 'images'
router.route('/admin').post(protect, upload.array('images'), createItinerary);

router.route('/admin/:id')
    .get(protect, getItineraryById)
    // --- CORREZIONE QUI: Usa 'images' anche per l'update ---
    .put(protect, upload.array('images'), updateItinerary)
    .delete(protect, deleteItinerary);

// Questa rotta non è più necessaria perché l'update gestisce già le immagini
// router.route('/admin/:id/images')...

router.route('/admin/images/:imageId')
    .delete(protect, deleteItineraryImage);

export default router;