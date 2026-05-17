# A1 — Session Discriminator Refactor (Phase 3 design note)

> **Status:** Design note — *deferred, not approved for implementation*
> **Service:** `sessions_service` (Port 8002)
> **Date:** 2026-05-17
> **Author:** Daniel + AI collaborator
> **Phases 1 & 2 status:** shipped in commits `214e1c8` (Pydantic + SQLAlchemy event listener) and `4a3deb3` (Postgres `CHECK` constraint with `NOT VALID`). The data-integrity risk the May 2026 code review flagged is already eliminated.

---

## Why this note exists

The May 2026 code review flagged the `Session` model as a "god object": a single `sessions` table carries a `session_type` enum and four mutually-exclusive nullable context-FK columns (`cohort_id`, `event_id`, `booking_id`, `pod_id`). Nothing in the schema enforced the type → FK mapping, so any combination was writeable.

**Phases 1 & 2 closed the data-integrity gap.** The discriminator rule is now enforced at three layers (Pydantic at API entry, SQLAlchemy `before_insert`/`before_update` for any ORM caller, Postgres `CHECK` at the DB). No write path can produce an inconsistent row.

What remains, conceptually, is that **the `SessionType` enum conflates three orthogonal dimensions**:

| Enum value | What it actually encodes |
|---|---|
| `COMMUNITY` | a **layer** of the platform |
| `CLUB` | a **layer** of the platform |
| `COHORT_CLASS` | a **format** within Academy + a **context anchor** (cohort_id) |
| `EVENT` | a **context anchor** (event_id) |
| `ONE_ON_ONE` | a **format** (size) + a **context anchor** (booking_id) |
| `GROUP_BOOKING` | a **format** + an **action** ("booking" is what the user does, not what the session is) |

This document proposes a three-dimension model that separates these concerns cleanly. It is the *honest* version of Phase 3 — not the table-per-type split the reviewer originally suggested.

---

## Why the table-per-type split was rejected

The reviewer's original Phase 3 proposed splitting `sessions` into `ClubSession`, `CommunitySession`, `CohortClassSession`, `EventSession`, `BookingSession`. After analysis this was discarded:

1. **Sessions are fundamentally a unified scheduling row.** Time, place, capacity, fees, status — these are identical across every session kind. Splitting forces a `UNION ALL` (or a five-way query) for any "list upcoming sessions across all layers" query. Sessions's largest consumers (admin, member dashboards, reporting) all want unified views.
2. **The discriminator FKs aren't a smell.** They're a **junction** between scheduling (`sessions`) and domain (`cohorts` in academy, `events` in events, `pods` in members, `bookings` in payments). That junction is the point.
3. **Per-type tables would leak cross-service knowledge into the schema.** Naming a table `CohortClassSession` encodes "a session whose context lives in academy_service" — the *naming* implies coupling even though FK constraints don't cross service boundaries (per the cross-service-no-FK rule in `SERVICE_COMMUNICATION.md`).
4. **Phase 1 + Phase 2 already prevent the actual safety problem.** What remains is taste.

---

## Proposed model — three orthogonal dimensions

### 1. Layer (which tier of the platform)

```
enum SessionLayer:
    community  - open swimming, casual engagement
    club       - structured training with attendance tracking
    academy    - formal cohort-based education
```

Every session sits in exactly one layer. The layer drives access control, pricing tier, and most filtering queries.

### 2. Context (which domain row, if any, this session is anchored to)

```
enum SessionContext:
    none     - no domain anchor; standalone session
    cohort   - anchored to a row in academy_service.cohorts; cohort_id required
    event    - anchored to a row in events_service.events; event_id required
    pod      - anchored to a row in members_service.pods; pod_id required
    booking  - anchored to a row in payments_service (or future bookings_service); booking_id required
```

This dimension is what the existing CHECK constraint actually enforces — it's the column that carries semantic meaning about the FK columns. Renaming `session_type` → `context` makes the constraint's purpose self-documenting.

