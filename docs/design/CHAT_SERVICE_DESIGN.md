# Chat Service Architecture & Data Model Design

> **Status:** Draft — Awaiting Review
> **Service Port:** 8016 *(reassigned from initial 8011 on 2026-04-19 — 8011 is occupied by the existing `ai_service`, which was undocumented in the registry at the time of the first draft)*
> **Service Name:** `chat_service`
> **Date:** 2026-04-19
> **Author:** Daniel + AI collaborator

---

## Terminology

| Concept | Chosen term | Alternatives considered | Decision date |
|---|---|---|---|
| Club sub-group of ~5 members | **Pod** | Squad, Lane, Crew, Team, Wave, School | 2026-04-19 |

Rationale: distinctive, swimming-adjacent (dolphin pods), on-brand for "SwimBuddz" playful tone, works across ages 6–60, no collision with Academy or Club layer names.

---

## 1. Overview

The Chat Service provides **real-time, persistent, role-aware messaging** across every SwimBuddz surface that needs group or direct communication. It replaces external platforms (WhatsApp Communities, Telegram, etc.) with an in-app experience tied to SwimBuddz identity, roles, enrollment, and safeguarding policy.

### Why a dedicated service

- **Real-time infra profile** (persistent connections, high write volume, fan-out) is fundamentally different from `communications_service`'s batch-oriented announcement/email workload. Mixing them would force one of them into the wrong shape.
- **Safeguarding enforcement** (minors, coach-student boundaries, audit) is a first-class concern for chat but not for announcements. Better modelled in its own domain.
- **Service isolation** per CLAUDE.md: chat membership derived from `academy_service`, `sessions_service`, `events_service`, `transport_service` — but owned by none of them.

### Design principles

- **Build, don't buy.** Supabase Realtime + FastAPI + Postgres. No Stream/Sendbird/Twilio. Rationale: safeguarding requirements are custom anyway; cost scales with infra not per-MAU; we own the data (critical with minors).
- **Frontend-agnostic.** REST for history/admin, WebSocket (Supabase Realtime) for live delivery, typed OpenAPI contracts. Web now, PWA next, React Native later — same backend.
- **Membership is derived, not managed.** If you're enrolled in Cohort 05, you're in the Cohort 05 channel. If enrollment ends, channel access ends. Manual membership management doesn't scale to 6,000 members.
- **Safeguarding by construction.** Rules enforced at the API boundary, not only in UI. Impossible-to-bypass by design.
- **Offline-tolerant.** Lagos 3G. Queue locally, sync on reconnect, show pending/sent/delivered states.
- **Audit everything.** Every message, edit, delete, join, leave, report — permanently logged. Compliance + dispute resolution + safeguarding.
- **Phased rollout, complete architecture.** Data model and service boundaries are designed up front; features ship in phases to real users.

---

## 2. Scope — where chat touches SwimBuddz

Every messaging surface across SwimBuddz mapped to the service that owns the parent entity:

| Chat surface | Participants | Parent entity | Parent service |
|---|---|---|---|
| **Cohort channel** | Enrolled students + coaches | `cohort` | `academy_service` |
| **Pod channel** (Club) | Pod members + coaches | `pod` / training group | `sessions_service` |
| **Event channel** | Event RSVPs | `event` | `events_service` |
| **Trip channel** | Driver + passengers | `transport_trip` | `transport_service` |
| **Coach ↔ parent DM** | Coach + parent of minor student | `enrollment` (minor) | `academy_service` |
| **Location channel** | Members in a city/pool | `location` | `members_service` |
| **Alumni channel** | Past academy students | role: `alumni` | `academy_service` |
| **Support DM** | Member ↔ support admin | — | `chat_service` (internal) |
| **Announcement broadcast** | Role-scoped, admin-posts-only | — | `communications_service` (existing) |

### Out of scope

- **Announcements** — stay in `communications_service`. Broadcast is a different problem.
- **Email / SMS delivery** — handled by existing notification dispatcher.
- **Video/voice calling** — not in this design. Revisit if required.
- **External federation** (Matrix, XMPP) — no.
- **Public / unauthenticated chat** — all chat requires SwimBuddz auth.

---

## 3. Channel types (three primitives)

Three channel types cover every surface above:

