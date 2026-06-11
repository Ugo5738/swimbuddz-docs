# Missed Session, Rescheduling & Make-Up Policy — Version 1.2

> **Status:** Active — approved by Daniel (SwimBuddz owner)
> **Effective date:** 2026-05-31
> **Version:** 1.2
> **Applies to:** Individual adult learners (Academy lessons and 1:1 / make-up sessions)
> **Last updated:** 2026-06-07

> **Scope note:** This policy fulfils the "Missed Class Policy" referenced in [Coach Handbook §7.5](../academy/COACH_HANDBOOK.md). It covers the **individual learner**. To move a whole pod's weekly session, see [Pod Operations](../club/POD_OPERATIONS.md). For a coach who needs to miss a session, see Coach Handbook §7.5.

---

## 1. Why this exists

A lesson is booked time — the coach commits that time to teaching, whether one-to-one or alongside a small group. When sessions move at the last minute — or get crammed together — three things suffer: the coach's day, other learners' access, and (most of all) the learner's own progress.

This policy lets the **admin answer the common cases instantly**, without checking with the coach every time. It's firm where it protects people's time, and humane where life in Lagos genuinely gets in the way.

## 2. The principle: space beats cram

Swimming is a motor skill, and adults learn it faster when sessions are **spaced out** rather than bunched. Practise, rest, practise again beats two sessions back-to-back. (See [Adult Learning Principles](../company/ADULT_LEARNING_PRINCIPLES.md).)

So when we reschedule, the goal isn't "find any open slot" — it's "find a **well-spaced** slot." That's why we'll sometimes steer a learner away from the exact day they first asked for.

## 3. Who decides what

The biggest time-saver is one line: **logistics are the admin's call; teaching judgement is the coach's call.** Most requests never need to reach the coach at all.

| Decision | Owner |
|---|---|
| Receiving the request; eligibility (notice, grace) | **Admin** |
| Finding and holding a slot; the calendar | **Admin** |
| Payment, credit, refunds | **Admin** |
| All communication with the learner | **Admin** |
| Whether the coach is free at the proposed time | **Coach** |
| Whether a slot is pedagogically OK (spacing, readiness) | **Coach** |
| Anything outside the written defaults in §4 | **Admin escalates to coach** |

Because §4 puts the spacing rule **in writing**, the admin can decline "Friday right before Saturday" on the spot — no round-trip. The coach is only pulled in for genuine exceptions.

## 4. The rules

**Rescheduling**
- A reschedule always needs a **genuine reason** — it's not a free pass to move sessions around at will. The admin decides whether the reason holds (see §3). Notice and grace decide the *penalty*, not the *entitlement*.
- **With a valid reason and 24 hours' notice or more** → no penalty. Admin offers a well-spaced slot.
- **Less than 24 hours, or a no-show** → the session is **forfeited** (counts as used), unless the grace below applies.

**Grace — the humane bit**
- Each learner gets **one grace per block**: one genuine emergency (illness, traffic, late travel) where a late cancellation or no-show is *not* forfeited and can still be made up.
- Once the grace is used, the forfeit rule applies for the rest of that block.

**Make-up sessions**
- A make-up needn't be a private 1:1 slot — it can be **a place in a suitable session the coach is already running**, if there's room and it fits the learner. Whether a session is a good fit is the coach's call.
- A make-up must be **booked and taken within the same block, or within 14 days** — whichever comes first. Make-ups don't bank up indefinitely.
- A learner may have **one outstanding make-up at a time.** It must be cleared before another is granted.

**Spacing**
- Keep a **minimum of 48 hours** between any one learner's sessions.
- **No back-to-back days** (e.g. Friday + Saturday) unless the **coach** explicitly approves it for that learner.
- A coach may set a different spacing minimum at onboarding (see [Coach Agreement §2.4](../academy/COACH_AGREEMENT.md)); where set, it overrides the 48h default for that coach's learners.

