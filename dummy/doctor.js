import mongoose from 'mongoose';
import Doctor from '../models/doctor.model.js'; 
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

// Sample doctor data
const doctorData = [
  {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@dentaclinic.com",
    phone: "555-123-4567",
    speciality: "General Dentist",
    experience: 8,
    qualifications: ["DDS", "Member of American Dental Association"],
    bio: "Dr. Johnson specializes in preventive care and restorative treatments with a gentle approach perfect for anxious patients.",
    avatar: "https://randomuser.me/api/portraits/women/20.jpg",
    available: true,
    workingHours: {
      monday: { start: "09:00", end: "17:00", isWorking: true },
      tuesday: { start: "09:00", end: "17:00", isWorking: true },
      wednesday: { start: "09:00", end: "17:00", isWorking: true },
      thursday: { start: "09:00", end: "17:00", isWorking: true },
      friday: { start: "09:00", end: "14:00", isWorking: true },
      saturday: { start: "10:00", end: "14:00", isWorking: true },
      sunday: { start: "00:00", end: "00:00", isWorking: false }
    },
    slotDuration: 30,
    userId: "6507f6b45cef362d3c2279f1" // Replace with actual user ID
  },
  {
    name: "Dr. Michael Chen",
    email: "michael.chen@dentaclinic.com",
    phone: "555-234-5678",
    speciality: "Orthodontist",
    experience: 12,
    qualifications: ["DMD", "MS in Orthodontics", "Board Certified"],
    bio: "Dr. Chen is an expert in modern orthodontic techniques, including invisible aligners and aesthetic braces.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    available: true,
    workingHours: {
      monday: { start: "10:00", end: "18:00", isWorking: true },
      tuesday: { start: "10:00", end: "18:00", isWorking: true },
      wednesday: { start: "00:00", end: "00:00", isWorking: false },
      thursday: { start: "10:00", end: "18:00", isWorking: true },
      friday: { start: "10:00", end: "18:00", isWorking: true },
      saturday: { start: "09:00", end: "13:00", isWorking: true },
      sunday: { start: "00:00", end: "00:00", isWorking: false }
    },
    slotDuration: 45,
    userId: "6507f6b45cef362d3c2279f2" // Replace with actual user ID
  },
  {
    name: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@dentaclinic.com",
    phone: "555-345-6789",
    speciality: "Pediatric Dentist",
    experience: 6,
    qualifications: ["DDS", "Pediatric Dentistry Certification"],
    bio: "Dr. Rodriguez creates a fun and relaxing environment for children's dental care, specializing in early intervention.",
    avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    available: true,
    workingHours: {
      monday: { start: "08:30", end: "16:30", isWorking: true },
      tuesday: { start: "08:30", end: "16:30", isWorking: true },
      wednesday: { start: "08:30", end: "16:30", isWorking: true },
      thursday: { start: "08:30", end: "16:30", isWorking: true },
      friday: { start: "08:30", end: "15:00", isWorking: true },
      saturday: { start: "00:00", end: "00:00", isWorking: false },
      sunday: { start: "00:00", end: "00:00", isWorking: false }
    },
    slotDuration: 30,
    userId: "6507f6b45cef362d3c2279f3" // Replace with actual user ID
  },
  {
    name: "Dr. James Wilson",
    email: "james.wilson@dentaclinic.com",
    phone: "555-456-7890",
    speciality: "Oral Surgeon",
    experience: 15,
    qualifications: ["DMD", "MD", "Maxillofacial Surgery Certification"],
    bio: "Dr. Wilson specializes in complex extractions, jaw surgery, and dental implants with over 15 years of surgical experience.",
    avatar: "https://randomuser.me/api/portraits/men/55.jpg",
    available: true,
    workingHours: {
      monday: { start: "09:00", end: "17:00", isWorking: true },
      tuesday: { start: "09:00", end: "17:00", isWorking: true },
      wednesday: { start: "09:00", end: "17:00", isWorking: true },
      thursday: { start: "00:00", end: "00:00", isWorking: false },
      friday: { start: "09:00", end: "17:00", isWorking: true },
      saturday: { start: "09:00", end: "12:00", isWorking: true },
      sunday: { start: "00:00", end: "00:00", isWorking: false }
    },
    slotDuration: 60,
    userId: "6507f6b45cef362d3c2279f4" // Replace with actual user ID
  },
  {
    name: "Dr. Aisha Patel",
    email: "aisha.patel@dentaclinic.com",
    phone: "555-567-8901",
    speciality: "Endodontist",
    experience: 9,
    qualifications: ["DDS", "Endodontic Specialty Training"],
    bio: "Dr. Patel is committed to saving teeth through advanced root canal therapy and microsurgery techniques.",
    avatar: "https://randomuser.me/api/portraits/women/62.jpg",
    available: true,
    workingHours: {
      monday: { start: "08:00", end: "16:00", isWorking: true },
      tuesday: { start: "08:00", end: "16:00", isWorking: true },
      wednesday: { start: "08:00", end: "16:00", isWorking: true },
      thursday: { start: "08:00", end: "16:00", isWorking: true },
      friday: { start: "00:00", end: "00:00", isWorking: false },
      saturday: { start: "09:00", end: "13:00", isWorking: true },
      sunday: { start: "00:00", end: "00:00", isWorking: false }
    },
    slotDuration: 45,
    userId: "6507f6b45cef362d3c2279f5" // Replace with actual user ID
  },
  {
    name: "Dr. Robert Kim",
    email: "robert.kim@dentaclinic.com",
    phone: "555-678-9012",
    speciality: "Periodontist",
    experience: 11,
    qualifications: ["DDS", "MS in Periodontics"],
    bio: "Dr. Kim focuses on gum health and treatment of periodontal disease to ensure a strong foundation for your smile.",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    available: true,
    workingHours: {
      monday: { start: "09:30", end: "17:30", isWorking: true },
      tuesday: { start: "09:30", end: "17:30", isWorking: true },
      wednesday: { start: "00:00", end: "00:00", isWorking: false },
      thursday: { start: "09:30", end: "17:30", isWorking: true },
      friday: { start: "09:30", end: "17:30", isWorking: true },
      saturday: { start: "10:00", end: "14:00", isWorking: true },
      sunday: { start: "00:00", end: "00:00", isWorking: false }
    },
    slotDuration: 30,
    userId: "6507f6b45cef362d3c2279f6" // Replace with actual user ID
  },
  {
    name: "Dr. Sophia Martinez",
    email: "sophia.martinez@dentaclinic.com",
    phone: "555-789-0123",
    speciality: "Prosthodontist",
    experience: 14,
    qualifications: ["DDS", "MS in Prosthodontics"],
    bio: "Dr. Martinez is passionate about restoring beautiful smiles through expertly crafted dentures, crowns, and implant restorations.",
    avatar: "https://randomuser.me/api/portraits/women/75.jpg",
    available: true,
    workingHours: {
      monday: { start: "08:00", end: "16:00", isWorking: true },
      tuesday: { start: "00:00", end: "00:00", isWorking: false },
      wednesday: { start: "08:00", end: "16:00", isWorking: true },
      thursday: { start: "08:00", end: "16:00", isWorking: true },
      friday: { start: "08:00", end: "16:00", isWorking: true },
      saturday: { start: "09:00", end: "13:00", isWorking: true },
      sunday: { start: "00:00", end: "00:00", isWorking: false }
    },
    slotDuration: 45,
    userId: "6507f6b45cef362d3c2279f7" // Replace with actual user ID
  }
];

// Seed function
const seedDoctors = async () => {
  try {
    // First clear existing data
    await Doctor.deleteMany({});
    console.log('Previous doctor data cleared');

    // Insert new doctor data
    const doctors = await Doctor.insertMany(doctorData);
    console.log(`${doctors.length} doctors successfully seeded!`);
    
    // Get the IDs of inserted doctors for reference
    console.log('Doctor IDs for reference:');
    doctors.forEach(doctor => {
      console.log(`${doctor.name}: ${doctor._id}`);
    });
    
    // Close the connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding doctors:', error);
    mongoose.connection.close();
  }
};

// Run the seed function
seedDoctors();