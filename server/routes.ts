import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertResultSchema } from "@shared/schema";
import { z } from "zod";

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
        const oldestKey = [...resultCache.keys()].sort((a, b) => 
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
      isLabStaff: req.user?.isLabStaff
    });
    
    if (!req.isAuthenticated() || !req.user?.isLabStaff) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const results = await storage.getAllResults();
    res.json(results);
  });

  // Admin check endpoint
  app.get("/api/admin/check", async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    res.json({ message: "Admin access confirmed" });
  });

  const httpServer = createServer(app);
  return httpServer;
}