# Service Registry

Complete reference for all backend microservices in the SwimBuddz platform.

## Service Overview

| Service | Port | Status | Key Responsibilities | Frontend Integration |
|---------|------|--------|---------------------|---------------------|
| **gateway_service** | 8000 | Production | API Gateway - Single entry point, request routing, data aggregation | All API calls route through this |
| **members_service** | 8001 | Production | Member profiles, registration, pending approvals | `/account/profile`, `/admin/members` |
| **sessions_service** | 8002 | Production | Session scheduling, session management | `/sessions`, `/admin/sessions` |
| **attendance_service** | 8003 | Production | Session check-ins, ride-share, attendance history | `/sessions/[id]/sign-in`, `/account/attendance` |
| **communications_service** | 8004 | Production | Announcements, notifications | `/announcements`, `/admin/announcements` |
| **payments_service** | 8005 | Production | Payment records, Paystack integration, payment intents | `/checkout`, `/account/billing` |
| **academy_service** | 8006 | Production | Programs, cohorts, enrollments, curriculum, progress tracking | `/academy/*`, `/account/academy/*`, `/admin/academy/*` |
| **events_service** | 8007 | Minimal | Community events, RSVPs | `/community/events/*` |
| **media_service** | 8008 | Minimal | Photo/video galleries, albums, site assets | `/gallery/*`, `/admin/gallery/*` |
| **transport_service** | 8009 | Production | Ride-sharing system, pickup locations, route management | `/admin/transport/*` |
| **store_service** | 8010 | Minimal | E-commerce, products, cart, orders, inventory | `/store/*`, `/admin/store/*` |
| **ai_service** | 8011 | Production | AI scoring: cohort complexity, coach grading, coach-cohort matching | Consumed by academy workflows (internal) |
| **volunteer_service** | 8012 | Production | Volunteer roles, opportunities, scheduling, hours tracking, tiers, rewards | `/community/volunteers/*`, `/admin/community/volunteers/*` |
| **wallet_service** | 8013 | Production | "Bubbles" closed-loop credit system, topups, transactions, grants, audit | `/account/wallet/*`, `/admin/wallet/*` |
| **pools_service** | 8014 | Production | Pool registry, partnership CRM, submissions workflow, assets/contacts/visits | `/admin/settings/pools/*`, public pool listings |
| **reporting_service** | 8015 | Production | Analytics & reports: member insights, community analytics, admin dashboards, seasonality forecasting | `/account/insights`, `/admin/analytics`, `/admin/reports/*` |
| **chat_service** | 8016 | Planned | Real-time messaging across cohorts, pods, events, trips, DMs; safeguarding enforcement. See [design doc](../design/CHAT_SERVICE_DESIGN.md) | `/account/chat/*`, `/admin/chat/*` (planned) |
| **identity_service** | — | Deprecated placeholder | Empty directory; authentication is handled by Supabase JWT via `libs/auth`. Not implementing — documented here so it isn't confused with a missing service. | N/A |

---

## Service Details

### 1. Gateway Service (Port 8000)

**Implementation:** `services/gateway_service/`

**Purpose:** Single HTTP entry point for all client applications (web, mobile). Routes requests to appropriate domain services.

**Architecture Pattern:**
- Stateless HTTP proxy for most endpoints
- Direct database queries for dashboard aggregations (performance optimization)
- Service discovery via Docker Compose network

**Key Endpoints:**
- `/api/v1/members/*` → Proxies to Members Service
- `/api/v1/sessions/*` → Proxies to Sessions Service
- `/api/v1/attendance/*` → Proxies to Attendance Service
- `/api/v1/announcements/*` → Proxies to Communications Service
- `/api/v1/payments/*` → Proxies to Payments Service
- `/api/v1/academy/*` → Proxies to Academy Service
- `/api/v1/volunteers/*` → Proxies to Volunteer Service
- `/api/v1/admin/volunteers/*` → Proxies to Volunteer Service
- `/api/v1/wallet/*` → Proxies to Wallet Service
- `/api/v1/admin/wallet/*` → Proxies to Wallet Service
- `/api/v1/me/dashboard` → Aggregates data from multiple services

