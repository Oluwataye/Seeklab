import { users, type User, type InsertUser, results, type Result, type InsertResult, roles, type Role, type InsertRole, auditLogs, type AuditLog, type InsertAuditLog, notifications, type Notification, type InsertNotification, testTypes, type TestType, type InsertTestType, settings, type Setting, type InsertSetting, patients, type Patient, type InsertPatient, payments, type Payment, type InsertPayment, paymentSettings, type PaymentSetting, type InsertPaymentSetting, pageContents, type PageContent, type InsertPageContent } from "@shared/schema";
import session from "express-session";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { randomBytes } from "crypto";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Results
  getResultByCode(code: string): Promise<Result | undefined>;
  createResult(result: InsertResult): Promise<Result>;
  getAllResults(): Promise<Result[]>;
  updateResult(id: number, data: Partial<Result>): Promise<Result>;
  incrementResultAccessCount(id: number): Promise<Result>;
  
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
  
  // Patient management
  createPatient(patient: InsertPatient): Promise<Patient>;
  getPatientById(id: number): Promise<Patient | undefined>;
  getPatientByPatientId(patientId: string): Promise<Patient | undefined>;
  getAllPatients(): Promise<Patient[]>;
  updatePatient(id: number, data: Partial<Patient>): Promise<Patient>;
  
  // Payment management
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentById(id: number): Promise<Payment | undefined>;
  getPaymentsByPatientId(patientId: string): Promise<Payment[]>;
  getAllPayments(): Promise<Payment[]>;
  updatePayment(id: number, data: Partial<Payment>): Promise<Payment>;
  
  // Payment settings
  getPaymentSettings(): Promise<PaymentSetting | undefined>;
  updatePaymentSettings(data: Partial<InsertPaymentSetting>): Promise<PaymentSetting>;
  getOpayCredentials(): Promise<{
    publicKey: string;
    secretKey: string;
    merchantId: string;
    isEnabled: boolean;
  }>;
  
  // Generate unique patient ID
  generateUniquePatientId(): Promise<string>;
  
  // Generate access code for patient results
  generateAccessCode(patientId: string): Promise<string>;
  
  // Page content management
  getPageContent(pageSlug: string): Promise<PageContent | undefined>;
  getPageContentById(id: number): Promise<PageContent | undefined>;
  getAllPageContents(): Promise<PageContent[]>;
  createPageContent(data: InsertPageContent): Promise<PageContent>;
  updatePageContent(id: number, data: Partial<PageContent>): Promise<PageContent>;
  deletePageContent(id: number): Promise<void>;
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
  
  async incrementResultAccessCount(id: number): Promise<Result> {
    try {
      const [result] = await db.select().from(results).where(eq(results.id, id));
      
      if (!result) {
        throw new Error(`Result with ID ${id} not found`);
      }
      
      const [updatedResult] = await db
        .update(results)
        .set({ 
          accessCount: (result.accessCount || 0) + 1 
        })
        .where(eq(results.id, id))
        .returning();
        
      return updatedResult;
    } catch (error) {
      console.error('Error incrementing result access count:', error);
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
      // Make sure permissions is always an array of strings
      permissions: Array.isArray(insertRole.permissions) ? 
        insertRole.permissions.map(p => String(p)) : 
        []
    };
    const [role] = await db.insert(roles).values(roleToInsert).returning();
    return role;
  }

  async updateRole(id: number, data: Partial<Role>): Promise<Role> {
    // Ensure permissions is properly cast as a string array if present
    const roleToUpdate = {
      ...data,
      permissions: data.permissions ? 
        (Array.isArray(data.permissions) ? data.permissions.map(p => String(p)) : []) : 
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
        tagline: 'Know where you stand. Take control of tomorrow.'
      };
    } catch (error) {
      console.error('Error fetching logo settings:', error);
      // Return default settings on error
      return {
        imageUrl: '/logo.svg',
        name: 'SeekLab',
        tagline: 'Know where you stand. Take control of tomorrow.'
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
  
  // Patient management methods
  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    try {
      const [patient] = await db.insert(patients).values(insertPatient).returning();
      return patient;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  }
  
  async getPatientById(id: number): Promise<Patient | undefined> {
    try {
      const [patient] = await db.select().from(patients).where(eq(patients.id, id));
      return patient;
    } catch (error) {
      console.error('Error fetching patient by id:', error);
      return undefined;
    }
  }
  
  async getPatientByPatientId(patientId: string): Promise<Patient | undefined> {
    try {
      const [patient] = await db.select().from(patients).where(eq(patients.patientId, patientId));
      return patient;
    } catch (error) {
      console.error('Error fetching patient by patient ID:', error);
      return undefined;
    }
  }
  
  async getAllPatients(): Promise<Patient[]> {
    try {
      return await db.select().from(patients).orderBy(desc(patients.createdAt));
    } catch (error) {
      console.error('Error fetching all patients:', error);
      return [];
    }
  }
  
  async updatePatient(id: number, data: Partial<Patient>): Promise<Patient> {
    try {
      const updatedData = {
        ...data,
        updatedAt: new Date()
      };
      
      const [patient] = await db
        .update(patients)
        .set(updatedData)
        .where(eq(patients.id, id))
        .returning();
      return patient;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  }
  
  // Payment management methods
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    try {
      const [payment] = await db.insert(payments).values(insertPayment).returning();
      return payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }
  
  async getPaymentById(id: number): Promise<Payment | undefined> {
    try {
      const [payment] = await db.select().from(payments).where(eq(payments.id, id));
      return payment;
    } catch (error) {
      console.error('Error fetching payment by id:', error);
      return undefined;
    }
  }
  
  async getPaymentsByPatientId(patientId: string): Promise<Payment[]> {
    try {
      return await db
        .select()
        .from(payments)
        .where(eq(payments.patientId, patientId))
        .orderBy(desc(payments.createdAt));
    } catch (error) {
      console.error('Error fetching payments by patient ID:', error);
      return [];
    }
  }
  
  async getAllPayments(): Promise<Payment[]> {
    try {
      return await db
        .select()
        .from(payments)
        .orderBy(desc(payments.createdAt));
    } catch (error) {
      console.error('Error fetching all payments:', error);
      return [];
    }
  }
  
  async updatePayment(id: number, data: Partial<Payment>): Promise<Payment> {
    try {
      const [payment] = await db
        .update(payments)
        .set(data)
        .where(eq(payments.id, id))
        .returning();
      return payment;
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }
  
  // Payment settings methods
  async getPaymentSettings(): Promise<PaymentSetting | undefined> {
    try {
      const [setting] = await db
        .select()
        .from(paymentSettings)
        .where(eq(paymentSettings.isActive, true))
        .limit(1);
      return setting;
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      return undefined;
    }
  }
  
  async updatePaymentSettings(data: Partial<InsertPaymentSetting>): Promise<PaymentSetting> {
    try {
      // Check if there are any existing settings
      const [existingSetting] = await db.select().from(paymentSettings).limit(1);
      
      if (existingSetting) {
        // Update the existing settings
        const [updatedSetting] = await db
          .update(paymentSettings)
          .set({
            ...data,
            updatedAt: new Date()
          })
          .where(eq(paymentSettings.id, existingSetting.id))
          .returning();
        return updatedSetting;
      } else {
        // Create new settings if none exist
        if (!data.bankName || !data.accountName || !data.accountNumber || !data.updatedBy) {
          throw new Error('Required payment settings fields are missing');
        }
        
        const [newSetting] = await db
          .insert(paymentSettings)
          .values({
            accessCodePrice: data.accessCodePrice || 1000,
            currency: data.currency || 'NGN',
            bankName: data.bankName,
            accountName: data.accountName,
            accountNumber: data.accountNumber,
            isActive: data.isActive !== undefined ? data.isActive : true,
            updatedBy: data.updatedBy
          })
          .returning();
        return newSetting;
      }
    } catch (error) {
      console.error('Error updating payment settings:', error);
      throw error;
    }
  }
  
  async getOpayCredentials(): Promise<{
    publicKey: string;
    secretKey: string;
    merchantId: string;
    isEnabled: boolean;
  }> {
    try {
      const settings = await this.getPaymentSettings();
      return {
        publicKey: settings?.opayPublicKey || '',
        secretKey: settings?.opaySecretKey || '',
        merchantId: settings?.opayMerchantId || '',
        isEnabled: settings?.enableOpay || false
      };
    } catch (error) {
      console.error('Error fetching OPay credentials:', error);
      return {
        publicKey: '',
        secretKey: '',
        merchantId: '',
        isEnabled: false
      };
    }
  }
  
  // Utility methods
  async generateUniquePatientId(): Promise<string> {
    // Generate a 4-digit number for patient ID
    const min = 1000;
    const max = 9999;
    let patientIdNum = Math.floor(min + Math.random() * (max - min));
    let patientId = patientIdNum.toString();
    
    // Check if this ID already exists
    let existingPatient = await this.getPatientByPatientId(patientId);
    
    // Keep trying until we find an unused ID
    while (existingPatient) {
      patientIdNum = Math.floor(min + Math.random() * (max - min));
      patientId = patientIdNum.toString();
      existingPatient = await this.getPatientByPatientId(patientId);
    }
    
    return patientId;
  }
  
  async generateAccessCode(patientId: string): Promise<string> {
    // Generate an 8-character alphanumeric code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 8;
    
    let accessCode = '';
    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      accessCode += characters.charAt(randomIndex);
    }
    
    // Check if this code already exists in results
    let existingResult = await this.getResultByCode(accessCode);
    
    // Keep trying until we find an unused code
    while (existingResult) {
      accessCode = '';
      for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        accessCode += characters.charAt(randomIndex);
      }
      existingResult = await this.getResultByCode(accessCode);
    }
    
    return accessCode;
  }

  // Page content management methods
  async getPageContent(pageSlug: string): Promise<PageContent | undefined> {
    try {
      const [content] = await db
        .select()
        .from(pageContents)
        .where(eq(pageContents.pageSlug, pageSlug));
      return content;
    } catch (error) {
      console.error(`Error fetching page content for slug ${pageSlug}:`, error);
      return undefined;
    }
  }

  async getAllPageContents(): Promise<PageContent[]> {
    try {
      return await db
        .select()
        .from(pageContents)
        .orderBy(pageContents.pageSlug);
    } catch (error) {
      console.error('Error fetching all page contents:', error);
      return [];
    }
  }

  async createPageContent(data: InsertPageContent): Promise<PageContent> {
    try {
      const [content] = await db
        .insert(pageContents)
        .values(data)
        .returning();
      return content;
    } catch (error) {
      console.error('Error creating page content:', error);
      throw error;
    }
  }

  async updatePageContent(id: number, data: Partial<PageContent>): Promise<PageContent> {
    try {
      const updatedData = {
        ...data,
        updatedAt: new Date()
      };
      
      const [content] = await db
        .update(pageContents)
        .set(updatedData)
        .where(eq(pageContents.id, id))
        .returning();
      return content;
    } catch (error) {
      console.error('Error updating page content:', error);
      throw error;
    }
  }

  async deletePageContent(id: number): Promise<void> {
    try {
      await db
        .delete(pageContents)
        .where(eq(pageContents.id, id));
    } catch (error) {
      console.error('Error deleting page content:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();