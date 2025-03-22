import { users, type User, type InsertUser, results, type Result, type InsertResult, roles, type Role, type InsertRole, auditLogs, type AuditLog, type InsertAuditLog } from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { notifications, type Notification, type InsertNotification, testTypes, type TestType, type InsertTestType, settings, type Setting, type InsertSetting } from "@shared/schema";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getResultByCode(code: string): Promise<Result | undefined>;
  createResult(result: InsertResult): Promise<Result>;
  getAllResults(): Promise<Result[]>;
  updateResult(id: number, data: Partial<Result>): Promise<Result>;
  // Role management
  getAllRoles(): Promise<Role[]>;
  getRoleById(id: number): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, data: Partial<Role>): Promise<Role>;
  deleteRole(id: number): Promise<void>;
  // Audit logs
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(): Promise<AuditLog[]>;
  sessionStore: session.Store;
  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  deleteNotification(id: number): Promise<void>;
  // Test types
  getAllTestTypes(): Promise<TestType[]>;
  getTestTypeById(id: number): Promise<TestType | undefined>;
  createTestType(testType: InsertTestType): Promise<TestType>;
  updateTestType(id: number, data: Partial<TestType>): Promise<TestType>;
  deleteTestType(id: number): Promise<void>;
  // Settings
  getSetting(key: string): Promise<Setting | undefined>;
  createOrUpdateSetting(key: string, value: any): Promise<Setting>;
  getLogoSettings(): Promise<{ imageUrl: string; name: string; tagline: string }>;
  updateLogoSettings(settings: { imageUrl?: string; name?: string; tagline?: string }): Promise<Setting>;
}

