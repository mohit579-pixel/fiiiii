import mongoose from 'mongoose';

const treatmentPlanSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  procedure: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['planned', 'in-progress', 'completed', 'cancelled'],
    default: 'planned'
  },
  cost: {
    type: Number,
    required: true
  },
  notes: {
    type: String
  },
  teeth: [{
    number: Number,
    condition: String,
    treatment: String
  }],
  attachments: [{
    type: String,  // URLs to x-rays, images, etc.
  }],
  progressNotes: [{
    date: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    }
  }],
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
treatmentPlanSchema.index({ patientId: 1, doctorId: 1 });
treatmentPlanSchema.index({ status: 1 });
treatmentPlanSchema.index({ startDate: 1, endDate: 1 });

const TreatmentPlan = mongoose.model('TreatmentPlan', treatmentPlanSchema);

export default TreatmentPlan; 