
import { Response } from "express";
import { AuthRequest } from "../common/types.js";
import {
  createEvaluationService,
  getStudentEvaluationsService,
  getAllEvaluationsService,
  getEvaluationByIdService,
  updateEvaluationService,
  getStudentAverageScoreService,
} from "./evaluation.service.js";

// POST /api/evaluations  (supervisor)
export const createEvaluation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await createEvaluationService(req.user!.userId, req.body);
    res.status(201).json({ success: true, message: "Evaluation submitted.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// GET /api/evaluations  (admin — all evaluations)
export const getAllEvaluations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await getAllEvaluationsService(
      req.query.page as string | undefined,
      req.query.limit as string | undefined
    );
    res.json({ success: true, message: "Evaluations retrieved.", ...result });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// GET /api/evaluations/me  (student — own evaluations)
export const getMyEvaluations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await getStudentEvaluationsService(req.user!.studentId!);
    res.json({ success: true, message: "Your evaluations retrieved.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// GET /api/evaluations/me/score  (student — own average score)
export const getMyScore = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await getStudentAverageScoreService(req.user!.studentId!);
    res.json({ success: true, message: "Score summary.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// GET /api/evaluations/student/:studentId  (supervisor / admin)
export const getStudentEvaluations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = typeof req.params.studentId === "string" ? req.params.studentId : req.params.studentId[0];
    const data = await getStudentEvaluationsService(studentId);
    res.json({ success: true, message: "Student evaluations retrieved.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// GET /api/evaluations/:id  (supervisor / admin)
export const getEvaluationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
    const data = await getEvaluationByIdService(id);
    res.json({ success: true, message: "Evaluation retrieved.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// PATCH /api/evaluations/:id  (supervisor — own only)
export const updateEvaluation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = typeof req.params.id === "string" ? req.params.id : req.params.id[0];
    const data = await updateEvaluationService(id, req.user!.userId, req.body);
    res.json({ success: true, message: "Evaluation updated.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};
