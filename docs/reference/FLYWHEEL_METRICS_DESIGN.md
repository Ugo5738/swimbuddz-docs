# Flywheel Metrics Design

**Status:** Design proposal — awaiting founder sign-off before implementation
**Owner:** Engineering
**Last updated:** 2026-04-29

## Why this exists

SwimBuddz is designed as an ecosystem (Community → Club → Academy, with Wallet/Volunteer/Reporting as cross-cutting layers). The architecture is in place; the **evidence the flywheel actually flows is not yet measured.** Without it, the founder cannot:

- Confidently raise capital ("show us your funnel conversion")
- Decide which service to invest in next (which has highest ROI per ₦?)
- Defend the multi-service strategy against the "kill 5, focus on 3" critique
- Run the next 90 days against numbers instead of intuition

This doc proposes a minimal first cut of cross-service flywheel metrics added to the `reporting_service` and surfaced in the admin dashboard.

## Metrics to add

### Tier 1 — Build now (highest leverage, smallest scope)

| Metric | Definition | Why |
|---|---|---|
| **Cohort fill rate** | (active enrollments + pending approvals) / capacity, per OPEN/ACTIVE cohort | Operational. Founder needs this *today* to know which cohorts are at risk and where to push enrollment. |
| **Funnel: Community → Club** | % of community members (last 12 months) who became club members within 6 months of joining | Validates the funnel design. If <15%, the funnel is broken. |
| **Funnel: Club → Academy** | % of club members who enrolled in any academy cohort within 12 months | Higher-value conversion. Drives the case for academy as revenue engine. |
| **Wallet cross-service spend rate** | % of active members who used wallet across ≥2 service categories in the last 90 days | Validates the wallet ecosystem thesis. If members only spend on one service, wallet is overhead, not glue. |

### Tier 2 — Build next quarter (deeper analytics, larger scope)

| Metric | Definition | Why |
|---|---|---|
| **Cohort completion rate** | % of academy enrollments that reach COMPLETED status (vs. DROPPED) | Quality signal. Low completion = bad curriculum or wrong audience. |
| **Volunteer → paying member conversion** | % of volunteers who became paying community/club/academy members within 6 months | Tests whether volunteer program is a retention engine or a leakage point. |
| **Member LTV by entry layer** | Average lifetime ₦ revenue per member, segmented by where they entered (community / club / academy / store / events) | Tells you which entry door has the highest economic value. Drives marketing spend. |
| **Cohort coach grade impact** | Avg cohort completion + NPS by coach grade (1, 2, 3) | Validates the coach grading system economically. |
| **Acquisition path** | Distribution of how members reached SwimBuddz (referral, social, wedding, etc.) | Shows which acquisition channels actually convert vs. just bring traffic. |

### Tier 3 — Aspirational (after Tier 1 + 2 prove value)

- **Predictive churn** (which members are likely to drop based on attendance pattern)
- **Optimal cohort scheduling** (when should we run a cohort given seasonal attendance?)
- **Cross-service propensity model** (given a community member's profile, what's the probability they convert to academy?)

---

## Architectural design

### Constraint

Per `docs/reference/SERVICE_COMMUNICATION.md`, services don't directly access each other's databases. They communicate via HTTP APIs only. The `reporting_service` already does cross-service lookups (members service for member data, etc.). We extend that pattern.

### Approach: Snapshot tables + scheduled compute

We **don't** compute these metrics on every dashboard request — that would be slow and expensive. Instead:

1. **Snapshot tables** in `reporting_service` storing pre-computed values (per cohort, per funnel cohort group, per period)
2. **Async ARQ task** that recomputes them daily (or on-demand from admin UI)
3. **Read endpoints** that serve from snapshots — fast, cacheable

This mirrors the existing `QuarterlySnapshot` pattern.

### New models proposed

```python
# services/reporting_service/models.py

class CohortFillSnapshot(Base):
    """Per-cohort fill state, refreshed daily."""
    __tablename__ = "cohort_fill_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)
    cohort_id: Mapped[UUID] = mapped_column(index=True)
    cohort_name: Mapped[str]
    program_name: Mapped[str]
    capacity: Mapped[int]
    active_enrollments: Mapped[int]
    pending_approvals: Mapped[int]
    fill_rate: Mapped[float]  # 0.0 - 1.0+
    starts_at: Mapped[datetime | None]
    status: Mapped[str]  # OPEN, ACTIVE, COMPLETED
    snapshot_taken_at: Mapped[datetime] = mapped_column(default=func.now())


class FunnelConversionSnapshot(Base):
    """Cross-service funnel conversion, computed for rolling cohorts."""
    __tablename__ = "funnel_conversion_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)
    funnel_stage: Mapped[str]  # "community_to_club", "club_to_academy"
    cohort_period: Mapped[str]  # "2026-Q1", "2025" — the period the source members joined
    source_count: Mapped[int]  # how many entered the source layer
    converted_count: Mapped[int]  # how many crossed to the target layer
    conversion_rate: Mapped[float]
    observation_window_days: Mapped[int]  # 180 for c→c, 365 for c→a
    snapshot_taken_at: Mapped[datetime] = mapped_column(default=func.now())


class WalletEcosystemSnapshot(Base):
    """How wallet is actually being used across services."""
    __tablename__ = "wallet_ecosystem_snapshots"

    id: Mapped[int] = mapped_column(primary_key=True)
    period_start: Mapped[date]
    period_end: Mapped[date]
    active_wallet_users: Mapped[int]
    single_service_users: Mapped[int]  # spent on only 1 service category
    cross_service_users: Mapped[int]  # spent on 2+ service categories
    cross_service_rate: Mapped[float]
    spend_distribution: Mapped[dict] = mapped_column(JSONB)  # {"sessions": 0.45, "academy": 0.30, ...}
    snapshot_taken_at: Mapped[datetime] = mapped_column(default=func.now())
```