**Dependencies:** All domain services

**README:** [gateway_service/README.md](../../swimbuddz-backend/services/gateway_service/README.md)

---

### 2. Members Service (Port 8001)

**Implementation:** `services/members_service/`

**Purpose:** Member profile management, registration workflow, membership status tracking.

**Key Models:**
- `Member` - Core member profile
- `PendingRegistration` - Registration workflow state

**Key Endpoints:**
- `POST /members/` - Create member profile
- `GET /members/me` - Get current member
- `PATCH /members/me` - Update profile
- `GET /members/admin` - List all members (admin)
- `PATCH /members/admin/{id}/status` - Update membership status (admin)

**Database:** `members` table, `pending_registrations` table

**Migrations:** Yes (Alembic)

**README:** [members_service/README.md](../../swimbuddz-backend/services/members_service/README.md)

---

### 3. Sessions Service (Port 8002)

**Implementation:** `services/sessions_service/`

**Purpose:** Swim session scheduling and management for all session types (club training, community meetups, open water, etc.).

**Key Models:**
- `Session` - All session types (club_training, community_meetup, trip, camp, open_water, scuba, etc.)

**Key Endpoints:**
- `POST /sessions/` - Create session (admin)
- `GET /sessions/` - List upcoming sessions
- `GET /sessions/{id}` - Get session details
- `PATCH /sessions/{id}` - Update session (admin)

**Database:** `sessions` table

**Migrations:** Yes (Alembic)

**README:** [sessions_service/README.md](../../swimbuddz-backend/services/sessions_service/README.md)

---

### 4. Attendance Service (Port 8003)

**Implementation:** `services/attendance_service/`

**Purpose:** Session attendance tracking, three-step sign-in flow, ride-share coordination, pool list generation.

**Key Models:**
- `SessionAttendance` - Attendance records with payment status, ride-share info, time variants

**Key Endpoints:**
- `POST /sessions/{id}/sign-in` - Sign in to session
- `GET /members/me/attendance` - Member attendance history
- `GET /sessions/{id}/attendance/admin` - Session attendance list (admin)
- `GET /sessions/{id}/pool-list` - Export pool list (admin)

**Database:** `session_attendance` table

**Migrations:** Yes (Alembic)

**README:** [attendance_service/README.md](../../swimbuddz-backend/services/attendance_service/README.md)

---

### 5. Communications Service (Port 8004)

**Implementation:** `services/communications_service/`

**Purpose:** Announcements, noticeboard, admin share helpers (WhatsApp/email formatting).

**Key Models:**
- `Announcement` - Noticeboard posts with categories (rain_update, schedule_change, event, competition, general)

**Key Endpoints:**
- `POST /announcements/` - Create announcement (admin)
- `GET /announcements/` - List announcements (public)
- `GET /announcements/{id}` - Get announcement details (public)

**Database:** `announcements` table

**Migrations:** Yes (Alembic)

**README:** [communications_service/README.md](../../swimbuddz-backend/services/communications_service/README.md)

---

### 6. Payments Service (Port 8005)

**Implementation:** `services/payments_service/`

**Purpose:** Payment record tracking, Paystack integration, payment intent creation, webhook handling.

**Key Models:**
- `PaymentRecord` - Payment transactions
- `PaymentIntent` - Paystack checkout sessions

**Key Endpoints:**
- `POST /payments/intents` - Create payment intent
- `GET /payments/` - List payments (admin)
- `POST /payments/webhook` - Paystack webhook handler
- `PATCH /payments/{id}/verify` - Manual payment verification (admin)

**Database:** `payment_records` table, `payment_intents` table

**Migrations:** Yes (Alembic)

**README:** [payments_service/README.md](../../swimbuddz-backend/services/payments_service/README.md)

---

### 7. Academy Service (Port 8006) ⭐ Production-Ready

**Implementation:** `services/academy_service/`

**Purpose:** Structured swim education programs with cohort-based learning, curriculum management, student progress tracking, milestone assessment.

