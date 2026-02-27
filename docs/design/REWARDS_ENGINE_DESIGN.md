# Rewards Engine & Referral System Design

> **Status:** Draft — Awaiting Review
> **Parent System:** Wallet Service (port 8011)
> **Currency:** Bubbles (🫧) — see [WALLET_SERVICE_DESIGN.md](./WALLET_SERVICE_DESIGN.md)
> **Architecture:** Event-driven
> **Date:** February 2026

---

## 1. Overview

The Rewards Engine is an event-driven system that automatically grants Bubbles to members when they perform behaviours SwimBuddz wants to incentivize. It lives within the wallet service and listens for events from all other services.

This document covers:
- **Referral system** — member-to-member invite tracking and rewards
- **Behavioural rewards** — automatic Bubble grants for attendance, spending, community, and academy actions
- **Event-driven architecture** — how services emit events and the rewards engine processes them
- **Admin-configurable rules** — reward amounts and criteria adjustable without code changes

### Design Principles

- **Event-driven, not polling** — services push events; rewards engine reacts in near-real-time
- **Configurable rules** — admins can adjust reward amounts, caps, and criteria without deploying code
- **Idempotent processing** — same event processed twice produces same result (no double rewards)
- **Transparent to members** — every reward shows clearly in transaction history with explanation
- **Anti-abuse first** — every reward has caps, cooldowns, or verification requirements

---

## 2. Incentive Map

### What behaviours does SwimBuddz want to drive?

Every reward should map to a business outcome. If it doesn't drive acquisition, retention, revenue, or community health, it shouldn't grant Bubbles.

### 2.1 Acquisition Behaviours (Bring People In)

| Behaviour | Trigger Event | Reward | Cap | Rationale |
|---|---|---|---|---|
| Refer a friend who qualifies | `referral.qualified` | 15 🫧 referrer, 10 🫧 referee | 50 referrals lifetime per member | Member growth at ~₦0 net acquisition cost |
| Hit 10 successful referrals | `referral.milestone` | 50 🫧 bonus + Ambassador badge | Once per member | Recognise and incentivise power referrers |
| Share event on social media | `event.shared` | 2 🫧 per verified share | 5 per month | Organic reach for events |

### 2.2 Retention Behaviours (Keep People Coming Back)

| Behaviour | Trigger Event | Reward | Cap | Rationale |
|---|---|---|---|---|
| Attend 4 sessions in a calendar month | `attendance.monthly_milestone` | 5 🫧 | 1 per month | Consistency builds habit — 1x/week minimum |
| Attend 8+ sessions in a calendar month | `attendance.monthly_milestone` | 15 🫧 | 1 per month (replaces 4-session reward) | Power user retention |
| Perfect attendance streak (4 consecutive weeks) | `attendance.streak` | 20 🫧 + streak badge | 1 per streak achieved | Long-term commitment recognition |
| Return after 30+ days inactive | `member.reactivated` | 10 🫧 "Welcome back!" | 2 per year | Win-back incentive |
| Renew membership tier | `membership.renewed` | 10 🫧 | 1 per renewal | Revenue retention — reduces churn at renewal point |

### 2.3 Community Behaviours (Make the Community Better)

| Behaviour | Trigger Event | Reward | Cap | Rationale |
|---|---|---|---|---|
| Volunteer at event | `volunteer.completed` (admin-confirmed) | 15–25 🫧 per event | No cap | Reduces operational cost; amount set per event by admin |
| Coach a beginner session (non-coach member) | `volunteer.peer_coaching` (admin-confirmed) | 10 🫧 | 4 per month | Peer support and mentoring culture |
| Write a content tip/post (approved) | `content.published` | 5 🫧 per approved post | 4 per month | Community-generated content |
| Ride-share driver (bring others to pool) | `transport.ride_completed` | 3 🫧 per passenger | 20 per month | Reduces transport friction; key for Lagos |
| Report a safety concern | `safety.report_confirmed` (admin-confirmed) | 5 🫧 | No cap | Pool safety is non-negotiable |

### 2.4 Spending Behaviours (Increase Revenue)

| Behaviour | Trigger Event | Reward | Cap | Rationale |
|---|---|---|---|---|
| First Bubble topup ever | `topup.first` | 10 🫧 bonus | Once per member | Wallet activation — "you topped up, here's a thank you" |
| Large topup (200+ 🫧 at once) | `topup.completed` | 5 🫧 bonus | 1 per month | Higher ARPU, better Paystack fee economics |
| First store purchase ever | `store.first_purchase` | 3 🫧 | Once per member | Cross-service spending — discover the store |
| Upgrade to higher tier | `membership.upgraded` | 15 🫧 | Once per upgrade path | Revenue per member; celebrate the commitment |

### 2.5 Academy Behaviours (Educational Outcomes)

| Behaviour | Trigger Event | Reward | Cap | Rationale |
|---|---|---|---|---|
| Complete a cohort program (graduation) | `academy.graduated` | 25 🫧 + certificate | Once per program | Graduation is the product — celebrate and incentivise completion |
| Pass a skill assessment milestone | `academy.milestone_passed` | 5 🫧 per milestone | Per milestone (natural cap) | Progress tracking and motivation |
| Perfect cohort attendance | `academy.perfect_attendance` | 15 🫧 | Once per cohort | Commitment to the learning program |

---

## 3. Event-Driven Architecture

### 3.1 How It Works

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Attendance   │     │  Academy    │     │   Store     │
│  Service     │     │  Service    │     │  Service    │
└──────┬───────┘     └──────┬──────┘     └──────┬──────┘
       │                    │                    │
       │ POST /internal/    │ POST /internal/    │ POST /internal/
       │ wallet/events      │ wallet/events      │ wallet/events
       │                    │                    │
       └────────────┬───────┴────────────┬───────┘
                    │                    │
              ┌─────▼────────────────────▼─────┐
              │        Wallet Service           │
              │                                 │
              │  ┌───────────────────────────┐  │
              │  │     Event Ingestion       │  │
              │  │  (validate, deduplicate)   │  │
              │  └────────────┬──────────────┘  │
              │               │                 │
              │  ┌────────────▼──────────────┐  │
              │  │     Rewards Engine        │  │
              │  │  (match event → rules)    │  │
              │  └────────────┬──────────────┘  │
              │               │                 │
              │  ┌────────────▼──────────────┐  │
              │  │     Wallet Operations     │  │
              │  │  (credit Bubbles, log)    │  │
              │  └───────────────────────────┘  │
              └─────────────────────────────────┘
