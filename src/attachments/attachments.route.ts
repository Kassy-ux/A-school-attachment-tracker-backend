
import { Router } from "express";
import { body } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { protect, studentOnly, supervisorOrAdmin, adminOnly } from "../middleware/auth.middleware.js";
import {
  assignAttachment,
  getAllAttachments,
  getMyAttachment,
  getAttachmentById,
  endAttachment,
} from "./attachments.controller.js";

const attachmentRouter = Router();

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

attachmentRouter.use(protect);

// Student — view own attachment
attachmentRouter.get("/me", studentOnly, getMyAttachment);

// Supervisor / Admin — list all
attachmentRouter.get("/",    supervisorOrAdmin, getAllAttachments);
attachmentRouter.get("/:id", supervisorOrAdmin, getAttachmentById);

// Admin — assign supervisor to student
attachmentRouter.post(
  "/",
  adminOnly,
  [
    body("studentId").isUUID().withMessage("Valid student ID required"),
    body("supervisorId").isUUID().withMessage("Valid supervisor ID required"),
    body("companyId").optional().isUUID().withMessage("Valid company ID required"),
    body("startDate").isISO8601().withMessage("Valid start date required (YYYY-MM-DD)"),
    body("endDate").isISO8601().withMessage("Valid end date required (YYYY-MM-DD)"),
  ],
  validate,
  assignAttachment
);

// Admin — end attachment
attachmentRouter.patch("/:id/end", adminOnly, endAttachment);

export default attachmentRouter;
