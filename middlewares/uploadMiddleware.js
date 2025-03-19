import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import sharp from "sharp";
import multer from "multer";

// Get the correct __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the upload directory
const uploadDir = path.join(__dirname, "../public/uploads");

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage (memory for processing)
const upload = multer({ storage: multer.memoryStorage() });

// Image Compression Middleware
const compressImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const fileName = `logo-${Date.now()}.jpg`;
    const filePath = path.join(uploadDir, fileName);

    // Compress and save the image
    await sharp(req.file.buffer)
      .resize(300, 300, { fit: "cover" }) // Resize to 300x300
      .jpeg({ quality: 80 }) // Compress to 80% quality
      .toFile(filePath);

    // Update req.file properties for further processing
    req.file.path = filePath;
    req.file.filename = fileName;

    next();
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).json({ error: "Image processing failed" });
  }
};

export { upload, compressImage };
