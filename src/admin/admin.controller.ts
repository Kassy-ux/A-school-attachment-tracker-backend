import { Response } from "express";
import { AuthRequest } from "../common/types.js";
import { getSupervisorsService, getUsersService } from "./admin.service.js";

export const getUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await getUsersService();
    res.json({ success: true, message: "Users retrieved.", data: users });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to retrieve users.",
    });
  }
};

export const getSupervisors = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const supervisors = await getSupervisorsService();
    res.json({ success: true, supervisors });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to retrieve supervisors.",
    });
  }
};
