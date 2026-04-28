# Loan Management System (LMS)

A modern, full-stack loan management application that streamlines the entire loan lifecycle - from application to approval, disbursement, and collection. Built with cutting-edge technology to provide a seamless experience for both borrowers and loan officers.

## Tech Stack

**Backend:**
- Express.js + TypeScript for robust API development
- MongoDB for flexible data storage
- JWT authentication for secure access

**Frontend:**
- Next.js 14 with TypeScript for type-safe development  
- Tailwind CSS for beautiful, responsive UI
- Modern React patterns with component-based architecture

## Quick Start

### 1. Get Your Dependencies Ready
```bash
# Backend dependencies
cd server && npm install

# Frontend dependencies  
cd client && npm install
```

### 2. Set Up Your Environment
```bash
# Backend environment
cp server/.env.example server/.env

# Frontend environment
cp client/.env.local.example client/.env.local
```

### 3. Fire Up Your Database
Make sure MongoDB is running locally on `mongodb://localhost:27017/lms` (or update your `.env` file)

### 4. Start the Application

**Backend Server** (runs on port 5000):
```bash
cd server
npm run dev
```

**Frontend Application** (runs on port 3000):
```bash
cd client  
npm run dev
```

Visit http://localhost:3000 to see your loan management system in action!

## Test Users & Login

To explore the system, we've pre-configured test users for each role:

### Quick Seed Setup
```bash
cd server && npx ts-node src/seed.ts
```

### Login Credentials
| Role | Email | Password | What They Do |
|------|-------|----------|--------------|
| **Admin** | admin@lms.com | Admin@123 | Oversees entire system |
| **Sales** | sales@lms.com | Sales@123 | Manages leads and applications |
| **Sanction** | sanction@lms.com | Sanction@123 | Reviews and approves loans |
| **Disbursement** | disburse@lms.com | Disburse@123 | Handles fund transfers |
| **Collection** | collect@lms.com | Collect@123 | Manages payments and follow-ups |
| **Borrower** | borrower@lms.com | Borrower@123 | Applies for and manages loans |

## ⚙️ Environment Configuration

### Backend Settings (`server/.env`)
```env
PORT=5000                    # Your API server port
MONGODB_URI=mongodb://localhost:27017/lms  # Database connection
JWT_SECRET=your-super-secret-key           # Security token secret
JWT_EXPIRES_IN=7d                         # Token validity period
UPLOAD_DIR=uploads                        # File upload location
```

### Frontend Settings (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api  # Backend API endpoint
```

## Authentication & Security

The system uses JWT tokens for secure authentication:
- **Tokens** are stored in `localStorage` for API calls
- **Cookies** handle route protection via Next.js middleware
- **Role-based access** ensures users only see what they're supposed to

## Key Features

- **User Roles**: Admin, Sales, Sanction, Disbursement, Collection, Borrower
- **Loan Lifecycle**: Application → BRE Check → Approval → Disbursement → Collection
- **Document Upload**: Secure file handling for salary slips and documents
- **Real-time Updates**: Live status tracking for all loan operations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Development Notes

- Built with TypeScript for type safety
- Component-based architecture for maintainability
- Error handling with comprehensive logging
- Git-friendly structure with proper .gitignore setup

