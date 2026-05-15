import { getMyNotificationsService, markAsReadService, markAllAsReadService } from "./notifications.service.js";
export const getMyNotifications = async (req, res) => {
    try {
        const { page, limit } = req.query;
        const result = await getMyNotificationsService(req.user.userId, page, limit);
        res.json({ success: true, message: "Notifications retrieved.", ...result });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
export const markAsRead = async (req, res) => {
    try {
        await markAsReadService(req.params.id, req.user.userId);
        res.json({ success: true, message: "Notification marked as read." });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
export const markAllAsRead = async (req, res) => {
    try {
        await markAllAsReadService(req.user.userId);
        res.json({ success: true, message: "All notifications marked as read." });
    }
    catch (err) {
        res.status(err.statusCode || 500).json({ success: false, message: err.message });
    }
};
