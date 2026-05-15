import { eq, and, desc, count, sql } from "drizzle-orm";
import db from "../drizzle/db.js";
import { attendance } from "../drizzle/schema.js";
import { parsePagination, buildPagination } from "../common/types.js";
// ============================================================
// CHECK IN
// ============================================================
export const checkInService = async (studentId) => {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const existing = await db
        .select({ id: attendance.id, checkOut: attendance.checkOut })
        .from(attendance)
        .where(and(eq(attendance.studentId, studentId), eq(attendance.attendanceDate, today)))
        .limit(1);
    if (existing.length > 0) {
        if (!existing[0].checkOut) {
            throw { statusCode: 409, message: "You are already checked in. Check out first." };
        }
        throw { statusCode: 409, message: "You have already completed attendance for today." };
    }
    const [record] = await db
        .insert(attendance)
        .values({
        studentId,
        attendanceDate: today,
        checkIn: new Date(),
    })
        .returning();
    return record;
};
// ============================================================
// CHECK OUT
// ============================================================
export const checkOutService = async (studentId) => {
    const today = new Date().toISOString().split("T")[0];
    const existing = await db
        .select({ id: attendance.id, checkIn: attendance.checkIn, checkOut: attendance.checkOut })
        .from(attendance)
        .where(and(eq(attendance.studentId, studentId), eq(attendance.attendanceDate, today)))
        .limit(1);
    if (existing.length === 0) {
        throw { statusCode: 400, message: "You have not checked in today." };
    }
    if (existing[0].checkOut) {
        throw { statusCode: 409, message: "You have already checked out today." };
    }
    const checkOut = new Date();
    const checkIn = new Date(existing[0].checkIn);
    const totalHours = Math.round((checkOut.getTime() - checkIn.getTime()) / 3600000 * 10) / 10;
    const [updated] = await db
        .update(attendance)
        .set({ checkOut, totalHours: Math.floor(totalHours) })
        .where(eq(attendance.id, existing[0].id))
        .returning();
    return { ...updated, totalHoursDecimal: totalHours };
};
// ============================================================
// GET MY ATTENDANCE HISTORY
// ============================================================
export const getMyAttendanceService = async (studentId, rawPage, rawLimit) => {
    const { page, limit, offset } = parsePagination(rawPage, rawLimit);
    const rows = await db
        .select()
        .from(attendance)
        .where(eq(attendance.studentId, studentId))
        .orderBy(desc(attendance.attendanceDate))
        .limit(limit)
        .offset(offset);
    const [totalRow] = await db
        .select({ total: count() })
        .from(attendance)
        .where(eq(attendance.studentId, studentId));
    return {
        data: rows,
        pagination: buildPagination(Number(totalRow.total), page, limit),
    };
};
// ============================================================
// GET TODAY'S STATUS
// ============================================================
export const getTodayStatusService = async (studentId) => {
    const today = new Date().toISOString().split("T")[0];
    const result = await db
        .select()
        .from(attendance)
        .where(and(eq(attendance.studentId, studentId), eq(attendance.attendanceDate, today)))
        .limit(1);
    if (result.length === 0) {
        return { status: "not_checked_in", date: today };
    }
    const record = result[0];
    return {
        ...record,
        status: record.checkOut ? "completed" : "checked_in",
        date: today,
    };
};
// ============================================================
// ATTENDANCE SUMMARY (total days, hours, %)
// ============================================================
export const getAttendanceSummaryService = async (studentId) => {
    const [summary] = await db
        .select({
        totalDays: count(),
        totalHours: sql `coalesce(sum(${attendance.totalHours}), 0)`,
        completedDays: sql `count(*) filter (where ${attendance.checkOut} is not null)`,
    })
        .from(attendance)
        .where(eq(attendance.studentId, studentId));
    return summary;
};
// ============================================================
// SUPERVISOR: View a student's attendance
// ============================================================
export const getStudentAttendanceService = async (studentId, rawPage, rawLimit) => {
    const { page, limit, offset } = parsePagination(rawPage, rawLimit);
    const rows = await db
        .select()
        .from(attendance)
        .where(eq(attendance.studentId, studentId))
        .orderBy(desc(attendance.attendanceDate))
        .limit(limit)
        .offset(offset);
    const [totalRow] = await db
        .select({ total: count() })
        .from(attendance)
        .where(eq(attendance.studentId, studentId));
    return {
        data: rows,
        pagination: buildPagination(Number(totalRow.total), page, limit),
    };
};
