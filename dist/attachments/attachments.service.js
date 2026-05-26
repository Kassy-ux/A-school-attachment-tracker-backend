import { eq, and, count } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import db from "../drizzle/db.js";
import { attachments, students, companies, users } from "../drizzle/schema.js";
import { parsePagination, buildPagination } from "../common/types.js";
const studentUsers = alias(users, "student_users");
const supervisorUsers = alias(users, "supervisor_users");
// ============================================================
// ASSIGN supervisor to student  (admin)
// ============================================================
export const assignAttachmentService = async (assignedBy, dto) => {
    // Check student exists
    const studentExists = await db
        .select({ id: students.id })
        .from(students)
        .where(eq(students.id, dto.studentId))
        .limit(1);
    if (studentExists.length === 0) {
        throw { statusCode: 404, message: "Student not found." };
    }
    // Check supervisor exists
    const supervisorExists = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.id, dto.supervisorId), eq(users.role, "supervisor")))
        .limit(1);
    if (supervisorExists.length === 0) {
        throw { statusCode: 404, message: "Supervisor not found." };
    }
    // Check if student already has an ongoing attachment
    const ongoing = await db
        .select({ id: attachments.id })
        .from(attachments)
        .where(and(eq(attachments.studentId, dto.studentId), eq(attachments.status, "ongoing")))
        .limit(1);
    if (ongoing.length > 0) {
        const [attachment] = await db
            .update(attachments)
            .set({
            supervisorId: dto.supervisorId,
            assignedBy,
            startDate: dto.startDate,
            endDate: dto.endDate,
            ...(dto.companyId !== undefined && { companyId: dto.companyId }),
        })
            .where(eq(attachments.id, ongoing[0].id))
            .returning();
        await db
            .update(students)
            .set({
            attachmentStartDate: dto.startDate,
            attachmentEndDate: dto.endDate,
            supervisorId: dto.supervisorId,
        })
            .where(eq(students.id, dto.studentId));
        return attachment;
    }
    // Create the attachment
    const [attachment] = await db
        .insert(attachments)
        .values({
        studentId: dto.studentId,
        supervisorId: dto.supervisorId,
        ...(dto.companyId !== undefined && { companyId: dto.companyId }),
        assignedBy: assignedBy,
        startDate: dto.startDate,
        endDate: dto.endDate,
        status: "ongoing",
    })
        .returning();
    // Also update student's attachment dates for convenience
    await db
        .update(students)
        .set({
        attachmentStartDate: dto.startDate,
        attachmentEndDate: dto.endDate,
        supervisorId: dto.supervisorId,
    })
        .where(eq(students.id, dto.studentId));
    return attachment;
};
// ============================================================
// GET ALL attachments  (admin / supervisor)
// ============================================================
export const getAllAttachmentsService = async (rawPage, rawLimit, supervisorId) => {
    const { page, limit, offset } = parsePagination(rawPage, rawLimit);
    const whereClause = supervisorId ? eq(attachments.supervisorId, supervisorId) : undefined;
    const rows = await db
        .select({
        attachmentId: attachments.id,
        status: attachments.status,
        startDate: attachments.startDate,
        endDate: attachments.endDate,
        createdAt: attachments.createdAt,
        // Student info
        studentId: students.id,
        studentName: studentUsers.fullName,
        studentEmail: studentUsers.email,
        regNumber: students.registrationNumber,
        course: students.course,
        supervisorId: supervisorUsers.id,
        supervisorName: supervisorUsers.fullName,
        supervisorEmail: supervisorUsers.email,
        // Company info
        companyId: companies.id,
        companyName: companies.companyName,
        companyCity: companies.city,
        companyIndustry: companies.industry,
    })
        .from(attachments)
        .innerJoin(students, eq(students.id, attachments.studentId))
        .innerJoin(studentUsers, eq(studentUsers.id, students.userId))
        .leftJoin(supervisorUsers, eq(supervisorUsers.id, attachments.supervisorId))
        .leftJoin(companies, eq(companies.id, attachments.companyId))
        .where(whereClause)
        .limit(limit)
        .offset(offset);
    const [totalRow] = await db
        .select({ total: count() })
        .from(attachments)
        .where(whereClause);
    return {
        data: rows,
        pagination: buildPagination(Number(totalRow.total), page, limit),
    };
};
// ============================================================
// GET single attachment by id
// ============================================================
export const getAttachmentByIdService = async (attachmentId, supervisorId) => {
    const result = await db
        .select({
        attachmentId: attachments.id,
        status: attachments.status,
        startDate: attachments.startDate,
        endDate: attachments.endDate,
        createdAt: attachments.createdAt,
        studentId: students.id,
        studentName: studentUsers.fullName,
        studentEmail: studentUsers.email,
        regNumber: students.registrationNumber,
        course: students.course,
        yearOfStudy: students.yearOfStudy,
        supervisorId: supervisorUsers.id,
        supervisorName: supervisorUsers.fullName,
        supervisorEmail: supervisorUsers.email,
        companyId: companies.id,
        companyName: companies.companyName,
        companyCity: companies.city,
        companyCountry: companies.country,
        companyIndustry: companies.industry,
        companySupervisorName: companies.supervisorName,
        companySupervisorEmail: companies.supervisorEmail,
    })
        .from(attachments)
        .innerJoin(students, eq(students.id, attachments.studentId))
        .innerJoin(studentUsers, eq(studentUsers.id, students.userId))
        .leftJoin(supervisorUsers, eq(supervisorUsers.id, attachments.supervisorId))
        .leftJoin(companies, eq(companies.id, attachments.companyId))
        .where(and(eq(attachments.id, attachmentId), ...(supervisorId ? [eq(attachments.supervisorId, supervisorId)] : [])))
        .limit(1);
    if (result.length === 0) {
        throw { statusCode: 404, message: "Attachment not found." };
    }
    return result[0];
};
// ============================================================
// GET my attachment  (student — views their own)
// ============================================================
export const getMyAttachmentService = async (studentId) => {
    const result = await db
        .select({
        attachmentId: attachments.id,
        status: attachments.status,
        startDate: attachments.startDate,
        endDate: attachments.endDate,
        supervisorId: supervisorUsers.id,
        supervisorName: supervisorUsers.fullName,
        supervisorEmail: supervisorUsers.email,
        companyId: companies.id,
        companyName: companies.companyName,
        industry: companies.industry,
        address: companies.address,
        city: companies.city,
        country: companies.country,
        companyEmail: companies.email,
        companyPhone: companies.phoneNumber,
        companySupervisorName: companies.supervisorName,
        companySupervisorEmail: companies.supervisorEmail,
    })
        .from(attachments)
        .leftJoin(supervisorUsers, eq(supervisorUsers.id, attachments.supervisorId))
        .leftJoin(companies, eq(companies.id, attachments.companyId))
        .where(and(eq(attachments.studentId, studentId), eq(attachments.status, "ongoing")))
        .limit(1);
    if (result.length === 0) {
        throw { statusCode: 404, message: "No active attachment found." };
    }
    return result[0];
};
// ============================================================
// END attachment  (admin marks it completed)
// ============================================================
export const endAttachmentService = async (attachmentId) => {
    const existing = await db
        .select({ id: attachments.id, status: attachments.status })
        .from(attachments)
        .where(eq(attachments.id, attachmentId))
        .limit(1);
    if (existing.length === 0) {
        throw { statusCode: 404, message: "Attachment not found." };
    }
    if (existing[0].status !== "ongoing") {
        throw { statusCode: 400, message: "Attachment is already completed." };
    }
    const [updated] = await db
        .update(attachments)
        .set({ status: "completed" })
        .where(eq(attachments.id, attachmentId))
        .returning();
    return updated;
};
