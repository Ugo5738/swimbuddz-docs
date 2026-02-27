# Wallet Service Architecture & Data Model Design

> **Status:** Draft — Awaiting Review
> **Service Port:** 8011
> **Service Name:** `wallet_service`
> **Currency Name:** Bubbles (🫧)
> **Exchange Rate:** ₦100 = 1 Bubble
> **Date:** February 2026

---

## 1. Overview

The Wallet Service manages **Bubbles** — SwimBuddz's closed-loop, non-redeemable credit system. Members purchase Bubbles with Naira via Paystack and spend them across all SwimBuddz services (sessions, academy, store, events, transport).

### Why "Bubbles"?

- **Brand-aligned** — swimming + bubbles is natural and memorable
- **Regulatory distance** — "50 Bubbles" is clearly not ₦50, which distances SwimBuddz from e-money classification under CBN guidelines
- **Kid-friendly** — works for ages 6-60+ across community, club, and academy
- **Gamification-ready** — "Earn Bubbles!" is more engaging than "Earn credits"

### Design Principles

- **Bubbles, not Naira** — ₦100 = 1 Bubble. Bubbles are not a Naira equivalent (regulatory compliance)
- **No cash-out** — Bubbles cannot be withdrawn or converted back to Naira
- **Closed-loop** — Bubbles are only spendable within SwimBuddz
- **Audit everything** — Every balance change has a transaction record with full context
- **Idempotent operations** — All debit/credit operations use idempotency keys to prevent double-processing
- **Eventual consistency** — Other services request deductions via API; wallet confirms or rejects

---

## 2. Pricing & Topup Structure

### Exchange Rate

| Naira | Bubbles |
|---|---|
| ₦100 | 1 🫧 |
| ₦2,500 | 25 🫧 |
| ₦5,000 | 50 🫧 |
| ₦10,000 | 100 🫧 |

### What Things Cost in Bubbles

> **Note:** Membership fees and pool fees are separate charges. Membership grants access to the tier (coaching, scheduling, community). Pool fees are per-session costs that vary by pool location. Membership does NOT include pool fees.

**Per-Session Costs (variable by pool):**

| Item | Example | Naira | Bubbles |
|---|---|---|---|
| Pool fee (standard) | Typical pool | ₦2,100 (incl. processing) | 21 🫧 |
| Pool fee (premium) | Premium pool | ₦5,100 (incl. processing) | 51 🫧 |
| Ride share | Session transport | ₦500–₦1,500 | 5–15 🫧 |
| No-show penalty | Missed session | ₦500–₦1,000 | 5–10 🫧 |

**Membership Fees (paid separately, not via Bubbles initially):**

| Tier | Period | Naira |
|---|---|---|
| Community | Annual | ₦20,000 |
| Club | Quarterly | ₦42,500 |
| Club | Bi-annual | ₦80,000 |
| Club | Annual | ₦150,000 |

> Membership fees may be payable via Bubbles in Phase 2 when service integration is complete. Pool fees are the primary Bubble spending use case.

**Store:**

| Item | Naira | Bubbles |
|---|---|---|
| Swim cap | ₦5,000 | 50 🫧 |
| Goggles (Speedo) | ₦15,000 | 150 🫧 |
| Goggles (Arena) | ₦35,000 | 350 🫧 |
| Kickboard | ₦8,000 | 80 🫧 |
| Delivery fee | ₦2,000 | 20 🫧 |

**Academy:**

| Item | Naira | Bubbles |
|---|---|---|
| Cohort program (example) | ₦150,000 | 1,500 🫧 |

### Topup Tiers

Pre-set amounts for easy selection on the topup screen. Members can also enter a custom amount (minimum 25 Bubbles).

| Tier | Naira | Bubbles | Use Case |
|---|---|---|---|
| Starter | ₦2,500 | 25 🫧 | A few sessions |
| Regular | ₦5,000 | 50 🫧 | A week of swimming + small gear |
| Popular | ₦10,000 | 100 🫧 | Two weeks of sessions + store purchase |
| Value | ₦20,000 | 200 🫧 | A month of sessions or community membership |
| Premium | ₦50,000 | 500 🫧 | Quarter club membership or academy program |

### Topup Limits

- **Minimum:** 25 Bubbles (₦2,500) — optimized for Paystack fee efficiency (~5.5% fee)
- **Maximum:** 5,000 Bubbles (₦500,000) — fraud prevention cap
- **Custom amount:** Any amount between min and max in whole Bubbles

### Welcome Bonus

- **Amount:** 10 Bubbles (₦1,000 value)
- **Trigger:** Unconditional — granted automatically on wallet creation (member registration)
- **Purpose:** Covers ~half the cheapest pool fee (21 🫧). Creates "you're halfway there" psychology — member sees 10 🫧 and thinks "I just need to topup 25 🫧 and I'll have 35, enough for a session with some left over"
- **Type:** Promotional credit (non-expiring)
- **Anti-abuse:** ₦1,000 value per account limits abuse risk. At 500 fake signups = ₦500,000 exposure (manageable)

---

## 3. Data Model

### 3.1 Wallet

The core account. One wallet per member. Created automatically on member registration.

```
Table: wallets
├── id: UUID (PK)
├── member_id: UUID (indexed, unique) — cross-service ref to members.id
├── member_auth_id: str (indexed, unique) — Supabase auth ID
├── balance: int (default 0, >= 0) — current Bubble balance
├── lifetime_bubbles_purchased: int (default 0) — total Bubbles ever bought
├── lifetime_bubbles_spent: int (default 0) — total Bubbles ever spent
├── lifetime_bubbles_received: int (default 0) — total Bubbles received (promos, welcome bonus, etc.)
├── status: WalletStatus enum [active, frozen, suspended, closed]
├── frozen_reason: str | null — why wallet was frozen (admin action)
├── frozen_at: datetime | null
├── frozen_by: str | null — admin auth_id who froze it
├── wallet_tier: WalletTier enum [standard, premium, vip] — future gamification
├── created_at: datetime
├── updated_at: datetime
```

**Constraints:**
- `CHECK (balance >= 0)` — prevent negative balances
- `UNIQUE (member_id)` — one wallet per member
- `UNIQUE (member_auth_id)` — one wallet per auth user

