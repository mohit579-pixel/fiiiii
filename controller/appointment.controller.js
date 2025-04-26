import Appointment from "../models/appointment.models.js";
import User from "../models/user.models.js"; // Assuming you have a User model
import Patient from "../models/patient.models.js";
import { Types } from "mongoose";
import { createAppointmentNotification } from "./notification.controller.js";
import cloudinary from 'cloudinary';
import { Readable } from 'stream';
import Doctor from "../models/doctor.model.js";

// Get all appointments (with filtering options)
export const getAllAppointments = async (req, res) => {
  try {
    const { 
      patientId, 
      doctorId, 
      status, 
      startDate, 
      endDate, 
      type 
    } = req.query;
    
    const query = {};
    
    if (patientId) query.patientId = patientId;
    if (doctorId) query.doctorId = doctorId;
    if (status) query.status = status;
    if (type) query.type = type;
    
    // Date range filtering
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email speciality')
      .sort({ date: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve appointments",
      error: error.message
    });
  }
};

// Get single appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email speciality');
      
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve appointment",
      error: error.message
    });
  }
};

// Get appointments for a specific patient
export const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const appointments = await Appointment.find({ patientId })
      // .populate('doctorId', 'name speciality')
      .sort({ date: 1, startTime: 1 });
      console.log(appointments);  
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve patient appointments",
      error: error.message
    });
  }
};

// Get appointments for a specific doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const appointments = await Appointment.find({ doctorId })
      .populate('patientId', 'name email')
      .sort({ date: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve doctor appointments",
      error: error.message
    });
  }
};

// Create a new appointment
export const createAppointment = async (req, res) => {
  try {
    const { 
      patientId, 
      patientInfo,
      doctorId, 
      date, 
      startTime, 
      endTime, 
      type, 
      notes, 
      location 
    } = req.body;
    console.log(req.body);
    // Check if patient exists, if not create one
    let patient = await Patient.findOne({ userId: patientId });
    if (!patient && patientInfo) {
      patient = await Patient.create({
        userId: patientId,
        fullName: patientInfo.fullName,
        email: patientInfo.email,
        phone: patientInfo.phone,
        age: patientInfo.age,
        gender: patientInfo.gender,
        address: patientInfo.address,
        medicalHistory: [],
        treatmentPlans: []
      });
    }
    
    // Check for time conflicts (overlapping appointments for doctor)
    const conflictAppointment = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      $or: [
        { 
          startTime: { $lt: endTime },
          endTime: { $gt: startTime } 
        },
        {
          startTime: startTime,
          endTime: endTime
        }
      ],
      status: { $ne: "canceled" }
    });
    
    if (conflictAppointment) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked"
      });
    }
    
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      date: new Date(date),
      startTime,
      endTime,
      type,
      notes,
      location,
      status: "upcoming"
    });

    try {
      // Create notification for both patient and doctor
      await Promise.all([
        createAppointmentNotification(patientId, appointment, 'booked'),
        createAppointmentNotification(doctorId, appointment, 'booked')
      ]);
      console.log('Notifications created successfully for appointment:', appointment._id);
    } catch (notificationError) {
      console.error('Failed to create notifications:', notificationError);
      // Continue with the response even if notification creation fails
    }
    
    // Populate the appointment data
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email speciality');
    
    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Failed to create appointment:', error);
    res.status(500).json({
      success: false,
      message: "Failed to create appointment",
      error: error.message
    });
  }
};

// Update an appointment
export const updateAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const updateData = req.body;
    
    // Check if changing date/time and if there are conflicts
    if ((updateData.date || updateData.startTime || updateData.endTime) && updateData.doctorId) {
      const appointment = await Appointment.findById(appointmentId);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found"
        });
      }
      
      const dateToCheck = updateData.date ? new Date(updateData.date) : appointment.date;
      const startTimeToCheck = updateData.startTime || appointment.startTime;
      const endTimeToCheck = updateData.endTime || appointment.endTime;
      const doctorIdToCheck = updateData.doctorId || appointment.doctorId;
      
      const conflictAppointment = await Appointment.findOne({
        _id: { $ne: appointmentId }, // Exclude current appointment
        doctorId: doctorIdToCheck,
        date: dateToCheck,
        $or: [
          { 
            startTime: { $lt: endTimeToCheck },
            endTime: { $gt: startTimeToCheck } 
          },
          {
            startTime: startTimeToCheck,
            endTime: endTimeToCheck
          }
        ],
        status: { $ne: "canceled" }
      });
      
      if (conflictAppointment) {
        return res.status(400).json({
          success: false,
          message: "This time slot is already booked"
        });
      }
    }
    
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId', 'name email')
     .populate('doctorId', 'name email speciality');
    
    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }
    
    // Create notification if status is updated to confirmed
    if (updateData.status === 'confirmed') {
      await createAppointmentNotification(
        updatedAppointment.patientId._id || updatedAppointment.patientId,
        updatedAppointment,
        'confirmed'
      );
    }
    
    res.status(200).json({
      success: true,
      data: updatedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update appointment",
      error: error.message
    });
  }
};

// Cancel an appointment
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: "canceled" },
      { new: true }
    );
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }
    
    // Create cancellation notification
    await createAppointmentNotification(
      appointment.patientId,
      appointment,
      'canceled'
    );
    
    res.status(200).json({
      success: true,
      data: appointment,
      message: "Appointment cancelled successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message
    });
  }
};

