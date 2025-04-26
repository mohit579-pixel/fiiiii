import mongoose from 'mongoose';

const TreatmentStepSchema = new mongoose.Schema({
  description: { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true }
});

const TreatmentPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  estimatedTotalDuration: { type: Number }, // days
  totalCost: { type: Number },
  steps: [TreatmentStepSchema]
}, {
  timestamps: true
});

if (mongoose.models.TreatmentPlan) {
  delete mongoose.models.TreatmentPlan;
}

export const TreatmentPlan = mongoose.model('TreatmentPlan', TreatmentPlanSchema);