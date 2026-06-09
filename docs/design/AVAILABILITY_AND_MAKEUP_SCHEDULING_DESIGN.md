# Coach Availability & Make-Up Scheduling — Architecture & Data Model Design

> **Status:** Draft — Awaiting Review
> **Date:** 2026-06-03
> **Author:** Daniel + AI collaborator
> **Implements:** [Missed Session, Rescheduling & Make-Up Policy v1.2](../policy/MISSED_SESSION_AND_MAKEUP_POLICY.md)
> **Related:** [A1 Session Discriminator Refactor](./A1_SESSION_DISCRIMINATOR_REFACTOR.md) (dropped `ONE_ON_ONE`, 2026-05-17)

---

## 1. Overview

This is the **platform-enforcement counterpart** to the Missed-Session policy. The policy is live but runs **manually / WhatsApp-era** today. This design brings it into the product in two moves:

1. **Coaches publish their availability** (recurring weekly blocks + blackout dates).
2. **Make-ups / reschedules are booked against that availability**, with the policy's eligibility and spacing rules applied — moving the admin from *composing messages* to *one-tap confirm*.

The trigger for this work: **admin scheduling load hurts now.** The goal is to remove the two round-trips the policy already tries to kill — "are you free?" (solved by published availability) and "is this allowed?" (solved by encoding §4 in code).

### Guiding split (from policy §3)
> **Logistics are the admin's call; teaching judgement is the coach's.** Availability publishing answers *"am I free?"* once. The system answers eligibility + spacing. The admin confirms. The coach is pulled in only for genuine exceptions (e.g. approving a back-to-back day).

---

## 2. Decision record

Every pivotal decision, locked with Daniel across design sessions (2026-06-02/03):

| # | Decision | Choice | Rationale |
|---|---|---|---|
| D1 | Availability shape | **Recurring weekly blocks + blackout dates** | Coaches think "generally free Tue/Thu mornings" *and* "away next week." One-off-only is tedious. |
| D2 | Enforcement strength | **Inform (soft) for spacing; hard-gate the countable rules** | Spacing is judgement (coach-overridable); notice/outstanding-cap/window are objective. |
| D3 | Feature vs model scope | **Make-ups-first feature; general-purpose availability model** | Don't paint the availability data into a make-up-only corner. |
| D4 | Make-up model | **New `MakeupBooking` model** (do *not* extend `CohortMakeupObligation`) | The existing obligation is `cohort_id NOT NULL` + payout-coupled; can't represent 1:1; extending it = "god object" (CLAUDE.md anti-pattern). |
| D5 | "Block" unit | **Cohort term** (group or private cohort) | Grace + make-up window reset per block. 1:1 is a `CohortType.PRIVATE` cohort, so it uses the same cohort-term block as group (§3) — no separate package entity. |
| D6 | Confirmation gate | **System pre-check → admin one-tap** | Coach pre-vetted by published availability; keeps policy §3 admin ownership; cuts compose→tap. |
| D7 | v1 scope | **Both, phased — cohort first, then 1:1 on the same rails** | Cohort substrate exists → ship fast. **1:1 is already a `CohortType.PRIVATE` cohort** (1 student, normal `COHORT_CLASS` sessions), so the same rails serve it — no separate 1:1 primitive needed (see §3). |

---

## 3. 1:1 is a private cohort (correction)

> **Correction (2026-06-07):** an earlier draft of this section claimed 1:1 was "not a platform product" because the `ONE_ON_ONE` *session type* was dropped (A1 Phase 3.1, 2026-05-17). **That was wrong.** The A1 refactor *remodelled* 1:1, it didn't remove it.

The policy's scope line is *"individual adult learners (Academy lessons **and 1:1**)."* In the current architecture:

