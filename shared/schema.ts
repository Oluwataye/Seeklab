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

export const resultTemplates = pgTable("result_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  fields: jsonb("fields").notNull().$type<{
    name: string;
    type: "number" | "text" | "options";
    unit?: string;
    referenceRange?: string;
    options?: string[];
  }[]>(),
  interpretationGuidelines: text("interpretation_guidelines"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  accessCode: text("access_code").notNull().unique(),
  patientId: text("patient_id").notNull(),
  testType: text("test_type").notNull(),
  testDate: timestamp("test_date").notNull().defaultNow(),
  resultData: jsonb("result_data").$type<{
    templateId: number;
    templateName: string;
    values: Record<string, string | number>;
    timestamp: string;
  }>(),
  scientistReview: jsonb("scientist_review").$type<{
    approved: boolean;
    comments: string;
    reviewedBy: string;
    reviewedAt: string;
  }>(),
  psychologistAssessment: text("psychologist_assessment"),
  reportUrl: text("report_url"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  details: jsonb("details").$type<Record<string, unknown>>(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  recipientId: text("recipient_id").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});

export const testTypes = pgTable("test_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  category: text("category"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertResultTemplateSchema = createInsertSchema(resultTemplates).pick({
  name: true,
  category: true,
  fields: true,
  interpretationGuidelines: true,
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

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  userId: true,
  action: true,
  entityType: true,
  entityId: true,
  details: true,
  ipAddress: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  type: true,
  title: true,
  message: true,
  recipientId: true,
  metadata: true,
});

export const insertTestTypeSchema = createInsertSchema(testTypes).pick({
  name: true,
  description: true,
  category: true,
  isActive: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type Result = typeof results.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;
export type ResultTemplate = typeof resultTemplates.$inferSelect;
export type InsertResultTemplate = z.infer<typeof insertResultTemplateSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type TestType = typeof testTypes.$inferSelect;
export type InsertTestType = z.infer<typeof insertTestTypeSchema>;