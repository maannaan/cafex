# Actionable Development Roadmap & Task Breakdown
**Project:** Premium Immersive 3D Cafe Commerce Platform  
**Document:** `docs/development-roadmap.md`  
**Date:** November 22, 2026  
**Status:** Phase 0 Completed — Ready for Phase 1 Approval  

---

## 1. Roadmap Overview & Execution Strategy

In strict adherence to the project specification, development is divided into sequential, verifiable phases. Work does not advance to subsequent phases without completing the exit gate and obtaining verification.

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 0: Discovery, 3D Asset Audit & Architecture (COMPLETE) │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: Project Scaffolding, Database Schema & Health API   │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: Design System & Responsive Public UI               │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: 3D Scene Integration, Motion & Fallbacks           │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: Backend Engines & Admin Operations Dashboard       │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: Commerce, Payment Provider Sandbox & Reservations  │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 6: Testing, QA Hardening & Performance Profiling      │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 7: Production Deployment & Infrastructure Setup       │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 8: Owner Handover & Operational Runbooks              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Phase-by-Phase Task Breakdown & Exit Criteria

### PHASE 0 — Discovery and Repository Audit
*Status: COMPLETED*
- [x] Read and analyze `immersive_3d_cafe_website_blueprint.html`.
- [x] Audit workspace `/Users/apple/Desktop/Manan/Cafex`.
- [x] Locate and analyze downloaded 3D assets in `/Users/apple/Downloads/coffee_mug_school_project.zip`.
- [x] Inspect local runtime environment (Node.js v25.8.2, npm 11.11.1, Docker 29.6.1, Python 3.9.6).
- [x] Identify missing cafe business information (Branding, menu, exact pricing, payment credentials).
- [x] Document deliverables:
  - `docs/project-audit.md`
  - `docs/3d-asset-inventory.md`
  - `docs/architecture.md`
  - `docs/development-roadmap.md`
- **Exit Gate:** Owner approves architecture proposal, 3D asset conversion plan, and development roadmap before Phase 1 begins.

---

### PHASE 1 — Project Foundation & Database Setup
*Status: PENDING OWNER APPROVAL*
- [ ] Initialize monorepo structure (`apps/web`, `apps/api`, `packages/shared-types`).
- [ ] Scaffold Next.js 15+ (App Router) in `apps/web` with TypeScript, Tailwind CSS, Lucide icons.
- [ ] Scaffold NestJS REST API in `apps/api` with TypeScript, class-validator, Helmet, CORS.
- [ ] Scaffold `packages/shared-types` with shared DTOs and Enums.
- [ ] Set up local PostgreSQL via Docker Compose (`infra/docker/docker-compose.yml`).
- [ ] Configure Prisma ORM with the complete relational schema defined in `docs/architecture.md`.
- [ ] Execute initial database migration (`npx prisma migrate dev --name init`).
- [ ] Implement database seed script (`prisma/seed.ts`) populating artisan categories, sample products, option groups, capacity rules, and initial admin account.
- [ ] Implement `/health` endpoints on both frontend and backend.
- [ ] Create `.env.example` templates with explicit variable keys.
- **Verification Commands:**
  - `npm run build` across all workspaces.
  - `curl http://localhost:4000/api/v1/health` -> `{"status":"ok"}`.
  - `curl http://localhost:3000/api/health` -> `{"status":"ok"}`.
  - `npx prisma studio` connects and displays seeded categories and products.
- **Exit Gate:** Both services build without TypeScript or lint errors and connect to PostgreSQL.

---

### PHASE 2 — Design System & Responsive Public UI
*Status: QUEUED*
- [ ] Define design system tokens in Tailwind config (Warm espresso tones, typography scale, elevated cards).
- [ ] Build global layout components: Header, Navigation bar, Mobile drawer menu, Announcement banner, Footer.
- [ ] Implement Homepage components:
  - Hero banner with CTA ("Explore Menu", "Reserve Table").
  - Signature Selections carousel with authentic dietary badges.
  - Cafe Narrative / About preview section.
  - Atmosphere gallery grid.
  - Operating hours and location widget.
