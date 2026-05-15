import { registerStudentService, registerSupervisorService, loginService, getMeService, changePasswordService, } from "./auth.service.js";
// ============================================================
// POST /api/auth/register/student
// ============================================================
export const registerStudent = async (req, res) => {
    try {
        const data = await registerStudentService(req.body);
        res.status(201).json({
            success: true,
            message: "Student registered successfully.",
            data,
        });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Registration failed.",
        });
    }
};
// ============================================================
// POST /api/auth/register/supervisor
// ============================================================
export const registerSupervisor = async (req, res) => {
    try {
        const data = await registerSupervisorService(req.body);
        res.status(201).json({
            success: true,
            message: "Account registered successfully.",
            data,
        });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Registration failed.",
        });
    }
};
// ============================================================
// POST /api/auth/login
// ============================================================
export const login = async (req, res) => {
    try {
        const data = await loginService(req.body);
        res.status(200).json({
            success: true,
            message: "Login successful.",
            data,
        });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Login failed.",
        });
    }
};
// ============================================================
// GET /api/auth/me
// ============================================================
export const getMe = async (req, res) => {
    try {
        const userId = req.user.userId;
        const data = await getMeService(userId);
        res.status(200).json({
            success: true,
            message: "Profile retrieved.",
            data,
        });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to get profile.",
        });
    }
};
// ============================================================
// POST /api/auth/change-password
// ============================================================
export const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;
        await changePasswordService(userId, currentPassword, newPassword);
        res.status(200).json({
            success: true,
            message: "Password changed successfully.",
        });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Failed to change password.",
        });
    }
};