**Status:** **Fully implemented backend, production-ready** with minor operational gaps (see [ACADEMY_REVIEW.md](../ACADEMY_REVIEW.md))

**Key Models (20,332 lines total):**
- **Program Management:** `AcademyProgram`, `ProgramCurriculum`, `CurriculumWeek`, `CurriculumLesson`
- **Skills:** `Skill`, `LessonSkill`
- **Cohorts:** `Cohort`, `CohortResource`
- **Enrollment:** `Enrollment`, `Milestone`, `StudentProgress`
- **13 comprehensive enums:** `ProgramLevel`, `BillingType`, `CohortStatus`, etc.

**Key Endpoints (33+ total):**
- **Programs:** `GET /programs/`, `POST /programs/`, `GET /programs/{id}`, `PATCH /programs/{id}`
- **Cohorts:** `GET /cohorts/`, `GET /cohorts/open`, `POST /cohorts/`, `GET /cohorts/{id}`
- **Enrollments:** `POST /enrollments/me`, `GET /my-enrollments`, `GET /enrollments/{id}`, `PATCH /enrollments/{id}`
- **Progress:** `GET /enrollments/{id}/progress`, `POST /enrollments/{id}/progress`
- **Curriculum Builder:** Complete curriculum editor API

**Database:** 11 migration files in `alembic/versions/`

**Frontend Integration:** 37 pages across member, admin, and public routes

**Known Gaps:**
- Coach dashboard implementation (pages exist but empty)
- Coach auth role (`require_coach` dependency)
- Capacity enforcement in enrollment endpoint
- Waitlist auto-promotion
- Manual payment verification for members
- Email notifications for enrollment lifecycle

**README:** [academy_service/README.md](../../swimbuddz-backend/services/academy_service/README.md)

**Deep Dive:** [ACADEMY_REVIEW.md](../ACADEMY_REVIEW.md) (784 lines)

---

### 8. Events Service (Port 8007)

**Implementation:** `services/events_service/`

**Purpose:** Community events distinct from recurring sessions (one-off meets, trips, camps).

**Status:** Minimal implementation

**Key Models:**
- `Event` - Community events
- `EventRSVP` - Event registrations

**Database:** `events` table, `event_rsvps` table

**Migrations:** Yes (Alembic)

**README:** [events_service/README.md](../../swimbuddz-backend/services/events_service/README.md)

---

### 9. Media Service (Port 8008)

**Implementation:** `services/media_service/`

**Purpose:** Photo and video management, gallery creation, site asset storage.

**Status:** Minimal implementation

**Key Models:**
- `MediaItem` - Individual photos/videos
- `Album` - Media collections
- `Gallery` - Public galleries
- `SiteAsset` - Homepage media, banners

**Database:** `media_items` table, `albums` table, `galleries` table, `site_assets` table

**Migrations:** Yes (Alembic)

**README:** [media_service/README.md](../../swimbuddz-backend/services/media_service/README.md)

---

### 10. Transport Service (Port 8009)

**Implementation:** `services/transport_service/`

**Purpose:** Ride-sharing system for session transportation, pickup locations, route management.

**Status:** Production

**Key Models (6,229 lines total):**
- `RideArea` - Geographic service areas
- `PickupLocation` - Designated pickup points
- `RouteInfo` - Route details between locations
- `RideBooking` - Member ride bookings

**Database:** `ride_areas` table, `pickup_locations` table, `route_info` table, `ride_bookings` table

**Migrations:** Yes (Alembic)

**README:** [transport_service/README.md](../../swimbuddz-backend/services/transport_service/README.md)

---

### 11. Store Service (Port 8010)

**Implementation:** `services/store_service/`

**Purpose:** E-commerce platform for swim gear, merchandise, and equipment sales.

**Status:** Minimal implementation (extensive models but basic routes)

**Key Models (998 lines total):**
- **Products:** `Product`, `ProductVariant`, `ProductCategory`
- **Inventory:** `InventoryItem`, `StockMovement`
- **Orders:** `Order`, `OrderItem`, `OrderStatus`
- **Cart:** `ShoppingCart`, `CartItem`
- **Fulfillment:** Order processing and shipping

