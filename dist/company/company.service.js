import { eq, ilike, count } from "drizzle-orm";
import db from "../drizzle/db.js";
import { companies } from "../drizzle/schema.js";
import { parsePagination, buildPagination } from "../common/types.js";
// ============================================================
// CREATE company  (admin only)
// ============================================================
export const createCompanyService = async (dto) => {
    const [company] = await db
        .insert(companies)
        .values({
        companyName: dto.companyName,
        industry: dto.industry,
        address: dto.address,
        city: dto.city,
        country: dto.country,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        supervisorName: dto.supervisorName,
        supervisorEmail: dto.supervisorEmail,
    })
        .returning();
    return company;
};
// ============================================================
// GET ALL companies  (supervisor / admin)
// ============================================================
export const getAllCompaniesService = async (rawPage, rawLimit, search) => {
    const { page, limit, offset } = parsePagination(rawPage, rawLimit);
    const whereClause = search
        ? ilike(companies.companyName, `%${search}%`)
        : undefined;
    const rows = await db
        .select()
        .from(companies)
        .where(whereClause)
        .limit(limit)
        .offset(offset);
    const [totalRow] = await db
        .select({ total: count() })
        .from(companies)
        .where(whereClause);
    return {
        data: rows,
        pagination: buildPagination(Number(totalRow.total), page, limit),
    };
};
// ============================================================
// GET single company by id
// ============================================================
export const getCompanyByIdService = async (companyId) => {
    const result = await db
        .select()
        .from(companies)
        .where(eq(companies.id, companyId))
        .limit(1);
    if (result.length === 0) {
        throw { statusCode: 404, message: "Company not found." };
    }
    return result[0];
};
// ============================================================
// UPDATE company  (admin only)
// ============================================================
export const updateCompanyService = async (companyId, dto) => {
    const existing = await db
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.id, companyId))
        .limit(1);
    if (existing.length === 0) {
        throw { statusCode: 404, message: "Company not found." };
    }
    const [updated] = await db
        .update(companies)
        .set({
        ...(dto.companyName !== undefined && { companyName: dto.companyName }),
        ...(dto.industry !== undefined && { industry: dto.industry }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phoneNumber !== undefined && { phoneNumber: dto.phoneNumber }),
        ...(dto.supervisorName !== undefined && { supervisorName: dto.supervisorName }),
        ...(dto.supervisorEmail !== undefined && { supervisorEmail: dto.supervisorEmail }),
    })
        .where(eq(companies.id, companyId))
        .returning();
    return updated;
};
// ============================================================
// DELETE company  (admin only)
// ============================================================
export const deleteCompanyService = async (companyId) => {
    const existing = await db
        .select({ id: companies.id })
        .from(companies)
        .where(eq(companies.id, companyId))
        .limit(1);
    if (existing.length === 0) {
        throw { statusCode: 404, message: "Company not found." };
    }
    await db.delete(companies).where(eq(companies.id, companyId));
};
