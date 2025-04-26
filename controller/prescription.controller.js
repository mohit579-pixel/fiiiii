import puppeteer from 'puppeteer';
import Appointment from '../models/appointment.models.js';
import Doctor from '../models/doctor.model.js';
import Patient from '../models/patient.models.js';
import generatePrescriptionHTML from '../utils/prescriptionTemplate.js';
import { validateObjectId } from '../utils/validation.js';

export const generatePrescription = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    if (!appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID is required"
      });
    }

    // Validate appointment ID format
    if (!validateObjectId(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID format"
      });
    }

    // Fetch appointment with all necessary data
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctorId')
      .populate('patientId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    if (!appointment.doctorId || !appointment.patientId) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment data"
      });
    }

    // Check payment status
    if (appointment.paymentStatus === 'unpaid') {
      return res.status(403).json({
        success: false,
        message: 'Payment is required before generating prescription'
      });
    }

    const doctor = await Doctor.findById(appointment.doctorId);
    const patient = await Patient.findOne({ userId: appointment.patientId });
    const passedata = {
      doctor: {
        fullName: doctor.name,
        licenseNumber: "hshh",
        speciality: doctor.speciality
      },
      patient: {
        fullName: patient.fullName,
        age: 23,
        gender: "Male",
        phone: "1234567890"
      }
    };
    console.log(passedata);

    // Prepare data for the prescription template
    const prescriptionData = {
      doctor: {
        fullName: passedata.doctor.fullName,
        licenseNumber: passedata.doctor.licenseNumber,
        speciality: passedata.doctor.speciality
      },
      patient: {
        fullName: passedata.patient.fullName,
        age: passedata.patient.age,
        gender: passedata.patient.gender,
        phone: passedata.patient.phone
      },
      appointment: {
        ...appointment.toObject(),
        date: appointment.date,
        diagnoses: appointment.diagnoses,
        medications: appointment.medications,
        prescription: 'Take 1 tablet daily',
        followUpDate: '2025-01-01'
      }
    };

    // Generate HTML from template
    const html = generatePrescriptionHTML(prescriptionData);

    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Set content and wait for network idle
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // Generate PDF
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=prescription-${appointmentId}.pdf`);
      res.end(pdf); // Correct method to send Buffer

    } finally {
      await browser.close();
    }

  } catch (error) {
    console.error('Error generating prescription:', error);
    res.status(500).json({
      success: false,
      message: "Error generating prescription",
      error: error.message
    });
  }
};

export default {
  generatePrescription
}; 