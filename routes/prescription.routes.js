import express from 'express';
import { generatePrescription } from '../controller/prescription.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:appointmentId', verifyToken, generatePrescription);

export default router; 