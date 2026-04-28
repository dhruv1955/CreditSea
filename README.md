# Loan Management System (LMS)

Monorepo with:
- `server/` - Express.js + TypeScript + MongoDB backend
- `client/` - Next.js 14 + TypeScript + Tailwind frontend

## Setup

1. Install dependencies:
   - `cd server && npm install`
   - `cd client && npm install`
2. Configure environment variables:
   - Copy `server/.env.example` to `server/.env`
   - Copy `client/.env.local.example` to `client/.env.local`
3. Start MongoDB locally (`mongodb://localhost:27017/lms` by default).

## Run

- Backend dev server:
  - `cd server`
  - `npm run dev`

- Frontend dev server:
  - `cd client`
  - `npm run dev`

## Seed users

Run:

`cd server && npx ts-node src/seed.ts`

Seed credentials:
- `admin@lms.com / Admin@123` -> `admin`
- `sales@lms.com / Sales@123` -> `sales`
- `sanction@lms.com / Sanction@123` -> `sanction`
- `disburse@lms.com / Disburse@123` -> `disbursement`
- `collect@lms.com / Collect@123` -> `collection`
- `borrower@lms.com / Borrower@123` -> `borrower`

## Login Credentials

| Role         | Email            | Password     |
|--------------|------------------|--------------|
| Admin        | admin@lms.com    | Admin@123    |
| Sales        | sales@lms.com    | Sales@123    |
| Sanction     | sanction@lms.com | Sanction@123 |
| Disbursement | disburse@lms.com | Disburse@123 |
| Collection   | collect@lms.com  | Collect@123  |
| Borrower     | borrower@lms.com | Borrower@123 |

## Environment variables

### `server/.env`
- `PORT` - API server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration window
- `UPLOAD_DIR` - local file upload directory

### `client/.env.local`
- `NEXT_PUBLIC_API_URL` - backend API base URL (e.g. `http://localhost:5000/api`)

## Auth storage

Frontend stores token in:
- `localStorage` (for axios interceptor)
- browser cookies (`token`, `role`) for Next.js middleware route protection
