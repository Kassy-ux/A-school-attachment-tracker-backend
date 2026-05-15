
import { eq, and, count } from "drizzle-orm";
import  db  from "../drizzle/db.js";
import { files, students } from "../drizzle/schema.js";
import { parsePagination, buildPagination } from "../common/types.js";

// ============================================================
// SAVE file record after upload  (called by controller)
// ============================================================
export interface SaveFileDto {
  studentId: string;
  fileName: string;
  fileUrl: string;
  fileType?: string;
}

export const saveFileService = async (dto: SaveFileDto) => {
  // Verify student exists
  const studentExists = await db
    .select({ id: students.id })
    .from(students)
    .where(eq(students.id, dto.studentId))
    .limit(1);

  if (studentExists.length === 0) {
    throw { statusCode: 404, message: "Student not found." };
  }

  const [file] = await db
    .insert(files)
    .values({
      studentId: dto.studentId,
      fileName:  dto.fileName,
      fileUrl:   dto.fileUrl,
      fileType:  dto.fileType,
    })
    .returning();

  return file;
};

// ============================================================
// GET my files  (student — own uploads)
// ============================================================
export const getMyFilesService = async (
  studentId: string,
  rawPage?: string,
  rawLimit?: string
) => {
  const { page, limit, offset } = parsePagination(rawPage, rawLimit);

  const rows = await db
    .select()
    .from(files)
    .where(eq(files.studentId, studentId))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(files)
    .where(eq(files.studentId, studentId));

  return {
    data: rows,
    pagination: buildPagination(Number(totalRow.total), page, limit),
  };
};

// ============================================================
// GET files for a student  (supervisor / admin)
// ============================================================
export const getStudentFilesService = async (
  studentId: string,
  rawPage?: string,
  rawLimit?: string
) => {
  const { page, limit, offset } = parsePagination(rawPage, rawLimit);

  const rows = await db
    .select()
    .from(files)
    .where(eq(files.studentId, studentId))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ total: count() })
    .from(files)
    .where(eq(files.studentId, studentId));

  return {
    data: rows,
    pagination: buildPagination(Number(totalRow.total), page, limit),
  };
};

// ============================================================
// GET single file by id
// ============================================================
export const getFileByIdService = async (fileId: string, studentId?: string) => {
  const whereClause = studentId
    ? and(eq(files.id, fileId), eq(files.studentId, studentId))
    : eq(files.id, fileId);

  const result = await db
    .select()
    .from(files)
    .where(whereClause)
    .limit(1);

  if (result.length === 0) {
    throw { statusCode: 404, message: "File not found." };
  }

  return result[0];
};

// ============================================================
// DELETE file  (student deletes own)
// ============================================================
export const deleteFileService = async (fileId: string, studentId: string) => {
  const existing = await db
    .select({ id: files.id })
    .from(files)
    .where(and(eq(files.id, fileId), eq(files.studentId, studentId)))
    .limit(1);

  if (existing.length === 0) {
    throw { statusCode: 404, message: "File not found." };
  }

  await db.delete(files).where(eq(files.id, fileId));
};
