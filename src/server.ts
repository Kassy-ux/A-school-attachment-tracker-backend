import express, {  Application , Response} from 'express';
import dotenv from "dotenv"

import cors from "cors";
import helmet from "helmet";

 
// Routes
import authRoutes from "./Auth/auth.route.js";
 
// Middleware
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middleware/error.middleware.js";
import studentRoutes from './students/student.route.js';
import dailyRouter from './daily-logs/daily-logs.route.js';
import attendancerouter from './attendance/attendance.route.js';
import FileRouter from './files/files.route.js';
import EvaluationRouter from './evaluation/evaluation.route.js';
import companyRouter from './company/company.route.js';
import attachmentRouter from './attachments/attachments.route.js';
import notificationRouter from './notifications/notifications.route.js';
import reportRouter from './reports/reports.route.js';



const app = express();


const PORT = process.env.PORT || 5000

//Start server

app.use(helmet());
 
app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);
 
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

//health check
app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Attachment Tracker API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});




//api routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/daily-logs", dailyRouter);
app.use("/api/attendance", attendancerouter);
app.use("/api/evaluations", EvaluationRouter);
app.use("/api/attachments", attachmentRouter);
app.use ("/api/notifications", notificationRouter);
app.use("/api/reports", reportRouter);
app.use("/api/company", companyRouter);
app.use("/api/files", FileRouter);


app.use("/api/files", FileRouter);












//error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);
app.listen(PORT,()=>{
    console.log(`🚀 Server running on http://localhost:${PORT}`);
})