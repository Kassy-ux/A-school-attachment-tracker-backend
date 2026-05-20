
import { eq, and, desc, count } from "drizzle-orm";
import  db  from "../drizzle/db.js";
import { reports } from "../drizzle/schema.js";
import { parsePagination, buildPagination } from "../common/types.js";
import { createNotificationService } from "../notifications/notifications.service.js";



export interface CreateReportDto {
  weekNumber: number;
  title?: string;
  description?: string;
  fileUrl?: string;
}

// CREATE
export const createReportService = async (studentId: string, dto: CreateReportDto) => {
  const existing = await db
    .select({ id: reports.id })
    .from(reports)
    .where(and(eq(reports.studentId, studentId), eq(reports.weekNumber, dto.weekNumber)))
    .limit(1);

  if (existing.length > 0) {
    throw { statusCode: 409, message: `Report for week ${dto.weekNumber} already exists.` };
  }

  const [report] = await db
    .insert(reports)
    .values({ studentId, weekNumber: dto.weekNumber, title: dto.title, description: dto.description, fileUrl: dto.fileUrl })
    .returning();

  return report;
};

// GET MY REPORTS
export const getMyReportsService = async (studentId: string, rawPage?: string, rawLimit?: string) => {
  const { page, limit, offset } = parsePagination(rawPage, rawLimit);

  const rows = await db
    .select()
    .from(reports)
    .where(eq(reports.studentId, studentId))
    .orderBy(desc(reports.weekNumber))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db.select({ total: count() }).from(reports).where(eq(reports.studentId, studentId));

  return { data: rows, pagination: buildPagination(Number(totalRow.total), page, limit) };
};

// GET SINGLE REPORT
export const getReportByIdService = async (reportId: string, studentId?: string) => {
  const whereClause = studentId
    ? and(eq(reports.id, reportId), eq(reports.studentId, studentId))
    : eq(reports.id, reportId);

  const result = await db.select().from(reports).where(whereClause).limit(1);
  if (result.length === 0) throw { statusCode: 404, message: "Report not found." };
  return result[0];
};

// SUPERVISOR: GET STUDENT REPORTS
export const getStudentReportsService = async (studentId: string, rawPage?: string, rawLimit?: string) => {
  const { page, limit, offset } = parsePagination(rawPage, rawLimit);
  const rows = await db.select().from(reports).where(eq(reports.studentId, studentId)).orderBy(desc(reports.weekNumber)).limit(limit).offset(offset);
  const [totalRow] = await db.select({ total: count() }).from(reports).where(eq(reports.studentId, studentId));
  return { data: rows, pagination: buildPagination(Number(totalRow.total), page, limit) };
};

// SUPERVISOR: Review report
export interface ReviewReportDto {
  status: "approved" | "rejected";
  supervisorComment?: string;
}

export const reviewReportService = async (reportId: string, dto: ReviewReportDto) => {
  const result = await db.select({ id: reports.id }).from(reports).where(eq(reports.id, reportId)).limit(1);
  if (result.length === 0) throw { statusCode: 404, message: "Report not found." };

  const [updated] = await db
    .update(reports)
    .set({ status: dto.status, supervisorComment: dto.supervisorComment })
    .where(eq(reports.id, reportId))
    .returning();

  return updated;
};
