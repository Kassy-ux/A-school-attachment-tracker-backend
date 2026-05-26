// drizzle/schema.ts

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  date,
  pgEnum,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

// ======================================================
// ENUMS
// ======================================================

export const roleEnum = pgEnum("role", [
  "student",
  "supervisor",
  "admin",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "approved",
  "rejected",
]);

// ======================================================
// USERS TABLE
// ======================================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  fullName: varchar("full_name", { length: 255 }).notNull(),

  email: varchar("email", { length: 255 }).notNull().unique(),

  password: text("password").notNull(),

  phoneNumber: varchar("phone_number", { length: 20 }),

  role: roleEnum("role").default("student").notNull(),

  profileImage: text("profile_image"),

  isActive: boolean("is_active").default(true),

  createdAt: timestamp("created_at").defaultNow(),
});

// ======================================================
// STUDENTS TABLE
// ======================================================

export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  registrationNumber: varchar("registration_number", {
    length: 100,
  }).notNull(),

  course: varchar("course", { length: 255 }).notNull(),

  yearOfStudy: integer("year_of_study").notNull(),

  department: varchar("department", {
    length: 255,
  }),

  school: varchar("school", {
    length: 255,
  }),

  attachmentStartDate: date("attachment_start_date"),

  attachmentEndDate: date("attachment_end_date"),

  supervisorId: uuid("supervisor_id").references(() => users.id),

  createdAt: timestamp("created_at").defaultNow(),
});

// ======================================================
// COMPANIES TABLE
// ======================================================

export const companies = pgTable("companies", {
  id: uuid("id").defaultRandom().primaryKey(),

  companyName: varchar("company_name", {
    length: 255,
  }).notNull(),

  industry: varchar("industry", {
    length: 255,
  }),

  address: text("address"),

  city: varchar("city", {
    length: 255,
  }),

  country: varchar("country", {
    length: 255,
  }),

  email: varchar("email", {
    length: 255,
  }),

  phoneNumber: varchar("phone_number", {
    length: 20,
  }),

  supervisorName: varchar("supervisor_name", {
    length: 255,
  }),

  supervisorEmail: varchar("supervisor_email", {
    length: 255,
  }),

  createdAt: timestamp("created_at").defaultNow(),
});

// ======================================================
// STUDENT ATTACHMENT TABLE
// ======================================================

export const attachments = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),

  studentId: uuid("student_id")
    .references(() => students.id, {
      onDelete: "cascade",
    })
    .notNull(),

  companyId: uuid("company_id")
    .references(() => companies.id, {
      onDelete: "cascade",
    }),

  supervisorId: uuid("supervisor_id").references(() => users.id),

  assignedBy: uuid("assigned_by").references(() => users.id),

  startDate: date("start_date").notNull(),

  endDate: date("end_date").notNull(),

  status: varchar("status", {
    length: 50,
  }).default("ongoing"),

  createdAt: timestamp("created_at").defaultNow(),
});

// ======================================================
// DAILY LOGS TABLE
// ======================================================

export const dailyLogs = pgTable("daily_logs", {
  id: uuid("id").defaultRandom().primaryKey(),

  studentId: uuid("student_id")
    .references(() => students.id, {
      onDelete: "cascade",
    })
    .notNull(),

  logDate: date("log_date").notNull(),

  taskDone: text("task_done").notNull(),

  skillsLearned: text("skills_learned"),

  challengesFaced: text("challenges_faced"),

  hoursWorked: integer("hours_worked"),

  supervisorComment: text("supervisor_comment"),

  isApproved: boolean("is_approved").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});

// ======================================================
// ATTENDANCE TABLE
// ======================================================

export const attendance = pgTable("attendance", {
  id: uuid("id").defaultRandom().primaryKey(),

  studentId: uuid("student_id")
    .references(() => students.id, {
      onDelete: "cascade",
    })
    .notNull(),

  checkIn: timestamp("check_in").notNull(),

  checkOut: timestamp("check_out"),

  totalHours: integer("total_hours"),

  attendanceDate: date("attendance_date").notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});

// ======================================================
// REPORTS TABLE
// ======================================================

export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),

  studentId: uuid("student_id")
    .references(() => students.id, {
      onDelete: "cascade",
    })
    .notNull(),

  weekNumber: integer("week_number").notNull(),

  title: varchar("title", {
    length: 255,
  }),

  description: text("description"),

  fileUrl: text("file_url"),

  status: reportStatusEnum("status")
    .default("pending")
    .notNull(),

  supervisorComment: text("supervisor_comment"),

  submittedAt: timestamp("submitted_at").defaultNow(),
});