// Get available time slots for a doctor on a specific date
export const getDoctorAvailableSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    
    if (!doctorId || !date) {
      return res.status(400).json({
        success: false,
        message: "doctorId and date are required"
      });
    }
    
    // Get doctor's working hours (assuming they are stored in user model or a separate schedule model)
    const doctor = await User.findById(doctorId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }
    
    // Default working hours (9 AM to 5 PM)
    // You would replace this with actual working hours from your doctor model
    const workingHours = {
      start: "09:00",
      end: "17:00",
      slotDuration: 30 // minutes
    };
    
    // Get booked appointments for that day
    const bookedAppointments = await Appointment.find({
      doctorId: doctor._id,
      date: new Date(date),
      status: { $ne: "canceled" }
    }).select('startTime endTime');
    
    // Generate all possible time slots based on working hours
    const allSlots = [];
    let currentTime = workingHours.start;
    
    while (currentTime < workingHours.end) {
      const [hours, minutes] = currentTime.split(':').map(Number);
      const totalMinutes = hours * 60 + minutes + workingHours.slotDuration;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      
      const endTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
      
      if (endTime <= workingHours.end) {
        allSlots.push({
          startTime: currentTime,
          endTime
        });
      }
      
      currentTime = endTime;
    }
    
    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => {
      return !bookedAppointments.some(appointment => {
        // Check if slot overlaps with any appointment
        return (
          (slot.startTime < appointment.endTime && slot.endTime > appointment.startTime) ||
          (slot.startTime === appointment.startTime && slot.endTime === appointment.endTime)
        );
      });
    });
    
    res.status(200).json({
      success: true,
      count: availableSlots.length,
      data: availableSlots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve available slots",
      error: error.message
    });
  }
};

// Delete an appointment (admin only)
export const deleteAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;
    
    const appointment = await Appointment.findByIdAndDelete(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete appointment",
      error: error.message
    });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['confirmed', 'canceled', 'completed', 'rescheduled', 'pending'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('patientId', 'name email')
     .populate('doctorId', 'name email speciality');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Create notification for status update
    try {
      await createAppointmentNotification(
        appointment.patientId._id || appointment.patientId,
        appointment,
        status
      );
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Continue with the response even if notification creation fails
    }

    res.status(200).json({
      success: true,
      data: appointment,
      message: `Appointment status updated to ${status} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update appointment status",
      error: error.message
    });
  }
};

export const getTodayAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments = await Appointment.find({
      doctorId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    }).populate('patientId');

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s appointments',
      error: error.message
    });
  }
};

export const addDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const { diagnoses, prescription, followUpDate, medications,paymentAmount } = req.body;

    console.log(req.body);
    // Validate required fields
    if (!diagnoses || !Array.isArray(diagnoses) || diagnoses.length === 0) {
      return res.status(400).json({ message: 'At least one diagnosis is required' });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Validate each diagnosis
    for (const diagnosis of diagnoses) {
      if (!diagnosis.toothNumber || !diagnosis.condition) {
        return res.status(400).json({ 
          message: 'Each diagnosis must have a tooth number and condition' 
        });
      }
    }

    // Update appointment with new diagnosis data
    appointment.diagnoses = diagnoses.map(diagnosis => ({
      toothNumber: diagnosis.toothNumber,
      condition: diagnosis.condition,
      severity: diagnosis.severity || 'low',
      treatment: diagnosis.treatment || '',
      notes: diagnosis.notes || '',
      createdAt: new Date()
    }));

    if (prescription) appointment.prescription = prescription;
    if (followUpDate) appointment.followUpDate = new Date(followUpDate);
    if (medications) appointment.medications = medications;
    if(paymentAmount) appointment.paymentAmount=paymentAmount;
    appointment.status = 'completed';

    await appointment.save();

    res.status(200).json({
      message: 'Diagnosis added successfully',
      appointment
    });
  } catch (error) {
    console.error('Error adding diagnosis:', error);
    res.status(500).json({ message: 'Error adding diagnosis', error: error.message });
  }
};

export const uploadImages = async (req, res) => {
  try {
    const { appointmentId, toothNumber } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Upload files to Cloudinary using streams
    const uploadPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const stream = Readable.from(file.buffer);
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'dental-images',
            resource_type: 'auto'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.pipe(uploadStream);
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);

    // Update appointment with image URLs
    const diagnosis = appointment.diagnoses.find(d => d.toothNumber === toothNumber);
    if (diagnosis) {
      diagnosis.images = diagnosis.images || [];
      diagnosis.images.push(...uploadedImages.map(img => ({
        url: img.secure_url,
        publicId: img.public_id,
        uploadedAt: new Date()
      })));
    }

    await appointment.save();

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: uploadedImages
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ message: 'Error uploading images', error: error.message });
  }
};

// Get completed appointments for a specific doctor
export const getDoctorCompletedAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    if (!doctorId) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID is required"
      });
    }

    // Find the doctor by userId
    const doctor = await Doctor.findOne({ userId: doctorId });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const appointments = await Appointment.find({ 
      doctorId: doctor._id,
      status: 'completed'
    })
      .populate('patientId', 'fullName email phone dateOfBirth gender')
      .sort({ date: -1, startTime: -1 }); // Sort by most recent first
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error in getDoctorCompletedAppointments:', error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve completed appointments",
      error: error.message
    });
  }
};

export default {
  getAllAppointments,
  getAppointmentById,
  getPatientAppointments,
  getDoctorAppointments,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  cancelAppointment,
  getDoctorAvailableSlots,
  deleteAppointment,
  getTodayAppointments,
  addDiagnosis,
  uploadImages,
  getDoctorCompletedAppointments
};