import { Router } from "express";
import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import {
  registerStudent,
  registerSupervisor,
  login,
  getMe,
  changePassword,
} from "./auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

// ---- Inline validator runner ----
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

// ============================================================
// PUBLIC ROUTES
// ============================================================

// POST /api/auth/register/student
router.post(
  "/register/student",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password needs 1 uppercase letter and 1 number"),
    body("registrationNumber")
      .trim()
      .notEmpty()
      .withMessage("Registration number is required"),
    body("course").trim().notEmpty().withMessage("Course is required"),
    body("yearOfStudy")
      .isInt({ min: 1, max: 6 })
      .withMessage("Year of study must be 1–6"),
    body("phoneNumber").optional().isMobilePhone("any"),
    body("department").optional().trim(),
    body("school").optional().trim(),
  ],
  validate,
  registerStudent
);

// POST /api/auth/register/supervisor  (also used for admin)
router.post(
  "/register/supervisor",
  [
    body("fullName").trim().notEmpty().withMessage("Full name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[A-Z])(?=.*\d)/)
      .withMessage("Password needs 1 uppercase letter and 1 number"),
    body("role")
      .isIn(["supervisor", "admin"])
      .withMessage("Role must be supervisor or admin"),
    body("phoneNumber").optional().isMobilePhone("any"),
  ],
  validate,
  registerSupervisor
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  login
);

// ============================================================
// PROTECTED ROUTES
// ============================================================

// GET /api/auth/me
router.get("/me", protect, getMe);

// POST /api/auth/change-password
router.post(
  "/change-password",
  protect,
  [
    body("currentPassword").notEmpty().withMessage("Current password required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters")
      .matches(/^(?=.*[A-Z])(?=.*\d)/)
      .withMessage("New password needs 1 uppercase letter and 1 number"),
  ],
  validate,
  changePassword
);

export default router;