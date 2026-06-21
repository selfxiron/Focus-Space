import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const todoPriorityEnum = pgEnum("todo_priority", [
  "low",
  "medium",
  "high",
]);
export const todoStatusEnum = pgEnum("todo_status", [
  "backlog",
  "in_progress",
  "completed",
]);
export const goalPeriodEnum = pgEnum("goal_period", ["weekly", "monthly"]);

export const subjects = pgTable("subjects", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#14B8A6"),
  icon: text("icon").notNull().default("folder"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const timeEntries = pgTable("time_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }),
  durationMinutes: integer("duration_minutes"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const todos = pgTable("todos", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  subjectId: uuid("subject_id").references(() => subjects.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  priority: todoPriorityEnum("priority").notNull().default("medium"),
  status: todoStatusEnum("status").notNull().default("backlog"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const goals = pgTable("goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  targetHours: integer("target_hours").notNull(),
  period: goalPeriodEnum("period").notNull().default("weekly"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  subjectId: uuid("subject_id").references(() => subjects.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const pomodoroSessions = pgTable("pomodoro_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  subjectId: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, { onDelete: "cascade" }),
  workMinutes: integer("work_minutes").notNull(),
  breakMinutes: integer("break_minutes").notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const subjectsRelations = relations(subjects, ({ many }) => ({
  timeEntries: many(timeEntries),
  todos: many(todos),
  goals: many(goals),
  notes: many(notes),
  pomodoroSessions: many(pomodoroSessions),
}));

export const DEFAULT_SUBJECTS = [
  { name: "Study", color: "#14B8A6", icon: "book", sortOrder: 0 },
  { name: "Coursework", color: "#8B5CF6", icon: "calculator", sortOrder: 1 },
  { name: "Projects", color: "#F59E0B", icon: "folder", sortOrder: 2 },
] as const;
