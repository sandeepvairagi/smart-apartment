# Smart Apartment & Visitor Management System

A production-quality full-stack web application for managing apartments, residents, guards, visitors, parcels, complaints, and notices — with real-time notifications, QR-based visitor entry, and an integrated AI assistant.

## 🚀 Live Demo

- **Frontend Application (Vercel)**: [https://smart-apartment-mu.vercel.app](https://smart-apartment-mu.vercel.app)
- **Backend API (Render)**: Hosted on Render Web Service
- **Database**: MongoDB Atlas

### 🔑 Demo Accounts

| Role | Email | Password | Access / Portal |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@apartment.com` | `admin123` | `/admin/dashboard` (Manage residents, guards, flats, complaints) |
| **Guard** | `guard@apartment.com` | `guard123` | `/guard/dashboard` (QR scanner, check-in/out, deliveries) |
| **Resident** | `resident_test_2026@apartment.com` | `password123` | `/resident/dashboard` (Visitor passes, complaints, notices) |

*(Or register a new resident account directly from the signup page).*

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js (Vite), Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Auth | JWT, bcrypt |
| Real-time | Socket.IO |
| QR Codes | qrcode |
| File Upload | Cloudinary |
| Email | Nodemailer |
| Deployment | Vercel (frontend), Render (backend) |

## User Roles

- **Admin** — Manage residents, guards, apartments, notices, complaints, analytics
- **Guard** — Visitor check-in/out, QR generation & scanning, visitor history
- **Resident** — Profile, visitors, complaints, notices, parcels, notifications

## Project Structure

```
smart-apartment-vms/
├── backend/
│   ├── config/         # DB, Cloudinary, env setup
│   ├── controllers/    # Request handlers (MVC - Controller)
│   ├── middleware/     # Auth, validation, error handling
│   ├── models/         # MongoDB schemas (MVC - Model)
│   ├── routes/         # API URL definitions
│   ├── services/       # Business logic (email, QR, etc.)
│   └── utils/          # Helpers (tokens, pagination)
├── frontend/
│   └── src/
│       ├── assets/     # Images, icons, fonts
│       ├── components/ # Reusable UI pieces
│       ├── context/    # Global state (Auth, Theme)
│       ├── hooks/      # Custom React hooks
│       ├── layouts/    # Page shells (sidebar, navbar)
│       ├── pages/      # Full screens per route
│       ├── services/   # Axios API calls
│       └── utils/      # Frontend helpers
├── .gitignore
└── README.md
```

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/sandeepvairagi/smart-apartment.git
cd smart-apartment

# Install dependencies
npm --prefix backend install
npm --prefix frontend install
```

### 2. Configure Environment Variables

Create `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### 3. Seed Database & Run

```bash
# Seed initial admin and guard accounts
npm run seed

# Start development servers
npm run dev:backend
npm run dev:frontend
```

## Development Status

- [x] Step 1: Project setup
- [x] Step 2: Folder structure
- [x] Step 3: Backend setup
- [x] Step 4: Database connection
- [x] Step 5: Authentication
- [x] Step 6: Frontend setup
- [x] Step 7: Resident module
- [x] Step 8: Guard module
- [x] Step 9: Admin module
- [x] Step 10: Visitor module
- [x] Step 11: Complaint module
- [x] Step 12: Parcel module
- [x] Step 13: Notice module
- [x] Step 14: QR Code integration
- [x] Step 15: Socket.IO integration
- [x] Step 16: Email integration
- [x] Step 17: Testing

## Testing

```bash
# Run all tests (backend + frontend)
npm test

# Or separately
npm run test:backend
npm run test:frontend
```

Backend tests use MongoDB database `smart-apartment-vms-test` (never your main DB).
Make sure local MongoDB is running before `npm run test:backend`.

Academic / educational project.
