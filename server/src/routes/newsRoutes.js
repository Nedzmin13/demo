import express from 'express';
import { getAllNews, getAllNewsForAdmin, createNews, updateNews, deleteNews } from '../controllers/newsController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/').get(getAllNews); // Rotta pubblica
router.route('/admin').get(protect, getAllNewsForAdmin).post(protect, upload.single('image'), createNews);
router.route('/admin/:id').put(protect, upload.single('image'), updateNews).delete(protect, deleteNews);

export default router;