| Type | Description | Permissions | Examples |
|---|---|---|---|
| **Group** | Many-to-many, membership derived from a parent entity | Any member can post (subject to role); admins moderate | Cohort, pod, event, trip, location |
| **Broadcast** | One-way: admins post, members read (optional threaded replies) | Post: admin roles only. React/reply: configurable | Role-wide announcements from `communications_service` mirrored here; alumni digests |
| **Direct** | 1:1 or small private group (≤8) | Participants only; every message audited | Coach ↔ parent, support DM |

Design rule: a channel's type is immutable after creation. Changing type = create new channel, migrate.

---

## 4. Data model

### 4.1 Core tables

```
chat_channels
  id (uuid, pk)
  type (enum: group | broadcast | direct)
  parent_entity_type (enum: cohort | pod | event | trip | location | role | none)
  parent_entity_id (uuid, nullable)
  name (text)                         -- derived from parent, editable for admin-created channels
  description (text, nullable)
  created_by (uuid → members)
  created_at (timestamptz)
  archived_at (timestamptz, nullable) -- soft archive; messages retained per policy
  retention_policy (enum: see §9)
  safeguarding_flags (jsonb)          -- e.g. { "has_minors": true, "coach_present": true }
  metadata (jsonb)                    -- extensible without migration

  INDEX (parent_entity_type, parent_entity_id)
  INDEX (archived_at) WHERE archived_at IS NULL
```

```
chat_channel_members
  channel_id (uuid → chat_channels)
  member_id (uuid → members)
  role (enum: member | moderator | admin | observer)
  joined_at (timestamptz)
  left_at (timestamptz, nullable)
  muted_until (timestamptz, nullable)
  last_read_message_id (uuid, nullable)
  derived_from (enum: enrollment | rsvp | pod_assignment | trip_booking | role | manual)
  derivation_ref (uuid, nullable)     -- points to enrollment/rsvp/etc. for reconciliation

  PRIMARY KEY (channel_id, member_id)
  INDEX (member_id) WHERE left_at IS NULL
```

```
chat_messages
  id (uuid, pk)
  channel_id (uuid → chat_channels)
  sender_id (uuid → members)
  body (text)                         -- markdown subset; see §8
  attachments (jsonb)                 -- [{ type, storage_key, mime, size, thumbnail }]
  reply_to_id (uuid → chat_messages, nullable)
  created_at (timestamptz)
  edited_at (timestamptz, nullable)
  deleted_at (timestamptz, nullable)  -- soft delete, body becomes [deleted]
  deleted_by (uuid → members, nullable)
  safeguarding_review_state (enum: none | flagged | reviewed_ok | reviewed_actioned)
  metadata (jsonb)

  INDEX (channel_id, created_at DESC)
  INDEX (sender_id, created_at DESC)
  INDEX (safeguarding_review_state) WHERE safeguarding_review_state = 'flagged'
```

```
chat_message_reactions
  message_id (uuid → chat_messages)
  member_id (uuid → members)
  emoji (text)                        -- restricted set, see §8
  created_at (timestamptz)

  PRIMARY KEY (message_id, member_id, emoji)
```

```
chat_message_reads
  message_id (uuid → chat_messages)
  member_id (uuid → members)
  read_at (timestamptz)

  PRIMARY KEY (message_id, member_id)
```

> Alternative for scale: track only `last_read_message_id` on `chat_channel_members` and derive read status. Use per-message reads only if explicit delivery/read receipts are required UI. **Decision: start with `last_read_message_id` only; add per-message reads if needed later.**

```
chat_message_reports
  id (uuid, pk)
  message_id (uuid → chat_messages)
  reporter_id (uuid → members)
  reason (enum: safeguarding | harassment | spam | other)
  note (text, nullable)
  status (enum: open | under_review | resolved | dismissed)
  assigned_to (uuid → members, nullable)   -- safeguarding_admin role
  resolved_at (timestamptz, nullable)
  resolution_note (text, nullable)
  created_at (timestamptz)

  INDEX (status, reason, created_at)
```

```
chat_audit_log
  id (uuid, pk)
  actor_id (uuid → members, nullable)  -- null for system
  action (enum: message_sent | message_edited | message_deleted | channel_joined
               | channel_left | member_added | member_removed | role_changed
               | report_filed | report_resolved | safeguarding_action)
  channel_id (uuid, nullable)
  message_id (uuid, nullable)
  subject_member_id (uuid, nullable)
  payload (jsonb)
  created_at (timestamptz)

  INDEX (channel_id, created_at DESC)
  INDEX (actor_id, created_at DESC)
  INDEX (subject_member_id, created_at DESC)
```

### 4.2 Derived-membership reconciliation

