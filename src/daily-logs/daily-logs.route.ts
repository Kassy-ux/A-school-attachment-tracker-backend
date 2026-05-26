
import { Router } from "express";
import { protect, studentOnly, supervisorOrAdmin } from "../middleware/auth.middleware.js";
import {
  createLog,
  getMyLogs,
  getLogStats,
  getLogById,
  updateLog,
  deleteLog,
  getStudentLogs,
  reviewLog,
} from "./daily-logs.controller.js";
const dailyRouter = Router();

dailyRouter.use(protect);

// ---- Student routes ----
dailyRouter.post("/", studentOnly, createLog);
dailyRouter.get("/", studentOnly, getMyLogs);
dailyRouter.get("/stats", studentOnly, getLogStats);

// ---- Supervisor / Admin routes ----
dailyRouter.get("/student/:studentId", supervisorOrAdmin, getStudentLogs);

dailyRouter.get("/:id", getLogById);               // both student and supervisor can view
dailyRouter.patch("/:id", studentOnly, updateLog);
dailyRouter.delete("/:id", studentOnly, deleteLog);
dailyRouter.patch("/:id/review", supervisorOrAdmin, reviewLog);

export default dailyRouter;
