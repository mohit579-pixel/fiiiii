import Doctor from '../models/doctor.model.js';
import Appointment from '../models/appointment.models.js';
import TreatmentPlan from '../models/treatment.model.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/error.utils.js';
import mongoose from 'mongoose';

// Get all doctors
export const getAllDoctors = catchAsync(async (req, res, next) => {
  const doctors = await Doctor.find();

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors
  });
});

// Get a single doctor
export const getDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  res.status(200).json({
    success: true,
    data: doctor
  });
});

// Create a new doctor
export const createDoctor = catchAsync(async (req, res, next) => {
  // Add userId from authenticated user
  req.body.userId = req.user._id;
  
  const doctor = await Doctor.create(req.body);

  res.status(201).json({
    success: true,
    data: doctor
  });
});

// Update a doctor
export const updateDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  res.status(200).json({
    success: true,
    data: doctor
  });
});

// Delete a doctor
export const deleteDoctor = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);

  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }

  res.status(204).json({
    success: true,
    data: null
  });
});

// Get doctor's appointments
export const getDoctorAppointments = catchAsync(async (req, res, next) => {
  const appointments = await Appointment.find({ doctorId: req.params.id })
    .populate('patientId', 'name email fullName')
    .sort({ date: 1, startTime: 1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

// Get available slots for a specific date
export const getAvailableSlots = catchAsync(async (req, res, next) => {
    const { date } = req.query;
    const doctorId = req.params.id;
    
    if (!date) {
      return next(new AppError('Please provide a date', 400));
    }
    
    // Find the doctor
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return next(new AppError('No doctor found with that ID', 404));
    }
    
    // Convert the date string to a Date object
    const appointmentDate = new Date(date);
    // Get day name in lowercase (monday, tuesday, etc.)
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[appointmentDate.getDay()];
    
    console.log("Doctor:", doctor.name);
    console.log("Working hours:", doctor.workingHours);
    console.log("Day of week:", dayOfWeek);
    
    // Check if the doctor works on this day
    if (!doctor.workingHours || !doctor.workingHours[dayOfWeek] || !doctor.workingHours[dayOfWeek].isWorking) {
      return res.status(200).json({
        success: true,
        message: 'Doctor does not work on this day',
        data: []
      });
    }
    
    // Get working hours for this day
    const workingHours = doctor.workingHours[dayOfWeek];
    const startTime = workingHours.start;
    const endTime = workingHours.end;
    
    // Calculate all possible slots based on doctor's slot duration (default to 30 min)
    const slotDuration = doctor.slotDuration || 30;
    const allPossibleSlots = [];
    
    let [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // Convert to minutes for easier calculation
    let currentTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = endHour * 60 + endMinute;
    
    // Generate all possible slots
    while (currentTimeInMinutes < endTimeInMinutes) {
      const hour = Math.floor(currentTimeInMinutes / 60);
      const minute = currentTimeInMinutes % 60;
      
      allPossibleSlots.push({
        startTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      });
      
      currentTimeInMinutes += slotDuration;
    }
    
    // Create new date objects for start and end of day to avoid mutating appointmentDate
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find existing appointments for this doctor on this date
    const existingAppointments = await Appointment.find({
      doctorId,
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });
    
    console.log("Existing appointments:", existingAppointments.length);
    
    // Filter out slots that overlap with existing appointments
    const availableSlots = allPossibleSlots.filter(slot => {
      const [slotHour, slotMinute] = slot.startTime.split(':').map(Number);
      const slotStartTime = slotHour * 60 + slotMinute;
      const slotEndTime = slotStartTime + slotDuration;
      
      // Check if this slot overlaps with any existing appointment
      return !existingAppointments.some(appointment => {
        const [appStartHour, appStartMinute] = appointment.startTime.split(':').map(Number);
        const [appEndHour, appEndMinute] = appointment.endTime.split(':').map(Number);
        
        const appStartTime = appStartHour * 60 + appStartMinute;
        const appEndTime = appEndHour * 60 + appEndMinute;
        
        // Check for overlap
        return (
          (slotStartTime >= appStartTime && slotStartTime < appEndTime) || 
          (slotEndTime > appStartTime && slotEndTime <= appEndTime) ||
          (slotStartTime <= appStartTime && slotEndTime >= appEndTime)
        );
      });
    });
    
    console.log("Available slots:", availableSlots.length);
    
    res.status(200).json({
      success: true,
      count: availableSlots.length,
      data: availableSlots
    });
  });

// Update doctor's working hours
export const updateWorkingHours = catchAsync(async (req, res, next) => {
  const { workingHours } = req.body;
  const doctorId = req.params.id;
  
  const doctor = await Doctor.findByIdAndUpdate(
    doctorId,
    { workingHours },
    { new: true, runValidators: true }
  );
  
  if (!doctor) {
    return next(new AppError('No doctor found with that ID', 404));
  }
  
  res.status(200).json({
    success: true,
    data: doctor
  });
});

// Get doctors by speciality
export const getDoctorsBySpeciality = catchAsync(async (req, res, next) => {
  const { speciality } = req.params;
  
  const doctors = await Doctor.find({ speciality });
  
  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors
  });
});

// Get doctor's today appointments
export const getDoctorTodayAppointments = catchAsync(async (req, res) => {
  const { id } = req.params;
  console.log(id);
  const doctor = await Doctor.find({userId: id});
  // const userId = Doctor.find({userId: id}).name;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  console.log("doctor id",doctor[0]._id);
  const appointments = await Appointment.find({
    doctorId: doctor[0]._id,
    date: {
      $gte: today,
      $lt: tomorrow
    }
  }).populate('patientId', 'fullName email phone');

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

// Get doctor's upcoming appointments
export const getDoctorUpcomingAppointments = catchAsync(async (req, res) => {
  const { id } = req.params;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const appointments = await Appointment.find({
    doctorId: id,
    date: { $gt: today }
  })
    .populate('patientId', 'fullName email phone')
    .sort({ date: 1, startTime: 1 });

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments
  });
});

// Get doctor's patients
export const getDoctorPatients = catchAsync(async (req, res) => {
  const { id } = req.params;

  const patients = await Appointment.distinct('patientId', { doctorId: id });
  const patientDetails = await Patient.find({
    _id: { $in: patients }
  }).select('-password');

  res.status(200).json({
    success: true,
    count: patientDetails.length,
    data: patientDetails
  });
});

// Get doctor's treatment plans
export const getDoctorTreatmentPlans = catchAsync(async (req, res) => {
  const { id } = req.params;

  const treatmentPlans = await TreatmentPlan.find({ doctorId: id })
    .populate('patientId', 'fullName email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: treatmentPlans.length,
    data: treatmentPlans
  });
});

// Get doctor's analytics
export const getDoctorAnalytics = catchAsync(async (req, res) => {
  const { id } = req.params;
  const timeRange = req.query.timeRange || '30'; // Default to 30 days

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeRange));

  // Get appointments statistics
  const appointments = await Appointment.find({
    doctorId: id,
    date: { $gte: startDate }
  });

  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;

  // Get treatment statistics
  const treatments = await TreatmentPlan.find({
    doctorId: id,
    createdAt: { $gte: startDate }
  });

  const totalTreatments = treatments.length;
  const completedTreatments = treatments.filter(t => t.status === 'completed').length;
  const ongoingTreatments = treatments.filter(t => t.status === 'in-progress').length;

  // Calculate revenue
  const revenue = treatments.reduce((total, treatment) => total + treatment.cost, 0);

  // Get patient statistics
  const uniquePatients = await Appointment.distinct('patientId', {
    doctorId: id,
    date: { $gte: startDate }
  });

  // Get procedure distribution
  const procedureStats = treatments.reduce((acc, curr) => {
    acc[curr.procedure] = (acc[curr.procedure] || 0) + 1;
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        completionRate: totalAppointments ? (completedAppointments / totalAppointments) * 100 : 0
      },
      treatments: {
        total: totalTreatments,
        completed: completedTreatments,
        ongoing: ongoingTreatments,
        successRate: totalTreatments ? (completedTreatments / totalTreatments) * 100 : 0,
        procedureDistribution: procedureStats
      },
      patients: {
        total: uniquePatients.length,
        averagePerDay: uniquePatients.length / parseInt(timeRange)
      },
      revenue: {
        total: revenue,
        average: totalTreatments ? revenue / totalTreatments : 0
      }
    }
  });
});

