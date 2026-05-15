
import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getMyNotifications, markAsRead, markAllAsRead } from "./notifications.controller.js";

const router = Router();
router.use(protect);

router.get("/", getMyNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);

export default router;