```

### 3.2 Event Format

All services emit events to the wallet service via a single internal endpoint:

```
POST /internal/wallet/events
```

**Event payload:**

```json
{
  "event_type": "attendance.session_attended",
  "event_id": "evt-uuid-here",
  "member_auth_id": "supabase-auth-id",
  "member_id": "member-uuid",
  "service_source": "attendance_service",
  "occurred_at": "2026-02-17T10:30:00Z",
  "data": {
    "session_id": "session-uuid",
    "session_name": "Morning Swim",
    "pool_name": "Yaba Pool",
    "attendance_count_this_month": 5
  },
  "idempotency_key": "att-session-{session_id}-{member_id}"
}
```

**Required fields:**
- `event_type` — dot-notation string identifying the event
- `event_id` — unique ID for this event (UUID, generated by source service)
- `member_auth_id` — who this event is about
- `service_source` — which service emitted it
- `occurred_at` — when the event happened (not when it was received)
- `idempotency_key` — prevents duplicate processing

**Optional fields:**
- `member_id` — internal member UUID (if available)
- `data` — event-specific context (JSONB, varies by event type)

### 3.3 Event Types

Complete registry of events the rewards engine listens for:

**Attendance Service:**
```
attendance.session_attended     — member checked in to a session
attendance.no_show              — member missed a session they registered for
attendance.monthly_milestone    — member hit 4 or 8 sessions in a month
attendance.streak               — member achieved a consecutive-week streak
```

**Academy Service:**
```
academy.enrolled                — member enrolled in a cohort
academy.milestone_passed        — member passed a skill milestone
academy.graduated               — member completed a cohort program
academy.perfect_attendance      — member had perfect attendance in cohort
```

**Store Service:**
```
store.purchase_completed        — member completed a store order
store.first_purchase            — member's first-ever store purchase
```

**Transport Service:**
```
transport.ride_completed        — ride-share driver completed a ride
```

**Events Service:**
```
event.rsvp_confirmed            — member RSVP'd to an event
event.shared                    — member shared an event on social media
```

**Members Service:**
```
member.registered               — new member completed registration
member.reactivated              — member returned after 30+ days
membership.renewed              — member renewed their tier
membership.upgraded             — member upgraded to a higher tier
```

**Payments Service:**
```
topup.completed                 — Bubble topup completed successfully
topup.first                     — member's first-ever topup
```

**Communications Service:**
```
content.published               — member's content post was approved
```

**Admin (Manual):**
```
volunteer.completed             — admin confirmed member volunteered at event
volunteer.peer_coaching          — admin confirmed member coached a session
safety.report_confirmed          — admin confirmed a valid safety report
```

### 3.4 Event Processing Pipeline

```python
async def process_event(event: WalletEvent, db: AsyncSession):
    # 1. Deduplicate — check if event_id already processed
    if await is_event_processed(db, event.event_id):
        return  # Already handled

    # 2. Record event receipt
    await record_event(db, event)

    # 3. Find matching active reward rules
    matching_rules = await get_matching_rules(db, event.event_type)

    for rule in matching_rules:
        # 4. Check eligibility (caps, cooldowns, conditions)
        if not await is_eligible(db, event.member_auth_id, rule):
            continue

        # 5. Evaluate rule conditions against event data
        if not evaluate_conditions(rule.trigger_config, event.data):
            continue

        # 6. Grant reward (uses existing wallet credit operation)
        await credit_wallet(
            db=db,
            member_auth_id=event.member_auth_id,
            amount=rule.reward_bubbles,
            idempotency_key=f"reward-{rule.id}-{event.event_id}",
            transaction_type=TransactionType.REWARD,
            description=rule.render_description(event.data),
            service_source="rewards_engine",
            reference_type="reward_rule",
            reference_id=str(rule.id),
            metadata={
                "rule_name": rule.rule_name,
                "event_type": event.event_type,
                "event_id": str(event.event_id),
            }
        )

        # 7. Update member's reward history (for cap tracking)
        await record_reward_granted(db, event.member_auth_id, rule.id)

    # 8. Mark event as processed
    await mark_event_processed(db, event.event_id)
