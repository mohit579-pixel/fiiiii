import express from 'express';
import {
  getAllDoctors,
  getDoctor,
  getDoctorsBySpeciality,
  getAvailableSlots,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  updateWorkingHours,
  getDoctorAppointments,
  getDoctorDashboard,
  getDoctorTodayAppointments,
  getDoctorUpcomingAppointments,
  getDoctorPatients,
  getDoctorTreatmentPlans,
  getDoctorAnalytics,
  getDoctorByUserId
} from '../controller/doctor.controller.js';
import * as authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Helper function to wrap async controllers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Public routes
router.get('/', asyncHandler(getAllDoctors));
router.get('/:id', asyncHandler(getDoctor));
router.get('/speciality/:speciality', asyncHandler(getDoctorsBySpeciality));
router.get('/:id/available-slots', asyncHandler(getAvailableSlots));

// Protected routes (require authentication)
router.use(authMiddleware.isLoggedIn);

// Doctor dashboard and related routes
router.get('/:id/dashboard', authMiddleware.isDoctor, asyncHandler(getDoctorDashboard));
router.get('/:id/appointments/today', authMiddleware.isDoctor, asyncHandler(getDoctorTodayAppointments));
router.get('/:id/appointments/upcoming', authMiddleware.isDoctor, asyncHandler(getDoctorUpcomingAppointments));
router.get('/:id/appointments', authMiddleware.isDoctor, asyncHandler(getDoctorAppointments));
router.get('/:id/patients', authMiddleware.isDoctor, asyncHandler(getDoctorPatients));
router.get('/:id/treatment-plans', authMiddleware.isDoctor, asyncHandler(getDoctorTreatmentPlans));
router.get('/:id/analytics', authMiddleware.isDoctor, asyncHandler(getDoctorAnalytics));

// Get doctor by userId
router.get('/user/:userId', authMiddleware.isDoctor, asyncHandler(getDoctorByUserId));

// Doctor profile management
router.patch('/:id', authMiddleware.isDoctor, asyncHandler(updateDoctor));
router.patch('/:id/working-hours', authMiddleware.isDoctor, asyncHandler(updateWorkingHours));

// Admin only routes
router.post('/', authMiddleware.isAdmin, asyncHandler(createDoctor));
router.delete('/:id', authMiddleware.isAdmin, asyncHandler(deleteDoctor));

export default router;