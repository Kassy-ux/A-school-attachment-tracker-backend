
import { Router } from "express";
import { protect, studentOnly, supervisorOrAdmin } from "../middleware/auth.middleware.js";
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getTodayStatus,
  getAttendanceSummary,
  getStudentAttendance,
} from "./attendance.controller.js";

const attendancerouter = Router();

attendancerouter.use(protect);

// Student
attendancerouter.post("/check-in", studentOnly, checkIn);
attendancerouter.post("/check-out", studentOnly, checkOut);
attendancerouter.get("/", studentOnly, getMyAttendance);
attendancerouter.get("/today", studentOnly, getTodayStatus);
attendancerouter.get("/summary", studentOnly, getAttendanceSummary);

// Supervisor / Admin
attendancerouter.get("/student/:studentId", supervisorOrAdmin, getStudentAttendance);

export default attendancerouter;