### 3.2 WalletTransaction

Immutable ledger of all balance changes. This is the source of truth.

```
Table: wallet_transactions
├── id: UUID (PK)
├── wallet_id: UUID (FK → wallets.id, indexed)
├── idempotency_key: str (unique, indexed) — prevents duplicate processing
├── transaction_type: TransactionType enum [topup, purchase, refund, promotional_credit, referral_credit, admin_adjustment, transfer_in, transfer_out, penalty, reward, expiry, welcome_bonus]
├── direction: TransactionDirection enum [credit, debit]
├── amount: int (> 0) — always positive (in Bubbles); direction determines sign
├── balance_before: int — Bubble balance snapshot before this transaction
├── balance_after: int — Bubble balance snapshot after this transaction
├── status: TransactionStatus enum [pending, completed, failed, reversed]
├── description: str — human-readable description
├── service_source: str | null — which service initiated (e.g., "academy_service", "store_service", "attendance_service")
├── reference_type: str | null — type of external reference (e.g., "payment", "enrollment", "order", "session")
├── reference_id: str | null — external ID (e.g., payment reference, order ID, session ID)
├── initiated_by: str | null — auth_id of user/admin who initiated
├── metadata: JSONB | null — flexible context (promo code, campaign details, etc.)
├── reversed_by_transaction_id: UUID | null — if this was reversed, points to reversal
├── reversal_of_transaction_id: UUID | null — if this is a reversal, points to original
├── created_at: datetime
├── updated_at: datetime
```

**Constraints:**
- `CHECK (amount > 0)` — amount is always positive
- `UNIQUE (idempotency_key)` — prevents double-processing
- Composite index on `(wallet_id, created_at DESC)` for paginated history

### 3.3 WalletTopup

Tracks Bubble purchase requests and their Paystack payment lifecycle.

```
Table: wallet_topups
├── id: UUID (PK)
├── wallet_id: UUID (FK → wallets.id, indexed)
├── member_auth_id: str (indexed)
├── reference: str (unique, indexed) — topup reference (e.g., "TOP-12345")
├── bubbles_amount: int — how many Bubbles to add
├── naira_amount: Decimal(12,2) — how much Naira was charged
├── exchange_rate: Decimal(10,4) — Naira per Bubble at time of purchase (e.g., 100.0000)
├── payment_reference: str | null — links to payments_service Payment.reference
├── payment_method: PaymentMethod enum [paystack, bank_transfer, admin_grant]
├── status: TopupStatus enum [pending, processing, completed, failed, expired]
├── paystack_authorization_url: str | null — checkout redirect URL
├── paystack_access_code: str | null
├── completed_at: datetime | null
├── failed_at: datetime | null
├── failure_reason: str | null
├── metadata: JSONB | null
├── created_at: datetime
├── updated_at: datetime
```

**Constraints:**
- `CHECK (bubbles_amount >= 25)` — minimum topup
- `CHECK (bubbles_amount <= 5000)` — maximum topup
- `CHECK (naira_amount > 0)`

### 3.4 PromotionalBubbleGrant

Tracks promotional/bonus Bubbles issued by admins or system rules.

```
Table: promotional_bubble_grants
├── id: UUID (PK)
├── wallet_id: UUID (FK → wallets.id, indexed)
├── member_auth_id: str (indexed)
├── grant_type: GrantType enum [welcome_bonus, referral_reward, loyalty_reward, campaign, compensation, admin_manual]
├── bubbles_amount: int
├── reason: str — why this grant was issued
├── campaign_code: str | null — promo campaign identifier
├── expires_at: datetime | null — when these Bubbles expire (null = never)
├── bubbles_remaining: int — tracks how many of these specific Bubbles are left
├── transaction_id: UUID | null — FK to the wallet_transaction that credited these
├── granted_by: str | null — admin auth_id or "system"
├── metadata: JSONB | null — campaign context, etc.
├── created_at: datetime
```

**Constraints:**
- `CHECK (bubbles_amount > 0)`
- `CHECK (bubbles_remaining >= 0)`
- `CHECK (bubbles_remaining <= bubbles_amount)`

### 3.5 Referral & Rewards Tables (Phase 3 — Tables Created Now, Logic Built Later)

> Full schema and architecture in [REWARDS_ENGINE_DESIGN.md](./REWARDS_ENGINE_DESIGN.md).

The following tables support the referral system and event-driven rewards engine:

- **`referral_records`** — tracks referral lifecycle (pending → registered → qualified → rewarded)
- **`referral_codes`** — unique shareable codes per member (e.g., "SB-JOHN-2X4K")
- **`reward_rules`** — admin-configurable rules defining when Bubbles are auto-granted
- **`wallet_events`** — ingested events from all services (audit trail + deduplication)
- **`member_reward_history`** — tracks which rewards each member received (for cap enforcement)

Key decisions:
- Referral qualification: first membership payment OR first Bubble topup (min 25 🫧)
- Rewards: 15 🫧 referrer, 10 🫧 referee, 50 🫧 ambassador bonus at 10 referrals
- Max 50 successful referrals per member lifetime
- Event-driven architecture: services emit events, rewards engine matches rules and grants Bubbles

### 3.6 FamilyWallet (Phase 4 — Tables Created Now, Logic Built Later)

Links wallets in a parent-child relationship for family spending.

```
Table: family_wallet_links
├── id: UUID (PK)
├── parent_wallet_id: UUID (FK → wallets.id, indexed) — the funding wallet
├── child_wallet_id: UUID (FK → wallets.id, indexed) — the spending wallet
├── spending_limit_per_month: int | null — optional monthly Bubble cap
├── spent_this_month: int (default 0) — resets monthly
├── month_reset_date: date — when spent_this_month was last reset
├── is_active: bool (default true)
├── approved_at: datetime | null
├── approved_by: str | null — parent auth_id
├── created_at: datetime
├── updated_at: datetime
```

**Constraints:**
- `UNIQUE (parent_wallet_id, child_wallet_id)` — no duplicate links
- `CHECK (parent_wallet_id != child_wallet_id)` — can't link to self

### 3.7 CorporateWallet (Phase 5 — Tables Created Now, Logic Built Later)

