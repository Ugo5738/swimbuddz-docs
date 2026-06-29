# Member Gatherings & Community Drop-Ins (design note)

> **Status:** Feature 2 (member-created pool meets) **IMPLEMENTED** (code-complete on `develop`; migration `e37ec62e2cff` generated + reviewed, **not yet applied**; backend tests pending). Feature 1 (community drop-in) pricing/lifecycle config still pending — not started.
> **Services:** `sessions_service` (8002), `attendance_service` (8003), `events_service` (8007), `pools_service` (8014), `wallet_service` (8013)
> **Date:** 2026-06-24
> **Author:** Daniel + AI collaborator
> **Related:** [`A1_SESSION_DISCRIMINATOR_REFACTOR.md`](./A1_SESSION_DISCRIMINATOR_REFACTOR.md), [`GUEST_AND_GROUP_BOOKING_DESIGN.md`](./GUEST_AND_GROUP_BOOKING_DESIGN.md), [`POD_MODEL_DESIGN.md`](./POD_MODEL_DESIGN.md), `docs/community/COMMUNITY_EXPERIENCE_DESIGN.md`

---

## Why this note exists

Two related product questions came up:

1. **Casual, member-organized swims** — "Federal Palace, Saturday 6am, who's in?" — currently coordinated only on WhatsApp. Should members be able to create these in-app?
2. **Community drop-ins to a Club swim** — community members sometimes show up the day the Club is swimming and *can't be turned away*, but should pay a **different amount** than Club members and should **not** earn Club credit.

These look similar ("a member-created thing others attend") but resolve to **two different features** sharing **one principle**.

### The one principle

Separate two axes that are easy to conflate:

| | **Money + headcount** | **Club performance** |
|---|---|---|
| What it is | wallet debit + ledger entry; a presence/roster record for capacity & pool-cost reconciliation | Club attendance counts, streaks, coach-payout block denominators, leaderboards, cohort/milestone progress |
| Casual meetup | **always recorded** | ❌ never |
| Community drop-in | **always recorded** | ❌ never |
| Club member at Club session | **always recorded** | ✅ yes |

> **"Tracked" does not mean "a record exists."** Money and roster are *always* recorded — that is how the pool gets paid and the books balance. "Don't track" means **invisible to the Club/Academy performance & payout machinery** only. Both features below honor this; they differ only in *how* they exclude themselves from that machinery.

---

## Feature 1 — Community drop-ins to a Club swim

**Decision (Daniel, 2026-06-24): model the community side as a *separate* session, not a shared-capacity overlay on the Club session.**

A scheduled Club swim and its community counterpart are **two distinct sessions** at the same pool + time:

- a `CLUB`-type session (exists today — Club members, Club rate, counts toward Club), and
- a `COMMUNITY`-type session (community members, community rate, does **not** count toward Club).

