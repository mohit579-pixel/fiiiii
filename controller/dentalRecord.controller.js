import DentalRecord from '../models/dentalRecord.model.js';
import  ApiError  from '../utils/ApiError.js';
import  ApiResponse  from '../utils/ApiResponse.js';
import  asyncHandler  from '../utils/asyncHandler.js';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadDentalRecord = asyncHandler(async (req, res) => {
  const { title, description, patientId, fileType, tags } = req.body;

  if (!req.file) {
    throw new ApiError(400, 'File is required');
  }

  if (!title || !patientId) {
    throw new ApiError(400, 'Title and patient ID are required');
  }

  // Upload file to Cloudinary
  const stream = Readable.from(req.file.buffer);
  const uploadResponse = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'dental-records',
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.pipe(uploadStream);
  });

  const fileUrl = uploadResponse.secure_url;

  const dentalRecord = await DentalRecord.create({
    title,
    description,
    patientId,
    fileType: fileType || 'document',
    fileUrl,
    tags: tags ? JSON.parse(tags) : [],
    uploadDate: new Date()
  });

  return res
    .status(201)
    .json(new ApiResponse(201, dentalRecord, 'Dental record uploaded successfully'));
});

const getDentalRecords = asyncHandler(async (req, res) => {
  const { patientId } = req.params;

  const records = await DentalRecord.find({ patientId })
    .sort({ uploadDate: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, records, 'Dental records fetched successfully'));
});

const deleteDentalRecord = asyncHandler(async (req, res) => {
  const { recordId } = req.params;

  const record = await DentalRecord.findById(recordId);

  if (!record) {
    throw new ApiError(404, 'Dental record not found');
  }

  // Delete file from Cloudinary
  const publicId = record.fileUrl.split('/').pop().split('.')[0];
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
  }

  await record.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, 'Dental record deleted successfully'));
});

export {
  uploadDentalRecord,
  getDentalRecords,
  deleteDentalRecord
}; 