### New endpoints proposed

```
GET  /admin/reports/flywheel/overview          → returns latest snapshot of all 4 Tier-1 metrics
GET  /admin/reports/flywheel/cohorts           → list of CohortFillSnapshot, current open + active
GET  /admin/reports/flywheel/funnel            → conversion rates per funnel stage and period
GET  /admin/reports/flywheel/wallet            → wallet ecosystem usage
POST /admin/reports/flywheel/refresh           → trigger ARQ task to recompute (admin only)
GET  /admin/reports/flywheel/refresh/status    → check refresh job state
```

### Frontend changes proposed

New page: `swimbuddz-frontend/src/app/(admin)/admin/flywheel/page.tsx`

Layout:
- **Top row** (4 KPI cards): Cohort fill avg, Community→Club %, Club→Academy %, Wallet cross-service %
- **Middle**: Cohorts table (one row per cohort, sorted by fill rate ascending — lowest first; "act on these first")
- **Bottom**: Funnel diagram (community count → club count → academy count, visual)
- **Footer**: "Refresh" button + last-refreshed timestamp

Add a flywheel snapshot card to `/admin/dashboard` linking to the full page.

### Migration

Single Alembic migration in `reporting_service` adding the 3 new tables. No changes to other services.

---

## Implementation plan

### Phase 1 — Cohort fill rate only (3-4 hours)

Smallest, most actionable scope. Deliverable: founder can see "Cohort X is at 30% fill, 4 weeks to start" at a glance and act on it for the immediate "10 students" goal.

1. Add `CohortFillSnapshot` model + migration
2. Add ARQ task `compute_cohort_fill_snapshots()` that calls `academy_service` HTTP API for cohort + enrollment data
3. Add endpoints `/admin/reports/flywheel/cohorts` + `/refresh`
4. Add frontend table to existing `/admin/reports` page (no new route yet)
5. Schedule task to run daily 06:00 Africa/Lagos

### Phase 2 — Funnel + wallet metrics (1-2 days)

Bigger scope, requires careful cross-service data fetching.

1. Add `FunnelConversionSnapshot` + `WalletEcosystemSnapshot` models + migration
2. Add ARQ tasks for both. Funnel computation needs members service "join date" data + sessions (club indicator) + academy enrollment data.
3. Add endpoints
4. New `/admin/flywheel` route with full layout

### Phase 3 — Tier 2 metrics (next quarter)

Cohort completion, volunteer→member, LTV by entry layer, coach grade impact, acquisition path.

---

## Open questions for founder

1. **Refresh frequency**: daily good, or do you want hourly during active enrollment periods?
2. **Funnel observation window**: 180 days community→club, 365 days club→academy — sensible?
3. **Phase 1 only or Phase 1+2?** Phase 1 is 3-4 hours and immediately useful. Phase 1+2 is ~2 days total.
4. **Volunteer→member metric in Phase 2 or Phase 3?** Currently Phase 3, but it might be high-leverage for the volunteer transition map.
5. **Where do you want acquisition path tracking?** Right now we don't capture "how did you hear about SwimBuddz" at signup. Adding it requires a small change to the registration form. Want to add this now, or skip?

## Risks

- **Service-to-service data fetching** can be slow if endpoints aren't optimized. Mitigation: snapshots run async overnight, dashboard reads from cached snapshot.
- **Cohort definitions for funnel** are subjective ("became a club member" — what counts? attended 1 session, paid quarterly fee, attended 3 sessions?). Need founder definition before implementing.
- **Privacy / RLS**: aggregate metrics only. No member-identifiable data in the flywheel dashboard except in the cohorts table (which already exists in admin context).

---

## Decision required

Founder, please confirm:
- [ ] Tier 1 metrics list correct?
- [ ] Phase 1 only, or Phase 1 + Phase 2?
- [ ] Funnel observation windows (180d, 365d) — adjust?
- [ ] Add acquisition-source field to registration now or later?

Once confirmed, engineering work begins.