Both are **admin/coach-created**, exactly like every session today. (Session creation stays `require_admin`; see [§ What is *not* changing](#what-is-not-changing).) This is the drop-in *card*; it is a real, pool-committed, fee-charging session — not a member-created Event.

### Why separate sessions is clean (not just acceptable)

| Need | How separate sessions satisfy it |
|---|---|
| **Different price for community** | The community session carries its own member-facing `pool_fee`. No per-role pricing logic needed inside one session. |
| **Access** | Community members already pass the `community` branch of `validate_session_access` ([`attendance_service/routers/member/_shared.py:115`](../../swimbuddz-backend/services/attendance_service/routers/member/_shared.py)) with **no gate change**. The `club` branch keeps hard-403ing non-Club members, which is correct for the Club card. |
| **No Club-metric pollution** | A `COMMUNITY`-type session is **structurally** outside Club reporting — no role tag, no filter, no special case. |
| **Reporting separation** | Separate `session_type` rows fall out of existing aggregations cleanly. |

### The one trade-off (accepted) + a free mitigation

The two sessions have independent `capacity` and independent `_assert_capacity` head-count locks ([`sessions_service/routers/bookings.py:393`](../../swimbuddz-backend/services/sessions_service/routers/bookings.py)); **the system does not enforce a shared cap across them**, so the same physical pool can be oversold. There is no cross-session capacity or lane enforcement anywhere in the codebase today.

This is accepted. **Recommended free mitigation (no design change):** budget the two sessions' capacities to **sum to ≤ the pool's physical max** — e.g. pool holds 20 → Club cap 14, Community cap 6. Static caps then cannot oversell, and the separation is preserved.

### Pool economics for drop-ins

The flat-vs-per-swimmer pool shape (see [`pools_service` Pool model](../../swimbuddz-backend/services/pools_service/models/pool.py); cf. Missed-Session Policy v1.2) flips in the drop-in's favor:

- **Flat/committed pool** (`flat_session_fee_ngn`) → the lane is already paid for; each extra community swimmer is **pure margin**.
- **Per-swimmer pool** (`price_per_swimmer_ngn`) → set the community rate **≥ our per-swimmer cost** so a drop-in is at least cost-neutral.

### Fee charging path (already built)

Sign-in reads the session's `pool_fee`, converts to Bubbles, and debits the swimmer's wallet on first sign-in — idempotent per member, walk-ins first-class ([`attendance_service/routers/member/sign_in.py:87`](../../swimbuddz-backend/services/attendance_service/routers/member/sign_in.py)). The community session reuses this unchanged; only the `pool_fee` value differs.

---

## Feature 2 — Casual member-created meetups (the "Event way")

**Decision (Daniel, 2026-06-24): casual gatherings live in `events_service` as `Event`s, member-creatable. v1 scope locked — full spec below.**

`events_service` already provides the machinery: `created_by`, RSVP with Bubbles debit on paid events, tier access, and auto-provisioned chat channels. The only thing blocking member creation is the `require_admin` on `POST /api/v1/events/` ([`events_service/routers/member.py:151`](../../swimbuddz-backend/services/events_service/routers/member.py)).

### Why an Event, not a Session

- **Club-metric exclusion is structural** — an Event creates **no `AttendanceRecord`**, so it *cannot* feed Club attendance/streaks/coach-payouts even by accident. (Contrast Feature 1, where exclusion comes from the `COMMUNITY` type; here it comes from there being no Session at all.)
- It keeps the `Session` god-object closed to member writes (the discriminator + three-layer enforcement in [`A1_SESSION_DISCRIMINATOR_REFACTOR.md`](./A1_SESSION_DISCRIMINATOR_REFACTOR.md) stays admin-only).

### The money flow (pool meets)

For a **pool meet** (a pool is selected), the attendee pays in Bubbles:

```
attendee charge  =  pool_fee_kobo            (snapshotted from the selected pool)
                 +  organizer_surcharge_kobo (optional, organizer sets)
```

All of it is debited to the **SwimBuddz company account** — money never lands in a member's wallet, so no peer-to-peer payout rail (which does not exist, and would raise CBN payout questions) is needed. The organizer's share (their surcharge) is **disbursed manually by admin, off-platform**; that manual step doubles as the control gate on every payout. Free meets (no pool, or `pool_fee + surcharge == 0`) skip the debit entirely.

### Data-model changes to `Event`

| Field | Notes |
|---|---|
| `pool_id` (nullable UUID) | the selected pool; plain cross-service ref. NULL = no pool (informal/external venue, free). |
| `pool_fee_kobo` | **snapshotted** from the pool at creation (price stability; mirrors how Sessions snapshot `pool_fee`). |
| `organizer_surcharge_kobo` (default 0) | the organizer's add-on; settled manually off-platform. |
| `event_type = open_swim` | new enum value alongside `social`, `training`, etc. |

### Lifecycle

1. An active member (DOB ≥ 18) creates an `open_swim`, **selects a pool** (per-swimmer pools only — see guardrails) → system snapshots `pool_fee_kobo` → optional surcharge → time/title/capacity. Pod leads may scope the audience to their pod.
2. **Auto-publishes** immediately; chat channel auto-provisions (existing flow).
3. Other 18+ members RSVP; a "going" RSVP debits `pool_fee + surcharge` in Bubbles → company account. Capacity capped at the pool's physical max (`Pool.max_swimmers_capacity`).
4. **Report / takedown** — members report; admin can unpublish (reuse chat-moderation primitives).
5. Creator can **edit / cancel their own** meet (new — PATCH/DELETE are admin-only today); cancel refunds attendees' Bubbles.
6. Post-meet, admin sees **organizer earnings** (surcharge × paying attendees) and disburses off-platform.

### Permissions & guardrails (all LOCKED)

- **Who creates:** any active member; gate creation **and** RSVP on **DOB ≥ 18** (adults-only v1 — peer-led spaces are outside the coach-led safeguarding apparatus, `CHAT_SERVICE_DESIGN.md §6`). Relax `require_admin` on `POST /events/` to authenticated-member + these gates.
- **Per-swimmer pools only:** members may only select pools that bill **per-swimmer** (`price_per_swimmer_ngn`). Flat-committed-fee pools are excluded from the member-selectable set, so a low-turnout meet can never commit SwimBuddz to a fixed cost.
- **Liability waiver:** RSVP to a paid peer-organized meet requires accepting a liability waiver — reuse the guest-waiver pattern from [`GUEST_AND_GROUP_BOOKING_DESIGN.md`](./GUEST_AND_GROUP_BOOKING_DESIGN.md).
- **Go-live:** auto-publish + report/takedown (no approval queue).
- **Creation quota / cooldown:** spam guard (*recommended default*: 1 active + 2 upcoming per member — tune before ship).

### Ledger (v1 — simplified; double-entry split deferred)

**As built:** the attendee pays a **single** Bubbles debit of `pool_fee_kobo + organizer_surcharge_kobo` to the company wallet (`reference_type="event"`), which books as events revenue exactly like the existing paid-event flow — **no new ledger mapping required**. The organizer's owed amount is **computed on demand** (`organizer_surcharge_kobo × paying "going" RSVPs`) for the admin's manual, off-platform disbursement.

**Deferred:** the formal double-entry split (a dedicated `pool_fee` revenue line + an `organizer payable` liability line per `LEDGER_SERVICE_DESIGN.md §8`). The v1 single-debit + computed-earnings model fully satisfies the requirement (money to company; admin knows what's owed; manual payout) without a ledger-service change. Promote to the double-entry split when organizer payouts need first-class accounting.

### Promotion to an official session (no redesign needed)

If a meetup ever needs to become a real scheduled pool session with attendance tracking, an **admin promotes it** to a `type=EVENT` Session — the discriminator already *requires* `event_id` for `EVENT` sessions ([`sessions_service/models/_validators.py`](../../swimbuddz-backend/services/sessions_service/models/_validators.py)), so the Event→Session bridge is a supported shape, admin-gated, not new architecture.

---

## What is *not* changing

- **Session creation stays `require_admin`.** Members never create `CLUB`/`COMMUNITY`/`COHORT_CLASS`/`EVENT`-type *Sessions*. They create *Events* (Feature 2) and *book/sign in* to Sessions.
- **The `club` access gate stays strict.** Non-Club members still cannot sign into a Club session; they use the paired Community session instead.
- **The `Session` discriminator and its three-layer enforcement** are untouched.
- **Pod leads** keep their existing ability to *reschedule* (not create) their pod's weekly Club session.

---

## Rejected alternative — single shared-capacity session with role-aware pricing

Considered: one underlying session for the physical swim, with a second member-facing rate (e.g. `community_drop_in_fee`) and a `role = drop-in` tag on the attendance row, filtered out of Club metrics by reporting. This *automatically* enforces shared capacity (one head-count).

**Set aside** in favor of separate sessions because Daniel wants clean community/club separation, and it introduces per-role pricing logic and a reporting-filter dependency that the separate-session model avoids entirely. The shared-capacity benefit is recoverable cheaply via the capacity-budgeting mitigation above.

---

## Decisions — status

**Feature 2 (member-created pool meets) — LOCKED (Daniel, 2026-06-24):**
- **Money:** pool fee (auto, snapshotted) + optional organizer surcharge → company account; organizer paid out manually, off-platform.
- **Who creates:** any active member; **adults-only (18+)** for both creation and RSVP.
- **Go-live:** **auto-publish + report/takedown** (no approval queue).
- **Pool selection:** **per-swimmer pools only** (flat-fee pools excluded from the member-selectable set).
- **Liability waiver** required on RSVP to paid meets.
- **Creator** can edit/cancel their own meet.

**Feature 1 (community drop-in) — still open:**
1. **Community rate location.** Per community-session each time, or a default community/drop-in rate stipulated on the **Pool** (fits "fees stipulated per pool") that the session inherits? *Recommend pool-level default, overridable per session.*
2. **Community session lifecycle.** Auto-created alongside each Club swim, or created on demand only when drop-ins are expected?

**Minor / tunable (both):**
- Creation quota exact numbers (Feature 2).
- Frontend surfaces: member meetup create/edit form (`/community/events/create`); the community "card" for the drop-in session (Feature 1).

---

## Implementation sketch (once decisions land)

**Feature 1 (drop-in):** mostly operational + pricing config — the session machinery already exists. Add the community-rate source (decision 1), the pairing/lifecycle (decision 2), and capacity budgeting. Possibly a frontend community card.

**Feature 2 (meetups) — AS BUILT:**
- `Event` gained `pool_id` / `pool_fee_kobo` / `organizer_surcharge_kobo`; new `event_type="open_swim"` (a plain string column, so no enum migration). Migration `e37ec62e2cff` (3 add-columns).
- A **dedicated** member endpoint `POST /events/open-swim` (the existing admin `POST /events/` stays `require_admin`), plus creator-only `PATCH`/`DELETE /events/open-swim/{id}`. Gates: authenticated member + **DOB ≥ 18** (DOB now returned by the members internal endpoint + client), per-swimmer **active-partner** pools only (new `get_partner_pool` client), pool-fee snapshot, capacity ≤ pool max, quota of 3 upcoming meets.
- RSVP charges `pool_fee + surcharge` as a single debit to the company; adults-only + **liability-waiver** gates to join a paid meet. Cancel refunds paid attendees (idempotent).
- Frontend: `EventsApi` lib, shared `OpenSwimForm`, create/edit pages, "Host an open swim" entry point, and the detail-page waiver + total-cost + host edit/cancel controls.

**Remaining:** apply migration `e37ec62e2cff` (`alembic upgrade head`, dev DB), then backend tests.

---

*Last updated: 2026-06-24*
