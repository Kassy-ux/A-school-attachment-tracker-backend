
import { Response } from "express";
import { AuthRequest } from "../common/types.js";

import {
  createCompanyService,
  getAllCompaniesService,
  getCompanyByIdService,
  updateCompanyService,
  deleteCompanyService,
} from "./company.service.js";

// POST /api/companies  (admin)
export const createCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await createCompanyService(req.body);
    res.status(201).json({ success: true, message: "Company created.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// GET /api/companies  (supervisor / admin)
export const getAllCompanies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const q = req.query as Record<string, any>;
    const rawPage = Array.isArray(q.page) ? q.page[0] : q.page;
    const rawLimit = Array.isArray(q.limit) ? q.limit[0] : q.limit;
    const search = Array.isArray(q.search) ? q.search[0] : q.search;

    const result = await getAllCompaniesService(rawPage, rawLimit, search);
    res.json({ success: true, message: "Companies retrieved.", ...result });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// GET /api/companies/:id
export const getCompanyById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await getCompanyByIdService(id);
    res.json({ success: true, message: "Company retrieved.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// PATCH /api/companies/:id  (admin)
export const updateCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await updateCompanyService(id, req.body);
    res.json({ success: true, message: "Company updated.", data });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

// DELETE /api/companies/:id  (admin)
export const deleteCompany = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await deleteCompanyService(id);
    res.json({ success: true, message: "Company deleted." });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};
