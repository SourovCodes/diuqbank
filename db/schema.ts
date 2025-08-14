import {
  int,
  timestamp,
  mysqlTable,
  primaryKey,
  varchar,
  boolean,
  mysqlEnum,
  unique,
} from "drizzle-orm/mysql-core";
import type { AdapterAccountType } from "next-auth/adapters";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

// Enums for type safety with better autocomplete
export const QuestionStatus = {
  PUBLISHED: "published",
  DUPLICATE: "duplicate",
  PENDING_REVIEW: "pending review",
  REJECTED: "rejected",
} as const;

export const ReportStatus = {
  PENDING_REVIEW: "pending review",
  RESOLVED: "resolved",
} as const;

export const questionStatusEnum = Object.values(QuestionStatus);
export const reportStatusEnum = Object.values(ReportStatus);

export type QuestionStatus =
  (typeof QuestionStatus)[keyof typeof QuestionStatus];
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
    fsp: 3,
  }),
  image: varchar("image", { length: 255 }),
  username: varchar("username", { length: 100 }).notNull(),
  studentId: varchar("studentId", { length: 50 }),
});

export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccountType>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: varchar("access_token", { length: 255 }),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: varchar("id_token", { length: 2048 }),
    session_state: varchar("session_state", { length: 255 }),
  },
  (table) => [
    primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
  ]
);

export const sessions = mysqlTable("session", {
  sessionToken: varchar("sessionToken", { length: 255 }).primaryKey(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.identifier, table.token],
    }),
  ]
);

export const departments = mysqlTable("department", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  shortName: varchar("shortName", { length: 50 }).notNull().unique(),
});

export const courses = mysqlTable(
  "course",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    departmentId: int("departmentId")
      .notNull()
      .references(() => departments.id, { onDelete: "cascade" }),
  },
  (table) => ({
    uniqueNamePerDepartment: unique("unique_course_name_per_department").on(
      table.departmentId,
      table.name
    ),
  })
);

export const semesters = mysqlTable("semester", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull().unique(),
});

export const examTypes = mysqlTable("examType", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull().unique(),
});

export const questions = mysqlTable("question", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  departmentId: int("departmentId")
    .notNull()
    .references(() => departments.id, { onDelete: "cascade" }),
  courseId: int("courseId")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  semesterId: int("semesterId")
    .notNull()
    .references(() => semesters.id, { onDelete: "cascade" }),
  examTypeId: int("examTypeId")
    .notNull()
    .references(() => examTypes.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", QuestionStatus)
    .notNull()
    .default(QuestionStatus.PENDING_REVIEW),
  pdfKey: varchar("pdfKey", { length: 255 }).notNull(),
  pdfFileSizeInBytes: int("pdfFileSizeInBytes").notNull(),
  viewCount: int("viewCount").notNull().default(0),
  isReviewed: boolean("isReviewed").notNull().default(false),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});

export const reports = mysqlTable("report", {
  id: int("id").primaryKey().autoincrement(),
  questionId: int("questionId")
    .notNull()
    .references(() => questions.id, { onDelete: "cascade" }),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: varchar("content", { length: 1000 }).notNull(),
  status: mysqlEnum("status", ReportStatus)
    .notNull()
    .default(ReportStatus.PENDING_REVIEW),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});

export const contactFormSubmissions = mysqlTable("contactFormSubmission", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  message: varchar("message", { length: 2000 }).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

// ----------
// Type exports for better reuse across the app (InferSelect/InferInsert)
// ----------
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

export type Session = InferSelectModel<typeof sessions>;
export type NewSession = InferInsertModel<typeof sessions>;

export type Department = InferSelectModel<typeof departments>;
export type NewDepartment = InferInsertModel<typeof departments>;

export type Course = InferSelectModel<typeof courses>;
export type NewCourse = InferInsertModel<typeof courses>;

export type Semester = InferSelectModel<typeof semesters>;
export type NewSemester = InferInsertModel<typeof semesters>;

export type ExamType = InferSelectModel<typeof examTypes>;
export type NewExamType = InferInsertModel<typeof examTypes>;

export type Question = InferSelectModel<typeof questions>;
export type NewQuestion = InferInsertModel<typeof questions>;

export type Report = InferSelectModel<typeof reports>;
export type NewReport = InferInsertModel<typeof reports>;

export type ContactFormSubmission = InferSelectModel<
  typeof contactFormSubmissions
>;
export type NewContactFormSubmission = InferInsertModel<
  typeof contactFormSubmissions
>;
