import { Router } from "express";
import { body } from "express-validator";
import { validationResult } from "express-validator";
import { protect, studentOnly, supervisorOnly, supervisorOrAdmin, adminOnly } from "../middleware/auth.middleware.js";
import { createEvaluation, getAllEvaluations, getMyEvaluations, getMyScore, getStudentEvaluations, getEvaluationById, updateEvaluation, } from "./evaluation.controller.js";
const EvaluationRouter = Router();
const validate = (req, res, next) => {
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
const scoreRule = (field) => body(field)
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage(`${field} must be between 1 and 10`);
EvaluationRouter.use(protect);
// Student routes
EvaluationRouter.get("/me", studentOnly, getMyEvaluations);
EvaluationRouter.get("/me/score", studentOnly, getMyScore);
// Admin — all evaluations
EvaluationRouter.get("/", adminOnly, getAllEvaluations);
// Supervisor / Admin — view by student or by id
EvaluationRouter.get("/student/:studentId", supervisorOrAdmin, getStudentEvaluations);
EvaluationRouter.get("/:id", supervisorOrAdmin, getEvaluationById);
// Supervisor — create
EvaluationRouter.post("/", supervisorOnly, [
    body("studentId").isUUID().withMessage("Valid student ID required"),
    scoreRule("performanceScore"),
    scoreRule("communicationScore"),
    scoreRule("technicalSkillScore"),
    scoreRule("punctualityScore"),
    body("comments").optional().trim(),
    body("recommendation").optional().trim(),
], validate, createEvaluation);
// Supervisor — update own
EvaluationRouter.patch("/:id", supervisorOnly, [
    scoreRule("performanceScore"),
    scoreRule("communicationScore"),
    scoreRule("technicalSkillScore"),
    scoreRule("punctualityScore"),
    body("comments").optional().trim(),
    body("recommendation").optional().trim(),
], validate, updateEvaluation);
export default EvaluationRouter;