For companies funding employee wellness programs.

```
Table: corporate_wallets
├── id: UUID (PK)
├── wallet_id: UUID (FK → wallets.id, unique) — the corporate wallet itself
├── company_name: str
├── company_email: str
├── admin_auth_id: str (indexed) — corporate admin
├── budget_total: int — total Bubbles allocated
├── budget_remaining: int — Bubbles left to distribute
├── member_bubble_limit: int | null — max Bubbles per member
├── is_active: bool (default true)
├── metadata: JSONB | null
├── created_at: datetime
├── updated_at: datetime

Table: corporate_wallet_members
├── id: UUID (PK)
├── corporate_wallet_id: UUID (FK → corporate_wallets.id, indexed)
├── member_wallet_id: UUID (FK → wallets.id, indexed)
├── bubbles_allocated: int (default 0) — total given to this member
├── is_active: bool (default true)
├── added_at: datetime
├── added_by: str — corporate admin auth_id
```

### 3.8 WalletAuditLog

Tracks sensitive admin operations on wallets.

```
Table: wallet_audit_logs
├── id: UUID (PK)
├── wallet_id: UUID (FK → wallets.id, indexed)
├── action: AuditAction enum [freeze, unfreeze, suspend, close, admin_credit, admin_debit, tier_change, limit_change]
├── performed_by: str — admin auth_id
├── old_value: JSONB | null — state before change
├── new_value: JSONB | null — state after change
├── reason: str — why the action was taken
├── ip_address: str | null
├── created_at: datetime
```

---

## 4. Enums Summary

```python
class WalletStatus(str, Enum):
    ACTIVE = "active"
    FROZEN = "frozen"          # Temporarily suspended by admin
    SUSPENDED = "suspended"    # Pending investigation
    CLOSED = "closed"          # Permanently closed

class WalletTier(str, Enum):
    STANDARD = "standard"
    PREMIUM = "premium"
    VIP = "vip"

class TransactionType(str, Enum):
    TOPUP = "topup"                        # Purchased Bubbles
    PURCHASE = "purchase"                  # Spent on service
    REFUND = "refund"                      # Service refund to wallet
    WELCOME_BONUS = "welcome_bonus"        # Auto-granted on wallet creation
    PROMOTIONAL_CREDIT = "promotional_credit"  # Promo/bonus Bubbles
    REFERRAL_CREDIT = "referral_credit"    # Referral reward (Phase 3)
    ADMIN_ADJUSTMENT = "admin_adjustment"  # Manual admin correction
    TRANSFER_IN = "transfer_in"            # Family/group transfer received (Phase 4)
    TRANSFER_OUT = "transfer_out"          # Family/group transfer sent (Phase 4)
    PENALTY = "penalty"                    # No-show fee, etc.
    REWARD = "reward"                      # Loyalty/gamification reward
    EXPIRY = "expiry"                      # Promotional Bubbles expired

class TransactionDirection(str, Enum):
    CREDIT = "credit"  # Balance increases
    DEBIT = "debit"    # Balance decreases

class TransactionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REVERSED = "reversed"

class TopupStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"

class PaymentMethod(str, Enum):
    PAYSTACK = "paystack"
    BANK_TRANSFER = "bank_transfer"
    ADMIN_GRANT = "admin_grant"

class GrantType(str, Enum):
    WELCOME_BONUS = "welcome_bonus"
    REFERRAL_REWARD = "referral_reward"
    LOYALTY_REWARD = "loyalty_reward"
    CAMPAIGN = "campaign"
    COMPENSATION = "compensation"
    ADMIN_MANUAL = "admin_manual"

class ReferralStatus(str, Enum):
    PENDING = "pending"        # Code generated, not yet used
    QUALIFIED = "qualified"    # Referee met criteria
    REWARDED = "rewarded"      # Bubbles distributed
    EXPIRED = "expired"        # Code expired
    CANCELLED = "cancelled"    # Manually cancelled

class AuditAction(str, Enum):
    FREEZE = "freeze"
    UNFREEZE = "unfreeze"
    SUSPEND = "suspend"
    CLOSE = "close"
    ADMIN_CREDIT = "admin_credit"
    ADMIN_DEBIT = "admin_debit"
    TIER_CHANGE = "tier_change"
    LIMIT_CHANGE = "limit_change"
```

---

## 5. API Endpoints

### 5.1 Member Endpoints (Auth Required)

```
# Wallet
GET    /wallet/me                          → Get my wallet (Bubble balance, status, tier)
POST   /wallet/create                      → Create my wallet (also triggered automatically on registration)

# Top-ups
POST   /wallet/topup                       → Initiate Bubble purchase (returns Paystack URL)
GET    /wallet/topup/{topup_id}            → Check topup status
GET    /wallet/topups                      → List my topup history (paginated)

# Transactions
GET    /wallet/transactions                → List my transactions (paginated, filterable by type/date)
GET    /wallet/transactions/{transaction_id} → Get transaction details

# Spending (called by other services via gateway, not directly by frontend)
POST   /wallet/debit                       → Deduct Bubbles (idempotent, requires idempotency_key)
POST   /wallet/credit                      → Add Bubbles (refund, reward — idempotent)
POST   /wallet/check-balance               → Check if wallet has sufficient Bubbles (no deduction)

# Referrals (Phase 3 — endpoints created, logic deferred)
GET    /wallet/referral/code               → Get my referral code (generate if none exists)
GET    /wallet/referral/stats              → My referral stats (count, earnings)
POST   /wallet/referral/apply              → Apply a referral code
```

### 5.2 Admin Endpoints (Admin Auth Required)

```
# Wallet Management
GET    /wallet/admin/wallets               → List all wallets (paginated, filterable)
GET    /wallet/admin/wallets/{wallet_id}   → Get wallet details with transaction summary
POST   /wallet/admin/wallets/{wallet_id}/freeze    → Freeze wallet
POST   /wallet/admin/wallets/{wallet_id}/unfreeze  → Unfreeze wallet
POST   /wallet/admin/wallets/{wallet_id}/adjust    → Manual Bubble credit/debit adjustment

# Promotional Bubbles
POST   /wallet/admin/grants                → Issue promotional Bubbles (single or bulk)
GET    /wallet/admin/grants                → List all promotional grants

# Referral Management (Phase 3)
GET    /wallet/admin/referrals             → List all referral records
PATCH  /wallet/admin/referrals/{id}        → Update referral status/rewards

# Reporting
GET    /wallet/admin/stats                 → System-wide wallet statistics
GET    /wallet/admin/transactions          → All transactions (filterable)

# Audit
GET    /wallet/admin/audit-log             → Admin action audit trail
```

