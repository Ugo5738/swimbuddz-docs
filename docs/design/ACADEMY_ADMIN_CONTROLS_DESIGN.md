# Academy Admin Controls — Evidence Access & Coach Decision Override

> **Status:** Draft — Awaiting Review
> **Owning services:** `academy_service` (8006), `media_service` (8008), eventually `ai_service` (8011)
> **Date:** 2026-05-20
> **Author:** Daniel + AI collaborator

---

## 1. Overview

Two related capabilities the admin role needs on the academy progress flow:

1. **View and download every piece of student-submitted evidence** for an enrollment — videos and images uploaded against milestone claims — with a full audit trail of who looked at or downloaded what.
2. **Override a coach's approval or rejection** of a milestone claim — preserving the coach's original decision in the historical record, attributing the override to the admin with a required reason, and leaving room for the AI service to post the same kind of override on its own behalf later.

These belong in one design because they share the same audit substrate, the same admin-vs-coach role boundary, and the same `MilestoneReviewEvent` semantics. Splitting them into two designs risks divergent audit shapes.

### Design principles

- **Service isolation holds.** No cross-service DB reads or FKs (see `memory: project_no_cross_service_fks`). The frontend orchestrates the join between an academy progress row's `evidence_media_id` and the media service's `MediaItem`. Backend services only own their own tables.
- **The coach's decision is never silently overwritten.** An admin override is a *new event on top of* the coach's review, not a mutation that erases provenance. The live `StudentProgress` row keeps `reviewed_by_coach_id` pointing at the coach.
- **Every admin read of student-submitted media is audited.** Students upload video of themselves swimming; many are minors. Access without an audit trail is unacceptable.
- **The AI service is just another principal.** It does not need its own override mechanics — it posts through the same admin-override path with a distinct `actor_role` and richer metadata.
- **Adopt the B4 canonical audit shape for new audit tables.** B4 (Audit-Log Unification) defines a canonical column set; this design's new `media_audit_logs` table is the first new table to adopt it, demonstrating the pattern for the deferred B4 refactor of the three legacy audit tables.

---

## 2. What already exists

This section is load-bearing — every "build" call below is justified by something missing here. Verified against the codebase as of 2026-05-20.

| Capability | Present? | Location |
|---|---|---|
| Admin role check (`require_admin`) | yes | [libs/auth/dependencies.py:180-200](swimbuddz-backend/libs/auth/dependencies.py:180) |
| `is_admin_or_service()` helper | yes | `libs/auth/dependencies.py` |
| Service-role check (`require_service_role`) | yes | [libs/auth/dependencies.py:203-214](swimbuddz-backend/libs/auth/dependencies.py:203) |
| Coach approve/reject endpoint | yes | [academy_service/routers/progress.py:43-188](swimbuddz-backend/services/academy_service/routers/progress.py:43) — already accepts admins, tags `actor_role="admin"` |
| `MilestoneReviewEvent` audit table | yes | [academy_service/models/progress.py:175-254](swimbuddz-backend/services/academy_service/models/progress.py:175) — append-only, snapshots notes/evidence/score, has `actor_role` |
| `MilestoneEventType` enum | yes | `academy_service/models/progress.py` — values: `CLAIMED, APPROVED, REJECTED, STATUS_CHANGED` |
| Private-bucket presign on response | yes | [media_service/routers/_helpers.py:14-39](swimbuddz-backend/services/media_service/routers/_helpers.py:14) (`_maybe_presign_url`) |
| Frontend media URL resolver with cache | yes | `swimbuddz-frontend/src/hooks/useMediaUrl.ts` |
| Admin enrollment detail page | partial | `swimbuddz-frontend/src/app/(admin)/admin/academy/enrollments/[id]/page.tsx` — shows status, member, payments; no evidence gallery, no override UI |
| Media-service audit table | **no** | nothing exists; admin reads are unlogged |
| Override-specific event type / endpoint | **no** | overrides currently go through `POST /progress` and are indistinguishable from a coach's own decision in the event stream |
| `override_reason` field on event | **no** | no place to record "why" |
| AI principal / service-account identity | **no** | `ai_service` authenticates as `service_role` but has no stable `actor_id` |
| B4 canonical audit shape adoption | **no** | three legacy tables (wallet, store, chat) diverge; see [B4_AUDIT_LOG_UNIFICATION.md](docs/design/B4_AUDIT_LOG_UNIFICATION.md) |

