import AppError from "../utils/error.utils.js";
import User from "../models/user.models.js";
import Doctor from "../models/doctor.model.js";
import cloudinary from "cloudinary";
import fs from 'fs/promises';

const cookieOptions = {
    secure: true,
    sameSite: 'None',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
  };


  export const registerUser = async (req, res, next) => {
    const { fullName, email, password, role, phone, speciality, experience, qualifications, bio, workingHours, slotDuration } = req.body;
    let user;

    if (!fullName || !email || !password) {
        return next(new AppError('All Fields are Required', 400));
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        return next(new AppError('Email Already Exists', 400));
    }

    try {
        let avatarData = {
            public_id: email,
            secure_url: null
        };

        // Handle file upload if present
        if (req.file) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'dentalcare',
                    width: 250,
                    height: 250,
                    gravity: 'faces',
                    crop: 'fill'
                });

                avatarData = {
                    public_id: result.public_id,
                    secure_url: result.secure_url
                };

                // Remove file from server
                await fs.unlink(req.file.path);
            } catch (error) {
                return next(new AppError(error.message || 'File upload failed', 500));
            }
        }

        // Create user with avatar data
        user = await User.create({
            fullName,
            email,
            password,
            avatar: avatarData,
            role: role || 'USER'
        });

        // If user is a doctor, create doctor record
        if (role === 'DOCTOR') {
            if (!phone || !speciality || !experience || !qualifications) {
                return next(new AppError('All doctor fields are required', 400));
            }

            await Doctor.create({
                name: fullName,
                email,
                phone,
                speciality,
                experience: parseInt(experience),
                qualifications: qualifications.split(',').map(q => q.trim()),
                bio: bio || '',
                avatar: avatarData.secure_url,
                workingHours: workingHours ? JSON.parse(workingHours) : {
                    monday: { start: "09:00", end: "17:00", isWorking: true },
                    tuesday: { start: "09:00", end: "17:00", isWorking: true },
                    wednesday: { start: "09:00", end: "17:00", isWorking: true },
                    thursday: { start: "09:00", end: "17:00", isWorking: true },
                    friday: { start: "09:00", end: "17:00", isWorking: true },
                    saturday: { start: "09:00", end: "17:00", isWorking: false },
                    sunday: { start: "09:00", end: "17:00", isWorking: false }
                },
                slotDuration: parseInt(slotDuration) || 30,
                userId: user._id
            });
        }

        user.password = undefined;

        const token = await user.generateJWTToken();
        res.cookie('token', token, cookieOptions);

        res.status(201).json({
            success: true,
            message: 'User Registered Successfully',
            user,
        });
    } catch (error) {
        console.error(error);
        return next(new AppError('Error creating user', 500));
    }
};

export const loginUser = async (req, res, next) => {
    // Destructuring the necessary data from req object
    const { email, password } = req.body;
  
    // Check if the data is there or not, if not throw error message
    if (!email || !password) {
      return next(new AppError('Email and Password are required', 400));
    }
  
    // Finding the user with the sent email
    const user = await User.findOne({ email }).select('+password');
  
    // If no user or sent password do not match then send generic response
    if (!(user && (await user.comparePassword(password)))) {
      return next(
        new AppError('Email or Password do not match or user does not exist', 401)
      );
    }
  
    // Generating a JWT token
    const token = await user.generateJWTToken();
  
    // Setting the password to undefined so it does not get sent in the response
    user.password = undefined;
  
    // Setting the token in the cookie with name token along with cookieOptions
    res.cookie('token', token, cookieOptions);
  
    // If all good send the response to the frontend
    res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      user,
    });
  };


  export const logoutUser = async (_req, res, _next) => {
    // Setting the cookie value to null
    res.cookie('token', null, {
      secure:true,
      maxAge: 0,
      httpOnly: true,
    });
  
    // Sending the response
    res.status(200).json({
      success: true,
      message: 'User logged out successfully',
    });
  };


  export const getLoggedInUserDetails = async (req, res, _next) => {
    // Finding the user using the id from modified req object
    const user = await User.findById(req.user.id);
  
    res.status(200).json({
      success: true,
      message: 'User details',
      user,
    });
  };