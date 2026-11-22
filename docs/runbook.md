# Operational Runbook & Admin Guide
**Project:** Premium Immersive 3D Cafe Commerce Platform  
**Document:** `docs/runbook.md`  
**Date:** November 22, 2026  
**Status:** Production Ready  

---

## 1. Quick Start & Local Execution

### Services Architecture:
- **Web Storefront:** `http://localhost:3000`
- **REST API Backend:** `http://localhost:4000/api/v1`
- **PostgreSQL Database:** `localhost:5432` (`cafex_db`, user: `cafex_user`)
- **Admin Portal:** `http://localhost:3000/admin`

### Starting Services:
```bash
# 1. Start Database Container
npm run db:up

# 2. Start NestJS Backend
cd apps/api && npm run start

# 3. Start Next.js Frontend
cd apps/web && npm run start
```

---

## 2. Admin Portal & Staff Operations

### Default Admin Credentials:
- **Login URL:** `http://localhost:3000/admin`
- **Email:** `admin@cafexartisan.com`
- **Password:** `CafexAdmin2026!`
- **Role:** `ADMIN`

### Operational Workflows:

#### A. Managing Live Order Queue:
1. Open the **Orders Queue** tab.
2. Orders arrive in `PLACED` status after verified payment.
3. Tap **Accept Order** to acknowledge receipt.
4. Tap **Start Brewing** when barista begins extraction or oven warm.
5. Tap **Mark Ready** when plated on counter or bagged for pickup.
6. Tap **Complete Handover** upon handing order to customer.
7. Tap **Cancel** if customer requests cancellation before preparation starts.

#### B. Managing Menu & Pricing:
1. Open the **Menu Manager** tab.
2. Toggle **In Stock / Sold Out** switch. Updates take effect immediately across all customer sessions without code redeployment.
3. Edit prices inline (e.g. adjust base price from ₹240 to ₹260).

#### C. Managing Seating & Reservations:
1. Open the **Reservations** tab.
2. View incoming guest bookings sorted chronologically by slot.
3. Tap **Confirm** or **Decline** with automated customer notification.

---

## 3. Database Backup & Disaster Recovery Runbook

### Automatic Daily Backup:
```bash
# Run PostgreSQL logical backup to SQL file
docker exec cafex-postgres pg_dump -U cafex_user -d cafex_db > infra/deployment/backup_$(date +%Y%m%d).sql
```

### Full Database Restoration Procedure:
```bash
# 1. Ensure target database exists
docker exec -i cafex-postgres psql -U cafex_user -c "DROP DATABASE IF EXISTS cafex_db;"
docker exec -i cafex-postgres psql -U cafex_user -c "CREATE DATABASE cafex_db;"

# 2. Restore from backup SQL file
docker exec -i cafex-postgres psql -U cafex_user -d cafex_db < infra/deployment/cafex_backup.sql
```

---

## 4. Payment Reconciliation & Webhook Diagnostics

- The backend verifies provider HMAC-SHA256 signatures before altering order state.
- Webhook endpoint: `POST /api/v1/payments/webhook`
- Idempotency is enforced: duplicate webhook callbacks from network retries are recognized and safely acknowledged without double processing.
- Sandbox testing endpoint: `POST /api/v1/payments/verify-sandbox` allows end-to-end purchasing simulation during staging reviews.

---

## 5. 3D Model Attribution & Licensing

- The signature 3D coffee cup model is based on *"Coffee Mug (School Project)"* by **Ole Gunnar Isager (FrenchBaguette)** licensed under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/).
- Attribution is permanently displayed in the public website footer colophon and documented in `docs/3d-asset-inventory.md`.