- **1:1 = `CohortType.PRIVATE`** — a cohort with **one student** (`capacity = 1`), member-paid. `SMALL_GROUP` and `CORPORATE` are siblings of it.
- The **session layer is identical for every cohort type**: all run `SessionType.COHORT_CLASS` with `cohort_id` set (per the `CohortType` enum's own comment). The type only varies capacity/structure on the cohort row.
- Therefore the make-up rails **already serve 1:1 with no extra work**: bookable-slots find the coach's `COHORT_CLASS` sessions (private included), confirm derives the block from `cohort_id` (= the private cohort term), and self-serve / completion / payout all apply unchanged.

So there is **no separate 1:1 product to build** for make-ups. The only genuine 1:1 gaps are UI/UX, captured in §4 Phase 2. (The `MakeupLearnerType.ONE_ON_ONE` / `MakeupBlockKind.LESSON_PACKAGE` enum values added during the misread are now vestigial — 1:1 uses `COHORT_TERM`.)

---

## 4. Scope & phasing

### Phase 0 — Foundation (shared rails)
The reusable substrate, learner-type-agnostic.
- **members_service:** define the `availability_calendar` JSON schema (D1) + add `min_hours_between_sessions` column. Coach-facing availability editor (API + frontend). *← this is the original ask: "a calendar for coaches to put in available time."*
- **sessions_service:** new `MakeupBooking` model (D4) + rules-engine skeleton + bookable-slot computation that reads availability from members_service.

### Phase 1 — Cohort make-ups (ship fast)
Substrate already exists (`Enrollment`, `CohortMakeupObligation`, payout blocks).
- Block anchor = **cohort term** (from academy_service). Grace = 1 / cohort term.
- **Admin make-up screen:** open a learner's make-up → see bookable-for-this-learner slots (availability − booked − spacing-flagged) → **one-tap confirm** → creates/links the make-up session and flips the matching `CohortMakeupObligation` to `SCHEDULED`.
- Hard-gate notice / outstanding-cap / window; soft-warn spacing (D2).
- **On confirm, refund the original (missed) session's per-session pool fee to Bubbles** via the accounted `session_booking` refund path, so it funds the make-up's pool fee (§10 Payment). Reuses the same refund primitive as the admin stopgap action (`POST /sessions/bookings/{id}/refund-pool-fee`) — the program fee is untouched.

### Phase 1.5 — Learner self-serve request (cohort)
- Learner sees *their valid slots only*; requests one → `REQUESTED` + soft `HELD`; admin one-tap confirms. This is the actual admin-load relief.

### Phase 2 — close the 1:1 UX gaps ✅ (shipped 2026-06-09)
1:1 already works on the rails (§3) — what was missing was two UX affordances, **not a new product**. Both are now shipped:
- **Cohort-type selector in the admin create-cohort form** ✅ — `academy/cohorts/new/_new/BasicsStep.tsx` now has a Group / Private / Small group / Corporate selector (frontend `CohortType` in `src/lib/academy/types.ts`); picking **Private** auto-sets capacity to 1. The API + model already accepted `type`. This unblocked the end-to-end 1:1 path.
- **One-click open-slot make-up** ✅ — `POST /api/v1/makeups/open-slot` (`MakeupOpenSlotCreate`) creates a brand-new dedicated `COHORT_CLASS` session in a coach's open slot (cohort from `cohort_id`, else derived from the original session), attaches the coach as lead, and confirms the learner in via the shared confirm core. It **fails fast** before any session is built on an ineligible request (future-slot / outstanding-cap) and **refuses slots that overlap** a session the coach already runs (use the join path for that). The admin make-up screen's "open time" entries are now bookable buttons. (The *join an existing session* path was already one-click.)

(No `ONE_ON_ONE` session type or `LessonPackage` entity is needed — those were artefacts of the §3 misread.)

---

## 5. Service map (respecting isolation — HTTP only, plain-UUID cross-refs)

| Component | Owner service | Notes |
|---|---|---|
| Coach availability data (`availability_calendar`, `min_hours_between_sessions`) | **members_service** | Stub column already on `CoachProfile`. Coach editor lives here. |
| `MakeupBooking` model + rules engine + bookable-slot compute | **sessions_service** | Policy §4 internal note already nominates sessions_service for the spacing check. A make-up *is* a session booking. |
| Block source — cohort term | **academy_service** | Read via HTTP (cohort enrollment + end_date). |
| Block source — 1:1 | **academy_service** | Same as group: a 1:1 is a `CohortType.PRIVATE` cohort, so its block is that cohort's term — no separate package entity. |
| Payout obligation (unchanged) | **payments_service** | `CohortMakeupObligation` stays the payout trigger; linked, not replaced (§9). |
| Coach availability editor UI; admin approval queue; learner request UI | **frontend** | Coach area + `/admin/*` + learner account. |

Cross-service calls: `sessions_service → members_service` (availability), `sessions_service → academy_service` (cohort/block). No cross-service DB access; IDs are plain UUIDs by design.

---

## 6. Data model

### 6a. Coach availability (members_service — `CoachProfile.availability_calendar` JSONB)

```jsonc
{
  "version": 1,
  "timezone": "Africa/Lagos",          // store explicitly; don't assume server tz
  "recurring": [                        // weekly blocks, sliced into slot_minutes units
    { "weekday": "tue", "start": "06:00", "end": "10:00" },
    { "weekday": "thu", "start": "06:00", "end": "10:00" },
    { "weekday": "sat", "start": "08:00", "end": "12:00" }
  ],
  "blackouts": [                        // date ranges that subtract from recurring
    { "start": "2026-06-15", "end": "2026-06-22", "reason": "travel" }
  ],
  "slot_minutes": 60,                   // default lesson/make-up length (D-default)
  "buffer_minutes": 0                   // optional gap between consecutive slots
}
```

New column on `CoachProfile`:
```python
min_hours_between_sessions: Mapped[int | None]  # null → use 48h policy default
```
Captured at coach onboarding (Coach Agreement §2.4); overrides the 48h spacing default for that coach's learners.

### 6b. `MakeupBooking` (sessions_service — new table)

```python
class MakeupBooking(Base):
    id: UUID  (pk)
    learner_member_id: UUID  (index)
    coach_member_id: UUID  (index)

    learner_type: enum  # COHORT | ONE_ON_ONE   (Phase 1 = COHORT only)
    block_kind: enum     # COHORT_TERM | LESSON_PACKAGE
    block_id: UUID       # cohort_id (Phase 1) or package_id (Phase 2) — scopes grace + window

    origin: enum         # LEARNER_RESCHEDULE | EXCUSED_ABSENCE | SESSION_CANCELLED | LATE_JOIN
    original_session_id: UUID | None      # the missed/moved session
    scheduled_session_id: UUID | None     # the make-up slot, once confirmed

    status: enum  # happy path: REQUESTED → HELD → CONFIRMED → COMPLETED
                  # exits:      FORFEITED | EXPIRED | CANCELLED
    used_grace: bool = False              # did this consume the block's one grace?
    notice_hours_at_request: int | None   # audit of the 24h rule
    hold_expires_at: datetime | None      # soft-hold expiry (Phase 1.5+)
    spacing_overridden_by: UUID | None    # coach who approved a back-to-back, if any

    obligation_id: UUID | None            # link to CohortMakeupObligation (§9)
    notes, created_at, updated_at
```

Status lifecycle:
- `REQUESTED` (learner asked) → `HELD` (soft hold while admin reviews) → `CONFIRMED` (admin one-tap; session created/linked) → `COMPLETED` (attendance PRESENT/LATE).
- `FORFEITED` (late/no-show, no grace left), `EXPIRED` (window passed unbooked), `CANCELLED` (admin).
- **Phase 1:** admin creates directly at `CONFIRMED`. `REQUESTED/HELD` come online with self-serve (Phase 1.5).

### 6c. Grace & outstanding cap — *derived, not a separate ledger*
- **Grace used this block?** `EXISTS(MakeupBooking WHERE learner_member_id=? AND block_id=? AND used_grace=true)`.
- **Outstanding make-up?** `COUNT(MakeupBooking WHERE learner_member_id=? AND status IN (REQUESTED,HELD,CONFIRMED)) == 0` required before granting another (policy: 1 at a time).
- **Window:** a make-up must be booked+taken by `min(block_end, original_missed_date + 14 days)`.

Keeping these as queries over `MakeupBooking` rows (not a counter table) makes them auditable and avoids drift.

---

## 7. Rules engine (sessions_service)

**Hard gates** (block the booking):
- **Reason required (1b):** a reschedule needs a genuine reason — captured on the request, judged by the admin (§3). Notice never makes a reason-less reschedule automatic. `is_penalty_free(now, original_start)` governs *forfeit*, not entitlement.
- **Notice → penalty:** ≥24h (with a valid reason) = penalty-free; <24h or a no-show → grace logic (forfeit once grace is spent).
- **Outstanding cap:** an open make-up exists → refuse a second.
- **Window:** proposed slot is after `min(block_end, missed_date + 14d)` → refuse.

**Grace logic:** on a late-cancel / no-show → if no grace used in block, set `used_grace=true` and allow the make-up; else → `FORFEITED`.

**Soft warn** (inform, admin may proceed — D2):
- **Spacing:** proposed slot within `min_hours_between_sessions` (coach override, else 48h) of *any* of the learner's other sessions (cross-coach — it's about the learner's recovery), **or** on a back-to-back day. Back-to-back specifically requires coach approval → record `spacing_overridden_by`.

---

## 8. Bookable-slot computation

A make-up needn't be 1:1 (policy §1), so the computation returns **two kinds of option** for a window:

- **`open`** — a dedicated gap in the coach's availability: expand `recurring` into `slot_minutes` units, **minus** `blackouts`, **minus** every coach session (each occupies the coach's time).
- **`join_session` (1a)** — an existing coach session in the window that still has **room** (`booked_count < capacity`); the learner joins it alongside others. Surfaced even when the coach has published no calendar. Pedagogical fit is the coach/admin's call (§3).

