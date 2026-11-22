# CAFEX — Premium Immersive 3D Cafe Commerce Platform

A production-ready digital cafe commerce platform connecting physical cafe atmosphere, micro-lot roasting, and estate products with an interactive 3D WebGL experience, server-authoritative ordering engine, and business management operations.

---

## Architecture & Technology Stack

- **Frontend:** Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Zustand.
- **3D & Motion:** Three.js, React Three Fiber (`@react-three/fiber`), `@react-three/drei`, GSAP.
- **Backend API:** NestJS 10, TypeScript, REST APIs, class-validator, Helmet, CORS.
- **Database & ORM:** PostgreSQL 16 (Dockerized), Prisma ORM.
- **Authentication & RBAC:** JWT, Passport, Bcrypt password hashing, role guards (ADMIN, STAFF, CUSTOMER).
- **Commerce & Payments:** Server-authoritative quote engine, minor unit arithmetic (paise/cents), Razorpay/Stripe sandbox with HMAC-SHA256 signed webhook verification, idempotency locks.
- **Reservations:** Transactional slot capacity manager with real-time overbooking protection.

---

## Quick Start

### 1. Start Database Container
```bash
npm run db:up
```

### 2. Run Database Migrations & Seed
```bash
npm run db:push --workspace=@cafex/api
npm run db:seed --workspace=@cafex/api
```

### 3. Launch Development Servers
```bash
# Starts both Next.js frontend (port 3000) and NestJS API (port 4000)
npm run dev:all
```

- **Storefront:** [http://localhost:3000](http://localhost:3000)
- **Admin Portal:** [http://localhost:3000/admin](http://localhost:3000/admin) (Credentials: `admin@cafexartisan.com` / `CafexAdmin2026!`)
- **API Health:** [http://localhost:4000/api/v1/health](http://localhost:4000/api/v1/health)

---

## Automated Verification Suite

Run all 15 mandatory test scenarios:
```bash
node tests/verify-all-scenarios.mjs
```

---

## Documentation

- [Project Blueprint](file:///Users/apple/Desktop/Manan/Cafex/immersive_3d_cafe_website_blueprint.html)
- [Project Audit (Phase 0)](file:///Users/apple/Desktop/Manan/Cafex/docs/project-audit.md)
- [3D Asset Inventory](file:///Users/apple/Desktop/Manan/Cafex/docs/3d-asset-inventory.md)
- [System Architecture](file:///Users/apple/Desktop/Manan/Cafex/docs/architecture.md)
- [Development Roadmap](file:///Users/apple/Desktop/Manan/Cafex/docs/development-roadmap.md)
- [Operational Runbook](file:///Users/apple/Desktop/Manan/Cafex/docs/runbook.md)
- [Database Backup](file:///Users/apple/Desktop/Manan/Cafex/infra/deployment/cafex_backup.sql)
