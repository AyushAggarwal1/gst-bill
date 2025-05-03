# Authentication Logging System Documentation

## Overview

This document explains how authentication logs are managed in both development and production (Render) environments for the GST Bill application.

## Log Storage Options

The system uses multiple methods to ensure logs are accessible in all environments:

1. **Console Logs** (both environments)
   - All authentication events are logged to the console
   - Logs are color-coded for improved readability (green for logins, red for failures, etc.)
   - These appear in Render dashboard's Logs tab

2. **File System Logs** (development only)
   - In development, logs are written to `logs/auth.log`
   - Simple line-based format: `TIMESTAMP | EVENT | EMAIL | DETAILS`

3. **Database Logs** (both environments)
   - All auth events are saved in the `AuthLog` table in the database
   - This provides persistence and ability to query logs

## Accessing Logs in Render

### Method 1: Render Dashboard

1. Go to your Render dashboard
2. Select your GST Bill application 
3. Click the "Logs" tab
4. Look for entries with the `[AUTH]` prefix

### Method 2: Admin API Endpoint

We provide a secure API endpoint to access and download logs. This endpoint supports different formats and filtering.

```
GET /api/admin/logs/download
```

Query parameters:
- `format`: `json` (default) or `csv`
- `days`: Number of days to include (default: 7)

Example:
```
/api/admin/logs/download?format=csv&days=30
```

### Method 3: Admin UI

An admin UI is available at `/dashboard/admin/logs` for authorized users only.

This interface provides:
- Filtering by time period
- Download options (CSV/JSON)
- Visual display of logs

## Configuration

Log settings are managed through `src/lib/renderConfig.ts`:

```typescript
export const renderConfig = {
  // Enable colorized console logs in production
  enableColorizedLogs: true,
  
  // Admin access settings
  adminEmails: [
    "admin@example.com", // Replace with actual admin email
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
```

## Security Considerations

1. **Admin Access**: Only users with email addresses listed in `adminEmails` can access logs
2. **No Sensitive Data**: Passwords are never logged, only authentication results
3. **Database Protection**: Logs are separated from user data for additional security

## Log Events

The system tracks three types of events:

1. `LOGIN`: Successful login
2. `LOGOUT`: User logout
3. `LOGIN_FAILED`: Failed login attempt (with reason)

## Implementation Notes

- Authentication logs don't affect application performance
- Log storage in the database allows for future analysis
- The system can be extended to log additional authentication events 