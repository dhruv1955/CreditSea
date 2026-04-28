# Loan Management System (LMS)

A full-stack loan management platform where borrowers can apply for loans and internal teams manage the entire lifecycle — from reviewing applications to disbursing funds and collecting payments. Built with Next.js, Express, TypeScript, and MongoDB.

## Tech stack

- **Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind CSS
- **Backend:** Node.js · Express.js · TypeScript
- **Database:** MongoDB · Mongoose
- **Auth:** JWT · bcrypt

---

## Getting started

### 1. Clone the repo

```bash
git clone https://github.com/dhruv1955/CreditSea.git
cd CreditSea
```

### 2. Install dependencies

Open two terminal windows — one for the server, one for the client.

**Terminal 1 — backend:**
```bash
cd server
npm install
```

**Terminal 2 — frontend:**
```bash
cd client
npm install
```

### 3. Set up environment variables

**Backend** — copy the example file and open it:
```bash
cp server/.env.example server/.env
```

Your `server/.env` should look like this:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lms
JWT_SECRET=any_long_random_string
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads/
```

**Frontend** — copy the example file:
```bash
cp client/.env.local.example client/.env.local
```

Your `client/.env.local` should look like this:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Create the test users

This seeds one account for every role so you can log in and test immediately:

```bash
cd server
npx ts-node src/seed.ts
```

### 5. Run the app

**Backend** (port 5000):
```bash
cd server
npm run dev
```

**Frontend** (port 3000) — in a separate terminal:
```bash
cd client
npm run dev
```

Then open `http://localhost:3000` in your browser.

---

## Test accounts

After running the seed script, these accounts are ready to use:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@lms.com | Admin@123 | Everything |
| Sales | sales@lms.com | Sales@123 | Lead tracking |
| Sanction | sanction@lms.com | Sanction@123 | Loan approvals |
| Disbursement | disburse@lms.com | Disburse@123 | Fund release |
| Collection | collect@lms.com | Collect@123 | Payment recording |
| Borrower | borrower@lms.com | Borrower@123 | Loan application |

---

## Demo

Video walkthrough: *Coming soon*

---

## How the loan flow works

1. Borrower signs up and fills in personal details
2. A Business Rule Engine (BRE) checks eligibility — age, salary, PAN, employment
3. Borrower uploads a salary slip and configures loan amount + tenure
4. Loan lands in the **Sanction** queue for executive review
5. Once approved, it moves to **Disbursement**
6. After funds are released, **Collection** team records payments
7. Loan auto-closes when the full repayment amount is collected

---

## Project structure

```
CreditSea-main/
├── server/
│   └── src/
│       ├── config/         # Database connection
│       ├── constants/      # Shared validators and constants
│       ├── controllers/    # Route handlers
│       ├── middleware/     # JWT auth + role checks
│       ├── models/         # Mongoose schemas (User, Loan, Payment)
│       ├── routes/         # API routes
│       ├── services/       # BRE logic and loan calculations
│       ├── seed.ts         # Creates one account per role
│       └── index.ts        # Server entry point
└── client/
    ├── app/
    │   ├── borrower/       # Multi-step borrower portal
    │   ├── dashboard/      # Executive operations dashboard
    │   ├── login/
    │   ├── signup/
    │   └── components/     # SanctionQueue, CollectionQueue, etc.
    ├── lib/
    │   ├── api.ts          # All API calls in one place
    │   ├── auth.ts         # Token storage and cookie helpers
    │   └── types.ts        # Shared TypeScript types
    └── middleware.ts       # Next.js route protection by role
```

---

## Environment variables

### `server/.env`

| Variable | What it does |
|----------|-------------|
| `PORT` | Port the API runs on (default: 5000) |
| `MONGODB_URI` | Your MongoDB connection string |
| `JWT_SECRET` | Secret used to sign tokens — make it long and random |
| `JWT_EXPIRES_IN` | How long tokens stay valid (e.g. `7d`) |
| `UPLOAD_DIR` | Where salary slip files get saved (default: `uploads/`) |

### `client/.env.local`

| Variable | What it does |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Points the frontend at the backend (default: `http://localhost:5000/api`) |