// Update getDoctorDashboard to include treatment plans
export const getDoctorDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First find the doctor
    const doctors = await Doctor.find({ userId: id });
    if (!doctors || doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const doctor = doctors[0];
    const doctorId = doctor._id;

    // Get total patients
    const totalPatients = await Appointment.distinct('patientId', { doctorId }).then(patients => patients.length);

    // Get total appointments
    const totalAppointments = await Appointment.countDocuments({ doctorId });

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await Appointment.find({
      doctorId,
      date: { $gte: today, $lt: tomorrow }
    }).populate('patientId', 'fullName');

    // Get treatment plans statistics
    const treatmentPlans = await TreatmentPlan.find({ doctorId });
    const totalRevenue = treatmentPlans.reduce((total, plan) => total + plan.cost, 0);
    const activePatients = await TreatmentPlan.distinct('patientId', {
      doctorId,
      status: { $in: ['planned', 'in-progress'] }
    });

    // Get appointment statistics for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const appointmentStats = await Appointment.aggregate([
      {
        $match: {
          doctorId: new mongoose.Types.ObjectId(doctorId),
          date: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          count: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Get recent activity
    const recentActivity = await Promise.all([
      // Recent appointments
      Appointment.find({ doctorId })
        .sort({ date: -1, startTime: -1 })
        .limit(5)
        .populate('patientId', 'fullName'),
      // Recent treatment plans
      TreatmentPlan.find({ doctorId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('patientId', 'fullName')
    ]);

    const formattedActivity = [
      ...recentActivity[0].map(appointment => ({
        type: 'appointment',
        description: `Appointment with ${appointment.patientId.fullName}`,
        time: appointment.date,
        status: appointment.status
      })),
      ...recentActivity[1].map(plan => ({
        type: 'treatment',
        description: `${plan.procedure} for ${plan.patientId.fullName}`,
        time: plan.createdAt,
        status: plan.status
      }))
    ].sort((a, b) => b.time - a.time).slice(0, 5);

    res.json({
      success: true,
      data: {
        totalPatients,
        activePatients: activePatients.length,
        totalAppointments,
        todayAppointments: todayAppointments.length,
        todayAppointmentsList: todayAppointments,
        totalRevenue,
        appointmentStats,
        treatmentStats: {
          total: treatmentPlans.length,
          active: treatmentPlans.filter(p => p.status === 'in-progress').length,
          completed: treatmentPlans.filter(p => p.status === 'completed').length
        },
        recentActivity: formattedActivity
      }
    });
  } catch (error) {
    console.error('Error in getDoctorDashboard:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message
    });
  }
};

// Get doctor by userId
export const getDoctorByUserId = catchAsync(async (req, res, next) => {
  const doctor = await Doctor.findOne({ userId: req.params.userId });

  if (!doctor) {
    return next(new AppError('No doctor found with that user ID', 404));
  }

  res.status(200).json({
    success: true,
    data: doctor
  });
});