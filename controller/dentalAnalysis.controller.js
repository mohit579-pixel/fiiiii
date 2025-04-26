import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
}).single('image');

export const analyzeDentalImage = async (req, res) => {
  try {
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'Please upload an image' });
      }

      // Read and encode the image as base64
      const imageBuffer = fs.readFileSync(req.file.path);
      const encodedImage = imageBuffer.toString('base64');

      // Roboflow API details
      const apiUrl = 'https://serverless.roboflow.com';
      const apiKey = 'bnxGkARcQkoHG64jxvtf';
      const modelId = 'mouthdity-classification/1';

      // Treatment dictionary
      const treatment_plan = {
        "Gingivitis": "Maintain good oral hygiene, brush twice a day, use antiseptic mouthwash, and get professional dental cleanings regularly.",
        "Hipodonsia": "Treatment options include dental implants, bridges, or orthodontic solutions to close gaps or replace missing teeth.",
        "Kalkulus": "Dental scaling and root planing by a dentist are essential to remove tartar buildup.",
        "Kanker": "Oral cancer treatment may include surgery, radiation therapy, or chemotherapy depending on severity. Early diagnosis is crucial.",
        "Karies": "Remove decayed parts and restore with dental fillings, crowns, or root canal if severe. Prevent with fluoride and diet control.",
        "Perubahan-Warna": "Professional teeth cleaning, whitening treatments, or veneers can help. Avoid stain-causing foods and drinks.",
        "Sariawan": "Apply topical gels, rinse with salt water or antiseptic mouthwash. Avoid spicy foods and manage stress.",
        "Warna": "If discoloration is natural, no treatment needed. If pathological, consult for cleaning or aesthetic correction."
      };

      // Call Roboflow API
      let roboflowResponse;
      try {
        roboflowResponse = await axios.post(
          `${apiUrl}/`,
          {
            api_key: apiKey,
            model_id: modelId,
            image: encodedImage
          }
        );
      } catch (err) {
        console.error('Roboflow API error:', err?.response?.data || err.message);
        return res.status(500).json({ message: 'Error from Roboflow API', details: err?.response?.data || err.message });
      }
      const result = roboflowResponse.data;
      let predicted_class = null;
      let annotated_image = null;
      if (result && result.predicted_classes && result.predicted_classes.length > 0) {
        predicted_class = result.predicted_classes[0];
        annotated_image = result.image || null;
      }
      const treatment = treatment_plan[predicted_class] || "Please consult a dental professional for further advice.";
      res.json({
        predicted_class,
        treatment,
        annotated_image
      });
    });
  } catch (error) {
    console.error('Error in dental analysis:', error);
    res.status(500).json({ message: 'Error analyzing dental image' });
  }
}; 