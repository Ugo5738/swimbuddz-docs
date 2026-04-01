# SwimBuddz Tier Boundary Policy

*Last updated: April 2026*

## Purpose

This document defines how SwimBuddz handles members from different tiers (Community, Club, Academy) when they show up to sessions outside their tier. Clear boundaries protect the value of each tier while keeping the community welcoming.

---

## Core Principle

**Boundaries are about value, not exclusion.** Every boundary should be framed as protecting the experience for the people in that session, not as punishment for the person being turned away. Always offer the next step.

---

## Session Types and Access Rules

### Academy Sessions
**Access: Enrolled cohort members only**

- Only members enrolled in the specific cohort can attend
- No drop-ins, no guests, no exceptions
- Academy has a curriculum — dropping into week 7 doesn't work pedagogically and is unfair to the cohort

**If a non-enrolled member shows up:**
> "The academy runs in cohorts — everyone starts together and progresses together. The next cohort starts [date]. Want me to put you on the list?"

### Club Sessions
**Access: Active club members only**

- Only members with an active club membership (quarterly, 6-month, or annual) can participate in the structured session
- Community members may swim at the same pool at the same time, but they are not part of the club session
- They don't join the warm-up, don't do the challenge block, don't get tracked on the leaderboard
- No "just this once" exceptions — consistency protects the value for paying club members

**If a community member tries to join the session:**
> "Hey, great to see you! The club session is for club members — we've got a structured programme going and the group is on week [X] of their cycle. You're welcome to swim on your own while we're here, and if you want to join the group properly, I can connect you with [founder] about signing up. We'd love to have you."

**Why this matters:** If community members get the club experience for N20k/year, no one will pay N42.5k/quarter. The boundary protects the product.

### Community / Open Sessions
**Access: Any active member at any tier**

- Community, Club, and Academy members can all attend
- No structure, no tracking, no coaching
- Monthly open swim meetups fall into this category
- This is the release valve — when a community member says "I want to swim with everyone," point them here

### Open Meetups (Monthly)
**Access: Any active member at any tier + guests**

- The one session where all tiers swim together
- No structure, no tier boundaries
- Community members can invite friends (acquisition channel)
- Club and academy members attend too — this is where community members see the full SwimBuddz energy

---

## Scenario Handling Guide

### Scenario 1: Community member swims casually alongside a club session

**Allow it.** They're at the pool, swimming in their own lane, not part of the group. This actually helps conversion — they see the energy, the celebrations, the structure, and they want in.

**The rule:** You're welcome at the pool. You're not in the session.

### Scenario 2: Community member tries to join the club session activities

**Don't allow.** The peer leader redirects warmly but firmly. No ambiguity, no "just this once."

**Escalation:** If it becomes a pattern (same person showing up weekly trying to join), the peer leader flags it to the SwimBuddz team. Founder reaches out personally with an upgrade conversation.

### Scenario 3: Community member shows up to an academy session

**Don't allow.** Academy is cohort-based with a progression plan. Direct them to the next cohort enrollment.

### Scenario 4: Ex-academy grad (now community) shows up to their old cohort's sessions

**Don't allow.** The cohort has moved on. Their spot was for a fixed duration. Redirect to club membership where they can swim every week.

> "You finished the programme! That's amazing. The cohort is continuing with new members now. The club is where you keep swimming every week — want me to help you sign up?"

### Scenario 5: Club member wants to attend an academy session for extra coaching

**Don't allow as a drop-in.** Academy coaching is part of the cohort experience. If a club member wants skill development, they can enroll in the next academy cohort. Academy and club memberships can be held simultaneously.

### Scenario 6: Someone shows up who isn't a member at all

**Welcome them warmly. Don't let them swim.** Take their details, tell them about the next open meetup or academy cohort. If they're clearly keen, let them watch from the side so they can see what it's about.

> "We'd love to have you! The easiest way to get started is [community membership / next academy cohort / open meetup on the 15th]. Let me get your number and I'll send you the details."

---

## How Peer Leaders Enforce Boundaries

### Do:
- Be warm and welcoming — they showed up, that's a good sign
- Be clear and firm — no ambiguity about what's allowed
- Always offer the next step — never just say "no"
- Frame boundaries as value ("the session is designed for this specific group") not cost ("you haven't paid enough")
- Flag repeat boundary-testers to the SwimBuddz team

### Don't:
- Make exceptions ("just this once" destroys the model)
- Be confrontational or gatekeepy
- Discuss pricing at the pool — redirect to the founder or website
- Embarrass anyone in front of the group

---

## System Enforcement

The app should enforce these rules at the sign-in level:

| Session Type | Community | Club | Academy (enrolled) | Academy (not enrolled) | Non-member |
|-------------|-----------|------|--------------------|----------------------|------------|
| Academy Session | ❌ | ❌ | ✅ | ❌ | ❌ |
| Club Session | ❌ | ✅ | ✅ (if also club member) | ❌ | ❌ |
| Open / Community Session | ✅ | ✅ | ✅ | ❌ | ❌ |
| Open Meetup | ✅ | ✅ | ✅ | ❌ | ❌ (guest list) |

**When a member is blocked from signing in, the app should:**
1. Show a friendly message explaining why
2. Show what they *can* do (upcoming open sessions, upgrade path)
3. Never use language like "access denied" or "unauthorized"

**Example app messages:**

- Community member → Club session: "This is a club session for members training together weekly. You can join the club starting at N42.5k/quarter — or catch everyone at the open meetup on [date]!"
- Anyone → Academy session (not enrolled): "This academy cohort started on [date] and follows a structured curriculum. The next cohort opens for enrollment on [date]. Want to be notified?"
- Non-member → Any session: "Welcome to SwimBuddz! Create a membership to sign in to sessions. The community membership starts at N20k/year."

---

## The Monthly Open Meetup: The Release Valve

The open meetup is critical to making boundaries feel fair. It's the answer to every "but I just want to swim with everyone":

- Once a month, all tiers swim together
- Rotating pool locations
- No structure, no coaching, no sign-in tracking
- Community members can bring guests
- Club members are encouraged to attend (keeps it lively)
- Academy cohort members welcome too

**This is where conversions happen organically.** Community members see club groups having fun, ask questions, decide to upgrade. No sales pitch needed.

---

## Review Cycle

Review this policy quarterly. As membership grows, edge cases will emerge. Update this doc and the system rules together — policy and code should always match.
