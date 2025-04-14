import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

// Store for CSRF tokens with expiration
const csrfTokens = new Map<string, { token: string, expires: number }>();

// Generate a secure random CSRF token
function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

// Middleware to set CSRF token in cookie and request
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF check for GET, HEAD, OPTIONS requests (they should be safe)
  const safeMethod = /^(GET|HEAD|OPTIONS)$/i.test(req.method);
  
  if (safeMethod) {
    // For safe methods, just ensure there's a valid token for the session
    if (req.session && req.session.id) {
      // Generate a token if one doesn't exist yet
      if (!csrfTokens.has(req.session.id)) {
        const token = generateCSRFToken();
        csrfTokens.set(req.session.id, {
          token,
          expires: Date.now() + (4 * 60 * 60 * 1000) // 4 hours expiry
        });
        
        // Set token in cookie - not HttpOnly so JavaScript can read it
        res.cookie('XSRF-TOKEN', token, {
          httpOnly: false, // Accessible to JavaScript so it can be included in headers
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 4 * 60 * 60 * 1000 // 4 hours
        });
      } else {
        // Check if token is expired, regenerate if needed
        const tokenData = csrfTokens.get(req.session.id)!;
        if (Date.now() > tokenData.expires) {
          const token = generateCSRFToken();
          csrfTokens.set(req.session.id, {
            token,
            expires: Date.now() + (4 * 60 * 60 * 1000) // 4 hours expiry
          });
          
          // Set refreshed token
          res.cookie('XSRF-TOKEN', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 4 * 60 * 60 * 1000 // 4 hours
          });
        } else {
          // Set existing token
          res.cookie('XSRF-TOKEN', tokenData.token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 4 * 60 * 60 * 1000 // 4 hours
          });
        }
      }
    }
    return next();
  }
  
  // For unsafe methods (POST, PUT, DELETE, etc.) validate the token
  if (req.session && req.session.id) {
    const tokenData = csrfTokens.get(req.session.id);
    
    if (!tokenData) {
      return res.status(403).json({
        error: 'CSRF token missing. Please refresh the page and try again.'
      });
    }
    
    // Check if token is expired
    if (Date.now() > tokenData.expires) {
      csrfTokens.delete(req.session.id);
      return res.status(403).json({
        error: 'CSRF token expired. Please refresh the page and try again.'
      });
    }
    
    // Get token from request headers or body
    const csrfToken = 
      (req.headers['x-csrf-token'] as string) || 
      (req.headers['x-xsrf-token'] as string) || 
      (req.body && req.body._csrf);
    
    // Validate token
    if (!csrfToken || csrfToken !== tokenData.token) {
      console.warn('CSRF token validation failed', {
        sessionId: req.session.id,
        expectedToken: tokenData.token,
        receivedToken: csrfToken,
        ipAddress: req.ip || req.socket.remoteAddress,
        url: req.originalUrl
      });
      
      return res.status(403).json({
        error: 'Invalid CSRF token. Please refresh the page and try again.'
      });
    }
    
    // Valid token, regenerate for one-time use
    const newToken = generateCSRFToken();
    csrfTokens.set(req.session.id, {
      token: newToken,
      expires: Date.now() + (4 * 60 * 60 * 1000) // 4 hours expiry
    });
    
    // Set refreshed token
    res.cookie('XSRF-TOKEN', newToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 4 * 60 * 60 * 1000 // 4 hours
    });
  } else {
    return res.status(403).json({
      error: 'No valid session found. Please login again.'
    });
  }
  
  next();
}

// Clean up expired CSRF tokens periodically
setInterval(() => {
  const now = Date.now();
  // Convert entries to array before iterating to avoid TypeScript error
  Array.from(csrfTokens.entries()).forEach(([sessionId, tokenData]) => {
    if (now > tokenData.expires) {
      csrfTokens.delete(sessionId);
    }
  });
}, 60 * 60 * 1000); // Run every hour

// Middleware that just provides a CSRF token but doesn't validate
// Use this for routes that need the token but don't need validation
export function provideCSRFToken(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.id) {
    // Generate a token if one doesn't exist yet
    if (!csrfTokens.has(req.session.id)) {
      const token = generateCSRFToken();
      csrfTokens.set(req.session.id, {
        token,
        expires: Date.now() + (4 * 60 * 60 * 1000) // 4 hours expiry
      });
      
      // Set token in cookie
      res.cookie('XSRF-TOKEN', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 4 * 60 * 60 * 1000 // 4 hours
      });
    } else {
      // Use existing token
      const tokenData = csrfTokens.get(req.session.id)!;
      
      // Check if token is expired, regenerate if needed
      if (Date.now() > tokenData.expires) {
        const token = generateCSRFToken();
        csrfTokens.set(req.session.id, {
          token,
          expires: Date.now() + (4 * 60 * 60 * 1000) // 4 hours expiry
        });
        
        // Set refreshed token
        res.cookie('XSRF-TOKEN', token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 4 * 60 * 60 * 1000 // 4 hours
        });
      } else {
        // Set existing token
        res.cookie('XSRF-TOKEN', tokenData.token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 4 * 60 * 60 * 1000 // 4 hours
        });
      }
    }
  }
  
  next();
}