// ======================================================
// EVALUATIONS TABLE
// ======================================================

export const evaluations = pgTable("evaluations", {
  id: uuid("id").defaultRandom().primaryKey(),

  studentId: uuid("student_id")
    .references(() => students.id, {
      onDelete: "cascade",
    })
    .notNull(),

  supervisorId: uuid("supervisor_id")
    .references(() => users.id)
    .notNull(),

  performanceScore: integer("performance_score"),

  communicationScore: integer("communication_score"),

  technicalSkillScore: integer("technical_skill_score"),

  punctualityScore: integer("punctuality_score"),

  comments: text("comments"),

  recommendation: text("recommendation"),

  createdAt: timestamp("created_at").defaultNow(),
});

// ======================================================
// NOTIFICATIONS TABLE
// ======================================================

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  title: varchar("title", {
    length: 255,
  }).notNull(),

  message: text("message").notNull(),

  isRead: boolean("is_read").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});

// ======================================================
// FILES TABLE
// ======================================================

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),

  studentId: uuid("student_id")
    .references(() => students.id, {
      onDelete: "cascade",
    })
    .notNull(),

  fileName: varchar("file_name", {
    length: 255,
  }).notNull(),

  fileUrl: text("file_url").notNull(),

  fileType: varchar("file_type", {
    length: 100,
  }),

  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// ======================================================
// RELATIONSHIPS
// ======================================================

// USERS RELATIONS

export const usersRelations = relations(users, ({ one, many }) => ({
  student: one(students),

  notifications: many(notifications),

  evaluations: many(evaluations),
}));

// STUDENTS RELATIONS

export const studentsRelations = relations(
  students,
  ({ one, many }) => ({
    user: one(users, {
      fields: [students.userId],
      references: [users.id],
    }),

    supervisor: one(users, {
      fields: [students.supervisorId],
      references: [users.id],
    }),

    attachments: many(attachments),

    dailyLogs: many(dailyLogs),

    attendance: many(attendance),

    reports: many(reports),

    evaluations: many(evaluations),

    files: many(files),
  })
);

// COMPANIES RELATIONS

export const companiesRelations = relations(
  companies,
  ({ many }) => ({
    attachments: many(attachments),
  })
);

// ATTACHMENTS RELATIONS

export const attachmentsRelations = relations(
  attachments,
  ({ one }) => ({
    student: one(students, {
      fields: [attachments.studentId],
      references: [students.id],
    }),

    company: one(companies, {
      fields: [attachments.companyId],
      references: [companies.id],
    }),

    supervisor: one(users, {
      fields: [attachments.supervisorId],
      references: [users.id],
    }),

    assignedUser: one(users, {
      fields: [attachments.assignedBy],
      references: [users.id],
    }),
  })
);

// DAILY LOGS RELATIONS

export const dailyLogsRelations = relations(
  dailyLogs,
  ({ one }) => ({
    student: one(students, {
      fields: [dailyLogs.studentId],
      references: [students.id],
    }),
  })
);

// ATTENDANCE RELATIONS

export const attendanceRelations = relations(
  attendance,
  ({ one }) => ({
    student: one(students, {
      fields: [attendance.studentId],
      references: [students.id],
    }),
  })
);

// REPORTS RELATIONS

export const reportsRelations = relations(
  reports,
  ({ one }) => ({
    student: one(students, {
      fields: [reports.studentId],
      references: [students.id],
    }),
  })
);

// EVALUATIONS RELATIONS

export const evaluationsRelations = relations(
  evaluations,
  ({ one }) => ({
    student: one(students, {
      fields: [evaluations.studentId],
      references: [students.id],
    }),

    supervisor: one(users, {
      fields: [evaluations.supervisorId],
      references: [users.id],
    }),
  })
);

// NOTIFICATIONS RELATIONS

export const notificationsRelations = relations(
  notifications,
  ({ one }) => ({
    user: one(users, {
      fields: [notifications.userId],
      references: [users.id],
    }),
  })
);

// FILES RELATIONS

export const filesRelations = relations(
  files,
  ({ one }) => ({
    student: one(students, {
      fields: [files.studentId],
      references: [students.id],
    }),
  })
);
