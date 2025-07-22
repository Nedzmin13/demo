// server/src/routes/utilityRoutes.js
import express from 'express';
import { getUtilityInfo } from '../controllers/utilityController.js';

const router = express.Router();
router.route('/all').get(getUtilityInfo);
export default router;