**Database:** 10+ tables for complete e-commerce workflow

**Migrations:** Yes (Alembic)

**Frontend Integration:** Full store routes implemented (`/store/*`, `/admin/store/*`)

**README:** [store_service/README.md](../../swimbuddz-backend/services/store_service/README.md)

**Architecture Docs:**
- [STORE_ARCHITECTURE.md](../STORE_ARCHITECTURE.md)
- [STORE_OPERATIONS.md](../STORE_OPERATIONS.md)
- [STORE_FRONTEND.md](../STORE_FRONTEND.md)

---

### 12. AI Service (Port 8011)

**Implementation:** `services/ai_service/`

**Purpose:** Machine-scoring engine for academy and coaching workflows. Currently produces cohort complexity scores, coach performance grades, and coach-cohort match suggestions. Designed to grow into broader ML/AI scoring across the platform.

**Status:** Production

**Key Modules:**
- `scoring/` — scoring logic (complexity, grading, suggestions)
- `providers/` — provider abstractions (LLM / deterministic scorers)
- `models/core.py` — scoring records, audit/history

**Key Endpoints (member/admin-facing via gateway):**
- `POST /ai/score/cohort-complexity` — score a cohort's complexity
- `POST /ai/score/coach-grade` — grade coach performance
- `POST /ai/score/suggest-coach` — recommend coaches for a cohort

**Consumers:** Primarily `academy_service` admin workflows; frontend surfaces under `/admin/academy/*`.

**Database:** Scoring records and audit history (migrations present)

**Note:** Historically undocumented in this registry — added 2026-04-19.

---

### 13. Volunteer Service (Port 8012)

**Implementation:** `services/volunteer_service/`

**Purpose:** Volunteer programme: roles, opportunities, scheduling, hours tracking, tiers, rewards.

**Status:** Production

**Key Endpoints:**
- `/volunteers/*` — volunteer self-service
- `/admin/community/volunteers/*` — admin management

**Frontend Integration:** `/community/volunteers/*`, `/admin/community/volunteers/*`

**Migrations:** Yes (Alembic)

**Note:** Overview row existed previously but detail section was missing — added 2026-04-19.

---

### 14. Wallet Service (Port 8013)

**Implementation:** `services/wallet_service/`

**Purpose:** "Bubbles" closed-loop credit system. Members top up Bubbles via Paystack and spend them on sessions, events, academy fees, store purchases, and transport. Supports promotional grants, admin adjustments, audit logging, and service-to-service debit/credit.

**Status:** Production (Phase 1 active, Phases 3-5 stub models)

**Key Models (13 tables, 10 enums):**
- **Phase 1 (Active):** `Wallet`, `WalletTransaction`, `WalletTopup`, `PromotionalBubbleGrant`, `WalletAuditLog`
- **Phase 3 (Stub):** `ReferralCode`, `ReferralRecord`, `RewardRule`, `WalletEvent`, `MemberRewardHistory`
- **Phase 4 (Stub):** `FamilyWalletLink`
- **Phase 5 (Stub):** `CorporateWallet`, `CorporateWalletMember`

**Key Endpoints (26 total):**
- **Member (10):** `GET /wallet/me`, `POST /wallet/create`, `POST /wallet/topup`, `GET /wallet/topup/{id}`, `GET /wallet/topups`, `GET /wallet/transactions`, `GET /wallet/transactions/{id}`, `POST /wallet/debit`, `POST /wallet/credit`, `POST /wallet/check-balance`
- **Admin (10):** `GET /admin/wallet/wallets`, `GET /admin/wallet/wallets/{id}`, `POST .../freeze`, `POST .../unfreeze`, `POST .../adjust`, `POST /admin/wallet/grants`, `GET /admin/wallet/grants`, `GET /admin/wallet/stats`, `GET /admin/wallet/transactions`, `GET /admin/wallet/audit-log`
- **Internal (6):** `POST /internal/wallet/debit`, `POST /internal/wallet/credit`, `GET /internal/wallet/balance/{auth_id}`, `POST /internal/wallet/check-balance`, `POST /internal/wallet/confirm-topup`, `POST /internal/wallet/create`

