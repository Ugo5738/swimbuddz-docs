# A1 — Session Discriminator Refactor (Phase 3 design note)

> **Status:** Design note — *Phase 3 scope locked; awaiting implementation slot*
> **Service:** `sessions_service` (Port 8002), `academy_service` (8006), `attendance_service` (8003)
> **Date:** 2026-05-17 (last update); originally 2026-05-17
> **Author:** Daniel + AI collaborator
> **Phases 1 & 2 status:** shipped in commits `214e1c8` (Pydantic + SQLAlchemy event listener) and `4a3deb3` (Postgres `CHECK` constraint with `NOT VALID`). The data-integrity risk the May 2026 code review flagged is already eliminated.

---

## Why this note exists

The May 2026 code review flagged the `Session` model as a "god object": a single `sessions` table carries a `session_type` enum and four mutually-exclusive nullable context-FK columns (`cohort_id`, `event_id`, `booking_id`, `pod_id`). Nothing in the schema enforced the type → FK mapping, so any combination was writeable.

**Phases 1 & 2 closed the data-integrity gap.** The discriminator rule is now enforced at three layers (Pydantic at API entry, SQLAlchemy `before_insert`/`before_update` for any ORM caller, Postgres `CHECK` at the DB). No write path can produce an inconsistent row.

What remains, conceptually, is that **the `SessionType` enum conflates three orthogonal dimensions** — and two of its values (`ONE_ON_ONE`, `GROUP_BOOKING`) plus the `booking_id` column are aspirational dead code that should never have shipped without a backing product flow.

| Enum value | What it actually encodes | Production rows |
|---|---|---|
| `COMMUNITY` | a **layer** of the platform | many |
| `CLUB` | a **layer** of the platform (with optional `pod_id` for pod-scoped) | many |
| `COHORT_CLASS` | **format** within Academy + **context anchor** (cohort_id) | many |
| `EVENT` | **context anchor** (event_id) — events are community-tier today | some |
| `ONE_ON_ONE` | aspirational private-lesson slot; no flow uses it | **zero** |
| `GROUP_BOOKING` | aspirational small-group-private slot; no flow uses it | **zero** |

This Phase 3 splits the cleanup across three services:

