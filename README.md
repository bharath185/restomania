# Multi-Tenant Restaurant White-Label SaaS Platform

A multi-restaurant online ordering and dish management SaaS platform built with a Next.js web application, React Native (Expo) mobile application, NestJS backend API, PostgreSQL with Row-Level Security (RLS), and Socket.io real-time order tracking.

---

## 🚀 Quick Start (Native Execution - No Docker Needed)

The application is completely configured to run natively with zero external dependencies (Node.js + pnpm + local SQLite/PostgreSQL):

```powershell
# 1. Start NestJS API Server (Port 3001)
pnpm --filter api start:dev
# (Or in production mode: node apps/api/dist/src/main.js)

# 2. Start Next.js Frontend (Port 3000)
pnpm --filter web dev
```

### Accessing the Platform:
- **Customer Menu**: [http://localhost:3000/menu](http://localhost:3000/menu) (Switch between Spice Garden, The Burger Lab, and Zen Sushi via header switcher or `?restaurant=burgerlab`)
- **Restaurant Login**: [http://localhost:3000/auth/login](http://localhost:3000/auth/login) (Includes 1-click demo login buttons)
- **Live Kitchen Display (KDS)**: [http://localhost:3000/dashboard/kitchen](http://localhost:3000/dashboard/kitchen)
- **Table & QR Manager**: [http://localhost:3000/dashboard/tables](http://localhost:3000/dashboard/tables)
- **Super Admin Platform**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **API Swagger Documentation**: [http://localhost:3001/api/docs](http://localhost:3001/api/docs)
- **API Health Check**: [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health)

---

## 🐳 Optional Docker Deployment

If you prefer to run with Docker in production or a VPS:

```bash
docker-compose up --build -d
```

---

## 🔑 Demo Accounts & Seed Data

Run the database migration and seed script:

```bash
# Run database migrations
pnpm --filter api db:migrate

# Seed demo restaurants, categories, dishes, tables, and QR codes
pnpm --filter api db:seed
```

### Credentials & Subdomains

| Role | Email | Password | Subdomain / URL |
|---|---|---|---|
| **Super Admin** | `admin@platform.com` | `superadmin123` | `http://localhost:3000/admin` |
| **Spice Garden Owner** | `owner@spicegarden.com` | `password123` | `http://spicegarden.localhost:3000/dashboard/login` |
| **The Burger Lab Owner** | `owner@burgerlab.com` | `password123` | `http://burgerlab.localhost:3000/dashboard/login` |
| **Zen Sushi Owner** | `owner@zensushi.com` | `password123` | `http://zensushi.localhost:3000/dashboard/login` |

---

## 🏗 System Architecture

```
                                  ┌────────────────────────┐
                                  │   Nginx Reverse Proxy  │
                                  └───────────┬────────────┘
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
       ┌────────────────────────┐                          ┌────────────────────────┐
       │     apps/web (Next)    │                          │    apps/api (NestJS)   │
       └────────────────────────┘                          └───────────┬────────────┘
                                                                       │
                         ┌─────────────────────────────────────────────┼─────────────────────────────────────────────┐
                         ▼                                             ▼                                             ▼
            ┌────────────────────────┐                    ┌────────────────────────┐                    ┌────────────────────────┐
            │   PostgreSQL 16 (RLS)  │                    │      Redis (Cache/WS) │                    │      MinIO (S3 Images) │
            └────────────────────────┘                    └────────────────────────┘                    └────────────────────────┘
```

### Core Features

1. **Strict Multi-Tenancy & Isolation**:
   - Every database table includes `restaurant_id`.
   - PostgreSQL Row-Level Security (RLS) policies filter records automatically based on `app.current_tenant`.
   - NestJS middleware resolves `tenantId` strictly from host header, QR token, or authenticated JWT payload.

2. **White-Label Branding**:
   - Unique color scheme, fonts, cover images, logo, welcome messages, tax rates, and currency per restaurant.
   - Zero platform branding visible to restaurant customers.

3. **QR Table Flow & Live Kitchen Display (KDS)**:
   - Tables receive unique HMAC-SHA256 signed QR codes.
   - Scanning QR opens restaurant menu directly for that specific table.
   - Real-time order flow: `Placed` → `Accepted` → `Preparing` → `Ready` → `Served`.
   - Kitchen display automatically alerts with sound on new orders over WebSocket.

4. **Payment Abstraction**:
   - Supports Cash at Counter and Razorpay Online Payments (UPI / Cards).

---

## 🧪 Running Tests

To run unit tests and tenant isolation tests:

```bash
# Run unit tests across all packages
pnpm test

# Run tenant isolation tests in NestJS API
pnpm --filter api test
```

---

## 🛠 Tech Stack

- **Monorepo**: pnpm + Turborepo
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, React Query
- **Backend**: NestJS, TypeScript, Prisma ORM, Socket.io, BullMQ
- **Mobile**: React Native (Expo Router), TypeScript
- **Database**: PostgreSQL 16 with Row-Level Security (RLS)
- **Cache & WebSockets**: Redis
- **Storage**: MinIO (local dev) / AWS S3 (production)
