# GST Bill Management System

A comprehensive, enterprise-grade GST bill management system built with Next.js, Prisma, and PostgreSQL, designed for multi-tenant organizations with advanced security and compliance features.

## Features

### Core Business Features
- **User Authentication**: Secure login with NextAuth.js and multi-tenant support
- **Customer Management**: Add, edit, and manage customers with tenant isolation
- **Item Management**: Create and manage inventory items with HSN codes and tax rates
- **Bill Generation**: Create professional GST bills with multiple templates
- **Template System**: Dynamic template detection and selection with custom placeholders
- **Profile Management**: Business profile with logo upload via Cloudinary
- **PDF Generation**: Download bills as PDF files with high-quality rendering
- **Bulk Operations**: Generate multiple bills at once with batch processing

### Enterprise & Multi-Tenant Features
- **Multi-Tenant Architecture**: Complete tenant isolation with separate data spaces
- **Role-Based Access Control (RBAC)**: Granular permissions system with predefined roles
- **User Invitations**: Secure invitation system with role and permission assignment
- **Organization Management**: Multi-organization support with isolated workspaces
- **Tenant-Specific Data**: All data (customers, items, bills) scoped to tenant boundaries

### Security & Compliance
- **Security Scanning**: Automated Checkmarx security scans with daily scheduling
- **Password Security**: Bcrypt hashing with secure password reset via OTP
- **Email Verification**: OTP-based email verification for account creation
- **Session Management**: Secure JWT-based sessions with tenant context
- **API Security**: Comprehensive middleware with authentication and authorization
- **Data Isolation**: Complete tenant data separation with database-level constraints

### Data Management & Backup
- **Daily Data Backup**: Automated daily database backups with GitHub Actions
- **Backup Repository**: Dedicated backup repository with versioned JSON exports
- **Data Export**: Python-based data export scripts for Supabase compatibility
- **Backup Scheduling**: Cron-based automated backup scheduling (daily at 12:00 AM)
- **Backup Verification**: Automated backup validation and error handling

### Communication & Notifications
- **Email Notifications**: SMTP-based email system for password resets and verifications
- **Invitation Emails**: Automated email invitations with secure tokens
- **OTP System**: Time-based OTP for password resets and account verification
- **Email Templates**: Professional HTML email templates with branding support

### DevOps & Deployment
- **Docker Containerization**: Multi-stage Docker builds with optimized production images
- **Health Checks**: Application health monitoring with database connectivity checks
- **CI/CD Pipeline**: GitHub Actions with automated testing and deployment
- **Environment Management**: Comprehensive environment variable configuration
- **Production Optimization**: Standalone Next.js builds with external package support

### Advanced Features
- **GST Number Validation**: Integration with Master India GST verification API
- **HSN Code Search**: Built-in HSN code search functionality
- **Tax Calculation**: Automated CGST, SGST, and IGST calculations
- **Bulk Bill Generation**: Generate multiple bills simultaneously
- **Template Customization**: Dynamic template system with metadata support
- **File Upload Security**: Secure file uploads with Cloudinary integration
- **API Rate Limiting**: Built-in API protection and rate limiting
- **Error Handling**: Comprehensive error handling with detailed logging

### Monitoring & Analytics
- **Application Health**: Real-time health monitoring with system metrics
- **Database Monitoring**: Database connectivity and performance monitoring
- **Memory Usage Tracking**: Application memory usage and performance metrics
- **Uptime Monitoring**: Application uptime and availability tracking
- **Error Tracking**: Comprehensive error logging and monitoring

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM, Cloudinary
- **Database**: PostgreSQL with Supabase support
- **Authentication**: NextAuth.js with multi-tenant support
- **File Storage**: Cloudinary (for profile photos and documents)
- **PDF Generation**: jsPDF with Puppeteer for high-quality rendering
- **Email**: Nodemailer with SMTP support
- **Security**: Checkmarx integration, bcrypt, JWT
- **DevOps**: Docker, GitHub Actions, automated backups
- **Monitoring**: Health checks, performance metrics, error tracking

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Cloudinary account (for profile photo uploads)

## Advanced Features Setup

### Multi-Tenant Configuration
The application supports multiple organizations (tenants) with complete data isolation:
- Each tenant has its own users, customers, items, and bills
- Users can belong to multiple tenants with different roles
- All data queries are automatically scoped to the current tenant

### Role-Based Access Control (RBAC)
Configure user permissions with granular control:
- **ADMIN**: Full access to all features
- **USER**: Limited access based on assigned permissions
- **Permissions**: CREATE_BILLS, READ_BILLS, UPDATE_BILLS, DELETE_BILLS, CREATE_CUSTOMERS, READ_CUSTOMERS, UPDATE_CUSTOMERS, DELETE_CUSTOMERS, CREATE_ITEMS, READ_ITEMS, UPDATE_ITEMS, DELETE_ITEMS, INVITE_USERS

### Automated Backups
The system includes automated daily database backups:
- Runs daily at 12:00 AM via GitHub Actions
- Exports data to JSON format for easy restoration
- Stores backups in a dedicated GitHub repository
- Includes backup verification and error handling

### Security Scanning
Automated security scanning with Checkmarx:
- Daily security scans at 10:00 AM UTC
- Integration with CI/CD pipeline
- Comprehensive vulnerability assessment
- Automated reporting and alerting

## Deployment

### Docker Deployment

