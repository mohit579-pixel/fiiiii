import { TreatmentPlan } from '../models/treatmentPlan.model.js';
import { validateObjectId } from '../utils/validation.js';
import ApiError from '../utils/ApiError.js';

// Create a new treatment plan
const createTreatmentPlan = async (req, res) => {
  try {
    const { name, description, estimatedTotalDuration, totalCost, steps } = req.body;
    if (!name || !description || !estimatedTotalDuration || !totalCost || !steps || !Array.isArray(steps)) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const treatmentPlan = new TreatmentPlan({ name, description, estimatedTotalDuration, totalCost, steps });
    await treatmentPlan.save();
    res.status(201).json({
      success: true,
      message: 'Treatment plan created successfully',
      data: treatmentPlan
    });
  } catch (error) {
    console.error('Error creating treatment plan:', error);
    res.status(500).json({ message: 'Error creating treatment plan' });
  }
};

// Get all treatment plans
const getTreatmentPlans = async (req, res) => {
  try {
    const treatmentPlans = await TreatmentPlan.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: treatmentPlans
    });
  } catch (error) {
    console.error('Error fetching treatment plans:', error);
    res.status(500).json({ message: 'Error fetching treatment plans' });
  }
};

// Get a specific treatment plan
const getTreatmentPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const treatmentPlan = await TreatmentPlan.findById(planId);
    if (!treatmentPlan) {
      return res.status(404).json({ message: 'Treatment plan not found' });
    }
    res.json({
      success: true,
      data: treatmentPlan
    });
  } catch (error) {
    console.error('Error fetching treatment plan:', error);
    res.status(500).json({ message: 'Error fetching treatment plan' });
  }
};

// Update a treatment plan
const updateTreatmentPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const updates = req.body;
    const treatmentPlan = await TreatmentPlan.findById(planId);
    if (!treatmentPlan) {
      return res.status(404).json({ message: 'Treatment plan not found' });
    }
    // Only update allowed fields
    ['name', 'description', 'estimatedTotalDuration', 'totalCost', 'steps'].forEach(field => {
      if (updates[field] !== undefined) treatmentPlan[field] = updates[field];
    });
    await treatmentPlan.save();
    res.json({
      success: true,
      message: 'Treatment plan updated successfully',
      data: treatmentPlan
    });
  } catch (error) {
    console.error('Error updating treatment plan:', error);
    res.status(500).json({ message: 'Error updating treatment plan' });
  }
};

// Delete a treatment plan
const deleteTreatmentPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const treatmentPlan = await TreatmentPlan.findById(planId);
    if (!treatmentPlan) {
      return res.status(404).json({ message: 'Treatment plan not found' });
    }
    await treatmentPlan.deleteOne();
    res.json({
      success: true,
      message: 'Treatment plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting treatment plan:', error);
    res.status(500).json({ message: 'Error deleting treatment plan' });
  }
};

// Get patient's treatment plans
const getPatientTreatmentPlans = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!validateObjectId(patientId)) {
      throw new ApiError(400, 'Invalid patient ID');
    }

    const treatmentPlans = await TreatmentPlan.find({ patientId })
      .populate('patientId', 'fullName email phone age gender')
      .populate('doctorId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: treatmentPlans
    });
  } catch (error) {
    console.error('Error fetching patient treatment plans:', error);
    throw new ApiError(500, 'Error fetching patient treatment plans');
  }
};

export {
  createTreatmentPlan,
  getTreatmentPlan,
  updateTreatmentPlan,
  deleteTreatmentPlan,
  getPatientTreatmentPlans
}; 