### 5.3 Internal Endpoints (Service-to-Service)

```
# Called by other services with service role JWT
POST   /internal/wallet/debit              → Deduct Bubbles for a service purchase
POST   /internal/wallet/credit             → Credit Bubbles (refund, reward)
GET    /internal/wallet/balance/{auth_id}  → Check member's Bubble balance
POST   /internal/wallet/check-balance      → Verify sufficient Bubbles without deducting
POST   /internal/wallet/confirm-topup      → Called by payments_service on Paystack webhook
```

---

## 6. Service Integration Points

### 6.1 How Other Services Use the Wallet

**Sessions/Attendance Service (session fees, no-show penalties):**
```json
// Attendance check-in → POST /internal/wallet/debit
{
  "idempotency_key": "session-{session_id}-{member_id}",
  "member_auth_id": "...",
  "amount": 21,
  "transaction_type": "purchase",
  "description": "Session fee — Morning Swim Jan 15 (21 🫧)",
  "service_source": "attendance_service",
  "reference_type": "session",
  "reference_id": "{session_id}"
}
```

**Academy Service (enrollment fees):**
```json
// Cohort enrollment → POST /internal/wallet/debit
{
  "idempotency_key": "enrollment-{enrollment_id}",
  "member_auth_id": "...",
  "amount": 1500,
  "transaction_type": "purchase",
  "description": "Cohort enrollment — Learn to Swim Batch 3 (1,500 🫧)",
  "service_source": "academy_service",
  "reference_type": "enrollment",
  "reference_id": "{enrollment_id}"
}
```

**Store Service (merchandise):**
```json
// Order checkout → POST /internal/wallet/debit
{
  "idempotency_key": "order-{order_id}",
  "member_auth_id": "...",
  "amount": 150,
  "transaction_type": "purchase",
  "description": "Store order #SB-20260215-A1B2 (150 🫧)",
  "service_source": "store_service",
  "reference_type": "order",
  "reference_id": "{order_id}"
}
```

**Transport Service (ride fees):**
```json
// Ride booking → POST /internal/wallet/debit
{
  "idempotency_key": "ride-{booking_id}",
  "member_auth_id": "...",
  "amount": 10,
  "transaction_type": "purchase",
  "description": "Ride share — Yaba Pool Jan 15 (10 🫧)",
  "service_source": "transport_service",
  "reference_type": "ride_booking",
  "reference_id": "{booking_id}"
}
```

**Events Service (event fees):**
```json
// Event RSVP → POST /internal/wallet/debit
{
  "idempotency_key": "event-{event_id}-{member_id}",
  "member_auth_id": "...",
  "amount": 20,
  "transaction_type": "purchase",
  "description": "Event — Community Swim Meet Feb 20 (20 🫧)",
  "service_source": "events_service",
  "reference_type": "event",
  "reference_id": "{event_id}"
}
```

### 6.2 Wallet → Payments Service Integration (Topup Flow)

```
1. Member: POST /api/v1/wallet/topup { bubbles_amount: 100 }
2. Wallet Service: Calculate naira_amount → 100 × ₦100 = ₦10,000
3. Wallet Service: Create WalletTopup record (status: pending)
4. Wallet Service → Payments Service: POST /internal/payments/intents {
     purpose: "wallet_topup",
     amount: 1000000,  // ₦10,000 in kobo
     reference_id: topup.id,
     callback_url: "/account/wallet?topup={topup_id}"
   }
5. Payments Service: Returns Paystack authorization_url
6. Wallet Service: Stores paystack URL on topup record, returns to member
7. Member: Redirected to Paystack checkout
8. Paystack: Webhook → Payments Service → confirms payment
9. Payments Service → Wallet Service: POST /internal/wallet/confirm-topup {
     topup_reference: "TOP-12345",
     payment_reference: "PAY-67890",
     status: "completed"
   }
10. Wallet Service: Credits wallet with Bubbles, creates transaction record
```

### 6.3 Wallet Creation Flow (with Welcome Bonus)

```
1. New member registers via Supabase auth
2. Members service creates member record
3. Members service → Wallet service: POST /internal/wallet/create {
     member_id: "...",
     member_auth_id: "..."
   }
4. Wallet service: Creates wallet (balance: 0)
5. Wallet service: Auto-grants 10 🫧 welcome bonus
   a. Creates PromotionalBubbleGrant (type: welcome_bonus, amount: 10, expires_at: null)
   b. Creates WalletTransaction (type: welcome_bonus, direction: credit, amount: 10)
   c. Updates wallet balance → 10
6. Member sees: "Welcome! You have 10 🫧 — top up 25 more and you're ready to swim!"
```

### 6.4 Store Credits Migration

The existing `StoreCredit` system in `store_service` should be migrated to the wallet:
- Existing store credit balances → converted to Bubbles (balance_ngn ÷ 100)
- `StoreCreditTransaction` history → preserved as wallet transactions with `service_source: "store_service"`
- Store checkout → switches from store credits to wallet debit API
- Migration script to handle existing balances

---

## 7. Core Business Logic

### 7.1 Debit Operation (Atomic)

