# Guest & Group Booking — Architecture & Data Model Design

> **Status:** Draft — Awaiting Review
> **Date:** 2026-06-09
> **Author:** Daniel + AI collaborator
> **Related:** [A1 Session Discriminator Refactor](./A1_SESSION_DISCRIMINATOR_REFACTOR.md) · [Availability & Make-Up Scheduling](./AVAILABILITY_AND_MAKEUP_SCHEDULING_DESIGN.md) · [Ledger Service Design](./LEDGER_SERVICE_DESIGN.md) · [Missed-Session & Make-Up Policy v1.2](../policy/MISSED_SESSION_AND_MAKEUP_POLICY.md)

---

## 1. Overview

Today a booking is strictly **one member = one slot**. The `SessionBooking`
row carries a single `member_id`, guarded by `UNIQUE(session_id, member_id)`,
and there is no `quantity` / `party_size` / `headcount` field anywhere
(`services/sessions_service/models/booking.py`). A member cannot bring anyone.

Members **do** want to bring people — a friend to an open meet, or a block of
slots for a group. This design adds that in a way that stays financially
correct (pool costs, capacity, ledger) and safe (safeguarding for minors),
without turning `SessionBooking` into a god object.

**Two cases, one mechanism.** "Bring-a-friend" and "block booking" are the same
thing — *a booking that represents more than one swimmer* — differing only in
**when guest identity is captured**:

- **Bring-a-friend** → guests named up front (name, phone, guardian-if-minor).
  Doubles as a safeguarding record **and** a lead you can convert to a member.
- **Block booking** → reserve *N* slots now; names required before check-in
  (so the door is still safe even if the booking starts anonymous).

### Guiding principle
> **The guest is always a non-member; the inviter can be anyone.** Don't gate by
> *who invites* (community / club / cohort members all invite friends) — gate by
> *which session accepts guests*. A cohort member's friend joins a guest-enabled
> open meet — or sits in on a **single cohort session as a trial** to sample it
> before enrolling (D10). What a guest never does is *enrol* in the cohort just
> by showing up.

---

## 2. Decision record

Locked with Daniel across the 2026-06-09 design session:

| # | Decision | Choice | Rationale |
|---|---|---|---|
| D1 | Who is a "plus one" | **Non-member guests + group/block bookings** (NOT additional members) | A member booking for *other members* (e.g. their kids) is multi-select booking — each needs their own enrollment / attendance / make-up rights. That's a separate concern; out of scope here. |
| D2 | Gating axis | **Gate by session, via `Session.allows_guests`** — not by inviter's layer | Club & cohort members invite friends too. Gating by inviter would block a real behaviour. Gate the session: friend joins a guest-enabled session, never the cohort lesson. |
| D3 | Booking shape | **`SessionBooking.party_size` + child `booking_guest` rows** | Bring-a-friend and block booking are one mechanism; only identity-capture timing differs. |
| D4 | Guest make-up rights | **None — only the member's own slot follows the policy** ✅ *approved* | Guests are non-members. Keeps the Missed-Session policy from exploding into per-guest entitlement. |
| D5 | Per-head attendance | **Relax `AttendanceRecord.member_id` → nullable, add `booking_guest_id`, CHECK exactly one set** ✅ *approved* | Per-head presence enables per-head no-show + per-head refund. Today `member_id` is non-nullable, so a guest can't be recorded at all. |
| D6 | Minors | **Hard gate — guardian + waiver required before check-in** ✅ *approved* | Platform serves ages 6+. An unregistered child with no guardian/waiver is a real liability, not a nicety. |
| D7 | Pool cost | **Activate `Pool.price_per_swimmer_ngn × party_size`** | Per-swimmer pools bill us per head. A flat member fee + guests = underwater. The field exists but is currently dead code. |
| D8 | Fee trust | **Server-compute `fee_amount_kobo`** from `session.pool_fee × party_size` | Today the client *supplies* `fee_amount_kobo` (`ge=0`). With a head multiplier that's tamper-bait — someone sends `party_size=4, fee=0`. |
| D9 | Capacity | **Enforce on every booking, counting heads not rows** | Regular booking checks capacity *not at all* today (only make-up does). One booking can now be N bodies — overfill risk is real. |
| D10 | Cohort taster | **Allowed by default as a coach-approved, one-time trial** — `cohort_class` defaults `allows_guests` **on**; a coach opts a specific session out when unsuitable | A friend sampling a class is the academy's strongest enrolment funnel, so default it open. Teaching judgment stays the coach's (make-up policy §3 split): each trial is approval-gated (non-`MEMBER_SELF` channel), never self-serve, and the coach can close any session to guests. Trial ≠ enrolment: no curriculum, no make-ups. |

---

## 3. Scope & phasing