1. **Build the Docker image**:
   ```bash
   docker build -t gst-bill .
   ```

2. **Run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

3. **Set environment variables** in `docker-compose.yml` or use `.env` file

### Netlify Deployment

1. **Connect your repository** to Netlify
2. **Set environment variables** in Netlify dashboard:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your Netlify domain)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
   - `MAIL_FROM`

3. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard (same as Netlify)
3. **Deploy** - Vercel will automatically detect Next.js settings

### Production Considerations

- **Database**: Use a production PostgreSQL database (Supabase, Neon, Railway)
- **Email**: Configure production SMTP service (SendGrid, Mailgun, AWS SES)
- **Monitoring**: Set up health checks and monitoring endpoints
- **Backups**: Ensure backup repository is properly configured
- **Security**: Configure Checkmarx credentials for security scanning

## Template System

The application supports dynamic template detection. Templates are automatically discovered from the `/public/templates/` directory.

### Adding New Templates

1. Create a new HTML file in `/public/templates/`
2. Add metadata comments at the top:
   ```html
   <!-- @template-name: Your Template Name -->
   <!-- @template-description: Brief description -->
   <!-- @template-category: Category -->
   ```
3. Include required placeholders in your template
4. The template will be automatically detected and available

### Template Placeholders

- `{{COMPANY_NAME}}` - Company name
- `{{COMPANY_ADDRESS}}` - Company address
- `{{COMPANY_GST}}` - Company GST number
- `{{CUSTOMER_NAME}}` - Customer name
- `{{CUSTOMER_ADDRESS}}` - Customer address
- `{{BILL_NUMBER}}` - Invoice number
- `{{BILL_DATE}}` - Invoice date
- `{{ITEMS_TABLE}}` - Items table HTML
- `{{TOTAL}}` - Total amount
- `{{PROFILE_PHOTO}}` - Business logo/photo (optional)

## API Endpoints

### Authentication & User Management
- `POST /api/auth/register` - User registration with tenant creation
- `POST /api/auth/login` - Multi-tenant user login
- `GET /api/auth/check-profile` - Check if user has profile
- `POST /api/auth/forgot-password` - Password reset request with OTP
- `POST /api/auth/reset-password` - Password reset with OTP verification

### Profile Management
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Update user profile
- `POST /api/profile/upload-photo` - Upload profile photo to Cloudinary

### User & Role Management
- `GET /api/users` - Get users in current tenant
- `GET /api/users/[userId]` - Get specific user details
- `PUT /api/users/[userId]` - Update user roles and permissions
- `DELETE /api/users/[userId]` - Remove user from tenant

### Invitation System
- `POST /api/invitations` - Send user invitation with roles
- `GET /api/invitations` - Get pending invitations
- `POST /api/invitations/accept` - Accept invitation and join tenant
- `DELETE /api/invitations/[id]` - Cancel invitation

### Template Management
- `GET /api/templates` - Get available templates
- `PUT /api/templates/default` - Set default template

### Bill Management
- `GET /api/bills` - Get bills list (tenant-scoped)
- `POST /api/bills` - Create new bill
- `GET /api/bills/[id]` - Get specific bill
- `PUT /api/bills/[id]` - Update bill
- `DELETE /api/bills/[id]` - Delete bill
- `POST /api/bills/bulk-htmls` - Generate bulk bill HTMLs

### Customer Management
- `GET /api/customers` - Get customers (tenant-scoped)
- `POST /api/customers` - Create new customer
- `GET /api/customers/[id]` - Get specific customer
- `PUT /api/customers/[id]` - Update customer
- `DELETE /api/customers/[id]` - Delete customer

### Item Management
- `GET /api/items` - Get items (tenant-scoped)
- `POST /api/items` - Create new item
- `GET /api/items/[id]` - Get specific item
- `PUT /api/items/[id]` - Update item
- `DELETE /api/items/[id]` - Delete item

### System & Health
- `GET /api/health` - Application health check with metrics
- `GET /api/search-gst` - GST number validation
- `GET /api/search-hsn` - HSN code search

## Database Schema

The application uses a multi-tenant database design with the following key models:

### Core Models
- **Tenant**: Organizations/businesses with isolated data
- **User**: Users belonging to tenants with roles and permissions
- **UserRole**: Role assignments with granular permissions
- **Invitation**: User invitations with role and permission assignments

### Business Models
- **Profile**: Business profile information with logo
- **Customer**: Customer data scoped to tenants
- **Item**: Inventory items with HSN codes and tax rates
- **Bill**: Invoice data with tax calculations
- **BillItem**: Line items in bills

### Security Models
- **PasswordResetRequest**: Secure password reset with OTP
- **SignupVerification**: Email verification for new accounts

## Security Features

### Multi-Tenant Security
- Complete data isolation between tenants
- Tenant-scoped authentication and authorization
- Database-level constraints for data separation

### Authentication & Authorization
- JWT-based session management
- Role-based access control (RBAC)
- Permission-based feature access
- Secure password hashing with bcrypt

### Data Protection
- Input validation and sanitization
- SQL injection prevention via Prisma ORM
- XSS protection with proper encoding
- CSRF protection with secure tokens

### Monitoring & Compliance
- Automated security scanning
- Comprehensive audit logging
- Health monitoring and alerting
- Data backup and recovery

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with multi-tenant scenarios
5. Ensure security best practices are followed
6. Submit a pull request