```python
async def debit_wallet(
    db: AsyncSession,
    wallet_id: UUID,
    amount: int,
    idempotency_key: str,
    transaction_type: TransactionType,
    description: str,
    **kwargs
) -> WalletTransaction:
    # 1. Check idempotency — return existing transaction if key exists
    existing = await get_transaction_by_idempotency_key(db, idempotency_key)
    if existing:
        return existing

    # 2. Lock wallet row (SELECT FOR UPDATE) to prevent race conditions
    wallet = await get_wallet_for_update(db, wallet_id)

    # 3. Validate
    if wallet.status != WalletStatus.ACTIVE:
        raise WalletFrozenError()
    if wallet.balance < amount:
        raise InsufficientBalanceError(balance=wallet.balance, required=amount)

    # 4. Create transaction record
    transaction = WalletTransaction(
        wallet_id=wallet.id,
        idempotency_key=idempotency_key,
        transaction_type=transaction_type,
        direction=TransactionDirection.DEBIT,
        amount=amount,
        balance_before=wallet.balance,
        balance_after=wallet.balance - amount,
        status=TransactionStatus.COMPLETED,
        description=description,
        **kwargs
    )

    # 5. Update wallet balance
    wallet.balance -= amount
    wallet.lifetime_bubbles_spent += amount

    # 6. Commit atomically
    db.add(transaction)
    await db.commit()

    return transaction
```

### 7.2 Credit Operation (Atomic)

Same pattern as debit but adds to balance. Used for top-ups, refunds, rewards, welcome bonus.

### 7.3 Referral Flow (Phase 3 — Deferred)

```
1. Member A: GET /wallet/referral/code → Returns "SB-JOHN-2X4K"
2. Member A shares code with friend
3. New member B signs up and: POST /wallet/referral/apply { code: "SB-JOHN-2X4K" }
4. System creates ReferralRecord (status: pending)
5. Member B meets qualification criteria (TBD in Phase 3)
6. System auto-triggers:
   a. Credit Member B's wallet (referee reward — amount TBD)
   b. Credit Member A's wallet (referrer reward — amount TBD)
   c. Update ReferralRecord (status: rewarded)
```

Referral reward amounts and qualification criteria will be decided when Phase 3 is built, informed by real usage data.

### 7.4 Promotional Bubble Expiry

Background job (daily):
```
1. Query promotional_bubble_grants WHERE expires_at <= now() AND bubbles_remaining > 0
2. For each expired grant:
   a. Create debit transaction (type: expiry)
   b. Deduct bubbles_remaining from wallet balance
   c. Set bubbles_remaining = 0
```

---

## 8. Configuration & Pricing

### Wallet Config (stored in DB or environment)

```python
WALLET_CONFIG = {
    # Pricing
    "naira_per_bubble": 100,                # ₦100 = 1 Bubble

    # Topup limits
    "min_topup_bubbles": 25,                # 25 Bubbles (₦2,500)
    "max_topup_bubbles": 5000,              # 5,000 Bubbles (₦500,000)

    # Topup tier presets (for frontend display)
    "topup_tiers": [
        {"name": "Starter",  "bubbles": 25,   "naira": 2500},
        {"name": "Regular",  "bubbles": 50,   "naira": 5000},
        {"name": "Popular",  "bubbles": 100,  "naira": 10000},
        {"name": "Value",    "bubbles": 200,  "naira": 20000},
        {"name": "Premium",  "bubbles": 500,  "naira": 50000},
    ],

    # Welcome bonus
    "welcome_bonus_bubbles": 10,            # 10 Bubbles (₦1,000 value)
    "welcome_bonus_enabled": True,
    "welcome_bonus_expires": False,         # Welcome Bubbles don't expire

    # Referral rewards (Phase 3 — see REWARDS_ENGINE_DESIGN.md for full spec)
    "referrer_reward_bubbles": 15,          # 15 Bubbles per successful referral
    "referee_reward_bubbles": 10,           # 10 Bubbles for referred member on qualification
    "referral_qualification": "first_membership_payment_or_first_topup",
    "referral_max_per_member": 50,          # Lifetime cap on successful referrals

    # Promotional Bubble default expiry (days, null = never)
    # Configurable per grant — admins can set shorter/longer per campaign
    "promotional_bubble_expiry_days": 60,

    # Auto-topup (Phase 5)
    "auto_topup_enabled": False,
    "auto_topup_threshold": 10,             # When balance drops below 10 🫧
    "auto_topup_amount": 100,               # Auto-buy 100 🫧
}
```

---

## 9. Directory Structure

```
services/wallet_service/
├── Dockerfile
├── __init__.py
├── alembic.ini
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── .keep
├── app/
│   ├── __init__.py
│   └── main.py                    # FastAPI app factory
├── models.py                      # All SQLAlchemy models
├── schemas.py                     # Pydantic request/response schemas
├── router.py                      # Member-facing endpoints
├── admin_router.py                # Admin endpoints
├── internal_router.py             # Service-to-service endpoints
├── services/
│   ├── __init__.py
│   ├── wallet_ops.py              # Core debit/credit/balance logic
│   ├── topup_service.py           # Topup flow (Paystack integration)
│   └── promotional_service.py     # Promotional grants and expiry
├── events/                        # Phase 3 — Event-driven rewards
│   ├── __init__.py
│   ├── event_router.py            # POST /internal/wallet/events
│   ├── event_processor.py         # Event ingestion, dedup, dispatch
│   └── event_schemas.py           # Event payload validation
├── rewards/                       # Phase 3 — Rewards engine
│   ├── __init__.py
│   ├── rewards_engine.py          # Rule matching and execution
│   ├── rules_service.py           # CRUD for reward rules
│   └── cap_checker.py             # Period/lifetime cap enforcement
├── referrals/                     # Phase 3 — Referral system
│   ├── __init__.py
│   ├── referral_router.py         # Member referral endpoints
│   ├── referral_admin_router.py   # Admin referral endpoints
│   ├── referral_service.py        # Code generation, qualification, rewards
│   └── code_generator.py          # SB-{NAME}-{4CHARS} generation
└── tasks/
    ├── __init__.py
    ├── expiry_task.py             # Scheduled job for Bubble expiry
    ├── reward_retry_task.py       # Phase 3 — Retry failed event processing
    └── referral_expiry_task.py    # Phase 3 — Expire inactive referral codes
```

> Phase 3 directories are shown for planning. See [REWARDS_ENGINE_DESIGN.md](./REWARDS_ENGINE_DESIGN.md) for full specification.

---

## 10. Integration Changes to Existing Services

### 10.1 Gateway Service
- Add `wallet_client` to `clients.py`
- Add proxy route: `/api/v1/wallet/{path:path}` → `wallet-service:8011`