Both kinds are **flagged (not removed)** for spacing against the learner's other sessions (§7) → `ok` + warnings. The endpoint (`GET /makeups/bookable-slots`) returns `availability_set` (whether a calendar exists) plus the mixed, time-sorted list. It **never** exposes the coach's raw calendar — only options valid for that learner.

---

## 9. Key open integration decisions (confirm before/with build)

1. **`MakeupBooking` ↔ `CohortMakeupObligation`.** For cohort learners, an EXCUSED absence *already* auto-creates a `CohortMakeupObligation` (payout domain). **Recommendation: coexist + link** — the obligation stays the payout trigger; `MakeupBooking` is the scheduling/eligibility layer; store `obligation_id` on the booking; confirming a booking flips its obligation to `SCHEDULED`. *(Alternative: migrate obligations into `MakeupBooking` — rejected, it re-couples scheduling to payout.)*
2. **1:1 `LessonPackage` location (Phase 2).** Recommendation: **payments_service** (owns purchases; `SESSION_BOOKING` + `_session_bundle` already there). `block_id` for 1:1 = `package_id`.
3. **Re-introducing `ONE_ON_ONE`** in sessions_service (reverses A1 Phase 3.1) — Phase 2, coordinate with the discriminator CHECK constraint.

---

## 10. Settled defaults (proceeding on these unless flagged)

