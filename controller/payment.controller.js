import Razorpay from 'razorpay';
import Appointment from '../models/appointment.models.js';

// Check if Razorpay credentials are available
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

let razorpay;

try {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.error('Razorpay credentials are missing. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.');
    // Initialize with dummy values to prevent immediate crash
    razorpay = null;
  } else {
    razorpay = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET
    });
  }
} catch (error) {
  console.error('Error initializing Razorpay:', error);
  razorpay = null;
}

export const createPaymentOrder = async (req, res) => {
  try {
    // Check if Razorpay is properly initialized
    if (!razorpay) {
      return res.status(503).json({ 
        message: 'Payment service is not available. Please contact the administrator.',
        error: 'Payment service configuration error'
      });
    }

    const { appointmentId } = req.params;
    const appointment = await Appointment.findById(appointmentId)
      .populate('doctor', 'name')
      .populate('patient', 'name');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (!appointment.paymentAmount) {
      return res.status(400).json({ message: 'Payment amount not set for this appointment' });
    }

    const options = {
      amount: appointment.paymentAmount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${appointmentId}`,
      notes: {
        appointmentId: appointmentId,
        doctorName: appointment.doctor.name,
        patientName: appointment.patient.name
      }
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ message: 'Error creating payment order' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    // Check if Razorpay is properly initialized
    if (!razorpay) {
      return res.status(503).json({ 
        message: 'Payment service is not available. Please contact the administrator.',
        error: 'Payment service configuration error'
      });
    }

    const { appointmentId } = req.params;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Update appointment payment status
      await Appointment.findByIdAndUpdate(appointmentId, {
        paymentStatus: 'completed',
        paymentId: razorpay_payment_id
      });

      res.json({ message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
}; 