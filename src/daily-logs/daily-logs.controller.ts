
import { Response } from "express";
import { AuthRequest } from "../common/types.js";
import {
  createLogService,
  getMyLogsService,
  getLogByIdService,
  updateLogService,
  deleteLogService,
  getStudentLogsService,
  reviewLogService,
  getLogStatsService,
} from "./daily-logs.service.js";

// POST /api/daily-logs
export const createLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user!.studentId!;
    const data = await createLogService(studentId, req.body);
    res.status(201).json({ success: true, message: "Daily log created.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// GET /api/daily-logs  (student — own logs)
export const getMyLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query as Record<string, string>;
    const result = await getMyLogsService(req.user!.studentId!, page, limit);
    res.json({ success: true, message: "Logs retrieved.", ...result });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// GET /api/daily-logs/stats
export const getLogStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await getLogStatsService(req.user!.studentId!);
    res.json({ success: true, message: "Stats retrieved.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// GET /api/daily-logs/:id
export const getLogById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isStudent = req.user!.role === "student";
    const data = await getLogByIdService(
      req.params.id as string,
      isStudent ? req.user!.studentId : undefined,
      req.user!.role === "supervisor" ? req.user!.userId : undefined
    );
    res.json({ success: true, message: "Log retrieved.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// PATCH /api/daily-logs/:id  (student edits)
export const updateLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await updateLogService(req.params.id as string, req.user!.studentId!, req.body);
    res.json({ success: true, message: "Log updated.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// DELETE /api/daily-logs/:id
export const deleteLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await deleteLogService(req.params.id as string, req.user!.studentId!);
    res.json({ success: true, message: "Log deleted." });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// GET /api/daily-logs/student/:studentId  (supervisor / admin)
export const getStudentLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query as Record<string, string>;
    const result = await getStudentLogsService(
      req.params.studentId as string,
      page,
      limit,
      req.user!.role === "supervisor" ? req.user!.userId : undefined
    );
    res.json({ success: true, message: "Student logs retrieved.", ...result });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// PATCH /api/daily-logs/:id/review  (supervisor)
export const reviewLog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isApproved, supervisorComment } = req.body;
    if (typeof isApproved !== "boolean") {
      res.status(400).json({ success: false, message: "isApproved must be true or false." });
      return;
    }
    const data = await reviewLogService(
      req.params.id as string,
      { isApproved, supervisorComment },
      req.user!.role === "supervisor" ? req.user!.userId : undefined
    );
    res.json({ success: true, message: `Log ${isApproved ? "approved" : "rejected"}.`, data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};
