import express from 'express';
import {
    getDestinationsBySeason,
    getDestinationById,
    getAllDestinationsForAdmin,
    createDestination,
    updateDestination,
    deleteDestination,
    deleteDestinationImage
} from '../controllers/destinationsController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// --- Rotte Admin ---
router.route('/admin')
    .get(protect, getAllDestinationsForAdmin)
    .post(protect, upload.array('images'), createDestination);

router.route('/admin/:id')
    .put(protect, upload.array('newImages'), updateDestination)
    .delete(protect, deleteDestination);

router.route('/admin/images/:imageId')
    .delete(protect, deleteDestinationImage);


// --- Rotte Pubbliche (devono stare dopo quelle admin per evitare conflitti di path) ---
router.route('/').get(getDestinationsBySeason);
router.route('/:id').get(getDestinationById);

export default router;