**Database:** 13 tables across 5 implementation phases

**Migrations:** Yes (Alembic)

**Frontend Integration:** `/account/wallet/*`, `/admin/wallet/*`

**Service Communication:**
- **Payments Service** calls `/internal/wallet/confirm-topup` after successful Paystack payment
- **Members Service** calls `/internal/wallet/create` during registration
- **Sessions, Academy, Store, Transport, Events** call `/internal/wallet/debit` and `/internal/wallet/credit` for fee collection and refunds

---

### 15. Pools Service (Port 8014)

**Implementation:** `services/pools_service/`

**Purpose:** Pool venue registry and partnership CRM. Tracks pool facilities, partnership agreements, contacts, on-site assets, status changes, visits, and handles the submissions workflow for new pool partnerships.

**Status:** Production

**Key Models:**
- `Pool`, `PoolContact`, `PoolAgreement`, `PoolAsset`
- `PoolStatusChange`, `PoolVisit`, `PoolSubmission`

**Key Endpoints:**
- `public.py` — public pool listings
- `submissions.py` — public-facing submission intake for new pool partnerships
- `admin.py`, `admin_related.py`, `admin_submissions.py` — admin CRM

**Database:** Full partnership CRM schema (migrations present)

**Frontend Integration:** `/admin/settings/pools/*`; public pool listing surfaces

**Note:** Historically undocumented in this registry — added 2026-04-19.

---

### 16. Reporting Service (Port 8015)

**Implementation:** `services/reporting_service/`

**Purpose:** Analytics and reporting across members, community, and admin. Produces member insights (quarterly reports, progress cards), community analytics, administrative dashboards, and seasonality forecasting tied to the SEASONALITY_MODEL.

**Status:** Production

**Key Modules:**
- `models/core.py`, `models/enums.py`, `models/seasonality.py`, `models/flywheel.py`
- `tasks/` — background generation of reports + flywheel snapshots (ARQ cron)
- `assets/` — static assets used in reports
- `cli/` — CLI entrypoints for on-demand report generation

**Key Endpoints:**
- `/reports/*` — member reports
- `/reports/community/*` — aggregate community insights
- `/admin/reports/*` — business dashboards
- `/admin/reports/seasonality/*` — Lagos demand/seasonality forecasts
- `/admin/reports/flywheel/*` — cohort fill, funnel conversion, wallet ecosystem snapshots (see [FLYWHEEL_METRICS_DESIGN.md](../reference/FLYWHEEL_METRICS_DESIGN.md))
- `internal.py` — service-to-service report fetches

**Flywheel responsibilities (added 2026-04-29):**
- Snapshot tables: `cohort_fill_snapshots` (daily), `funnel_conversion_snapshots` (weekly), `wallet_ecosystem_snapshots` (weekly).
- Computed by ARQ tasks on the `arq:reporting` queue; refreshable on-demand via `POST /admin/reports/flywheel/refresh`.
- Calls cross-service prerequisite endpoints: `academy/internal/cohorts(+enrollment-counts)`, `members/internal/joined-tier`, `members/internal/{id}/tier-history`, `wallet/internal/ecosystem-stats`.
- Funnel breakdown by `acquisition_source` enum on `member_profiles` (typed at registration; legacy `how_found_us` preserved as free-form fallback).

**Frontend Integration:** `/account/insights`, `/admin/analytics`, `/admin/flywheel`

**Note:** Historically undocumented in this registry — added 2026-04-19; flywheel metrics added 2026-04-29.

---

### 17. Chat Service (Port 8016) — Planned

**Implementation:** `services/chat_service/` (scaffolding pending)

**Purpose:** Real-time, persistent, role-aware messaging across SwimBuddz. Covers cohort channels, pod channels, event channels, trip channels, location/community channels, alumni, support DMs, and coach↔parent DMs. Safeguarding rules enforced at the API boundary.

