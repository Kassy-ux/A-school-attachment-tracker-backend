
import { Router } from "express";
import { body } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { protect, supervisorOrAdmin, adminOnly } from "../middleware/auth.middleware.js";
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from "./company.controller.js";

const companyRouter = Router();

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

companyRouter.use(protect);

// Admin: create
companyRouter.post(
  "/",
  adminOnly,
  [body("companyName").trim().notEmpty().withMessage("Company name is required")],
  validate,
  createCompany
);

// Supervisor / Admin: read
companyRouter.get("/",     getAllCompanies);
companyRouter.get("/:id", getCompanyById);

// Admin: update / delete
companyRouter.patch("/:id",  adminOnly, updateCompany);
companyRouter.delete("/:id", adminOnly, deleteCompany);

export default companyRouter;
