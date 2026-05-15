
import { Response } from "express";
import { AuthRequest } from "../common/types.js";
import { createReportService, getMyReportsService, getReportByIdService, getStudentReportsService, reviewReportService } from "./reports.service.js";

export const createReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await createReportService(req.user!.studentId!, req.body);
    res.status(201).json({ success: true, message: "Report submitted.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const getMyReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query as Record<string, string>;
    const result = await getMyReportsService(req.user!.studentId!, page, limit);
    res.json({ success: true, message: "Reports retrieved.", ...result });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const getReportById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isStudent = req.user!.role === "student";
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await getReportByIdService(id, isStudent ? req.user!.studentId : undefined);
    res.json({ success: true, message: "Report retrieved.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const getStudentReports = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query as Record<string, string>;
    const studentId = Array.isArray(req.params.studentId) ? req.params.studentId[0] : req.params.studentId;
    const result = await getStudentReportsService(studentId, page, limit);
    res.json({ success: true, message: "Student reports retrieved.", ...result });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const reviewReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, supervisorComment } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      res.status(400).json({ success: false, message: "Status must be approved or rejected." });
      return;
    }
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await reviewReportService(id, { status, supervisorComment });
    res.json({ success: true, message: `Report ${status}.`, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
}