```

---

## 4. Data Model

### 4.1 RewardRule

Admin-configurable rules that define when and how Bubbles are granted.

```
Table: reward_rules
├── id: UUID (PK)
├── rule_name: str (unique) — machine name e.g., "monthly_attendance_4"
├── display_name: str — human-readable e.g., "Monthly Swim Streak (4 sessions)"
├── description: str — admin description of what this rule does
├── event_type: str (indexed) — which event triggers this rule e.g., "attendance.monthly_milestone"
├── trigger_config: JSONB — conditions to evaluate against event.data
│   e.g., {"min_sessions": 4, "max_sessions": 7}  (4-7 sessions = this tier)
│   e.g., {"min_sessions": 8}  (8+ sessions = higher tier)
│   e.g., {"min_amount": 200}  (topup of 200+ Bubbles)
├── reward_bubbles: int — how many Bubbles to grant
├── reward_description_template: str — template for transaction description
│   e.g., "Reward — attended {attendance_count_this_month} sessions this month (5 🫧)"
├── max_per_member_lifetime: int | null — total times a member can earn this (null = unlimited)
├── max_per_member_per_period: int | null — times per period (null = unlimited)
├── period: RewardPeriod enum | null — [day, week, month, year] (null if no period cap)
├── replaces_rule_id: UUID | null — if this rule supersedes another (e.g., 8-session replaces 4-session)
├── category: RewardCategory enum — [acquisition, retention, community, spending, academy]
├── is_active: bool (default true) — admin can disable without deleting
├── priority: int (default 0) — processing order when multiple rules match same event
├── requires_admin_confirmation: bool (default false) — for volunteer/safety events
├── created_by: str — admin auth_id who created the rule
├── created_at: datetime
├── updated_at: datetime
```

**Constraints:**
- `UNIQUE (rule_name)` — no duplicate rule names
- `CHECK (reward_bubbles > 0)`
- Index on `(event_type, is_active)` for fast rule lookup

### 4.2 WalletEvent

Ingested events from all services. Serves as audit trail and deduplication.

```
Table: wallet_events
├── id: UUID (PK)
├── event_id: UUID (unique, indexed) — source event ID for deduplication
├── event_type: str (indexed) — e.g., "attendance.session_attended"
├── member_auth_id: str (indexed)
├── member_id: UUID | null
├── service_source: str — which service emitted this event
├── occurred_at: datetime — when the event happened
├── received_at: datetime — when wallet service received it
├── event_data: JSONB — full event.data payload
├── idempotency_key: str (unique, indexed)
├── processed: bool (default false)
├── processed_at: datetime | null
├── rewards_granted: int (default 0) — how many reward rules fired
├── processing_error: str | null — if processing failed
├── created_at: datetime
```

**Constraints:**
- `UNIQUE (event_id)` — prevents duplicate event ingestion
- `UNIQUE (idempotency_key)` — prevents duplicate processing
- Index on `(processed, created_at)` for retry queue

### 4.3 MemberRewardHistory

Tracks which rewards each member has received, for cap enforcement.

```
Table: member_reward_history
├── id: UUID (PK)
├── member_auth_id: str (indexed)
├── rule_id: UUID (FK → reward_rules.id, indexed)
├── event_id: UUID (FK → wallet_events.id)
├── transaction_id: UUID (FK → wallet_transactions.id) — the actual credit transaction
├── bubbles_granted: int
├── period_key: str | null — e.g., "2026-02" for monthly caps, "2026-W07" for weekly
├── created_at: datetime
```

**Constraints:**
- Composite index on `(member_auth_id, rule_id, period_key)` for fast cap checks

### 4.4 ReferralRecord (moved from wallet, expanded)

```
Table: referral_records
├── id: UUID (PK)
├── referrer_wallet_id: UUID (FK → wallets.id, indexed)
├── referrer_auth_id: str (indexed)
├── referrer_member_id: UUID | null
├── referee_wallet_id: UUID | null (FK → wallets.id)
├── referee_auth_id: str | null
├── referee_member_id: UUID | null
├── referral_code: str (unique, indexed) — e.g., "SB-JOHN-2X4K"
├── status: ReferralStatus enum [pending, registered, qualified, rewarded, expired, cancelled]
├── referee_registered_at: datetime | null — when referee completed registration
├── referee_qualified_at: datetime | null — when referee met qualification criteria
├── qualification_trigger: str | null — what triggered qualification ("first_topup" or "membership_payment")
├── referrer_reward_bubbles: int | null — Bubbles awarded to referrer
├── referee_reward_bubbles: int | null — Bubbles awarded to referee
├── referrer_transaction_id: UUID | null — FK to wallet_transaction
├── referee_transaction_id: UUID | null — FK to wallet_transaction
├── qualification_criteria: JSONB — what the referee must do
│   default: {"trigger": "first_payment", "description": "First membership payment or first Bubble topup (min 25 🫧)"}
├── metadata: JSONB | null
├── expires_at: datetime | null — when this referral link expires
├── created_at: datetime
├── updated_at: datetime
```

**Constraints:**
- `UNIQUE (referral_code)`
- Index on `(referrer_auth_id, status)` for referral stats
- Index on `(referee_auth_id)` for lookup during qualification

**Status lifecycle:**
```
pending → registered → qualified → rewarded
                    ↘ expired
                    ↘ cancelled
```

- `pending` — code generated, nobody has used it yet
- `registered` — referee signed up using the code, hasn't qualified yet
- `qualified` — referee made first payment (topup or membership), rewards pending
- `rewarded` — Bubbles distributed to both parties
- `expired` — code expired (90 days inactive) or referee never qualified
- `cancelled` — manually cancelled by admin

### 4.5 ReferralCode

Separate table for code management (a member can have one active code, but historical codes are preserved).

```
Table: referral_codes
├── id: UUID (PK)
├── wallet_id: UUID (FK → wallets.id, indexed)
├── member_auth_id: str (indexed)
├── code: str (unique, indexed) — e.g., "SB-JOHN-2X4K"
├── is_active: bool (default true)
├── total_uses: int (default 0) — how many times this code was used for registration
├── successful_referrals: int (default 0) — how many qualified
├── last_used_at: datetime | null
├── expires_at: datetime | null — 90 days from last use or creation
├── created_at: datetime
```

**Constraints:**
- One active code per wallet: `UNIQUE (wallet_id) WHERE is_active = true`

---

## 5. Referral System

### 5.1 Referral Code Format

**Pattern:** `SB-{FIRST_NAME}-{4_ALPHANUMERIC}`

Examples:
- `SB-JOHN-2X4K`
- `SB-CHIOMA-9B7P`
- `SB-ADE-M3R2`

**Rules:**
- First name truncated to 8 characters, uppercased
- 4-character alphanumeric suffix (no ambiguous characters: no 0/O, 1/I/L)
- Regeneratable if compromised (old code deactivated, new one issued)
- Shareable link: `swimbuddz.com/join?ref=SB-JOHN-2X4K`

### 5.2 Referral Flow

```
1. REFERRER generates code:
   GET /api/v1/wallet/referral/code
   → Returns existing active code or generates new one
   → Response: { code: "SB-JOHN-2X4K", link: "swimbuddz.com/join?ref=SB-JOHN-2X4K", stats: {...} }

2. REFERRER shares via WhatsApp / SMS / copy link

3. REFEREE clicks link → lands on /register?ref=SB-JOHN-2X4K
   → Referral code pre-filled in registration form
   → Shows: "Invited by John! Sign up and top up to earn bonus Bubbles 🫧"

4. REFEREE completes registration
   → Members service includes referral_code in wallet creation call:
     POST /internal/wallet/create { member_id, member_auth_id, referral_code: "SB-JOHN-2X4K" }
   → Wallet service: creates wallet, grants 10 🫧 welcome bonus
   → Wallet service: creates ReferralRecord (status: registered)
   → Wallet service: increments referral_codes.total_uses
   → Notifies referrer: "{name} just joined! They need to make their first payment to unlock both your rewards."

5. QUALIFICATION TRIGGER — referee does ONE of:
   a. Makes first Bubble topup (min 25 🫧) → event: topup.first
   b. Makes first membership payment → event: membership.payment_completed (for any tier)
   Whichever comes first.

6. REWARDS DISTRIBUTED
   → Wallet service detects qualification via event
   → Updates ReferralRecord (status: qualified → rewarded)
   → Credits referrer: +15 🫧 (transaction type: referral_credit)
   → Credits referee: +10 🫧 (transaction type: referral_credit)
   → Notifies referrer: "You earned 15 🫧! {name} made their first payment."
   → Notifies referee: "Bonus! 10 extra 🫧 — thanks for joining through {referrer_name}'s invite."