Channel membership is derived from parent entities (enrollments, RSVPs, etc.). Reconciliation rules:

- **Event-driven (primary):** `academy_service` emits `enrollment.created` / `.cancelled` → `chat_service` adds/removes member from cohort channel. Same pattern for pods, RSVPs, trips.
- **Periodic reconciliation (safety net):** nightly job walks active channels, compares derived membership to actual, corrects drift. Logs discrepancies.
- **Service isolation preserved:** `chat_service` consumes events via internal HTTP (or message bus later); never reads other services' tables directly.

---

## 5. Permissions & roles

### 5.1 Chat-scoped roles

Per channel, a member has one of:

| Role | Capabilities |
|---|---|
| `observer` | Read only. No post, no react. Used for muted states or restricted viewing. |
| `member` | Read, post, react, reply, edit/delete own messages, report, leave. |
| `moderator` | Member + delete others' messages, remove members, pin messages. |
| `admin` | Moderator + edit channel settings, add members (where manual allowed), archive. |

### 5.2 System-wide roles (from `members_service`)

| System role | Default chat behaviour |
|---|---|
| `member` | Member in derived channels |
| `coach` | Admin in channels where they coach (cohort, pod); member in others |
| `academy_admin` | Admin in all academy channels |
| `club_admin` | Admin in all club channels |
| `community_admin` | Admin in all community/location channels |
| `safeguarding_admin` | **New role.** Read-only observer in every channel (including DMs involving minors); full access to reports queue and audit log. See §6. |
| `superadmin` | All channels, all permissions |

### 5.3 Enforcement

- Permissions checked at API boundary on every write. No UI-only gating.
- Supabase RLS policies as defence in depth on direct reads.
- Role changes audit-logged.

---

## 6. Safeguarding (non-negotiable)

SwimBuddz serves ages 6+. These rules are enforced **at the API level**, never only in UI.

### 6.1 Hard rules

1. **No 1:1 coach ↔ minor DMs.** Any direct channel where one participant is a coach and another is a minor (< 18) must include at least one parent/guardian account. Creation endpoint rejects otherwise.
2. **Parent-linked accounts required for minors.** `members_service` already models guardians; chat inherits. A minor cannot join chat without a linked guardian account.
3. **Safeguarding admin observer presence.** Every channel containing a minor has a system-level `safeguarding_admin` observer (not visible in participant list by default; disclosed in privacy policy).
4. **Coaches gated by conduct acceptance.** Coaches cannot post until they have accepted the current code of conduct (version-tracked in `members_service`).
5. **Message retention for minors is restricted.** Coaches cannot hard-delete messages in channels containing minors. Soft-delete only; safeguarding admin can review. Hard-delete requires a safeguarding admin action and is logged.
6. **Image attachments in minor channels require pre-scan.** AWS Rekognition flags before delivery. **Swim-context caveat:** SwimBuddz's normal content includes children in swimwear at pools, which generic moderators will false-positive on aggressively. Never auto-delete flagged images — always quarantine to a manual-review queue with an admin override ("this is a swim lesson photo, approve"). Tunable confidence threshold required, not binary accept/reject.
7. **Reports involving minors route to a dedicated queue** with stricter SLA and cannot be self-assigned by anyone implicated.

### 6.2 Operational ownership

- A **`safeguarding_admin` role** exists in the system from day one.
- Initially held by Daniel (SwimBuddz owner).
- Reports route to whoever holds this role, regardless of who holds it.
- At scale, becomes a part-time then full-time role; handover is a role reassignment, not a code change.
- Out-of-hours escalation path documented separately (runbook, not code).

### 6.3 Content moderation providers

Decided stack for content moderation:

| Content type | Provider | Rationale |
|---|---|---|
| **Text** | **OpenAI Moderation API** | Free, fast, best accuracy for harassment/safeguarding classes. Sync call before persist. |
| **Images** | **AWS Rekognition DetectModerationLabels** | ~$1 per 1,000 images, mature, well-documented. Async — image uploaded to quarantine bucket, Rekognition called, result stored before delivery. |
| **Video** | **AWS Rekognition** (video moderation API) | Same provider for consistency. Higher cost — capped to 30s clips (§8.2). |

**Swim-context tuning is mandatory** (see rule 6 above): all image moderation results are confidence scores, not verdicts. Thresholds configurable by `safeguarding_admin`; borderline cases always go to manual review queue.

### 6.4 What safeguarding is NOT

