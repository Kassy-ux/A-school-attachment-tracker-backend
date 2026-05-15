

import { eq, ilike, and, count } from "drizzle-orm";
import  db from "../drizzle/db.js";
import { users, students, companies, attachments } from "../drizzle/schema.js";
import { parsePagination, buildPagination } from "../common/types.js";

// ============================================================
// GET all students  (supervisor / admin)
// ============================================================
export const getAllStudentsService = async (
  rawPage?: string,
  rawLimit?: string,
  search?: string
) => {
  const { page, limit, offset } = parsePagination(rawPage, rawLimit);

  const whereClause = search
    ? ilike(users.fullName, `%${search}%`)
    : undefined;

  const rows = await db
    .select({
      studentId: students.id,
      userId: users.id,
      fullName: users.fullName,
      email: users.email,
      phoneNumber: users.phoneNumber,
      profileImage: users.profileImage,
      registrationNumber: students.registrationNumber,
      course: students.course,
      yearOfStudy: students.yearOfStudy,
      department: students.department,
      school: students.school,
      attachmentStartDate: students.attachmentStartDate,
      attachmentEndDate: students.attachmentEndDate,
    })
    .from(students)
    .innerJoin(users, eq(users.id, students.userId))
    .where(whereClause)
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(students)
    .innerJoin(users, eq(users.id, students.userId))
    .where(whereClause);

  return {
    data: rows,
    pagination: buildPagination(Number(totalRow.total), page, limit),
  };
};

// ============================================================
// GET single student by studentId
// ============================================================
export const getStudentByIdService = async (studentId: string) => {
  const result = await db
    .select({
      studentId: students.id,
      userId: users.id,
      fullName: users.fullName,
      email: users.email,
      phoneNumber: users.phoneNumber,
      profileImage: users.profileImage,
      registrationNumber: students.registrationNumber,
      course: students.course,
      yearOfStudy: students.yearOfStudy,
      department: students.department,
      school: students.school,
      attachmentStartDate: students.attachmentStartDate,
      attachmentEndDate: students.attachmentEndDate,
      // Company info via attachments join
      companyId: companies.id,
      companyName: companies.companyName,
      companyCity: companies.city,
      companyIndustry: companies.industry,
      companySupervisorName: companies.supervisorName,
    })
    .from(students)
    .innerJoin(users, eq(users.id, students.userId))
    .leftJoin(
      attachments,
      and(
        eq(attachments.studentId, students.id),
        eq(attachments.status, "ongoing")
      )
    )
    .leftJoin(companies, eq(companies.id, attachments.companyId))
    .where(eq(students.id, studentId))
    .limit(1);

  if (result.length === 0) {
    throw { statusCode: 404, message: "Student not found." };
  }

  return result[0];
};

// ============================================================
// GET student profile by userId  (student gets their own profile)
// ============================================================
export const getMyStudentProfileService = async (userId: string) => {
  const result = await db
    .select({
      studentId: students.id,
      fullName: users.fullName,
      email: users.email,
      phoneNumber: users.phoneNumber,
      profileImage: users.profileImage,
      registrationNumber: students.registrationNumber,
      course: students.course,
      yearOfStudy: students.yearOfStudy,
      department: students.department,
      school: students.school,
      attachmentStartDate: students.attachmentStartDate,
      attachmentEndDate: students.attachmentEndDate,
      companyName: companies.companyName,
      companyCity: companies.city,
      companyIndustry: companies.industry,
      companySupervisorName: companies.supervisorName,
      attachmentStatus: attachments.status,
    })
    .from(students)
    .innerJoin(users, eq(users.id, students.userId))
    .leftJoin(
      attachments,
      and(
        eq(attachments.studentId, students.id),
        eq(attachments.status, "ongoing")
      )
    )
    .leftJoin(companies, eq(companies.id, attachments.companyId))
    .where(eq(students.userId, userId))
    .limit(1);

  if (result.length === 0) {
    throw { statusCode: 404, message: "Student profile not found." };
  }

  return result[0];
};

// ============================================================
// UPDATE student profile  (student updates their own profile)
// ============================================================
export interface UpdateStudentDto {
  phoneNumber?: string;
  department?: string;
  school?: string;
}

export const updateStudentProfileService = async (
  userId: string,
  dto: UpdateStudentDto
) => {
  // Update phone on users table
  if (dto.phoneNumber !== undefined) {
    await db
      .update(users)
      .set({ phoneNumber: dto.phoneNumber })
      .where(eq(users.id, userId));
  }

  // Update department / school on students table
  const studentFields: Partial<{ department: string; school: string }> = {};
  if (dto.department !== undefined) studentFields.department = dto.department;
  if (dto.school !== undefined) studentFields.school = dto.school;

  if (Object.keys(studentFields).length > 0) {
    await db
      .update(students)
      .set(studentFields)
      .where(eq(students.userId, userId));
  }

  return { message: "Profile updated successfully." };
};

// ============================================================
// ADMIN: Activate / Deactivate a student account
// ============================================================
export const toggleStudentStatusService = async (
  userId: string,
  isActive: boolean
) => {
  const result = await db
    .update(users)
    .set({ isActive })
    .where(eq(users.id, userId))
    .returning({ id: users.id, isActive: users.isActive });

  if (result.length === 0) {
    throw { statusCode: 404, message: "User not found." };
  }

  return result[0];
};