**The most important takeaway:** `MilestoneReviewEvent` already records admin actions. What's missing is the *semantics* — there's no way to tell, from the event stream, whether an admin's APPROVED event was the *original* review of a pending claim or an *override* of a coach's earlier decision. That distinction is the core of Feature 2.

---

## 3. Scope & non-goals

### In scope

- Admin endpoints in `media_service` to list and download student evidence for a given enrollment, with per-access audit logging.
- A new `media_audit_logs` table in `media_service`, following the B4 canonical shape.
- A new admin-override endpoint in `academy_service` with explicit semantics, a required reason, and a new `OVERRIDE_COACH` event type.
- Preserving the coach's `reviewed_by_coach_id` on overrides (live-row invariant change).
- An "Evidence" gallery and "Override" UI on the admin enrollment-detail page.
- A documented AI-service principal contract so AI-driven overrides slot into the same path later.

### Out of scope

- Implementing the AI override workflow itself (scoring, confidence thresholds, auto-approve policy). Only the *shape* it posts through is fixed here.
- Refactoring the three legacy audit tables (wallet, store, chat) — that is B4's domain, sequenced as its own three PRs.
- Surfacing the audit log to non-admin roles. Coaches don't see admin reads of their students' videos.
- Changing how *coaches* approve or reject. The existing `POST /progress` endpoint stays exactly as it is.
- Bulk-override or batch-review tooling. One claim at a time, by design — overrides should be deliberate.

---

## 4. Feature 1 — Admin evidence access

### 4.1 The two operations

| Operation | What it returns | Why separate |
|---|---|---|
| **List evidence for an enrollment** | Array of MediaItem summaries (id, milestone_id, file_url presigned, thumbnail_url presigned, content_type, created_at, uploader_auth_id) for every `evidence_media_id` linked to a StudentProgress row in this enrollment | Lets admin browse without N round-trips |
| **Download a single piece of evidence** | A short-TTL presigned URL (or a 302 redirect to one) | Single-purpose URL; logged as a distinct action |

"List" is a read; "Download" is the access actually worth flagging if it ever becomes anomalous. Both are audited, but with distinct `action` values so we can rate-limit or alert differently.

### 4.2 Endpoints

```
GET  /api/v1/media/admin/enrollments/{enrollment_id}/evidence
GET  /api/v1/media/admin/items/{media_id}/download
```

Both gated by `require_admin`.

The list endpoint accepts the `enrollment_id` only — it does **not** query `academy_service` directly (service isolation). Instead, the frontend (which already fetches StudentProgress[] for the page) passes the set of evidence_media_ids as a query param OR the endpoint accepts the list directly:

```
GET /api/v1/media/admin/items?ids=<csv>
```

Either works. The CSV-batch variant is simpler and matches existing patterns. Recommendation: use the batch endpoint and have the frontend pass the IDs.

Response shape:

```
[
  {
    "id": "uuid",
    "media_type": "VIDEO" | "IMAGE",
    "content_type": "video/mp4",
    "file_url": "<presigned, 1h TTL>",
    "thumbnail_url": "<presigned, 1h TTL>" | null,
    "is_processed": bool,
    "processing_error": str | null,
    "uploaded_by": "uuid",
    "uploaded_at": "iso8601",
    "size_bytes": int | null,
    "duration_seconds": int | null  // from metadata_info, if video
  },
  ...
]
```

Download endpoint returns:

```
{ "download_url": "<presigned, 60s TTL>", "expires_at": "iso8601" }
```

Short TTL (60s) means the URL has to be used immediately; sharing it after the fact is harmless because it dies fast. Longer TTL (1h) on the list endpoint is fine because the list view always re-fetches.

### 4.3 Audit table — `media_audit_logs`

