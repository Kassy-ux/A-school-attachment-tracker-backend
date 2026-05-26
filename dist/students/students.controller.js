import { getAllStudentsService, getStudentByIdService, getMyStudentProfileService, updateStudentProfileService, toggleStudentStatusService, } from "./students.service.js";
// GET /api/students  (supervisor / admin)
export const getAllStudents = async (req, res) => {
    try {
        const { page, limit, search } = req.query;
        const result = await getAllStudentsService(page, limit, search, req.user.role === "supervisor" ? req.user.userId : undefined);
        res.json({ success: true, message: "Students retrieved.", ...result });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
// GET /api/students/me  (student — own profile)
export const getMyProfile = async (req, res) => {
    try {
        const data = await getMyStudentProfileService(req.user.userId);
        res.json({ success: true, message: "Profile retrieved.", data });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
// GET /api/students/:id  (supervisor / admin — view any student)
export const getStudentById = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const data = await getStudentByIdService(id, req.user.role === "supervisor" ? req.user.userId : undefined);
        res.json({ success: true, message: "Student retrieved.", data });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
// PATCH /api/students/me  (student updates own profile)
export const updateMyProfile = async (req, res) => {
    try {
        const data = await updateStudentProfileService(req.user.userId, req.body);
        res.json({ success: true, message: "Profile updated.", data });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
// PATCH /api/students/:userId/status  (admin only)
export const toggleStudentStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        if (typeof isActive !== "boolean") {
            res.status(400).json({ success: false, message: "isActive must be a boolean." });
            return;
        }
        const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
        const data = await toggleStudentStatusService(userId, isActive);
        res.json({ success: true, message: `Account ${isActive ? "activated" : "deactivated"}.`, data });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