```

### 5.3 Referral Rewards

| Party | Amount | When | Transaction Description |
|---|---|---|---|
| Referrer | 15 🫧 | Referee qualifies | `Referral reward — {referee_name} joined (15 🫧)` |
| Referee | 10 🫧 | Self qualifies | `Referral bonus — invited by {referrer_name} (10 🫧)` |
| Referrer (milestone) | 50 🫧 | 10th successful referral | `Ambassador bonus — 10 successful referrals! (50 🫧)` |

**Total cost per successful referral: 25 🫧 (₦2,500)**

Net acquisition cost: effectively ₦0 — the referee's first topup (min ₦2,500) covers the reward cost.

### 5.4 Referral New Member Journey (Complete)

```
Referee's wallet after full flow:
  10 🫧  — welcome bonus (on registration)
+ 25 🫧  — first topup (minimum)
+ 10 🫧  — referral bonus (on qualification)
= 45 🫧  — enough for 2 standard pool sessions (21 🫧 each) with 3 🫧 left

Compare to non-referred member:
  10 🫧  — welcome bonus
+ 25 🫧  — first topup
= 35 🫧  — enough for 1 standard session (21 🫧) with 14 🫧 left
```

The referred member gets one extra session — a tangible difference that makes the referral code feel valuable.

### 5.5 Anti-Abuse Rules

| Rule | Implementation | Rationale |
|---|---|---|
| Max 50 successful referrals per member | `referral_codes.successful_referrals <= 50` | Prevents industrial-scale farming |
| Referrer and referee can't share email domain (corporate) | Check email domain at registration; skip for common domains (gmail, yahoo, outlook, hotmail) | Prevents self-referral with work aliases |
| Referee must be genuinely new | No existing `Member` record with same email | Prevents "quit and rejoin" cycles |
| Referral code expires 90 days from last use | `referral_codes.expires_at` updated on each use | Keeps codes fresh, removes stale referrers |
| Referee can only apply ONE referral code | One `ReferralRecord` per `referee_auth_id` | No stacking of multiple referral rewards |
| Referrer's wallet must be active | Check `wallet.status == ACTIVE` before granting | Frozen accounts don't accumulate rewards |
| Same IP/device limit | Rate limit: max 3 registrations per IP per day | Prevents bot-driven mass registration |
| Referrer must have completed onboarding | Check `member.registration_complete == true` | Only real members can refer |

---

## 6. Reward Rules Configuration

### 6.1 Default Rules (Seeded on Deploy)

```python
DEFAULT_REWARD_RULES = [
    # --- ACQUISITION ---
    {
        "rule_name": "referral_qualified",
        "display_name": "Referral Reward",
        "event_type": "referral.qualified",
        "trigger_config": {},
        "reward_bubbles": 15,  # Referrer gets 15
        "reward_description_template": "Referral reward — {referee_name} joined ({amount} 🫧)",
        "max_per_member_lifetime": 50,
        "category": "acquisition",
    },
    {
        "rule_name": "referral_referee_bonus",
        "display_name": "Referral Welcome Bonus",
        "event_type": "referral.qualified",
        "trigger_config": {"target": "referee"},
        "reward_bubbles": 10,  # Referee gets 10
        "reward_description_template": "Referral bonus — invited by {referrer_name} ({amount} 🫧)",
        "max_per_member_lifetime": 1,
        "category": "acquisition",
    },
    {
        "rule_name": "referral_ambassador_10",
        "display_name": "Ambassador Milestone (10 referrals)",
        "event_type": "referral.milestone",
        "trigger_config": {"milestone_count": 10},
        "reward_bubbles": 50,
        "reward_description_template": "Ambassador bonus — 10 successful referrals! ({amount} 🫧)",
        "max_per_member_lifetime": 1,
        "category": "acquisition",
    },
    {
        "rule_name": "event_social_share",
        "display_name": "Event Social Share",
        "event_type": "event.shared",
        "trigger_config": {},
        "reward_bubbles": 2,
        "reward_description_template": "Reward — shared {event_name} on social media ({amount} 🫧)",
        "max_per_member_per_period": 5,
        "period": "month",
        "category": "acquisition",
    },

    # --- RETENTION ---
    {
        "rule_name": "monthly_attendance_4",
        "display_name": "Monthly Swim Streak (4 sessions)",
        "event_type": "attendance.monthly_milestone",
        "trigger_config": {"min_sessions": 4, "max_sessions": 7},
        "reward_bubbles": 5,
        "reward_description_template": "Reward — attended {session_count} sessions this month ({amount} 🫧)",
        "max_per_member_per_period": 1,
        "period": "month",
        "category": "retention",
    },
    {
        "rule_name": "monthly_attendance_8",
        "display_name": "Monthly Swim Streak (8+ sessions)",
        "event_type": "attendance.monthly_milestone",
        "trigger_config": {"min_sessions": 8},
        "reward_bubbles": 15,
        "reward_description_template": "Reward — attended {session_count} sessions this month ({amount} 🫧)",
        "max_per_member_per_period": 1,
        "period": "month",
        "replaces_rule_id": "monthly_attendance_4",  # Supersedes the 4-session reward
        "category": "retention",
    },
    {
        "rule_name": "attendance_streak_4_weeks",
        "display_name": "4-Week Attendance Streak",
        "event_type": "attendance.streak",
        "trigger_config": {"min_consecutive_weeks": 4},
        "reward_bubbles": 20,
        "reward_description_template": "Reward — {streak_weeks}-week attendance streak! ({amount} 🫧)",
        "max_per_member_lifetime": None,  # Can earn multiple times (new streaks)
        "category": "retention",
    },
    {
        "rule_name": "member_reactivation",
        "display_name": "Welcome Back Bonus",
        "event_type": "member.reactivated",
        "trigger_config": {"min_inactive_days": 30},
        "reward_bubbles": 10,
        "reward_description_template": "Welcome back! Thanks for returning to SwimBuddz ({amount} 🫧)",
        "max_per_member_per_period": 1,
        "period": "year",
        "max_per_member_lifetime": 2,
        "category": "retention",
    },
    {
        "rule_name": "membership_renewal",
        "display_name": "Membership Renewal Bonus",
        "event_type": "membership.renewed",
        "trigger_config": {},
        "reward_bubbles": 10,
        "reward_description_template": "Reward — membership renewed ({amount} 🫧)",
        "max_per_member_per_period": 1,
        "period": "year",
        "category": "retention",
    },

    # --- COMMUNITY ---
    {
        "rule_name": "volunteer_event",
        "display_name": "Event Volunteer Reward",
        "event_type": "volunteer.completed",
        "trigger_config": {},
        "reward_bubbles": 20,  # Default; admin sets per event via event.data.reward_override
        "reward_description_template": "Volunteer reward — {event_name} ({amount} 🫧)",
        "requires_admin_confirmation": True,
        "category": "community",
    },
    {
        "rule_name": "peer_coaching",
        "display_name": "Peer Coaching Reward",
        "event_type": "volunteer.peer_coaching",
        "trigger_config": {},
        "reward_bubbles": 10,
        "reward_description_template": "Reward — peer coaching session ({amount} 🫧)",
        "max_per_member_per_period": 4,
        "period": "month",
        "requires_admin_confirmation": True,
        "category": "community",
    },
    {
        "rule_name": "content_published",
        "display_name": "Content Contribution Reward",
        "event_type": "content.published",
        "trigger_config": {},
        "reward_bubbles": 5,
        "reward_description_template": "Reward — published \"{post_title}\" ({amount} 🫧)",
        "max_per_member_per_period": 4,
        "period": "month",
        "category": "community",
    },
    {
        "rule_name": "rideshare_driver",
        "display_name": "Ride-Share Driver Reward",
        "event_type": "transport.ride_completed",
        "trigger_config": {},
        "reward_bubbles": 3,  # Per passenger
        "reward_description_template": "Reward — ride share to {pool_name}, {passenger_count} passengers ({amount} 🫧)",
        "max_per_member_per_period": 20,
        "period": "month",
        "category": "community",
    },
    {
        "rule_name": "safety_report",
        "display_name": "Safety Report Reward",
        "event_type": "safety.report_confirmed",
        "trigger_config": {},
        "reward_bubbles": 5,
        "reward_description_template": "Reward — safety concern reported and confirmed ({amount} 🫧)",
        "requires_admin_confirmation": True,
        "category": "community",
    },

    # --- SPENDING ---
    {
        "rule_name": "first_topup",
        "display_name": "First Topup Bonus",
        "event_type": "topup.first",
        "trigger_config": {},
        "reward_bubbles": 10,
        "reward_description_template": "First topup bonus — welcome to Bubbles! ({amount} 🫧)",
        "max_per_member_lifetime": 1,
        "category": "spending",
    },
    {
        "rule_name": "large_topup",
        "display_name": "Large Topup Bonus",
        "event_type": "topup.completed",
        "trigger_config": {"min_amount": 200},
        "reward_bubbles": 5,
        "reward_description_template": "Reward — large topup bonus ({amount} 🫧)",
        "max_per_member_per_period": 1,
        "period": "month",
        "category": "spending",
    },
    {
        "rule_name": "first_store_purchase",
        "display_name": "First Store Purchase Bonus",
        "event_type": "store.first_purchase",
        "trigger_config": {},
        "reward_bubbles": 3,
        "reward_description_template": "Reward — first store purchase ({amount} 🫧)",
        "max_per_member_lifetime": 1,
        "category": "spending",
    },
    {
        "rule_name": "tier_upgrade",
        "display_name": "Tier Upgrade Bonus",
        "event_type": "membership.upgraded",
        "trigger_config": {},
        "reward_bubbles": 15,
        "reward_description_template": "Reward — upgraded to {new_tier} ({amount} 🫧)",
        "max_per_member_lifetime": None,  # Can earn for each upgrade path
        "category": "spending",
    },

    # --- ACADEMY ---
    {
        "rule_name": "academy_graduation",
        "display_name": "Academy Graduation Reward",
        "event_type": "academy.graduated",
        "trigger_config": {},
        "reward_bubbles": 25,
        "reward_description_template": "Congratulations! Graduated from {program_name} ({amount} 🫧)",
        "max_per_member_lifetime": None,  # Once per program
        "category": "academy",
    },
    {
        "rule_name": "academy_milestone",
        "display_name": "Academy Skill Milestone",
        "event_type": "academy.milestone_passed",
        "trigger_config": {},
        "reward_bubbles": 5,
        "reward_description_template": "Milestone — {milestone_name} achieved ({amount} 🫧)",
        "category": "academy",
    },
    {
        "rule_name": "academy_perfect_attendance",
        "display_name": "Academy Perfect Attendance",
        "event_type": "academy.perfect_attendance",
        "trigger_config": {},
        "reward_bubbles": 15,
        "reward_description_template": "Perfect attendance — {program_name}, {cohort_name} ({amount} 🫧)",
        "max_per_member_lifetime": None,  # Once per cohort
        "category": "academy",
    },
]
```

### 6.2 How Admins Manage Rules

**Admin dashboard tab: `/admin/wallet` → Rewards tab**

| Column | Description |
|---|---|
| Rule Name | Display name |
| Event Type | What triggers it |
| Reward | 🫧 amount |
| Category | Acquisition / Retention / Community / Spending / Academy |
| Cap | Lifetime / per-period limit |
| Status | Active / Inactive |
| Times Triggered | Total times this rule has granted rewards |
| Actions | Edit, Activate/Deactivate |

**Edit modal allows changing:**
- `reward_bubbles` — adjust reward amount
- `max_per_member_lifetime` — adjust cap
- `max_per_member_per_period` — adjust period cap
- `is_active` — enable/disable
- `trigger_config` — adjust conditions (advanced)

**Cannot change via admin UI:**
- `event_type` — requires code change (new event integration)
- `rule_name` — immutable identifier

**Audit:** All rule changes logged in `wallet_audit_logs` with old/new values.

---

## 7. Enums (Additions)

```python
class RewardCategory(str, Enum):
    ACQUISITION = "acquisition"
    RETENTION = "retention"
    COMMUNITY = "community"
    SPENDING = "spending"
    ACADEMY = "academy"