- Not a substitute for real-world policies. This is technical enforcement of policies that must exist in writing elsewhere.
- Not legal advice. SwimBuddz owners remain ultimately accountable.

---

## 7. Real-time transport & delivery semantics

### 7.1 Transport

- **Supabase Realtime** for live message delivery via Postgres change-data-capture on `chat_messages`.
- Channel subscriptions filtered by `channel_id`; permissions enforced via RLS so unauthorised subscribers get nothing.
- Fallback: clients poll `GET /chat/channels/{id}/messages?since=<id>` if WebSocket unavailable (Lagos 3G reliability).

### 7.2 Message states (client-visible)

| State | Meaning |
|---|---|
| `pending` | Queued locally, not yet acknowledged by server |
| `sent` | Server has persisted the message |
| `delivered` | Recipient's client has fetched it (best-effort; inferred from Realtime ack or read API hit) |
| `read` | Recipient has opened the channel past this message |
| `failed` | Send failed after retry budget; user can retry manually |

### 7.3 Offline semantics

- Client maintains an outbox (IndexedDB on web, SQLite on mobile).
- Messages composed offline get a client-generated UUID; server accepts the UUID (idempotent) to avoid duplicates on retry.
- On reconnect, outbox drains in order; UI shows per-message state.
- Server enforces a max-age on pending messages (e.g. 24h) to prevent stale sends.

### 7.4 Push notifications

- Chat emits notification events to `communications_service`'s existing dispatcher (which owns FCM/APNs credentials and `NotificationPreferences`).
- Chat does NOT implement its own push pipeline — reuses existing infra.
- Notification triggers: new message in a channel I'm in, @mention, reply to my message, direct message, report resolved.
- Per-channel mute respected via `chat_channel_members.muted_until`.
- Global preferences respected via `NotificationPreferences` in `communications_service`.

---

## 8. Message content

### 8.1 Body

- Markdown subset: bold, italic, strikethrough, inline code, code block, blockquote, ordered/unordered list, link.
- **Not** supported: raw HTML, embedded media by URL (render as link), tables (not needed for chat), arbitrary attributes.
- Max length: 4,000 characters. Longer content is a document, not a chat message.
- Mentions: `@member_name` — server-validated; resolves to `member_id` on send.

### 8.2 Attachments

- **Images:** JPEG, PNG, WebP. Max 10 MB. Server-side compression + thumbnail generation. Storage: Supabase Storage bucket `chat-attachments`, signed URLs.
- **Video:** MP4, max 30 seconds, max 25 MB (Lagos bandwidth). Transcoded for mobile.
- **Documents:** PDF only. Max 10 MB. Not scanned for content in MVP (risk-accepted for adult channels; not permitted in minor channels).
- **No** arbitrary file uploads (.zip, .exe, etc.).

### 8.3 Reactions

Restricted emoji set to reduce moderation surface. Start with: 👍 ❤️ 😂 😮 😢 🎉 ✅. Configurable by admin.

---

## 9. Retention & lifecycle

| Channel type | Active retention | Post-archive retention | Hard-delete trigger |
|---|---|---|---|
| Cohort | Lifetime of cohort | +365 days after cohort end | Safeguarding review complete + retention expired |
| Pod | While pod active | +180 days after pod dissolved | As above |
| Event | Until event end + 30 days | +90 days | As above |
| Trip | Until trip end + 7 days | +30 days | As above |
| Location | Indefinite while active | +180 days after deactivation | As above |
| Alumni | Indefinite | — | Member deletion request |
| Coach ↔ parent DM | While enrollment active | +1,825 days (5 years) | Legal retention limits (minors) |
| Support DM | Indefinite | — | Member deletion request |

**Rule:** messages in channels containing minors are never hard-deleted by anyone except a safeguarding admin, and only after retention expires.

Archival is soft: `archived_at` is set, channel becomes read-only, messages remain queryable by admins.

---

## 10. Integration with existing services

### 10.1 `academy_service` (enrollments → cohort channels)

- On `enrollment.confirmed`: `chat_service` creates channel membership in the cohort channel.
- On `enrollment.cancelled` / `.withdrawn`: membership soft-removed (`left_at` set).
- On `cohort.created`: cohort channel auto-created with coach as admin.
- On `cohort.completed`: channel archived; alumni membership offered to students.

### 10.2 `sessions_service` (pods → pod channels)

- On `pod_assignment.created` / `.removed`: membership added/removed.
- Per-session channels NOT created (too ephemeral); use pod channel + pinned session info.

