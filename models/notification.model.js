import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['appointment', 'reminder', 'treatment', 'payment', 'general'],
      default: 'general',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Object,
      default: {},
    },
    linkTo: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 