class RewardPeriod(str, Enum):
    DAY = "day"
    WEEK = "week"
    MONTH = "month"
    YEAR = "year"

class ReferralStatus(str, Enum):
    PENDING = "pending"          # Code generated, not yet used
    REGISTERED = "registered"    # Referee signed up, hasn't qualified
    QUALIFIED = "qualified"      # Referee met criteria, rewards pending processing
    REWARDED = "rewarded"        # Bubbles distributed to both parties
    EXPIRED = "expired"          # Code expired or referee never qualified
    CANCELLED = "cancelled"      # Manually cancelled by admin
```

---

## 8. API Endpoints

### 8.1 Event Ingestion (Internal — Service-to-Service)

```
POST   /internal/wallet/events              → Submit an event for rewards processing
```

Payload: see Section 3.2 Event Format.

Response:
```json
{
  "event_id": "...",
  "accepted": true,
  "rewards_granted": 2,
  "rewards": [
    {"rule_name": "monthly_attendance_4", "bubbles": 5},
    {"rule_name": "first_topup", "bubbles": 10}
  ]
}
```

### 8.2 Referral Endpoints (Member — Auth Required)

```
GET    /wallet/referral/code               → Get my referral code (generate if none exists)
GET    /wallet/referral/stats              → My referral stats
POST   /wallet/referral/apply              → Apply a referral code (during registration)
GET    /wallet/referral/history            → List my referrals with status
```

**GET /wallet/referral/code response:**
```json
{
  "code": "SB-JOHN-2X4K",
  "link": "https://swimbuddz.com/join?ref=SB-JOHN-2X4K",
  "share_text": "Join me on SwimBuddz! Use my code SB-JOHN-2X4K and we both earn Bubbles 🫧 https://swimbuddz.com/join?ref=SB-JOHN-2X4K",
  "stats": {
    "total_invited": 12,
    "total_qualified": 8,
    "total_bubbles_earned": 120,
    "remaining_referrals": 42
  }
}
```

**GET /wallet/referral/stats response:**
```json
{
  "total_referrals_sent": 12,
  "registered": 10,
  "qualified": 8,
  "pending": 2,
  "total_bubbles_earned": 170,
  "is_ambassador": false,
  "referrals_to_ambassador": 2,
  "max_referrals": 50,
  "remaining_referrals": 42
}
```

### 8.3 Rewards Admin Endpoints (Admin Auth Required)

```
# Reward Rules
GET    /wallet/admin/rewards/rules         → List all reward rules
GET    /wallet/admin/rewards/rules/{id}    → Get rule details + usage stats
PATCH  /wallet/admin/rewards/rules/{id}    → Update rule (amount, caps, active status)

