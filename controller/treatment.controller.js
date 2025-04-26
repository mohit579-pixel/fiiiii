import TreatmentPlan from '../models/treatment.model.js';
import AppError from '../utils/error.utils.js';

// Get all treatment plans (admin only)
export const getAllTreatmentPlans = async (req, res) => {
  const plans = await TreatmentPlan.find()
    .populate('patientId', 'fullName email')
    .populate('doctorId', 'fullName email');
  
  res.status(200).json({
    success: true,
    message: 'All treatment plans retrieved successfully',
    data: plans
  });
};

// Get treatment plan by ID
export const getTreatmentPlanById = async (req, res) => {
  const { id } = req.params;
  
  const plan = await TreatmentPlan.findById(id)
    .populate('patientId', 'fullName email')
    .populate('doctorId', 'fullName email');
  
  if (!plan) {
    throw new AppError('Treatment plan not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Treatment plan retrieved successfully',
    data: plan
  });
};

// Create new treatment plan
export const createTreatmentPlan = async (req, res) => {
  const {
    patientId,
    procedure,
    description,
    startDate,
    endDate,
    cost,
    teeth,
    notes
  } = req.body;
  
  const doctorId = req.user._id; // Get doctor ID from authenticated user
  
  const plan = await TreatmentPlan.create({
    patientId,
    doctorId,
    procedure,
    description,
    startDate,
    endDate,
    cost,
    teeth,
    notes
  });
  
  res.status(201).json({
    success: true,
    message: 'Treatment plan created successfully',
    data: plan
  });
};

// Update treatment plan
export const updateTreatmentPlan = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const plan = await TreatmentPlan.findById(id);
  
  if (!plan) {
    throw new AppError('Treatment plan not found', 404);
  }
  
  // Ensure doctor can only update their own treatment plans
  if (plan.doctorId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update this treatment plan', 403);
  }
  
  const updatedPlan = await TreatmentPlan.findByIdAndUpdate(
    id,
    { ...updateData, updatedAt: Date.now() },
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    success: true,
    message: 'Treatment plan updated successfully',
    data: updatedPlan
  });
};

// Update treatment status
export const updateTreatmentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const plan = await TreatmentPlan.findById(id);
  
  if (!plan) {
    throw new AppError('Treatment plan not found', 404);
  }
  
  // Ensure doctor can only update their own treatment plans
  if (plan.doctorId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to update this treatment plan', 403);
  }
  
  plan.status = status;
  plan.updatedAt = Date.now();
  
  if (status === 'completed') {
    plan.progressNotes.push({
      note: 'Treatment completed',
      updatedBy: req.user._id
    });
  }
  
  await plan.save();
  
  res.status(200).json({
    success: true,
    message: 'Treatment status updated successfully',
    data: plan
  });
};

// Delete treatment plan (admin only)
export const deleteTreatmentPlan = async (req, res) => {
  const { id } = req.params;
  
  const plan = await TreatmentPlan.findByIdAndDelete(id);
  
  if (!plan) {
    throw new AppError('Treatment plan not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Treatment plan deleted successfully'
  });
};

// Get doctor's treatment plans
export const getDoctorTreatmentPlans = async (req, res) => {
  const { doctorId } = req.params;
  
  const plans = await TreatmentPlan.find({ doctorId })
    .populate('patientId', 'fullName email')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    message: 'Doctor treatment plans retrieved successfully',
    data: plans
  });
};

// Get patient's treatment plans
export const getPatientTreatmentPlans = async (req, res) => {
  const { patientId } = req.params;
  
  const plans = await TreatmentPlan.find({ patientId })
    .populate('doctorId', 'fullName email')
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    success: true,
    message: 'Patient treatment plans retrieved successfully',
    data: plans
  });
}; 