| Item | Default |
|---|---|
| Grace / make-up-*entitlement* storage | Derived from `MakeupBooking` rows (§6c) — not Bubbles/wallet. (This is the *right to a make-up*; the per-session pool-fee refund is a separate money movement — see Payment.) |
| Default make-up duration | 60 min (`slot_minutes`), per-coach overridable |
| Spacing default | 48h; `min_hours_between_sessions` overrides per coach |
| Spacing scope | All the learner's sessions (cross-coach) |
| Slot race | Soft hold w/ short expiry (`hold_expires_at`, ~30 min) — Phase 1.5+ |
| Reschedule-of-a-make-up | Same 24h/grace rules recurse; a forfeited make-up is gone |
| Notifications v1 | Learner: confirmed + reminder. Admin: new-request ping. Defer the rest. |
| Payment — **program fee** | Out of scope — the coaching/program fee is a paid commitment; a make-up re-delivers it at no extra charge ("already-paid time"). Not refunded. |
| Payment — **per-session pool fee** (amount varies by pool) | **Refunded to Bubbles** when the original session is excused / no-show-with-make-up, so it funds the make-up session's own pool fee — otherwise the learner pays the pool fee *twice* (missed session + make-up). Routed through the **accounted `session_booking` refund path** (reverses the pool-fee revenue and restores the Bubble liability), **never** the manual "Adjust Bubbles" tool (that path is invisible to the ledger and double-counts revenue). Until make-up *confirm* (Phase 1) triggers it automatically, an admin issues it via the booking **pool-fee-refund** action (`POST /sessions/bookings/{id}/refund-pool-fee`). |
| Payment — pool fee on **forfeit** (no make-up) | **Pool-specific** (Daniel, 2026-06-07). On a forfeit (late cancel / no-show, no valid reason, no make-up), the member's pool fee follows *our* cost with that pool: **flat / committed fee** (`Pool.flat_session_fee_ngn`) → cost is sunk whether or not she swims → **keep it** (cost recovery, not a penalty). **Per-swimmer billing not charged for no-shows** (`Pool.price_per_swimmer_ngn`) → we incur no cost → **refund** to Bubbles via the accounted `session_booking` path (never "Adjust Bubbles"). Distinct from the per-session pool-fee row above — that avoids *double*-charging when a make-up is granted; this asks whether a cost was incurred at all. The forfeited *session* (coaching commitment) is the behavioural penalty either way. **For now** admin applies it per pool from the pricing fields; future enforcement reads `Pool` pricing automatically (ideally an explicit `bills_for_no_shows` flag — per-swimmer-*booked* ≠ per-swimmer-*attended*). |
| Safeguarding | **Adults only.** Extending availability-booking to minors re-triggers the human-in-the-loop gate (Chat Safeguarding Policy). |

---

## 11. Open / deferred
- Learner-facing request UI polish (Phase 1.5).
- Coach "decline a confirmed slot" recovery path (availability went stale).
- Surfacing a one-line §4 acceptance at enrollment (policy §95 — could become an `agreement_versions` entry).
- 1:1 paid booking (not just make-ups) on the availability rails.

---

*Last updated: 2026-06-07*
