import { Router } from "express";
import { body } from "express-validator";
import { validationResult } from "express-validator";
import { protect, supervisorOrAdmin, adminOnly } from "../middleware/auth.middleware.js";
import { createCompany, getAllCompanies, getCompanyById, updateCompany, deleteCompany, } from "./company.controller.js";
const router = Router();
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
router.use(protect);
// Admin: create
router.post("/", adminOnly, [body("companyName").trim().notEmpty().withMessage("Company name is required")], validate, createCompany);
// Supervisor / Admin: read
router.get("/", supervisorOrAdmin, getAllCompanies);
router.get("/:id", supervisorOrAdmin, getCompanyById);
// Admin: update / delete
router.patch("/:id", adminOnly, updateCompany);
router.delete("/:id", adminOnly, deleteCompany);
export default router;
