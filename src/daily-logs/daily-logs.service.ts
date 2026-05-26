
import { eq, and, desc, count, sql } from "drizzle-orm";
import db from "../drizzle/db.js";
import { dailyLogs, students, users } from "../drizzle/schema.js";
import { parsePagination, buildPagination } from "../common/types.js";

// ============================================================
// CREATE  — student adds a daily log
// ============================================================
export interface CreateLogDto {
  logDate: string;
  taskDone: string;
  skillsLearned?: string;
  challengesFaced?: string;
  hoursWorked?: number;
}

export const createLogService = async (studentId: string, dto: CreateLogDto) => {
  // One log per day per student
  const existing = await db
    .select({ id: dailyLogs.id })
    .from(dailyLogs)
    .where(and(eq(dailyLogs.studentId, studentId), eq(dailyLogs.logDate, dto.logDate)))
    .limit(1);

  if (existing.length > 0) {
    throw { statusCode: 409, message: `A log already exists for ${dto.logDate}. Edit it instead.` };
  }

  const [log] = await db
    .insert(dailyLogs)
    .values({
      studentId,
      logDate: dto.logDate,
      taskDone: dto.taskDone,
      skillsLearned: dto.skillsLearned,
      challengesFaced: dto.challengesFaced,
      hoursWorked: dto.hoursWorked,
    })
    .returning();

  return log;
};

// ============================================================
// GET MY LOGS  — student views their own logs (paginated)
// ============================================================
export const getMyLogsService = async (
  studentId: string,
  rawPage?: string,
  rawLimit?: string
) => {
  const { page, limit, offset } = parsePagination(rawPage, rawLimit);

  const rows = await db
    .select()
    .from(dailyLogs)
    .where(eq(dailyLogs.studentId, studentId))
    .orderBy(desc(dailyLogs.logDate))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(dailyLogs)
    .where(eq(dailyLogs.studentId, studentId));

  return {
    data: rows,
    pagination: buildPagination(Number(totalRow.total), page, limit),
  };
};

// ============================================================
// GET LOG BY ID
// ============================================================
export const getLogByIdService = async (logId: string, studentId?: string, supervisorId?: string) => {
  const clauses = [
    eq(dailyLogs.id, logId),
    ...(studentId ? [eq(dailyLogs.studentId, studentId)] : []),
    ...(supervisorId ? [eq(students.supervisorId, supervisorId)] : []),
  ];

  const result = await db
    .select()
    .from(dailyLogs)
    .innerJoin(students, eq(students.id, dailyLogs.studentId))
    .where(and(...clauses))
    .limit(1);

  if (result.length === 0) throw { statusCode: 404, message: "Log not found." };
  return result[0].daily_logs;
};

// ============================================================
// UPDATE LOG  — only if not yet approved
// ============================================================
export interface UpdateLogDto {
  taskDone?: string;
  skillsLearned?: string;
  challengesFaced?: string;
  hoursWorked?: number;
}

export const updateLogService = async (
  logId: string,
  studentId: string,
  dto: UpdateLogDto
) => {
  const existing = await db
    .select({ id: dailyLogs.id, isApproved: dailyLogs.isApproved })
    .from(dailyLogs)
    .where(and(eq(dailyLogs.id, logId), eq(dailyLogs.studentId, studentId)))
    .limit(1);

  if (existing.length === 0) throw { statusCode: 404, message: "Log not found." };
  if (existing[0].isApproved) throw { statusCode: 400, message: "Cannot edit an approved log." };

  const [updated] = await db
    .update(dailyLogs)
    .set({
      ...(dto.taskDone !== undefined && { taskDone: dto.taskDone }),
      ...(dto.skillsLearned !== undefined && { skillsLearned: dto.skillsLearned }),
      ...(dto.challengesFaced !== undefined && { challengesFaced: dto.challengesFaced }),
      ...(dto.hoursWorked !== undefined && { hoursWorked: dto.hoursWorked }),
    })
    .where(eq(dailyLogs.id, logId))
    .returning();

  return updated;
};

// ============================================================
// DELETE LOG — only if not approved
// ============================================================
export const deleteLogService = async (logId: string, studentId: string) => {
  const existing = await db
    .select({ id: dailyLogs.id, isApproved: dailyLogs.isApproved })
    .from(dailyLogs)
    .where(and(eq(dailyLogs.id, logId), eq(dailyLogs.studentId, studentId)))
    .limit(1);

  if (existing.length === 0) throw { statusCode: 404, message: "Log not found." };
  if (existing[0].isApproved) throw { statusCode: 400, message: "Cannot delete an approved log." };

  await db.delete(dailyLogs).where(eq(dailyLogs.id, logId));
};

// ============================================================
// SUPERVISOR: GET a student's logs
// ============================================================
export const getStudentLogsService = async (
  studentId: string,
  rawPage?: string,
  rawLimit?: string,
  supervisorId?: string
) => {
  const { page, limit, offset } = parsePagination(rawPage, rawLimit);
  const clauses = [
    eq(dailyLogs.studentId, studentId),
    ...(supervisorId ? [eq(students.supervisorId, supervisorId)] : []),
  ];

  const rows = await db
    .select()
    .from(dailyLogs)
    .innerJoin(students, eq(students.id, dailyLogs.studentId))
    .where(and(...clauses))
    .orderBy(desc(dailyLogs.logDate))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(dailyLogs)
    .innerJoin(students, eq(students.id, dailyLogs.studentId))
    .where(and(...clauses));

  return {
    data: rows.map((row) => row.daily_logs),
    pagination: buildPagination(Number(totalRow.total), page, limit),
  };
};

// ============================================================
// SUPERVISOR: Approve/reject + comment on a log
// ============================================================
export interface ReviewLogDto {
  isApproved: boolean;
  supervisorComment?: string;
}

export const reviewLogService = async (logId: string, dto: ReviewLogDto, supervisorId?: string) => {
  const result = await db
    .select({ id: dailyLogs.id })
    .from(dailyLogs)
    .innerJoin(students, eq(students.id, dailyLogs.studentId))
    .where(and(eq(dailyLogs.id, logId), ...(supervisorId ? [eq(students.supervisorId, supervisorId)] : [])))
    .limit(1);

  if (result.length === 0) throw { statusCode: 404, message: "Log not found." };

  const [updated] = await db
    .update(dailyLogs)
    .set({
      isApproved: dto.isApproved,
      supervisorComment: dto.supervisorComment,
    })
    .where(eq(dailyLogs.id, logId))
    .returning();

  return updated;
};

// ============================================================
// STATS — student progress summary
// ============================================================
export const getLogStatsService = async (studentId: string) => {
  const [stats] = await db
    .select({
      totalLogs: count(),
      approvedLogs: sql<number>`count(*) filter (where ${dailyLogs.isApproved} = true)`,
      pendingLogs: sql<number>`count(*) filter (where ${dailyLogs.isApproved} = false)`,
      totalHours: sql<number>`coalesce(sum(${dailyLogs.hoursWorked}), 0)`,
    })
    .from(dailyLogs)
    .where(eq(dailyLogs.studentId, studentId));

  const completionPercentage =
    Number(stats.totalLogs) > 0
      ? Math.round((Number(stats.approvedLogs) / Number(stats.totalLogs)) * 100)
      : 0;

  return { ...stats, completionPercentage };
};