- [ ] Implement Menu page (`/menu`):
  - Category filter tabs (Espresso, Brewed, Cold, Bakery, Specialty).
  - Dietary filters (Vegan, Gluten-Free, Dairy-Free).
  - Product card with image, price, allergen flags, and "Customize" action.
- [ ] Implement Product Detail modal/page:
  - Variant selection (Small, Medium, Large).
  - Option groups (Milk Choice: Whole, Oat, Almond; Sweetness; Extra Shot).
  - Real-time client-side price preview before adding to cart.
- [ ] Implement About & Story page (`/about`) and Contact/Visit page (`/visit`).
- [ ] Add loading skeletons, empty states, and 404/500 error boundaries.
- **Verification Commands:**
  - Visual review across 375px (mobile), 768px (tablet), 1280px (desktop).
  - Verify zero console errors or hydration mismatches.
- **Exit Gate:** All public pages display fully populated sample data with responsive navigation.

---

### PHASE 3 — 3D Asset Integration & Motion Experience
*Status: QUEUED*
- [ ] Copy original asset `coffee_mug_school_project.zip` into `assets-source/`.
- [ ] Execute asset conversion script:
  - Center mesh bounds to `(0, 0, 0)`.
  - Re-export as single binary `.glb`.
  - Apply Draco mesh compression and convert textures to WebP/KTX2.
  - Place runtime asset in `apps/web/public/models/hero/coffee-cup.glb`.
- [ ] Build `SceneCanvas.tsx` with dynamic import, DPR limits, and WebGL error boundary.
- [ ] Build `HeroScene.tsx`:
  - Three.js studio lighting (ambient + directional key light).
  - Orbit/pointer slight interaction.
  - GSAP ScrollTrigger coupling: cup rotates and tilts gently as the user scrolls into the menu section.
- [ ] Build instanced floating coffee bean particle system (`BeanParticles.tsx`) with GPU instancing.
- [ ] Implement static poster fallback (`/posters/hero-cup.webp`) displayed during loading or when WebGL is unsupported.
- [ ] Implement performance guards:
  - `IntersectionObserver` disconnects render loop when off-screen.
  - Listen to `prefers-reduced-motion` and disable camera/object motion.
  - Page Visibility API pauses WebGL loop when tab is hidden.
- [ ] Test WebGL crash recovery and fallback rendering.
- **Verification Commands:**
  - Profile in Chrome DevTools: maintain 60 fps on desktop, $\ge 50$ fps on throttled mobile.
  - Disable WebGL in browser settings; verify clean poster fallback with zero crashes.
- **Exit Gate:** 3D experience approved visually; does not obstruct scrolling or mobile touch interactions.

---

### PHASE 4 — Backend Engines & Owner Admin Dashboard
*Status: QUEUED*
- [ ] Implement Auth module in NestJS:
  - Email/password authentication with bcrypt hashing.
  - JWT / secure session cookie issuance.
  - Role-based authorization guard (`@Roles('ADMIN', 'MANAGER')`).
- [ ] Implement Catalog Admin APIs:
  - CRUD for categories, products, option groups, and add-ons.
  - Real-time product availability toggle (`PATCH /api/v1/admin/products/:id/availability`).
- [ ] Implement Order Management APIs:
  - Order queue query with status filters (`GET /api/v1/admin/orders`).
  - State machine transition endpoint (`PATCH /api/v1/admin/orders/:id/status`).
  - Cancellation reason logging.
- [ ] Implement Reservation Management APIs:
  - Slot capacity configuration (`GET/PUT /api/v1/admin/reservations/capacity`).
  - Reservation request review queue (`PATCH /api/v1/admin/reservations/:id/confirm`).
- [ ] Implement Business Settings API:
  - Update operating hours, cafe details, tax rates.
- [ ] Build Admin Dashboard UI in `apps/web/src/app/(admin)`:
  - Secure login portal.
  - Order management live board (Incoming, Preparing, Ready, Completed).
  - Menu catalog editor with inline price & availability switches.
  - Reservation calendar and slot manager.
  - Business analytics cards (Daily sales, order volume, popular drinks).
- **Verification Commands:**
  - Verify unauthorized users are blocked from admin routes (`401`/`403`).
  - Toggle a product's availability in admin; verify public `/menu` immediately reflects status.
