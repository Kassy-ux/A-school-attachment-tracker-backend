import { saveFileService, getMyFilesService, getStudentFilesService, getFileByIdService, deleteFileService, } from "./files.service.js";
// POST /api/files/upload  (student uploads a file)
export const uploadFile = async (req, res) => {
    try {
        // multer attaches the file to req.file
        if (!req.file) {
            res.status(400).json({ success: false, message: "No file uploaded." });
            return;
        }
        const studentId = req.user.studentId;
        // Build a public URL — in production swap this with Cloudinary URL
        const fileUrl = `/uploads/${req.file.filename}`;
        const fileType = req.file.mimetype;
        const fileName = req.file.originalname;
        const data = await saveFileService({ studentId, fileName, fileUrl, fileType });
        res.status(201).json({ success: true, message: "File uploaded successfully.", data });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
// GET /api/files  (student — own files)
export const getMyFiles = async (req, res) => {
    try {
        const result = await getMyFilesService(req.user.studentId, req.query.page, req.query.limit);
        res.json({ success: true, message: "Files retrieved.", ...result });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
// GET /api/files/student/:studentId  (supervisor / admin)
export const getStudentFiles = async (req, res) => {
    try {
        const studentId = typeof req.params.studentId === "string" ? req.params.studentId : req.params.studentId[0];
        const result = await getStudentFilesService(studentId, req.query.page, req.query.limit);
        res.json({ success: true, message: "Student files retrieved.", ...result });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
// GET /api/files/:id
export const getFileById = async (req, res) => {
    try {
        const isStudent = req.user.role === "student";
        const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
        const data = await getFileByIdService(id, isStudent ? req.user.studentId : undefined);
        res.json({ success: true, message: "File retrieved.", data });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
// DELETE /api/files/:id  (student deletes own)
export const deleteFile = async (req, res) => {
    try {
        const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
        await deleteFileService(id, req.user.studentId);
        res.json({ success: true, message: "File deleted." });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
