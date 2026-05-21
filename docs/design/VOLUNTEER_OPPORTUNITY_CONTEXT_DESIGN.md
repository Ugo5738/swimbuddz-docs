# Volunteer Opportunity Context & Templates (design note)

> **Status:** Design note — *awaiting review*
> **Services:** `volunteer_service` (8012), `sessions_service` (8002), `events_service` (8007)
> **Date:** 2026-05-20
> **Author:** Daniel + AI collaborator

---

## Why this note exists

Two operational pain points keep coming up:

1. **Volunteer opportunities live in their own silo.** A member who's booking a session has no way to see "there's a volunteer slot open at this exact session — want to claim it?" Volunteers and bookers are the same population on the same dates at the same pools, but the UX treats them as two unrelated journeys.
2. **Admins create opportunities one at a time, every week.** Same Saturday photographer slot, same Tuesday lane marshal — every week, by hand. Session templates already solved the analogous problem for sessions; nothing equivalent exists for volunteer opportunities.

This note proposes (a) surfacing relevant volunteer opportunities inside the booking/RSVP flows, and (b) introducing recurrence for volunteer opportunities — without a new polymorphic abstraction the data model doesn't need yet.

---

## What's already in the model (and unused)

`VolunteerOpportunity` (`services/volunteer_service/models/core.py:192`) already has the right columns for session/event linkage:

```python
session_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
event_id:   Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
```