# Reward Events
GET    /wallet/admin/rewards/events        → List processed events (filterable)
GET    /wallet/admin/rewards/events/failed → List events that failed processing

# Reward Stats
GET    /wallet/admin/rewards/stats         → Rewards dashboard stats

# Referral Admin
GET    /wallet/admin/referrals             → List all referral records
GET    /wallet/admin/referrals/stats       → Referral program stats
PATCH  /wallet/admin/referrals/{id}        → Update referral (cancel, manually qualify)

# Manual Event Submission (for admin-confirmed events)
POST   /wallet/admin/rewards/confirm-event → Admin submits volunteer/safety events
```

**GET /wallet/admin/rewards/stats response:**
```json
{
  "period": "2026-02",
  "total_rewards_granted": 1250,
  "total_bubbles_distributed": 8750,
  "by_category": {
    "acquisition": {"count": 45, "bubbles": 675},
    "retention": {"count": 320, "bubbles": 2400},
    "community": {"count": 85, "bubbles": 1200},
    "spending": {"count": 200, "bubbles": 1475},
    "academy": {"count": 30, "bubbles": 400}
  },
  "top_rules": [
    {"rule_name": "monthly_attendance_4", "count": 180, "bubbles": 900},
    {"rule_name": "first_topup", "count": 120, "bubbles": 1200}
  ],
  "referral_stats": {
    "codes_generated": 250,
    "registrations": 85,
    "qualified": 62,
    "total_bubbles": 1550,
    "conversion_rate": 0.73
  }
}
```

---

## 9. Service Integration Requirements

### What Each Service Must Do

For the rewards engine to work, each service must emit events at the right moments. Here's what needs to change in each service:

### 9.1 Attendance Service

**Emit events:**
- `attendance.session_attended` — on successful check-in
- `attendance.no_show` — when marking no-show
- `attendance.monthly_milestone` — end of month (or on 4th/8th session), include `session_count`
- `attendance.streak` — when detecting consecutive-week attendance, include `streak_weeks`

**Implementation:**
After recording attendance, call:
```python
await internal_post(
    service_url=settings.WALLET_SERVICE_URL,
    path="/internal/wallet/events",
    calling_service="attendance",
    json={
        "event_type": "attendance.session_attended",
        "event_id": str(uuid4()),
        "member_auth_id": member.auth_id,
        "service_source": "attendance_service",
        "occurred_at": utc_now().isoformat(),
        "data": {
            "session_id": str(session.id),
            "session_name": session.name,
            "pool_name": session.pool_name,
            "attendance_count_this_month": monthly_count
        },
        "idempotency_key": f"att-{session.id}-{member.id}"
    }
)
```

**Milestone detection:** The attendance service already tracks monthly counts. Add logic to emit `attendance.monthly_milestone` when count crosses 4 or 8. Streak detection requires tracking consecutive weeks with at least one session.

### 9.2 Academy Service

**Emit events:**
- `academy.enrolled` — on enrollment confirmation
- `academy.milestone_passed` — when recording milestone completion
- `academy.graduated` — on cohort completion/graduation
- `academy.perfect_attendance` — on cohort completion if attendance was perfect

### 9.3 Store Service

**Emit events:**
- `store.purchase_completed` — on order completion
- `store.first_purchase` — on first-ever order (check if member has prior orders)

### 9.4 Transport Service

**Emit events:**
- `transport.ride_completed` — when ride is marked complete, include `passenger_count`

### 9.5 Events Service

**Emit events:**
- `event.rsvp_confirmed` — on RSVP
- `event.shared` — when member shares event (requires frontend share tracking)

### 9.6 Members Service

**Emit events:**
- `member.registered` — on registration complete (already calls wallet for creation)
- `member.reactivated` — when member returns after 30+ days (detect on login/activity)
- `membership.renewed` — on tier renewal payment
- `membership.upgraded` — on tier upgrade payment
- `membership.payment_completed` — on any membership payment (used for referral qualification)

### 9.7 Payments Service

**Emit events:**
- `topup.completed` — on Bubble topup completion (already communicates with wallet)
- `topup.first` — on first-ever topup (wallet service can detect this internally)

### 9.8 Communications Service

**Emit events:**
- `content.published` — when member's content post is approved

### 9.9 Admin Events (Manual via Admin Dashboard)

Admin submits these manually via the admin dashboard:
- `volunteer.completed` — confirm member volunteered at event
- `volunteer.peer_coaching` — confirm member coached a session
- `safety.report_confirmed` — confirm a valid safety report

---

## 10. Communication Touchpoints

### 10.1 Referral Notifications

| Event | Recipient | Channel | Message |
|---|---|---|---|
| Referral code generated | Referrer | In-app | "Your referral code is SB-JOHN-2X4K. Share it with friends!" |
| Referee signs up | Referrer | Email + In-app | "Your friend {name} just joined SwimBuddz! They need to make their first payment to unlock both your rewards." |
| Referee qualifies (rewards distributed) | Referrer | Email + In-app | "You earned 15 🫧! Your friend {name} made their first payment. Thanks for spreading the word!" |
| Referee qualifies (rewards distributed) | Referee | Email + In-app | "Bonus! 10 extra 🫧 added — thanks for joining through {referrer_name}'s invite." |
| Referrer hits 10 referrals | Referrer | Email | "You've referred 10 swimmers! You're a SwimBuddz Ambassador 🏊 +50 🫧 bonus!" |
| Referral code expiring | Referrer | Email | "Your referral code hasn't been used in a while. Share it before it expires!" |

### 10.2 Reward Notifications

| Event | Recipient | Channel | Message |
|---|---|---|---|
| Attendance milestone (4 sessions) | Member | In-app | "Nice streak! 4 sessions this month — here's 5 🫧" |
| Attendance milestone (8+ sessions) | Member | In-app | "Power swimmer! 8+ sessions this month — here's 15 🫧" |
| Attendance streak (4 weeks) | Member | Email + In-app | "4-week streak! You've been consistent — here's 20 🫧 🔥" |
| Welcome back (reactivation) | Member | Email + In-app | "Welcome back! We missed you — here's 10 🫧 to get you back in the pool" |
| First topup bonus | Member | In-app | "Thanks for your first topup! Bonus 10 🫧 added" |
| Academy graduation | Member | Email + In-app | "Congratulations! You've graduated from {program}! 🎓 +25 🫧" |
| Volunteer reward | Member | In-app | "Thanks for volunteering at {event}! Here's {amount} 🫧" |

### 10.3 Transaction Description Templates (Rewards)

```
Referral reward — {referee_name} joined ({amount} 🫧)
Referral bonus — invited by {referrer_name} ({amount} 🫧)
Ambassador bonus — 10 successful referrals! ({amount} 🫧)
Reward — shared {event_name} on social media ({amount} 🫧)
Reward — attended {session_count} sessions this month ({amount} 🫧)
Reward — {streak_weeks}-week attendance streak! ({amount} 🫧)
Welcome back! Thanks for returning to SwimBuddz ({amount} 🫧)
Reward — membership renewed ({amount} 🫧)
Volunteer reward — {event_name} ({amount} 🫧)
Reward — peer coaching session ({amount} 🫧)
Reward — published "{post_title}" ({amount} 🫧)
Reward — ride share to {pool_name}, {passenger_count} passengers ({amount} 🫧)
Reward — safety concern reported and confirmed ({amount} 🫧)
First topup bonus — welcome to Bubbles! ({amount} 🫧)
Reward — large topup bonus ({amount} 🫧)
Reward — first store purchase ({amount} 🫧)
Reward — upgraded to {new_tier} ({amount} 🫧)
Congratulations! Graduated from {program_name} ({amount} 🫧)
Milestone — {milestone_name} achieved ({amount} 🫧)
Perfect attendance — {program_name}, {cohort_name} ({amount} 🫧)
```

---

## 11. Frontend Integration

### 11.1 Wallet Page — Referral Section (`/account/wallet`)

```
┌──────────────────────────────────────────┐
│  🫧 Your Balance: 142                    │
│  [Top up]                                │
├──────────────────────────────────────────┤
│                                          │
│  📣 Invite Friends, Earn Bubbles         │
│                                          │
│  Your code: SB-JOHN-2X4K  [Copy]        │
│                                          │
│  [Share via WhatsApp]  [Copy Link]       │
│                                          │
│  You earn 15 🫧 for each friend who      │
│  joins and makes their first payment.    │
│  Your friend gets 10 🫧 too!             │
│                                          │
│  ┌─────────────────────────────────┐     │
│  │ 12 invited │ 8 qualified │ 120 🫧│    │
│  └─────────────────────────────────┘     │
│                                          │
│  [View referral history →]               │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  🏆 Rewards Earned                       │
│                                          │
│  This month: 35 🫧                       │
│  ├ 15 🫧  Attendance (8+ sessions)       │
│  ├ 10 🫧  Referral (Chioma joined)       │
│  ├  5 🫧  Content post approved          │
│  └  5 🫧  Academy milestone              │
│                                          │
│  Lifetime: 420 🫧 earned                 │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│  📜 Transaction History                  │
│  [Filter ▾]                              │
│                                          │
│  Today                                   │
│  ↓ Pool fee — Morning Swim, Yaba (21 🫧) │
│  ↑ Reward — 8+ sessions (15 🫧)         │
│                                          │
│  Yesterday                               │
│  ↓ Store — Swim Cap (50 🫧)              │
│  ↑ Added 100 🫧 via Paystack             │
│                                          │
│  [Load more]                             │
└──────────────────────────────────────────┘
```

### 11.2 Registration Page — Referral Code (`/register?ref=SB-JOHN-2X4K`)

```
┌──────────────────────────────────────────┐
│  🫧 Invited by John!                     │
│                                          │
│  Sign up and make your first payment     │
│  to earn bonus Bubbles.                  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │ Referral code: SB-JOHN-2X4K  ✓    │  │
│  └────────────────────────────────────┘  │
│                                          │
│  [Continue with registration →]          │
│                                          │
└──────────────────────────────────────────┘
```

If no `?ref=` param, show optional field:
```
Have a referral code? [Enter code] (optional)
```

### 11.3 Admin Dashboard — Rewards Tab (`/admin/wallet` → Rewards)

**Sub-tabs:**

**Rules:**
- Table of all reward rules with stats
- Edit modal for adjusting amounts/caps
- Activate/deactivate toggle

**Events:**
- Live feed of processed events
- Failed events queue with retry button
- Filter by event type, service, date

**Referrals:**
- Table of all referral records
- Filter by status (pending/registered/qualified/rewarded)
- Stats cards: conversion rate, total distributed, top referrers

**Manual Confirm:**
- Queue of pending admin-confirmation events (volunteer, safety)
- Approve/reject with reason

---

## 12. Error Handling

### Event Processing Failures

```
1. Event received but can't be parsed → reject with 400, log error
2. Event received but member not found → store event, mark as failed, retry later
3. Event received but wallet frozen → store event, skip rewards, log
4. Event received but reward rule inactive → silently skip, log
5. Event received but cap reached → silently skip, log
6. Bubble credit fails → mark event as failed, retry with backoff
7. Service unreachable → source service retries with exponential backoff (3 attempts)
```

### Retry Strategy

```python
# Events that fail processing are retried:
# - After 1 minute
# - After 5 minutes
# - After 30 minutes
# - Then marked as permanently failed (requires manual review)
MAX_RETRIES = 3
RETRY_DELAYS = [60, 300, 1800]  # seconds
```

### Member-Facing Error Messages

**Referral code invalid:**
```
Title:    Invalid referral code
Message:  We couldn't find that referral code. Check the code and try again,
          or continue without one.