### 10.2 Payments Service
- Add `WALLET_TOPUP` to `PaymentPurpose` enum (or handle via metadata)
- Add internal endpoint to notify wallet service on payment completion
- Or: wallet service polls/webhooks for topup payment status

### 10.3 Members Service
- On member registration: call wallet service to create wallet (triggers welcome bonus)

### 10.4 libs/common/config.py
- Add `WALLET_SERVICE_URL: str = "http://wallet-service:8011"`

### 10.5 libs/common/service_client.py
- Add helper: `get_wallet_balance(auth_id, calling_service)`
- Add helper: `debit_wallet(auth_id, amount, idempotency_key, ..., calling_service)`
- Add helper: `credit_wallet(auth_id, amount, idempotency_key, ..., calling_service)`

### 10.6 Docker Compose
- Add `wallet-service` container (port 8011)

### 10.7 Store Service (Migration)
- Phase out `StoreCredit` / `StoreCreditTransaction` in favor of wallet
- Checkout flow switches from store credits to wallet debit
- Migration script for existing balances

---

## 11. Rollout Phases

### Phase 1: Core Wallet (MVP)
- Wallet creation (automatic on member registration, with 10 🫧 welcome bonus)
- Bubble balance management (debit/credit operations with idempotency)
- Topup via Paystack (25–5,000 🫧 range, preset tiers + custom)
- Transaction history (paginated, filterable)
- Admin: view wallets, manual adjustments, freeze/unfreeze, audit log
- Frontend: `/account/wallet` page with balance display, topup flow, and transaction history
- Internal APIs for service-to-service debit/credit
- **Integration:** None yet — wallet exists but isn't used by other services for payment

### Phase 2: Service Integration
- Sessions/Attendance: Pay session fees + no-show penalties from wallet
- Academy: Pay enrollment fees from wallet
- Store: Replace store credits with wallet (migrate existing balances)
- Transport: Pay ride fees from wallet
- Events: Pay event fees from wallet
- **Each service gets "Pay with Bubbles" option alongside direct Paystack payment**

### Phase 3: Referrals, Rewards & Promotions
> See [REWARDS_ENGINE_DESIGN.md](./REWARDS_ENGINE_DESIGN.md) for complete specification.
- **3a:** Referral system (code generation, sharing, qualification, reward distribution)
- **3b:** Automated rewards engine (attendance, spending, academy rewards via event-driven rules)
- **3c:** Community rewards (volunteer, ride-share, content, safety — admin-confirmed)
- **3d:** Promotional Bubble grants, expiry background job, analytics dashboard

### Phase 4: Family & Group Wallets
- Parent-child wallet linking
- Spending limits per child wallet (monthly Bubble cap)
- Monthly budget resets
- Family dashboard

### Phase 5: Corporate & Advanced
- Corporate wallet accounts
- Employee Bubble allocation
- Loyalty rewards / gamification integration
- Auto-topup when balance drops below threshold
- Inter-member transfers (controlled, not open P2P)

---

## 12. Security Considerations

- **Row-level locking** (`SELECT FOR UPDATE`) on wallet balance changes to prevent race conditions
- **Idempotency keys** on all debit/credit operations to prevent double-charges
- **Audit logging** for all admin operations with IP tracking
- **Rate limiting** on topup endpoint to prevent abuse
- **Wallet freeze** capability for suspicious activity
- **Balance reconciliation** — periodic job to verify `wallet.balance == sum(transactions)`
- **No negative balances** — database CHECK constraint as safety net
- **Service role JWT** for internal calls (60-second expiry, non-replayable)

---

## 13. Migration from Store Credits

### Strategy
1. Build wallet service independently
2. Create migration script:
   - For each `StoreCredit` record with `balance_ngn > 0`:
     - Create wallet if not exists
     - Convert: `bubbles = balance_ngn / 100` (rounded down)
     - Credit wallet with equivalent Bubbles
     - Create `WalletTransaction` (type: `admin_adjustment`, description: "Store credit migration")
   - Mark `StoreCredit` as migrated (add `migrated_to_wallet: bool` column)
3. Update store checkout to use wallet API
4. Keep `StoreCredit` tables as read-only archive
5. Frontend: Remove store credit UI, replace with Bubble balance

---

## 14. Decisions Log

| # | Question | Decision | Rationale |
|---|---|---|---|
| 1 | Credit naming | **Bubbles** (🫧) | Brand-aligned, regulatory distance from Naira, kid-friendly, gamification-ready |
| 2 | Exchange rate | **₦100 = 1 Bubble** | Maximizes regulatory distance; "150 Bubbles" ≠ "₦150" in perception |
| 3 | Minimum topup | **25 Bubbles (₦2,500)** | Paystack fee ~5.5% at this level; clean number; covers several sessions |
| 4 | Maximum topup | **5,000 Bubbles (₦500,000)** | Fraud prevention cap |
| 5 | Welcome bonus | **10 Bubbles, unconditional** | Covers ~half cheapest pool fee (21 🫧); "you're halfway there" psychology pulls toward first topup; ₦1,000 value is manageable abuse risk |
| 6 | Cash-out | **Not allowed** | Regulatory compliance (avoids e-money classification) |
| 7 | Wallet creation | **Automatic on registration** | Seamless onboarding; welcome bonus delivered immediately |
| 8 | Referral rewards | **15 🫧 referrer, 10 🫧 referee** | Qualification: first membership payment or first topup. 50 referral lifetime cap. See [REWARDS_ENGINE_DESIGN.md](./REWARDS_ENGINE_DESIGN.md) |
| 9 | Membership vs pool fees | **Separate charges** | Membership = tier access; pool fee = per-session, varies by pool. Keeps costs predictable, gives members choice, matches existing data model |
| 10 | Promotional Bubble expiry | **60 days default, configurable per grant** | Creates urgency; admins can set shorter/longer per campaign; welcome bonus excluded (never expires) |
| 11 | Coach payouts | **Bank transfers (no change)** | Coaches are paid in Naira via existing payout system; Bubbles are for member spending, not payroll |
| 12 | Paystack fee absorption | **SwimBuddz absorbs** | Member pays exact Bubble price (₦2,500 = 25 🫧, no surcharge). Processing fees are a cost of business. Minimum 25 🫧 topup keeps worst-case fee at ~5.5% |
| 13 | Pool processing fee (₦100) | **Included in Bubble price** | ₦100 = 1 Bubble, rolled into pool fee. Standard pool = 21 🫧 (not 20 + ₦100). Single currency per transaction, no split payments |

