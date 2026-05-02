# Flywheel Metrics — Follow-Up Implementation Tasks

**Status:** Code complete; **migrations not yet applied** (Docker was down at completion). Frontend type-check clean. Awaiting: `alembic upgrade head` on `members_service` and `reporting_service`, then a `POST /admin/reports/flywheel/refresh` to seed the first snapshots.
**Created:** 2026-04-29
**Last updated:** 2026-05-01
**Companion to:** [`FLYWHEEL_METRICS_DESIGN.md`](./FLYWHEEL_METRICS_DESIGN.md)

## Completion summary (2026-05-01)

| # | Task | State |
|---|---|---|
| 1 | Cross-service prerequisite endpoints (academy `/cohorts`, `/cohorts/{id}/enrollment-counts`; members `/joined-tier`, `/{id}/tier-history`; wallet `/ecosystem-stats`) | ✅ Implemented |
| 2 | Acquisition source enum + migration `c4f2a1b9d8e3` on `member_profiles` | ✅ Implemented (not yet applied) |
| 3 | Flywheel snapshot tables migration `b8e1f3a52d40` | ✅ Implemented (not yet applied) |
| 4 | Gateway proxy for `/api/v1/admin/reports/flywheel/*` | ✅ Already covered by existing `/api/v1/admin/reports/{path:path}` rule |
| 5 | Frontend `/admin/flywheel` page (KPIs + cohorts table + funnel) | ✅ Built (`src/app/(admin)/admin/flywheel/page.tsx`) |
| 6 | Admin dashboard flywheel snapshot card | ✅ Added (`src/app/(admin)/admin/dashboard/page.tsx`) |
| 7 | Admin layout nav entry | ✅ Added (`src/components/layout/AdminLayout.tsx`) |
| 8 | Registration form acquisition source dropdown (members only, not coaches) | ✅ Wired (`RegistrationEssentialsStep` + `register/page.tsx` + `lib/options.ts`) |
| 9 | Frontend types (`src/lib/types/flywheel.ts`) — manual until OpenAPI regen | ✅ In place |
| 10 | `API_ENDPOINTS.md` flywheel section + internal endpoint docs | ✅ Added (Section 15) |
| 11 | `SERVICE_REGISTRY.md` reporting_service entry updated | ✅ Done |
| 12 | Tests | ⚠️ Partial — `tests/integration/test_members_flywheel_internal.py` exists; reporting_service test file not yet created |
| 13 | OpenAPI regen + `npm run generate:types` | ⏳ Deferred — needs Docker running; manual types are correct in the meantime |

## Remaining steps (run when Docker is up)

```bash
# 1. Apply migrations
cd swimbuddz-backend
docker compose up -d members-service reporting-service postgres
docker compose exec members-service alembic upgrade head
docker compose exec reporting-service alembic upgrade head

# 2. Seed first snapshots
docker compose up -d gateway
curl -X POST http://localhost:8000/api/v1/admin/reports/flywheel/refresh \
  -H "Authorization: Bearer <admin-jwt>"
# Wait 1-2 minutes, then:
curl http://localhost:8000/api/v1/admin/reports/flywheel/overview \
  -H "Authorization: Bearer <admin-jwt>"

# 3. Regenerate OpenAPI + frontend types
python scripts/api/generate-openapi.py
cd ../swimbuddz-frontend && npm run generate:types && npx tsc --noEmit

# 4. Add reporting_service flywheel tests
#    - tests/integration/test_admin_flywheel_router.py
#    - tests/unit/test_funnel_conversions.py (period resolution math)
```

---

## Original punch list (preserved for reference)

This was the punch list of remaining work to finish Phase 1 + Phase 2 as of 2026-04-29. The reporting_service code (models, schemas, ARQ tasks, endpoints, router registration, alembic env.py) is in place. The cross-service endpoints those tasks call **may not yet exist**, and the frontend has not been updated.

## What landed this session