export class DatabaseStorage implements IStorage {
  readonly sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users);
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getResultByCode(code: string): Promise<Result | undefined> {
    try {
      const [result] = await db
        .select()
        .from(results)
        .where(eq(results.accessCode, code));
      return result;
    } catch (error) {
      console.error('Error fetching result by code:', error);
      return undefined;
    }
  }

  async createResult(insertResult: InsertResult): Promise<Result> {
    const [result] = await db.insert(results).values(insertResult).returning();
    return result;
  }

  async getAllResults(): Promise<Result[]> {
    try {
      return await db.select().from(results);
    } catch (error) {
      console.error('Error fetching all results:', error);
      return [];
    }
  }
  
  async updateResult(id: number, data: Partial<Result>): Promise<Result> {
    try {
      const [result] = await db
        .update(results)
        .set(data)
        .where(eq(results.id, id))
        .returning();
      return result;
    } catch (error) {
      console.error('Error updating result:', error);
      throw error;
    }
  }

  async getAllRoles(): Promise<Role[]> {
    try {
      return await db.select().from(roles);
    } catch (error) {
      console.error('Error fetching all roles:', error);
      return [];
    }
  }

  async getRoleById(id: number): Promise<Role | undefined> {
    try {
      const [role] = await db.select().from(roles).where(eq(roles.id, id));
      return role;
    } catch (error) {
      console.error('Error fetching role by id:', error);
      return undefined;
    }
  }

  async createRole(insertRole: InsertRole): Promise<Role> {
    // Ensure permissions is properly cast as a string array
    const roleToInsert = {
      ...insertRole,
      permissions: Array.isArray(insertRole.permissions) ? insertRole.permissions : []
    };
    const [role] = await db.insert(roles).values(roleToInsert).returning();
    return role;
  }

  async updateRole(id: number, data: Partial<Role>): Promise<Role> {
    // Ensure permissions is properly cast as a string array if present
    const roleToUpdate = {
      ...data,
      permissions: data.permissions ? 
        (Array.isArray(data.permissions) ? data.permissions : []) : 
        undefined,
      updatedAt: new Date()
    };
    
    const [role] = await db
      .update(roles)
      .set(roleToUpdate)
      .where(eq(roles.id, id))
      .returning();
    return role;
  }

  async deleteRole(id: number): Promise<void> {
    await db.delete(roles).where(eq(roles.id, id));
  }

  // Audit log methods
  async createAuditLog(insertLog: InsertAuditLog): Promise<AuditLog> {
    try {
      const [log] = await db.insert(auditLogs).values(insertLog).returning();
      return log;
    } catch (error) {
      console.error('Error creating audit log:', error);
      throw error;
    }
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      return await db
        .select()
        .from(auditLogs)
        .orderBy(auditLogs.createdAt)
        .limit(1000);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return [];
    }
  }
  
  // Notification methods
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    try {
      const [notification] = await db.insert(notifications).values(insertNotification).returning();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.recipientId, userId))
        .orderBy(notifications.createdAt)
        .limit(50);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async markNotificationAsRead(id: number): Promise<void> {
    try {
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async deleteNotification(id: number): Promise<void> {
    try {
      await db.delete(notifications).where(eq(notifications.id, id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Test type methods
  async getAllTestTypes(): Promise<TestType[]> {
    try {
      return await db.select().from(testTypes);
    } catch (error) {
      console.error('Error fetching all test types:', error);
      return [];
    }
  }

  async getTestTypeById(id: number): Promise<TestType | undefined> {
    try {
      const [testType] = await db.select().from(testTypes).where(eq(testTypes.id, id));
      return testType;
    } catch (error) {
      console.error('Error fetching test type by id:', error);
      return undefined;
    }
  }

  async createTestType(insertTestType: InsertTestType): Promise<TestType> {
    try {
      const [testType] = await db.insert(testTypes).values(insertTestType).returning();
      return testType;
    } catch (error) {
      console.error('Error creating test type:', error);
      throw error;
    }
  }

  async updateTestType(id: number, data: Partial<TestType>): Promise<TestType> {
    try {
      const [testType] = await db
        .update(testTypes)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(testTypes.id, id))
        .returning();
      return testType;
    } catch (error) {
      console.error('Error updating test type:', error);
      throw error;
    }
  }

  async deleteTestType(id: number): Promise<void> {
    try {
      await db.delete(testTypes).where(eq(testTypes.id, id));
    } catch (error) {
      console.error('Error deleting test type:', error);
      throw error;
    }
  }

  // Settings methods
  async getSetting(key: string): Promise<Setting | undefined> {
    try {
      const [setting] = await db.select().from(settings).where(eq(settings.key, key));
      return setting;
    } catch (error) {
      console.error('Error fetching setting:', error);
      return undefined;
    }
  }

  async createOrUpdateSetting(key: string, value: any): Promise<Setting> {
    try {
      // Check if setting exists
      const existingSetting = await this.getSetting(key);
      
      if (existingSetting) {
        // Update existing setting
        const [updatedSetting] = await db
          .update(settings)
          .set({ 
            value,
            updatedAt: new Date() 
          })
          .where(eq(settings.key, key))
          .returning();
        return updatedSetting;
      } else {
        // Create new setting
        const [newSetting] = await db
          .insert(settings)
          .values({
            key,
            value,
          })
          .returning();
        return newSetting;
      }
    } catch (error) {
      console.error('Error creating/updating setting:', error);
      throw error;
    }
  }

  async getLogoSettings(): Promise<{ imageUrl: string; name: string; tagline: string }> {
    try {
      const setting = await this.getSetting('logoSettings');
      
      if (setting) {
        return setting.value as { imageUrl: string; name: string; tagline: string };
      }
      
      // Return default settings if not found
      return {
        imageUrl: '/logo.svg',
        name: 'SeekLab',
        tagline: 'Medical Lab Results Management'
      };
    } catch (error) {
      console.error('Error fetching logo settings:', error);
      // Return default settings on error
      return {
        imageUrl: '/logo.svg',
        name: 'SeekLab',
        tagline: 'Medical Lab Results Management'
      };
    }
  }

  async updateLogoSettings(logoSettings: { imageUrl?: string; name?: string; tagline?: string }): Promise<Setting> {
    try {
      // Get current settings
      const currentSettings = await this.getLogoSettings();
      
      // Merge with new settings (only update what's provided)
      const updatedSettings = {
        ...currentSettings,
        ...logoSettings
      };
      
      // Save to database
      return this.createOrUpdateSetting('logoSettings', updatedSettings);
    } catch (error) {
      console.error('Error updating logo settings:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();