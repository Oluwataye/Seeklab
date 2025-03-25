import { pgTable, text, serial, timestamp, boolean, jsonb, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isLabStaff: boolean("is_lab_staff").notNull().default(false),
  isAdmin: boolean("is_admin").notNull().default(false),
  email: text("email"),
  role: text("role").notNull().default("EDEC"),
  lastLogin: timestamp("last_login"),
});

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  contactNumber: text("contact_number").notNull(),
  contactAddress: text("contact_address").notNull(),
  email: text("email"),
  // Next of kin details
  kinFirstName: text("kin_first_name").notNull(),
  kinLastName: text("kin_last_name").notNull(),
  kinContactNumber: text("kin_contact_number").notNull(),
  kinContactAddress: text("kin_contact_address").notNull(),
  kinEmail: text("kin_email"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
  accessCount: integer("access_count").notNull().default(0),
  isPaid: boolean("is_paid").notNull().default(false),
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

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("NGN"),
  paymentMethod: text("payment_method").notNull(),
  referenceNumber: text("reference_number").notNull().unique(),
  status: text("status").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const paymentSettings = pgTable("payment_settings", {
  id: serial("id").primaryKey(),
  accessCodePrice: integer("access_code_price").notNull().default(1000),
  currency: text("currency").notNull().default("NGN"),
  bankName: text("bank_name").notNull(),
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  updatedBy: text("updated_by").notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 64 }).notNull().unique(),
  value: jsonb("value").notNull(),
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
  isRead: true,
  metadata: true,
});

export const insertTestTypeSchema = createInsertSchema(testTypes).pick({
  name: true,
  description: true,
  category: true,
  isActive: true,
});

export const insertSettingSchema = createInsertSchema(settings).pick({
  key: true,
  value: true,
});

export const insertPatientSchema = createInsertSchema(patients).pick({
  patientId: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  contactNumber: true,
  contactAddress: true,
  email: true,
  kinFirstName: true,
  kinLastName: true,
  kinContactNumber: true,
  kinContactAddress: true,
  kinEmail: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  patientId: true,
  amount: true,
  currency: true,
  paymentMethod: true,
  referenceNumber: true,
  status: true,
  metadata: true,
  completedAt: true,
});

export const insertPaymentSettingSchema = createInsertSchema(paymentSettings).pick({
  accessCodePrice: true,
  currency: true,
  bankName: true,
  accountName: true,
  accountNumber: true,
  isActive: true,
  updatedBy: true,
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
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingSchema>;
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type PaymentSetting = typeof paymentSettings.$inferSelect;
export type InsertPaymentSetting = z.infer<typeof insertPaymentSettingSchema>;