import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertResultSchema, 
  insertTestTypeSchema, 
  insertPatientSchema, 
  insertPaymentSchema, 
  insertPaymentSettingSchema,
  insertPageContentSchema,
  Payment,
  PageContent
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { csrfProtection, provideCSRFToken } from "./csrf";

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

// Enhanced file filter to only allow image files with additional security checks
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Strictly validate allowed MIME types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
  
  // Check MIME type
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Only JPEG, PNG and SVG files are allowed'));
  }
  
  // Additional validation based on file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.svg'];
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Invalid file extension, only JPG, PNG, and SVG are allowed'));
  }
  
  // Check for consistency between extension and MIME type
  const validCombinations = [
    { ext: '.jpg', mime: 'image/jpeg' },
    { ext: '.jpeg', mime: 'image/jpeg' },
    { ext: '.png', mime: 'image/png' },
    { ext: '.svg', mime: 'image/svg+xml' }
  ];
  
  const isValidCombination = validCombinations.some(
    combo => combo.ext === ext && combo.mime === file.mimetype
  );
  
  if (!isValidCombination) {
    return cb(new Error('Mismatched file extension and content type'));
  }
  
  // Log attempted file upload for audit purposes
  console.log(`File upload attempt: ${file.originalname} (${file.mimetype})`);
  
  // Allow the upload
  cb(null, true);
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

  // Logo backup endpoint - serves a JSON file with the last valid logo URL
  // This is used as a fallback when the database is unavailable
  app.get("/uploads/logo-backup.json", async (req, res) => {
    try {
      // First, check if the file exists
      const backupPath = path.join(process.cwd(), 'uploads', 'logo-backup.json');
      
      try {
        // Try to read the backup file
        const backupData = await fs.promises.readFile(backupPath, 'utf8');
        const parsed = JSON.parse(backupData);
        
        // Validate the backup data
        if (parsed && parsed.logoUrl) {
          // Make sure the referenced file exists
          const logoFilename = path.basename(parsed.logoUrl);
          const logoPath = path.join(process.cwd(), 'uploads', logoFilename);
          
          try {
            await fs.promises.access(logoPath, fs.constants.F_OK);
            // File exists, return the backup data
            res.json(parsed);
            return;
          } catch (e) {
            // Logo file doesn't exist, continue with fallback
            console.log(`Logo file from backup doesn't exist: ${logoPath}`);
          }
        }
      } catch (e) {
        // Backup file doesn't exist or is invalid, continue with fallback
      }
      
      // If we got here, we need to generate a new backup
      // Look for any valid logo files
      const uploadsDir = path.join(process.cwd(), 'uploads');
      try {
        // Ensure the directory exists
        await fs.promises.access(uploadsDir, fs.constants.F_OK);
        
        // Find all potential logo files
        const files = await fs.promises.readdir(uploadsDir);
        
        // Look for logo files with different extensions
        const logoFiles = files.filter(f => 
          (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.svg')) && 
          f.startsWith('logo-')
        );
        
        if (logoFiles.length > 0) {
          // Sort by name (which includes timestamp) to get the newest
          logoFiles.sort().reverse();
          
          const newestFile = logoFiles[0];
          const logoUrl = `/uploads/${newestFile}`;
          
          // Create backup data
          const backupData = JSON.stringify({
            logoUrl,
            timestamp: Date.now(),
            recovered: true
          });
          
          // Save the backup file
          await fs.promises.writeFile(backupPath, backupData);
          
          // Return the backup data
          res.json({
            logoUrl,
            timestamp: Date.now(),
            recovered: true
          });
          return;
        }
      } catch (e) {
        // Failed to generate backup, fall back to empty response
      }
      
      // Ultimate fallback - no valid logo found
      res.json({
        logoUrl: '',
        timestamp: Date.now(),
        error: 'No valid logo found'
      });
    } catch (error) {
      console.error('Error serving logo backup:', error);
      res.status(200).json({
        logoUrl: '',
        timestamp: Date.now(),
        error: 'Backup error'
      });
    }
  });
  
  // Logo settings endpoint - public, with improved reliability
  app.get("/api/settings/logo", async (req, res) => {
    try {
      // Strong caching for logo settings - longer lived to avoid flicker
      // Set a longer cache time but allow revalidation
      res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate'); // Cache for 1 hour
      
      // Add timestamp header to help with browser caching
      res.setHeader('X-Timestamp', Date.now().toString());
      
      // Track if this is a force refresh request
      const isForceRefresh = req.query.force === 'true';
      
      // Fetch logo settings from database
      const logoSettings = await storage.getLogoSettings();
      
      // Important: keep track of most recent valid image URL
      let validImageUrl = '';
      let validImagePath = '';
      let foundValidLogo = false;
      
      // First, check if the configured logo exists
      if (logoSettings.imageUrl && logoSettings.imageUrl.startsWith('/uploads/')) {
        try {
          const fileName = path.basename(logoSettings.imageUrl);
          const filePath = path.join(process.cwd(), 'uploads', fileName);
          
          // Verify the file exists
          await fs.promises.access(filePath, fs.constants.F_OK);
          
          // File exists, it's valid
          validImageUrl = logoSettings.imageUrl;
          validImagePath = filePath;
          foundValidLogo = true;
          
          // Verify file is not corrupted by checking size
          const stats = await fs.promises.stat(filePath);
          if (stats.size === 0) {
            console.warn(`Logo file exists but has zero size: ${filePath}`);
            foundValidLogo = false;
          }
        } catch (fileError) {
          console.error(`Logo file doesn't exist: ${logoSettings.imageUrl}`, fileError);
          foundValidLogo = false;
        }
      }
      
      // If the configured logo doesn't exist, search for any valid logo files
      if (!foundValidLogo || isForceRefresh) {
        try {
          // Create uploads directory if it doesn't exist
          const uploadsDir = path.join(process.cwd(), 'uploads');
          try {
            await fs.promises.access(uploadsDir, fs.constants.F_OK);
          } catch (e) {
            await fs.promises.mkdir(uploadsDir, { recursive: true });
            console.log('Created uploads directory');
          }
          
          // Find all potential logo files
          const files = await fs.promises.readdir(uploadsDir);
          
          // Look for logo files with different extensions
          const logoFiles = files.filter(f => 
            (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.svg')) && 
            f.startsWith('logo-')
          );
          
          if (logoFiles.length > 0) {
            // Sort by modified time, newest first
            const fileStats = await Promise.all(
              logoFiles.map(async file => {
                const filePath = path.join(process.cwd(), 'uploads', file);
                const stats = await fs.promises.stat(filePath);
                return { file, stats, size: stats.size };
              })
            );
            
            // Filter out empty files
            const validFiles = fileStats.filter(f => f.size > 0);
            
            if (validFiles.length > 0) {
              // Sort by newest first
              validFiles.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
              
              // Use the newest valid file
              const newestFile = validFiles[0].file;
              validImageUrl = `/uploads/${newestFile}`;
              validImagePath = path.join(process.cwd(), 'uploads', newestFile);
              foundValidLogo = true;
              
              // Update the database with the correct URL if it's different
              if (logoSettings.imageUrl !== validImageUrl) {
                await storage.updateLogoSettings({ imageUrl: validImageUrl });
                console.log(`Updated logo settings with recovered image: ${validImageUrl}`);
              }
            }
          }
        } catch (recoveryError) {
          console.error('Could not recover any valid logo files:', recoveryError);
        }
      }
      
      // Send a copy of the settings with the validated image URL
      const responseSettings = {
        ...logoSettings,
        imageUrl: validImageUrl,
        // Add validation status for debugging
        _debug: {
          foundValidLogo,
          validImagePath: foundValidLogo ? validImagePath : null,
          timestamp: Date.now()
        }
      };
      
      // Log serving info
      if (validImageUrl) {
        console.log(`Serving logo from ${validImagePath}, URL: ${validImageUrl}`);
      } else {
        console.log('No valid logo file found to serve');
      }
      
      // Always return the same structure, even if no logo is found
      res.json(responseSettings);
    } catch (error) {
      console.error('Error fetching logo settings:', error);
      // Return valid JSON even on error, with status 200 to maintain client state
      res.json({ 
        name: 'SeekLab', 
        tagline: 'Know where you stand. Take control of tomorrow.',
        imageUrl: '',
        _debug: { 
          error: true, 
          message: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        }
      });
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
  
  // Logo upload endpoint - for uploading logo image files with enhanced reliability
  app.post("/api/settings/logo/upload", upload.single('logo'), async (req, res) => {
    // Create audit log for upload attempts (even if unauthorized)
    const auditDetails = {
      ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      hasFile: !!req.file,
      fileDetails: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      } : null
    };
    
    console.log('Logo upload request received:', {
      isAuthenticated: req.isAuthenticated(),
      userIsAdmin: req.user?.isAdmin,
      ...auditDetails,
      body: req.body
    });

    // Strict authentication check
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      console.log('Unauthorized logo upload attempt');
      
      // Log the unauthorized attempt
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: 'UNAUTHORIZED_LOGO_UPLOAD_ATTEMPT',
          entityType: 'SETTINGS',
          details: auditDetails,
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
      
      return res.status(403).json({ 
        message: "Unauthorized - Admin access required for file uploads", 
        error: "UNAUTHORIZED_ACCESS"
      });
    }

    try {
      if (!req.file) {
        console.log('No file uploaded in the request');
        
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: 'FAILED_LOGO_UPLOAD',
          entityType: 'SETTINGS',
          details: { reason: 'NO_FILE_PROVIDED', ...auditDetails },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
        
        return res.status(400).json({ 
          message: "No file uploaded", 
          error: "NO_FILE_PROVIDED" 
        });
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
      
      // Enhanced security: perform additional file validation
      
      // 1. Verify file size (already checked by multer, but double-checking)
      const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
      if (file.size > MAX_FILE_SIZE) {
        // Remove the invalid file
        try {
          await fs.promises.unlink(file.path);
        } catch (err) {
          console.error('Failed to delete oversized file:', err);
        }
        
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: 'REJECTED_LOGO_UPLOAD',
          entityType: 'SETTINGS',
          details: { 
            reason: 'FILE_TOO_LARGE', 
            size: file.size, 
            maxAllowed: MAX_FILE_SIZE,
            ...auditDetails 
          },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
        
        return res.status(400).json({ 
          message: "File size exceeds limit (max 2MB)", 
          error: "FILE_TOO_LARGE" 
        });
      }
      
      // 2. Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), 'uploads');
      try {
        await fs.promises.access(uploadsDir, fs.constants.F_OK);
      } catch (e) {
        await fs.promises.mkdir(uploadsDir, { recursive: true });
        console.log('Created uploads directory');
      }
      
      // 3. Enhanced extension and MIME type validation
      const originalExtension = path.extname(file.originalname).toLowerCase();
      const validExtensions = ['.png', '.jpg', '.jpeg', '.svg'];
      const validMimeTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
      
      // Validate extension
      if (!validExtensions.includes(originalExtension)) {
        // Remove the invalid file
        try {
          await fs.promises.unlink(file.path);
        } catch (err) {
          console.error('Failed to delete file with invalid extension:', err);
        }
        
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: 'REJECTED_LOGO_UPLOAD',
          entityType: 'SETTINGS',
          details: { 
            reason: 'INVALID_FILE_EXTENSION', 
            extension: originalExtension,
            ...auditDetails 
          },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
        
        return res.status(400).json({ 
          message: "Invalid file type, only PNG, JPG, JPEG, and SVG are allowed", 
          error: "INVALID_FILE_TYPE" 
        });
      }
      
      // Validate MIME type
      if (!validMimeTypes.includes(file.mimetype)) {
        // Remove the invalid file
        try {
          await fs.promises.unlink(file.path);
        } catch (err) {
          console.error('Failed to delete file with invalid MIME type:', err);
        }
        
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: 'REJECTED_LOGO_UPLOAD',
          entityType: 'SETTINGS',
          details: { 
            reason: 'INVALID_MIME_TYPE', 
            mimeType: file.mimetype,
            ...auditDetails 
          },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
        
        return res.status(400).json({ 
          message: "Invalid file content type", 
          error: "INVALID_CONTENT_TYPE" 
        });
      }
      
      // Create a new filename with timestamp to avoid collisions
      const timestamp = Date.now();
      const newFilename = `logo-${timestamp}${originalExtension}`;
      const newFilePath = path.join(uploadsDir, newFilename);
      
      // Copy the uploaded file to the new location to ensure we have a stable copy
      try {
        // First make a copy of the file to ensure it's complete
        await fs.promises.copyFile(file.path, newFilePath);
        
        // Verify the copied file exists and has a valid size
        const stats = await fs.promises.stat(newFilePath);
        if (stats.size === 0) {
          throw new Error('Copied file has zero size, possible corruption');
        }
        
        console.log(`Created stable copy of logo at ${newFilePath} (${stats.size} bytes)`);
        
        // The URL format for the browser
        const logoUrl = `/uploads/${newFilename}`;
        
        // Try to keep only the last 3 logo files to avoid filling disk
        try {
          const files = await fs.promises.readdir(uploadsDir);
          const logoFiles = files
            .filter(f => f.startsWith('logo-') && 
                        (f.endsWith('.png') || f.endsWith('.jpg') || 
                         f.endsWith('.jpeg') || f.endsWith('.svg')))
            .filter(f => f !== newFilename) // Don't include the file we just uploaded
            .sort(); // Sort alphabetically
          
          // Keep only the newest 3 files
          if (logoFiles.length > 3) {
            // Delete the oldest files (up to the newest 3)
            const filesToDelete = logoFiles.slice(0, logoFiles.length - 3);
            for (const fileToDelete of filesToDelete) {
              try {
                await fs.promises.unlink(path.join(uploadsDir, fileToDelete));
                console.log(`Cleaned up old logo file: ${fileToDelete}`);
              } catch (e) {
                console.log(`Failed to delete old logo file ${fileToDelete}:`, e);
              }
            }
          }
        } catch (cleanupError) {
          // Non-critical, just log it
          console.log('Error during logo cleanup:', cleanupError);
        }
        
        // Update logo URL in database settings
        await storage.updateLogoSettings({ imageUrl: logoUrl });
        
        // Create a backup of this setting in case the database fails
        try {
          // Write a backup file with the current logo URL
          const backupData = JSON.stringify({ 
            logoUrl, 
            timestamp, 
            originalName: file.originalname 
          });
          await fs.promises.writeFile(
            path.join(process.cwd(), 'uploads', 'logo-backup.json'), 
            backupData
          );
        } catch (backupError) {
          // Non-critical, just log it
          console.log('Failed to write logo backup file:', backupError);
        }
        
        // Return success with the new URL
        res.json({
          imageUrl: logoUrl,
          originalName: file.originalname,
          size: stats.size,
          message: "Logo uploaded successfully",
          timestamp,
          absolutePath: newFilePath, // For debugging
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
              size: stats.size,
              mimetype: file.mimetype,
              timestamp
            },
            ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
          });
        }
      } catch (fileError) {
        console.error('File operation failed:', fileError);
        return res.status(500).json({ 
          message: "Logo file processing failed - please try again",
          details: fileError instanceof Error ? fileError.message : String(fileError) 
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
      
      // Check for payment reference if provided in request body
      const { testType, paymentReference } = z.object({
        testType: z.string(),
        paymentReference: z.string().optional()
      }).parse(req.body);
      
      // If payment reference is provided, verify it
      if (paymentReference) {
        // Fetch payment using the reference
        const payment = await storage.getPaymentByReference(paymentReference);
        
        if (!payment || payment.patientId !== patient.patientId) {
          return res.status(400).json({ 
            message: "Invalid payment reference or payment doesn't belong to this patient" 
          });
        }
        
        if (payment.status !== 'completed' && payment.status !== 'verified') {
          return res.status(400).json({ 
            message: "Payment has not been completed or verified" 
          });
        }
      }
      
      // Generate an access code for the patient
      const accessCode = await storage.generateAccessCode(patient.patientId);
      
      // Generate expiry date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
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
  
  // Get all payments (Admin only)
  app.get("/api/payments", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Unauthorized - Admin access required" });
    }

    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      console.error('Error fetching all payments:', error);
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
        patientId: z.string().optional(),
        referenceNumber: z.string()
      }).parse(req.body);
      
      // First try to find the payment by reference number directly
      const payment = await storage.getPaymentByReference(referenceNumber);
      
      if (!payment) {
        return res.status(404).json({ message: "Payment not found with this reference number" });
      }
      
      // If patientId is provided, verify it matches
      if (patientId && payment.patientId !== patientId) {
        return res.status(400).json({ 
          message: "Payment reference is valid but doesn't belong to this patient" 
        });
      }
      
      // Update status to verified if not already
      if (payment.status !== 'verified') {
        await storage.updatePayment(payment.id, { 
          status: 'verified',
          completedAt: new Date()
        });
        
        // Create audit log for this verification
        if (req.user?.id) {
          await storage.createAuditLog({
            userId: req.user.id.toString(),
            action: "verify_payment",
            entityType: "payment",
            entityId: payment.id.toString(),
            details: { 
              patientId: payment.patientId,
              amount: payment.amount,
              paymentMethod: payment.paymentMethod,
              referenceNumber: payment.referenceNumber
            },
            ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
          });
        }
      }
      
      // Return payment details
      res.json({
        amount: payment.amount,
        currency: payment.currency || 'NGN',
        status: 'verified',
        paymentMethod: payment.paymentMethod,
        createdAt: payment.createdAt,
        referenceNumber: payment.referenceNumber,
        patientId: payment.patientId
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

  // Page Content Management Routes
  app.get("/api/page-contents", async (req, res) => {
    try {
      const pageContents = await storage.getAllPageContents();
      res.json(pageContents);
    } catch (error) {
      console.error('Error fetching page contents:', error);
      res.status(500).json({ message: "Failed to fetch page contents" });
    }
  });

  app.get("/api/page-contents/by-slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const pageContent = await storage.getPageContent(slug);
      
      if (!pageContent) {
        return res.status(404).json({ message: "Page content not found" });
      }
      
      res.json(pageContent);
    } catch (error) {
      console.error('Error fetching page content:', error);
      res.status(500).json({ message: "Failed to fetch page content" });
    }
  });
  
  app.get("/api/page-contents/by-id/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const pageContent = await storage.getPageContentById(id);
      
      if (!pageContent) {
        return res.status(404).json({ message: "Page content not found" });
      }
      
      res.json(pageContent);
    } catch (error) {
      console.error('Error fetching page content by ID:', error);
      res.status(500).json({ message: "Failed to fetch page content" });
    }
  });

  app.post("/api/page-contents", csrfProtection, async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Unauthorized - Admin access required" });
    }

    try {
      // First validate only the client-provided fields
      const clientSchema = z.object({
        pageSlug: z.string().min(2).max(64),
        title: z.string().min(3),
        content: z.string().min(10),
        metaDescription: z.string().optional()
      });
      
      const validatedClientData = clientSchema.parse(req.body);
      
      // Check if page already exists
      const existing = await storage.getPageContent(validatedClientData.pageSlug);
      if (existing) {
        return res.status(409).json({ message: "Page with this slug already exists" });
      }
      
      // Add required updatedBy field from server context
      const pageContentData = {
        ...validatedClientData,
        updatedBy: req.user?.username || 'Unknown admin'
      };
      
      const pageContent = await storage.createPageContent(pageContentData);
      
      // Create audit log for this action
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: "create_page_content",
          entityType: "page_content",
          entityId: pageContent.id.toString(),
          details: { 
            pageSlug: pageContent.pageSlug,
            title: pageContent.title
          },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
      
      res.status(201).json(pageContent);
    } catch (error: any) {
      console.error('Error creating page content:', error);
      // Provide more detailed error information
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid page content data", 
          details: error.errors 
        });
      } else {
        res.status(400).json({ 
          message: "Invalid page content data",
          details: error.message || "Unknown validation error" 
        });
      }
    }
  });

  app.patch("/api/page-contents/:id", csrfProtection, async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Unauthorized - Admin access required" });
    }

    try {
      const contentId = parseInt(req.params.id);
      
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      // Get simplified schema for update (all fields optional)
      const updateSchema = z.object({
        title: z.string().optional(),
        content: z.string().optional(),
        metaDescription: z.string().optional()
      });
      
      const updateData = updateSchema.parse(req.body);
      
      // Add updated by info
      const dataWithUser = {
        ...updateData,
        updatedBy: req.user?.username || 'Unknown admin',
        updatedAt: new Date()
      };
      
      const updatedContent = await storage.updatePageContent(contentId, dataWithUser);
      
      // Create audit log for this action
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: "update_page_content",
          entityType: "page_content",
          entityId: contentId.toString(),
          details: { 
            pageSlug: updatedContent.pageSlug,
            fields: Object.keys(updateData)
          },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
      
      res.json(updatedContent);
    } catch (error: any) {
      console.error('Error updating page content:', error);
      // Provide more detailed error information
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid update data", 
          details: error.errors 
        });
      } else {
        res.status(400).json({ 
          message: "Invalid update data",
          details: error.message || "Unknown validation error" 
        });
      }
    }
  });

  app.delete("/api/page-contents/:id", csrfProtection, async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Unauthorized - Admin access required" });
    }

    try {
      const contentId = parseInt(req.params.id);
      
      if (isNaN(contentId)) {
        return res.status(400).json({ message: "Invalid content ID" });
      }
      
      // Get the page content first for audit logging
      const pageContents = await storage.getAllPageContents();
      const pageContent = pageContents.find(p => p.id === contentId);
      
      if (!pageContent) {
        return res.status(404).json({ message: "Page content not found" });
      }
      
      await storage.deletePageContent(contentId);
      
      // Create audit log for this action
      if (req.user?.id) {
        await storage.createAuditLog({
          userId: req.user.id.toString(),
          action: "delete_page_content",
          entityType: "page_content",
          entityId: contentId.toString(),
          details: { 
            pageSlug: pageContent.pageSlug,
            title: pageContent.title
          },
          ipAddress: req.ip || req.socket.remoteAddress || 'unknown'
        });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting page content:', error);
      res.status(500).json({ message: "Failed to delete page content" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}