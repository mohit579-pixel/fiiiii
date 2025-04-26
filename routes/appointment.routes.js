import express from 'express';
import {
  getAllAppointments,
  getAppointmentById,
  getPatientAppointments,
  getDoctorAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
  getDoctorAvailableSlots,
  deleteAppointment,
  getTodayAppointments,
  updateAppointmentStatus,
  addDiagnosis,
  uploadImages,
  getDoctorCompletedAppointments
} from '../controller/appointment.controller.js';
import { isLoggedIn, isAdmin, isDoctor, isPatient, isAuthorized } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/multer.middlewares.js';

const router = express.Router();

// Public routes
router.get('/available-slots', getDoctorAvailableSlots); // Allow checking availability without login

// Protected routes - require authentication
router.use(isLoggedIn);

// Routes for patients
router.get('/patient/:patientId', getPatientAppointments);
router.post('/create', createAppointment);

// Routes that need specific resource authorization
router.get('/:id', getAppointmentById);
router.patch('/cancel/:id', isLoggedIn, cancelAppointment);
router.put('/:id', isAuthorized, updateAppointment); 
router.patch('/status/:id', isLoggedIn, updateAppointment);

// Doctor routes
router.get('/doctor/:doctorId', getDoctorAppointments);
router.get('/doctor/:doctorId/today', getTodayAppointments);
router.get('/doctor/:doctorId/completed', getDoctorCompletedAppointments);

// Admin routes
router.get('/', isAdmin, getAllAppointments);
router.delete('/:id', isAdmin, deleteAppointment);

// New route for diagnosis
router.post('/:id/diagnosis', isDoctor, addDiagnosis);

// Upload images for diagnosis
router.post('/upload', isLoggedIn, isDoctor, upload.array('file', 5), uploadImages);

export default router;