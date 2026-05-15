
import { Response } from "express";
import { AuthRequest } from "../common/types.js";
import {
  checkInService,
  checkOutService,
  getMyAttendanceService,
  getTodayStatusService,
  getAttendanceSummaryService,
  getStudentAttendanceService,
} from "./attendance.service.js";

// POST /api/attendance/check-in
export const checkIn = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await checkInService(req.user!.studentId!);
    res.status(201).json({ success: true, message: "Checked in successfully.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// POST /api/attendance/check-out
export const checkOut = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await checkOutService(req.user!.studentId!);
    res.json({ success: true, message: "Checked out successfully.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance
export const getMyAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query as Record<string, string>;
    const result = await getMyAttendanceService(req.user!.studentId!, page, limit);
    res.json({ success: true, message: "Attendance history retrieved.", ...result });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance/today
export const getTodayStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await getTodayStatusService(req.user!.studentId!);
    res.json({ success: true, message: "Today's attendance status.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance/summary
export const getAttendanceSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await getAttendanceSummaryService(req.user!.studentId!);
    res.json({ success: true, message: "Attendance summary.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance/student/:studentId  (supervisor / admin)
export const getStudentAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query as Record<string, string>;
    const studentId = Array.isArray(req.params.studentId) ? req.params.studentId[0] : req.params.studentId;
    const result = await getStudentAttendanceService(studentId, page, limit);
    res.json({ success: true, message: "Student attendance retrieved.", ...result });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};
