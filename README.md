# GST Bill Maker

A modern, user-friendly application for creating and managing GST bills. Built with Next.js, Prisma, and PostgreSQL.

🌐 **Live Demo**: [https://gst-bill-v2.onrender.com/](https://gst-bill-v2.onrender.com)  
⏳ *Note: Please wait up to 50 seconds on first load as the server spins up on Render's free tier.*

![Dashboard Screenshot](public/images/dashboard.png)

## Features

- 🔐 **Secure Authentication**: User registration and login with NextAuth
- 📊 **Dashboard**: Overview of your billing activities
- 👥 **Customer Management**: Add and manage your customers
- 📝 **Item Management**: Maintain your product/service catalog
- 💰 **GST Billing**: Create professional GST bills
  - Automatic tax calculations (CGST/SGST/IGST)
  - Bill number generation
  - Print and download bills
- 📅 **Date Range Filtering**: Filter bills by date
- 🏢 **Business Profile**: Manage your company details
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with Forms plugin
- **Type Safety**: TypeScript

## Prerequisites

Before you begin, ensure you have installed:
- Node.js 20.x or later
- PostgreSQL 15 or later
- npm or yarn package manager

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/gstbill"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/AyushAggarwal1/gst-bill.git
cd gst-bill
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Database Schema

The application uses the following main models:
- **User**: Authentication and user management
- **Profile**: Business/company details
- **Customer**: Customer information
- **Item**: Product/service catalog
- **Bill**: GST bills
- **BillItem**: Items in each bill

## API Routes [Complete API Guide](API_Docs.md)

- **Authentication**
  - POST `/api/auth/register`: User registration
  - POST `/api/auth/login`: User login

- **Profile**
  - GET `/api/profile`: Get business profile
  - POST `/api/profile`: Update business profile

- **Customers**
  - GET `/api/customers`: List all customers
  - POST `/api/customers`: Create new customer
  - PUT `/api/customers/[id]`: Update customer
  - DELETE `/api/customers/[id]`: Delete customer

- **Items**
  - GET `/api/items`: List all items
  - POST `/api/items`: Create new item
  - PUT `/api/items/[id]`: Update item
  - DELETE `/api/items/[id]`: Delete item

- **Bills**
  - GET `/api/bills`: List all bills
  - POST `/api/bills`: Create new bill
  - GET `/api/bills/[id]`: Get bill details
  - DELETE `/api/bills/[id]`: Delete bill

## Development

To run the development server:
```bash
npm run dev
```

For linting:
```bash
npm run lint
```

For building:
```bash
npm run build
```

## Production Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please create an issue in the GitHub repository or contact the maintainers.