### 10.3 `events_service` (RSVPs → event channels)

- On `rsvp.confirmed`: add to event channel.
- Channel auto-archives 30 days after event end.

### 10.4 `transport_service` (trips → trip channels)

- On `trip_booking.confirmed`: passenger added to trip channel with driver.
- On trip completion + 7 days: archive.
- Already a partial use case you have today — this formalises it.

### 10.5 `members_service` (roles, guardians, locations)

- `chat_service` queries members for: role, guardian links (minors), location.
- Membership derivation for location channels driven by `members.location_id`.

### 10.6 `communications_service` (notifications, existing messaging)

- **Delegation:** chat emits notification events; `communications_service` dispatches via its existing pipeline (FCM, APNs, email digests, `NotificationPreferences`).
- **`MessageLog` migration (decided):** `MessageLog` in `communications_service` is the existing coach → cohort broadcast mechanism. Decision: **deprecate after Phase 1 ships and stabilises.** Migration plan:
  1. Phase 1 ships cohort chat with a "coach announcement" message type (pinned, higher-visibility styling).
  2. Phase 1 stabilisation period (≥4 weeks, all Academy cohorts using chat successfully).
  3. **Read-path migration** (Phase 2): existing `MessageLog` entries mirrored into `chat_messages` with `type=coach_announcement` and backdated `created_at`. Members see unified history in chat.
  4. **Write-path cutover** (Phase 2): coach-announcement UI writes to `chat_service` only. `MessageLog` write endpoints removed from `communications_service`.
  5. **Deprecation** (Phase 2 end): `MessageLog` table retained read-only for ~90 days for audit; then archived/dropped via migration.
  6. Audit log entries in `chat_audit_log` record the migration origin for forensic traceability.

### 10.7 `payments_service`

- No direct integration. Chat access is never gated on payment directly; it's gated on enrollment/membership which is gated on payment upstream.

### 10.8 `gateway_service`

- Add routing: `/chat/*` → `chat_service:8016`.
- Gateway handles auth as per existing pattern (Supabase JWT validation in `libs/auth`).

---

## 11. API surface (illustrative, not exhaustive)

Grouped by audience:

### 11.1 Member endpoints (`/chat/...`)

```
GET    /chat/channels                           -- my channels
GET    /chat/channels/{id}                      -- channel detail
GET    /chat/channels/{id}/messages             -- paginated, cursor-based
POST   /chat/channels/{id}/messages             -- send (idempotent via client UUID)
PATCH  /chat/messages/{id}                      -- edit own
DELETE /chat/messages/{id}                      -- soft delete own
POST   /chat/messages/{id}/reactions            -- add reaction
DELETE /chat/messages/{id}/reactions/{emoji}    -- remove own reaction
POST   /chat/channels/{id}/read                 -- mark-read up to message_id
POST   /chat/channels/{id}/mute                 -- mute until timestamp
POST   /chat/messages/{id}/reports              -- report message
POST   /chat/channels/{id}/leave                -- leave (if manual membership allowed)
```

### 11.2 Admin / moderator endpoints (`/admin/chat/...`)

```
POST   /admin/chat/channels                     -- create ad-hoc channel
PATCH  /admin/chat/channels/{id}                -- edit settings
POST   /admin/chat/channels/{id}/archive
POST   /admin/chat/channels/{id}/members        -- manual add (where allowed)
DELETE /admin/chat/channels/{id}/members/{mid}  -- remove
PATCH  /admin/chat/channels/{id}/members/{mid}  -- change role
DELETE /admin/chat/messages/{id}                -- hard delete (audited)
POST   /admin/chat/messages/{id}/pin
GET    /admin/chat/reports                      -- moderator queue
PATCH  /admin/chat/reports/{id}                 -- resolve / dismiss
GET    /admin/chat/audit                        -- audit log query
```

### 11.3 Internal service-to-service (`/internal/chat/...`)

```
POST   /internal/chat/memberships/reconcile     -- called by academy/sessions/etc on parent events
POST   /internal/chat/channels/ensure           -- idempotent create for a parent entity
```

Internal endpoints require a service-to-service token (existing pattern in `libs/auth`).

### 11.4 Realtime (Supabase)

Clients subscribe to:

- `channel:{id}` — messages, edits, deletes
- `user:{id}` — cross-channel events (new channel, mentions, role changes)

RLS enforces that subscriptions only return rows the user is allowed to see.

---

