import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertResultSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Test Results Access Routes
  app.post("/api/results/access", async (req, res) => {
    try {
      const { code } = z.object({ code: z.string() }).parse(req.body);
      const result = await storage.getResultByCode(code);

      if (!result) {
        return res.status(404).json({ message: "Invalid access code" });
      }

      if (new Date() > result.expiresAt) {
        return res.status(401).json({ message: "Access code has expired" });
      }

      res.json(result);
    } catch (error) {
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
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ message: "Invalid result data" });
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