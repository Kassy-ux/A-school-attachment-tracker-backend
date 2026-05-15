
import { Router } from "express";
import { protect, requireRole, studentOnly, supervisorOrAdmin, adminOnly } from "../middleware/auth.middleware.js";
import {
  getAllStudents,
  getMyProfile,
  getStudentById,
  updateMyProfile,
  toggleStudentStatus,
} from "./students.controller.js";

const studentRoutes = Router();

// All routes require login
studentRoutes.use(protect);

// Student — own profile
studentRoutes.get("/me", studentOnly, getMyProfile);
studentRoutes.patch("/me", studentOnly, updateMyProfile);

// Supervisor / Admin — view students
studentRoutes.get("/", supervisorOrAdmin, getAllStudents);
studentRoutes.get("/:id", supervisorOrAdmin, getStudentById);

// Admin — toggle account status
studentRoutes.patch("/:userId/status", adminOnly, toggleStudentStatus);

export default studentRoutes;