1. **`sessions_service`** — drop the two aspirational enum values and the `booking_id` column; the discriminator simplifies to `cohort` / `event` / `pod` / `none`.
2. **`academy_service`** — introduce `CohortType` so Academy can express private 1-on-1 instruction, member-specified small groups, and corporate-sponsored cohorts within the existing cohort model.
3. **`attendance_service`** — introduce `SessionBooking` as a first-class table representing "member commits to attending a session" (the concept that's currently spread across `AttendanceRecord`, `SessionBundleCart`, and implicit walk-in flows). `AttendanceRecord` continues to represent physical presence.

---

## Why the table-per-type split was rejected

The reviewer's original Phase 3 proposed splitting `sessions` into `ClubSession`, `CommunitySession`, `CohortClassSession`, `EventSession`, `BookingSession`. After analysis this was discarded:

1. **Sessions are fundamentally a unified scheduling row.** Time, place, capacity, fees, status — these are identical across every session kind. Splitting forces a `UNION ALL` (or a five-way query) for any "list upcoming sessions across all layers" query. Sessions's largest consumers (admin, member dashboards, reporting) all want unified views.
2. **The discriminator FKs aren't a smell.** They're a **junction** between scheduling (`sessions`) and domain (`cohorts` in academy, `events` in events, `pods` in members). That junction is the point.
3. **Per-type tables would leak cross-service knowledge into the schema.** Naming a table `CohortClassSession` encodes "a session whose context lives in academy_service" — the *naming* implies coupling even though FK constraints don't cross service boundaries (per the cross-service-no-FK rule in `SERVICE_COMMUNICATION.md`).
4. **Phase 1 + Phase 2 already prevent the actual safety problem.** What remains is taste.
5. **The names themselves were incoherent:** `BookingSession` mistook a user action ("booking") for a session type; `ClubSession`/`CommunitySession` conflated platform layers with session contexts.

---

## The three-dimension lens (informative, not implemented)

The current `SessionType` enum conflates three orthogonal dimensions. After Phase 3 the schema reflects this implicitly rather than forcing a three-column representation:

| Dimension | Where it lives after Phase 3 |
|---|---|
| **Layer** (community / club / academy) | Implicit in `session_type` (`community` / `club` / `cohort` → academy); `pod_id` distinguishes pod-scoped club |
| **Context** (which other-service row, if any) | `session_type` directly (`cohort` / `event` / `pod` / `none`) and the matching FK column |
| **Format / Size** (group / private / small-group) | Moved to **`Cohort.type`** for academy; community/club sessions are always group-format |

Earlier iterations of this note proposed three explicit columns (`layer`, `context`, `format`). That was over-engineered: layer is derivable from `session_type`, and format is meaningful only for Academy — which now expresses it via `CohortType`. We can revisit if non-academy formats ever appear.

---

## Proposed changes

### A. Session-side cleanup (`sessions_service`)

**Drop two aspirational `SessionType` values:**

```python
class SessionType(str, Enum):
    COHORT_CLASS = "cohort_class"
    CLUB         = "club"
    COMMUNITY    = "community"
    EVENT        = "event"
    # ONE_ON_ONE  = "one_on_one"      ← DROPPED
    # GROUP_BOOKING = "group_booking" ← DROPPED
```

**Drop the `booking_id` column** from `sessions`. It has zero rows and no future caller — the new `SessionBooking` table holds the reverse link.

**Simplify the Phase 2 `CHECK` constraint** from six branches to four:

```sql
ALTER TABLE sessions DROP CONSTRAINT ck_sessions_discriminator;

ALTER TABLE sessions ADD CONSTRAINT ck_sessions_discriminator CHECK (
       (session_type = 'cohort_class' AND cohort_id IS NOT NULL
            AND event_id IS NULL AND pod_id IS NULL)
    OR (session_type = 'event'        AND event_id  IS NOT NULL
            AND cohort_id IS NULL AND pod_id IS NULL)
    OR (session_type = 'club'
            AND cohort_id IS NULL AND event_id IS NULL)
    OR (session_type = 'community'
            AND cohort_id IS NULL AND event_id IS NULL AND pod_id IS NULL)
);
```

The matching Python validator (`models/_validators.py`) and the Pydantic `@model_validator` on `SessionCreate` get the same trim.

### B. Cohort taxonomy (`academy_service`)

Introduce `CohortType` so Academy can express private and corporate cohorts inside the existing cohort framework:

```python
class CohortType(str, Enum):
    GROUP       = "group"        # Standard 8–12 student cohort (today's default)
    PRIVATE     = "private"      # 1 student; member-paid 1-on-1 academy program
    SMALL_GROUP = "small_group"  # 2–6 students; member-specified group (friends/family)
    CORPORATE   = "corporate"    # Commissioned by an organisation; capacity set by sponsor

class Cohort(Base):
    # …existing fields…
    type: Mapped[CohortType] = mapped_column(
        SAEnum(CohortType, name="cohort_type_enum", values_callable=enum_values),
        nullable=False, default=CohortType.GROUP, server_default="group",
    )
    # Optional forward-looking link to a future corporate-wellness programme model.
    # Plain UUID per the cross-service-no-FK rule; no `ForeignKey(...)` declared.
    corporate_program_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), nullable=True, index=True
    )
```

All Sessions produced by these cohorts stay `SessionType.COHORT_CLASS` with `cohort_id` set. The type lives on the Cohort row, not on each Session. This means:

- All existing academy plumbing (cohort enrollments, session pre-scheduling, coach assignments, payment intents for `academy_cohort` purpose, attendance flow) **works unchanged** for the new types.
- A "private academy 1-on-1" is just a `Cohort(type=PRIVATE, capacity=1)` with a single `Enrollment`.
- "Bring 4 friends" is a `Cohort(type=SMALL_GROUP, capacity=4)` with 4 enrollments.
- A "corporate-wellness programme for 12 employees" is a `Cohort(type=CORPORATE, capacity=12, corporate_program_id=<UUID>)` with 12 enrollments tied back to the sponsoring org.

The corporate-wellness product itself (org model, billing terms, enrolment ingest, reporting) is its own design note when scoped — see `docs/design/CORPORATE_WELLNESS.md` (to be written). This document only commits to the `Cohort.type` + `corporate_program_id` columns that enable it.

### C. Booking model (`attendance_service`)

**Today's state.** Members don't pre-book community/club sessions — they walk in and call `POST /sessions/{id}/sign-in`, which creates an `AttendanceRecord` directly with status `PRESENT`. The session's `capacity` column gates this at sign-in time. There is no "I intend to come on Saturday" data anywhere. Academy is the exception: members commit via `Enrollment` at the cohort level, and the pre-scheduled sessions are theirs automatically. The only existing thing called `*Booking` is `transport_service.RideBooking` for ride-share seats.

**The asymmetry to fix.** `AttendanceRecord` does double duty: it's both "intent to attend" (created at sign-in) and "physical presence" (status PRESENT/LATE/ABSENT/etc.). This works for walk-ins but breaks down as soon as advance booking is needed — corporate-wellness pre-purchases, popular sessions with limited capacity, no-show tracking, refund-on-cancel flows.

**Decision: Option 2 — add a separate `SessionBooking` table; keep `AttendanceRecord`.**

The two tables represent two genuinely different concepts:

- **`SessionBooking`** = intent. "This member has reserved a spot in this session." Capacity is decremented when this is created.
- **`AttendanceRecord`** = fact. "This member physically attended this session." Status reflects what happened (PRESENT/LATE/ABSENT/EXCUSED/CANCELLED).

Walk-in flow stays exactly as today: hit `POST /sessions/{id}/sign-in` → `AttendanceRecord` created with `status=PRESENT`, no `SessionBooking`. Pre-book flow goes through a new endpoint and creates a `SessionBooking` first; at check-in time the existing sign-in endpoint links the booking and produces the attendance record.

```python
# attendance_service/models/booking.py

class SessionBookingStatus(str, Enum):
    PENDING    = "pending"     # awaiting payment / approval
    CONFIRMED  = "confirmed"   # paid / approved, capacity held
    ATTENDED   = "attended"    # check-in produced an AttendanceRecord
    NO_SHOW    = "no_show"     # session passed without check-in
    CANCELLED  = "cancelled"   # member or admin cancelled before session
    EXPIRED    = "expired"     # PENDING booking aged out

class BookingChannel(str, Enum):
    MEMBER_SELF    = "member_self"     # member booked directly
    ADMIN          = "admin"           # admin booked on behalf of member
    CORPORATE_BULK = "corporate_bulk"  # corporate wellness bulk booking
    BUNDLE_CART    = "bundle_cart"     # paid via the multi-session cart

class SessionBooking(Base):
    __tablename__ = "session_bookings"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    # Cross-service refs — plain UUIDs, no FKs, per the architecture rule.
    session_id:     Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    member_id:      Mapped[uuid.UUID] = mapped_column(nullable=False, index=True)
    member_auth_id: Mapped[str]       = mapped_column(nullable=False, index=True)

    # Booking lifecycle
    status:  Mapped[SessionBookingStatus] = mapped_column(
        SAEnum(SessionBookingStatus, name="session_booking_status_enum",
               values_callable=enum_values),
        nullable=False, default=SessionBookingStatus.PENDING,
    )
    channel: Mapped[BookingChannel] = mapped_column(
        SAEnum(BookingChannel, name="booking_channel_enum",
               values_callable=enum_values),
        nullable=False, default=BookingChannel.MEMBER_SELF,
    )

    # Pricing snapshot in kobo, captured at booking time.
    fee_amount_kobo: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Payment linkage (cross-service; plain UUIDs).
    payment_intent_id:     Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True, index=True)
    wallet_transaction_id: Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True)

    # Corporate-wellness link (forward-looking). Plain UUID.
    corporate_program_id:  Mapped[Optional[uuid.UUID]] = mapped_column(nullable=True, index=True)

    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    booked_at:    Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    cancelled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at:   Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at:   Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at:   Mapped[datetime] = mapped_column(DateTime(timezone=True),
                                                    default=utc_now, onupdate=utc_now)

    # Defence in depth: a member can only have one active booking per session.
    __table_args__ = (
        UniqueConstraint("session_id", "member_id", name="uq_session_bookings_session_member"),
    )
```

**`AttendanceRecord` gains one optional intra-service FK** linking back to the booking that produced it (when there was one):

```python
class AttendanceRecord(Base):
    # …existing fields…
    booking_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("session_bookings.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
```

This is an **intra-service** FK (both tables live in `attendance_service`), so the cross-service-no-FK rule doesn't apply. `ondelete="SET NULL"` means cancelling a booking that already produced attendance leaves the attendance record intact (history preserved).

### Walk-in vs pre-book flow after Phase 3

```
WALK-IN (today's flow — unchanged)
    member at pool → POST /sessions/{id}/sign-in
    → AttendanceRecord(session_id, member_id, status=PRESENT, booking_id=NULL)

PRE-BOOK (new flow — for corporate wellness, popular sessions, etc.)
    member browses → POST /sessions/{id}/book
    → SessionBooking(status=PENDING, capacity reserved)
    payment clears (Paystack webhook / Bubbles debit)
    → SessionBooking.status = CONFIRMED

    at session time, coach/member calls existing sign-in
    → SessionBooking is found by (session_id, member_id)
    → AttendanceRecord(…, booking_id=<booking.id>, status=PRESENT)
    → SessionBooking.status = ATTENDED

NO-SHOW
    SessionBooking.status was CONFIRMED but no AttendanceRecord ever created.
    Nightly job (or end-of-session sweep): SessionBooking.status = NO_SHOW.

CANCEL
    member cancels before session → SessionBooking.status = CANCELLED
    refund handled per policy (out of scope for this doc)

CORPORATE BULK
    sponsor purchases N×M (N sessions × M employees)
    → N×M SessionBooking rows, channel=CORPORATE_BULK, status=CONFIRMED
    each employee follows the standard sign-in flow at session time
```

---

## Phased migration

Each phase is independently deployable and reversible.

### Phase 3.0 — design lock

This document. Awaiting an implementation slot.

### Phase 3.1 — Session-side cleanup (`sessions_service`)

- Drop `SessionType.ONE_ON_ONE` and `SessionType.GROUP_BOOKING` from the enum.
- Drop `Session.booking_id` column.
- Trim `models/_validators.py`, the SQLAlchemy event listener payload, and the Pydantic validator on `SessionCreate`.
- Replace the Phase 2 CHECK constraint with the 4-branch version (`migrate.sh --manual sessions_service "simplify discriminator constraint"`).
- Update the 19 `_session_discriminator` unit tests — drop the four `ONE_ON_ONE` / `GROUP_BOOKING` test cases.

**Risk: low.** Zero rows use the dropped types; nothing references `booking_id`.
**Estimate: ~half a day.**

### Phase 3.2 — Cohort taxonomy (`academy_service`)

- Add `CohortType` enum + `Cohort.type` column with default `GROUP` and `server_default="group"` (auto-backfills existing rows).
- Add `Cohort.corporate_program_id` column (nullable, indexed; no FK).
- `migrate.sh academy_service "add cohort type and corporate link"`.
- Expose `type` in the academy router responses; the admin cohort-creation UI gets a type picker.
- No data migration needed beyond the server_default.

**Risk: low.** Additive change; existing cohorts become `GROUP` automatically.
**Estimate: 1 day** (model + admin UI picker + tests; corporate-wellness flow is a separate later project).

### Phase 3.3 — `SessionBooking` table (`attendance_service`)

- Add `SessionBookingStatus`, `BookingChannel` enums.
- Add `SessionBooking` model + table.
- Add `AttendanceRecord.booking_id` column with intra-service FK.
- `migrate.sh attendance_service "add session bookings"`.
- Existing sign-in endpoint gets a small change: on entry, look up an existing `SessionBooking` for `(session_id, member_id)`; if found and status is `CONFIRMED`, set the new `AttendanceRecord.booking_id` and transition the booking to `ATTENDED`. If none found, behaviour is identical to today (walk-in).
- New endpoints (these are product work, not infra):
  - `POST /attendance/sessions/{id}/book` — member self-book; creates `SessionBooking(status=PENDING)`, returns a payment intent reference for the fee.
  - `POST /attendance/bookings/{id}/cancel` — member or admin cancel.
  - `POST /internal/attendance/bookings/bulk` — service-role bulk-create for corporate-wellness orchestration.
- Nightly task (in attendance_service's existing arq queue) — sweep `CONFIRMED` bookings past their session's `ends_at` with no matching `AttendanceRecord` → `NO_SHOW`.

**Risk: medium.** New table + new endpoints + sign-in flow change. Walk-in stays unchanged but needs regression tests.
**Estimate: 3–5 days** (table + flow change + endpoints + nightly task + tests).

### Phase 3.4 — Surface the new flow

- Frontend: pre-book button on the session detail page for sessions that are pre-bookable (vs walk-in only).
- Admin: bulk-booking tools for corporate-wellness onboarding.
- Reporting: include `SessionBooking` aggregates (utilisation, no-show rate, channel mix).
- Communications: confirmation email on `status=CONFIRMED`; reminder before session; refund-confirmation on `CANCELLED`.

**Risk: medium** (product surface).
**Estimate: 1 week+** depending on how much corporate-wellness UI ships with it.

---

## Consumer impact (cross-service)

Phase 3.1 (session-side cleanup):
- `services/transport_service/routers/routes.py` — uses `get_session_by_id`; doesn't read `booking_id`. No change.
- `services/reporting_service` — `range-stats` / `detailed-stats` aggregate by `session_type.value`. Dropping two enum values means two zero-rows-anyway buckets disappear from reports. No code change required.
- `services/sessions_service/routers/internal.py` `SessionBasic` — already doesn't include `booking_id`. No external contract change.
- Frontend admin/sessions type picker — drops two unused dropdown options.

Phase 3.2 (cohort type):
- `services/academy_service/routers/cohorts/*` — type picker on create; type visible on read.
- `services/reporting_service` flywheel cards — could aggregate enrolments by cohort type.
- Frontend admin cohort-creation page — adds the picker.
- No cross-service contract change (academy's existing cohort responses just gain one field).

Phase 3.3 (SessionBooking):
- `services/payments_service` — needs to know about the new `SessionBooking.id` so payment intents can reference it (similar to how cohort enrollments are referenced today). This is the main cross-service contract change.
- `services/communications_service` — confirmation / reminder email templates.
- Frontend `(member)/sessions/page.tsx` — pre-book button + booking-state display.
- `services/sessions_service` — unchanged.

---

## Cost estimate

| Phase | Effort | Risk |
|---|---|---|
| 3.0 design lock (this doc) | done | none |
| 3.1 session-side cleanup | ~½ day | low |
| 3.2 cohort taxonomy | ~1 day | low |
| 3.3 SessionBooking table + sign-in change | 3–5 days | medium |
| 3.4 product surface (booking UI, corporate flow, comms) | 1+ week | medium |
| **Phase 3 infrastructure (3.1–3.3)** | **~1 week** | **low–medium** |
| **Phase 3.4 product** | **separate slot** | medium |

3.1 + 3.2 + 3.3 can ship without 3.4 — the schemas are in place, walk-in flow is unchanged, and the booking surface stays internal-only until product is ready.

---

## What this buys us

1. **Session model is honest about its own dimensions.** ONE_ON_ONE / GROUP_BOOKING / booking_id were a lie — they implied a flow that didn't exist. After 3.1, the schema describes only what actually exists.

2. **Academy can express the products we actually want.** Private 1-on-1 academy, member-specified small groups, corporate-sponsored cohorts — all expressible as `Cohort(type=…)` with no new tables and no Session-level changes. Existing payment intents, enrolments, attendance flow all work.

3. **The booking concept gets a name.** `SessionBooking` mirrors `RideBooking`; both are intent-to-attend rows owned by attendance_service / transport_service respectively. `AttendanceRecord` cleanly represents physical presence, not intent.

4. **Walk-in flow doesn't break.** The most-trafficked path (member at pool → sign-in) stays exactly as today. The new pre-book flow is additive.

5. **Corporate wellness has a clear schema path.** When the product is scoped, the data model already supports it: `Cohort(type=CORPORATE, corporate_program_id=...)` for the academy version, `SessionBooking(channel=CORPORATE_BULK, corporate_program_id=...)` for the community/club version.

---

## What this costs

1. **Three migrations across three services** (sessions, academy, attendance) — each small and reversible.
2. **One cross-service contract change** in 3.3 — payments needs to know about `SessionBooking.id` for the pre-book payment-intent flow.
3. **Sign-in flow refactor** in attendance_service — the most error-prone change; walk-in regression coverage matters.
4. **Frontend work** in 3.4 — pre-book button, booking-state surface, corporate flow. Sized with the corporate-wellness product, not on its own.

---

## Alternatives considered (and rejected)

### A. Stay at Phase 1+2

- **Pros:** zero risk; integrity already enforced; everything works today
- **Cons:** the aspirational `ONE_ON_ONE` / `GROUP_BOOKING` / `booking_id` slots continue to confuse new contributors; the corporate-wellness product would have to fight the current model

### B. Full table-per-type split (original reviewer suggestion)

- Five tables per session type; the data model leaks cross-service domain names; high blast radius. Rejected.

### C. Rename `AttendanceRecord` → `SessionBooking`, expand status enum (Option 1 from the conversation)

- Single table fuses intent + fact; matches `RideBooking` naming
- **Rejected** in favour of two-table model (Option 2 below): intent and fact really are different concepts; fusing them complicates corporate-wellness, no-show, refund, and reporting flows

### D. Three explicit columns (`layer`, `format`, `context`)

- Earlier draft of this note proposed this
- **Rejected** as over-engineered: layer is derivable from `session_type`, and format is only meaningful for Academy, which now expresses it via `Cohort.type`

### E. **Option 2 — two-table booking model (chosen)**

- `SessionBooking` = intent (new)
- `AttendanceRecord` = fact (existing, gains `booking_id`)
- Walk-in path: AttendanceRecord only
- Pre-book path: SessionBooking → eventually AttendanceRecord
- **Pros:** intent and fact stay distinct; walk-in flow is preserved exactly; corporate-wellness slots in cleanly; reporting / billing / refunds have a clean home
- **Cons:** one extra table; coordination concern (booking exists with no attendance vs attendance with no booking) handled by the nightly NO_SHOW sweep

---

## Open questions

These don't block Phase 3.1–3.3 but will need answers before 3.4:

1. **Which session types are pre-bookable today?** All of them, or only specific ones? Walk-in might stay the default for community sessions; pre-book might be club-only. Product call.
2. **Pre-book payment policy.** Full pre-pay vs hold-then-charge-on-attendance vs cancellation-free-until-N-hours. Drives the `SessionBookingStatus` transitions.
3. **`SessionTemplate` parallels.** Templates carry `session_type` today; the same trim (drop ONE_ON_ONE / GROUP_BOOKING) applies. Bundle into 3.1.
4. **Reporting compat.** `range-stats` etc. aggregate by `session_type`; dropping enum values is safe (zero rows), but downstream cards may need a one-line update.
5. **Corporate-wellness scoping.** The `corporate_program_id` column lands in 3.2 / 3.3 but the corporate product (sponsor model, billing terms, ingest API, admin tools) is a separate design note.

---

## Decision

**Phase 3 scope is locked** as:
- 3.1 sessions cleanup (drop aspirational discriminators)
- 3.2 cohort taxonomy (`CohortType`, `corporate_program_id`)
- 3.3 `SessionBooking` (two-table booking model, Option 2)
- 3.4 product surface (separate slot, ships with corporate-wellness)

A1 stays "closed" at Phase 2 for risk-management purposes — the integrity gap is already solved. Phase 3 ships when there's an implementation slot; the design is ready and reversible.

When ready, start at 3.1 (lowest risk, lowest blast radius) and proceed in order. 3.1 and 3.2 are independently shippable; 3.3 should ship together with 3.4 or behind a feature flag, since the pre-book surface needs frontend work to be useful.
