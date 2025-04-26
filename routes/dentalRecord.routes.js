import express from 'express';
const router = express.Router();
import { isLoggedIn, isDoctor } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middlewares.js';
import {
  uploadDentalRecord,
  getDentalRecords,
  deleteDentalRecord
  } from '../controller/dentalRecord.controller.js';

// Get all dental records for a patient
router.get('/:patientId', isLoggedIn, getDentalRecords);

// Upload a new dental record
router.post(
  '/upload',
  isLoggedIn,
  upload.single('file'),
  uploadDentalRecord
);

// Delete a dental record
router.delete('/:recordId', isLoggedIn, deleteDentalRecord);

export default router; 