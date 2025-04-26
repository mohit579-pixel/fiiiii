import Appointment from '../models/appointment.models.js';
import TreatmentPlan from '../models/treatment.model.js';
import Patient from '../models/patient.models.js';
import AppError from '../utils/error.utils.js';
import catchAsync from '../utils/catchAsync.js';

// Get doctor's analytics overview
export const getDoctorAnalytics = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const timeRange = req.query.timeRange || '30'; // Default to 30 days
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeRange));
  
  // Get appointments statistics
  const appointments = await Appointment.find({
    doctorId,
    date: { $gte: startDate }
  });
  
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'completed').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
  
  // Get treatment statistics
  const treatments = await TreatmentPlan.find({
    doctorId,
    createdAt: { $gte: startDate }
  });
  
  const totalTreatments = treatments.length;
  const completedTreatments = treatments.filter(t => t.status === 'completed').length;
  const ongoingTreatments = treatments.filter(t => t.status === 'in-progress').length;
  
  // Calculate revenue
  const revenue = treatments.reduce((total, treatment) => total + treatment.cost, 0);
  
  res.status(200).json({
    success: true,
    message: 'Doctor analytics retrieved successfully',
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
        successRate: totalTreatments ? (completedTreatments / totalTreatments) * 100 : 0
      },
      revenue: {
        total: revenue,
        average: totalTreatments ? revenue / totalTreatments : 0
      }
    }
  });
});

// Get patient statistics
export const getPatientStatistics = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const timeRange = req.query.timeRange || '30';
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeRange));
  
  // Get unique patients from appointments
  const appointments = await Appointment.find({
    doctorId,
    date: { $gte: startDate }
  });
  
  const uniquePatientIds = [...new Set(appointments.map(a => a.patientId.toString()))];
  const totalPatients = uniquePatientIds.length;
  
  // Get returning patients (more than one appointment)
  const patientFrequency = appointments.reduce((acc, curr) => {
    acc[curr.patientId] = (acc[curr.patientId] || 0) + 1;
    return acc;
  }, {});
  
  const returningPatients = Object.values(patientFrequency).filter(freq => freq > 1).length;
  
  res.status(200).json({
    success: true,
    message: 'Patient statistics retrieved successfully',
    data: {
      totalPatients,
      newPatients: totalPatients - returningPatients,
      returningPatients,
      retentionRate: totalPatients ? (returningPatients / totalPatients) * 100 : 0
    }
  });
});

// Get treatment statistics
export const getTreatmentStatistics = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const timeRange = req.query.timeRange || '30';
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeRange));
  
  const treatments = await TreatmentPlan.find({
    doctorId,
    createdAt: { $gte: startDate }
  });
  
  // Group treatments by procedure
  const procedureStats = treatments.reduce((acc, curr) => {
    acc[curr.procedure] = (acc[curr.procedure] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate success rates by procedure
  const successRates = {};
  Object.keys(procedureStats).forEach(procedure => {
    const procedureTreatments = treatments.filter(t => t.procedure === procedure);
    const completed = procedureTreatments.filter(t => t.status === 'completed').length;
    successRates[procedure] = (completed / procedureTreatments.length) * 100;
  });
  
  res.status(200).json({
    success: true,
    message: 'Treatment statistics retrieved successfully',
    data: {
      procedureStats,
      successRates,
      totalProcedures: treatments.length
    }
  });
});

// Get revenue analytics
export const getRevenueAnalytics = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const timeRange = req.query.timeRange || '30';
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeRange));
  
  const treatments = await TreatmentPlan.find({
    doctorId,
    createdAt: { $gte: startDate }
  });
  
  // Calculate total and average revenue
  const totalRevenue = treatments.reduce((total, treatment) => total + treatment.cost, 0);
  const averageRevenue = treatments.length ? totalRevenue / treatments.length : 0;
  
  // Group revenue by payment status
  const revenueByStatus = treatments.reduce((acc, curr) => {
    acc[curr.paymentStatus] = (acc[curr.paymentStatus] || 0) + curr.cost;
    return acc;
  }, {});
  
  res.status(200).json({
    success: true,
    message: 'Revenue analytics retrieved successfully',
    data: {
      totalRevenue,
      averageRevenue,
      revenueByStatus,
      pendingPayments: revenueByStatus.pending || 0
    }
  });
});

// Get appointment analytics
export const getAppointmentAnalytics = catchAsync(async (req, res) => {
  const { doctorId } = req.params;
  const timeRange = req.query.timeRange || '30';
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeRange));
  
  const appointments = await Appointment.find({
    doctorId,
    date: { $gte: startDate }
  });
  
  // Group appointments by status
  const statusStats = appointments.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate daily appointment distribution
  const dailyDistribution = appointments.reduce((acc, curr) => {
    const day = curr.date.toLocaleDateString();
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});
  
  res.status(200).json({
    success: true,
    message: 'Appointment analytics retrieved successfully',
    data: {
      totalAppointments: appointments.length,
      statusStats,
      dailyDistribution,
      averageAppointmentsPerDay: appointments.length / parseInt(timeRange)
    }
  });
});

// Get clinic analytics (admin only)
export const getClinicAnalytics = catchAsync(async (req, res) => {
  const timeRange = req.query.timeRange || '30';
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(timeRange));
  
  // Get overall clinic statistics
  const totalAppointments = await Appointment.countDocuments({
    date: { $gte: startDate }
  });
  
  const totalPatients = await Patient.countDocuments({
    createdAt: { $gte: startDate }
  });
  
  const totalRevenue = await TreatmentPlan.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$cost' }
      }
    }
  ]);
  
  res.status(200).json({
    success: true,
    message: 'Clinic analytics retrieved successfully',
    data: {
      totalAppointments,
      totalPatients,
      totalRevenue: totalRevenue[0]?.total || 0,
      averageRevenuePerPatient: totalPatients ? (totalRevenue[0]?.total || 0) / totalPatients : 0
    }
  });
}); 