export const parsePagination = (rawPage, rawLimit) => {
    const page = Math.max(1, parseInt(rawPage || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(rawLimit || "10", 10)));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};
export const buildPagination = (total, page, limit) => ({
    page, limit, total, totalPages: Math.ceil(total / limit),
});