**`swimbuddz-backend/services/reporting_service/`:**
- `models/flywheel.py` — 3 new SQLAlchemy models: `CohortFillSnapshot`, `FunnelConversionSnapshot`, `WalletEcosystemSnapshot`
- `models/enums.py` — added `FunnelStage`, `SnapshotJobStatus` enums
- `models/__init__.py` — exports new models + enums
- `alembic/env.py` — `SERVICE_TABLES` updated with 3 new tables; imports added
- `schemas/flywheel.py` — Pydantic response schemas (5 schemas including `FlywheelOverviewResponse`)
- `tasks/flywheel.py` — `compute_cohort_fill_snapshots()`, `compute_funnel_conversions()`, `compute_wallet_ecosystem_snapshot()`, `refresh_all_flywheel_snapshots()`
- `tasks/worker.py` — 4 new ARQ task wrappers + 3 cron schedules (daily cohort, weekly funnel, weekly wallet)
- `routers/admin_flywheel.py` — 5 endpoints under `/admin/reports/flywheel/*`
- `app/main.py` — new router included

## What still needs to land

### 1. Cross-service prerequisite endpoints

The flywheel tasks call internal endpoints that may not exist yet. Confirm or create each:

#### `academy_service`
- `GET /internal/academy/cohorts?status=open,active` — list cohorts in given statuses
  - Returns: `{cohorts: [{id, name, program_name, capacity, status, start_date, end_date}]}`
- `GET /internal/academy/cohorts/{cohort_id}/enrollment-counts` — counts grouped by status
  - Returns: `{active: int, pending_approval: int, waitlist: int, dropped: int, graduated: int}`

#### `members_service`
- `GET /internal/members/joined-tier?tier=community&from=2026-01-01&to=2026-03-31` — list members who entered the given tier in the period
  - Returns: `{members: [{id, source_joined_at, acquisition_source}]}`
  - Requires the **acquisition_source field** to be populated (see below)
- `GET /internal/members/{member_id}/tier-history` — chronological tier entries for a member
  - Returns: `{entries: [{tier, entered_at, exited_at}]}`

#### `wallet_service`
- `GET /internal/wallet/ecosystem-stats?from=2026-01-30&to=2026-04-30` — aggregated wallet usage
  - Returns: `{active_wallet_users: int, single_service_users: int, cross_service_users: int, total_bubbles_spent: int, total_topup_bubbles: int, spend_distribution: {sessions: float, academy: float, store: float, ...}}`

**Action:** for each, check the existing `routers/internal.py` (or equivalent) in those services. If endpoints exist but with different shapes, adapt the calls in `tasks/flywheel.py`. If they don't exist, create them.

### 2. Acquisition source field — surface and make consistent

**Current state (per code review):**
- `members_service` has `MemberProfile.how_found_us: Optional[str]` (free-form string)
- Frontend register page already collects `discoverySource: string`

**Gap:** `how_found_us` is a free-form string, not enum-backed. For useful funnel breakdown analytics, it needs:

1. Convert to enum or controlled vocabulary:
   ```python
   class AcquisitionSource(str, Enum):
       SOCIAL_INSTAGRAM = "social_instagram"
       SOCIAL_TIKTOK = "social_tiktok"
       REFERRAL_MEMBER = "referral_member"
       REFERRAL_FRIEND = "referral_friend"
       CORPORATE = "corporate"
       EVENT = "event"
       WHATSAPP = "whatsapp"
       SEARCH = "search"
       OTHER = "other"
   ```
2. Add migration on `members_service` to either:
   - Convert `how_found_us` to an enum column (data migration to map free-form values), OR
   - Add a new `acquisition_source` column and keep `how_found_us` as a free-form fallback
3. Update frontend `register/page.tsx` to use a dropdown with these enum values
4. Expose `acquisition_source` in `/internal/members/joined-tier` response

**Recommendation:** Add a new `acquisition_source: AcquisitionSource` column. Keep `how_found_us` as the legacy free-form field. New registrations populate both; old data has only `how_found_us`.

### 3. Database migration

Run from `swimbuddz-backend/`:

```bash
./scripts/db/migrate.sh reporting_service "add flywheel metric snapshot tables"
# Review the generated migration
./scripts/db/reset.sh dev  # if dev only, otherwise alembic upgrade head per service
```

Verify the migration creates:
- `cohort_fill_snapshots` table
- `funnel_conversion_snapshots` table
- `wallet_ecosystem_snapshots` table
- `funnel_stage_enum` Postgres enum type

### 4. Gateway proxy

`gateway_service` may need to be updated to proxy `/api/v1/admin/reports/flywheel/*` to the reporting_service. Check `services/gateway_service/app.py` (or routes config) and confirm the existing `/api/v1/admin/reports/*` rule already covers this (it should, by prefix). If not, add explicit routing.

