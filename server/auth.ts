import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User, User as SelectUser } from "@shared/schema";
import { roles } from "@shared/schema";
import { provideCSRFToken } from "./csrf";

declare global {
  namespace Express {
    interface User extends SelectUser {}
    interface Request {
      // Extend Express Request to ensure TypeScript understands these properties
      ip?: string;
      socket: {
        remoteAddress?: string;
      };
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    if (!stored.includes(".")) {
      console.error("Invalid password format - missing salt delimiter");
      return false;
    }

    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.error("Invalid password format - missing hash or salt");
      return false;
    }

    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

// Simple rate limiter for login attempts
interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

// Maps IP addresses to their rate limit info
const loginRateLimits = new Map<string, RateLimitEntry>();

// Rate limit middleware for login endpoint
function loginRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5; // Max attempts per window
  
  if (!loginRateLimits.has(ip)) {
    // First attempt from this IP
    loginRateLimits.set(ip, {
      count: 1,
      resetTime: now + windowMs,
      blocked: false
    });
    return next();
  }
  
  const rateLimitInfo = loginRateLimits.get(ip)!;
  
  // Check if window has expired and reset if needed
  if (now > rateLimitInfo.resetTime) {
    rateLimitInfo.count = 1;
    rateLimitInfo.resetTime = now + windowMs;
    rateLimitInfo.blocked = false;
    return next();
  }
  
  // Check if this IP is currently blocked
  if (rateLimitInfo.blocked) {
    const remainingMinutes = Math.ceil(Number((rateLimitInfo.resetTime - now) / 60000));
    return res.status(429).json({
      message: `Too many failed login attempts. Please try again after ${remainingMinutes} minutes.`
    });
  }
  
  // Increment count and check if limit is reached
  rateLimitInfo.count += 1;
  
  if (rateLimitInfo.count > maxAttempts) {
    // Block this IP for the remainder of the window
    rateLimitInfo.blocked = true;
    const remainingMinutes = Math.ceil(Number((rateLimitInfo.resetTime - now) / 60000));
    
    // Log suspicious activity
    console.warn(`Suspicious login activity detected from IP: ${ip}. Blocked for ${remainingMinutes} minutes.`);
    
    return res.status(429).json({
      message: `Too many failed login attempts. Please try again after ${remainingMinutes} minutes.`
    });
  }
  
  // Allow the request
  next();
}

export function setupAuth(app: Express) {
  // Configure session middleware with enhanced secure settings
  const SESSION_SECRET = process.env.SESSION_SECRET || 'seeklab-secure-session-secret';
  
  // If no SESSION_SECRET is provided in production, generate a random one (for this server instance only)
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    console.warn(
      "WARNING: No SESSION_SECRET environment variable set in production. " +
      "Using a randomly generated value which will invalidate all existing sessions on restart. " +
      "Set the SESSION_SECRET environment variable for persistent sessions in production."
    );
  }
  
  const sessionSettings: session.SessionOptions = {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    name: 'seeklab.sid', // Custom session name (not the default 'connect.sid')
    rolling: true, // Reset cookie expiration on each response
    cookie: {
      secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
      httpOnly: true, // Prevent JavaScript access to the cookie
      maxAge: 24 * 60 * 60 * 1000, // 24 hours session lifetime
      sameSite: 'strict', // Stronger protection against CSRF (was 'lax')
      path: '/', // Only send cookie for requests to our domain
      domain: undefined, // Restrict to the current domain only
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Apply CSRF protection to all routes that need it
  try {
    // Use the imported provideCSRFToken function
    app.use(provideCSRFToken);
    console.log('CSRF protection enabled');
  } catch (error) {
    console.warn('CSRF protection could not be initialized:', error);
  }

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Generate employee ID if not provided 
      let employeeId = req.body.employeeId;
      if (!employeeId) {
        // Format: EMP-12345-XYZ
        const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5-digit number
        const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase(); // 3 letter suffix
        employeeId = `EMP-${randomDigits}-${randomSuffix}`;
      }

      // Check if the username contains "Admin" (case-insensitive)
      const isAdmin = req.body.username.toLowerCase().includes("admin");
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
        isAdmin,
        isLabStaff: false, // No longer using isLabStaff flag
        employeeId,
      });

      req.login(user, async (err) => {
        if (err) return next(err);
        if (user) {
          await createAuditLog(req, 'CREATE', 'USER', user.id.toString());
        }
        res.status(201).json(user);
      });
      // Create notification for admin users about new registration
      const adminUsers = await storage.getAllUsers();
      for (const admin of adminUsers.filter(u => u.isAdmin)) {
        await createNotification(
          'USER_REGISTRATION',
          'New User Registration',
          `New user ${user.username} has registered`,
          admin.id.toString(),
          { userId: user.id }
        );
      }
    } catch (error) {
      next(error);
    }
  });

  // Apply rate limiting to login endpoint
  app.post("/api/login", loginRateLimiter, async (req, res, next) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) { return next(err); }
      
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      
      if (!user) { 
        // Failed login attempt - record in rate limiter but don't reset count
        const rateLimitInfo = loginRateLimits.get(ip);
        if (rateLimitInfo) {
          // Already logged in loginRateLimiter but we log the attempt details
          console.warn(`Failed login attempt for username: ${req.body.username} from IP: ${ip}`);
          
          // Create audit log for failed login attempt
          await createAuditLog(req, 'FAILED_LOGIN', 'SECURITY', '', {
            username: req.body.username,
            ipAddress: ip,
          });
        }
        return res.status(401).json({ message: info?.message || 'Invalid credentials' }); 
      }
      
      // Successful login - reset rate limit counter
      if (loginRateLimits.has(ip)) {
        const rateLimitInfo = loginRateLimits.get(ip)!;
        rateLimitInfo.count = 0;
        rateLimitInfo.blocked = false;
      }
      
      // Update the last login timestamp
      try {
        const now = new Date();
        const updatedUser = await storage.updateUser(user.id, { lastLogin: now });
        
        req.login(updatedUser, async (err) => {
          if (err) { return next(err); }
          await createAuditLog(req, 'LOGIN', 'USER', updatedUser.id.toString());
          res.status(200).json(req.user);
        });
      } catch (error) {
        console.error("Error updating last login timestamp:", error);
        // Continue with login even if the timestamp update fails
        req.login(user, async (err) => {
          if (err) { return next(err); }
          await createAuditLog(req, 'LOGIN', 'USER', user.id.toString());
          res.status(200).json(req.user);
        });
      }
    })(req, res, next);
  });

  app.post("/api/logout", async (req, res, next) => {
    const userId = req.user?.id;
    const userIdStr = userId?.toString();
    
    if (userId) {
      try {
        // Update the last login timestamp on logout too (for tracking purposes)
        const now = new Date();
        await storage.updateUser(userId, { lastLogin: now });
      } catch (error) {
        console.error("Error updating timestamp on logout:", error);
        // Continue with logout process even if the update fails
      }
    }
    
    req.logout((err) => {
      if (err) return next(err);
      if (userIdStr) {
        createAuditLog(req, 'LOGOUT', 'USER', userIdStr);
      }
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    console.log('User data from /api/user:', req.user);
    res.json(req.user);
  });

  // Get all users (admin only)
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // Update user (admin only)
  app.patch("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const userId = parseInt(req.params.id);
    const userData = req.body;

    // Prevent changing own admin status
    if (req.user.id === userId && 'isAdmin' in userData) {
      return res.status(400).json({ message: "Cannot modify your own admin status" });
    }

    try {
      const user = await storage.updateUser(userId, userData);
      await createAuditLog(req, 'UPDATE', 'USER', userId.toString(), userData); // Added audit log
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const userId = parseInt(req.params.id);

    // Prevent self-deletion
    if (req.user.id === userId) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    try {
      await storage.deleteUser(userId);
      await createAuditLog(req, 'DELETE', 'USER', userId.toString()); // Added audit log
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Profile update endpoint
  app.patch("/api/users/:id/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = parseInt(req.params.id);
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Can only update your own profile" });
    }

    try {
      const { email, currentPassword, newPassword } = req.body;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      if (!(await comparePasswords(currentPassword, user.password))) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Prepare update data
      const updateData: Partial<User> = {};

      if (email) {
        updateData.email = email;
      }

      if (newPassword) {
        updateData.password = await hashPassword(newPassword);
      }

      // Update user profile
      const updatedUser = await storage.updateUser(userId, updateData);

      // Create audit log
      await createAuditLog(req, 'UPDATE', 'USER_PROFILE', userId.toString(), {
        email: email ? 'updated' : undefined,
        password: newPassword ? 'changed' : undefined
      });

      // Send success response without sensitive data
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);

    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });


  // Role management endpoints
  app.get("/api/roles", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    try {
      const roles = await storage.getAllRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.post("/api/roles", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    try {
      const role = await storage.createRole({
        ...req.body,
        isSystem: false,
      });
      await createAuditLog(req, 'CREATE', 'ROLE', role.id.toString(), req.body); // Added audit log
      res.status(201).json(role);
    } catch (error) {
      res.status(500).json({ message: "Failed to create role" });
    }
  });

  app.patch("/api/roles/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const roleId = parseInt(req.params.id);
    const role = await storage.getRoleById(roleId);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    if (role.isSystem) {
      return res.status(400).json({ message: "Cannot modify system roles" });
    }

    try {
      const updatedRole = await storage.updateRole(roleId, req.body);
      await createAuditLog(req, 'UPDATE', 'ROLE', roleId.toString(), req.body); // Added audit log
      res.json(updatedRole);
    } catch (error) {
      res.status(500).json({ message: "Failed to update role" });
    }
  });

  app.delete("/api/roles/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const roleId = parseInt(req.params.id);
    const role = await storage.getRoleById(roleId);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    if (role.isSystem) {
      return res.status(400).json({ message: "Cannot delete system roles" });
    }

    try {
      await storage.deleteRole(roleId);
      await createAuditLog(req, 'DELETE', 'ROLE', roleId.toString()); // Added audit log
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to delete role" });
    }
  });

  // Code generation and validation endpoints
  app.post("/api/results/access", async (req, res) => {
    try {
      const { code } = req.body;
      const result = await storage.getResultByCode(code);

      if (!result) {
        return res.status(404).json({ message: "Invalid access code" });
      }

      if (new Date() > new Date(result.expiresAt)) {
        return res.status(403).json({ message: "This access code has expired" });
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to validate access code" });
    }
  });

  // Generate new access code (admin only)
  app.post("/api/results", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      // Generate a more structured access code
      const testType = req.body.testType.toUpperCase().substring(0, 3);
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const checksum = (testType.charCodeAt(0) % 9) + 1; // Simple checksum
      const accessCode = `SEEK-${testType}-${random}-${checksum}`;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

      const result = await storage.createResult({
        accessCode,
        patientId: req.body.patientId,
        testType: req.body.testType,
        testDate: new Date(),
        resultData: req.body.resultData || "No additional notes",
        reportUrl: req.body.reportUrl || `https://reports.seeklab.com/${accessCode}`,
        expiresAt: expiresAt,
      });

      await createAuditLog(req, 'CREATE', 'RESULT', result.id.toString(), {
        patientId: result.patientId,
        accessCode: result.accessCode,
      });

      // Create notification for code generation
      await createNotification(
        'CODE_GENERATED',
        'New Access Code Generated',
        `New access code ${accessCode} generated for patient ${req.body.patientId}`,
        req.user.id.toString(),
        { resultId: result.id }
      );

      // Create notification for code batch expiry
      const daysUntilExpiry = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      if (daysUntilExpiry <= 7) { // Notify when code will expire within 7 days
        await createNotification(
          'CODE_EXPIRY',
          'Access Code Expiring Soon',
          `Access code ${result.accessCode} will expire in ${daysUntilExpiry} days`,
          req.user.id.toString(),
          { resultId: result.id }
        );
      }

      res.status(201).json(result);
    } catch (error) {
      console.error("Error generating code:", error);
      res.status(500).json({ message: "Failed to generate access code" });
    }
  });

  // Removed duplicate /api/results GET route since it's defined in routes.ts

  // Audit logs endpoints
  app.get("/api/audit-logs", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const logs = await storage.getAuditLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Notification endpoints
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const notifications = await storage.getNotifications(req.user.id.toString());
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      await storage.markNotificationAsRead(parseInt(req.params.id));
      res.sendStatus(200);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Helper function to create notifications
  async function createNotification(
    type: string,
    title: string,
    message: string,
    recipientId: string,
    metadata?: Record<string, unknown>
  ) {
    try {
      await storage.createNotification({
        type,
        title,
        message,
        recipientId,
        metadata,
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }

  // Helper function to create audit logs
  async function createAuditLog(req: any, action: string, entityType: string, entityId?: string, details?: Record<string, unknown>) {
    try {
      await storage.createAuditLog({
        userId: req.user.id.toString(),
        action,
        entityType,
        entityId,
        details,
        ipAddress: req.ip,
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }
}