## 12. Frontend & mobile

### 12.1 Web (Next.js)

- Routes:
  - `/account/chat` — channel list + active channel
  - `/account/chat/[channel_id]` — deep link to a channel
  - `/admin/chat/reports` — moderator queue
  - `/admin/chat/audit` — audit log viewer
- Components reusable from existing Mantine-based patterns (see `swimbuddz-frontend/CONVENTIONS.md`).
- Client-side outbox in IndexedDB (e.g. `idb` library).
- Service worker for background sync of outbox on reconnect (PWA-ready).

### 12.2 PWA

- Manifest + service worker added to existing Next.js app.
- Push notifications via Web Push API (Android solid; iOS 16.4+ acceptable).
- Install prompt on `/account/chat` after first successful send.

### 12.3 React Native (later)

- Shared: generated API client, types, business logic (can extract to `swimbuddz-shared` package).
- Different: UI components (RN primitives), storage layer (SQLite via `expo-sqlite`), push handling (Expo Notifications).
- Don't build until there's a concrete trigger. Any one of:
  - **1,000+ MAU** — push notification reliability compounds at this scale
  - **Launch in a 2nd city or country** (not 2nd pool — Festac/Rowe Park/Unilag are all Lagos and count as one location for this purpose)
  - **iOS users exceed ~20%** — iOS PWA gaps (push, install UX) start hurting
  - **App Store presence becomes a marketing/partnership need**

### 12.4 Accessibility & internationalisation

- Screen reader labels on message state indicators.
- Mentions keyboard-navigable.
- Language: English only in phase 1; structure allows later additions.

---

## 13. Moderation & admin tooling

Built in from the start, not bolted on later:

- **Reports queue** — filtered by status, reason, urgency. Assigned via role.
- **Channel browser** — admin view of all channels, filter by type/parent/has-minors.
- **Member chat profile** — for a member, show channels, recent messages, reports filed, reports against them.
- **Audit log viewer** — filterable by actor, channel, action, date.
- **Bulk actions** — archive channel, remove member across channels, apply retention.
- **Automated flags** — message rate thresholds, repeated reports against one member, keyword filters (configurable by admin).

---

## 14. Phased rollout

Per principle: **complete architecture, phased releases to users.**

### Phase 0 — Design & scaffolding (current)
- This doc reviewed and accepted
- Data model migrations drafted
- Service scaffold (`services/chat_service/`), port 8016, gateway routing
- Event contracts with academy, sessions, events, transport agreed
- **`safeguarding_admin` recognised as a role string in `members_service`** (roles are stored as a Postgres string array, no schema change needed — just documentation + admin UI inclusion)
- **`GuardianLink` model added to `members_service`** (net-new; not previously modelled). Minimal scope for Phase 0: model + admin endpoints to create/verify/list. Self-service guardian claim flow is Phase 1.
- **Coach safeguarding agreement** added as a new `AgreementVersion` seed — reuses existing `CoachAgreement` / `AgreementVersion` / `HandbookVersion` infrastructure in `members_service` (already built for general coach agreements)
- Code of conduct v1 text drafted (outside this doc — a policy artefact, not code)
- AWS Rekognition + OpenAI Moderation provider accounts set up with quarantine bucket

> **Deferred from Phase 0 (revised 2026-04-19):** Shared frontend package extraction (`swimbuddz-shared`). Frontend already uses `openapi-typescript` to auto-generate types from the OpenAPI spec into `src/lib/api-types.ts`, with a clean `src/lib/api.ts` client layer. Extraction is trivial when RN consumers arrive (auto-gen output path change + one import refactor). YAGNI — no consumer today. See §16 future-work triggers.

### Phase 1 — Core + Academy
- `group` and `broadcast` channel types live
- Cohort channels auto-provisioned on enrollment
- Mentions, reactions, replies, edits, soft-delete
- Web UI at `/account/chat`
- Basic moderation (report → queue, admin delete)
- Safeguarding rules enforced
- Push notifications via `communications_service`
- **Release:** one internal cohort as beta

### Phase 2 — Safeguarding + Academy rollout + MessageLog deprecation
- Image pre-scan for minor channels (with swim-context manual review queue)
- Full audit log viewer
- Retention automation
- Coach ↔ parent DMs
- Per-channel mute / preferences
- **`MessageLog` → `chat_messages` migration** (see §10.6): read-path mirror → write-path cutover → read-only retention → archive
- **Release:** all active academy cohorts; `communications_service` coach-broadcast UI routes to `chat_service`