### 5. Frontend admin dashboard

Add to `swimbuddz-frontend/src/app/(admin)/admin/`:

#### `flywheel/page.tsx` (new page)

Layout:
- **Top row** (4 KPI cards): Cohort fill avg, Community→Club %, Club→Academy %, Wallet cross-service %
- **Middle**: Cohorts table sorted by fill rate ascending, with `days_until_start` highlighted red if cohort is at-risk
- **Bottom**: Funnel diagram showing source_count → converted_count for each stage
- **Footer**: Refresh button (calls `POST /api/v1/admin/reports/flywheel/refresh`) + last_refreshed_at timestamp + stale warning if `is_stale=true`

API calls needed:
- `GET /api/v1/admin/reports/flywheel/overview` — page initial load
- `GET /api/v1/admin/reports/flywheel/cohorts?sort=fill_rate_asc` — cohorts table
- `GET /api/v1/admin/reports/flywheel/funnel` — funnel section
- `GET /api/v1/admin/reports/flywheel/wallet` — wallet section
- `POST /api/v1/admin/reports/flywheel/refresh` — refresh button

#### `dashboard/page.tsx` (existing, augment)

Add a "Flywheel snapshot" card linking to `/admin/flywheel`. Show: cohort fill avg, c→c %, c→a %, last refreshed.

#### Type generation

After backend changes are deployed:
```bash
cd swimbuddz-backend && python scripts/api/generate-openapi.py
cd ../swimbuddz-frontend && npm run generate:types
npx tsc --noEmit  # verify
```

### 6. Registration form acquisition source dropdown

In `swimbuddz-frontend/src/app/(auth)/register/page.tsx`:

Replace `discoverySource: string` (free-form input) with a dropdown:

```tsx
<Select
  label="How did you hear about us?"
  data={[
    { value: "social_instagram", label: "Instagram" },
    { value: "social_tiktok", label: "TikTok" },
    { value: "referral_member", label: "A SwimBuddz member referred me" },
    { value: "referral_friend", label: "A friend told me" },
    { value: "corporate", label: "Through my employer" },
    { value: "event", label: "Saw it at an event" },
    { value: "whatsapp", label: "WhatsApp group" },
    { value: "search", label: "Google / search" },
    { value: "other", label: "Other" },
  ]}
  value={formData.acquisitionSource}
  onChange={(value) => updateField("acquisitionSource", value)}
  required
/>
```

Wire `acquisitionSource` into the registration API payload sent to members_service.

### 7. Tests

**Backend (reporting_service):**
- `test_cohort_fill_snapshot.py` — mock `internal_get` calls; verify fill rate math
- `test_funnel_conversions.py` — mock members tier-history calls; verify stage logic + period resolution
- `test_wallet_ecosystem_snapshot.py` — mock wallet aggregation; verify rate calc
- `test_admin_flywheel_router.py` — endpoint-level tests with auth fixture

**Members/Wallet services:** add tests for the new internal endpoints.

### 8. Documentation

Update:
- `swimbuddz-backend/API_ENDPOINTS.md` — document the 5 new flywheel endpoints
- `docs/reference/SERVICE_REGISTRY.md` — note flywheel responsibilities under reporting_service

## Estimated time to finish

| Task | Estimate |
|---|---|
| 1. Cross-service prerequisite endpoints (academy, members, wallet) | 4-6 hours |
| 2. Acquisition source field migration + frontend dropdown | 2-3 hours |
| 3. Database migration (review, apply) | 30 min |
| 4. Gateway proxy verification | 15 min |
| 5. Frontend admin dashboard pages | 4-6 hours |
| 6. Registration form update | 1 hour |
| 7. Tests | 4-6 hours |
| 8. Documentation | 1 hour |
| **Total** | **~16-24 hours focused work** |

## Order of operations

1. **Acquisition source field migration first** (members_service) — funnel breakdown needs this
2. **Cross-service internal endpoints** (academy, members, wallet) — flywheel tasks fail otherwise
3. **Run migration** in dev, verify tables exist
4. **Trigger refresh manually** via the new endpoint, watch logs for cross-service failures
5. **Frontend admin pages** — only meaningful once data flows
6. **Registration form dropdown** — affects new signups going forward
7. **Tests** — once each piece is working
8. **Docs** — last, after the system is stable
