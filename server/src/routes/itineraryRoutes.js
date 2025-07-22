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

// --- Rotte Pubbliche ---
router.route('/').get(getAllItineraries);
router.route('/:id').get(getItineraryById);

// --- Rotte Admin ---
// La rotta per ottenere la lista per l'admin riutilizza la funzione pubblica 'getAllItineraries'
router.route('/admin/all').get(protect, getAllItineraries);

router.route('/admin').post(protect, upload.array('images'), createItinerary);

router.route('/admin/:id')
    .get(protect, getItineraryById)
    .put(protect, upload.array('newImages'), updateItinerary)
    .delete(protect, deleteItinerary);

router.route('/admin/:id/images')
    .post(protect, upload.array('images'), addItineraryImages);

router.route('/admin/images/:imageId')
    .delete(protect, deleteItineraryImage);

export default router;