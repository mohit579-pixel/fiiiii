import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 mb in size max limit
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error(`Unsupported file type! ${file.mimetype}`), false);
      return;
    }
    cb(null, true);
  },
});

export default upload;