import { Router } from 'express';
import { isLoggedIn, isDoctor, isAdmin } from '../middlewares/auth.middleware.js';
import {
  getDoctorAnalytics,
  getClinicAnalytics,
  getPatientStatistics,
  getTreatmentStatistics,
  getRevenueAnalytics,
  getAppointmentAnalytics
} from '../controller/analytics.controller.js';

const router = Router();

// Helper function to wrap async controllers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Protected routes - require authentication
router.use(isLoggedIn);

// Doctor analytics routes
router.get('/doctor/:doctorId', isDoctor, asyncHandler(getDoctorAnalytics));
router.get('/doctor/:doctorId/patients', isDoctor, asyncHandler(getPatientStatistics));
router.get('/doctor/:doctorId/treatments', isDoctor, asyncHandler(getTreatmentStatistics));
router.get('/doctor/:doctorId/revenue', isDoctor, asyncHandler(getRevenueAnalytics));
router.get('/doctor/:doctorId/appointments', isDoctor, asyncHandler(getAppointmentAnalytics));

// Admin analytics routes
router.get('/clinic', isAdmin, asyncHandler(getClinicAnalytics));

export default router; 