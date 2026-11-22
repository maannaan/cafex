# Project Audit & Discovery Report (Phase 0)
**Project:** Premium Immersive 3D Cafe Commerce Platform  
**Workspace:** `/Users/apple/Desktop/Manan/Cafex`  
**Date:** November 22, 2026  
**Status:** Phase 0 Complete — Awaiting Owner Approval for Phase 1  

---

## 1. Executive Summary

This project establishes a production-ready, visually distinctive digital commerce and experience platform for an artisan cafe. Rather than deploying a generic template or gimmicky 3D demos, this system connects the physical atmosphere, materials, products, and customer journey of the cafe with a robust, secure, and performant commercial engine.

The platform architecture comprises three integrated pillars:
1. **Immersive 3D Experience:** WebGL/Three.js-powered visual highlights utilizing inspected and optimized 3D assets, controlled scroll animations, and graceful static fallbacks for devices without WebGL support.
2. **Commercial Storefront:** High-converting, mobile-first ordering flow featuring full menu exploration, product customization (variants and add-ons), cart management, server-authoritative checkout, payment provider integration, order tracking, and table reservations.
3. **Operational Business Management Platform:** A role-based admin dashboard enabling the cafe owner and authorized staff to manage categories, products, prices, availability, orders, reservation queues, discount codes, and operational settings without editing source code.

---

## 2. Source of Truth Analysis

