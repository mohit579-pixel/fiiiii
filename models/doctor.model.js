import mongoose from 'mongoose';
import Appointment from './appointment.models.js';

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Doctor name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  speciality: {
    type: String,
    required: [true, 'Speciality is required'],
    enum: ['General Dentist', 'Orthodontist', 'Periodontist', 'Endodontist', 'Oral Surgeon', 'Pediatric Dentist', 'Prosthodontist'],
  },
  experience: {
    type: Number,
    default: 0
  },
  qualifications: [String],
  bio: {
    type: String,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  available: {
    type: Boolean,
    default: true
  },
  workingHours: {
    monday: { start: String, end: String, isWorking: Boolean },
    tuesday: { start: String, end: String, isWorking: Boolean },
    wednesday: { start: String, end: String, isWorking: Boolean },
    thursday: { start: String, end: String, isWorking: Boolean },
    friday: { start: String, end: String, isWorking: Boolean },
    saturday: { start: String, end: String, isWorking: Boolean },
    sunday: { start: String, end: String, isWorking: Boolean }
  },
  slotDuration: {
    type: Number,
    default: 30, // Duration in minutes
    enum: [15, 30, 45, 60]
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting all appointments for this doctor
doctorSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'doctorId'
});

// Method to calculate available time slots for a specific date
doctorSchema.methods.getAvailableSlots = async function(date) {
  const dayOfWeek = new Date(date).toLocaleString('en-US', { weekday: 'lowercase' });
  const workingHours = this.workingHours[dayOfWeek];
  
  // If not working on that day, return empty array
  if (!workingHours || !workingHours.isWorking) {
    return [];
  }
  
  // Get start and end times
  const [startHour, startMinute] = workingHours.start.split(':').map(Number);
  const [endHour, endMinute] = workingHours.end.split(':').map(Number);
  
  const startTime = new Date(date);
  startTime.setHours(startHour, startMinute, 0, 0);
  
  const endTime = new Date(date);
  endTime.setHours(endHour, endMinute, 0, 0);
  
  // Calculate slots
  const slots = [];
  let currentSlot = new Date(startTime);
  
  while (currentSlot < endTime) {
    slots.push({
      startTime: `${currentSlot.getHours().toString().padStart(2, '0')}:${currentSlot.getMinutes().toString().padStart(2, '0')}`,
      endTime: null // Will be calculated in the controller
    });
    
    // Move to next slot based on duration
    currentSlot = new Date(currentSlot.getTime() + this.slotDuration * 60000);
  }
  
  // Get booked appointments for this doctor on this date
  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);
  
  const dateEnd = new Date(date);
  dateEnd.setHours(23, 59, 59, 999);
  
  const bookedAppointments = await Appointment.find({
    doctorId: this._id,
    date: { $gte: dateStart, $lte: dateEnd },
    status: { $ne: 'canceled' }
  });
  
  // Filter out booked slots
  const availableSlots = slots.filter(slot => {
    const [slotHour, slotMinute] = slot.startTime.split(':').map(Number);
    const slotTime = new Date(date);
    slotTime.setHours(slotHour, slotMinute, 0, 0);
    
    return !bookedAppointments.some(appointment => {
      const [appHour, appMinute] = appointment.startTime.split(':').map(Number);
      const appTime = new Date(appointment.date);
      appTime.setHours(appHour, appMinute, 0, 0);
      
      return Math.abs(slotTime - appTime) < this.slotDuration * 60000;
    });
  });
  
  return availableSlots;
};

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;