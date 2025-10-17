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

### Communication & Notifications
- **Email Notifications**: SMTP-based email system for password resets and verifications
- **Invitation Emails**: Automated email invitations with secure tokens
- **OTP System**: Time-based OTP for password resets and account verification
- **Email Templates**: Professional HTML email templates with branding support

### Advanced Features
- **GST Number Validation**: Integration with Master India GST verification API
- **HSN Code Search**: Built-in HSN code search functionality
- **Tax Calculation**: Automated CGST, SGST, and IGST calculations
- **Bulk Bill Generation**: Generate multiple bills simultaneously
- **Template Customization**: Dynamic template system with metadata support
- **File Upload Security**: Secure file uploads with Cloudinary integration
- **API Rate Limiting**: Built-in API protection and rate limiting

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with multi-tenant scenarios
5. Ensure security best practices are followed
6. Submit a pull request
