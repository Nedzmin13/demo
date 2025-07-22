import express from 'express';
import {
    getAllOffers, getPublicOfferById, getAllOffersForAdmin, createOffer,
    updateOffer, deleteOffer, addOfferImages, deleteOfferImage
} from '../controllers/offersController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Rotte Admin
router.route('/admin')
    .get(protect, getAllOffersForAdmin)
    .post(protect, upload.array('images'), createOffer);
router.route('/admin/:id')
    .put(protect, upload.array('images'), updateOffer)
    .delete(protect, deleteOffer);
router.route('/admin/images/:imageId')
    .delete(protect, deleteOfferImage);

// Rotte Pubbliche
router.route('/').get(getAllOffers);
router.route('/:id').get(getPublicOfferById);

export default router;