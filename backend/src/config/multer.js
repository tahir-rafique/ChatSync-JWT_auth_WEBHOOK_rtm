const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const AppError = require("../utils/AppError");

// ── Allowed MIME types ─────────────────────────────────────
const ALLOWED_TYPES = {
  images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  videos: ["video/mp4", "video/webm", "video/ogg", "video/quicktime"],
  audios: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4"],
  files: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "application/zip",
  ],
};

const ALL_ALLOWED = Object.values(ALLOWED_TYPES).flat();

// ── Determine subfolder by mimetype ───────────────────────
const getSubfolder = (mimetype) => {
  if (ALLOWED_TYPES.images.includes(mimetype)) return "images";
  if (ALLOWED_TYPES.videos.includes(mimetype)) return "videos";
  if (ALLOWED_TYPES.audios.includes(mimetype)) return "audios";
  return "files";
};

// ── Disk Storage ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = getSubfolder(file.mimetype);
    cb(null, path.join(__dirname, `../uploads/${folder}`));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// ── File Filter ───────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  if (ALL_ALLOWED.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`File type '${file.mimetype}' is not allowed`, 400), false);
  }
};

// ── Multer Instance ───────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024 }, // 50MB
});

module.exports = upload;
