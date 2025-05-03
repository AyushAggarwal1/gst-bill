import fs from 'fs';
import path from 'path';

// Ensure logs directory exists
const LOG_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const AUTH_LOG_FILE = path.join(LOG_DIR, 'auth.log');

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface AuthLogEntry {
  timestamp: string;
  email: string;
  action: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'REGISTRATION' | 'LOGOUT';
  ipAddress?: string;
  userAgent?: string;
  level: LogLevel;
  message: string;
}

export const logAuthEvent = async (entry: Omit<AuthLogEntry, 'timestamp'>) => {
  const logEntry: AuthLogEntry = {
    ...entry,
    timestamp: new Date().toISOString(),
  };

  // Format log entry as JSON with newline
  const logLine = JSON.stringify(logEntry) + '\n';

  try {
    // Append to log file
    fs.appendFileSync(AUTH_LOG_FILE, logLine);
    return true;
  } catch (error) {
    console.error('Failed to write to auth log:', error);
    return false;
  }
};

export const getAuthLogs = (limit = 100): AuthLogEntry[] => {
  try {
    if (!fs.existsSync(AUTH_LOG_FILE)) {
      return [];
    }

    const fileContent = fs.readFileSync(AUTH_LOG_FILE, 'utf8');
    const lines = fileContent.split('\n').filter(Boolean);
    
    // Get the last 'limit' lines
    const limitedLines = lines.slice(-limit);
    
    // Parse each line as JSON
    return limitedLines.map(line => JSON.parse(line));
  } catch (error) {
    console.error('Failed to read auth logs:', error);
    return [];
  }
}; 