The primary specification document [`immersive_3d_cafe_website_blueprint.html`](file:///Users/apple/Desktop/Manan/Cafex/immersive_3d_cafe_website_blueprint.html) was thoroughly parsed and analyzed.

### Key Architectural Mandates Extracted:
- **Progressive Enhancement:** 3D elements must enhance brand storytelling and product appreciation without obstructing navigation, accessibility, or core checkout flows. Core commerce must function cleanly if WebGL fails or is disabled.
- **Server-Authoritative Business Logic:** The frontend must never calculate final order totals or dictate payment state transitions. Prices, taxes, discounts, delivery fees, and stock availability must be calculated and validated exclusively on the backend.
- **Strict Payment Reconciliation:** Payment confirmation relies solely on cryptographically verified asynchronous backend webhooks with idempotency controls. Front-end redirect parameters are never trusted.
- **Reservation Integrity:** Table availability and slot allocations must be computed on the server with transactional overbooking protection.
- **Role-Based Access Control (RBAC):** Admin endpoints are protected by server-side guards ensuring staff roles cannot access unauthorized operational or configuration settings.
- **Zero Fabricated Business Data:** All brand identifiers, product catalogs, pricing, operating hours, and location data must remain clearly marked placeholders until verified and supplied by the cafe owner.

---

## 3. Workspace & Repository Inspection

An exhaustive audit of the workspace directory `/Users/apple/Desktop/Manan/Cafex` and relevant parent/download directories was performed:

| Target Path | Present? | Contents & Observations |
|---|---|---|
| `/Users/apple/Desktop/Manan/Cafex` | Yes | Initial state contained only `immersive_3d_cafe_website_blueprint.html` (49,342 bytes). No prior application code, package manifests, or database schemas exist. Clean-slate scaffolding is required. |
| `/Users/apple/Desktop/Manan/Cafex/assets-source` | No | Directory to be created to hold original 3D models and raw media before web compilation. |
| `/Users/apple/Downloads/coffee_mug_school_project.zip` | Yes | Downloaded Nov 22, 2026 (19:27). Contains glTF 2.0 coffee mug model with textures and CC-BY-4.0 license. Verified as the primary downloaded asset. |
| Other System 3D Files | Yes | Checked `footwear_fantasia`, `scanned_adidas_sports_shoe`, and `moon_shoes` in Downloads/Demo-ecom. Confirmed these are footwear assets from earlier unrelated tasks and excluded them from this cafe project. |

---

## 4. Development Environment Inspection

The local machine's toolchain and system dependencies were inspected:

| Tool / Runtime | Detected Version | Health Status / Operational Notes |
|---|---|---|
| **Operating System** | macOS Darwin 24.3.0 | Verified. Clean POSIX environment. |
| **Node.js** | v25.8.2 | Verified (`/usr/local/bin/node`). Note: Resolved dynamic library linking (`libllhttp.9.4.3.dylib` -> `libllhttp.9.3.dylib`). |
| **npm** | 11.11.1 | Verified (`/usr/local/bin/npm`). Ready for package installations. |
| **Python** | 3.9.6 | Verified (`/usr/bin/python3`). Used for asset parsing and script automations. |
| **Docker** | 29.6.1 (build 8900f1d) | Verified (`/usr/local/bin/docker`). Suitable for containerized PostgreSQL, Redis, and local services. |
| **Git** | 2.50.1 (Apple Git-155) | Verified. Repository tracking ready to initialize. |
| **Homebrew** | 7.0.12 | Verified (`/usr/local/bin/brew`). Available for system-level utilities. |

---

## 5. 3D Asset Inspection Summary

Detailed findings from the technical audit of downloaded 3D assets:

1. **Inspected Primary Asset (`coffee_mug_school_project.zip`):**
   - **Title:** Coffee Mug (School Project)
   - **Creator:** Ole Gunnar Isager (FrenchBaguette on Sketchfab)
   - **License:** Creative Commons Attribution 4.0 International (CC-BY-4.0). **Commercial usage is legally permitted** with mandatory author attribution.
   - **Format:** glTF 2.0 (`scene.gltf` 5.74 KB, `scene.bin` 32.16 KB, two PNG textures 583 KB).
   - **Polygon Complexity:** 1,032 triangles (Mug mesh: 992 tris; Coffee liquid surface: 40 tris). Very lightweight; ideal for 60fps mobile and desktop WebGL rendering.
   - **Geometry & Coordinate Issue Discovered:** The raw mesh coordinates are translated away from origin (`min: [6.68, 25.29, -9.73]`, `max: [9.46, 28.21, -6.56]`) due to FBX export matrices. **Action Required:** Normalize pivot to center `(0, 0, 0)` and re-export as a unified binary `.glb` with Draco compression and WebP textures (~180 KB target size).

2. **Asset Coverage Gaps for Full Blueprint Scope:**
   - **Coffee Beans:** Required for ambient particles/hero scroll animation. (Can be procedurally generated or sourced under permissive license).
   - **Pastry / Dessert Models:** Required if pastry signature showcase is enabled.
   - **Cafe Interior Environment:** Architectural model or stylized diorama for atmosphere section.
   - **Static Poster Fallbacks:** High-resolution WebP renders of 3D objects for instantaneous First Contentful Paint (FCP) and non-WebGL devices.

---

## 6. Missing Cafe Business Information

To avoid fabricating business information, the following data points are flagged for owner input:

| Information Category | Status | Action / Placeholder Strategy |
|---|---|---|
| **Cafe Name & Branding** | Missing | Using temporary identifier `Cafex Artisan Roastery` with clean minimalist typography until logo SVG and typography guidelines are provided. |
| **Color Palette & Visual Mood** | Missing | Using warm espresso tones (`#241B16`, `#8B5537`, `#D9B58C`, `#FBF8F2`, `#25221F`) matching the blueprint specification. |
| **Menu Items & Pricing** | Missing | Using realistic artisan cafe sample menu (Espresso, Cortado, Flat White, Cold Brew, Pour Over, Croissant, Pain au Chocolat) with prices in minor currency units (paise/cents). |
| **Fulfilment Model** | Missing | Defaulting to "Pickup at Counter" and "Dine-in Table Service". Delivery module will remain feature-flagged until delivery zones and fleet parameters are defined. |
| **Physical Address & Hours** | Missing | Using clearly marked placeholder address and standard operational hours (07:30 – 20:00). |
| **Table Capacity & Reservation Rules** | Missing | Defaulting to 8 bookable tables, 90-minute slot durations, and 15-minute grace period with owner confirmation queue. |
| **Payment Provider Account** | Missing | Configured for Razorpay Sandbox (with Stripe fallback adapter architecture). |

---

## 7. Technical & Operational Risk Assessment

| Risk Description | Severity | Impact | Mitigation Strategy |
|---|---|---|---|
| **Mobile WebGL Performance & Battery Drain** | High | Low framerates, UI jank, elevated bounce rates on budget phones. | Single Canvas architecture; lazy mount on scroll; limit scene DPR to 1.5; pause animations when off-screen or tab hidden; honor `prefers-reduced-motion`; serve static poster fallback on low-end hardware. |
| **Client-Side Pricing & Cart Tampering** | Critical | Financial loss, fraudulent order submission. | Server-authoritative quote engine (`POST /api/v1/orders/quote`). Client only passes item IDs, variant IDs, add-on IDs, and quantities. Server recalculates and locks totals in DB before payment session creation. |
| **Duplicate Payment Processing & Webhook Races** | High | Double order fulfillment or orphaned payments. | Idempotency key tracking on order creation; database transactions with optimistic locking; verify HMAC-SHA256 signature on every webhook. |
| **Reservation Overbooking during Peak Traffic** | Medium | Customer friction and cafe seating overflow. | Atomic slot decrement with PostgreSQL transactional constraints or serializable isolation level for booking commits. |
| **WebGL Context Loss / Browser Crash** | Medium | Broken page layout or blank screen. | React Three Fiber `ErrorBoundary` wrapping every 3D viewport that automatically swaps the canvas with a responsive WebP poster image and CSS-based subtle motion. |

---

## 8. Verification Matrix: Explicit Categorization

### A. What Was Actually Inspected
1. Entire workspace `/Users/apple/Desktop/Manan/Cafex`.
2. Source specification [`immersive_3d_cafe_website_blueprint.html`](file:///Users/apple/Desktop/Manan/Cafex/immersive_3d_cafe_website_blueprint.html).
3. Downloads directory `/Users/apple/Downloads` and archive `coffee_mug_school_project.zip`.
4. Extracted GLTF structure: JSON manifest, accessors, buffer views, mesh primitives, material definitions, textures, and licensing file.
5. Local machine runtime: Node.js, npm, Python 3, Docker, Git, and Homebrew.

### B. What Was Verified
1. Node.js v25.8.2 and npm 11.11.1 run commands reliably in the local shell.
2. Docker daemon is installed and available for spinning up PostgreSQL.
3. The coffee mug 3D model contains exactly 1,032 triangles, 2 PBR materials, and 2 PNG textures.
4. The license for `coffee_mug_school_project.zip` is CC-BY-4.0, which grants legal commercial usage subject to attribution.
5. There are no pre-existing conflicts, outdated codebases, or legacy dependencies in `Cafex`.

### C. What Was Assumed
1. A monorepo structure (`apps/web` + `apps/api` + `packages/shared-types`) is the cleanest structure for co-locating the Next.js frontend, NestJS API, and shared TypeScript DTOs.
2. Razorpay or Stripe sandbox credentials will be supplied by the user during Phase 5.
3. Default currency is Indian Rupee (INR) / Minor units (Paise), adaptable to USD / Cents via configuration.
4. The coffee mug model will serve as the primary hero 3D model and signature espresso showcase item.

### D. What Information Is Missing (Awaiting Owner Input)
1. Official cafe brand name, logo vectors, and typography selection.
2. Authentic cafe photography (counter, seating, roasting area, products).
3. Verified menu items, accurate retail pricing, variant options, and ingredient/allergen disclosures.
4. Actual cafe operating hours, address, and Google Maps embed location.
5. Confirmation of reservation policy (instant booking vs. owner manual approval).
6. Target payment gateway credentials (Razorpay Key ID & Key Secret for sandbox).

### E. What Needs Explicit Owner Approval Before Phase 1
1. **Architectural Layout:** Monorepo with Next.js (App Router) + NestJS (REST API) + PostgreSQL/Prisma.
2. **3D Asset Pipeline:** Centering, optimizing, and packaging `coffee_mug_school_project` as the primary interactive 3D hero model, complemented by procedurally generated coffee beans.
3. **Execution Plan:** Approval to proceed with **Phase 1: Project Foundation & Database Schema**.

