import { Router } from "express";
import { isLoggedIn, isDoctor, isAdmin } from '../middlewares/auth.middleware.js';
import {
  getAllTreatmentPlans,
  getTreatmentPlanById,
  createTreatmentPlan,
  updateTreatmentPlan,
  deleteTreatmentPlan,
  getDoctorTreatmentPlans,
  getPatientTreatmentPlans,
  updateTreatmentStatus
} from '../controller/treatment.controller.js';

const router = Router();

// Helper function to wrap async controllers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Protected routes - require authentication
router.use(isLoggedIn);

// Routes accessible by doctors
router.get('/doctor/:doctorId', isDoctor, asyncHandler(getDoctorTreatmentPlans));
router.post('/', isDoctor, asyncHandler(createTreatmentPlan));
router.get('/:id', isDoctor, asyncHandler(getTreatmentPlanById));
router.put('/:id', isDoctor, asyncHandler(updateTreatmentPlan));
router.patch('/:id/status', isDoctor, asyncHandler(updateTreatmentStatus));

// Routes accessible by patients
router.get('/patient/:patientId', asyncHandler(getPatientTreatmentPlans));

// Admin routes
router.get('/', isAdmin, asyncHandler(getAllTreatmentPlans));
router.delete('/:id', isAdmin, asyncHandler(deleteTreatmentPlan));

export default router; 