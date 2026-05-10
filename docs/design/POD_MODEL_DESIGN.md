# Pod Model Design — Club Sub-Groups

> **⚠️ SUPERSEDED** — see [POD_OPERATIONS.md](../club/POD_OPERATIONS.md) (May 2026).
>
> The decisions in this doc placed pods in `sessions_service` with `lead_coach_id` + `assistant_coach_id`. Subsequent product decisions moved pods to `members_service` and replaced coaches with `pod_lead_id` + `assistant_pod_lead_id` (Club pods are peer-led; coaches only exist in the Academy layer). The schedule-anchoring fields, slug+handle naming, and the `lead_transfer` enum value also differ. Treat this doc as historical context for the prior design only.
>
> **Status:** Design accepted (decisions captured 2026-05-07) — **superseded 2026-05-10**
> **Owner:** Daniel (SwimBuddz)
> **Related:** [POD_OPERATIONS.md](../club/POD_OPERATIONS.md), [CHAT_SERVICE_DESIGN.md](./CHAT_SERVICE_DESIGN.md) §3, §10.2
> **Supersedes:** the earlier `POD_MODEL_PROPOSAL.md` (open questions)

---

## What a pod is

A **pod** is a small, persistent training sub-group inside a **Club**. Members in the same pod train together, share a chat channel, and have a stable lead coach. Pods are how Club members find their training "team" — the SwimBuddz answer to "who am I swimming with this season?"

Each pod has a single lead coach, optional assistant coach, and 2–5 members.

## Decisions

### 1. Size

