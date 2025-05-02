# GST Bill Builder

A full-featured GST billing application that allows businesses to create, manage, and print GST-compliant invoices.

## Features

- **User Authentication**: Secure login and signup functionality
- **Customer Management**: Add and manage customer details
- **Item Management**: Maintain a database of products with HSN codes and GST percentages
- **Business Profile**: Set up your business details that appear on invoices
- **Bill Generation**: Create professional GST bills with all required tax details
- **Bill History**: View, download and print previous bills

## Technologies Used

- **Frontend**: React, Next.js, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Form Handling**: React Hook Form with Zod validation
- **PDF Generation**: jsPDF for bill printing

## Getting Started

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/gst-bill.git
   cd gst-bill
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your specific configuration.

4. Initialize the database:
   ```
   npx prisma db push
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Register a new account
2. Complete your business profile
3. Add your customers and products
4. Start creating bills!

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For any questions or support, please contact [ayushaggarwal1136@gmail.com
](mailto:ayushaggarwal1136@gmail.com).
