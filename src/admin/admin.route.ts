import { Router } from "express";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { getSupervisors, getUsers } from "./admin.controller.js";

const adminRouter = Router();

adminRouter.use(protect);

adminRouter.get("/users", adminOnly, getUsers);
adminRouter.get("/supervisors", adminOnly, getSupervisors);

export default adminRouter;