### Phase 1 — Named guests (bring-a-friend)
Community + Club sessions. `party_size` + `booking_guest` (named) + per-head fee
(server-computed) + heads-based capacity + per-head attendance + the minor gate.
`allows_guests` defaults **on** for **every** session type; admins/coaches opt a
specific session out. Community/Club guests are self-serve; cohort trials add the
coach-approval gate in Phase 1.5 (D10).

### Phase 1.5 — Cohort tasters (trial)
Same `booking_guest` model, `intent = trial`. Adds a **coach/admin approval
gate** (created via a non-`MEMBER_SELF` channel, never self-serve), a
one-trial-per-prospect cap, and trial pricing (§6 / O4). `cohort_class` sessions
default `allows_guests = on`; a coach opts a specific session out when it's not
suitable. This is the academy's pre-enrolment funnel — the **trial → enrolment**
conversion is the metric to watch.

### Phase 2 — Block / anonymous booking
Reserve *N* slots with placeholder guest rows; enforce "named before check-in".
Wire the existing `SessionBooking.corporate_program_id` for corporate blocks.

### Phase 3 — Guest → member conversion funnel
`booking_guest.converted_member_id`, phone-based dedupe to recognise repeat
guests, optional `communications_service` nudge ("your friend swam 3× — invite
them to join").

---

## 4. Service map (respecting isolation — HTTP only, plain-UUID cross-refs)

| Service | Change |
|---|---|
| **sessions_service** | `SessionBooking.party_size`; new `booking_guest` table; `Session.allows_guests` (+ `max_guests_per_booking`); server-side fee computation; heads-based capacity gate. |
| **pools_service** | No model change — read `price_per_swimmer_ngn` / `flat_session_fee_ngn` / `max_swimmers_capacity` (already exist). Source-of-truth for pool-cost is **§10 open**. |
| **wallet_service** | None — debit is just a larger `fee_amount_kobo`. |
| **attendance_service** | `member_id` → nullable; add `booking_guest_id`; CHECK + guest-dedupe constraint; guests recorded `role=GUEST` (enum value already exists). |
| **ledger_service** | Revenue `revenue_club_session` scales with heads; per-head refund on forfeit (per the flat-vs-per-swimmer rule). |

No cross-service imports or FKs — all refs stay plain UUIDs per
`docs/reference/SERVICE_COMMUNICATION.md`.

---

## 5. Data model

### 5a. `SessionBooking` (sessions_service — alter)
```
+ party_size: int  NOT NULL  default 1  server_default "1"   # member + guests, >= 1
```
- `fee_amount_kobo` keeps its "snapshot at booking time" semantics but is now
  **server-computed** as `session.pool_fee × party_size` (D8).
- `UNIQUE(session_id, member_id)` **stays** — one booking per member; guests hang
  off it. Existing rows migrate to `party_size = 1` → zero behaviour change.

### 5b. `booking_guest` (sessions_service — new table)
```
id                 UUID  PK
booking_id         UUID  NOT NULL  index        # plain UUID, intra-service ref
full_name          Text  NULL                   # required before check-in (Phase 2 may start NULL)
phone              Text  NULL  index             # lead-gen + dedupe
intent             Text  NOT NULL default 'social'  # 'social' = open-meet friend | 'trial' = prospective student sampling a class (D10)
date_of_birth      Date  NULL                    # drives the minor gate (preferred over a bool)
guardian_name      Text  NULL                    # required if minor
guardian_phone     Text  NULL                    # required if minor
waiver_accepted_at Timestamptz  NULL             # required if minor, before check-in
converted_member_id UUID NULL                    # closes the lead funnel (Phase 3)
created_at / updated_at
```

### 5c. `AttendanceRecord` (attendance_service — alter)
```
~ member_id: UUID  ->  NULLABLE
+ booking_guest_id: UUID  NULL  index            # plain UUID, cross-service ref
+ CHECK ( (member_id IS NOT NULL) <> (booking_guest_id IS NOT NULL) )   # exactly one
+ UNIQUE(session_id, booking_guest_id)           # guest can't be double-recorded
```
- Existing `UNIQUE(session_id, member_id)` is safe: Postgres treats NULLs as
  distinct, so multiple guest rows (member_id NULL) per session don't collide.
- Guests recorded with `role = GUEST`; members unchanged (`role = SWIMMER`).
- No-show analytics (`status='absent' AND booking_id IS NOT NULL`) are unaffected
  — they key on `member_id`, which guests don't have.

### 5d. `Session` (sessions_service — alter)
```
+ allows_guests: bool  NOT NULL  server_default "true"     # eligible to host guests; opt-out per session (D2/D10)
+ max_guests_per_booking: int  NOT NULL  server_default "4"  # cap on (party_size - 1); 0 disables guests here
```

---

## 6. Fee & pool-cost model

Two distinct money flows — keep them separate (per Missed-Session policy notes:
the member pool fee is **revenue**, not a pass-through to the pool):

1. **Member pays** (revenue in): `per_head = session.pool_fee` (kobo);
   `fee_amount_kobo = per_head × party_size`. Wallet debit =
   `kobo_to_bubbles(fee_amount_kobo)`. Books as `revenue_club_session` for the
   full multiplied amount → **guests are upside, not leakage**.
2. **We owe the pool** (cost out): per-swimmer pools →
   `price_per_swimmer_ngn × party_size`; flat pools → `flat_session_fee_ngn`
   regardless of heads. This is the **activation of D7's dead field** and feeds
   the ledger cost side.

> Per-guest pricing is assumed **equal to the member per-head rate** in v1. A
> guest surcharge / discount (`Pool.group_discount_available`) is deferred (§11).
> A cohort **trial** (D10) may be comped or flat-priced as a conversion lever —
> but even a free trial still incurs the pool's per-swimmer cost, so it is a
> customer-acquisition cost, not zero. Trial pricing is tracked in O4.

---

## 7. Capacity enforcement

New rule, applied on **every** booking path (self-book, admin, walk-in) — closes
the D9 gap:

```
effective_capacity = min(session.capacity, pool.max_swimmers_capacity ?? ∞)
SUM(party_size) over active bookings + new.party_size  <=  effective_capacity
```

- "Active" = `CONFIRMED` **plus unexpired `PENDING`** (the 15-min TTL window) to
  avoid oversell during payment — see §10 open question.
- Wrap the check + insert in one transaction with a **lock on the session row**
  (or a Postgres advisory lock keyed on `session_id`) so concurrent bookings
  can't both pass the gate and overfill.

---

## 8. Make-up / forfeit interaction (D4)

- **Member's own slot** → follows Missed-Session policy v1.2 unchanged
  (make-up eligible, spacing rules, etc.).
- **Guests** → no make-up entitlement. A guest no-show forfeits that head's fee
  per the **pool-specific rule** already in policy §10:
  - flat pool (`flat_session_fee_ngn`) → **keep** (cost recovery — sunk cost),
  - per-swimmer pool (`price_per_swimmer_ngn`) → **refund that head** via the
    accounted `session_booking` path (`POST /sessions/bookings/{id}/refund-pool-fee`).
- ⚠️ That refund endpoint is **per-booking** today; per-head refund needs it to
  accept a head count or `booking_guest_id` (§11).

---

## 9. Safeguarding (D6 — hard gate)

At **check-in** (the moment an `AttendanceRecord(role=GUEST)` is created):
- Guest is a **minor** (DOB implies < 18 at session date) ⇒ `guardian_name`,
  `guardian_phone`, and `waiver_accepted_at` **must** be present, else 400.
- Adult guest ⇒ `full_name` + `phone` sufficient.
- A guest with **no name** can never be checked in (covers the Phase-2
  anonymous-block case: names get filled at the door).

This is a validation gate, not advisory — it's the difference between a feature
and a liability for a swim operation serving children.

---

## 10. Lead funnel (Phase 3)

`booking_guest.phone` makes every guest a tracked lead. `converted_member_id`
closes the loop when they sign up; phone-dedupe recognises repeat guests so
`communications_service` can nudge conversion. This turns the booking system
into member-acquisition — the strongest product argument for doing guests
*as named records* rather than an anonymous integer.

---

## 11. Settled & deferred (Daniel, 2026-06-09)

| # | Question | Decision |
|---|---|---|
| O1 | Pool-cost source of truth — denormalise onto the session at creation, or fetch from pools_service at accrual? | **Settled: denormalise** (snapshot at session creation, matches the existing `pool_fee` pattern). |
| O2 | Capacity count — `CONFIRMED` only, or `CONFIRMED` + unexpired `PENDING`? | **Settled: CONFIRMED + unexpired PENDING** (avoid oversell in the 15-min payment window). |
| O3 | Per-head refund — extend `refund-pool-fee` to take a head count / `booking_guest_id`. | **Settled: in Phase 1** (required for D4 per-swimmer refunds). |
| O4 | Guest surcharge / `group_discount_available`, **and cohort-trial pricing** (comp vs flat, D10). | **Deferred** — v1 charges the member per-head rate for guests; trial pricing decided when Phase 1.5 is scheduled. |
| O5 | "Additional members" case (parent books for member-kids = multi-select booking). | **Deferred / out of scope** (D1) — revisit as its own design. |
| O6 | Frontend: "Add a guest" form (name/phone/minor→guardian+waiver) + party-size stepper; live `per_head × party_size` fee + Bubbles balance check; capacity-aware disable. | **Settled: Phase 1 UI.** |

---

*Implementation note: all model changes are additive (new columns default to the
existing single-booking behaviour, new tables, a relaxed NULL constraint) — fully
backwards-compatible. Generate migrations via `./scripts/db/migrate.sh`; never
hand-write them. Remember to import any new model in the owning service's
`alembic/env.py` and add the table to `SERVICE_TABLES`.*
