import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getMyNotifications, markAsRead, markAllAsRead } from "./notifications.controller.js";
const notificationRouter = Router();
notificationRouter.use(protect);
notificationRouter.get("/", getMyNotifications);
notificationRouter.patch("/read-all", markAllAsRead);
notificationRouter.patch("/:id/read", markAsRead);
export default notificationRouter;