This is the first table to adopt the B4 canonical shape directly. Schema (per [B4_AUDIT_LOG_UNIFICATION.md](docs/design/B4_AUDIT_LOG_UNIFICATION.md) §"Proposed canonical shape"):

```
id            UUID  pk
domain        str   constant: "media"
entity_type   str   "media_item"
entity_id     UUID  the media_items.id being accessed
action        str   "media.admin.list" | "media.admin.download" | "media.admin.view"
actor_id      UUID  the admin's auth_id
actor_label   str?  null for now (UUID always available for admin reads)
old_value     JSONB? null on reads
new_value     JSONB? null on reads
reason        str?  null for routine access; required for bulk export (future)
ip_address    str?  optional, from request
created_at    timestamptz
```

Write a row **once per media item touched per request**. List of 12 items = 12 rows. This is deliberate — it makes "which admin saw which student's video" a single-row query, which is what compliance review will ask.

Define the action enum **locally in media_service** (per B4's "each service owns its vocabulary"). The canonical mixin lives in `libs/common/audit.py` once B4 lands; until then, this table is built directly against the canonical column set so the future mixin adoption is a no-op rename.

Indexes:

```
btree (actor_id, created_at desc)  -- "what did this admin look at recently"
btree (entity_id, created_at desc) -- "who looked at this student's video"
btree (created_at desc)             -- recent-activity dashboards
```

### 4.4 Frontend changes

Single page change: `swimbuddz-frontend/src/app/(admin)/admin/academy/enrollments/[id]/page.tsx`.

Add an "Evidence" section to the enrollment detail. For each StudentProgress row that has `evidence_media_id`:

- Thumbnail tile (uses `useMediaUrl` — already implemented and cached).
- Milestone name and claim date overlay.
- Click to expand: full `<video>` or `<img>` (reuse the `EvidenceMedia` component from the coach view).
- Per-tile "Download" button that calls the new download endpoint and triggers a browser download from the returned presigned URL.

No new audit logging from the frontend — the backend logs on every list and download call.

---

## 5. Feature 2 — Admin override of coach decisions

### 5.1 Why a distinct endpoint instead of reusing `POST /progress`

The existing endpoint is build for the *coach* path: a coach reviews a pending claim and approves or rejects. The same endpoint *also* works for an admin (lines 144 + 48 of progress.py) but it can't distinguish two very different intents:

| Intent | What it means | Today |
|---|---|---|
| Admin reviews a *pending* claim | Same as a coach review; coach hasn't acted yet | Indistinguishable from a coach review in the event log |
| Admin **overrides** a coach's prior approval/rejection | Disagrees with the coach; needs a reason | Looks like an APPROVED/REJECTED event with `actor_role="admin"` and silently overwrites `reviewed_by_coach_id` |

The second case is the one this design fixes. Conflating the two means:

- The audit log loses the link between the coach's decision and the override.
- The live `StudentProgress` row loses the coach's identity.
- There's no enforced reason — important precedent for a tool that, by design, second-guesses paid coaches.

A separate endpoint also makes the AI integration cleaner: the AI service should *only* be allowed to post overrides (via this endpoint), never to review pending claims (via the existing one).

### 5.2 Endpoint shape

```
POST /api/v1/academy/admin/progress/override
```

Gated by `require_admin` (which already admits `service_role`, so the AI service can call it).

Request body:

```
{
  "enrollment_id": "uuid",
  "milestone_id": "uuid",
  "new_status": "ACHIEVED" | "PENDING",
  "override_reason": "string (required, min 8 chars)",
  "coach_notes_addendum": "string?",  // appended, not replacing
  "ai_metadata": {                      // present only when called by service_role
    "model_version": "string",
    "confidence_score": float,
    "input_features": {...}
  }?
}
```

Behaviour:

1. Loads existing `StudentProgress` row. 404 if not found. 400 if `reviewed_by_coach_id IS NULL` (nothing to override yet — admin should use the coach endpoint).
2. Records the previous status.
3. Updates the row:
   - `status` → `new_status`
   - `coach_notes` → appended `coach_notes_addendum`, if present (never overwritten — coach's notes are preserved)
   - `reviewed_by_coach_id` → **untouched** (live-row invariant; see 5.4)
   - `reviewed_at` → **untouched**
4. Writes a `MilestoneReviewEvent` row with `event_type=OVERRIDE_COACH`, `actor_id=current_user.user_id`, `actor_role=...` (see 6 for the value), and the new fields below.
5. Emits the academy reward event same as the coach path (so XP/Bubbles fire correctly).

### 5.3 Schema additions

Migration name suggestion: `academy_service "add override semantics to milestone review events"`. **Generate via `./scripts/db/migrate.sh academy_service "..."`** — never hand-write (`memory: feedback_no_handwritten_migrations`).

```
ALTER TYPE milestone_event_type_enum ADD VALUE 'OVERRIDE_COACH';

ALTER TABLE milestone_review_events
  ADD COLUMN override_reason       TEXT,           -- required when event_type=OVERRIDE_COACH
  ADD COLUMN override_of_event_id  UUID REFERENCES milestone_review_events(id),
                                                   -- the coach event being overridden
  ADD COLUMN ai_metadata           JSONB;          -- model_version, confidence, features
```

The `override_of_event_id` is the cleanest way to surface "Coach X approved on date D; Admin Y overrode that specific decision". Without it, the UI has to guess by ordering events.

Constraints in code (Pydantic + service layer, not DB-level, because the enum extension is async with the type ADD VALUE):

- When `event_type=OVERRIDE_COACH`, `override_reason` and `override_of_event_id` are required.
- `override_of_event_id` must reference an event of `event_type IN (APPROVED, REJECTED)`.
- The override event's `previous_status` must equal the overridden event's `new_status`.

### 5.4 Live-row invariant

After this change, `StudentProgress` has the following invariant:

> `reviewed_by_coach_id` is the **original** reviewer's identity. It is set on first review (coach or admin) and **never** modified by an override.

This is a semantic change from today. The column name doesn't change; the *meaning* does — from "most recent reviewer" (because the current code overwrites on every review) to "the first reviewer, full stop." Any code that reads the column from now on must interpret it under the new rule. A docstring change on the model makes this explicit; the next person to touch it should not accidentally restore the overwrite.

#### Concrete timeline — today vs after

Today (the live row gets clobbered on override):

```
T0  Coach Alice approves claim
    → student_progress.reviewed_by_coach_id = alice_id
    → milestone_review_events: APPROVED by alice
T1  Admin Bob overrides via POST /progress
    → student_progress.reviewed_by_coach_id = bob_id    ← Alice gone from row
    → milestone_review_events: APPROVED/REJECTED by bob (looks like an original review)
T2  Coach dashboard fetches StudentProgress
    → "Reviewed by Bob"                                 ← Alice's involvement invisible
```

After this change:

```
T0  Coach Alice approves claim
    → student_progress.reviewed_by_coach_id = alice_id  (was NULL, set)
    → milestone_review_events: APPROVED by alice
T1  Admin Bob calls POST /admin/progress/override
    → student_progress.reviewed_by_coach_id stays alice_id
    → milestone_review_events: OVERRIDE_COACH by bob,
        override_of_event_id → alice's APPROVED event,
        override_reason = "video shows incorrect technique on kick #4"
T2  Coach dashboard fetches StudentProgress + recent events
    → "Originally reviewed by Alice; overridden by Bob — reason: …"
```

The audit log already captured the full history today; the change is about whether the *live row* — the thing every coach/parent/report query reads — still references the coach after an override. It should.

#### Code change

In `update_student_progress` ([progress.py:118-123](swimbuddz-backend/services/academy_service/routers/progress.py:118)) the `reviewed_by_coach_id` assignment currently fires unconditionally on any review payload. Tighten it:

```
if progress.reviewed_by_coach_id is None:    # first review only
    progress.reviewed_by_coach_id = (
        progress_in.reviewed_by_coach_id or current_user.user_id
    )
    progress.reviewed_at = progress_in.reviewed_at or utc_now()
# else: subsequent reviews go through /admin/progress/override and do NOT touch this field
```

The new `/admin/progress/override` endpoint never writes `reviewed_by_coach_id` at all.

A future admin "edit the prior review" flow (separate from override — e.g. fixing a typo in the coach's notes) could expose mutation of this field, but it's out of scope here.

### 5.5 Frontend changes

`swimbuddz-frontend/src/app/(admin)/admin/academy/enrollments/[id]/page.tsx`:

Per-milestone, for each StudentProgress row that has `reviewed_by_coach_id`:

- Show the coach's decision panel (name, status, notes, timestamp) — read-only.
- Below it, an "Override decision" button (admin only). On click:
  - Modal with: new status radio, required reason textarea, optional notes addendum.
  - Submit calls the new endpoint.
  - On success, refresh.
- Below both, the event timeline (already implicitly accessible via the audit log) showing every claim/approval/rejection/override event with actor, timestamp, and reason.

The override button is **disabled** if the StudentProgress row has no `reviewed_by_coach_id` (nothing to override); in that case the admin should use the existing review flow.

---

## 6. AI service integration path

This section locks the contract; building the AI side is later work.

### 6.1 Principal identity

The AI service authenticates with a `service_role` JWT (already in place). That handles *authentication* — "is this caller allowed to do this?" — via `require_admin`/`require_service_role`. It does **not** handle *attribution* — "who do we record in the audit log as having done this?" Those are separate concerns and don't need the same value.

For attribution, the AI service needs a stable `actor_id` UUID so that audit queries like "every AI-driven override, ever" work as a single-column predicate.

#### Three options considered

| Option | What it is | Cost |
|---|---|---|
| **A.** Use the JWT's `user_id` claim from the service-role token | Whatever Supabase put in the token | Service-role tokens don't represent a person; different tokens / rotations carry different (or empty) `user_id` claims. "All AI actions" becomes a moving target. |
| **B.** Create a real Supabase user for the AI (`ai-service@swimbuddz.com`) | Genuine `auth.users` row, real password/credentials, real RLS-applicable identity | Service-account credential management, rotation, separate RLS policies, treat-it-like-a-human-but-not branches scattered across services. Sprint-scale. |
| **C. (recommended)** Synthetic UUID hardcoded in `libs/common/principals.py` | A made-up, stable UUID with no row in any identity table | One constant in one file. No auth changes. Attribution-only. |

#### The constant

```
# libs/common/principals.py
from uuid import UUID

AI_SERVICE_PRINCIPAL_ID = UUID("00000000-0000-0000-0000-000000000001")

PRINCIPAL_LABELS: dict[UUID, str] = {
    AI_SERVICE_PRINCIPAL_ID: "AI Service",
    # future service principals slot in here
}
```

The `00000000-…-000000000001` shape is deliberate — visually obvious in DB inspection that the row is not a real user.

#### What gets written on an AI-driven override

```
milestone_review_events.actor_id    = AI_SERVICE_PRINCIPAL_ID
milestone_review_events.actor_role  = "ai_service"
milestone_review_events.ai_metadata = {
    "model_version": "...",
    "confidence_score": 0.93,
    ...
}
```

#### Why the audit query "stays clean"

```sql
-- All AI-driven overrides, ever — one column predicate:
SELECT * FROM milestone_review_events
WHERE actor_id = '00000000-0000-0000-0000-000000000001';

-- Or by role, if you want all service-driven activity across actors:
SELECT * FROM milestone_review_events
WHERE actor_role = 'ai_service';
```

With Option A the same query has to chase historical `user_id`s through token rotations. With Option B it needs a join into `auth.users` to filter by email. Option C reduces both to a one-line predicate.

#### Adding future service principals

Other services that need to write audit attribution (e.g., a scheduler that auto-cancels stale claims, a webhook handler that records system actions) get their own UUIDs allocated in the same file. The `PRINCIPAL_LABELS` map is the single source of truth for UI/admin display.

The synthetic-UUID approach is upgradeable — if at some point real service identities become necessary (e.g., for fine-grained RLS on writes), the principal UUIDs can be promoted to `auth.users` rows without changing any audit-log data, because the UUIDs are stable.

### 6.2 Actor role taxonomy

Extend the existing `actor_role` string column (currently `"student" | "coach" | "admin"`) to admit `"ai_service"`. Per progress.py:144, the assignment logic becomes:

```
if current_user.role == "service_role":
    actor_role = "ai_service"
elif is_admin_or_service(current_user):  # human admin
    actor_role = "admin"
else:
    actor_role = "coach"
```

`actor_id` for the AI path is `AI_SERVICE_PRINCIPAL_ID`, not the JWT's `user_id` (the service role token's user_id is operationally meaningless).

### 6.3 AI-specific fields on the event

`ai_metadata` JSONB column (see 5.3) holds:

```
{
  "model_version": "claude-opus-4-7",
  "confidence_score": 0.93,
  "input_features": { ... },
  "rationale_summary": "..."  // short human-readable summary
}
```

The audit UI shows this in the override card when `actor_role="ai_service"`.

### 6.4 Guardrails (forward-looking; out of scope to implement now)

When the AI integration ships, it should:

- Only override claims that have been pending for > N days, or claims flagged via `score < threshold`.
- Require a minimum `confidence_score` to flip a decision the other way.
- Be rate-limited per enrollment per day.
- Be feature-flag-gated initially (admin-visible override suggestions before fully autonomous).

Those decisions belong in the AI service's own design doc; here they are noted only so we don't accidentally close off the path.

---

## 7. Migrations & rollout

### 7.1 Migration order

Per repo convention, every schema change goes through `./scripts/db/migrate.sh <service> "<message>"` — never hand-written (`memory: feedback_no_handwritten_migrations`). Apply via `alembic upgrade head`, not `reset.sh` (`memory: feedback_never_resetsh_to_apply_migration`).

PRs in order:

1. **academy_service** — adds `OVERRIDE_COACH` enum value, override fields on `milestone_review_events`, the invariant change to `update_student_progress`. Backend only.
2. **media_service** — adds `media_audit_logs` table with the canonical columns. Update `services/media_service/alembic/env.py` `SERVICE_TABLES` set (per CLAUDE.md "Migration Checklist"). Add the new admin endpoints. Wire audit writes.
3. **academy_service** — add the override endpoint and ai_metadata handling.
4. **frontend** — admin evidence gallery + override UI + audit-event timeline on the enrollment detail page.
5. **libs/common** — add `principals.py` with `AI_SERVICE_PRINCIPAL_ID` and label map. (Can be folded into PR 3.)

PRs 1–3 are independent; 4 depends on all three; 5 lands with 3.

### 7.2 Rollout

- No data backfill required. New columns are nullable, the new event type and table only fill from the point the endpoints go live.
- Frontend rolls behind admin role check — non-admins never see the new UI.
- Existing pending overrides (admin actions via `POST /progress` to an already-reviewed claim) remain in the event log as APPROVED/REJECTED with `actor_role="admin"`. They are *not* retroactively reclassified. Future audit dashboards can detect them with the heuristic `actor_role IN ('admin','ai_service') AND event_type IN ('APPROVED','REJECTED') AND previous_status IS NOT NULL` and flag for manual cleanup if needed.

### 7.3 Tests

- academy_service: contract test for the override endpoint covering 404 (no progress), 400 (no prior coach review), required-reason validation, successful override, AI-principal path, audit-event correctness, live-row invariant (`reviewed_by_coach_id` unchanged).
- media_service: tests that admin endpoints require admin, that the audit row is written exactly once per item per request, that download URLs expire within the configured TTL.
- Frontend: component-level for the override modal (disabled state, required reason).

---

## 8. Non-goals (restated)

- AI override policy and thresholds.
- B4 unification of legacy audit tables.
- Coach-side changes to approve/reject UX.
- Audit-log visibility to non-admin roles.
- Bulk admin actions across many enrollments.
- A separate "admin audit dashboard" page — admins read the timeline inline on the enrollment detail page in this phase.

---

## 9. Decisions

All decisions below are closed. Recorded with rationale so the next reader doesn't re-litigate.

### 9.1 One override endpoint, `new_status` in body

```
POST /admin/progress/override
  { new_status: "ACHIEVED" | "PENDING", override_reason: "...", ... }
```

Not split into `/approve` and `/reject`. Symmetric with the existing coach endpoint (`POST /progress` takes `status` in body). Future-proof against adding a third status (e.g., `NEEDS_MORE_EVIDENCE`) without an API change.

### 9.2 Override-of-override is permitted

Admin Carol can override Admin Bob's override of Coach Alice's approval. The `override_of_event_id` chain captures the back-and-forth; the UI shows the most-recent decision plus the full chain.

The risk (ping-pong between admins) is accepted: it's audited, visible, and rare in practice. If real-world misuse appears, add a policy layer later — schema doesn't need to change.

### 9.3 Admin video access — view on-page, download to device

Two distinct admin interactions on student evidence:

| Interaction | How it works | Audit action |
|---|---|---|
| **View on the page** | Same as coaches today — the gallery resolves each `evidence_media_id` via `useMediaUrl`, the `<video>` element plays the bytes from a 1-hour-TTL presigned URL. No new view-specific endpoint. | `media.admin.list` (one row per item surfaced) and `media.admin.view` (when a single-item endpoint is hit) |
| **Download to device** | Explicit "Download" button. Calls `GET /api/v1/media/admin/items/{id}/download`, which returns a **60s-TTL presigned URL**; browser saves directly from S3. | `media.admin.download` |

The bytes do not stream through `media_service`. The short TTL on the download URL contains accidental sharing without paying the bandwidth/latency cost of proxying through the service. The audit row is written when the URL is issued, regardless of whether the admin actually completes the download — that's the right grain (it records intent, not best-effort completion).

### 9.4 Audit tables — retain indefinitely (for now)

`media_audit_logs` and `milestone_review_events` keep rows forever in this phase. Rationale:

- Audit rows are small (a few KB each). At current SwimBuddz scale, even years of admin activity costs negligible storage.
- Compliance/privacy retention is a *platform-wide* concern (NDPR/GDPR-style data-subject deletion, financial-audit retention, etc.) and belongs in a dedicated design — not here.
- When that platform-wide design lands, the right answer for user-PII in audit rows is **pseudonymisation** (hash the actor/subject UUIDs) rather than deletion, so the audit chain stays intact while PII is removed. This design pre-emptively avoids hard FKs from audit tables to user tables (`actor_id` is a plain UUID, not an FK), which keeps that pseudonymisation path open.

Explicit non-decision: no retention windows configured, no archival to cold storage, no auto-pruning. Flag if and when storage cost becomes material.

### 9.5 `ai_metadata` as JSONB on `milestone_review_events`

Not a separate `ai_decisions` table. JSONB is fully queryable in Postgres (`WHERE ai_metadata->>'model_version' = '...'`) and accommodates the fact that AI output shape will evolve faster than we'd want to migrate columns.

Migration path if needed later: `ai_metadata` JSONB → dedicated `ai_decisions` table with structured columns is a mechanical backfill (extract JSONB keys → typed columns, drop JSONB). No data loss. Don't pay the structure cost until the analytics workload demands it (e.g., "average confidence per model version per week" runs hot enough to need indexed columns).

---

## 10. References

- [B4_AUDIT_LOG_UNIFICATION.md](docs/design/B4_AUDIT_LOG_UNIFICATION.md) — canonical audit column set
- [LEDGER_SERVICE_DESIGN.md](docs/design/LEDGER_SERVICE_DESIGN.md) — multi-tenant, immutable-event design pattern referenced here
- [academy_service/routers/progress.py:43-188](swimbuddz-backend/services/academy_service/routers/progress.py:43) — existing coach review endpoint
- [academy_service/models/progress.py:175-254](swimbuddz-backend/services/academy_service/models/progress.py:175) — `MilestoneReviewEvent`
- [libs/auth/dependencies.py:180-214](swimbuddz-backend/libs/auth/dependencies.py:180) — `require_admin`, `require_service_role`
- [media_service/routers/_helpers.py:14-39](swimbuddz-backend/services/media_service/routers/_helpers.py:14) — `_maybe_presign_url`
- `memory: project_no_cross_service_fks`, `memory: feedback_no_handwritten_migrations`, `memory: feedback_never_resetsh_to_apply_migration`
