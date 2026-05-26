import { eq } from "drizzle-orm";
// Suppress missing type declarations for bcryptjs if not installed
// @ts-ignore
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../drizzle/db.js";
import { users, students } from "../drizzle/schema.js";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_SECRET = process.env.JWT_SECRET || "";
const hashPassword = async (password) => bcrypt.hash(password, 12);
const comparePassword = async (plain, hashed) => bcrypt.compare(plain, hashed);
export const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
export const registerStudentService = async (dto) => {
    const existingUser = await db.select({ id: users.id }).from(users).where(eq(users.email, dto.email)).limit(1);
    if (existingUser.length > 0)
        throw { statusCode: 409, message: "Email is already registered." };
    const existingReg = await db.select({ id: students.id }).from(students).where(eq(students.registrationNumber, dto.registrationNumber)).limit(1);
    if (existingReg.length > 0)
        throw { statusCode: 409, message: "Registration number is already in use." };
    const hashedPassword = await hashPassword(dto.password);
    const [newUser] = await db.insert(users).values({
        fullName: dto.fullName, email: dto.email, password: hashedPassword,
        phoneNumber: dto.phoneNumber, role: "student",
    }).returning({ id: users.id, fullName: users.fullName, email: users.email, role: users.role, createdAt: users.createdAt });
    const [newStudent] = await db.insert(students).values({
        userId: newUser.id, registrationNumber: dto.registrationNumber,
        course: dto.course, yearOfStudy: dto.yearOfStudy,
        department: dto.department, school: dto.school,
    }).returning({ id: students.id });
    const token = signToken({ userId: newUser.id, role: "student", studentId: newStudent.id });
    return { token, user: { ...newUser, studentId: newStudent.id } };
};
export const registerSupervisorService = async (dto) => {
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, dto.email)).limit(1);
    if (existing.length > 0)
        throw { statusCode: 409, message: "Email is already registered." };
    const hashedPassword = await hashPassword(dto.password);
    const [newUser] = await db.insert(users).values({
        fullName: dto.fullName, email: dto.email, password: hashedPassword,
        phoneNumber: dto.phoneNumber, role: dto.role,
    }).returning({ id: users.id, fullName: users.fullName, email: users.email, role: users.role, createdAt: users.createdAt });
    const token = signToken({ userId: newUser.id, role: dto.role });
    return { token, user: newUser };
};
export const loginService = async (dto) => {
    const result = await db.select({
        id: users.id, fullName: users.fullName, email: users.email,
        password: users.password, role: users.role, isActive: users.isActive,
        studentId: students.id,
    }).from(users)
        .leftJoin(students, eq(students.userId, users.id))
        .where(eq(users.email, dto.email)).limit(1);
    if (result.length === 0)
        throw { statusCode: 401, message: "Invalid email or password." };
    const user = result[0];
    if (!user.isActive)
        throw { statusCode: 403, message: "Account is deactivated. Contact your administrator." };
    const isMatch = await comparePassword(dto.password, user.password);
    if (!isMatch)
        throw { statusCode: 401, message: "Invalid email or password." };
    const token = signToken({
        userId: user.id,
        role: user.role,
        ...(user.studentId ? { studentId: user.studentId } : {}),
    });
    return {
        token,
        user: {
            id: user.id, fullName: user.fullName, email: user.email, role: user.role,
            ...(user.studentId ? { studentId: user.studentId } : {}),
        },
    };
};
// ---- Get Me ----
export const getMeService = async (userId) => {
    const result = await db.select({
        id: users.id, fullName: users.fullName, email: users.email,
        role: users.role, phoneNumber: users.phoneNumber,
        profileImage: users.profileImage, isActive: users.isActive, createdAt: users.createdAt,
        studentId: students.id, registrationNumber: students.registrationNumber,
        course: students.course, yearOfStudy: students.yearOfStudy,
        department: students.department, school: students.school,
        attachmentStartDate: students.attachmentStartDate,
        attachmentEndDate: students.attachmentEndDate,
        supervisorId: students.supervisorId,
    }).from(users)
        .leftJoin(students, eq(students.userId, users.id))
        .where(eq(users.id, userId)).limit(1);
    if (result.length === 0)
        throw { statusCode: 404, message: "User not found." };
    return result[0];
};
// ---- Change Password ----
export const changePasswordService = async (userId, currentPassword, newPassword) => {
    const result = await db.select({ password: users.password }).from(users).where(eq(users.id, userId)).limit(1);
    if (result.length === 0)
        throw { statusCode: 404, message: "User not found." };
    const isMatch = await comparePassword(currentPassword, result[0].password);
    if (!isMatch)
        throw { statusCode: 400, message: "Current password is incorrect." };
    const hashed = await hashPassword(newPassword);
    await db.update(users).set({ password: hashed }).where(eq(users.id, userId));
};