Actions:  [Try again]  [Skip]
```

**Referral code expired:**
```
Title:    Referral code expired
Message:  This referral code is no longer active. You can still sign up
          without a code.
Actions:  [Continue without code]
```

**Already used a referral code:**
```
Title:    Referral already applied
Message:  You've already used a referral code. Only one referral code
          can be applied per account.
Actions:  [Continue]
```

**Referral limit reached (referrer):**
```
Title:    Referral limit reached
Message:  You've reached the maximum of 50 successful referrals.
          Thanks for being an amazing ambassador!
Actions:  [OK]
```

---

## 13. Security & Anti-Abuse

### Event Validation

- All events must come from authenticated services (service role JWT)
- Event `service_source` must match the JWT service identity
- Event `occurred_at` must be within 24 hours of current time (no backdated events)
- Event `data` is validated against expected schema per event type

### Reward Abuse Detection

| Signal | Action |
|---|---|
| Same member earning same reward >3x in 1 hour | Flag for review, continue processing |
| Member earning >100 🫧 in rewards in 1 day | Flag for review, continue processing |
| Referral code used by 5+ accounts from same IP in 1 day | Freeze referral code, notify admin |
| Member creating/deleting accounts to re-earn welcome bonus | Detect by email pattern, flag |
| Attendance events without corresponding session registration | Reject event, log discrepancy |

### Admin Alerts

The rewards engine should surface alerts in the admin dashboard:
- "Member X earned {amount} 🫧 in rewards today (unusual)"
- "Referral code SB-X-YYYY used 5 times from same IP"
- "Event processing failure rate above 5%"
- "{N} events in failed queue awaiting review"

---

## 14. Decisions Log

| # | Question | Decision | Rationale |
|---|---|---|---|
| 1 | Referral qualification trigger | **First membership payment OR first Bubble topup (min 25 🫧)** | Both prove real money commitment; membership payment is stronger signal but topup is faster |
| 2 | Referrer reward | **15 🫧 (₦1,500)** | Meaningful but not abuse-worthy; covers a ride share or partial session |
| 3 | Referee reward | **10 🫧 (₦1,000)** | Combined with 10 🫧 welcome + 25 🫧 topup = 45 🫧 (2 sessions). One more session than non-referred member |
| 4 | Max referrals per member | **50 lifetime** | Prevents farming; 50 × 15 🫧 = 750 🫧 max lifetime earnings from referrals |
| 5 | Referral code format | **SB-{NAME}-{4CHARS}** | Personalized, short for WhatsApp, collision-resistant |
| 6 | Code expiry | **90 days from last use** | Keeps codes fresh; refreshed on each use |
| 7 | Ambassador milestone | **50 🫧 at 10 successful referrals** | Recognises power referrers without ongoing cost |
| 8 | Architecture | **Event-driven** | Near-real-time rewards; services emit events, rewards engine reacts |
| 9 | Rule configurability | **Admin-editable amounts and caps** | Adjust rewards without code deployment |
| 10 | Attendance reward model | **5 🫧 at 4 sessions/month, 15 🫧 at 8+ (replaces, not stacks)** | Rewards consistency; higher tier replaces lower to prevent double-dipping |
| 11 | Community rewards | **Admin-confirmed for volunteer/safety** | Prevents self-reporting abuse |
| 12 | First topup bonus | **10 🫧** | On top of welcome (10 🫧), first topup (25 🫧) gives member 45 🫧 — strong start |
| 13 | Ride-share driver reward | **3 🫧 per passenger, 20/month cap** | Incentivises drivers who solve a real Lagos problem |

---

## 15. Rollout (within Phase 3)

### Phase 3a: Referrals
- Referral code generation and sharing
- Registration with referral code
- Qualification detection (first topup or membership payment)
- Automatic reward distribution
- Referral stats on wallet page
- Admin: referral management dashboard

### Phase 3b: Automated Rewards
- Event ingestion endpoint
- Reward rules engine with configurable rules
- Attendance rewards (monthly milestones, streaks)
- Spending rewards (first topup, large topup, first store purchase)
- Academy rewards (graduation, milestones, perfect attendance)
- Admin: rewards rules management, event monitoring

### Phase 3c: Community Rewards
- Admin-confirmed event submission (volunteer, peer coaching, safety)
- Ride-share driver rewards (automatic via transport service events)
- Content contribution rewards
- Social media share tracking
- Reactivation detection and rewards

### Phase 3d: Enhancements
- Ambassador badge system
- Referral leaderboard (admin + optional public)
- Reward notification preferences
- Anti-abuse monitoring dashboard
- Rewards analytics and ROI reporting

---

## 16. Relationship to Wallet Service

This document extends [WALLET_SERVICE_DESIGN.md](./WALLET_SERVICE_DESIGN.md). Key integration points:

- **Rewards engine lives inside the wallet service** (same service, same port 8011)
- **Uses existing wallet credit operation** for all Bubble grants
- **Uses existing transaction types:** `REWARD`, `REFERRAL_CREDIT`, `WELCOME_BONUS`
- **Adds new tables:** `reward_rules`, `wallet_events`, `member_reward_history`, `referral_records`, `referral_codes`
- **Adds new internal endpoint:** `POST /internal/wallet/events`
- **Adds new admin endpoints** for reward rules and referral management
- **Referral tables in wallet design doc are superseded by this document** (more detailed schema here)

### Updated Wallet Service Directory Structure

```
services/wallet_service/
├── ...existing files...
├── events/
│   ├── __init__.py
│   ├── event_router.py            # POST /internal/wallet/events
│   ├── event_processor.py         # Event ingestion, dedup, dispatch
│   └── event_schemas.py           # Event payload validation
├── rewards/
│   ├── __init__.py
│   ├── rewards_engine.py          # Rule matching and execution
│   ├── rules_service.py           # CRUD for reward rules
│   └── cap_checker.py             # Period/lifetime cap enforcement
├── referrals/
│   ├── __init__.py
│   ├── referral_router.py         # Member referral endpoints
│   ├── referral_admin_router.py   # Admin referral endpoints
│   ├── referral_service.py        # Code generation, qualification, rewards
│   └── code_generator.py          # SB-{NAME}-{4CHARS} generation
└── tasks/
    ├── ...existing...
    ├── reward_retry_task.py       # Retry failed event processing
    └── referral_expiry_task.py    # Expire inactive referral codes
```

---

*Last updated: February 2026*
