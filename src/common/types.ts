
import { Request } from "express";

export type UserRole = "student" | "supervisor" | "admin";
export type ReportStatus = "pending" | "approved" | "rejected";

export interface JwtPayload {
  userId: string;
  role: UserRole;
  studentId?: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const parsePagination = (rawPage?: string, rawLimit?: string) => {
  const page = Math.max(1, parseInt(rawPage || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(rawLimit || "10", 10)));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

export const buildPagination = (total: number, page: number, limit: number): PaginationMeta => ({
  page, limit, total, totalPages: Math.ceil(total / limit),
});

