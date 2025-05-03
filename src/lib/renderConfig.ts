/**
 * Configuration options for Render deployment
 */

export const renderConfig = {
  // Enable colorized console logs in production
  enableColorizedLogs: true,
  
  // Admin access settings
  adminEmails: [
    "ayushaggarwal1136@gmail.com", // Replace with actual admin email
    // Add other admin emails here
  ],
  
  // Log configuration
  logging: {
    // Whether to enable database logging
    enableDbLogging: true,
    
    // Retention period for logs in days (0 = keep forever)
    logRetentionDays: 30,
    
    // Events to log (empty array means log everything)
    eventsToLog: [], 
  }
}; 