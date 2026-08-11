# SwimBuddz Pod Operations

How Club pods are constituted, named, and run. The operational model that sits underneath the [Pod Lead Guide](./POD_LEAD_GUIDE.md) (what a Pod Lead does at and around the session) and the [WhatsApp Playbook](../community/WHATSAPP_PLAYBOOK.md) (how the pod chat is run).

> **Supersedes:** [POD_MODEL_DESIGN.md](../design/POD_MODEL_DESIGN.md). That earlier design placed pods in `sessions_service` with lead/assistant **coaches**. The decisions here move pods to `members_service` and replace coaches with **Pod Leads**, since Club pods are peer-led (coaches only exist in the Academy layer).

---

## What a pod is

A **pod** is a small, persistent training sub-group inside a **Club**. Members in the same pod train together, share a chat channel, and have a stable Pod Lead. Pods are how Club members find their training crew — the SwimBuddz answer to "who am I swimming with this season?"

Each pod has a Pod Lead (required), an optional Assistant Pod Lead, and **2–5 members** (configurable per pod; can grow to 10 as we scale).

| Attribute | Value |
|-----------|-------|
| Size | 2–5 active members (configurable per pod via `min_size` / `max_size`) |
| Lead | One **Pod Lead** (required) + optional **Assistant Pod Lead** |
| Layer | Club only — pods do not exist in Community or Academy |
| Coaching | None. Pods are peer-led. Coaching lives in Academy cohorts. |
| Lifespan | 3-month review cycle (continue / rebalance / dissolve) |
| Tied to | A `Club` entity in `members_service` |

---

## Pod identity: slug + handle

Pods have two names:

| Field | Example | Generated | Purpose |
|-------|---------|-----------|---------|
| `slug` | `yaba-pod-3` | Auto: `{club.slug}-pod-{N}` | Stable, URL-safe, used in admin/internal paths and as a fallback when no handle is set. |
| `handle` | `dolphins` | Optional, set by admin or requested by Pod Lead | Public "username" — the Dolphins/Orcas/Mantas friendly name. Unique per club. Renders in the WhatsApp group name `SB Club – Dolphins` and the member-facing dashboard. |

If a pod has no handle, the dashboard falls back to displaying the slug. A pod can have a handle assigned at creation or later — once formed, the Pod Lead can request one through the SwimBuddz team.

**Suggested handle pool** (extend through the team when exhausted):
Dolphins, Orcas, Mantas, Stingrays, Marlins, Barracudas, Tarpons, Sailfish, Tunas, Swordfish, Hammerheads, Sea Turtles.

Handles are unique **per club** (Yaba Dolphins and Lekki Dolphins are both valid).

---

## Membership rules

- A member belongs to **exactly one active pod at a time** (enforced by a partial-unique DB index on `member_id WHERE left_at IS NULL`).
- Members are added by:
  - **Admin manual assignment** (always available)
  - **Member self-selection** from the public pod directory (any public pod with capacity)
  - **Member self-selection** during Club registration (same picker)
- Members move via:
  - **Member-initiated swap** (leave current → join target if capacity allows)
  - **Lead-initiated transfer** (Pod Lead moves a member from their pod to a target pod)
- When a member leaves Club mid-cycle, their slot is freed. No auto-fill — the slot is just available for self-selection or admin assignment.

---

## Visibility

Per-pod flag, settable by admins:

| Visibility | Behaviour |
|------------|-----------|
| `public` (default) | Listed in the public pod directory; members can self-select if there's capacity. |
| `private` | Hidden from the directory; admin assigns manually only. |

---

## Saturday session — anchored, with override

The Saturday session is the pod's anchor, but pods can deviate where it suits them.

### Default schedule

Each pod stores its **default session schedule** as fields on the Pod model:

| Field | Default (inherits from Club) |
|-------|------------------------------|
| `default_session_day` | `SAT` |
| `default_session_time` | `09:00` |
| `default_session_duration_minutes` | `180` (3 hours) |
| `default_pool_id` | club's default pool, or null |

When the SwimBuddz team creates a Club, they set the Club-level defaults. When a pod is created under that club, the pod inherits those defaults; the Pod Lead can override per-pod (e.g. "we're a Wednesday-morning pod").

