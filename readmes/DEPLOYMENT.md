# Deployment Guide for Netlify

This guide will help you deploy the GST Bill Management System to Netlify with proper cloud storage configuration.

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **Cloudinary Account**: Sign up at [cloudinary.com](https://cloudinary.com) (free tier available)
3. **PostgreSQL Database**: Use a cloud database service like:
   - [Supabase](https://supabase.com) (recommended)
   - [Neon](https://neon.tech)
   - [Railway](https://railway.app)

## Step 1: Set Up Cloudinary

1. **Create Cloudinary Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for a free account
   - Verify your email

2. **Get Your Credentials**
   - Log into your Cloudinary dashboard
   - Go to **Settings** → **Access Keys**
   - Copy your:
     - **Cloud Name**
     - **API Key**
     - **API Secret**

## Step 2: Set Up Database

### Option A: Supabase (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for setup to complete

2. **Get Database URL**
   - Go to **Settings** → **Database**
   - Copy the **Connection string** (URI format)

### Option B: Other PostgreSQL Providers

Follow your provider's documentation to get the connection string.

## Step 3: Deploy to Netlify

### Method 1: Git Integration (Recommended)

1. **Connect Repository**
   - Log into Netlify
   - Click **"New site from Git"**
   - Connect your GitHub/GitLab/Bitbucket repository
   - Select the repository containing your code

2. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

3. **Set Environment Variables**
   In the Netlify dashboard, go to **Site settings** → **Environment variables** and add:

   ```env
   # Database
   DATABASE_URL=postgresql://username:password@host:port/database
   
   # NextAuth
   NEXTAUTH_SECRET=your-super-secret-key-here
   NEXTAUTH_URL=https://your-site-name.netlify.app
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Deploy**
   - Click **"Deploy site"**
   - Wait for the build to complete

### Method 2: Manual Upload

1. **Build Locally**
   ```bash
   npm run build
   ```

2. **Upload to Netlify**
   - Drag and drop the `.next` folder to Netlify
   - Set environment variables as above

## Step 4: Database Migration

After deployment, you need to run database migrations:

1. **Using Netlify Functions** (if you have access to serverless functions)
2. **Using Database Provider's Console** (recommended)
   - For Supabase: Use the SQL editor
   - For other providers: Use their migration tools

### Manual Migration (Supabase Example)

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL:

```sql
-- Create Profile table with profilePhoto column
CREATE TABLE IF NOT EXISTS "Profile" (
    "id" TEXT NOT NULL,
    "firmName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "gstNo" TEXT NOT NULL,
    "phoneNo" TEXT,
    "bankDetails" TEXT,
    "profilePhoto" TEXT,
    "defaultTemplate" TEXT DEFAULT 'billFormat.html',
    "userId" TEXT NOT NULL,
    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "Profile_userId_key" ON "Profile"("userId");

-- Add foreign key constraint
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

## Step 5: Verify Deployment

1. **Test the Application**
   - Visit your Netlify URL
   - Register a new account
   - Test profile photo upload
   - Create a test bill

2. **Check Cloudinary**
   - Log into your Cloudinary dashboard
   - Go to **Media Library**
   - Verify that uploaded photos appear in the `gst-bill-profiles` folder

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | `your-super-secret-key` |
| `NEXTAUTH_URL` | Your Netlify domain | `https://your-site.netlify.app` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | `mycloud` |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | `123456789012345` |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | `abcdefghijklmnop` |

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check that all dependencies are in `package.json`
   - Verify Node.js version (use 18+)
   - Check build logs in Netlify dashboard

2. **Database Connection Errors**
   - Verify `DATABASE_URL` is correct
   - Check if database is accessible from Netlify
   - Ensure database migrations have been run

3. **Photo Upload Fails**
   - Verify Cloudinary credentials
   - Check if Cloudinary account is active
   - Ensure environment variables are set correctly

4. **Authentication Issues**
   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches your domain
   - Ensure database has User table

### Getting Help

- Check Netlify build logs for detailed error messages
- Verify all environment variables are set correctly
- Test locally with the same environment variables
- Check Cloudinary dashboard for upload errors

## Cost Considerations

### Free Tier Limits

- **Netlify**: 100GB bandwidth/month, 300 build minutes/month
- **Cloudinary**: 25GB storage, 25GB bandwidth/month
- **Supabase**: 500MB database, 2GB bandwidth/month

### Scaling Up

If you exceed free limits:
- Upgrade to paid plans as needed
- Consider alternative providers
- Optimize image uploads and database queries

## Security Best Practices

1. **Environment Variables**
   - Never commit secrets to Git
   - Use strong, unique secrets
   - Rotate secrets regularly

2. **Database Security**
   - Use connection pooling
   - Enable SSL connections
   - Restrict database access

3. **File Upload Security**
   - Validate file types and sizes
   - Use secure URLs for uploaded files
   - Implement proper access controls
