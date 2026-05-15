
import { eq, and, count } from "drizzle-orm";
import db from "../drizzle/db.js";
import { evaluations, students, users } from "../drizzle/schema.js";
import { parsePagination, buildPagination } from "../common/types.js";

// ============================================================
// DTOs
// ============================================================

export interface CreateEvaluationDto {
  studentId: string;
  performanceScore?: number;
  communicationScore?: number;
  technicalSkillScore?: number;
  punctualityScore?: number;
  comments?: string;
  recommendation?: string;
}

export type UpdateEvaluationDto = Omit<Partial<CreateEvaluationDto>, "studentId">;

// ============================================================
// CREATE evaluation  (supervisor)
// ============================================================
export const createEvaluationService = async (
  supervisorId: string,
  dto: CreateEvaluationDto
) => {
  // Validate score ranges (1-10)
  const scores = [
    dto.performanceScore,
    dto.communicationScore,
    dto.technicalSkillScore,
    dto.punctualityScore,
  ].filter((s) => s !== undefined);

  for (const score of scores) {
    if (score! < 1 || score! > 10) {
      throw { statusCode: 400, message: "All scores must be between 1 and 10." };
    }
  }

  // Check student exists
  const studentExists = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.id, dto.studentId))
    .limit(1);

  if (studentExists.length === 0) {
    throw { statusCode: 404, message: "Student not found." };
  }

  // Prevent duplicate evaluation by same supervisor for same student
  const existing = await db
    .select({ id: evaluations.id })
    .from(evaluations)
    .where(
      and(
        eq(evaluations.studentId, dto.studentId),
        eq(evaluations.supervisorId, supervisorId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    throw {
      statusCode: 409,
      message: "You have already evaluated this student. Update the existing evaluation.",
    };
  }

  const [evaluation] = await db
    .insert(evaluations)
    .values({
      studentId:          dto.studentId,
      supervisorId:       supervisorId,
      performanceScore:   dto.performanceScore,
      communicationScore: dto.communicationScore,
      technicalSkillScore: dto.technicalSkillScore,
      punctualityScore:   dto.punctualityScore,
      comments:           dto.comments,
      recommendation:     dto.recommendation,
    })
    .returning();

  return evaluation;
};

// ============================================================
// GET evaluation for a student  (student sees their own / supervisor sees any)
// ============================================================
export const getStudentEvaluationsService = async (studentId: string) => {
  const result = await db
    .select({
      evaluationId:        evaluations.id,
      performanceScore:    evaluations.performanceScore,
      communicationScore:  evaluations.communicationScore,
      technicalSkillScore: evaluations.technicalSkillScore,
      punctualityScore:    evaluations.punctualityScore,
      comments:            evaluations.comments,
      recommendation:      evaluations.recommendation,
      createdAt:           evaluations.createdAt,
      // Supervisor info
      supervisorId:        users.id,
      supervisorName:      users.fullName,
      supervisorEmail:     users.email,
    })
    .from(evaluations)
    .innerJoin(users, eq(users.id, evaluations.supervisorId))
    .where(eq(evaluations.studentId, studentId));

  return result;
};

// ============================================================
// GET all evaluations  (admin)
// ============================================================
export const getAllEvaluationsService = async (
  rawPage?: string,
  rawLimit?: string
) => {
  const { page, limit, offset } = parsePagination(rawPage, rawLimit);

  const rows = await db
    .select({
      evaluationId:        evaluations.id,
      performanceScore:    evaluations.performanceScore,
      communicationScore:  evaluations.communicationScore,
      technicalSkillScore: evaluations.technicalSkillScore,
      punctualityScore:    evaluations.punctualityScore,
      comments:            evaluations.comments,
      recommendation:      evaluations.recommendation,
      createdAt:           evaluations.createdAt,
      studentId:           students.id,
      studentName:         users.fullName,
      registrationNumber:  students.registrationNumber,
      supervisorId:        evaluations.supervisorId,
    })
    .from(evaluations)
    .innerJoin(students, eq(students.id, evaluations.studentId))
    .innerJoin(users,    eq(users.id,    students.userId))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(evaluations);

  return {
    data: rows,
    pagination: buildPagination(Number(totalRow.total), page, limit),
  };
};

// ============================================================
// GET single evaluation by id
// ============================================================
export const getEvaluationByIdService = async (evaluationId: string) => {
  const result = await db
    .select({
      evaluationId:        evaluations.id,
      performanceScore:    evaluations.performanceScore,
      communicationScore:  evaluations.communicationScore,
      technicalSkillScore: evaluations.technicalSkillScore,
      punctualityScore:    evaluations.punctualityScore,
      comments:            evaluations.comments,
      recommendation:      evaluations.recommendation,
      createdAt:           evaluations.createdAt,
      studentId:           students.id,
      studentName:         users.fullName,
      registrationNumber:  students.registrationNumber,
      course:              students.course,
      supervisorId:        evaluations.supervisorId,
    })
    .from(evaluations)
    .innerJoin(students, eq(students.id, evaluations.studentId))
    .innerJoin(users,    eq(users.id,    students.userId))
    .where(eq(evaluations.id, evaluationId))
    .limit(1);

  if (result.length === 0) {
    throw { statusCode: 404, message: "Evaluation not found." };
  }

  return result[0];
};

// ============================================================
// UPDATE evaluation  (supervisor — only their own)
// ============================================================
export const updateEvaluationService = async (
  evaluationId: string,
  supervisorId: string,
  dto: UpdateEvaluationDto
) => {
  const existing = await db
    .select({ id: evaluations.id, supervisorId: evaluations.supervisorId })
    .from(evaluations)
    .where(eq(evaluations.id, evaluationId))
    .limit(1);

  if (existing.length === 0) {
    throw { statusCode: 404, message: "Evaluation not found." };
  }

  if (existing[0].supervisorId !== supervisorId) {
    throw { statusCode: 403, message: "You can only update your own evaluations." };
  }

  const scores = [
    dto.performanceScore,
    dto.communicationScore,
    dto.technicalSkillScore,
    dto.punctualityScore,
  ].filter((s) => s !== undefined);

  for (const score of scores) {
    if (score! < 1 || score! > 10) {
      throw { statusCode: 400, message: "All scores must be between 1 and 10." };
    }
  }

  const [updated] = await db
    .update(evaluations)
    .set({
      ...(dto.performanceScore    !== undefined && { performanceScore:    dto.performanceScore }),
      ...(dto.communicationScore  !== undefined && { communicationScore:  dto.communicationScore }),
      ...(dto.technicalSkillScore !== undefined && { technicalSkillScore: dto.technicalSkillScore }),
      ...(dto.punctualityScore    !== undefined && { punctualityScore:    dto.punctualityScore }),
      ...(dto.comments            !== undefined && { comments:            dto.comments }),
      ...(dto.recommendation      !== undefined && { recommendation:      dto.recommendation }),
    })
    .where(eq(evaluations.id, evaluationId))
    .returning();

  return updated;
};

// ============================================================
// COMPUTE average score for a student
// ============================================================
export const getStudentAverageScoreService = async (studentId: string) => {
  const result = await db
    .select({
      performanceScore:    evaluations.performanceScore,
      communicationScore:  evaluations.communicationScore,
      technicalSkillScore: evaluations.technicalSkillScore,
      punctualityScore:    evaluations.punctualityScore,
    })
    .from(evaluations)
    .where(eq(evaluations.studentId, studentId));

  if (result.length === 0) {
    return { averageScore: null, totalEvaluations: 0 };
  }

  // Average all non-null scores across all evaluations
  let total = 0;
  let count = 0;

  for (const row of result) {
    const scores = [
      row.performanceScore,
      row.communicationScore,
      row.technicalSkillScore,
      row.punctualityScore,
    ].filter((s): s is number => s !== null && s !== undefined);

    scores.forEach((s) => { total += s; count++; });
  }

  const averageScore = count > 0 ? Math.round((total / count) * 10) / 10 : null;

  return { averageScore, totalEvaluations: result.length };
};