### Phase 3 — Club + Events + Transport
- Pod channels (`sessions_service` integration)
- Event channels (`events_service` integration)
- Trip channels (`transport_service` integration)
- **Release:** all club members + event attendees + ride-share users

### Phase 4 — Community + Alumni
- Location channels
- Alumni channel
- Search across channels
- Pinned messages, bookmarks
- **Release:** all members; formal WhatsApp deprecation announced

### Phase 5 — Mobile & scale
- PWA hardening (install prompt, offline-first UI)
- React Native app (trigger: 1k+ MAU or 2nd location)
- Analytics dashboard (usage, moderation rates, response times)
- Performance tuning (message pagination, Realtime scaling)

---

## 15. Anti-patterns (do not do)

- ❌ **Manual channel membership** where derived membership would work. Creates drift, doesn't scale.
- ❌ **Skipping safeguarding checks in "internal" channels.** Every channel that could contain a minor is a safeguarding channel.
- ❌ **Reading other services' tables directly** for membership. Use events or `/internal/` APIs.
- ❌ **Implementing push notifications in `chat_service`.** Reuse `communications_service` dispatcher.
- ❌ **Hard-deleting messages in minor channels** from any path other than safeguarding-admin + retention expiry.
- ❌ **Building chat tightly coupled to Next.js UI.** Keep APIs frontend-agnostic; RN must be a drop-in swap.
- ❌ **Rolling out without moderation tooling.** Day-one includes report → queue → resolve.
- ❌ **Mixing chat and announcement concerns** in one service. Keep the seam clean.
- ❌ **Third-party chat SaaS** unless re-evaluated with full cost + safeguarding analysis.

---

## 16. Decisions & remaining questions

Items below were open in the initial draft; most are now resolved.

### Resolved

| # | Item | Decision | Rationale |
|---|---|---|---|
| 1 | Coach broadcast migration | **Deprecate `MessageLog`** after Phase 1 stabilises. See §10.6 for migration steps. | Fewer concepts for members; unified message history |
| 2 | Cross-service events transport | **HTTP (internal service-to-service) for starters.** Revisit (NATS / Redis streams) only when event volume or decoupling needs demand it. | Simplest consistent pattern with existing codebase; avoids premature infra |
| 3 | Image moderation provider | **AWS Rekognition** for images/video; **OpenAI Moderation API** for text. See §6.3. | Text moderation is free and best-in-class at OpenAI; Rekognition is the mature option for images. Swim-context tuning (§6.1 rule 6) applies to both. |
| 6 | Audit log retention | **Indefinite for now.** Revisit at legal review. | Compliance and dispute-resolution utility far outweighs storage cost at our scale |
| 7 | Shared frontend package | **Extract now** (`swimbuddz-shared` for types, API client, constants). | Smaller refactor now than when RN arrives; disciplines API boundary immediately |

### Still open

**4. Message search strategy.**

What each option is:
- **Postgres full-text search** — built into your existing DB. Uses `tsvector` / `tsquery`. Free, no extra infrastructure. Basic tokenisation; typo tolerance weak.
- **Meilisearch** — self-hosted, lightweight search engine. Typo-tolerant, fast, simple HTTP API. Good for user-facing "find the message about Tuesday's session" search.
- **Typesense** — similar to Meilisearch. Open source, fast, easy to run.
- **Elasticsearch** — enterprise-grade, heavy, overkill for chat.

**Working assumption:** Postgres full-text is sufficient through Phase 4. Switch only when users complain about search quality — likely not until 10k+ messages per member. No decision needed now beyond "Postgres to start."

**5. Realtime scaling limits — benchmark plan.**

Clarifying the earlier "500 connections per pool" phrasing (it was sloppy — this is about concurrent WebSocket *users*, not swimming pools):

Supabase Realtime uses WebSockets; each active chat user holds open connections to channels they're subscribed to. Supabase plan limits:
- Free: 200 concurrent connections
- Pro: 500 concurrent
- Higher tiers scale up, cost grows

**SwimBuddz expected concurrency:**
- 100 users, 20% active at peak → ~20 concurrent
- 1,000 users, 20% active at peak → ~200 concurrent
- 5,000 users, 20% active at peak → ~1,000 concurrent

We'll hit Supabase Pro limits around **1,000–2,000 MAU**. Before then, benchmark under real Lagos 3G conditions:
- p95 delivery latency under 1s?
- Connections survive mid-ride network flapping?
- Message ordering correct under reconnect?
- Cost at projected Phase 3 volume?