### One-off changes

If a single week needs to move (lead unavailable, pool closed, etc.), the **Pod Lead decides** the reschedule. It's not a group vote. A one-off session is created in `sessions_service` for the new day/time — this **doesn't mutate the default**.

Why "lead decides, not group vote": the Pod Lead Guide is firm about consistency — "Show up. Every single week. You are the consistency." Once reschedules become a weekly negotiation, the consistency that makes pods work erodes.

### Cancellation

If a session can't hold and can't be rescheduled, the lead notifies the pod and the SwimBuddz team. Members get an attendance pass for that week.

### Attendance rule

**Only the official scheduled session counts toward Club attendance**, streaks, and leaderboards. Ad-hoc swims (see [Between Saturdays](#between-saturdays)) do not.

---

## Lifecycle: 3-month review cycle

Pods run on a 3-month cycle that aligns with Club membership pricing.

| Field | Behaviour |
|-------|-----------|
| `cycle_started_at` | Set at creation; reset on extend |
| `review_due_at` | `cycle_started_at + 90 days` |
| `status` | `active` until dissolved |
| `dissolved_at` | Set when admin dissolves; nullable otherwise |

**At review_due_at**, the pod surfaces in the admin queue (`GET /admin/members/pods/review-queue`). The Pod Lead or admin chooses one of:

- **Continue** — `POST /admin/members/pods/{id}/extend` resets `cycle_started_at` to now
- **Rebalance** — manually move members between pods
- **Dissolve** — `POST /admin/members/pods/{id}/dissolve` marks inactive, soft-leaves all members, archives the chat channel after a +180 day retention window

The review is a **forcing function, not an automatic dissolve.** A pod never silently disappears because an admin missed a deadline.

---

## Membership pricing (Club tier)

Club membership is paid in 3-month increments aligned to the pod review cycle. Unpaid members are not removed automatically — payment status surfaces in the admin queue during the same review window, and the Pod Lead is expected to nudge.

| Plan | Cycles | Total | Per cycle | Discount |
|------|--------|-------|-----------|----------|
| Quarterly | 1 × 3mo | **₦42,500** | ₦42,500 | — |
| Semi-annual | 2 × 3mo | **₦80,000** | ₦40,000 | ~6% |
| Annual | 4 × 3mo | **₦150,000** | ₦37,500 | ~12% |

**Implementation note:** Pricing logic and Paystack integration live in `payments_service`. The Pod model itself doesn't store payment state — it's joined at read time when admins need to see "who in this pod is paid up?" See [PRICING_STRATEGY.md](./PRICING_STRATEGY.md) for the full plan rationale and transition bridges.

---

## Pod Lead role

A Pod Lead is a Club member with an elevated role on their pod. Exactly one per pod (required). An optional Assistant Pod Lead can share the load — useful when a pod has 5 members and the lead needs cover on Saturdays they can't make.

**Selection:** Picked by the SwimBuddz team. Typically a member who has shown up consistently, knows the other members, and is comfortable holding a small group. The Pod Lead can be reassigned by an admin (e.g. via `PATCH /admin/members/pods/{id}` setting `pod_lead_id`).

**Responsibilities:** See the [Pod Lead Guide](./POD_LEAD_GUIDE.md). Short version: hold the rhythm, run the Saturday session, keep the chat alive midweek, escalate anything that isn't logistics.

**What Pod Leads don't do:**

- Coach technique (that's Academy coaches in cohorts — see the [Coach Handbook](../academy/COACH_HANDBOOK.md))
- Handle money, pricing, or scheduling questions (escalate to SwimBuddz team)
- Mediate conflicts (escalate)
- Make membership decisions (escalate)

**Recognition:** Bubbles rewards per session led, free or discounted Club membership, priority access to events and trips, direct line to the founder. See the [Pod Lead Guide](./POD_LEAD_GUIDE.md#what-you-get).

---

## Between Saturdays

The pod is a 7-day-a-week relationship, not a Saturday-only logistics channel. Two patterns make this work:

### 1. Solo → group conversion

Members who want to swim midweek post the swim **before** they go, not after:

> "Federal Palace, Tuesday 6am — anyone in?"

If someone bites, it's a group swim. If nobody does, the member swims solo and shares a recap. The pod's identity stays "we swim together" rather than slowly becoming a personal swim diary.

### 2. Photos, videos, and recaps

All swims — Saturday or ad-hoc — get posted in the pod chat. Photos, videos, lap counts, PBs. This is what keeps the pod alive between Saturdays. Encouraged, not required.

### Ad-hoc swim attendance rule

Ad-hoc swims **do not** count toward Club attendance, streaks, or leaderboards. Only the official scheduled session does. State this explicitly to new members so nobody assumes "I swam Tuesday with two pod members" replaces showing up to the pod's session.

---

## Backend model

Pods live in **`members_service`** (port 8001). `Sessions_service` reads pods over HTTP when it needs to know "which pod is this Club session for?" — there is no cross-service DB FK. Inside `members_service`, `Pod.club_id` is a real FK to `clubs.id`.

### Tables

#### `pods` (members_service)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `club_id` | uuid FK → `clubs.id`, indexed | Real FK; pods belong to one Club |
| `slug` | text, unique per club | Auto-generated `{club.slug}-pod-{N}` if `name` blank |
| `handle` | text, unique per club, nullable | The "Dolphins/Orcas" friendly username |
| `name` | text | Display name; falls back to slug if blank |
| `description` | text, nullable | |
| `pod_lead_id` | uuid, NOT NULL, indexed | Cross-domain ref → `members.id` |
| `assistant_pod_lead_id` | uuid, nullable | Cross-domain ref → `members.id` |
| `min_size` | int, NOT NULL, default 2 | |
| `max_size` | int, NOT NULL, default 5 | Max enforceable: 10 |
| `default_session_day` | enum (`MON`–`SUN`), NOT NULL | Inherits Club default at creation |
| `default_session_time` | time, NOT NULL | Inherits Club default at creation |
| `default_session_duration_minutes` | int, NOT NULL, default 180 | |
| `default_pool_id` | uuid, nullable | Cross-service ref → `pools_service.pools.id` |
| `visibility` | enum (`public`,`private`), default `public` | |
| `status` | enum (`active`,`inactive`), default `active` | |
| `cycle_started_at` | timestamptz, NOT NULL | Reviews fire 3 months after this |
| `review_due_at` | timestamptz, NOT NULL | `cycle_started_at + 90 days` |
| `dissolved_at` | timestamptz, nullable | Set when admin dissolves |
| `created_by` | uuid, NOT NULL | Admin member id |
| `created_at` | timestamptz, NOT NULL | |
| `updated_at` | timestamptz, NOT NULL | |

**Indexes:** `(club_id, status)` for the per-club active-pod query, `(visibility, status)` for the public directory, `review_due_at` for the review queue, `(club_id, slug)` unique, `(club_id, handle) WHERE handle IS NOT NULL` unique.

#### `pod_assignments` (members_service)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `pod_id` | uuid FK → `pods.id` ON DELETE CASCADE | |
| `member_id` | uuid FK → `members.id`, indexed | |
| `joined_at` | timestamptz, NOT NULL | |
| `left_at` | timestamptz, nullable | Soft-leave; rows survive for audit |
| `assigned_by` | enum (`admin`,`self`,`lead_transfer`), NOT NULL | |
| `assigned_by_id` | uuid, nullable | Admin / lead who initiated, when not `self` |

**Constraint:** `UNIQUE (member_id) WHERE left_at IS NULL` — one active pod per member.
**Index:** `(pod_id) WHERE left_at IS NULL` for capacity counts.

### API surface

#### Admin (`/api/v1/admin/members/pods/*`)

- `POST /admin/members/pods` — create
- `GET /admin/members/pods/review-queue` — pods past their review-due date
- `GET /admin/members/pods/{id}` — full detail
- `PATCH /admin/members/pods/{id}` — edit (name, handle, visibility, leads, sizes, schedule)
- `POST /admin/members/pods/{id}/dissolve` — mark inactive, soft-leave members, archive chat
- `POST /admin/members/pods/{id}/extend` — reset `cycle_started_at` to now
- `POST /admin/members/pods/{id}/members` — admin add a member
- `DELETE /admin/members/pods/{id}/members/{member_id}` — admin remove a member
- `POST /admin/members/pods/{id}/transfers?member_id=…` — Pod Lead/admin moves a member to another pod

#### Member (`/api/v1/members/pods/*`)

- `GET /members/pods/me` — my current pod
- `GET /members/pods/public?club_id=…` — public pods with capacity
- `POST /members/pods/{id}/join` — self-join a public pod with capacity
- `POST /members/pods/me/leave` — leave my current pod

### Chat integration

Each pod has a chat channel provisioned via `services/chat_sync.py` in `members_service`. This is best-effort: chat downtime never blocks pod flows.

- On `pods.create` → `POST /internal/chat/channels/ensure` with `parent_entity_type=pod`, `parent_entity_id=pod.id`, `created_by=pod_lead_id`, `retention_policy=pod`
- On `pod_assignments.create` → `POST /internal/chat/memberships/reconcile` with `derived_from=pod_assignment`, `action=add`
- On `pod_assignments.left_at` set → reconcile `action=remove`
- On `pods.dissolve` → reconcile remove for each active member; channel archive happens via the chat admin API once final messages settle (+180 day retention per chat design §9)

Chat already supports the relevant enums (`ParentEntityType.POD`, `MembershipDerivation.POD_ASSIGNMENT`, `RetentionPolicy.POD`) — no chat-side change needed.

### Sessions service interaction (read-time HTTP integration)

`Sessions_service` knows about pods only over HTTP. Two dedicated internal endpoints back this:

| Endpoint | When sessions calls it |
|---|---|
| `GET /internal/members/pods/{pod_id}` | Creating a Club session for a specific pod — needs schedule + active member roster |
| `GET /internal/members/pods?club_id=X` | Batch scheduling — "create this Saturday's sessions for every active pod in club X" |

Both return `PodInternalSummary`/`PodInternalDetail` shapes (id, club_id, lead, schedule fields, active member count, optionally the active member ids). Service-role JWT auth, never exposed via the gateway. See [API_ENDPOINTS.md §17 — Internal Endpoints](../../swimbuddz-backend/docs/API_ENDPOINTS.md#internal-endpoints-service-to-service-only-1).

In `libs/common/service_client.py`:

```python
from libs.common.service_client import get_pod_by_id, list_pods

pod = await get_pod_by_id(pod_id, calling_service="sessions")
pods = await list_pods(calling_service="sessions", club_id=club_id)
```

Sessions service may store an optional `pod_id` UUID column on `sessions` for "this is the [pod] Saturday session" filtering — that's a sessions-service-side concern, added when the first session-creation flow needs it.

### Migration & checklist

Follow the standard backend checklist in [CLAUDE.md](../../CLAUDE.md#3-making-changes):

- [x] Add models to `services/members_service/models/pod.py`
- [x] Update `services/members_service/alembic/env.py` (import + `SERVICE_TABLES`)
- [x] Generate migration: `./scripts/db/migrate.sh members_service "add pods and pod assignments"`
- [x] Add routes for: create pod, list pods, add/remove members, set lead, dissolve pod
- [x] Drop pod tables from `sessions_service` via separate migration
- [ ] Update `API_ENDPOINTS.md`
- [ ] Regenerate frontend types: `cd swimbuddz-frontend && npm run generate:types`

---

## Related documentation

- [Pod Lead Guide](./POD_LEAD_GUIDE.md) — what a Pod Lead actually does
- [Pod Roster Design](./POD_ROSTER_DESIGN.md) — roster fields, privacy, history, capacity, and quarterly review workflow
- [WhatsApp Playbook](../community/WHATSAPP_PLAYBOOK.md) — pod chat structure, descriptions, kickoff message
- [Pricing Strategy](./PRICING_STRATEGY.md) — Club membership fees, transition bridges, Pod Lead perks
- [Tier Boundary Policy](../community/TIER_BOUNDARY_POLICY.md) — what happens when non-Club members show up to a pod's session
- [POD_MODEL_DESIGN.md](../design/POD_MODEL_DESIGN.md) — earlier design (superseded by this doc)
- [Service Registry](../reference/SERVICE_REGISTRY.md) — Members service details

---

*Last updated: May 2026*
