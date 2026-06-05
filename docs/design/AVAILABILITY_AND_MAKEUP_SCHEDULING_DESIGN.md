# Coach Availability & Make-Up Scheduling — Architecture & Data Model Design

> **Status:** Draft — Awaiting Review
> **Date:** 2026-06-03
> **Author:** Daniel + AI collaborator
> **Implements:** [Missed Session, Rescheduling & Make-Up Policy v1.0](../policy/MISSED_SESSION_AND_MAKEUP_POLICY.md)
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
| D5 | "Block" unit | **Lesson package / cohort term** (the bundle they paid for) | Grace + make-up window both reset per block. Anchor differs by learner type (see §5). |
| D6 | Confirmation gate | **System pre-check → admin one-tap** | Coach pre-vetted by published availability; keeps policy §3 admin ownership; cuts compose→tap. |
| D7 | v1 scope | **Both, phased — cohort first, then 1:1 on the same rails** | Cohort substrate exists → ship fast. 1:1 needs a rebuilt lesson primitive (dropped 2026-05-17). |

---

## 3. The 1:1 gap (why phasing matters)

The policy's scope line is *"individual adult learners (Academy lessons **and 1:1** / make-up sessions)"* — but **pure 1:1 lessons are not currently a platform product**:

- `ONE_ON_ONE` session type was **dropped on 2026-05-17** (A1 Phase 3.1) as "aspirational" — *zero rows* ever used it. Live types: `COHORT_CLASS / CLUB / COMMUNITY / EVENT`.
- There is **no individual lesson-package / purchase entity**. 1:1 lessons run off-platform today.
- `CohortMakeupObligation` (the existing make-up machinery) is **cohort-bound and payout-coupled** — fine for cohort make-ups, useless for 1:1.

So "build this for 1:1 learners" quietly means **bringing the 1:1 lesson product onto the platform.** Hence the phasing in §4.

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

### Phase 2 — 1:1 lessons on the same rails
- **sessions_service:** re-introduce `ONE_ON_ONE` session type (reverses A1 Phase 3.1).
- **payments_service:** light `LessonPackage` entity (learner, sessions_total/used, expires_at) → the block anchor for 1:1 (D5).
- Same availability + `MakeupBooking` + rules engine now serve 1:1. Full request→confirm self-serve.

---

## 5. Service map (respecting isolation — HTTP only, plain-UUID cross-refs)

| Component | Owner service | Notes |
|---|---|---|
| Coach availability data (`availability_calendar`, `min_hours_between_sessions`) | **members_service** | Stub column already on `CoachProfile`. Coach editor lives here. |
| `MakeupBooking` model + rules engine + bookable-slot compute | **sessions_service** | Policy §4 internal note already nominates sessions_service for the spacing check. A make-up *is* a session booking. |
| Block source — cohort term | **academy_service** | Read via HTTP (cohort enrollment + end_date). |
| Block source — 1:1 package (Phase 2) | **payments_service** | New `LessonPackage`; owns purchases/entitlements already. |
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
| Payment — **per-session pool fee** (~₦3,500) | **Refunded to Bubbles** when the original session is excused / no-show-with-make-up, so it funds the make-up session's own pool fee — otherwise the learner pays the pool fee *twice* (missed session + make-up). Routed through the **accounted `session_booking` refund path** (reverses the pool-fee revenue and restores the Bubble liability), **never** the manual "Adjust Bubbles" tool (that path is invisible to the ledger and double-counts revenue). Until make-up *confirm* (Phase 1) triggers it automatically, an admin issues it via the booking **pool-fee-refund** action (`POST /sessions/bookings/{id}/refund-pool-fee`). |
| Safeguarding | **Adults only.** Extending availability-booking to minors re-triggers the human-in-the-loop gate (Chat Safeguarding Policy). |

---

## 11. Open / deferred
- Learner-facing request UI polish (Phase 1.5).
- Coach "decline a confirmed slot" recovery path (availability went stale).
- Surfacing a one-line §4 acceptance at enrollment (policy §95 — could become an `agreement_versions` entry).
- 1:1 paid booking (not just make-ups) on the availability rails.

---

*Last updated: 2026-06-03*