## 15. Transaction Description Templates

Standard pattern: **[Action verb] — [Context] ([Amount])**

Keep descriptions short — they render on mobile in a list. The member should understand what happened in one glance.

### Topups

```
Added {amount} 🫧 via Paystack
Added {amount} 🫧 via bank transfer
Added {amount} 🫧 — admin adjustment
```

### Session / Attendance

```
Pool fee — {session_name}, {pool_name} ({amount} 🫧)
Ride share — {session_name}, {pool_name} ({amount} 🫧)
No-show penalty — {session_name}, {date} ({amount} 🫧)
```

Examples:
- `Pool fee — Morning Swim, Yaba Pool (21 🫧)`
- `Pool fee — Evening Swim, VI Pool (51 🫧)`
- `Ride share — Morning Swim, Yaba Pool (10 🫧)`
- `No-show penalty — Morning Swim, Jan 15 (10 🫧)`

### Store

```
Store — {product_name} ({amount} 🫧)
Store — Order #{order_ref} ({amount} 🫧)
Store — Delivery fee ({amount} 🫧)
```

Examples:
- `Store — Speedo Goggles (150 🫧)`
- `Store — Order #SB-2026-A1B2 (230 🫧)`
- `Store — Delivery fee (20 🫧)`

### Academy

```
Enrollment — {program_name}, {cohort_name} ({amount} 🫧)
```

Example: `Enrollment — Learn to Swim, Batch 3 (1,500 🫧)`

### Events

```
Event — {event_name}, {date} ({amount} 🫧)
```

Example: `Event — Community Swim Meet, Feb 20 (20 🫧)`

### Transport

```
Ride share — {pool_name}, {date} ({amount} 🫧)
```

Example: `Ride share — Yaba Pool, Jan 15 (10 🫧)`

### Refunds

```
Refund — Pool fee, {session_name} {date} ({amount} 🫧)
Refund — Store order #{order_ref} ({amount} 🫧)
Refund — Event, {event_name} ({amount} 🫧)
```

### Welcome Bonus

```
Welcome bonus — thanks for joining SwimBuddz! (10 🫧)
```

### Promotional

```
Promo — {campaign_name} ({amount} 🫧)
Promo expired — {campaign_name} ({amount} 🫧)
```

Examples:
- `Promo — Independence Day bonus (20 🫧)`
- `Promo expired — Independence Day bonus (15 🫧)`

### Admin Adjustments

```
Adjustment — credited by admin ({amount} 🫧)
Adjustment — debited by admin ({amount} 🫧)
```

### Referrals (Phase 3)

```
Referral reward — {referee_name} joined ({amount} 🫧)
Referral bonus — invited by {referrer_name} ({amount} 🫧)
Ambassador bonus — 10 successful referrals! ({amount} 🫧)
```

### Rewards (Phase 3)

```
Reward — attended {session_count} sessions this month ({amount} 🫧)
Reward — {streak_weeks}-week attendance streak! ({amount} 🫧)
Welcome back! Thanks for returning to SwimBuddz ({amount} 🫧)
First topup bonus — welcome to Bubbles! ({amount} 🫧)
Reward — upgraded to {new_tier} ({amount} 🫧)
Congratulations! Graduated from {program_name} ({amount} 🫧)
Volunteer reward — {event_name} ({amount} 🫧)
```

> Full list of reward transaction templates in [REWARDS_ENGINE_DESIGN.md](./REWARDS_ENGINE_DESIGN.md) Section 10.3.

### Family/Group Transfers (Phase 4)

```
Transfer from {parent_name} ({amount} 🫧)
Transfer to {child_name} ({amount} 🫧)
```

---

## 16. Admin Dashboard Specification

### Main Page: `/admin/wallet`

**Top Stats Bar (4 cards, always visible):**

| Card | Value | Description |
|---|---|---|
| Total Wallets | `1,247` | All wallets created |
| Active Bubbles | `45,320 🫧` | Sum of all wallet balances (Bubbles in circulation) |
| Spent This Month | `12,850 🫧` | Total debit transactions this calendar month |
| Topup Revenue | `₦3,240,000` | Total Naira collected via topups this month |

**Tab Navigation:**

### Tab 1: Wallets

**Table columns:**

| Column | Description |
|---|---|
| Member | Name + email |
| Balance | Current 🫧 balance |
| Lifetime Spent | Total 🫧 ever debited |
| Status | Active / Frozen / Suspended / Closed |
| Created | Date wallet was created |
| Actions | View details, Freeze/Unfreeze, Adjust balance |

**Filters:**
- Status: All / Active / Frozen / Suspended / Closed
- Balance range: min–max slider or input
- Created date range: date picker
- Search: member name or email (debounced, 300ms)
- Sort by: Balance (high→low, low→high), Created date (newest, oldest), Lifetime spent

**Row click:** Opens wallet detail drawer/page showing:
- Full wallet info (all fields)
- Recent transactions (last 20)
- Promotional grants received
- Audit log entries for this wallet

### Tab 2: Transactions

**Table columns:**

| Column | Description |
|---|---|
| Date | Timestamp (relative: "2 hours ago", absolute on hover) |
| Member | Name |
| Type | Topup / Purchase / Refund / Penalty / Promo / Welcome / Admin / etc. |
| Direction | ↑ Credit (green) / ↓ Debit (red) |
| Amount | 🫧 value |
| Balance After | 🫧 balance after transaction |
| Service | Which service initiated (attendance, store, academy, etc.) |
| Description | Transaction description text |

**Filters:**
- Transaction type: multi-select dropdown (Topup, Purchase, Refund, Penalty, Promotional, Welcome Bonus, Admin Adjustment, Reward, Expiry)
- Direction: All / Credit only / Debit only
- Service source: All / Attendance / Academy / Store / Events / Transport / System / Admin
- Date range: date picker
- Member search: name or email
- Amount range: min–max

