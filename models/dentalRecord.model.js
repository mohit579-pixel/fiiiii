import mongoose from 'mongoose';

const dentalRecordSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileType: {
    type: String,
    enum: ['xray', 'image', 'document'],
    default: 'document'
  },
  fileUrl: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
dentalRecordSchema.index({ patientId: 1, uploadDate: -1 });
dentalRecordSchema.index({ tags: 1 });

const DentalRecord = mongoose.model('DentalRecord', dentalRecordSchema);
export default DentalRecord; 