# GST Bill Management System

A comprehensive GST bill management system built with Next.js, Prisma, and PostgreSQL.

## Features

- **User Authentication**: Secure login with NextAuth.js
- **Customer Management**: Add, edit, and manage customers
- **Item Management**: Create and manage inventory items
- **Bill Generation**: Create professional GST bills with multiple templates
- **Template System**: Dynamic template detection and selection
- **Profile Management**: Business profile with logo upload
- **PDF Generation**: Download bills as PDF files
- **Bulk Operations**: Generate multiple bills at once

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **File Storage**: Cloudinary (for profile photos)
- **PDF Generation**: jsPDF

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Cloudinary account (for profile photo uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gst-bill
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   
   # NextAuth
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Cloudinary (for profile photo uploads)
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   ```

4. **Set up Cloudinary**
   - Create a free account at [Cloudinary](https://cloudinary.com/)
   - Get your cloud name, API key, and API secret from the dashboard
   - Add them to your environment variables

5. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment

### Netlify Deployment

1. **Connect your repository** to Netlify
2. **Set environment variables** in Netlify dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your Netlify domain)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

3. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`

### Vercel Deployment

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically detect Next.js settings

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

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/check-profile` - Check if user has profile

### Profile Management
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Update user profile
- `POST /api/profile/upload-photo` - Upload profile photo

### Template Management
- `GET /api/templates` - Get available templates
- `PUT /api/templates/default` - Set default template

### Bill Management
- `GET /api/bills` - Get bills list
- `POST /api/bills` - Create new bill
- `GET /api/bills/[id]` - Get specific bill
- `POST /api/bills/bulk-htmls` - Generate bulk bill HTMLs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
