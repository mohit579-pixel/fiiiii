import express from 'express';
import { analyzeDentalImage } from '../controller/dentalAnalysis.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Route for dental image analysis
router.post('/analyze', verifyToken, analyzeDentalImage);

export default router; 