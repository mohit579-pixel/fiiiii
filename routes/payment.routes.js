import express from 'express';
import { createPaymentOrder, verifyPayment } from '../controller/payment.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Create payment order
router.post('/create-order/:appointmentId', verifyToken, createPaymentOrder);

// Verify payment
router.post('/verify/:appointmentId', verifyToken, verifyPayment);

export default router; 