### 3. Format (what kind of session structurally)

```
enum SessionFormat:
    open           - free-form swim; no curriculum, no booking
    cohort_lesson  - curriculum-driven lesson (current "COHORT_CLASS")
    private        - one-on-one private lesson (current "ONE_ON_ONE")
    group_private  - small group private (current "GROUP_BOOKING")
    clinic         - skills workshop
    meet           - open meet / social gathering / competition
```

Format is independent of layer (a Club can hold a clinic; the Academy can hold a meet) and largely independent of context (a clinic might be cohort-anchored or stand-alone).

### Current → proposed value mapping

| Current `SessionType` | `layer` | `context` | `format` |
|---|---|---|---|
| `COMMUNITY` | `community` | `none` | `open` |
| `CLUB` (no pod_id) | `club` | `none` | `open` |
| `CLUB` (with pod_id) | `club` | `pod` | `open` |
| `COHORT_CLASS` | `academy` | `cohort` | `cohort_lesson` |
| `EVENT` | `community` | `event` | `meet` |
| `ONE_ON_ONE` | *depends* | `booking` | `private` |
| `GROUP_BOOKING` | *depends* | `booking` | `group_private` |

The two booking rows have a wrinkle: the layer is determined by *who* is booking. Today the booking system isn't built, so no rows exist with these types. When the booking system ships, layer will be set from the booking record's tier.

---

## Schema changes

### New columns on `sessions`

```sql
ALTER TABLE sessions ADD COLUMN layer    text NOT NULL DEFAULT 'community';
ALTER TABLE sessions ADD COLUMN format   text NOT NULL DEFAULT 'open';
ALTER TABLE sessions ADD COLUMN context  text NOT NULL DEFAULT 'none';
-- session_type stays in place during dual-write, then drops in Phase 3.3.
```

(In the actual Alembic migration these are proper enum types with the values above. Defaults are temporary backfill helpers; the real defaults are managed by the model and the backfill SQL below.)

### Backfill

```sql
UPDATE sessions SET layer = 'community', context = 'none',  format = 'open'           WHERE session_type = 'community';
UPDATE sessions SET layer = 'club',      context = 'none',  format = 'open'           WHERE session_type = 'club' AND pod_id IS NULL;
UPDATE sessions SET layer = 'club',      context = 'pod',   format = 'open'           WHERE session_type = 'club' AND pod_id IS NOT NULL;
UPDATE sessions SET layer = 'academy',   context = 'cohort', format = 'cohort_lesson' WHERE session_type = 'cohort_class';
UPDATE sessions SET layer = 'community', context = 'event',  format = 'meet'          WHERE session_type = 'event';
-- one_on_one / group_booking: no rows exist yet (booking system not built).
```

### Updated CHECK constraint

The Phase 2 constraint expressed in terms of `session_type`. After Phase 3.3 it's rewritten in terms of `context` (cleaner because `context` IS the column that names the discriminator):

```sql
ALTER TABLE sessions DROP CONSTRAINT ck_sessions_discriminator;

ALTER TABLE sessions ADD CONSTRAINT ck_sessions_discriminator CHECK (
       (context = 'none'    AND cohort_id IS NULL AND event_id IS NULL AND booking_id IS NULL)
    OR (context = 'cohort'  AND cohort_id IS NOT NULL AND event_id IS NULL AND booking_id IS NULL AND pod_id IS NULL)
    OR (context = 'event'   AND event_id  IS NOT NULL AND cohort_id IS NULL AND booking_id IS NULL AND pod_id IS NULL)
    OR (context = 'pod'     AND pod_id    IS NOT NULL AND cohort_id IS NULL AND event_id IS NULL AND booking_id IS NULL)
    OR (context = 'booking' AND booking_id IS NOT NULL AND cohort_id IS NULL AND event_id IS NULL AND pod_id IS NULL)
);
```

