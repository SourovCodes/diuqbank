import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  boolean,
  int,
  mysqlEnum,
  unique,
} from "drizzle-orm/mysql-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";


export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = mysqlTable("accounts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});

export const verifications = mysqlTable("verifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" })
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});

export const departments = mysqlTable("departments", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  shortName: varchar("short_name", { length: 5 }).notNull().unique(),
});

export const courses = mysqlTable(
  "courses",
  {
    id: int("id").primaryKey().autoincrement(),
    name: varchar("name", { length: 255 }).notNull(),
    departmentId: int("department_id")
      .notNull()
      .references(() => departments.id),
  },
  (table) => [
    unique("unique_course_name_per_department").on(
      table.departmentId,
      table.name
    )
  ]
);

export const semesters = mysqlTable("semesters", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 10 }).notNull().unique(),
  order: int("order").notNull().default(0),

});

export const examTypes = mysqlTable("exam_types", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 10 }).notNull().unique(),
  order: int("order").notNull().default(0),

});

export const questions = mysqlTable("questions", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 36 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  departmentId: int("department_id")
    .notNull()
    .references(() => departments.id),
  courseId: int("course_id")
    .notNull()
    .references(() => courses.id),
  semesterId: int("semester_id")
    .notNull()
    .references(() => semesters.id),
  examTypeId: int("exam_type_id")
    .notNull()
    .references(() => examTypes.id),
  status: mysqlEnum("status", ['published', 'pending review', 'rejected', 'requires fix'])
    .notNull()
    .default('pending review'),
  statusReason: text("status_reason"),
  pdfKey: varchar("pdf_key", { length: 255 }).notNull(),
  pdfSize: int("pdf_size").notNull(),
  views: int("views").notNull().default(0),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" })
    .notNull()
    .defaultNow()
    .onUpdateNow(),
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

