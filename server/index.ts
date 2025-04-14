import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { provideCSRFToken } from "./csrf";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at:', uploadsDir);
}

const app = express();
app.use(express.json({ limit: '1mb' })); // Limit request size
app.use(express.urlencoded({ extended: false }));

// Enhanced security headers middleware
app.use((req, res, next) => {
  // Add comprehensive security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Content Security Policy balanced for security and compatibility with React development
  // Use development-friendly policy in dev mode, more strict in production
  const isProd = process.env.NODE_ENV === 'production';
  
  // Choose appropriate CSP directives based on environment
  const cspDirectives = isProd ? [
    // Production: More restrictive
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Allow eval for optimized builds
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "frame-src 'self'",
    "media-src 'self'",
    "form-action 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    "block-all-mixed-content"
  ] : [
    // Development: More permissive for hot-reloading and debugging tools
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for React dev mode
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' ws:", // Allow WebSocket for HMR
    "object-src 'none'",
    "frame-src 'self'",
    "media-src 'self'",
    "form-action 'self'",
    "base-uri 'self'"
    // Omit upgrade-insecure-requests and block-all-mixed-content in dev for local testing
  ];
  
  res.setHeader('Content-Security-Policy', cspDirectives.join('; '));
  
  // Control referrer information sent in requests
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Restrict browser features
  res.setHeader('Permissions-Policy', [
    'camera=()',              // No camera access
    'microphone=()',          // No microphone access
    'geolocation=()',         // No location access
    'payment=()',             // No payment API
    'usb=()',                 // No USB API
    'battery=()',             // No battery info
    'accelerometer=()',       // No motion sensors
    'gyroscope=()',           // No motion sensors
    'magnetometer=()',        // No motion sensors
    'ambient-light-sensor=()', // No light sensor
    'display-capture=()',     // No screen capture
    'midi=()'                 // No MIDI access
  ].join(', '));
  
  // Set a cache control policy by default (can be overridden by specific routes)
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate');
  
  // Don't expose information about the server
  res.removeHeader('X-Powered-By');
  
  // Add Cross-Origin-Resource-Policy header to prevent resource theft
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  
  // Add Cross-Origin-Opener-Policy to prevent window opener attacks
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  
  // Add Cross-Origin-Embedder-Policy to prevent resource sharing vulnerabilities
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  
  next();
});

// Serve static files from the uploads directory with minimum caching for better updates
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '1m',         // Cache for just 1 minute for more frequent updates 
  fallthrough: false,   // Return 404 for nonexistent files
  etag: true,           // Enable ETag for efficient caching
  lastModified: true,   // Enable Last-Modified header
  setHeaders: (res, path) => {
    console.log(`Serving static file: ${path}`);
    // Add headers for proper cache control
    res.setHeader('X-File-Path', path);
    res.setHeader('X-Timestamp', Date.now().toString());
    res.setHeader('Cache-Control', 'public, max-age=60, must-revalidate'); // 1 minute, must revalidate
    res.setHeader('Vary', 'Accept-Encoding');
    
    // Add CORS headers to ensure images can be loaded everywhere
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  }
}));

// Add request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    // Error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      console.error('Server error:', err);
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    });

    // Setup static file serving or Vite middleware
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start server
    const port = 5000;
    server.listen(port, "0.0.0.0", () => {
      log(`Server running at http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();