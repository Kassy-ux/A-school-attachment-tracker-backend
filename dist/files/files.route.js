import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect, studentOnly, supervisorOrAdmin } from "../middleware/auth.middleware.js";
import { uploadFile, getMyFiles, getStudentFiles, getFileById, deleteFile, } from "./files.controller.js";
// ---- Multer config: local disk storage ----
// In production: replace diskStorage with Cloudinary multer storage
const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
    const allowed = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Only images (jpg/png) and documents (pdf/doc/docx) are allowed."));
    }
};
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});
const FileRouter = Router();
FileRouter.use(protect);
// Student routes
FileRouter.post("/upload", studentOnly, upload.single("file"), uploadFile);
FileRouter.get("/", studentOnly, getMyFiles);
FileRouter.get("/:id", getFileById);
FileRouter.delete("/:id", studentOnly, deleteFile);
// Supervisor / Admin
FileRouter.get("/student/:studentId", supervisorOrAdmin, getStudentFiles);
export default FileRouter;
