import { Router } from "express";
import { isLoggedIn, isDoctor, isAdmin } from '../middlewares/auth.middleware.js';
import {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientMedicalHistory,
  updateMedicalHistory,
  getPatientTreatmentPlans,
  searchPatients
} from '../controller/patient.controller.js';

const router = Router();

// Helper function to wrap async controllers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Protected routes - require authentication
router.use(isLoggedIn);

// Routes accessible by doctors and admins
router.get('/', isDoctor, asyncHandler(getAllPatients));
router.get('/search', isDoctor, asyncHandler(searchPatients));
router.get('/:id', isDoctor, asyncHandler(getPatientById));
router.get('/:id/medical-history', isDoctor, asyncHandler(getPatientMedicalHistory));
router.get('/:id/treatment-plans', isDoctor, asyncHandler(getPatientTreatmentPlans));

// Routes for updating patient data (accessible by doctors)
router.post('/', isDoctor, asyncHandler(createPatient));
router.put('/:id', isDoctor, asyncHandler(updatePatient));
router.put('/:id/medical-history', isDoctor, asyncHandler(updateMedicalHistory));

// Admin only routes
router.delete('/:id', isAdmin, asyncHandler(deletePatient));

export default router;