**Fallback if Supabase Realtime doesn't hold up:** self-host WebSocket (FastAPI WebSockets or `ws` on Node) behind the same API contract. Data model unchanged; only transport swaps.

**Action:** scheduled for Phase 1 mid-point — not a blocker for doc acceptance or Phase 0.

### Future-work triggers (revisit-later cheat sheet)

Decisions we've made *for now* that we've committed to revisiting when specific conditions are met. This is the single place to look when asking "should we reconsider X?"

| Current choice | Revisit when | Likely alternative |
|---|---|---|
| **PWA (installable Next.js)** for mobile | Any of: 1,000+ MAU; launch in a 2nd city/country (not 2nd pool — Festac/Rowe Park/Unilag = Lagos); iOS users >20%; App Store presence needed for marketing/partnerships | **React Native** (Expo). Share API client + types from `swimbuddz-shared`; rebuild UI layer. See §12.3. |
| **Postgres full-text search** for chat | Users complain about search quality; typo tolerance matters; or ~10k+ messages per member | **Meilisearch** or **Typesense** — self-hosted, typo-tolerant, fast. Ingest chat messages via CDC or dual-write. |
| **HTTP service-to-service events** | Event volume creates coupling pain; cross-service retry/replay becomes hard; fan-out scales beyond HTTP | **NATS** or **Redis Streams** for async events. Same contracts, different transport. |
| **Supabase Realtime** (managed WS) | Concurrency approaches Supabase Pro limits (~500 concurrent); benchmark fails under Lagos 3G | **Self-hosted WebSocket** (FastAPI WebSockets or `ws` on Node) behind the same API contract. |
| **OpenAI Moderation** for text + **AWS Rekognition** for images | Cost becomes material at scale; accuracy insufficient for swim context; compliance/data-residency concerns | Re-evaluate: Google Vision, Cloudflare AI, or a fine-tuned in-house model for swim-specific content. |
| **Audit log retention: indefinite** | Legal review flags retention limits for minors; storage cost becomes material | Define per-action retention policy; archive to cold storage after N years. |
| **Pod** as Club group name | Real user feedback consistently rejects it | Re-open naming (Squad, Crew, Lane were runners-up). |

No action required on any of these now — they are explicitly deferred.

---

## 17. Dependencies & risks

### Dependencies (must exist before Phase 1 ships)

- `safeguarding_admin` role in `members_service`
- Guardian-link model in `members_service` (confirm it exists; extend if not)
- Coach code-of-conduct versioning in `members_service`
- Supabase Storage bucket `chat-attachments` with signed-URL policy
- Image moderation provider account + credentials
- FCM + APNs credentials in `communications_service` (per existing `NOTIFICATION_ARCHITECTURE.md`)
- Gateway routing for `/chat/*`

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Supabase Realtime hits scaling limits | Medium | High | Benchmark in Phase 1; fall back to self-hosted WebSocket if needed |
| Safeguarding incident before tooling is live | Low | Very high | Phase 1 ships with reports queue + audit log; do not release without |
| Derived-membership drift causes access errors | Medium | Medium | Nightly reconciliation job from day one |
| Offline queue corrupts on client | Medium | Medium | Idempotent server accepts; client tests + crash-recovery on startup |
| WhatsApp habit too strong to migrate users | Medium | Medium | Parallel run during phased rollout; Announcements in-app AND WhatsApp for 60+ days |
| Moderation load exceeds safeguarding admin capacity | High at scale | High | Clear escalation; plan for part-time role at ~300 members, full-time at 1k |

---

## 18. Acceptance checklist (for this doc)

- [ ] Scope (§2) covers all surfaces SwimBuddz needs
- [ ] Data model (§4) reviewed for completeness
- [ ] Safeguarding rules (§6) signed off by owner (Daniel)
- [ ] Integration points with existing services (§10) agreed
- [ ] Phased rollout (§14) realistic and ordered correctly
- [ ] Open questions (§16) captured for implementation plan
- [ ] Port 8016 reserved in `docs/reference/SERVICE_REGISTRY.md`

Once accepted, next artefacts:
1. `SERVICE_REGISTRY.md` update (add chat_service at 8016)
2. `DOCUMENTATION_INDEX.md` link
3. Implementation plan (Phase 0 + Phase 1)
4. Safeguarding runbook (non-code)

---

*Last updated: 2026-04-19*
