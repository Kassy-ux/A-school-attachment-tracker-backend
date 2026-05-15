import { eq, and, desc, count } from "drizzle-orm";
import db from "../drizzle/db.js";
import { notifications } from "../drizzle/schema.js";
import { parsePagination, buildPagination } from "../common/types.js";
// Create a notification (called internally by other services)
export const createNotificationService = async (userId, title, message) => {
    const [notif] = await db
        .insert(notifications)
        .values({ userId, title, message })
        .returning();
    return notif;
};
// GET my notifications
export const getMyNotificationsService = async (userId, rawPage, rawLimit) => {
    const { page, limit, offset } = parsePagination(rawPage, rawLimit);
    const rows = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset);
    const [totalRow] = await db
        .select({ total: count() })
        .from(notifications)
        .where(eq(notifications.userId, userId));
    const [unreadRow] = await db
        .select({ unread: count() })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return {
        data: rows,
        pagination: buildPagination(Number(totalRow.total), page, limit),
        unreadCount: Number(unreadRow.unread),
    };
};
// MARK one as read
export const markAsReadService = async (notifId, userId) => {
    const result = await db
        .select({ id: notifications.id })
        .from(notifications)
        .where(and(eq(notifications.id, notifId), eq(notifications.userId, userId)))
        .limit(1);
    if (result.length === 0)
        throw { statusCode: 404, message: "Notification not found." };
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notifId));
};
// MARK ALL as read
export const markAllAsReadService = async (userId) => {
    await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
};
