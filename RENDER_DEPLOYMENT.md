# Deploying to Render

This guide explains how to deploy GST Bill Maker to Render and how to access authentication logs.

## Deployment Steps

### 1. Create a Render Account

Sign up at [render.com](https://render.com) if you don't already have an account.

### 2. Create a New Web Service

1. Click "New" and select "Web Service"
2. Connect your GitHub repository
3. Select the repository with your GST Bill Maker code
4. Configure the service:
   - **Name**: `gst-bill-app` (or any name you prefer)
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Select the appropriate plan (Free or Starter)

### 3. Configure Environment Variables

Add the following environment variables:
- `DATABASE_URL`: Set your database connection string (for production, consider using PostgreSQL)
- `NEXTAUTH_SECRET`: A secure random string used for authentication
- `NEXTAUTH_URL`: Your Render service URL (e.g., `https://your-app-name.onrender.com`)

### 4. Set Up Database (Optional)

For production, we recommend using Render's PostgreSQL database:
1. Create a new PostgreSQL database in Render dashboard
2. Update your `DATABASE_URL` to point to this database
3. Run migrations when deploying: add `npx prisma migrate deploy` to your build command

## Accessing Authentication Logs

### Method 1: Render Dashboard Logs

To view auth logs in real-time:
1. Go to your Render dashboard
2. Select your GST Bill application
3. Click the "Logs" tab
4. Look for log entries prefixed with `[AUTH]`

Example log entry:
```
[AUTH] 2023-05-04T12:34:56.789Z | LOGIN | user@example.com
```

### Method 2: Admin Interface

If you have admin access, you can view logs through the admin interface:
1. Log in to your GST Bill application
2. Navigate to: `/dashboard/admin/logs`
3. Use the filtering options to view specific time periods
4. Download logs in CSV or JSON format if needed

To grant admin access, add your email to the `adminEmails` array in `src/lib/renderConfig.ts`.

### Method 3: API Access

For programmatic access to logs, use the secure API endpoint:
```
GET /api/admin/logs/download?format=json&days=7
```

Query parameters:
- `format`: `json` (default) or `csv`
- `days`: Number of days of logs to retrieve (default: 7)

## Troubleshooting

If log entries are not appearing in the Render dashboard:
1. Check that log levels are set correctly in `src/lib/renderConfig.ts`
2. Ensure that `enableColorizedLogs` is enabled
3. Verify that logs are being properly captured by the application 