Note this is **simpler** than the Phase 2 expression — six branches collapsed to five, with `context` doing the discrimination instead of the conflated `session_type`.

---

## Phased migration

### Phase 3.0 — design lock (this document)

- Stakeholder approval of the layer / context / format model
- Decision on booking-row layer policy
- Explicit go/no-go

### Phase 3.1 — add new columns (zero-impact, backwards-compatible)

- Alembic migration (via `migrate.sh --manual`) adds `layer`, `format`, `context` columns
- Backfill SQL populates them from existing `session_type`
- Model gains the new columns; existing code keeps reading `session_type`
- New writes set both old AND new columns (dual-write)
- Consumers continue to work unchanged

**Risk: low.** Nothing reads the new columns yet.

### Phase 3.2 — migrate consumers (one service at a time)

Order, smallest blast first:

1. `sessions_service/routers/internal.py` — `SessionBasic` gains `layer`/`context`/`format`; `session_type` stays in the response for compat
2. `reporting_service` aggregations — start reading from `layer` for "by-tier" reports
3. `academy_service` — switches its filter from `session_type='cohort_class'` to `context='cohort'`
4. Frontend `admin/sessions/page.tsx` — drives the type-picker off the three-dimension model
5. Frontend `(member)/sessions/page.tsx` — filter by layer
6. Other services (`communications`, `payments`, `attendance`, `members`) — verify their HTTP callers still work; no DB filter changes needed

Each step is a separate PR, separately verified.

**Risk: medium.** External services consume `SessionBasic`; the shape must stay additive (new fields added, old field kept) during this phase.

### Phase 3.3 — drop the old column

- Remove `session_type` from the model and `SessionBasic`
- Drop the old column in a new migration
- Rewrite the Phase 2 CHECK constraint per "Updated CHECK constraint" above
- Update `SessionType` enum file (now just `SessionLayer`, `SessionFormat`, `SessionContext`)

**Risk: low** if Phase 3.2 was done cleanly. Any consumer still reading `session_type` after 3.2 surfaces as a hard failure in CI / smoke tests.

---

## Consumer impact (from the discovery report)

Internal to sessions_service:
- `routers/member.py` — type filtering + create flow that branches on COHORT_CLASS
- `routers/internal.py` — `SessionBasic` shape + several stats endpoints aggregating by `session_type.value`
- `routers/templates.py` — `SessionTemplate` mirrors the same enum; same refactor applies
- `routers/bundles.py` — no direct type filtering; minimal change

Cross-service consumers:
- `academy_service` — filters by `cohort_id` already; only the "list sessions for cohort" logic needs to verify context='cohort'
- `reporting_service` — `range-stats` / `detailed-stats` aggregate by `session_type` enum value (e.g. "X cohort classes this week"). Aggregations switch to `(layer, format)` pairs.
- `communications_service` — only reads time/title/location; unaffected
- `payments_service` — same
- `attendance_service` — pool-hour duration; unaffected
- `members_service` — coach lookup; unaffected
- `transport_service` — already moved to `service_client.sessions.get_session_by_id`; consumes `pool_id`/`location` only

Frontend:
- `(admin)/admin/sessions/page.tsx` (1640 lines) — type-picker UI replaces with three dimensions
- `(admin)/admin/academy/cohorts/new/page.tsx` (1084 lines) — already creates COHORT_CLASS sessions; switches to passing `(academy, cohort, cohort_lesson)`
- `(member)/sessions/page.tsx` (1139 lines) — filter chips switch to layer-based
- A few smaller pages that branch on type

---

## Cost estimate

| Phase | Effort | Risk |
|---|---|---|
| 3.0 design lock | ~half a day | none |
| 3.1 add columns + backfill | 1 day | low |
| 3.2 migrate consumers | 3–5 days (one service per day, with testing) | medium |
| 3.3 drop old column | half a day | low |
| **Total** | **~1 week** | medium |

This is substantially less than the original 5-table split estimate (1–2 weeks) and avoids the data-model coupling smell.

