import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertResultSchema, insertTestTypeSchema, insertPatientSchema, insertPaymentSchema, insertPaymentSettingSchema } from "@shared/schema";
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
    if (!req.isAuthenticated() || !req.user?.isLabStaff) {
      return res.status(403).json({ message: "Unauthorized" });
    }

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
  
  // Mock test result generation endpoint for lab technicians
  app.post("/api/results/generate-mock", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isLabStaff) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      // Generate a random 8-character alphanumeric code
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let accessCode = '';
      for (let i = 0; i < 8; i++) {
        accessCode += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      // Get current date and expiration date (30 days from now)
      const now = new Date();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      // Generate a fake patient ID
      const patientId = `P${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Create a mock result based on the test type
      const testType = req.body.testType || "Comprehensive Panel";
      
      // Default mock result data
      let resultData = {
        templateId: 1,
        templateName: testType,
        timestamp: now.toISOString(),
        values: {}
      };
      
      // Different result data based on test type
      if (testType === "Blood Panel") {
        resultData.values = {
          "Hemoglobin": `${(13 + Math.random() * 2).toFixed(1)} g/dL`,
          "White Blood Cells": `${(4 + Math.random() * 7).toFixed(1)} 10^3/µL`,
          "Platelets": `${Math.floor(150 + Math.random() * 300)} 10^3/µL`,
          "Red Blood Cells": `${(4 + Math.random()).toFixed(2)} 10^6/µL`,
        };
      } else if (testType === "Lipid Panel") {
        resultData.values = {
          "Total Cholesterol": `${Math.floor(150 + Math.random() * 100)} mg/dL`,
          "HDL Cholesterol": `${Math.floor(40 + Math.random() * 30)} mg/dL`,
          "LDL Cholesterol": `${Math.floor(80 + Math.random() * 70)} mg/dL`,
          "Triglycerides": `${Math.floor(100 + Math.random() * 100)} mg/dL`,
        };
      } else if (testType === "Drug Test") {
        resultData.values = {
          "Amphetamines": "Negative",
          "Barbiturates": "Negative",
          "Benzodiazepines": "Negative",
          "Cocaine": "Negative",
          "Opiates": "Negative",
          "PCP": "Negative",
        };
      } else {
        // Comprehensive panel
        resultData.values = {
          "Glucose": `${Math.floor(70 + Math.random() * 50)} mg/dL`,
          "Creatinine": `${(0.6 + Math.random()).toFixed(1)} mg/dL`,
          "Sodium": `${Math.floor(135 + Math.random() * 10)} mmol/L`,
          "Potassium": `${(3.5 + Math.random()).toFixed(1)} mmol/L`,
        };
      }
      
      // Create a mock result with the generated data
      const mockResult = {
        accessCode,
        patientId,
        testType,
        testDate: now,
        resultData,
        reportUrl: "https://example.com/reports/mock-report.pdf", // Mock report URL to satisfy not-null constraint
        expiresAt,
      };
      
      const result = await storage.createResult(mockResult);
      
      // Create audit log for this action
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: "create_mock_result",
          entityType: "result",
          entityId: result.id.toString(),
          details: { 
            accessCode: result.accessCode,
            testType: result.testType,
            patientId: result.patientId
          },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Error generating mock result:', error);
      res.status(500).json({ message: "Failed to generate mock result" });
    }
  });

  app.get("/api/results", async (req, res) => {
    console.log('GET /api/results - Auth check:', { 
      isAuthenticated: req.isAuthenticated(),
      userRole: req.user?.role,
      isLabStaff: req.user?.isLabStaff,
      isAdmin: req.user?.isAdmin
    });
    
    // Check if the user is authenticated and has lab staff or admin role
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized - Not authenticated" });
    }
    
    // For scientists and admins allow access to all results
    if (req.user?.role === 'lab_scientist' || req.user?.isAdmin) {
      const results = await storage.getAllResults();
      return res.json(results);
    }
    
    // Allow technicians if they have isLabStaff property
    if (req.user?.isLabStaff) {
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
    if (!req.isAuthenticated() || (!req.user?.isLabStaff && !req.user?.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized - Lab staff or admin access required" });
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
      
      // Technicians can only input/update results that haven't been approved yet
      if (req.user?.role === 'technician' && 
          result.scientistReview && 
          result.scientistReview.approved) {
        return res.status(403).json({ 
          message: "Cannot modify approved results. Only scientists or admins can update approved results." 
        });
      }
      
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
    if (!req.isAuthenticated() || req.user?.role !== 'lab_scientist') {
      return res.status(403).json({ message: "Unauthorized - Scientific review requires lab scientist role" });
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
      
      res.json({
        imageUrl: logoUrl,
        originalName: file.originalname,
        size: file.size,
        message: "Logo uploaded successfully"
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
        (req.user?.role !== 'EDEC' && !req.user?.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized - EDEC or admin access required" });
    }

    try {
      // Generate a unique patient ID
      const patientId = await storage.generateUniquePatientId();
      
      // Parse and validate the patient data
      const patientData = insertPatientSchema.parse({
        ...req.body,
        patientId
      });
      
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
        (req.user?.role !== 'EDEC' && !req.user?.isAdmin)) {
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
  
  // Get patient by ID
  app.get("/api/patients/:id", async (req, res) => {
    if (!req.isAuthenticated() || 
        (req.user?.role !== 'EDEC' && !req.user?.isAdmin)) {
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
        (req.user?.role !== 'EDEC' && !req.user?.isAdmin)) {
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
  
  // Generate access code for a patient
  app.post("/api/patients/:id/access-code", async (req, res) => {
    if (!req.isAuthenticated() || 
        (req.user?.role !== 'EDEC' && !req.user?.isAdmin)) {
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
        reportUrl: null
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
      
      // Return only necessary details for public use
      res.json({
        accessCodePrice: settings.accessCodePrice,
        currency: settings.currency,
        bankName: settings.bankName,
        accountName: settings.accountName,
        accountNumber: settings.accountNumber
      });
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      res.status(500).json({ message: "Failed to fetch payment settings" });
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
            bankName: settings.bankName
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
        (req.user?.role !== 'EDEC' && !req.user?.isAdmin)) {
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
        (req.user?.role !== 'EDEC' && !req.user?.isAdmin)) {
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
        (req.user?.role !== 'EDEC' && !req.user?.isAdmin)) {
      return res.status(403).json({ message: "Unauthorized - EDEC or admin access required" });
    }

    try {
      const { referenceNumber } = z.object({
        referenceNumber: z.string()
      }).parse(req.body);
      
      // Find the payment by reference number
      const payments = await storage.getAllResults(); // We'll need to add a method to get payment by reference
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
      res.status(400).json({ message: "Invalid reference number" });
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
        paymentInstructions: "Please make payment using any of the methods below and contact our staff to verify your payment."
      });
    } catch (error) {
      console.error('Error fetching payment page data:', error);
      res.status(500).json({ message: "Failed to fetch payment information" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}