### Tab 3: Topups

**Table columns:**

| Column | Description |
|---|---|
| Date | Timestamp |
| Member | Name |
| Bubbles | Amount of 🫧 |
| Naira | ₦ amount charged |
| Method | Paystack / Bank transfer / Admin grant |
| Status | Pending / Processing / Completed / Failed / Expired |
| Payment Ref | Paystack reference (clickable) |

**Filters:**
- Status: All / Pending / Processing / Completed / Failed / Expired
- Payment method: All / Paystack / Bank transfer / Admin grant
- Date range
- Member search
- Amount range

### Tab 4: Grants

**Table columns:**

| Column | Description |
|---|---|
| Date | When granted |
| Member | Name |
| Type | Welcome Bonus / Campaign / Compensation / Loyalty / Manual |
| Amount | 🫧 granted |
| Remaining | 🫧 unspent from this grant |
| Expires | Expiry date or "Never" |
| Granted By | Admin name or "System" |
| Campaign | Campaign code if applicable |

**Filters:**
- Grant type: multi-select
- Has remaining: Yes / No (to find unused grants)
- Expiry: Expired / Active / Never expires
- Date range
- Member search

**Action button: "Issue Bubbles"** → Opens modal:

```
┌─────────────────────────────────────┐
│  Issue Promotional Bubbles          │
│                                     │
│  Recipient:                         │
│  ○ Single member  ○ Bulk (CSV)      │
│  [Search member by name/email    ]  │
│                                     │
│  Amount: [___] 🫧                   │
│                                     │
│  Grant type: [Welcome Bonus    ▾]   │
│                                     │
│  Reason: (required)                 │
│  [________________________________] │
│  [________________________________] │
│                                     │
│  Expiry:                            │
│  ○ Default (60 days)                │
│  ○ Custom date [date picker]        │
│  ○ Never expires                    │
│                                     │
│  Campaign code: (optional)          │
│  [________________________________] │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Preview:                    │    │
│  │ Grant 50 🫧 to John Doe    │    │
│  │ Type: Campaign              │    │
│  │ Expires: April 18, 2026     │    │
│  │ Reason: Independence Day... │    │
│  └─────────────────────────────┘    │
│                                     │
│  [Cancel]              [Confirm]    │
└─────────────────────────────────────┘
```

### Tab 5: Audit Log

**Table columns:**

| Column | Description |
|---|---|
| Date | Timestamp |
| Admin | Who performed the action |
| Action | Freeze / Unfreeze / Suspend / Close / Admin Credit / Admin Debit / Tier Change |
| Member | Affected wallet owner |
| Details | Old value → New value summary |
| Reason | Why the action was taken |

**Filters:**
- Action type: multi-select
- Admin: search by name
- Date range
- Member search

---

## 17. Error Messages & Member-Facing Copy

All error messages should be **clear, helpful, and non-technical.** The member should know what happened and what to do next. Design for mobile — short sentences, large tap targets on action buttons.

### Insufficient Balance

```
Title:    Not enough Bubbles
Message:  You need {required} 🫧 but have {balance} 🫧.
          Top up {difference} more to continue.
Actions:  [Top up now]  [Cancel]
```

Example: "You need 21 🫧 but have 10 🫧. Top up 11 more to continue."

### Wallet Frozen

```
Title:    Wallet temporarily suspended
Message:  Your wallet has been paused by an admin.
          Please contact support for more information.
Actions:  [Contact support]
```

> Do NOT tell the member why the wallet was frozen — that's between admin and the member directly.

### Wallet Not Found

```
Title:    Setting up your wallet...
Message:  We're creating your Bubble wallet.
          This usually takes a moment. Please refresh and try again.
Actions:  [Refresh]
```

> This shouldn't happen if wallet is auto-created on registration, but handle it defensively.

### Topup Failed (Paystack Error)

```
Title:    Payment didn't go through
Message:  Your bank or card provider declined the transaction.
          This could be a network issue — please try again
          or use a different payment method.
Actions:  [Try again]  [Change payment method]
```

### Topup Below Minimum

```
Title:    Minimum top-up is 25 🫧
Message:  Enter an amount of 25 Bubbles (₦2,500) or more.
Actions:  (inline validation — no modal, show below input field)
```

### Topup Above Maximum

```
Title:    Maximum top-up is 5,000 🫧
Message:  Enter an amount of 5,000 Bubbles (₦500,000) or less.
          Need more? Contact support.
Actions:  (inline validation — no modal, show below input field)
```

### Topup Pending (Waiting for Paystack Confirmation)

```
Title:    Payment processing
Message:  Your payment is being confirmed.
          This usually takes a few seconds.
          Your Bubbles will appear once confirmed.
Actions:  [Check status]
```

### Service Unavailable (Wallet Service Down)

```
Title:    Wallet temporarily unavailable
Message:  We're having a brief technical issue.
          Your Bubbles are safe — please try again in a few minutes.
Actions:  [Try again]
```

### Duplicate Transaction (Idempotency Key Hit)

```
No error shown to member — silently return the existing transaction.
This is a backend concern, not a UX concern.
Log it server-side for monitoring.
```

### Admin Adjustment Notification

```
Title:    Wallet adjusted
Message:  An admin has {credited/debited} {amount} 🫧 {to/from} your wallet.
          Reason: {reason}
Actions:  [View transaction]
```

### Promotional Bubbles Expiring Soon (Push Notification / In-App)

```
Title:    Bubbles expiring soon!
Message:  You have {amount} 🫧 from "{campaign_name}" expiring in {days} days.
          Use them before {expiry_date}!
Actions:  [View wallet]
```

> Send at 7 days and 1 day before expiry.

### Successful Topup

```
Title:    Bubbles added!
Message:  {amount} 🫧 have been added to your wallet.
          New balance: {new_balance} 🫧
Actions:  [View wallet]
```

### Successful Purchase (Debit)

```
Title:    Payment confirmed
Message:  {amount} 🫧 deducted for {description}.
          Remaining balance: {new_balance} 🫧
Actions:  [View receipt]
```

---

## 18. Open Questions (Remaining)

All major design questions have been resolved. The design is ready for Phase 1 implementation.

---

*Last updated: February 2026*
