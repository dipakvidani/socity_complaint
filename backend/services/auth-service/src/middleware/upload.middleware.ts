import multer from "multer";
import { AppError } from "../utils/AppError.js";

const allowed = ["image/jpeg", "image/png", "image/webp"];

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!allowed.includes(file.mimetype)) return cb(new AppError(400, "Please upload a JPG, PNG or WEBP image."));
    cb(null, true);
  },
});