- **Minimum:** 2 members
- **Maximum:** 5 members
- A pod with 0 or 1 active member is in a stalled state and surfaces in the admin queue (it doesn't auto-dissolve — the coach may have someone joining next week).

### 2. Coach assignment

- **Exactly one lead coach** (required)
- **Optional one assistant coach**
- A guest coach for an individual session is just a different `SessionCoach` for that session — no model change. The pod's lead/assistant only describes the steady state.

### 3. Lifecycle

- Pods are **manually created by admins** (no auto-formation in v1).
- Pod sessions and rosters live alongside the Club's 3-month training cycle.
- **Every 3 months a pod becomes "review-due"** — surfaced to the lead coach in the admin/coach UI. The coach (or admin) chooses one of:
  - Continue (extend by another 3 months)
  - Rebalance (manually move members between pods)
  - Dissolve (free all members; pod marked inactive)
- The review is a forcing function, NOT an automatic dissolve. We never silently break a pod.
- Dissolve is irreversible from a chat-history standpoint (channel archives per design §9: pod chat retains for +180 days post-dissolution).

### 4. Membership rules

- A member belongs to **exactly one active pod at a time**.
- Members are added by:
  - Admin manual assignment (always available)
  - Member self-selection from the dashboard (any public pod with capacity)
  - Member self-selection during Club registration (same picker)
- Members move via:
  - Member-initiated swap (leave current → join target if capacity allows)
  - Coach-initiated transfer (coach moves member from their pod to a target pod)
- When a member leaves Club mid-cycle, their slot is freed. No auto-fill — the slot is just available for self-selection or admin assignment.

### 5. Identity & visibility

- **Name:** required. If the admin doesn't provide one at creation, an auto-name is generated (e.g. `{club.slug}-pod-{N}`).
- **Visibility:**
  - `public` (default) — listed in the public pod directory; members can self-select.
  - `private` — hidden from the directory; admin / coach assigns manually only.
- Visibility is a per-pod flag, settable by admins.

## Data model

Two tables, both owned by `sessions_service`. Cross-service refs (`club_id`, member ids, coach ids) use UUIDs without enforced FKs — same convention as elsewhere in the codebase.

### `pods`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `club_id` | uuid, indexed | Cross-service ref → `clubs.id` |
| `name` | text, NOT NULL | Auto-name fallback if blank at creation |
| `slug` | text, unique per club | Generated from name |
| `description` | text, nullable | |
| `lead_coach_id` | uuid, NOT NULL | Cross-service ref → coach member id |
| `assistant_coach_id` | uuid, nullable | Cross-service ref → coach member id |
| `min_size` | int, NOT NULL, default 2 | |
| `max_size` | int, NOT NULL, default 5 | |
| `visibility` | enum (`public`,`private`), default `public` | |
| `status` | enum (`active`,`inactive`), default `active` | |
| `cycle_started_at` | timestamptz, NOT NULL | Reviews fire 3 months after this |
| `review_due_at` | timestamptz, NOT NULL | `cycle_started_at + 3 months` |
| `dissolved_at` | timestamptz, nullable | Set when admin dissolves |
| `created_by` | uuid, NOT NULL | Admin member id |
| `created_at` | timestamptz, NOT NULL | |
| `updated_at` | timestamptz, NOT NULL | |

Indexes: `(club_id, status)`, `(visibility, status)` for the directory query, `review_due_at` for the review-queue task.

### `pod_assignments`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `pod_id` | uuid, FK → pods.id, ON DELETE CASCADE | |
| `member_id` | uuid, NOT NULL | Cross-service ref → member id |
| `joined_at` | timestamptz, NOT NULL | |
| `left_at` | timestamptz, nullable | Soft-leave; rows survive for audit |
| `assigned_by` | enum (`admin`,`self`,`coach_transfer`), NOT NULL | |
| `assigned_by_id` | uuid, nullable | Admin / coach who initiated, when not `self` |

Constraints: `UNIQUE (member_id) WHERE left_at IS NULL` enforces "one active pod per member at a time."

Indexes: `(pod_id) WHERE left_at IS NULL` for capacity counts.

## API surface

### Admin / coach (`/admin/sessions/pods/*`)

- `POST /admin/sessions/pods` — create
- `PATCH /admin/sessions/pods/{id}` — edit (name, visibility, coaches, sizes)
- `POST /admin/sessions/pods/{id}/dissolve` — mark inactive, archive chat
- `POST /admin/sessions/pods/{id}/extend` — bump `cycle_started_at` to now (resets the review window)
- `POST /admin/sessions/pods/{id}/members` — admin add
- `DELETE /admin/sessions/pods/{id}/members/{member_id}` — admin remove
- `POST /admin/sessions/pods/{id}/transfers` — coach moves member to another pod
- `GET /admin/sessions/pods/review-queue` — pods with `review_due_at <= now()`

### Member (`/sessions/pods/*`)

- `GET /sessions/pods/me` — my current pod
- `GET /sessions/pods/public?club_id=…` — public pods with capacity, for the dashboard / registration picker
- `POST /sessions/pods/{id}/join` — self-join a public pod with capacity
- `POST /sessions/pods/me/leave` — leave my current pod

### Internal (`/internal/sessions/pods/*`)

- None needed initially. Chat-sync calls go *out* from sessions_service to chat, not in.

## Chat integration

This is mechanical once the model exists — copy [`services/academy_service/services/chat_sync.py`](../../swimbuddz-backend/services/academy_service/services/chat_sync.py):

- On `pods.create` → `POST /internal/chat/channels/ensure` with `parent_entity_type=pod`, `parent_entity_id=pod.id`, `created_by=lead_coach_id`, `retention_policy=pod`.
- On `pod_assignments.create` → `POST /internal/chat/memberships/reconcile` with `derived_from=pod_assignment`, `action=add`.
- On `pod_assignments.left_at` set → reconcile `action=remove`.
- On `pods.dissolve` → archive channel via admin API (or extend chat to consume a "parent dissolved" event).

Chat already supports the enums (`ParentEntityType.POD`, `MembershipDerivation.POD_ASSIGNMENT`, `RetentionPolicy.POD`) — no chat-side change needed.

## Open implementation notes (not blocking)

These I had to interpret rather than ask for; flag if any disagree with what you had in mind:

- **"Reviewed every 3 months"** = surfaces in a coach/admin queue, not auto-dissolves. A real human decides. Avoids the bad case of a pod silently disappearing because an admin missed a deadline.
- **"Public by default"** = listed in a directory, members can self-select if capacity. Members never auto-join — they pick deliberately.
- **`assigned_by`** tracking lets us answer "did this member pick the pod, or did an admin?" later — useful for understanding self-selection vs assignment behaviours.
- **Dissolve archives chat** rather than hard-deleting; design §9 already specifies "+180 days post-dissolution" retention.
- **Coach roles in chat:** lead and assistant become channel `admin` and `moderator` respectively — Phase 1 chat already supports both roles.

---

*Last updated: 2026-05-07*
