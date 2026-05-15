

import { Response } from "express";
import { AuthRequest } from "../common/types.js";
import { getMyNotificationsService, markAsReadService, markAllAsReadService } from "./notifications.service.js";

export const getMyNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit } = req.query as Record<string, string>;
    const result = await getMyNotificationsService(req.user!.userId, page, limit);
    res.json({ success: true, message: "Notifications retrieved.", ...result });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await markAsReadService(req.params.id as string, req.user!.userId);
    res.json({ success: true, message: "Notification marked as read." });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await markAllAsReadService(req.user!.userId);
    res.json({ success: true, message: "All notifications marked as read." });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};
