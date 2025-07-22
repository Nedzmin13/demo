// server/src/routes/poiRoutes.js
import express from 'express';
import {
    getFeaturedPoisByProvince,
    createPoi,
    updatePoi,
    deletePoi,
    getPoiDetails, deleteImage, addImagesToPoi
} from '../controllers/poiController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/featured-by-province/:provinceId').get(getFeaturedPoisByProvince);
router.route('/').post(protect, upload.array('images'), createPoi);
router.route('/:id')
    .put(protect, upload.none(), updatePoi) // upload.none() per accettare FormData senza file
    .delete(protect, deletePoi);
router.route('/:id/details').get(protect, getPoiDetails);
router.route('/:id/images').post(protect, upload.array('newImages'), addImagesToPoi);
router.route('/images/:imageId').delete(protect, deleteImage);


export default router;