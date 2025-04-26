import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes.js';
import patientRoutes from './routes/patient.routes.js';
import appointmentRoutes from './routes/appointment.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import treatmentRoutes from './routes/treatment.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import dentalRecordRoutes from './routes/dentalRecord.routes.js';
import treatmentPlanRoutes from './routes/treatmentPlan.routes.js';
import prescriptionRoutes from './routes/prescription.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import dentalAnalysisRoutes from './routes/dentalAnalysis.routes.js';
dotenv.config();
const app = express();

// Logging middleware
app.use(morgan('dev'));
app.set("trust proxy", 1);

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://final-pro-pink.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
 'http://final-pro-pink.vercel.app'
];

// CORS middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['set-cookie'],
}));

// Cookie parser middleware
app.use(cookieParser());

// JSON parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/treatment-plans', treatmentPlanRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/dental-records', dentalRecordRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/dental-analysis', dentalAnalysisRoutes);
// Server Status Check Route
app.get('/ping', (_req, res) => {
  res.send('Pong');
});

// 404 Route Handler
app.all('*', (req, res) => {
  res.status(404).send('OOPS!! 404 Page Not Found');
});

export default app;