- **Exit Gate:** Cafe owner can manage products, prices, availability, and order statuses via UI.

---

### PHASE 5 — Commerce Integration, Sandbox Payments & Reservations
*Status: QUEUED*
- [ ] Implement client-side Cart Store (`cartStore.ts`) using Zustand with local storage persistence.
- [ ] Build Slide-out Cart Drawer and Checkout form.
- [ ] Implement Server-Authoritative Pricing Engine (`POST /api/v1/orders/quote`):
  - Validates stock and pricing for all items and modifiers.
  - Applies coupon discount logic.
  - Computes tax and packaging/delivery fees in integer minor units.
- [ ] Implement Order Creation & Payment Session (`POST /api/v1/orders`):
  - Generates immutable order record in `PENDING_PAYMENT` state.
  - Creates sandbox payment session with Razorpay / Stripe.
- [ ] Implement Payment Webhook Handler (`POST /api/v1/payments/webhook`):
  - Verifies cryptographic HMAC-SHA256 signature from provider.
  - Verifies payload amount matches order `totalMinor`.
  - Atomically transitions order to `PLACED` and records payment ID.
  - Enforces idempotency to safely ignore duplicate webhook deliveries.
- [ ] Implement Public Order Confirmation & Lookup (`/orders/[orderNumber]`).
- [ ] Implement Reservation Booking Engine (`POST /api/v1/reservations`):
  - Computes available slots based on operating hours and capacity limits.
  - Enforces transactional concurrency to prevent overbooking.
- **Verification Commands:**
  - Execute end-to-end sandbox purchase with mock test card / UPI.
  - Test tampering with frontend cart price; verify backend rejects client-supplied total.
  - Fire duplicate webhook payload; verify order is not double-processed.
- **Exit Gate:** End-to-end purchasing and reservation booking work reliably in sandbox.

---

### PHASE 6 — QA Hardening, Testing & Optimization
*Status: QUEUED*
- [ ] Unit testing (Jest/Vitest): Pricing calculations, discount rules, state machine transitions, coupon validators.
- [ ] API integration tests (Supertest): Auth guards, order lifecycle, webhook signature verification.
- [ ] End-to-end testing (Playwright):
  - Customer browses menu -> adds customized item -> checks out -> pays -> views confirmation.
  - Admin logs in -> updates menu price -> accepts incoming order.
- [ ] Security testing: Check for OWASP Top 10 vulnerabilities, verify CORS, rate limiting, and SQL injection protection.
- [ ] Accessibility testing: Run axe-core automated audits, verify keyboard focus loops, color contrast, and ARIA labels.
- [ ] Performance profiling:
  - Run Google Lighthouse on mobile & desktop targets.
  - Verify LCP $\le 2.5$s, INP $\le 200$ms, CLS $\le 0.1$.
- **Verification Commands:**
  - `npm test` passes with $\ge 85\%$ coverage on critical business modules.
  - `npx playwright test` passes all critical user journeys.
- **Exit Gate:** Zero open high-severity security, functional, or accessibility defects.

---

### PHASE 7 — Production Deployment & Infrastructure
*Status: QUEUED*
- [ ] Build production-optimized multi-stage Dockerfiles for `web` and `api`.
- [ ] Configure Docker Compose production profile / cloud container manifest.
- [ ] Configure environment variables and production secrets.
- [ ] Run production database migrations and establish automated backup schedule.
- [ ] Configure CDN caching headers for GLB models (immutable, 1 year cache) and static assets.
- [ ] Perform live smoke tests on deployed staging environment.
- **Exit Gate:** Staging environment passes all automated smoke tests under SSL.

---

### PHASE 8 — Owner Handover & Documentation
*Status: QUEUED*
- [ ] Author Admin Operations Guide (managing menu, processing orders, managing reservations).
- [ ] Author Payment Reconciliation and Refund Runbook.
- [ ] Author Disaster Recovery and Database Backup/Restore Runbook.
- [ ] Deliver source repository and asset manifest with CC-BY-4.0 attribution records.
- **Exit Gate:** Cafe owner successfully executes a test order, menu change, and reservation.