---

## What this buys us

1. **First-class queries on layer.** "Show me all community sessions this week" becomes `WHERE layer = 'community'` instead of `WHERE session_type IN ('community', 'event')` plus mental gymnastics.
2. **First-class queries on format.** "All private lessons across all layers" was previously inexpressible; becomes `WHERE format IN ('private', 'group_private')`.
3. **CHECK constraint expresses what it actually means.** "Context determines which FK is required" reads cleanly; the Phase 2 expression is correct but conflated.
4. **New session subtypes don't need an enum change.** Want a `community / event / clinic` session? Just set `(community, event, clinic)`. Today you'd need a new `SessionType` enum value and CHECK constraint update.
5. **The naming stops fighting itself.** No more `BookingSession`-as-a-noun confusion.

---

## What this costs

1. **One week of focused work** across backend + frontend.
2. **A migration window** where new columns are dual-written. Any rollback during 3.2 requires careful coordination.
3. **External-service compatibility** — `SessionBasic` becomes additive; consumers need to be told the shape evolved and the old `session_type` field will eventually disappear.
4. **Testing burden** — sessions has only 4 test files; meaningful pre-work to expand coverage before 3.2 is recommended.

---

## Alternatives considered

### A. Keep at Phase 1+2 (recommended baseline)

- **Pros:** zero risk; integrity already enforced; sessions taxonomy stays workable
- **Cons:** the enum continues to mix layer + format + context dimensions; new contributors have to internalize the inconsistency

### B. Pure rename only (`session_type` → `context`)

- **Pros:** small migration; resolves the CHECK constraint's naming awkwardness
- **Cons:** doesn't introduce `layer` or `format`; misses most of the win

### C. Full table-per-type split (original reviewer suggestion)

- **Pros:** Python type system enforces shape at compile/IDE time
- **Cons:** loses unified scheduling view, leaks cross-service domain names into schema, ~2 weeks of work, much higher blast radius
- **Verdict: rejected.**

### D. Decompose by layer (3 tables: CommunitySession, ClubSession, AcademySession)

- **Pros:** less drastic than five-way split; matches the platform's three-layer story
- **Cons:** still forces UNION ALL for cross-layer queries; layer-specific tables make it harder to add new layers (if it ever happens); session-format split is still missing
- **Verdict: rejected** in favour of the three-dimension model (E), which captures the same intent without splitting the table.

### E. Three-dimension model (this document)

- **Pros:** captures real conceptual structure; queries-by-layer and queries-by-format become first-class; CHECK constraint becomes self-documenting; doesn't fight cross-service architecture
- **Cons:** real work; ~1 week with phased rollout
- **Verdict: recommended *if* we choose to do Phase 3 at all.**

---

## Open questions

1. **Booking layer policy.** When the booking system is built, what determines the layer of a `(context=booking)` session — the booker's tier, the coach's tier, or an explicit field on the booking?
2. **`SessionTemplate` parallels.** Templates mirror the Session enum; do they get the same three-dimension treatment, or do they collapse to `(layer, format)` only since template-time context isn't known yet?
3. **Reporting backwards compat.** Reporting aggregations consume `session_type.value` in stored JSON / cards. How long do we hold `session_type` in `SessionBasic` for downstream services to migrate?
4. **Frontend type-picker UX.** Today admins pick "session type" from a single dropdown. Do we replace with three dependent dropdowns (layer → format → context), or keep a single "session kind" picker that maps to a `(layer, context, format)` triple under the hood?

---

## Decision

**A1 is closed at Phase 2 as of 2026-05-17.** The integrity risk is gone.

Phase 3 (this design's three-dimension refactor) is *deferred pending product-level decision* on the open questions above. If product cleanup, query-pattern needs, or onboarding pain make the conflated enum a real cost, revisit this document, lock the open questions, and start at 3.1.

This is **not** approval to implement. It's a reference for the future "if we do Phase 3, this is the shape" decision.
