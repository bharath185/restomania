# DECISIONS.md — Ambiguous Choices & Rationale

All non-obvious architecture/implementation decisions made during Phase 1 are recorded here.

| # | Decision | Context | Chosen Option | Reason |
|---|---|---|---|---|
| 1 | Web framework for customer pages | Next.js App Router vs Pages Router | App Router | Plan specified it; better layout nesting for per-tenant theme |
| 2 | UI component library | Raw Tailwind vs shadcn/ui | shadcn/ui | Copy-paste primitives, fully owned, Tailwind-based, zero dependency lock-in |
| 3 | State management (web) | Redux / Zustand / Context | Zustand | Minimal boilerplate, SSR-safe, sufficient for cart + auth state |
| 4 | State management (mobile) | Redux / Zustand / Jotai | Zustand | Same as web; shared package for cart state logic |
| 5 | Chart library | Recharts vs Chart.js vs Victory | Recharts | React-first, composable, no canvas setup needed |
| 6 | Razorpay keys in Phase 1 | Platform-level vs per-restaurant keys | Platform-level keys in Phase 1 | Per-restaurant key storage (encrypted) deferred to Phase 2 |
| 7 | Email template engine | Handlebars vs MJML vs React Email | React Email | Type-safe, component-based, renders to HTML, works with Nodemailer |
| 8 | Mobile navigation | React Navigation vs Expo Router | Expo Router | File-based routing, deep link handling built-in |
| 9 | Image upload — client-side resize | Client resize vs server-only resize | Server-only (Sharp) | Keeps client simple; consistent quality |
| 10 | Database seeding | Prisma seed vs custom script | Custom TypeScript script with Prisma client | More control over ordering and idempotency |
| 11 | API docs format | Swagger UI vs ReDoc | Swagger UI | Ships with @nestjs/swagger, zero extra config |
| 12 | OpenHours enforcement | Hard block vs soft warning | Soft warning only in Phase 1 | Hard enforcement is complex edge case; noted for Phase 2 |
| 13 | Custom domain SSL | Auto-provision vs manual | Manual CNAME + existing wildcard in Phase 1 | Auto-provisioning (cert-manager/ACME) is Phase 2 |
| 14 | Mobile push notifications | FCM + APNs vs Expo Push | Expo Push Service | Wraps FCM/APNs, zero native config for development |
