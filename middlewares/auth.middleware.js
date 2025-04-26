import AppError from "../utils/error.utils.js";
import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';

export const isLoggedIn = async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new AppError('Unauthenticated, Please Login', 401));
    }

    try {
        const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
        req.user = userDetails;

        // Setting the cookie within the context of the route handler
        const cookieOptions = {
            secure: true,
            sameSite: 'none',
            httpOnly: false
        };
        res.cookie('token', token, cookieOptions);
        console.log('Token set successfully');

        // Continue with the next middleware or route handler
        next();
    } catch (error) {
        return next(new AppError('Invalid or Expired Token', 401));
    }
};

// Alias for verifyToken to maintain compatibility with appointment routes
export const verifyToken = isLoggedIn;

// Middleware to check if user is admin
export const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('Please login first', 401));
        }
        
        // Get current user with role information
        const user = await User.findById(req.user.id);
        
        if (!user || user.role !== 'admin') {
            return next(new AppError('Access denied. Admin privileges required.', 403));
        }
        
        next();
    } catch (error) {
        return next(new AppError('Error checking admin status', 500));
    }
};

// Middleware to check if user is a doctor
export const isDoctor = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('Please login first', 401));
        }
        
        // Get current user with role information
        const user = await User.findById(req.user.id);
        
        if (!user || user.role !== 'DOCTOR') {
            return next(new AppError('Access denied. Doctor privileges required.', 403));
        }
        
        next();
    } catch (error) {
        return next(new AppError('Error checking doctor status', 500));
    }
};

// Middleware to check if user is a patient
export const isPatient = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('Please login first', 401));
        }
        
        // Get current user with role information
        const user = await User.findById(req.user.id);
        
        if (!user || user.role !== 'patient') {
            return next(new AppError('Access denied. Patient privileges required.', 403));
        }
        
        next();
    } catch (error) {
        return next(new AppError('Error checking patient status', 500));
    }
};

// Middleware to check if user is authorized for a resource
export const isAuthorized = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('Please login first', 401));
        }
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return next(new AppError('User not found', 404));
        }
        
        // Admin can access all resources
        if (user.role === 'admin') {
            return next();
        }
        
        const resourceId = req.params.id;
        
        // If accessing user's own data
        if (req.user.id === resourceId) {
            return next();
        }
        
        // For appointments, check if user is the doctor or patient associated with appointment
        if (req.baseUrl.includes('appointments') && resourceId) {
            // Import appointment model dynamically to avoid circular dependencies
            const Appointment = (await import('../models/appointment.models.js')).default;
            const appointment = await Appointment.findById(resourceId);
            
            if (!appointment) {
                return next(new AppError('Appointment not found', 404));
            }
            
            if ((user.role === 'doctor' && appointment.doctorId.toString() === user.id) || 
                (user.role === 'patient' && appointment.patientId.toString() === user.id)) {
                return next();
            }
        }
        
        return next(new AppError('Access denied. You are not authorized to access this resource.', 403));
    } catch (error) {
        return next(new AppError('Error checking authorization', 500));
    }
};