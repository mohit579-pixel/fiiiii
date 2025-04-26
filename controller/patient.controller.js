import Patient from '../models/patient.models.js';
import TreatmentPlan from '../models/treatment.model.js';
import Appointment from '../models/appointment.models.js';
import AppError from '../utils/error.utils.js';

// Get all patients
export const getAllPatients = async (req, res) => {
  const patients = await Patient.find()
    .select('-password')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    message: 'All patients retrieved successfully',
    data: patients
  });
};

// Search patients
export const searchPatients = async (req, res) => {
  const { query } = req.query;
  
  const patients = await Patient.find({
    $or: [
      { fullName: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } },
      { phone: { $regex: query, $options: 'i' } }
    ]
  }).select('-password');
  
  res.status(200).json({
    success: true,
    message: 'Patients search completed',
    data: patients
  });
};

// Get patient by ID
export const getPatientById = async (req, res) => {
  const { id } = req.params;
  
  const patient = await Patient.findById(id).select('-password');
  
  if (!patient) {
    throw new AppError('Patient not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Patient retrieved successfully',
    data: patient
  });
};

// Create new patient
export const createPatient = async (req, res) => {
  const {
    fullName,
    email,
    phone,
    age,
    gender,
    bloodGroup,
    address,
    medicalHistory
  } = req.body;
  
  // Check if patient with email already exists
  const existingPatient = await Patient.findOne({ email });
  
  if (existingPatient) {
    throw new AppError('Patient with this email already exists', 400);
  }
  
  const patient = await Patient.create({
    fullName,
    email,
    phone,
    age,
    gender,
    bloodGroup,
    address,
    medicalHistory
  });
  
  res.status(201).json({
    success: true,
    message: 'Patient created successfully',
    data: patient
  });
};

// Update patient
export const updatePatient = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const patient = await Patient.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');
  
  if (!patient) {
    throw new AppError('Patient not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Patient updated successfully',
    data: patient
  });
};

// Delete patient
export const deletePatient = async (req, res) => {
  const { id } = req.params;
  
  const patient = await Patient.findByIdAndDelete(id);
  
  if (!patient) {
    throw new AppError('Patient not found', 404);
  }
  
  // Delete associated appointments and treatment plans
  await Appointment.deleteMany({ patientId: id });
  await TreatmentPlan.deleteMany({ patientId: id });
  
  res.status(200).json({
    success: true,
    message: 'Patient and associated records deleted successfully'
  });
};

// Get patient's medical history
export const getPatientMedicalHistory = async (req, res) => {
  const { id } = req.params;
  
  const patient = await Patient.findById(id)
    .select('medicalHistory')
    .populate({
      path: 'medicalHistory.treatments',
      populate: {
        path: 'doctorId',
        select: 'fullName'
      }
    });
  
  if (!patient) {
    throw new AppError('Patient not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Patient medical history retrieved successfully',
    data: patient.medicalHistory
  });
};

// Update patient's medical history
export const updateMedicalHistory = async (req, res) => {
  const { id } = req.params;
  const { medicalHistory } = req.body;
  
  const patient = await Patient.findByIdAndUpdate(
    id,
    { $set: { medicalHistory } },
    { new: true, runValidators: true }
  ).select('medicalHistory');
  
  if (!patient) {
    throw new AppError('Patient not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Medical history updated successfully',
    data: patient.medicalHistory
  });
};

// Get patient's treatment plans
export const getPatientTreatmentPlans = async (req, res) => {
  const { id } = req.params;
  
  const treatmentPlans = await TreatmentPlan.find({ patientId: id })
    .populate('doctorId', 'fullName')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    message: 'Patient treatment plans retrieved successfully',
    data: treatmentPlans
  });
};