**One channel**
- All scheduling goes through **SwimBuddz admin / the app**. Coaches do **not** make private, off-platform arrangements with learners — it breaks the calendar, hides the record, and (for minors) breaches the [Chat Safeguarding Policy](./CHAT_SAFEGUARDING_POLICY_V1.md). A coach who's asked directly redirects the learner to admin or the app. (Mirrors [Coach Handbook §7.5](../academy/COACH_HANDBOOK.md).)

## 5. Coach quick reference

> **You confirm two things only: _am I free?_ and _is the spacing OK?_ Everything else — eligibility, booking, payment, messaging — is admin's. If a learner asks you to rebook directly, send them to admin.**

## 6. Message templates

Use the [Reliable Partner voice](../company/VOICE_AND_TONE.md): efficient, warm, and always offering the path forward. Personalise — don't paste cold. See also the [WhatsApp Playbook](../community/WHATSAPP_PLAYBOOK.md).

**A. Free reschedule (24h+ notice)**
> No problem at all, [Name] — thanks for letting me know early. 💙 I'll find you a well-spaced slot so it doesn't bunch up against your [day] class, and confirm shortly.

**B. Steering away from a back-to-back day**
> Thanks, [Name]! I'd steer away from [Friday] since it'd sit right on top of your [Saturday] class — your skills settle better with a day or two between sessions. Let me check your coach's open times mid-week and get you a better-spaced slot. 🏊

**C. Late cancellation / no-show — grace used**
> Totally understand, [Name] — life happens. I've used your one make-up for this block to cover it, so you're not charged for the missed session. Let's get it rebooked within the next two weeks. (Heads-up: any further last-minute misses this block would count as used.)

**D. Late cancellation / no-show — grace already used (forfeit)**
> Sorry to hear that, [Name]. As this is the second short-notice change this block, that session counts as used under our scheduling policy — but you're all set for your next one on [date]. See you there! 🌊

*(Lead with the "why" — spacing, fairness — not just the rule. A "no" always comes with the next step.)*

---

**Internal notes (not learner-facing):**

- **Confirmed defaults (Daniel, 2026-05-31):** 24h notice window, 1 grace/block, 14-day make-up window, 1 outstanding make-up, 48h spacing minimum. Sensible starting points — revisit once there's real usage data.
- **Pool fee on forfeit (pool-specific — Daniel, 2026-06-07):** when a session is forfeited (no make-up), whether the learner's per-session pool fee is returned depends on *our* cost with that pool — **flat / committed fee → keep it** (cost is sunk; cost recovery), **per-swimmer not billed for no-shows → refund it** to Bubbles via the accounted `session_booking` path (`POST /sessions/bookings/{id}/refund-pool-fee`), never the "Adjust Bubbles" tool. The forfeited *session* is the behavioural penalty either way; the pool fee just follows cost. Source fields: `Pool.flat_session_fee_ngn` vs `Pool.price_per_swimmer_ngn` (pools_service). Detail + future enforcement: [Availability & Make-Up Design §10](../design/AVAILABILITY_AND_MAKEUP_SCHEDULING_DESIGN.md).
- **Per-coach overrides:** a coach's spacing preference, captured at onboarding under [Coach Agreement §2.4](../academy/COACH_AGREEMENT.md), overrides the 48h default for that coach's learners. Admin applies it without asking.
- **Future platform enforcement** (today this is manual / WhatsApp-era):
  - *Spacing check at booking* → `sessions_service` warns or blocks a booking < 48h from the learner's existing session (or on a back-to-back day) unless coach-overridden.
  - *No-show & forfeit* → `attendance_service` marks the no-show; the forfeit/used-session state derives from it.
  - *Grace + make-up credit* → track the per-block grace and any make-up credit in `wallet_service` (Bubbles) or a dedicated make-up-credit field, so it's auditable instead of living in someone's memory.
- **Acceptance:** consider surfacing a one-line version of §4 at enrollment so learners agree to the forfeit/spacing terms up front (cuts "but nobody told me" friction). This could later become an `agreement_versions` entry like the safeguarding policy.
