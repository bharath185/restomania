# PLAN.md — Multi-Restaurant White-Label SaaS
### Version 1.0 | Status: AWAITING APPROVAL

---

## TABLE OF CONTENTS
1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Tech Stack with Justifications](#3-tech-stack-with-justifications)
4. [Monorepo Folder Structure](#4-monorepo-folder-structure)
5. [Database Schema](#5-database-schema)
6. [Tenancy & Isolation Strategy](#6-tenancy--isolation-strategy)
7. [White-Label Strategy](#7-white-label-strategy)
8. [API Design](#8-api-design)
9. [Screen List — Web App](#9-screen-list--web-app)
10. [Screen List — Mobile App](#10-screen-list--mobile-app)
11. [QR Flow Architecture](#11-qr-flow-architecture)
12. [Real-Time Architecture](#12-real-time-architecture)
13. [Auth Architecture](#13-auth-architecture)
14. [Onboarding Automation](#14-onboarding-automation)
15. [Payment Abstraction Layer](#15-payment-abstraction-layer)
16. [Storage Strategy](#16-storage-strategy)
17. [Milestones & Delivery Plan](#17-milestones--delivery-plan)
18. [Testing Strategy](#18-testing-strategy)
19. [Risks & Mitigations](#19-risks--mitigations)
20. [Deployment Architecture](#20-deployment-architecture)

---

## 1. Executive Summary

A **multi-tenant SaaS platform** where each restaurant tenant gets a fully white-labeled experience — its own subdomain (or custom domain), its own branding, its own login URL, and zero visibility of the shared infrastructure. The platform serves four distinct roles: **Super Admin**, **Restaurant Owner/Manager**, **Kitchen/Staff**, and **Customer**.

The system is built as a **pnpm + Turborepo monorepo** with three applications (`web`, `mobile`, `api`) and shared packages. Data isolation is enforced at two layers: **PostgreSQL Row-Level Security (RLS)** and **server-side tenant resolution** — the client can never send a `restaurant_id` that the server trusts directly.

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────────────┐    ┌─────────────────────────────┐   │
│  │  Next.js Web App     │    │  Expo React Native App      │   │
│  │  (App Router + PWA)  │    │  (Customer + QR Scanner)    │   │
│  │  restaurant.plat.com │    │  Deep Links / Universal Links│   │
│  └──────────┬───────────┘    └──────────────┬──────────────┘   │
└─────────────┼────────────────────────────────┼──────────────────┘
              │ HTTPS                          │ HTTPS
┌─────────────▼────────────────────────────────▼──────────────────┐
│                     GATEWAY / CDN LAYER                          │
│   Nginx Reverse Proxy  ─── Subdomain/Domain → Tenant Resolver    │
│   (+ rate limiting, SSL termination, static assets via CDN)      │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                      API LAYER (NestJS)                          │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ REST API   │  │ WebSocket    │  │ Bull Queue Workers        │ │
│  │ (OpenAPI)  │  │ (Orders RT)  │  │ (emails, SMS, PDF gen)   │ │
│  └────────────┘  └──────────────┘  └──────────────────────────┘ │
└───────────┬──────────────────────────────────────────────────────┘
            │
┌───────────▼────────────────────────────────────────────────────┐
│                     DATA / INFRA LAYER                          │
│  ┌─────────────┐  ┌──────────┐  ┌───────────┐  ┌───────────┐  │
│  │  PostgreSQL │  │  Redis   │  │  MinIO    │  │  SMTP /   │  │
│  │  + RLS      │  │  Cache/  │  │  (S3-     │  │  Twilio   │  │
│  │  + Prisma   │  │  Queue   │  │  compat)  │  │  (comm)   │  │
│  └─────────────┘  └──────────┘  └───────────┘  └───────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Tenant Resolution Flow

```
Incoming Request
      │
      ▼
Extract host header (e.g., pizzahut.platform.com OR order.pizzahut.com)
      │
      ▼
Look up restaurants table WHERE subdomain = 'pizzahut' OR custom_domain = 'order.pizzahut.com'
      │
      ├─ Found → inject tenant context into request scope → proceed
      └─ Not Found → 404 "Restaurant not found"
```

---

## 3. Tech Stack with Justifications

| Layer | Technology | Justification |
|---|---|---|
| **Monorepo** | pnpm + Turborepo | Efficient shared packages, parallel task running, caching |
| **Web Frontend** | Next.js 14 (App Router) + TypeScript | SSR for SEO on menu pages, ISR for menu caching, PWA support, App Router for layout nesting (per-tenant theme provider) |
| **Mobile** | Expo (React Native) + TypeScript | Single codebase for iOS+Android, OTA updates, deep link support, EAS Build for per-restaurant branded builds |
| **Backend** | NestJS + TypeScript | Structured modules, Guards (auth/tenant), Interceptors, dependency injection, great WebSocket support, OpenAPI decorators |
| **ORM** | Prisma | Type-safe queries, migrations, multi-schema support, RLS compatible |
| **Database** | PostgreSQL 16 | RLS support, JSONB for branding config, mature, reliable |
| **Cache/Queue** | Redis + BullMQ | Session cache, menu cache, job queues for emails/PDFs, pub/sub for WebSockets |
| **Real-time** | Socket.io (WebSocket) over NestJS | Kitchen display, live order status; falls back to polling on weak connections |
| **Auth** | JWT (access) + Refresh tokens + httpOnly cookies | Stateless, secure; refresh token rotation; role-based |
| **Storage** | MinIO (local) / AWS S3 (prod) | S3-compatible, self-hostable for local dev |
| **Email** | Nodemailer + SMTP / Resend | Branded transactional emails |
| **PDF** | Puppeteer (headless Chrome) | QR card PDFs with branding |
| **QR** | `qrcode` npm package + HMAC-signed tokens | Secure table tokens |
| **Payments** | Razorpay (primary) + cash abstraction | Abstraction layer allows adding Stripe later |
| **Containerization** | Docker + docker-compose | One-command local startup |
| **Reverse Proxy** | Nginx | Subdomain routing, SSL, rate limiting |
| **Linting** | ESLint + Prettier + TypeScript strict | Code quality |
| **Testing** | Jest + Supertest + Playwright | Unit, integration, E2E |

---

## 4. Monorepo Folder Structure

```
saas_restaurant/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── apps/
│   ├── api/                          # NestJS Backend
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/
│   │   │   │   ├── decorators/       # @CurrentTenant, @CurrentUser, @Roles
│   │   │   │   ├── filters/          # Global exception filter
│   │   │   │   ├── guards/           # JwtAuthGuard, TenantGuard, RolesGuard
│   │   │   │   ├── interceptors/     # TenantContextInterceptor, LoggingInterceptor
│   │   │   │   ├── middleware/       # TenantResolutionMiddleware
│   │   │   │   └── pipes/            # ValidationPipe
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # Login, register, refresh, reset
│   │   │   │   ├── tenant/           # Restaurant CRUD (super-admin)
│   │   │   │   ├── menu/             # Categories + dishes
│   │   │   │   ├── orders/           # Order lifecycle
│   │   │   │   ├── tables/           # Table + QR management
│   │   │   │   ├── kitchen/          # Kitchen display WebSocket gateway
│   │   │   │   ├── customers/        # Customer profile + order history
│   │   │   │   ├── payments/         # Payment abstraction
│   │   │   │   ├── analytics/        # Reports + dashboard stats
│   │   │   │   ├── staff/            # Staff roles + invites
│   │   │   │   ├── coupons/          # Offers and discounts
│   │   │   │   ├── notifications/    # Email + SMS + push
│   │   │   │   ├── storage/          # S3-compatible upload
│   │   │   │   ├── pdf/              # QR card + invoice PDF
│   │   │   │   └── super-admin/      # Platform-level management
│   │   │   └── prisma/               # PrismaService + RLS context
│   │   ├── test/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── web/                          # Next.js Web App
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (super-admin)/    # Super admin routes
│   │   │   │   ├── (dashboard)/      # Owner/manager/staff routes
│   │   │   │   │   ├── layout.tsx    # Injects restaurant theme
│   │   │   │   │   ├── menu/
│   │   │   │   │   ├── orders/
│   │   │   │   │   ├── tables/
│   │   │   │   │   ├── analytics/
│   │   │   │   │   ├── staff/
│   │   │   │   │   ├── settings/
│   │   │   │   │   └── kitchen/
│   │   │   │   ├── (customer)/       # Customer-facing menu + ordering
│   │   │   │   │   ├── layout.tsx    # Restaurant brand theme
│   │   │   │   │   ├── menu/
│   │   │   │   │   ├── cart/
│   │   │   │   │   ├── order/[id]/
│   │   │   │   │   └── track/[id]/
│   │   │   │   └── api/              # Next.js route handlers (thin proxy)
│   │   │   ├── components/
│   │   │   │   ├── ui/               # Shadcn/ui base components
│   │   │   │   ├── restaurant/       # Tenant-aware branded components
│   │   │   │   ├── menu/
│   │   │   │   ├── orders/
│   │   │   │   └── kitchen/
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts
│   │   │   │   ├── tenant.ts         # Theme/branding helpers
│   │   │   │   └── auth.ts
│   │   │   └── providers/
│   │   │       ├── ThemeProvider.tsx  # CSS variables from branding config
│   │   │       └── QueryProvider.tsx
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── mobile/                       # Expo React Native App
│       ├── src/
│       │   ├── app/                  # Expo Router file-based routing
│       │   │   ├── (auth)/
│       │   │   ├── (customer)/
│       │   │   │   ├── restaurant/[slug]/
│       │   │   │   │   ├── menu/
│       │   │   │   │   ├── cart/
│       │   │   │   │   ├── order/[id]/
│       │   │   │   │   └── track/[id]/
│       │   │   │   └── scan/         # QR scanner screen
│       │   │   └── (staff)/          # Staff mobile view
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── store/                # Zustand
│       │   └── lib/
│       ├── app.json
│       └── package.json
│
├── packages/
│   ├── shared/                       # Shared types, utils, constants
│   │   ├── src/
│   │   │   ├── types/                # DTOs, enums, API response types
│   │   │   ├── constants/            # Order statuses, roles, etc.
│   │   │   ├── validators/           # Zod schemas
│   │   │   └── utils/               # Date helpers, formatters, currency
│   │   └── package.json
│   ├── ui/                           # Shared React component library
│   │   └── package.json
│   └── config/                       # Shared ESLint, TypeScript, Tailwind configs
│       └── package.json
│
├── infra/
│   ├── nginx/
│   │   └── nginx.conf                # Wildcard subdomain + custom domain routing
│   ├── docker/
│   │   └── postgres/
│   │       └── init.sql              # RLS policies
│   └── scripts/
│       ├── seed.ts                   # 2-3 demo restaurants
│       └── generate-qr.ts
│
├── docker-compose.yml
├── docker-compose.prod.yml
├── turbo.json
├── pnpm-workspace.yaml
├── .env.example
├── README.md
├── PLAN.md
├── DECISIONS.md
└── BLOCKERS.md
```

---

## 5. Database Schema

### Core Design Principles
- Every tenant table has `restaurant_id UUID NOT NULL` with a FK to `restaurants`.
- RLS policies enforce `restaurant_id = current_setting('app.current_tenant')::uuid`.
- Soft deletes via `deleted_at TIMESTAMP` on mutable records.
- JSONB for flexible branding and config data.

### Entity Relationship Diagram

```
restaurants (tenant root)
    │
    ├── restaurant_branding (1:1)
    ├── restaurant_domains (1:N)
    ├── users (N:M via user_restaurant_roles)
    ├── restaurant_tables (1:N)
    │     └── qr_tokens (1:N)
    ├── menu_categories (1:N)
    │     └── menu_items (1:N)
    │           ├── item_variants (1:N)
    │           ├── item_addons (1:N)
    │           └── item_images (1:N)
    ├── orders (1:N)
    │     ├── order_items (1:N)
    │     │     ├── order_item_variants (1:N)
    │     │     └── order_item_addons (1:N)
    │     └── payments (1:N)
    ├── coupons (1:N)
    ├── staff_invites (1:N)
    ├── audit_logs (1:N)
    └── subscriptions (1:N)
```

### Full Schema

```sql
-- ============================================================
-- PLATFORM LEVEL (no RLS needed, super-admin only access)
-- ============================================================

CREATE TABLE plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,            -- "Starter", "Pro", "Enterprise"
  max_tables    INT NOT NULL DEFAULT 10,
  max_staff     INT NOT NULL DEFAULT 5,
  price_monthly DECIMAL(10,2),
  features      JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE restaurants (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,    -- used as subdomain
  custom_domain  TEXT UNIQUE,
  plan_id        UUID REFERENCES plans(id),
  is_active      BOOLEAN DEFAULT TRUE,
  is_verified    BOOLEAN DEFAULT FALSE,
  owner_email    TEXT NOT NULL,
  phone          TEXT,
  address        TEXT,
  city           TEXT,
  country        TEXT DEFAULT 'IN',
  currency       TEXT DEFAULT 'INR',
  timezone       TEXT DEFAULT 'Asia/Kolkata',
  tax_rate       DECIMAL(5,2) DEFAULT 0,
  service_charge DECIMAL(5,2) DEFAULT 0,
  gst_number     TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ
);

CREATE TABLE restaurant_branding (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID UNIQUE NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  primary_color   TEXT DEFAULT '#FF6B35',
  secondary_color TEXT DEFAULT '#2C3E50',
  accent_color    TEXT DEFAULT '#F7C59F',
  font_family     TEXT DEFAULT 'Inter',
  logo_url        TEXT,
  favicon_url     TEXT,
  cover_image_url TEXT,
  welcome_text    TEXT,
  tagline         TEXT,
  footer_text     TEXT,
  language        TEXT DEFAULT 'en',
  theme           TEXT DEFAULT 'light',   -- 'light' | 'dark' | 'auto'
  custom_css      TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE restaurant_hours (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  day_of_week   SMALLINT NOT NULL,        -- 0=Sun, 6=Sat
  open_time     TIME NOT NULL,
  close_time    TIME NOT NULL,
  is_closed     BOOLEAN DEFAULT FALSE
);

-- ============================================================
-- USERS & ROLES
-- ============================================================

CREATE TYPE user_role AS ENUM ('super_admin', 'owner', 'manager', 'kitchen', 'waiter', 'customer');

CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT UNIQUE,
  phone          TEXT UNIQUE,
  name           TEXT NOT NULL,
  password_hash  TEXT,
  role           user_role NOT NULL DEFAULT 'customer',
  is_active      BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_restaurant_roles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  role          user_role NOT NULL,
  invited_by    UUID REFERENCES users(id),
  joined_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

CREATE TABLE refresh_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    TEXT NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id),
  expires_at    TIMESTAMPTZ NOT NULL,
  revoked_at    TIMESTAMPTZ,
  user_agent    TEXT,
  ip_address    INET,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLES & QR
-- ============================================================

CREATE TABLE restaurant_tables (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  table_number  TEXT NOT NULL,
  capacity      SMALLINT DEFAULT 4,
  section       TEXT,                     -- "Indoor", "Outdoor", "Rooftop"
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, table_number)
);

CREATE TABLE qr_tokens (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  table_id      UUID REFERENCES restaurant_tables(id),
  token         TEXT UNIQUE NOT NULL,     -- HMAC-signed opaque token
  token_type    TEXT DEFAULT 'table',     -- 'table' | 'takeaway' | 'delivery'
  is_active     BOOLEAN DEFAULT TRUE,
  scans         INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  expires_at    TIMESTAMPTZ              -- null = never expires
);

-- ============================================================
-- MENU
-- ============================================================

CREATE TABLE menu_categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  name          TEXT NOT NULL,
  description   TEXT,
  image_url     TEXT,
  sort_order    SMALLINT DEFAULT 0,
  is_active     BOOLEAN DEFAULT TRUE,
  available_from TIME,
  available_to   TIME,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ
);

CREATE TYPE dish_type AS ENUM ('veg', 'non_veg', 'vegan', 'egg');

CREATE TABLE menu_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id    UUID NOT NULL REFERENCES restaurants(id),
  category_id      UUID NOT NULL REFERENCES menu_categories(id),
  name             TEXT NOT NULL,
  description      TEXT,
  dish_type        dish_type NOT NULL DEFAULT 'veg',
  base_price       DECIMAL(10,2) NOT NULL,
  discounted_price DECIMAL(10,2),
  calories         INT,
  prep_time_mins   SMALLINT,
  is_active        BOOLEAN DEFAULT TRUE,
  is_in_stock      BOOLEAN DEFAULT TRUE,
  is_featured      BOOLEAN DEFAULT FALSE,
  is_bestseller    BOOLEAN DEFAULT FALSE,
  spice_level      SMALLINT DEFAULT 0,    -- 0-5
  tags             TEXT[],
  sort_order       SMALLINT DEFAULT 0,
  tax_rate         DECIMAL(5,2),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);

CREATE TABLE item_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id     UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt_text    TEXT,
  sort_order  SMALLINT DEFAULT 0,
  is_primary  BOOLEAN DEFAULT FALSE
);

CREATE TABLE item_variants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id       UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  name          TEXT NOT NULL,           -- "Small", "Medium", "Large"
  price_delta   DECIMAL(10,2) DEFAULT 0,
  is_default    BOOLEAN DEFAULT FALSE,
  is_active     BOOLEAN DEFAULT TRUE,
  sort_order    SMALLINT DEFAULT 0
);

CREATE TABLE item_addons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id       UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  name          TEXT NOT NULL,           -- "Extra Cheese", "No Onions"
  price         DECIMAL(10,2) DEFAULT 0,
  is_required   BOOLEAN DEFAULT FALSE,
  max_select    SMALLINT DEFAULT 1,
  is_active     BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TYPE order_type   AS ENUM ('dine_in', 'takeaway', 'delivery');
CREATE TYPE order_status AS ENUM ('pending', 'placed', 'accepted', 'preparing', 'ready', 'served', 'cancelled', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'upi', 'card', 'wallet', 'razorpay');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id    UUID NOT NULL REFERENCES restaurants(id),
  table_id         UUID REFERENCES restaurant_tables(id),
  customer_id      UUID REFERENCES users(id),
  qr_token_id      UUID REFERENCES qr_tokens(id),
  order_number     TEXT NOT NULL,        -- human-readable: "ORD-0042"
  order_type       order_type NOT NULL DEFAULT 'dine_in',
  status           order_status NOT NULL DEFAULT 'pending',
  subtotal         DECIMAL(10,2) NOT NULL,
  discount_amount  DECIMAL(10,2) DEFAULT 0,
  tax_amount       DECIMAL(10,2) DEFAULT 0,
  service_charge   DECIMAL(10,2) DEFAULT 0,
  total_amount     DECIMAL(10,2) NOT NULL,
  coupon_id        UUID REFERENCES coupons(id),
  special_notes    TEXT,
  estimated_time   SMALLINT,
  delivery_address JSONB,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, order_number)
);

CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  item_id       UUID NOT NULL REFERENCES menu_items(id),
  item_name     TEXT NOT NULL,           -- snapshot at time of order
  item_price    DECIMAL(10,2) NOT NULL,  -- snapshot
  quantity      SMALLINT NOT NULL DEFAULT 1,
  special_notes TEXT,
  total_price   DECIMAL(10,2) NOT NULL
);

CREATE TABLE order_item_variants (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  variant_id    UUID REFERENCES item_variants(id),
  variant_name  TEXT NOT NULL,           -- snapshot
  price_delta   DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE order_item_addons (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  addon_id      UUID REFERENCES item_addons(id),
  addon_name    TEXT NOT NULL,           -- snapshot
  price         DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE order_status_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  status        order_status NOT NULL,
  changed_by    UUID REFERENCES users(id),
  note          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id           UUID NOT NULL REFERENCES orders(id),
  restaurant_id      UUID NOT NULL REFERENCES restaurants(id),
  method             payment_method NOT NULL,
  status             payment_status NOT NULL DEFAULT 'pending',
  amount             DECIMAL(10,2) NOT NULL,
  currency           TEXT DEFAULT 'INR',
  gateway            TEXT,
  gateway_order_id   TEXT,
  gateway_payment_id TEXT,
  gateway_signature  TEXT,
  gateway_response   JSONB,
  paid_at            TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COUPONS
-- ============================================================

CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');

CREATE TABLE coupons (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id   UUID NOT NULL REFERENCES restaurants(id),
  code            TEXT NOT NULL,
  description     TEXT,
  discount_type   discount_type NOT NULL,
  discount_value  DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(10,2) DEFAULT 0,
  max_discount    DECIMAL(10,2),
  max_uses        INT,
  used_count      INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  valid_from      TIMESTAMPTZ,
  valid_until     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(restaurant_id, code)
);

-- ============================================================
-- AUDIT
-- ============================================================

CREATE TABLE audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID REFERENCES restaurants(id),
  user_id       UUID REFERENCES users(id),
  action        TEXT NOT NULL,
  entity_type   TEXT,
  entity_id     UUID,
  old_value     JSONB,
  new_value     JSONB,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

ALTER TABLE menu_categories      ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_variants        ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_addons          ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_images          ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders               ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_variants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_addons    ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables    ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens            ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons              ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;

-- Applied pattern (repeated for each table):
CREATE POLICY tenant_isolation ON menu_items
  USING (restaurant_id = current_setting('app.current_tenant', true)::uuid);

-- Super-admin bypass (uses a separate DB role):
CREATE POLICY super_admin_bypass ON menu_items
  TO platform_admin
  USING (true);
```

---

## 6. Tenancy & Isolation Strategy

### Resolution Priority Chain

```
1. JWT claim (restaurant_id in payload) — for authenticated staff/owners
2. Subdomain host header — e.g., "pizza" from pizza.platform.com
3. Custom domain mapping — e.g., order.mypizza.com → pizza restaurant
4. QR token claim — for unauthenticated customer sessions
5. REJECT (401/404)
```

### Three-Layer Enforcement

**Layer 1: Middleware (NestJS)**
- `TenantResolutionMiddleware` runs on every request.
- Sets `req.tenantId` from the resolution chain above.
- Injects into `AsyncLocalStorage` for the entire request lifetime.
- Never trusts a client-sent `restaurant_id` from body/params.

**Layer 2: Prisma Extension / RLS**
- Before every Prisma query, `PrismaService` executes:
  `SET LOCAL app.current_tenant = '{tenantId}'`
- PostgreSQL RLS policies automatically filter all queries.
- The application DB user does **not** have the `platform_admin` role.

**Layer 3: Application Guards**
- `TenantGuard` validates that the resolved tenant matches the resource being accessed.
- No controller ever reads `restaurant_id` from the request body and uses it for authorization.
- Controllers receive `@CurrentTenant()` from the middleware-injected context only.

### Isolation Test Matrix

| Test Case | Expected Result |
|---|---|
| Restaurant A JWT → GET Restaurant B menu | 404 / empty array |
| Restaurant A JWT → GET Restaurant B orders | 404 (RLS hides rows) |
| Cross-tenant order ID access (UUID guessing) | 404 |
| Expired QR token | 401 |
| Tampered QR token (HMAC mismatch) | 401 |
| Restaurant A kitchen staff → update B's order | 403 |
| Super admin accessing tenant data | Allowed via platform_admin DB role, fully audited |

---

## 7. White-Label Strategy

### Brand Configuration Object

```typescript
interface RestaurantBranding {
  primaryColor: string;      // CSS var: --color-primary
  secondaryColor: string;    // CSS var: --color-secondary
  accentColor: string;       // CSS var: --color-accent
  fontFamily: string;        // loaded via Google Fonts
  logoUrl: string;
  faviconUrl: string;
  coverImageUrl: string;
  welcomeText: string;
  tagline: string;
  language: string;          // i18n locale
  theme: 'light' | 'dark';
  customCss?: string;        // advanced override
}
```

### Web Implementation

- **ThemeProvider** in Next.js injects CSS custom properties (`--color-primary`, etc.) into `:root` on the tenant layout.
- **`generateMetadata()`** in the layout outputs tenant-specific `<title>`, `<meta description>`, favicon `<link>`, and Open Graph tags.
- **No "Powered by"** anywhere in customer-facing routes.
- Custom `<head>` includes the restaurant's JSON-LD structured data (for Google restaurant rich results).
- Error pages (404, 500) are tenant-branded.
- PWA `manifest.json` uses the restaurant's name, icon, and theme color — generated dynamically per tenant.

### Domain Strategy

```
Platform owns:   *.platform.com  (wildcard SSL via Let's Encrypt)
Tenant subdomain: pizzahut.platform.com
Tenant custom domain: order.pizzahut.com
  → Tenant adds CNAME: order.pizzahut.com → pizzahut.platform.com
  → Nginx matches custom_domain from DB and serves the same tenant
```

### Mobile App White-Label

- **Runtime mode**: QR scan → app loads branding config from API → applies theme dynamically.
- **Branded build mode**: `eas.json` `BUILD_RESTAURANT_SLUG` env var activates a config plugin that swaps app name, icon, and splash from S3 assets — enabling per-restaurant app store listings from one codebase.

### No Platform Branding Leakage Checklist

- Customer menu pages: no platform name
- Order confirmation emails: from restaurant's branded "From" address
- Invoices/receipts: restaurant logo + name only
- PWA manifest: restaurant name, icon, theme
- Browser tab title: restaurant name
- Error pages: restaurant branded
- QR card PDFs: restaurant logo, table number, branding only

---

## 8. API Design

### Base URL

```
https://api.platform.com/v1/
# Or, when using per-tenant subdomain:
https://pizzahut.platform.com/api/v1/   (Nginx proxies to same API; tenant auto-resolved from host)
```

### Standard Response Format

```typescript
// Success
{ success: true, data: T, meta?: { page, limit, total } }

// Error
{ success: false, error: { code: string, message: string, details?: Record<string, string[]> } }
```

### Endpoint Groups

#### Auth `/auth`
| Method | Path | Description | Auth Required |
|---|---|---|---|
| POST | `/auth/login` | Email + password login | Public |
| POST | `/auth/register` | Customer self-register | Public |
| POST | `/auth/refresh` | Refresh access token | Refresh cookie |
| POST | `/auth/logout` | Revoke refresh token | Bearer |
| POST | `/auth/forgot-password` | Send reset link | Public |
| POST | `/auth/reset-password` | Apply reset with token | Public |

#### Tenant `/tenant`
| Method | Path | Description | Auth Required |
|---|---|---|---|
| GET | `/tenant/resolve` | Get branding for current host | Public |
| GET | `/tenant/menu` | Full menu (cached, ISR-friendly) | Public / QR session |

#### Super Admin `/super-admin`
| Method | Path | Description |
|---|---|---|
| GET | `/super-admin/restaurants` | List all restaurants |
| POST | `/super-admin/restaurants` | Onboard new restaurant |
| PATCH | `/super-admin/restaurants/:id` | Update / suspend |
| GET | `/super-admin/analytics` | Platform-wide metrics |
| GET/POST | `/super-admin/plans` | Manage subscription plans |

#### Menu `/menu`
| Method | Path | Description | Role |
|---|---|---|---|
| GET | `/menu/categories` | List categories | Public |
| POST | `/menu/categories` | Create category | Owner/Manager |
| PATCH | `/menu/categories/:id` | Update | Owner/Manager |
| DELETE | `/menu/categories/:id` | Soft delete | Owner |
| GET | `/menu/items` | List items (filter: category, type, search, stock) | Public |
| POST | `/menu/items` | Create item | Owner/Manager |
| PATCH | `/menu/items/:id` | Update item | Owner/Manager |
| PATCH | `/menu/items/:id/stock` | Toggle in-stock | Kitchen/Manager |
| POST | `/menu/items/:id/images` | Upload image | Owner/Manager |
| DELETE | `/menu/items/:id/images/:imgId` | Remove image | Owner/Manager |

#### Orders `/orders`
| Method | Path | Description | Role |
|---|---|---|---|
| POST | `/orders` | Place order | Customer/QR session |
| GET | `/orders` | List orders (filters: status, date, type) | Owner/Manager/Kitchen |
| GET | `/orders/live` | SSE stream of live orders | Kitchen |
| GET | `/orders/:id` | Order detail | Owner/Manager/Customer (own) |
| PATCH | `/orders/:id/status` | Update status | Kitchen/Manager |
| POST | `/orders/:id/cancel` | Cancel order | Customer (own) / Manager |
| GET | `/orders/customer/history` | Customer's past orders | Customer |

#### Tables & QR `/tables` `/qr`
| Method | Path | Description | Role |
|---|---|---|---|
| GET | `/tables` | List tables | Owner/Manager |
| POST | `/tables` | Create table | Owner/Manager |
| PATCH | `/tables/:id` | Update table | Owner/Manager |
| POST | `/tables/:id/qr` | Generate/regenerate QR | Owner/Manager |
| GET | `/tables/:id/qr/pdf` | Download branded QR card PDF | Owner/Manager |
| GET | `/tables/qr-sheet` | All tables PDF | Owner/Manager |
| POST | `/qr/verify` | Verify token → return restaurant+table ctx | Public |

#### Payments `/payments`
| Method | Path | Description | Role |
|---|---|---|---|
| POST | `/payments/initiate` | Create payment intent | Customer |
| POST | `/payments/webhook/razorpay` | Razorpay webhook (HMAC verified) | Public |
| GET | `/payments/:id` | Payment status | Customer/Owner |

#### Analytics `/analytics`
| Method | Path | Description | Role |
|---|---|---|---|
| GET | `/analytics/dashboard` | Today's KPIs | Owner/Manager |
| GET | `/analytics/sales` | Sales report by date range | Owner/Manager |
| GET | `/analytics/top-dishes` | Top selling items | Owner/Manager |
| GET | `/analytics/peak-hours` | Order frequency by hour | Owner/Manager |

#### Settings & Branding `/settings`
| Method | Path | Description | Role |
|---|---|---|---|
| GET/PATCH | `/settings/branding` | Read/update branding config | Owner |
| GET/PATCH | `/settings/hours` | Read/update opening hours | Owner/Manager |
| GET/PATCH | `/settings/tax` | Read/update tax and GST config | Owner |
| GET/PATCH | `/settings/restaurant` | Core restaurant info | Owner |

#### Staff `/staff`
| Method | Path | Description | Role |
|---|---|---|---|
| GET | `/staff` | List staff | Owner/Manager |
| POST | `/staff/invite` | Email invite with role | Owner |
| PATCH | `/staff/:id/role` | Change role | Owner |
| DELETE | `/staff/:id` | Remove staff member | Owner |

#### Coupons `/coupons`
| Method | Path | Description | Role |
|---|---|---|---|
| GET | `/coupons` | List coupons | Owner/Manager |
| POST | `/coupons` | Create coupon | Owner/Manager |
| PATCH | `/coupons/:id` | Update coupon | Owner/Manager |
| DELETE | `/coupons/:id` | Deactivate coupon | Owner |
| POST | `/coupons/validate` | Validate coupon code at checkout | Customer |

### WebSocket Events (Kitchen Gateway)

```
Connect:  wss://api.platform.com/kitchen?token=<JWT>

Server → Client:
  order:new          { order: OrderDto }
  order:status       { orderId, status, updatedBy, timestamp }
  item:out_of_stock  { itemId, itemName }

Client → Server:
  order:accept       { orderId }
  order:update       { orderId, status }
  subscribe:room     { restaurantId }   -- server validates JWT matches restaurantId
```

---

## 9. Screen List — Web App

### Customer-Facing (Fully Tenant-Branded)

| # | Screen | Route | Key Features |
|---|---|---|---|
| C1 | Restaurant Home / Menu | `/menu` | Cover image, welcome text, category tabs, featured items, search |
| C2 | Category Filter | `/menu?category=:slug` | Filtered items, veg/non-veg toggle, price sort |
| C3 | Item Detail Modal | `/menu/item/:id` | Image gallery, description, variants, add-ons, quantity, "Add to Cart" |
| C4 | Cart | `/cart` | Items summary, coupon input, order type selector (dine-in/takeaway/delivery), totals |
| C5 | Checkout | `/checkout` | Address form (delivery), notes, payment method selection |
| C6 | Payment | `/payment` | Razorpay embed or "Pay at Counter" confirmation |
| C7 | Order Confirmed | `/order/:id` | Order summary, items, estimated time, "Track Order" CTA |
| C8 | Live Order Tracking | `/track/:id` | Animated progress stepper (Placed → Accepted → Preparing → Ready → Served), real-time via WebSocket |
| C9 | Order History | `/orders` | Past orders list (authenticated customers) |
| C10 | Login / Register | `/auth/login` | Email login or guest phone OTP |

### Owner/Manager Dashboard (Tenant-Branded)

| # | Screen | Route | Key Features |
|---|---|---|---|
| D1 | Dashboard Home | `/dashboard` | Today's revenue, order count, popular items, live order ticker |
| D2 | Menu Manager | `/dashboard/menu` | Category accordion, drag-to-reorder items |
| D3 | Add/Edit Category | `/dashboard/menu/categories/new` | Name, image, availability time window |
| D4 | Add/Edit Dish | `/dashboard/menu/items/new` | Full form: type (veg/non-veg), price, variants, add-ons, image upload, stock toggle |
| D5 | Live Orders Board | `/dashboard/orders` | Kanban columns per status, real-time updates |
| D6 | Order Detail | `/dashboard/orders/:id` | Items, customer info, status controls, print receipt |
| D7 | Tables & QR | `/dashboard/tables` | Table list, generate QR, download PDF card, PDF all-tables sheet |
| D8 | Kitchen Display | `/dashboard/kitchen` | Full-screen order cards, sound alert toggle, status buttons |
| D9 | Staff Management | `/dashboard/staff` | List staff, invite by email, set roles |
| D10 | Analytics | `/dashboard/analytics` | Sales chart, top dishes chart, peak-hours heatmap |
| D11 | Coupons | `/dashboard/coupons` | Coupon list, create/edit modal, usage stats |
| D12 | Branding Settings | `/dashboard/settings/branding` | Color pickers, logo/cover upload, live preview pane |
| D13 | Restaurant Settings | `/dashboard/settings/restaurant` | Hours, tax/GST, contact info, currency |
| D14 | Billing | `/dashboard/billing` | Current plan, invoice history |
| D15 | First-Login Checklist | `/dashboard/onboarding` | Guided 7-step checklist with completion tracking |

### Kitchen Display System (KDS)

| # | Screen | Route | Key Features |
|---|---|---|---|
| K1 | Kitchen Board | `/kitchen` | Full-screen; order cards with items and notes; sound alert on new order; one-tap status update; disconnection banner |

### Super Admin Panel (Platform-Branded, No Tenant Theming)

| # | Screen | Route | Key Features |
|---|---|---|---|
| S1 | Platform Dashboard | `/admin` | Active tenants, monthly revenue, recent signups |
| S2 | Restaurant List | `/admin/restaurants` | Search, filter by plan/status, quick actions |
| S3 | Onboard Restaurant | `/admin/restaurants/new` | 4-step wizard |
| S4 | Restaurant Detail | `/admin/restaurants/:id` | Full view, edit, suspend/activate, impersonate |
| S5 | Plans | `/admin/plans` | Create/edit subscription plans |
| S6 | Platform Analytics | `/admin/analytics` | Cross-tenant usage metrics |

---

## 10. Screen List — Mobile App

### Customer Flow

| # | Screen | Key Features |
|---|---|---|
| M1 | Branded Splash | Restaurant logo/color loaded from last-opened restaurant or default |
| M2 | QR Scanner | Camera view, torch toggle, paste-code fallback |
| M3 | Restaurant Home | Cover banner, welcome text, search bar, category chips, item grid |
| M4 | Item Detail | Image, description, variant selector, add-on checkboxes, quantity, "Add to Cart" |
| M5 | Cart Sheet | Slide-up bottom sheet → full cart screen with coupon input |
| M6 | Checkout | Order type, special notes, payment method picker |
| M7 | Payment | Razorpay React Native SDK or in-app WebView |
| M8 | Order Confirmed | Success animation, order number, estimated time |
| M9 | Live Order Tracking | Progress stepper, live updates via WebSocket |
| M10 | Order History | Past orders grouped by restaurant |
| M11 | Login / Register | Phone OTP or email |

### Staff / Kitchen Flow (Same App, Role-Switched)

| # | Screen | Key Features |
|---|---|---|
| S1 | Staff Login | Credentials → enters staff mode with restaurant context |
| S2 | Kitchen Display | Swipeable order cards, status update buttons, new order sound notification |
| S3 | Push Notifications | FCM/APNs for new orders when app is in background |

---

## 11. QR Flow Architecture

```
GENERATION (Owner Dashboard)
────────────────────────────
1. Owner creates/manages tables in the dashboard.
2. API creates a qr_tokens record:
     token = base64url( HMAC-SHA256(restaurantId + '|' + tableId + '|' + nonce, QR_HMAC_SECRET) )
3. QR image generated (qrcode npm) encoding:
     Web:      https://platform.com/qr/{token}
     App:      myapp://qr/{token}          (deep link)
4. Puppeteer generates a branded PDF card:
     - Restaurant logo, name
     - "Scan to Order" in restaurant's primary color
     - QR code image
     - Table number
5. PDF stored in S3 and link served to owner.

SCANNING — WITHOUT APP (PWA path)
──────────────────────────────────
1. Camera app scans QR → opens https://platform.com/qr/{token}
2. Server verifies token:
   a. Looks up qr_tokens WHERE token = ?
   b. Checks is_active = true, expires_at IS NULL OR > NOW()
   c. Verifies HMAC signature
   d. Increments scan counter
   e. Returns {restaurantId, slug, tableId}
3. Server issues a short-lived QR session cookie (1 hour, httpOnly)
4. Browser redirects to: https://{slug}.platform.com/menu
5. Next.js reads QR session cookie → loads restaurant branding + menu
6. PWA install prompt shown after first page interaction

SCANNING — WITH APP (Deep Link path)
──────────────────────────────────────
1. Camera app → App intercepts myapp://qr/{token}
2. App calls POST /qr/verify → receives {restaurantId, tableId, branding}
3. App navigates to RestaurantHomeScreen with tenant context set
4. All subsequent API calls include X-QR-Token: {token} header
5. Server resolves tenant from this header for unauthenticated requests
```

---

## 12. Real-Time Architecture

### Event Flow

```
Customer places order (POST /orders)
          │
          ▼
    Order saved to DB (status: 'placed')
          │
          ▼
   BullMQ job queued: NOTIFY_KITCHEN
          │
          ▼
   Worker processes job → publishes to Redis channel: kitchen:{restaurantId}
          │
   ┌──────▼───────────────────────────────────────────────┐
   │  Socket.io Server (Redis adapter for multi-instance) │
   │  Broadcasts to room: restaurant:{restaurantId}       │
   └──────┬───────────────────────────────────────────────┘
          │
    ┌─────▼──────────────┐     ┌─────────────────────────┐
    │  Kitchen Display   │     │  Customer Tracking Page │
    │  Event: order:new  │     │  Customer is in room:   │
    │  New card appears  │     │  order:{orderId}        │
    │  Sound alert 🔔    │     │                         │
    └────────────────────┘     └─────────────────────────┘

Kitchen taps "Accept" (PATCH /orders/:id/status { status: 'accepted' })
          │
          ▼
    Status saved + order_status_history record created
          │
          ▼
   Socket.io broadcasts to order:{orderId} room:
     Event: order:status { orderId, status: 'accepted' }
          │
          ▼
   Customer sees "Accepted ✓" in real time on tracking page
```

### Fallback Strategy

- If WebSocket connection drops: customer tracking page **polls** `GET /orders/:id` every 10 seconds.
- Kitchen display shows a **"Disconnected — Reconnecting..."** yellow banner and auto-reconnects with exponential backoff (1s → 2s → 4s → 8s → max 30s).
- BullMQ jobs are persisted in Redis and retried if processing fails.

---

## 13. Auth Architecture

### Token Strategy

```
Access Token:  JWT, RS256 signed, 15-minute expiry
               Payload: { sub, role, restaurantId, iat, exp }
               Sent in: Authorization: Bearer <token> header

Refresh Token: Opaque 256-bit UUID, 30-day expiry
               Stored: SHA-256 hash in refresh_tokens table
               Sent in: httpOnly, SameSite=Strict, Secure cookie
               Rotation: New refresh token issued on every refresh call
               Revocation: Old token revoked immediately on rotation
```

### Role Permission Matrix

| Resource | super_admin | owner | manager | kitchen | waiter | customer |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Onboard restaurant | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage full menu | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Toggle item stock | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View all orders | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Update order status | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Place order | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage staff | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View analytics | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Branding settings | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Billing | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

### Customer Sessions (QR-Based, Unauthenticated)

- Customer scans QR → server issues a **session cookie** (not a full JWT) containing `{ restaurantId, tableId, sessionId }`.
- Signed with HMAC, verified server-side on each request.
- Stored in `sessionStorage` (web) or in-memory (mobile) — not persisted.
- Customer can optionally log in for full order history persistence.

---

## 14. Onboarding Automation

### Wizard Steps (Super Admin)

```
Step 1 — Restaurant Details
  Name, slug (auto-suggested + unique check), phone, address, city
  Tax rate, GST number, service charge percentage, currency

Step 2 — Owner Account
  Name, email
  Temporary password auto-generated
  Welcome email dispatched immediately

Step 3 — Branding
  Logo upload (drag-and-drop)
  Primary color picker (with live preview)
  Cover image upload
  Welcome text for customers

Step 4 — Plan & Tables
  Select subscription plan
  Enter desired number of tables
  System auto-creates all tables + QR tokens on submit
```

### BullMQ Job: ONBOARD_RESTAURANT

```
On wizard submit, execute sequentially:
  1.  Create restaurants record
  2.  Create restaurant_branding record
  3.  Create owner user record (hashed temp password)
  4.  Create user_restaurant_roles (owner role)
  5.  Seed default menu_categories: ["Starters", "Main Course", "Beverages", "Desserts"]
  6.  Create N restaurant_tables records
  7.  Generate N qr_tokens (HMAC-signed)
  8.  Generate "All Tables" QR PDF (Puppeteer) → upload to S3
  9.  Send branded welcome email to owner:
        From: "noreply@platform.com"
        Subject: "Your [Name] ordering system is ready!"
        Body: branded template with: login URL, credentials, attached QR PDF, quick-start link
  10. Mark restaurants.is_verified = true
  11. Log to audit_logs
```

### Owner First-Login Checklist (7 Steps)

Stored as a JSON array in the owner's user metadata, updated via API as steps are completed:

```
1. ☐ Add your first menu category
2. ☐ Add your first dish with a photo
3. ☐ Review your table setup
4. ☐ Print your QR codes
5. ☐ Place a test order by scanning a QR
6. ☐ Accept the order from the kitchen display
7. ☐ Set your opening hours
```

### Demo Seed Script (3 Restaurants)

| Restaurant | Cuisine | Palette | Tables | Items |
|---|---|---|---|---|
| **Spice Garden** | Indian | Orange (#FF6B35) + Green (#2D6A4F) | 10 | 15 Indian dishes |
| **The Burger Lab** | Fast Food | Red (#E63946) + Yellow (#FFD166) | 8 | 10 burger combos |
| **Zen Sushi** | Japanese | Black (#1A1A2E) + White (#EAEAEA) | 12 | 20 Japanese items |

---

## 15. Payment Abstraction Layer

### Interface

```typescript
interface PaymentProvider {
  readonly name: string;
  createOrder(params: CreateOrderParams): Promise<PaymentOrder>;
  verifyPayment(params: VerifyParams): Promise<VerificationResult>;
  refund(params: RefundParams): Promise<RefundResult>;
}
```

### Implementations

- **`CashProvider`**: Immediately creates a `pending` payment record; no external call. Staff manually marks it `paid` on collection.
- **`RazorpayProvider`**: Creates a Razorpay order via SDK, returns `orderId` + `keyId` to the frontend. Frontend renders Razorpay checkout. Webhook (HMAC-verified) confirms payment and updates the order.
- **`StripeProvider`** *(future)*: Slot reserved in the factory.

### Factory

```typescript
// PaymentService selects provider based on the method chosen at checkout:
const provider = paymentProviderFactory.get(order.paymentMethod);
```

### Notes

- Each restaurant can optionally store its own Razorpay key pair (encrypted with AES-256 in DB) for direct payments. If not set, the platform's keys are used (platform-fee model — flagged as future feature in DECISIONS.md).
- Webhook endpoint is public but HMAC-verified (no auth token needed, per Razorpay requirements).

---

## 16. Storage Strategy

### Bucket Structure

```
{bucket}/
  {restaurantSlug}/
    logos/
      logo-{timestamp}.webp
    covers/
      cover-{timestamp}.webp
    menu/
      {itemId}/
        primary.webp
        thumb-80.webp
        medium-400.webp
        gallery-1.webp
    qr-pdfs/
      all-tables-{date}.pdf
      table-{number}-{date}.pdf
    invoices/
      {orderId}.pdf
```

### Image Processing Pipeline

1. Client uploads raw image to `POST /storage/upload`.
2. Server validates: max 10MB, allowed MIME types (JPEG, PNG, WebP).
3. **Sharp** processes the image:
   - Convert to WebP
   - Generate 3 sizes: 80px (thumb), 400px (card), 800px (detail)
   - Strip EXIF metadata
4. All variants uploaded to MinIO/S3.
5. `item_images` record created with URLs.

### Access Control

- Menu images: **public read** (served via CDN, long cache headers).
- Invoices and QR PDFs: **private**, served via signed URLs (1-hour expiry).
- Logos and covers: **public read** (needed for branding).

---

## 17. Milestones & Delivery Plan

### M0 — Foundation (Monorepo + Infra)
- [ ] pnpm workspaces + Turborepo configuration
- [ ] `packages/shared`: types, validators (Zod), constants
- [ ] `packages/config`: ESLint, Prettier, TypeScript base configs
- [ ] PostgreSQL 16 + Prisma setup + full schema + initial migration
- [ ] Redis setup + BullMQ configuration
- [ ] MinIO setup + storage module skeleton
- [ ] Nginx config (wildcard subdomain + custom domain proxy)
- [ ] `docker-compose.yml` (api, web, postgres, redis, minio, nginx, mailhog)
- [ ] `.env.example` and environment validation (envalid/zod)
- [ ] CI workflow (GitHub Actions: lint → typecheck → test)

### M1 — Core API (Auth + Tenant + Menu)
- [ ] NestJS app skeleton: global pipes, exception filter, logging interceptor
- [ ] `TenantResolutionMiddleware`: subdomain + custom domain + QR token chain
- [ ] `PrismaService` with RLS `SET LOCAL` before each query
- [ ] Auth module: login, register, refresh token rotation, password reset
- [ ] Menu module: categories + items CRUD (with soft delete)
- [ ] Storage module: Sharp image processing + S3 upload
- [ ] **Tenant isolation tests** (Jest + Supertest) — cross-tenant access must return 404/403
- [ ] Unit tests: auth service, tenant resolver, menu service

### M2 — Orders + Real-Time
- [ ] Orders module: place, list, detail, cancel
- [ ] Order status machine + `order_status_history`
- [ ] Kitchen WebSocket Gateway (Socket.io + NestJS + Redis adapter)
- [ ] BullMQ order notification worker
- [ ] SSE fallback endpoint for order tracking (`GET /orders/:id/stream`)
- [ ] Integration tests: full order lifecycle (place → accept → prepare → ready → served)

### M3 — Tables, QR & PDFs
- [ ] Tables module CRUD
- [ ] QR token generation (HMAC-signed) + verification endpoint
- [ ] `qrcode` npm package integration
- [ ] Puppeteer PDF generation: branded QR card + all-tables sheet + invoice
- [ ] PDF stored in S3; signed URL returned to client

### M4 — Payments + Coupons
- [ ] Payment abstraction layer + `CashProvider`
- [ ] `RazorpayProvider` (test keys; mocked in test env)
- [ ] Razorpay webhook handler (HMAC verification)
- [ ] Coupons module: CRUD + validation at checkout
- [ ] Integration tests: payment flow (initiate → webhook → order paid)

### M5 — Owner Dashboard (Next.js Web)
- [ ] Next.js app setup + TanStack Query + `ThemeProvider`
- [ ] Dashboard layout: sidebar navigation, mobile-responsive
- [ ] Menu manager screens (D2, D3, D4) — drag-to-reorder, image upload
- [ ] Live orders board (D5) — real-time Kanban via WebSocket
- [ ] Tables & QR manager (D7) — PDF download
- [ ] Branding settings (D12) — live preview pane
- [ ] Analytics dashboard (D10) — Recharts / Chart.js
- [ ] Staff management (D9)
- [ ] Kitchen display (K1) — full-screen mode, sound alerts
- [ ] Onboarding checklist (D15)

### M6 — Customer Web (PWA)
- [ ] Customer-facing menu screens (C1–C3) — branded, mobile-first
- [ ] Cart screen (C4) — coupon input, order type selector
- [ ] Checkout + payment (C5–C6)
- [ ] Order confirmed + tracking (C7–C8) — live status via WebSocket
- [ ] Order history (C9) — for logged-in customers
- [ ] PWA: `manifest.json` (per-tenant, dynamic), service worker, offline menu cache

### M7 — Mobile App (Expo)
- [ ] Expo Router setup + deep links (universal links / app links config)
- [ ] QR Scanner screen (M2) using `expo-camera`
- [ ] Restaurant home + menu screens (M3–M4)
- [ ] Cart + checkout + payment (M5–M7)
- [ ] Live order tracking (M9) via WebSocket
- [ ] Order history (M10)
- [ ] Staff kitchen view (S2) — swipeable cards, push notifications (FCM)

### M8 — Super Admin + Onboarding
- [ ] Super admin panel (S1–S6)
- [ ] Restaurant onboarding wizard (4 steps)
- [ ] BullMQ onboarding automation pipeline (10-step job)
- [ ] Branded welcome email template (Nodemailer + Handlebars)
- [ ] Demo seed script (3 restaurants × full data)

### M9 — Testing, Polish & Docs
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Tenant isolation test suite (automated, runs in CI)
- [ ] Playwright E2E: onboarding → QR scan → order → kitchen → tracking
- [ ] Playwright E2E: dual-restaurant isolation proof
- [ ] ESLint + Prettier + TypeScript strict: zero errors
- [ ] OpenAPI/Swagger docs auto-generated from NestJS decorators
- [ ] `README.md`: setup, env vars, run instructions, deploy guide
- [ ] `DECISIONS.md`: all ambiguous choices recorded
- [ ] `BLOCKERS.md`: mocks and placeholders documented
- [ ] Owner User Guide (brief, markdown)
- [ ] Final summary report

---

## 18. Testing Strategy

### Unit Tests (Jest)

| Module | What's Tested |
|---|---|
| AuthService | Login success/fail, token generation, refresh, expiry |
| TenantResolver | Subdomain parsing, custom domain lookup, QR token parsing, rejection |
| OrderService | Price calculation (subtotal + tax + service charge + discount), status transitions |
| QrService | Token signing, verification, tampering detection (bad HMAC), expiry |
| PaymentService | Provider selection, Razorpay signature verification, cash flow |
| CouponService | Validation, usage limit enforcement, expiry check |

### Integration Tests (Jest + Supertest + Test DB)

**Tenant Isolation Suite (MANDATORY — must all pass):**

```
TEST 1: Cross-tenant menu access
  - Create Restaurant A and Restaurant B
  - Authenticate as Restaurant A owner
  - GET /menu/items (resolving to Restaurant B's subdomain)
  EXPECT: 404 or empty items array

TEST 2: Cross-tenant order access
  - Place order in Restaurant A as customer
  - Authenticate as Restaurant B owner
  - GET /orders/{orderId from A}
  EXPECT: 404 (RLS hides the row)

TEST 3: Cross-tenant status update
  - Place order in Restaurant A
  - Authenticate as Restaurant B kitchen staff
  - PATCH /orders/{A's orderId}/status
  EXPECT: 403 Forbidden

TEST 4: QR token tampering
  - Generate valid QR token for Restaurant A, Table 1
  - Modify the payload (e.g., change tableId) but keep the same HMAC
  EXPECT: 401 Invalid token

TEST 5: Expired QR token
  - Create QR token with expires_at = NOW() - 1 minute
  - POST /qr/verify
  EXPECT: 401 Token expired

TEST 6: Cross-tenant coupon use
  - Create coupon for Restaurant A
  - Customer session from Restaurant B
  - POST /coupons/validate { code: A's coupon code }
  EXPECT: 404 Coupon not found
```

**Order Flow Integration:**
```
POST /orders → status 'placed' → kitchen receives WS event
→ PATCH /orders/:id/status { status: 'accepted' } → customer WS event
→ PATCH { status: 'preparing' } → customer WS event
→ PATCH { status: 'ready' } → customer WS event
→ PATCH { status: 'served' } → order closed
```

**Onboarding Integration:**
```
POST /super-admin/restaurants (wizard payload)
→ EXPECT: restaurant record created
→ EXPECT: owner user created
→ EXPECT: default categories created (4)
→ EXPECT: tables created (N)
→ EXPECT: QR tokens created (N)
→ EXPECT: welcome email queued (MailHog SMTP capture)
```

### E2E Tests (Playwright)

1. **Onboarding E2E**: Super admin → create restaurant wizard → email received (MailHog) → owner logs in → sees dashboard + checklist.
2. **Full QR Order E2E**: Navigate to QR URL → menu loads (correct restaurant only) → add items → checkout (cash) → order confirmed → kitchen board shows order → kitchen accepts → customer tracking shows "Accepted".
3. **Dual-Restaurant Isolation E2E**: Restaurant A QR → A's menu → Restaurant B QR → B's menu → A's items never appear in B's view and vice versa.

### Performance

- k6 load test on `GET /tenant/menu` (cached): target p95 < 200ms at 100 RPS.
- Cache hit via Redis ISR checked.

### Security

- HMAC tamper test (automated, in integration suite).
- JWT expiry boundary test.
- Rate limiting test: 429 after configured threshold.
- OWASP ZAP baseline scan documented as a recommended manual step.

---

## 19. Risks & Mitigations

| Risk | Severity | Likelihood | Mitigation |
|---|---|---|---|
| RLS policy misconfiguration leaking cross-tenant data | HIGH | Low | Automated cross-tenant tests in CI; PR reviews required |
| Custom domain SSL provisioning complexity | MEDIUM | Medium | Start with wildcard `*.platform.com` only; custom domains as Phase 2 |
| Razorpay API keys not available in dev/test | LOW | High | Mock payment provider in test env; documented in BLOCKERS.md |
| WebSocket scalability (multiple API pods) | MEDIUM | Low | Redis adapter for Socket.io configured from day 1 |
| QR token replay attack | MEDIUM | Low | HMAC + session binding + optional short expiry |
| Puppeteer (Chrome) in Docker memory pressure | LOW | Medium | Use dedicated puppeteer Docker image; queue PDF jobs via BullMQ |
| Mobile deep link fragility on iOS/Android | MEDIUM | Medium | Universal Links + App Links configured; fallback to web URL |
| GST compliance for Indian invoices | MEDIUM | High | Basic GST rate field implemented; full e-invoice (IRN/QR on invoice) as future milestone |
| Multi-currency actual payment processing | LOW | Low | Currency stored per restaurant for display; actual gateway currency configured separately |
| Owner uploads very large images | LOW | High | Max 10MB enforced + Sharp resizes before storage |

---

## 20. Deployment Architecture

### Local Development — Single Command

```bash
docker-compose up
```

Services started:
| Service | Port | Description |
|---|---|---|
| `api` | 3001 | NestJS backend |
| `web` | 3000 | Next.js frontend |
| `postgres` | 5432 | PostgreSQL 16 |
| `redis` | 6379 | Redis 7 |
| `minio` | 9000 / 9001 | MinIO (S3-compat / Console) |
| `nginx` | 80 | Reverse proxy + wildcard subdomain routing |
| `mailhog` | 8025 | Email capture UI (dev only) |

### Production — VPS/Cloud

```
Load Balancer (Nginx / Caddy)
  │
  ├── Next.js Web App (Node.js process or Vercel)
  └── NestJS API (Node.js process, N workers)
        ├── PostgreSQL (Managed: Railway / Supabase / AWS RDS)
        ├── Redis (Managed: Upstash / ElastiCache)
        ├── S3 (AWS S3 / Backblaze B2 / Cloudflare R2)
        └── SMTP (Resend / AWS SES)

CDN (Cloudflare): static assets + menu images
Monitoring: Sentry (errors) + Grafana/Prometheus (metrics)
Backups: pg_dump nightly → S3, 30-day retention
```

### Environment Variables (`.env.example`)

```bash
# App
NODE_ENV=development
PLATFORM_DOMAIN=platform.com
PLATFORM_API_URL=http://api:3001

# Database
DATABASE_URL=postgresql://saas:secret@postgres:5432/saas_restaurant

# Redis
REDIS_URL=redis://redis:6379

# JWT (RS256 — generate with: openssl genrsa -out private.pem 4096)
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# QR Tokens
QR_HMAC_SECRET=replace-with-64-char-random-hex

# Storage (MinIO for local, S3 for prod)
S3_ENDPOINT=http://minio:9000
S3_REGION=us-east-1
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=saas-restaurant
S3_PUBLIC_URL=http://localhost:9000/saas-restaurant

# Razorpay (use test keys for dev)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Email
SMTP_HOST=mailhog
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=Restaurant Platform
SMTP_FROM_EMAIL=noreply@platform.com
```

---

## Summary Table

| Dimension | Decision |
|---|---|
| Tenancy Model | Shared DB + `restaurant_id` FK + PostgreSQL RLS + server-side guards (3 layers) |
| White-Label | CSS custom properties injected per tenant + dynamic Next.js metadata + no platform branding in customer routes |
| Auth | JWT RS256 (15 min) + httpOnly refresh token (30 days) + RBAC with 6 roles |
| Real-time | Socket.io with Redis adapter; BullMQ for reliable notification delivery; SSE polling fallback |
| Storage | MinIO (dev) → S3 (prod); Sharp for image optimization; signed URLs for private files |
| Payments | Interface-based abstraction: `CashProvider` + `RazorpayProvider` (Stripe slot reserved) |
| PDF Generation | Puppeteer headless Chrome via BullMQ worker (not in request path) |
| Mobile | Expo + Expo Router; runtime branding; EAS Build for branded app store releases |
| Testing | Jest unit + Supertest integration + Playwright E2E; tenant isolation tests mandatory in CI |
| Deployment | Docker Compose one-command local; VPS/cloud ready with managed DB + Redis + S3 |
| Seed Data | 3 demo restaurants with distinct branding, menus, and complete data for isolation demo |

---

*Reply **APPROVED** to begin Phase 1 autonomous build, or provide your change requests.*
