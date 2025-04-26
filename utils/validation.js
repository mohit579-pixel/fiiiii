import mongoose from 'mongoose';

// Validate MongoDB ObjectId
export const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// Validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number format
export const validatePhone = (phone) => {
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  return phoneRegex.test(phone);
};

// Validate required fields in an object
export const validateRequiredFields = (obj, fields) => {
  const missingFields = fields.filter(field => !obj[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  return true;
};

// Validate date format and ensure it's not in the past
export const validateFutureDate = (date) => {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return inputDate instanceof Date && !isNaN(inputDate) && inputDate >= today;
};

// Validate time format (HH:MM)
export const validateTimeFormat = (time) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

// Validate numeric value within range
export const validateNumericRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}; 