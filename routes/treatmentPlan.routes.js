import express from 'express';
import { isLoggedIn, isDoctor } from '../middlewares/auth.middleware.js';
import {
  createTreatmentPlan,
  getTreatmentPlan,
  updateTreatmentPlan,
  deleteTreatmentPlan,
  getPatientTreatmentPlans
} from '../controllers/treatmentPlan.controller.js';

const router = express.Router();

// Create a new treatment plan (Doctor only)
router.post('/', isLoggedIn, isDoctor, createTreatmentPlan);

// Get all treatment plans for a doctor


// Get all treatment plans for a patient
router.get('/patient/:patientId', isLoggedIn, getPatientTreatmentPlans);

// Get a specific treatment plan
router.get('/:planId', isLoggedIn, getTreatmentPlan);

// Update a treatment plan (Doctor only)
router.put('/:planId', isLoggedIn, isDoctor, updateTreatmentPlan);

// Delete a treatment plan (Doctor only)
router.delete('/:planId', isLoggedIn, isDoctor, deleteTreatmentPlan);

export default router; 