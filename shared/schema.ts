import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isLabStaff: boolean("is_lab_staff").notNull().default(false),
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  accessCode: text("access_code").notNull().unique(),
  patientId: text("patient_id").notNull(),
  testType: text("test_type").notNull(),
  testDate: timestamp("test_date").notNull(),
  resultData: text("result_data").notNull(),
  reportUrl: text("report_url").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
export type Result = typeof results.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;