Both are nullable, both are plain UUIDs (no DB FK — matches the project's [no-cross-service-FK rule](../reference/SERVICE_COMMUNICATION.md)). The Pydantic `Create` and `Response` schemas already round-trip these fields. What's missing:

- The **admin opportunity form** has no fields to set `session_id` or `event_id` at creation; it only captures the legacy `date` + `location_name` + free-text time.
- The **`VolunteerOpportunityUpdate` schema omits both fields** — once an opportunity is created, the linkage is frozen. (Small wart; should be fixed alongside this work.)
- The **list endpoints** don't accept `session_id` / `event_id` as query params, so the booking page has no efficient way to ask "what opportunities are attached to this session?".

**Implication:** the bulk of "let members claim volunteer slots when booking a session" is a UI + thin-API problem, not a schema problem.

---

## Why a polymorphic `context_type` / `context_id` was rejected

An earlier iteration of this note proposed a generic `context_type` enum (`session` | `event` | `standalone` | future) plus a `context_id` UUID, in place of two nullable FK columns. After looking at the data, that's over-engineered:

1. **The two columns already exist** and are already typed correctly. Removing them in favour of a discriminator pair is a migration with no immediate benefit.
2. **Two contexts is not "many contexts."** The cost of a third nullable column when (e.g.) Academy cohorts start needing volunteer support is a single Alembic migration — comparable to the migration we'd run *now* to introduce the discriminator. We pay the same cost, later, only if we actually need it.
3. **The `Session` discriminator note (`A1_SESSION_DISCRIMINATOR_REFACTOR.md`) explicitly preserved the "multiple nullable context-FK columns" pattern** for the same reasons — after considering and rejecting a polymorphic alternative. We should be consistent.

**Decision:** keep `session_id` and `event_id` as nullable columns. Revisit if a third context (cohort, pool partnership, store campaign) needs to attach volunteer opportunities AND there's evidence the columns are proliferating beyond ~3.

---

## Scope

Three pieces, increasing in size:

### A. Surface opportunities inside booking / RSVP flows

**Backend:**
- Add `session_id: Optional[UUID]` and `event_id: Optional[UUID]` query params to both:
  - `GET /api/v1/volunteer/opportunities` (member router)
  - `GET /api/v1/volunteer-admin/opportunities` (admin router)
- Add `session_id` and `event_id` to `VolunteerOpportunityUpdate` so the linkage can be corrected after creation.

**Frontend — Session booking page:**
- After the session loads, fetch `GET /api/v1/volunteer/opportunities?session_id={id}&status=open`.
- Render a "Volunteer at this session" panel below the main booking CTA. Each open opportunity shows: role title, slots remaining, min tier, and a "Claim" / "Request" CTA gated by the member's current tier.
- Claim flow reuses the existing `POST /api/v1/volunteer/opportunities/{id}/claim` endpoint — no new claim API needed.

**Frontend — Event detail page** (when events surface): identical pattern keyed on `event_id`.

**Out of scope for this phase:**
- Showing opportunities on session cards in list views (only on the detail/booking page).
- Cross-tier nudges ("you're Tier 1 — these Tier 2 opportunities would unlock if you …").

### B. Authoring at the opportunity level

**Admin "Create Opportunity" modal** (`swimbuddz-frontend/src/app/(admin)/admin/community/volunteers/page.tsx`) gains an optional **"Attach to"** field with three modes:

1. **Session** — typeahead over upcoming sessions in the next 90 days (calls existing `GET /api/v1/sessions`). On select: writes `session_id`, **pre-fills `date` / `start_time` / `end_time` / `location_name`** from the session, and marks those fields read-only with an unlink affordance.
2. **Event** — same UX, keyed on the events list. Writes `event_id`.
3. **Standalone** (default) — current behaviour, all fields editable.

This explicit attach UX matters more than the heuristic time/location matching I floated earlier in the conversation: it makes the linkage **authoritative** (we know which session this opportunity is for) rather than **inferred** (we hope the location strings match).

### C. Templates

Two surfaces, because they solve two different problems:

#### C1. Session-template-driven opportunities (the bulk case)

Most recurring volunteer needs are *attached to* recurring sessions: every Saturday morning Club session needs 2 photographers, every Tuesday Academy session needs 1 lane marshal. Maintaining a separate volunteer-side schedule for those would drift from the session schedule the moment an admin moves the Tuesday session by 30 minutes.

**Proposal:** introduce a child collection on `SessionTemplate`. New table, lives in **`volunteer_service`** (not `sessions_service`, to preserve service isolation):

```python
# services/volunteer_service/models/core.py
class SessionTemplateVolunteerSlot(Base):
    """A recurring volunteer need declared on a session template.

    Materialised into a real VolunteerOpportunity whenever a session is
    generated from the parent template. Cross-service ref:
    session_template_id → sessions_service.session_templates.id (plain
    UUID, no FK).
    """
    __tablename__ = "session_template_volunteer_slots"

    id:                    UUID PK
    session_template_id:   UUID (indexed, no FK)
    role_id:               FK → volunteer_roles.id
    slots_needed:          int = 1
    opportunity_type:      OpportunityType = OPEN_CLAIM
    min_tier:              VolunteerTier = TIER_1
    qr_checkin_enabled:    bool = false
    title_override:        Optional[str]   # else use the role's title
    description_override:  Optional[str]
    cancellation_deadline_hours: int = 24
```

**How materialisation works** (preserves service isolation):

1. `sessions_service` generates sessions from a template (existing logic — `routers/templates.py:206+`).
2. On each successful generation, `sessions_service` calls a new internal endpoint:
   `POST /internal/v1/volunteer/opportunities/from-session-template` with `{ session_id, session_template_id, date, start_time, end_time, location_name }`.
3. `volunteer_service` looks up its own `SessionTemplateVolunteerSlot` rows for that template and creates one `VolunteerOpportunity` per slot, with `session_id` set and `status=OPEN` (skipping the DRAFT step — admin already pre-approved by configuring the template).

The HTTP roundtrip mirrors the existing `internal.py` pattern other services use (e.g. attendance ↔ sessions). No imports cross the service boundary.

**Admin UX:** the existing SessionTemplate edit modal gains a "Volunteer needs" section listing the configured slots with add/remove/edit. Saving the template saves the slots in the same transaction (one PATCH to sessions, one PATCH to volunteer; minor consistency risk acceptable for admin-only writes).

#### C2. Standalone `VolunteerOpportunityTemplate` (the long-tail case)

Recurring volunteer needs *not* tied to a session: community outreach every Saturday afternoon at a community centre, monthly beach clean-up, etc.

```python
class VolunteerOpportunityTemplate(Base):
    __tablename__ = "volunteer_opportunity_templates"

    id:                    UUID PK
    title:                 str
    description:           Optional[str]
    role_id:               FK → volunteer_roles.id
    day_of_week:           int        # 0=Monday … 6=Sunday
    start_time:            time
    duration_minutes:      int
    location_name:         Optional[str]
    slots_needed:          int = 1
    opportunity_type:      OpportunityType = OPEN_CLAIM
    min_tier:              VolunteerTier = TIER_1
    qr_checkin_enabled:    bool = false
    cancellation_deadline_hours: int = 24
    auto_generate:         bool = false   # mirror SessionTemplate field
    is_active:             bool = true
    created_at / updated_at
```

A weekly worker (or the existing session-template auto-generate cron, repurposed) materialises these into `VolunteerOpportunity` rows N weeks ahead.

**Admin UX:** new "Volunteer Templates" tab on the admin volunteers page (`(admin)/admin/community/volunteers/page.tsx`), parallel to the existing Roles / Opportunities tabs. Reuses the create-opportunity form shape.

---

## Phasing

| Phase | Scope | Migrations |
|---|---|---|
| **1** | Section A (booking-time discovery) + `VolunteerOpportunityUpdate` accepts session_id/event_id | None — pure additive API + frontend |
| **2** | Section B (admin attach-to-session/event UX) | None — UI uses fields already in `Create` schema |
| **3** | Section C1 (`SessionTemplateVolunteerSlot`) + internal materialisation endpoint + SessionTemplate admin UX | 1 new table |
| **4** | Section C2 (standalone `VolunteerOpportunityTemplate`) + admin UX + materialisation job | 1 new table + 1 cron job |

Phases 1+2 should ship together — there's no value in surfacing session-attached opportunities to members (Phase 1) until admins can attach them (Phase 2). Phases 3 and 4 are independent of each other and of 1+2.

---

## Open questions

1. **Tier gating in the booking-time panel.** Should a Tier 1 member see Tier 2/3 opportunities as "you need Tier 2 to claim this" (motivational) or hidden entirely (cleaner UX)? Default proposal: hidden, with a single "More volunteer roles unlock at Tier 2" link at the bottom.
2. **What happens to opportunities when a session is cancelled?** The current model has no cascade — opportunities are orphaned in the DB and still appear on the volunteer list. Phase 1 should at minimum: when `sessions_service` cancels a session, call an internal endpoint that cancels matching opportunities (`status = CANCELLED`). Reuses the same HTTP pattern as C1's materialisation.
3. **Should opportunities created from a session template be editable individually?** Proposal: yes, with no propagation back to the template — editing the generated opportunity only affects that instance. Same model as session templates today (edit a generated session, template is untouched).
4. **Naming.** "VolunteerOpportunityTemplate" is verbose. "VolunteerSchedule"? "RecurringVolunteerSlot"? Final naming TBD at implementation time.

---

## Non-goals

- Auto-claim ("if you book this session, you're volunteered for the role you usually take"). Too magical; volunteering should always be an explicit yes.
- Cross-service compensation (volunteer slot → wallet credit). Already covered by the rewards engine; out of scope here.
- Moving opportunities under a `context_type` discriminator. See "Why a polymorphic context_type / context_id was rejected" above.
