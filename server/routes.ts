import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertResultSchema, 
  insertTestTypeSchema, 
  insertPatientSchema, 
  insertPaymentSchema, 
  insertPaymentSettingSchema,
  Payment
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer storage for logo uploads
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use an absolute path to the uploads directory to ensure it works correctly
    const uploadsPath = path.join(process.cwd(), 'uploads');
    // Ensure the directory exists
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
    }
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `logo-${uniqueSuffix}${ext}`);
  }
});

// File filter to only allow image files
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG and SVG files are allowed'));
  }
};

// Set up multer upload
const upload = multer({ 
  storage: logoStorage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // In-memory cache for results to improve performance
  const resultCache = new Map();
  const accessAttempts = new Map(); // For rate limiting
  
  // Test Results Access Routes - Optimized for high traffic
  app.post("/api/results/access", async (req, res) => {
    try {
      const { code } = z.object({ code: z.string() }).parse(req.body);
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      
      // Basic rate limiting - restrict to 20 attempts per 5 minutes from same IP
      const ipKey = `${clientIp}-${Math.floor(Date.now() / (5 * 60 * 1000))}`;
      const attempts = accessAttempts.get(ipKey) || 0;
      
      if (attempts >= 20) {
        return res.status(429).json({ 
          message: "Too many access attempts. Please try again later.",
          retryAfter: 300 // Retry after 5 minutes
        });
      }
      
      accessAttempts.set(ipKey, attempts + 1);
      
      // Check cache first (with TTL of 60 seconds)
      const cacheKey = `result-${code}`;
      const cachedResult = resultCache.get(cacheKey);
      
      if (cachedResult) {
        const { data, timestamp } = cachedResult;
        const age = Date.now() - timestamp;
        
        // Cache is valid for 60 seconds
        if (age < 60 * 1000) {
          return res.json(data);
        }
        // Otherwise continue to fetch fresh data
      }
      
      // Get result from storage
      const result = await storage.getResultByCode(code);

      if (!result) {
        return res.status(404).json({ message: "Invalid access code" });
      }

      if (new Date() > result.expiresAt) {
        return res.status(401).json({ message: "Access code has expired" });
      }
      
      // Store in cache with timestamp
      resultCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });
      
      // Cache cleanup: If cache grows too large, remove oldest entries
      if (resultCache.size > 1000) {
        const keys = Array.from(resultCache.keys());
        const oldestKey = keys.sort((a, b) => 
          resultCache.get(a).timestamp - resultCache.get(b).timestamp
        )[0];
        resultCache.delete(oldestKey);
      }

      // Set appropriate cache headers
      res.setHeader('Cache-Control', 'private, max-age=60');
      res.json(result);
    } catch (error) {
      console.error('Error accessing results:', error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Protected Staff Routes
  app.post("/api/results", async (req, res) => {
    // Lab staff check removed
    return res.status(403).json({ message: "Unauthorized - This endpoint has been deprecated" });
    

    try {
      const resultData = insertResultSchema.parse(req.body);
      const result = await storage.createResult(resultData);
      
      // Clear cache for this code - ensures fresh data is returned when accessed
      resultCache.delete(`result-${result.accessCode}`);
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating result:', error);
      res.status(400).json({ message: "Invalid result data" });
    }
  });
  
  // Mock result generation endpoint removed (lab functionality removed)

  app.get("/api/results", async (req, res) => {
    console.log('GET /api/results - Auth check:', { 
      isAuthenticated: req.isAuthenticated(),
      userRole: req.user?.role,
      isLabStaff: req.user?.isLabStaff,
      isAdmin: req.user?.isAdmin
    });
    
    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized - Not authenticated" });
    }
    
    // Only allow admins and EDEC users to access results
    if (req.user?.isAdmin || req.user?.role === 'edec') {
      const results = await storage.getAllResults();
      return res.json(results);
    }
    
    // Deny access for other roles
    return res.status(403).json({ message: "Unauthorized - Insufficient permissions" });
  });

  // Admin check endpoint
  // Scientific review endpoint for lab scientists
  // PATCH endpoint for updating result data
  app.patch("/api/results/:id", async (req, res) => {
    if (!req.isAuthenticated() || (!req.user?.isAdmin && req.user?.role !== 'edec')) {
      return res.status(403).json({ message: "Unauthorized - Admin or EDEC access required" });
    }

    try {
      const resultId = parseInt(req.params.id);
      
      if (isNaN(resultId)) {
        return res.status(400).json({ message: "Invalid result ID" });
      }
      
      // Allow updating resultData
      const { resultData } = z.object({
        resultData: z.object({
          templateId: z.number(),
          templateName: z.string(),
          values: z.record(z.string(), z.union([z.string(), z.number()])),
          timestamp: z.string()
        })
      }).parse(req.body);
      
      // Get the current result
      const results = await storage.getAllResults();
      const result = results.find(r => r.id === resultId);
      
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }
      
      // Lab staff checks removed
      
      // Update the result
      const updatedResult = await storage.updateResult(resultId, {
        resultData
      });
      
      // Clear cache for this result
      resultCache.delete(`result-${result.accessCode}`);
      
      // Create audit log
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: "update_result",
          entityType: "result",
          entityId: resultId.toString(),
          details: { resultData },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
      
      res.json(updatedResult);
    } catch (error) {
      console.error('Error updating result:', error);
      res.status(400).json({ message: "Invalid result data" });
    }
  });

  app.post("/api/results/:id/review", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Unauthorized - Result review requires admin role" });
    }

    try {
      const resultId = parseInt(req.params.id);
      
      if (isNaN(resultId)) {
        return res.status(400).json({ message: "Invalid result ID" });
      }
      
      const { approved, comments } = z.object({
        approved: z.boolean(),
        comments: z.string()
      }).parse(req.body);
      
      // Get the current result
      const results = await storage.getAllResults();
      const result = results.find(r => r.id === resultId);
      
      if (!result) {
        return res.status(404).json({ message: "Result not found" });
      }
      
      // Update the result with the scientist's review
      const updatedResult = await storage.updateResult(resultId, {
        scientistReview: {
          approved,
          comments,
          reviewedBy: req.user?.username || 'Unknown scientist',
          reviewedAt: new Date().toISOString()
        }
      });
      
      // Create audit log for this action
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: approved ? "approve_result" : "reject_result",
          entityType: "result",
          entityId: resultId.toString(),
          details: { 
            comments,
            patientId: result.patientId,
            testType: result.testType
          },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
      
      // If approved, create a notification for any psychologist users
      if (approved) {
        const users = await storage.getAllUsers();
        const psychologists = users.filter(u => u.role === 'psychologist');
        
        for (const psychologist of psychologists) {
          await storage.createNotification({
            type: "result_review",
            title: "New Result Available for Assessment",
            message: `A test result for patient ${result.patientId} has been approved and is ready for psychological assessment.`,
            recipientId: psychologist.id.toString(),
            metadata: {
              resultId: resultId.toString(),
              patientId: result.patientId,
              testType: result.testType
            }
          });
        }
      }
      
      res.json(updatedResult);
    } catch (error) {
      console.error('Error submitting result review:', error);
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  app.get("/api/admin/check", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    res.json({ message: "Admin access confirmed" });
  });

  // Logo settings endpoint - public, cached for performance
  app.get("/api/settings/logo", async (req, res) => {
    try {
      // Set cache headers for performance optimization
      res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      
      // Fetch logo settings from database
      const logoSettings = await storage.getLogoSettings();
      res.json(logoSettings);
    } catch (error) {
      console.error('Error fetching logo settings:', error);
      res.status(500).json({ message: "Failed to fetch logo settings" });
    }
  });

  // Admin endpoint to update logo settings
  app.post("/api/settings/logo", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const logoSettings = z.object({
        imageUrl: z.string().optional(),
        name: z.string().optional(),
        tagline: z.string().optional()
      }).parse(req.body);

      // Update logo settings in database
      const updatedSetting = await storage.updateLogoSettings(logoSettings);
      
      res.json({
        ...logoSettings,
        message: "Logo settings updated successfully"
      });
      
      // Log the change
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: "update_logo_settings",
          entityType: "settings",
          details: logoSettings,
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
    } catch (error) {
      console.error('Error updating logo settings:', error);
      res.status(400).json({ message: "Invalid logo settings" });
    }
  });
  
  // Logo upload endpoint - for uploading logo image files
  app.post("/api/settings/logo/upload", upload.single('logo'), async (req, res) => {
    console.log('Logo upload request received:', {
      isAuthenticated: req.isAuthenticated(),
      userIsAdmin: req.user?.isAdmin,
      hasFile: !!req.file,
      fileDetails: req.file ? {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
      } : null,
      body: req.body
    });

    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      console.log('Unauthorized logo upload attempt');
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      if (!req.file) {
        console.log('No file uploaded in the request');
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Get the uploaded file details
      const file = req.file;
      console.log('File uploaded successfully:', {
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        path: file.path,
        destination: file.destination
      });
      
      // Get the relative path for the uploaded logo
      // The file.path will contain the absolute path, so we need to extract just the filename
      const filename = path.basename(file.path);
      const logoUrl = `/uploads/${filename}`;
      console.log('Logo URL for image:', logoUrl, 'from filename:', filename, 'original path:', file.path);
      
      // Get current logo settings
      const currentSettings = await storage.getLogoSettings();
      console.log('Current logo settings:', currentSettings);
      
      // Update logo URL in database settings
      console.log('Updating logo settings with new URL:', logoUrl);
      await storage.updateLogoSettings({ imageUrl: logoUrl });
      
      // Verify that the file exists on disk before returning success
      const filePath = path.join(process.cwd(), 'uploads', filename);
      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
          console.error('File does not exist on disk after upload:', err);
          return res.status(500).json({ message: "File upload failed: The file was not saved correctly" });
        }
        
        console.log('Verified file exists on disk at', filePath);
        res.json({
          imageUrl: logoUrl,
          originalName: file.originalname,
          size: file.size,
          message: "Logo uploaded successfully",
          timestamp: Date.now() // Add a timestamp to help with cache busting
        });
      });
      
      // Log the logo upload
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: "upload_logo",
          entityType: "settings",
          details: { 
            logoUrl,
            originalName: file.originalname,
            size: file.size,
            mimetype: file.mimetype
          },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error('Detailed error:', errorMessage);
      res.status(500).json({ message: `Failed to upload logo: ${errorMessage}` });
    }
  });

  // Test Types management endpoints
  // Get all test types
  app.get("/api/test-types", async (req, res) => {
    try {
      const testTypes = await storage.getAllTestTypes();
      res.json(testTypes);
    } catch (error) {
      console.error('Error fetching test types:', error);
      res.status(500).json({ message: "Failed to fetch test types" });
    }
  });

  // Get a specific test type by ID
  app.get("/api/test-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid test type ID" });
      }

      const testType = await storage.getTestTypeById(id);
      if (!testType) {
        return res.status(404).json({ message: "Test type not found" });
      }

      res.json(testType);
    } catch (error) {
      console.error('Error fetching test type:', error);
      res.status(500).json({ message: "Failed to fetch test type" });
    }
  });

  // Create a new test type (admin only)
  app.post("/api/test-types", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Unauthorized - Admin access required" });
    }

    try {
      const testTypeData = insertTestTypeSchema.parse(req.body);
      const testType = await storage.createTestType(testTypeData);
      
      // Create audit log for this action
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: "create_test_type",
          entityType: "test_type",
          entityId: testType.id.toString(),
          details: { name: testType.name, category: testType.category },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
      
      res.status(201).json(testType);
    } catch (error) {
      console.error('Error creating test type:', error);
      res.status(400).json({ message: "Invalid test type data" });
    }
  });

  // Update a test type (admin only)
  app.patch("/api/test-types/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Unauthorized - Admin access required" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid test type ID" });
      }

      const testType = await storage.getTestTypeById(id);
      if (!testType) {
        return res.status(404).json({ message: "Test type not found" });
      }

      const updateSchema = z.object({
        name: z.string().optional(),
        description: z.string().nullable().optional(),
        category: z.string().nullable().optional(),
        isActive: z.boolean().optional()
      });

      const updateData = updateSchema.parse(req.body);
      const updatedTestType = await storage.updateTestType(id, updateData);
      
      // Create audit log for this action
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: "update_test_type",
          entityType: "test_type",
          entityId: id.toString(),
          details: updateData,
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
      
      res.json(updatedTestType);
    } catch (error) {
      console.error('Error updating test type:', error);
      res.status(400).json({ message: "Invalid update data" });
    }
  });

  // Delete a test type (admin only)
  app.delete("/api/test-types/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Unauthorized - Admin access required" });
    }

    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid test type ID" });
      }

      const testType = await storage.getTestTypeById(id);
      if (!testType) {
        return res.status(404).json({ message: "Test type not found" });
      }

      await storage.deleteTestType(id);
      
      // Create audit log for this action
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: "delete_test_type",
          entityType: "test_type",
          entityId: id.toString(),
          details: { name: testType.name },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting test type:', error);
      res.status(500).json({ message: "Failed to delete test type" });
    }
  });

  //
  // PATIENT MANAGEMENT ENDPOINTS
  //
  
  // Create new patient (EDEC role)
  app.post("/api/patients", async (req, res) => {
    if (!req.isAuthenticated() || 
        (req.user?.role !== 'edec' && !req.user?.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized - EDEC or admin access required" });
    }

    try {
      // Generate a unique patient ID
      const patientId = await storage.generateUniquePatientId();
      
      // Pre-process the date field before validation
      const processedBody = {
        ...req.body,
        patientId,
        dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : undefined
      };
      
      // Parse and validate the patient data
      const patientData = insertPatientSchema.parse(processedBody);
      
      // Create the patient
      const patient = await storage.createPatient(patientData);
      
      // Create audit log for this action
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: "create_patient",
          entityType: "patient",
          entityId: patient.id.toString(),
          details: { 
            patientId: patient.patientId,
            name: `${patient.firstName} ${patient.lastName}`
          },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
      
      res.status(201).json(patient);
    } catch (error) {
      console.error('Error creating patient:', error);
      res.status(400).json({ message: "Invalid patient data" });
    }
  });
  
  // Get all patients (EDEC, Admin)
  app.get("/api/patients", async (req, res) => {
    if (!req.isAuthenticated() || 
        (req.user?.role !== 'edec' && !req.user?.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized - EDEC or admin access required" });
    }

    try {
      const patients = await storage.getAllPatients();
      res.json(patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });
  
  // Search for a patient by patient ID (EDEC, Admin)
  app.post("/api/patients/search", async (req, res) => {
    if (!req.isAuthenticated() || 
        (req.user?.role !== 'edec' && !req.user?.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized - EDEC or admin access required" });
    }

    try {
      const { patientId } = req.body;
      
      if (!patientId) {
        return res.status(400).json({ message: "Patient ID is required" });
      }
      
      const patient = await storage.getPatientByPatientId(patientId);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      console.error('Error searching for patient:', error);
      res.status(500).json({ message: "Failed to search for patient" });
    }
  });
  
  // Get patient by ID
  app.get("/api/patients/:id", async (req, res) => {
    if (!req.isAuthenticated() || 
        (req.user?.role !== 'edec' && !req.user?.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized - EDEC or admin access required" });
    }

    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const patient = await storage.getPatientById(id);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      console.error('Error fetching patient:', error);
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });
  
  // Update patient
  app.patch("/api/patients/:id", async (req, res) => {
    if (!req.isAuthenticated() || 
        (req.user?.role !== 'edec' && !req.user?.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized - EDEC or admin access required" });
    }

    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      // Get current patient to ensure it exists
      const existingPatient = await storage.getPatientById(id);
      
      if (!existingPatient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      // Validate update data - excluding patientId which shouldn't be changed
      const updateSchema = z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        dateOfBirth: z.date().optional(),
        contactNumber: z.string().optional(),
        contactAddress: z.string().optional(),
        email: z.string().email().optional().nullable(),
        kinFirstName: z.string().optional(),
        kinLastName: z.string().optional(),
        kinContactNumber: z.string().optional(),
        kinContactAddress: z.string().optional(),
        kinEmail: z.string().email().optional().nullable()
      });
      
      const updateData = updateSchema.parse(req.body);
      
      // Update the patient
      const updatedPatient = await storage.updatePatient(id, updateData);
      
      // Create audit log for this action
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: "update_patient",
          entityType: "patient",
          entityId: id.toString(),
          details: { 
            patientId: existingPatient.patientId,
            fields: Object.keys(updateData)
          },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
      
      res.json(updatedPatient);
    } catch (error) {
      console.error('Error updating patient:', error);
      res.status(400).json({ message: "Invalid patient data" });
    }
  });
  
  // Check payment status before generating access code
  app.get("/api/patients/:id/access-code-payment", async (req, res) => {
    if (!req.isAuthenticated() || 
        (req.user?.role !== 'edec' && !req.user?.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized - EDEC or admin access required" });
    }

    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      // Get the patient
      const patient = await storage.getPatientById(id);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      // Get payment settings
      const settings = await storage.getPaymentSettings();
      if (!settings) {
        return res.status(500).json({ message: "Payment settings not configured" });
      }
      
      // Check for existing payments for this patient
      const payments = await storage.getPaymentsByPatientId(patient.patientId);
      const verifiedPayment = payments.find(p => p.status === 'verified');
      
      res.status(200).json({ 
        patient,
        paymentRequired: !verifiedPayment,
        paymentSettings: {
          accessCodePrice: settings.accessCodePrice,
          currency: settings.currency,
          bankName: settings.bankName,
          accountName: settings.accountName,
          accountNumber: settings.accountNumber
        }
      });
    } catch (error) {
      console.error('Error checking payment status:', error);
      res.status(500).json({ message: "Failed to check payment status" });
    }
  });

  // Generate access code for a patient (requires payment verification)
  app.post("/api/patients/:id/access-code", async (req, res) => {
    if (!req.isAuthenticated() || 
        (req.user?.role !== 'edec' && !req.user?.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized - EDEC or admin access required" });
    }

    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      // Get the patient
      const patient = await storage.getPatientById(id);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      // Check for verified payment if user is not admin
      if (!req.user?.isAdmin) {
        const payments = await storage.getPaymentsByPatientId(patient.patientId);
        const verifiedPayment = payments.find(p => p.status === 'verified');
        
        if (!verifiedPayment) {
          return res.status(402).json({ 
            message: "Payment required",
            patientId: patient.patientId
          });
        }
      }
      
      // Generate an access code for the patient
      const accessCode = await storage.generateAccessCode(patient.patientId);
      
      // Generate expiry date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      // Get test type
      const { testType } = z.object({
        testType: z.string()
      }).parse(req.body);
      
      // Create a new result entry with this access code
      const result = await storage.createResult({
        accessCode,
        patientId: patient.patientId,
        testType,
        testDate: new Date(),
        expiresAt,
        resultData: null,
        reportUrl: null,
        isPaid: true, // Mark as paid since payment was verified
      });
      
      // Create audit log for this action
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: "generate_access_code",
          entityType: "result",
          entityId: result.id.toString(),
          details: { 
            patientId: patient.patientId,
            accessCode,
            testType
          },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
      
      res.status(201).json({ 
        accessCode,
        patientId: patient.patientId,
        expiresAt,
        resultId: result.id
      });
    } catch (error) {
      console.error('Error generating access code:', error);
      res.status(400).json({ message: "Invalid request" });
    }
  });
  
  //
  // PAYMENT MANAGEMENT ENDPOINTS
  //
  
  // Get payment settings (public)
  app.get("/api/payment-settings", async (req, res) => {
    try {
      const settings = await storage.getPaymentSettings();
      
      if (!settings) {
        return res.status(404).json({ message: "Payment settings not configured" });
      }
      
      // Check if the request is from an authenticated admin
      const isAdmin = req.isAuthenticated() && req.user?.isAdmin;
      
      if (isAdmin) {
        // Return full settings for admin users including OPay credentials
        res.json(settings);
      } else {
        // Return only necessary details for public use (omit sensitive OPay keys)
        res.json({
          accessCodePrice: settings.accessCodePrice,
          currency: settings.currency,
          bankName: settings.bankName,
          accountName: settings.accountName,
          accountNumber: settings.accountNumber,
          enableOpay: settings.enableOpay || false,
          // Omit secret keys for security reasons
        });
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      res.status(500).json({ message: "Failed to fetch payment settings" });
    }
  });
  
  // EDEC dashboard statistics
  app.get("/api/edec/stats", async (req, res) => {
    if (!req.isAuthenticated() || 
        (req.user?.role !== 'edec' && !req.user?.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized - EDEC or admin access required" });
    }

    try {
      // Get all patients
      const patients = await storage.getAllPatients();
      
      // Get all payments
      const allPayments = [];
      for (const patient of patients) {
        const payments = await storage.getPaymentsByPatientId(patient.patientId);
        allPayments.push(...payments);
      }
      
      // Count verified payments
      const verifiedPayments = allPayments.filter(payment => payment.status === 'verified');
      
      // Get recent activity (last 24 hours)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      // Get recent audit logs
      const allAuditLogs = await storage.getAuditLogs();
      const recentLogs = allAuditLogs.filter(log => 
        new Date(log.createdAt) > twentyFourHoursAgo
      );
      
      // Format recent activity
      const recentActivity = recentLogs.map(log => {
        let activityType = 'other';
        let description = 'Unknown activity';
        
        if (log.action === 'create_patient') {
          activityType = 'registration';
          description = `Patient ${log.details?.patientId || 'unknown'} registered`;
        } else if (log.action === 'verify_payment') {
          activityType = 'payment';
          description = `Payment for ${log.details?.patientId || 'unknown'} verified`;
        } else if (log.action === 'generate_access_code') {
          activityType = 'test';
          description = `Access code generated for ${log.details?.patientId || 'unknown'}`;
        }
        
        return {
          type: activityType,
          description,
          timestamp: log.createdAt
        };
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Limit to 10 most recent activities
      
      // Calculate registration trend
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const newRegistrations = patients.filter(p => new Date(p.createdAt) > weekAgo).length;
      
      // Return stats
      res.json({
        patientCount: patients.length,
        paymentCount: verifiedPayments.length,
        recentActivity,
        registrationTrend: {
          weeklyNew: newRegistrations,
          percentChange: patients.length > 0 ? (newRegistrations / patients.length) * 100 : 0
        }
      });
    } catch (error) {
      console.error('Error fetching EDEC stats:', error);
      res.status(500).json({ message: "Failed to fetch EDEC statistics" });
    }
  });
  
  // Update payment settings (Admin only)
  app.post("/api/payment-settings", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Unauthorized - Admin access required" });
    }

    try {
      const settingsData = insertPaymentSettingSchema.parse({
        ...req.body,
        updatedBy: req.user.id.toString()
      });
      
      const settings = await storage.updatePaymentSettings(settingsData);
      
      // Create audit log for this action
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: "update_payment_settings",
          entityType: "payment_settings",
          entityId: settings.id.toString(),
          details: { 
            accessCodePrice: settings.accessCodePrice,
            currency: settings.currency,
            bankName: settings.bankName,
            enableOpay: settings.enableOpay 
            // Omit sensitive OPay keys from audit log
          },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
      
      res.json(settings);
    } catch (error) {
      console.error('Error updating payment settings:', error);
      res.status(400).json({ message: "Invalid payment settings data" });
    }
  });
  
  // Register a payment (EDEC role)
  app.post("/api/payments", async (req, res) => {
    if (!req.isAuthenticated() || 
        (req.user?.role !== 'edec' && !req.user?.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized - EDEC or admin access required" });
    }

    try {
      // Generate a reference number for the payment
      const referenceNumber = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      const paymentData = insertPaymentSchema.parse({
        ...req.body,
        referenceNumber,
        completedAt: new Date()
      });
      
      // Create the payment
      const payment = await storage.createPayment(paymentData);
      
      // If this is for a result access code payment, update the result
      if (paymentData.metadata && paymentData.metadata.resultId) {
        const resultId = parseInt(paymentData.metadata.resultId as string);
        if (!isNaN(resultId)) {
          await storage.updateResult(resultId, { isPaid: true });
        }
      }
      
      // Create audit log for this action
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: "register_payment",
          entityType: "payment",
          entityId: payment.id.toString(),
          details: { 
            patientId: payment.patientId,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            referenceNumber
          },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
      
      res.status(201).json(payment);
    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(400).json({ message: "Invalid payment data" });
    }
  });
  
  // Get all payments for a patient
  app.get("/api/patients/:patientId/payments", async (req, res) => {
    if (!req.isAuthenticated() || 
        (req.user?.role !== 'edec' && !req.user?.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized - EDEC or admin access required" });
    }

    try {
      const { patientId } = req.params;
      
      // Validate patient exists
      const patient = await storage.getPatientByPatientId(patientId);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      const payments = await storage.getPaymentsByPatientId(patientId);
      res.json(payments);
    } catch (error) {
      console.error('Error fetching patient payments:', error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });
  
  // Payment verification endpoint
  app.post("/api/payments/verify", async (req, res) => {
    if (!req.isAuthenticated() || 
        (req.user?.role !== 'edec' && !req.user?.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized - EDEC or admin access required" });
    }

    try {
      const { patientId, referenceNumber } = z.object({
        patientId: z.string(),
        referenceNumber: z.string()
      }).parse(req.body);
      
      // Find all payments for this patient
      const payments = await storage.getPaymentsByPatientId(patientId);
      const payment = payments.find(p => p.referenceNumber === referenceNumber);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Return payment details
      res.json({
        verified: true,
        payment
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(400).json({ message: "Invalid reference number or patient ID" });
    }
  });

  // Public payment page (no authentication required)
  app.get("/api/payment-page", async (req, res) => {
    try {
      const settings = await storage.getPaymentSettings();
      
      if (!settings) {
        return res.status(404).json({ message: "Payment settings not configured" });
      }
      
      // Return only necessary details for public use, with limited bank account info
      res.json({
        accessCodePrice: settings.accessCodePrice,
        currency: settings.currency,
        bankName: settings.bankName,
        accountName: settings.accountName,
        accountNumber: settings.accountNumber.replace(/(\d{4})(\d+)(\d{4})/, '$1****$3'), // Mask middle digits
        enableOpay: settings.enableOpay || false,
        paymentInstructions: "Please make payment using any of the methods below and contact our staff to verify your payment."
      });
    } catch (error) {
      console.error('Error fetching payment page data:', error);
      res.status(500).json({ message: "Failed to fetch payment information" });
    }
  });
  
  // OPay payment initialization (no authentication required)
  app.post("/api/opay/initialize", async (req, res) => {
    try {
      const { patientId, amount, email, phone, callbackUrl } = z.object({
        patientId: z.string(),
        amount: z.number(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        callbackUrl: z.string().optional(),
      }).parse(req.body);
      
      // Get patient
      const patient = await storage.getPatientByPatientId(patientId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      // Get payment settings
      const settings = await storage.getPaymentSettings();
      if (!settings) {
        return res.status(404).json({ message: "Payment settings not configured" });
      }
      
      // Check if OPay is enabled
      if (!settings.enableOpay) {
        return res.status(400).json({ message: "OPay payments are not enabled" });
      }
      
      // Get OPay credentials
      const opayCredentials = await storage.getOpayCredentials();
      if (!opayCredentials.isEnabled) {
        return res.status(400).json({ message: "OPay integration is not properly configured" });
      }
      
      // Generate a unique reference for this payment
      const reference = `OPAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      
      try {
        // Import the OPay utility functions
        const { initializeOpayPayment } = require('./opay');
        
        // Initialize OPay payment
        const opayResponse = await initializeOpayPayment({
          amount, 
          currency: settings.currency,
          reference,
          callbackUrl: callbackUrl || `${req.protocol}://${req.get('host')}/api/opay/webhook`,
          metadata: {
            patientId,
            email: email || '',
            phone: phone || ''
          }
        });
        
        // Create a pending payment record
        await storage.createPayment({
          patientId,
          amount,
          paymentMethod: 'opay',
          status: 'pending',
          referenceNumber: reference,
          transactionId: opayResponse.data?.orderNo || '',
          metadata: {
            opayResponse: JSON.stringify(opayResponse),
            email,
            phone
          }
        });
        
        // Return initialization response
        res.status(200).json({
          success: true,
          reference,
          opayData: opayResponse.data,
          redirectUrl: opayResponse.data?.cashierUrl || ''
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('OPay payment initialization error:', error);
        res.status(500).json({ 
          message: "Failed to initialize OPay payment", 
          error: errorMessage 
        });
      }
    } catch (error) {
      console.error('Error in OPay payment initialization:', error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });
  
  // OPay webhook receiver - Process payment notifications
  app.post("/api/opay/webhook", async (req, res) => {
    try {
      // Import the OPay utility functions
      const { verifyOpaySignature, opayWebhookSchema } = require('./opay');
      
      // Get settings for the secret key
      const opayCredentials = await storage.getOpayCredentials();
      
      // Parse and validate the webhook payload
      const webhookData = opayWebhookSchema.parse(req.body);
      
      // Verify the signature
      const isValid = verifyOpaySignature(webhookData, opayCredentials.secretKey);
      
      if (!isValid) {
        console.error('Invalid OPay webhook signature');
        return res.status(400).json({ error: 'Invalid signature' });
      }
      
      // Extract reference and transaction ID
      const { orderNo, reference, status, amount } = webhookData.data;
      
      // Find the payment with this reference
      const payments = await storage.getAllPayments();
      // Define the payment type from the returned array elements
      type PaymentType = typeof payments[0];
      const payment = payments.find((p: PaymentType) => p.referenceNumber === reference);
      
      if (!payment) {
        console.error(`Payment with reference ${reference} not found`);
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      // Update payment status based on webhook status
      let paymentStatus;
      
      if (status === 'SUCCESS') {
        paymentStatus = 'verified';
      } else if (status === 'FAILED' || status === 'TIMEOUT') {
        paymentStatus = 'failed';
      } else if (status === 'PENDING') {
        paymentStatus = 'pending';
      } else {
        paymentStatus = 'invalid';
      }
      
      // Update the payment record
      await storage.updatePayment(payment.id, {
        status: paymentStatus,
        transactionId: orderNo,
        completedAt: paymentStatus === 'verified' ? new Date() : undefined,
        metadata: {
          ...payment.metadata,
          webhookResponse: JSON.stringify(webhookData)
        }
      });
      
      // If payment successful, create notification for staff
      if (paymentStatus === 'verified') {
        // Get admin users for notification
        const users = await storage.getAllUsers();
        const adminUsers = users.filter(user => user.isAdmin);
        
        // Get patient details
        const patient = await storage.getPatientByPatientId(payment.patientId);
        const patientName = patient ? `${patient.firstName} ${patient.lastName}` : payment.patientId;
        
        // Create notifications for all admin users
        for (const adminUser of adminUsers) {
          await storage.createNotification({
            title: 'New OPay Payment',
            message: `${patientName} has completed a payment of ${amount} via OPay.`,
            type: 'payment',
            recipientId: adminUser.id.toString(),
            isRead: false,
            metadata: {
              patientId: payment.patientId,
              paymentId: payment.id.toString(),
              amount
            }
          });
        }
        
        // Create audit log
        await storage.createAuditLog({
          userId: 'SYSTEM', // System generated
          action: 'verify_payment',
          entityType: 'payment',
          entityId: payment.id.toString(),
          details: {
            patientId: payment.patientId,
            amount: payment.amount,
            paymentMethod: 'opay',
            reference
          },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
      
      // Acknowledge the webhook
      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Error processing OPay webhook:', error);
      res.status(500).json({ error: 'Failed to process webhook' });
    }
  });
  
  // OPay payment verification endpoint (authenticated)
  app.post("/api/opay/verify", async (req, res) => {
    if (!req.isAuthenticated() || 
        (req.user?.role !== 'edec' && !req.user?.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized - EDEC or admin access required" });
    }

    try {
      const { reference } = z.object({
        reference: z.string()
      }).parse(req.body);
      
      // Import OPay verification function
      const { verifyOpayPayment } = require('./opay');
      
      // Get the payment with this reference
      const payments = await storage.getAllPayments();
      // Define the payment type from the returned array elements
      type PaymentType = typeof payments[0];
      const payment = payments.find((p: PaymentType) => p.referenceNumber === reference);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Verify with OPay
      const verificationResult = await verifyOpayPayment(reference);
      
      // Update payment status based on verification
      if (verificationResult.data?.status === 'SUCCESS') {
        await storage.updatePayment(payment.id, {
          status: 'verified',
          completedAt: new Date(),
          metadata: {
            ...payment.metadata,
            verificationResponse: JSON.stringify(verificationResult)
          }
        });
        
        // Create audit log for manual verification
        if (req.user?.id) {
          await storage.createAuditLog({
            userId: req.user.id.toString(),
            action: 'verify_payment',
            entityType: 'payment',
            entityId: payment.id.toString(),
            details: {
              patientId: payment.patientId,
              amount: payment.amount,
              paymentMethod: 'opay',
              reference
            },
            ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
          });
        }
        
        res.json({
          verified: true,
          payment: {
            ...payment,
            status: 'verified'
          }
        });
      } else {
        res.json({
          verified: false,
          payment,
          opayStatus: verificationResult.data?.status || 'UNKNOWN'
        });
      }
    } catch (error) {
      console.error('Error verifying OPay payment:', error);
      res.status(500).json({ message: "Failed to verify payment with OPay" });
    }
  });

  // --- Notifications API ---
  
  // Get current user's notifications
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      // Get notifications for the current user
      const notifications = await storage.getNotifications(req.user.id.toString());
      res.json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Create a new notification
  app.post("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { title, message, type, recipientId, metadata } = z.object({
        title: z.string(),
        message: z.string(),
        type: z.string(),
        recipientId: z.string(),
        metadata: z.record(z.unknown()).optional()
      }).parse(req.body);
      
      let recipients: string[] = [];
      
      // If recipientId is "STAFF", send to all staff users
      if (recipientId === "STAFF") {
        const users = await storage.getAllUsers();
        recipients = users
          .filter(user => user.role === 'edec' || user.role === 'admin')
          .map(user => user.id.toString());
      } else {
        recipients = [recipientId];
      }
      
      // Create notifications for all recipients
      const notifications = [];
      for (const recipient of recipients) {
        const notification = await storage.createNotification({
          title,
          message,
          type,
          recipientId: recipient,
          isRead: false,
        });
        notifications.push(notification);
      }
      
      res.status(201).json(notifications);
    } catch (error) {
      console.error('Error creating notification:', error);
      res.status(400).json({ message: "Invalid notification data" });
    }
  });

  // Mark notification as read
  app.post("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const { id } = req.params;
      await storage.markNotificationAsRead(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}