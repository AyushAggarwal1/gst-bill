import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';
import { renderConfig } from './renderConfig';

// Environment check
const isProd = process.env.NODE_ENV === 'production';

// Ensure logs directory exists in development
const LOG_DIR = path.join(process.cwd(), 'logs');
if (!isProd && !fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_FILE = path.join(LOG_DIR, 'auth.log');

enum LogEvent {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED'
}

// Add colors for console logging
const logColors = {
  LOGIN: '\x1b[32m', // Green
  LOGOUT: '\x1b[36m', // Cyan
  LOGIN_FAILED: '\x1b[31m', // Red
  RESET: '\x1b[0m'  // Reset
};

/**
 * Enhanced logging function that handles both development and production environments
 */
export const logAuthEvent = async (email: string, event: LogEvent, details?: string) => {
  const timestamp = new Date().toISOString();
  
  try {
    // 1. Always log to console (visible in Render logs)
    const colorCode = logColors[event] || logColors.RESET;
    console.log(`${colorCode}[AUTH] ${timestamp} | ${event} | ${email}${details ? ` | ${details}` : ''}${logColors.RESET}`);
    
    // 2. In development, log to file
    if (!isProd) {
      const logEntry = `${timestamp} | ${event} | ${email}${details ? ` | ${details}` : ''}\n`;
      fs.appendFileSync(LOG_FILE, logEntry, { encoding: 'utf8' });
    }
    
    // 3. In both environments, log to database if available and enabled
    if (renderConfig.logging.enableDbLogging && prisma.authLog) {
      try {
        await prisma.authLog.create({
          data: {
            timestamp: new Date(timestamp),
            event,
            email,
            details: details || null
          }
        });
      } catch (dbError) {
        // Silently handle database errors - logging should not break authentication
        console.error('Database logging error:', dbError);
      }
    }
  } catch (error) {
    console.error('Failed to log auth event:', error);
  }
};

export { LogEvent }; 