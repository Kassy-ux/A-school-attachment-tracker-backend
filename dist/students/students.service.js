import { eq, ilike, and, count } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import db from "../drizzle/db.js";
import { users, students, companies, attachments } from "../drizzle/schema.js";
import { parsePagination, buildPagination } from "../common/types.js";
const supervisorUsers = alias(users, "supervisor_users");
// ============================================================
// GET all students  (supervisor / admin)
// ============================================================
export const getAllStudentsService = async (rawPage, rawLimit, search, supervisorId) => {
    const { page, limit, offset } = parsePagination(rawPage, rawLimit);
    const clauses = [
        ...(search ? [ilike(users.fullName, `%${search}%`)] : []),
        ...(supervisorId ? [eq(students.supervisorId, supervisorId)] : []),
    ];
    const whereClause = clauses.length > 0 ? and(...clauses) : undefined;
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
        supervisorId: students.supervisorId,
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
export const getStudentByIdService = async (studentId, supervisorId) => {
    const clauses = [
        eq(students.id, studentId),
        ...(supervisorId ? [eq(students.supervisorId, supervisorId)] : []),
    ];
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
        supervisorId: students.supervisorId,
        supervisorName: supervisorUsers.fullName,
        supervisorEmail: supervisorUsers.email,
        // Company info via attachments join
        companyId: companies.id,
        companyName: companies.companyName,
        companyCity: companies.city,
        companyIndustry: companies.industry,
        companySupervisorName: companies.supervisorName,
    })
        .from(students)
        .innerJoin(users, eq(users.id, students.userId))
        .leftJoin(attachments, and(eq(attachments.studentId, students.id), eq(attachments.status, "ongoing")))
        .leftJoin(supervisorUsers, eq(supervisorUsers.id, students.supervisorId))
        .leftJoin(companies, eq(companies.id, attachments.companyId))
        .where(and(...clauses))
        .limit(1);
    if (result.length === 0) {
        throw { statusCode: 404, message: "Student not found." };
    }
    return result[0];
};
// ============================================================
// GET student profile by userId  (student gets their own profile)
// ============================================================
export const getMyStudentProfileService = async (userId) => {
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
        supervisorId: students.supervisorId,
        supervisorName: supervisorUsers.fullName,
        supervisorEmail: supervisorUsers.email,
        companyName: companies.companyName,
        companyCity: companies.city,
        companyIndustry: companies.industry,
        companySupervisorName: companies.supervisorName,
        attachmentStatus: attachments.status,
    })
        .from(students)
        .innerJoin(users, eq(users.id, students.userId))
        .leftJoin(attachments, and(eq(attachments.studentId, students.id), eq(attachments.status, "ongoing")))
        .leftJoin(supervisorUsers, eq(supervisorUsers.id, students.supervisorId))
        .leftJoin(companies, eq(companies.id, attachments.companyId))
        .where(eq(students.userId, userId))
        .limit(1);
    if (result.length === 0) {
        throw { statusCode: 404, message: "Student profile not found." };
    }
    return result[0];
};
export const updateStudentProfileService = async (userId, dto) => {
    // Update phone on users table
    if (dto.phoneNumber !== undefined) {
        await db
            .update(users)
            .set({ phoneNumber: dto.phoneNumber })
            .where(eq(users.id, userId));
    }
    // Update department / school on students table
    const studentFields = {};
    if (dto.department !== undefined)
        studentFields.department = dto.department;
    if (dto.school !== undefined)
        studentFields.school = dto.school;
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
export const toggleStudentStatusService = async (userId, isActive) => {
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
