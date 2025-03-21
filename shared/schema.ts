import { pgTable, text, serial, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isLabStaff: boolean("is_lab_staff").notNull().default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  email: text("email"),
  role: text("role").notNull().default("technician"),
  lastLogin: timestamp("last_login"),
});

export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").notNull(),
  permissions: jsonb("permissions").notNull().$type<string[]>(),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  accessCode: text("access_code").notNull().unique(),
  patientId: text("patient_id").notNull(),
  testType: text("test_type").notNull(),
  testDate: timestamp("test_date").notNull().defaultNow(),
  resultData: text("result_data").notNull(),
  reportUrl: text("report_url").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

export const insertRoleSchema = createInsertSchema(roles).pick({
  name: true,
  description: true,
  permissions: true,
});

export const insertResultSchema = createInsertSchema(results).pick({
  accessCode: true,
  patientId: true,
  testType: true,
  testDate: true,
  resultData: true,
  reportUrl: true,
  expiresAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type Result = typeof results.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;