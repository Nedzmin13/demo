import express from 'express';
import { getAllNews, getNewsById, getAllNewsForAdmin, createNews, updateNews, deleteNews } from '../controllers/newsController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Rotte Admin
router.route('/admin').get(protect, getAllNewsForAdmin).post(protect, upload.single('image'), createNews);
router.route('/admin/:id').put(protect, upload.single('image'), updateNews).delete(protect, deleteNews);

// Rotte Pubbliche
router.route('/').get(getAllNews);
router.route('/:id').get(getNewsById); // <-- NUOVA ROTTA PUBBLICA

export default router;