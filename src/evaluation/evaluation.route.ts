
import { Router } from "express";
import { body } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { protect, studentOnly, supervisorOnly, supervisorOrAdmin, adminOnly } from "../middleware/auth.middleware.js";
import {
  createEvaluation,
  getAllEvaluations,
  getMyEvaluations,
  getMyScore,
  getStudentEvaluations,
  getEvaluationById,
  updateEvaluation,
} from "./evaluation.controller.js";
import router from "../files/files.route.js";

const EvaluationRouter = Router();

const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({
        field: e.type === "field" ? e.path : "unknown",
        message: e.msg,
      })),
    });
    return;
  }
  next();
};

const scoreRule = (field: string) =>
  body(field)
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage(`${field} must be between 1 and 10`);

router.use(protect);

// Student routes
router.get("/me",       studentOnly, getMyEvaluations);
router.get("/me/score", studentOnly, getMyScore);

// Admin — all evaluations
router.get("/", adminOnly, getAllEvaluations);

// Supervisor / Admin — view by student or by id
router.get("/student/:studentId", supervisorOrAdmin, getStudentEvaluations);
router.get("/:id",                supervisorOrAdmin, getEvaluationById);

// Supervisor — create
router.post(
  "/",
  supervisorOnly,
  [
    body("studentId").isUUID().withMessage("Valid student ID required"),
    scoreRule("performanceScore"),
    scoreRule("communicationScore"),
    scoreRule("technicalSkillScore"),
    scoreRule("punctualityScore"),
    body("comments").optional().trim(),
    body("recommendation").optional().trim(),
  ],
  validate,
  createEvaluation
);

// Supervisor — update own
router.patch(
  "/:id",
  supervisorOnly,
  [
    scoreRule("performanceScore"),
    scoreRule("communicationScore"),
    scoreRule("technicalSkillScore"),
    scoreRule("punctualityScore"),
    body("comments").optional().trim(),
    body("recommendation").optional().trim(),
  ],
  validate,
  updateEvaluation
);

export default EvaluationRouter;