**Status:** **Planned — design approved, Phase 0 scaffolding not yet committed.** Port 8016 (reassigned from initial 8011 on 2026-04-19 due to conflict with ai_service).

**Design doc:** [docs/design/CHAT_SERVICE_DESIGN.md](../design/CHAT_SERVICE_DESIGN.md)

**Key planned models:**
- `ChatChannel`, `ChatChannelMember`, `ChatMessage`
- `ChatMessageReaction`, `ChatMessageRead`, `ChatMessageReport`, `ChatAuditLog`

**Planned frontend integration:** `/account/chat/*`, `/admin/chat/*`

---

### 18. Identity Service (Deprecated Placeholder)

**Implementation:** `services/identity_service/` (empty directory — 2 lines total, not in any docker-compose)

**Purpose:** Previously reserved for identity aggregation / RBAC coordination. No longer planned.

**Status:** **Deprecated placeholder.** Not implementing.

**Current approach:** Authentication is handled via Supabase JWT validation in `libs/auth/dependencies.py`. RBAC is checked per-service using shared helpers. No dedicated identity service needed.

**Recommendation:** Directory could be deleted; kept for now to avoid churn and because deletion requires cross-repo grep to ensure nothing references it. Documented here so it's not mistaken for a missing/broken service.

---

## Service Communication Patterns

### Request Flow
```
Client → Gateway (8000) → Domain Service (8001-8016) → Database
```

### Inter-Service Communication
Services communicate via HTTP through the Gateway when needed. Direct service-to-service calls are avoided to maintain clear boundaries.

### Authentication
All services use shared JWT validation from `libs/auth/dependencies.py`. Supabase access tokens are decoded and validated at the service level.

---

## Development Notes

### Adding a New Service

1. Create service directory: `services/<service_name>/`
2. Implement FastAPI app with models, schemas, routes
3. Add to `docker-compose.yml` with unique port
4. Create database migrations if needed
5. Add proxy routes in `gateway_service` if exposing externally
6. Update this registry
7. Document API endpoints in API_ENDPOINTS.md

### Service Isolation

Each service must:
- Run in its own Docker container
- Have independent database migrations
- Handle its own domain logic
- Not directly import code from other services
- Communicate only via HTTP or shared database tables

### Port Allocation

- 8000: Gateway (reserved)
- 8001: Members
- 8002: Sessions
- 8003: Attendance
- 8004: Communications
- 8005: Payments
- 8006: Academy
- 8007: Events
- 8008: Media
- 8009: Transport
- 8010: Store
- 8011: AI
- 8012: Volunteer
- 8013: Wallet
- 8014: Pools
- 8015: Reporting
- 8016: Chat (planned — see [docs/design/CHAT_SERVICE_DESIGN.md](../design/CHAT_SERVICE_DESIGN.md))
- 8017+: Available for new services

> **Important:** Before allocating a new port, cross-check `swimbuddz-backend/docker-compose.yml` — that is the source of truth. This registry must be updated whenever docker-compose changes.

---

## Quick Reference

**Production Services:** gateway, members, sessions, attendance, communications, payments, academy, transport, ai, volunteer, wallet, pools, reporting

**Minimal/Incomplete Services:** events, media, store (have models but limited routes)

**Planned:** chat (port 8016 — design approved, scaffolding pending)

**Deprecated placeholder:** identity (empty; auth handled by Supabase)

**Most Complete Domain Models:**
1. Academy (20,332 lines) — Full cohort management system
2. Wallet (13 tables, 10 enums) — Closed-loop credit system
3. Transport (6,229 lines) — Complete ride-sharing platform
4. Store (998 lines) — E-commerce foundation

---

*Last updated: 2026-04-29 — documented flywheel metrics responsibilities under reporting_service (admin endpoints, cross-service prerequisites, acquisition_source).*

*2026-04-19 — added ai_service (8011), pools_service (8014), reporting_service (8015), chat_service (8016, planned); clarified identity_service as deprecated; added detail section for volunteer_service.*
