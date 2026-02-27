# Database Schema Reference

This document provides database schema documentation for SwimBuddz services, with a focus on shared types and conventions.

---

## String-Based Enum Pattern

SwimBuddz uses **strings** in the database for enum-like fields instead of PostgreSQL ENUM types. This provides:
- Simpler migrations (no `ALTER TYPE` needed to add values)
- No cross-service enum dependency issues
- Easier to evolve over time

**Validation is handled at the application layer:**
- Python enums in `models.py` define valid values
- Pydantic schemas validate API input/output
- Database stores plain strings

---

## Shared Enum Values

These enum values are used across multiple services. The Python enums are defined in each service's `models.py` but must stay synchronized.

### CoachGrade

**Used in:** `members_service`, `academy_service`

| Value | Description | Score Range |
|-------|-------------|-------------|
| `grade_1` | Foundational - Entry-level coaches | 7-14 |
| `grade_2` | Technical - Experienced coaches | 15-24 |
| `grade_3` | Advanced/Specialist - Expert coaches | 25-35 |

**Python Definition:**
```python
class CoachGrade(str, enum.Enum):
    GRADE_1 = "grade_1"  # Foundational
    GRADE_2 = "grade_2"  # Technical
    GRADE_3 = "grade_3"  # Advanced/Specialist
```

**Database columns using this:**
- `members.coach_profiles.learn_to_swim_grade`
- `members.coach_profiles.special_populations_grade`
- `members.coach_profiles.institutional_grade`
- `members.coach_profiles.competitive_elite_grade`
- `members.coach_profiles.certifications_grade`
- `members.coach_profiles.specialized_disciplines_grade`
- `members.coach_profiles.adjacent_services_grade`
- `academy.cohorts.required_coach_grade`
- `academy.cohort_complexity_scores.required_coach_grade`

---

### ProgramCategory

**Used in:** `academy_service`

| Value | Description |
|-------|-------------|
| `learn_to_swim` | Basic swimming instruction for beginners |
| `special_populations` | Adapted programs (seniors, disabilities, trauma-informed) |
| `institutional` | School, corporate, or organization programs |
| `competitive_elite` | Competition training and elite performance |
| `certifications` | Lifeguard, instructor, and other certifications |
| `specialized_disciplines` | Open water, synchronized swimming, etc. |
| `adjacent_services` | Fitness, therapy, and related services |

**Python Definition:**
```python
class ProgramCategory(str, enum.Enum):
    LEARN_TO_SWIM = "learn_to_swim"
    SPECIAL_POPULATIONS = "special_populations"
    INSTITUTIONAL = "institutional"
    COMPETITIVE_ELITE = "competitive_elite"
    CERTIFICATIONS = "certifications"
    SPECIALIZED_DISCIPLINES = "specialized_disciplines"
    ADJACENT_SERVICES = "adjacent_services"
```

**Database columns using this:**
- `academy.cohort_complexity_scores.category`

---

## Service-Specific Enums

These enums are used within a single service.

### Academy Service

| Enum | Values | Used In |
|------|--------|---------|
| `ProgramLevel` | `beginner_1`, `beginner_2`, `intermediate`, `advanced`, `specialty` | `programs.level` |
| `BillingType` | `one_time`, `subscription`, `per_session` | `programs.billing_type` |
| `CohortStatus` | `open`, `active`, `completed`, `cancelled` | `cohorts.status` |
| `LocationType` | `pool`, `open_water`, `remote` | `cohorts.location_type` |
| `EnrollmentStatus` | `pending_approval`, `enrolled`, `waitlist`, `dropped`, `graduated` | `enrollments.status` |
| `PaymentStatus` | `pending`, `paid`, `failed`, `waived` | `enrollments.payment_status` |
| `MilestoneType` | `skill`, `endurance`, `technique`, `assessment` | `milestones.milestone_type` |
| `ProgressStatus` | `pending`, `achieved` | `student_progress.status` |

### Members Service

| Enum | Values | Used In |
|------|--------|---------|
| `ApprovalStatus` | `pending`, `approved`, `rejected` | `members.approval_status` |
| `CoachStatus` | `draft`, `pending`, `approved`, `rejected`, `inactive` | `coach_profiles.status` |
| `BackgroundCheckStatus` | `not_required`, `pending`, `approved`, `rejected` | `coach_profiles.background_check_status` |

### Sessions Service

| Enum | Values | Used In |
|------|--------|---------|
| `SessionType` | `community`, `club`, `academy`, `private` | `sessions.session_type` |
| `SessionStatus` | `scheduled`, `in_progress`, `completed`, `cancelled` | `sessions.status` |

### Payments Service

| Enum | Values | Used In |
|------|--------|---------|
| `PaymentPurpose` | `community_membership`, `club_membership`, `academy_enrollment`, `session_fee`, `store_purchase` | `payments.purpose` |
| `PaymentStatus` | `pending`, `successful`, `failed`, `refunded` | `payments.status` |

### Wallet Service

| Enum | Values | Used In |
|------|--------|---------|
| `WalletStatus` | `active`, `frozen`, `suspended`, `closed` | `wallets.status` |
| `WalletTier` | `standard`, `premium`, `vip` | `wallets.tier` |
| `TransactionType` | `topup`, `purchase`, `refund`, `session_fee`, `event_fee`, `store_purchase`, `academy_fee`, `transport_fee`, `promotional_credit`, `reward_credit`, `admin_adjustment`, `welcome_bonus` | `wallet_transactions.transaction_type` |
| `TransactionDirection` | `credit`, `debit` | `wallet_transactions.direction` |
| `TransactionStatus` | `completed`, `pending`, `failed`, `reversed` | `wallet_transactions.status` |
| `TopupStatus` | `pending`, `processing`, `completed`, `failed`, `expired` | `wallet_topups.status` |
| `PaymentMethod` | `paystack`, `bank_transfer`, `admin` | `wallet_topups.payment_method` |
| `GrantType` | `welcome_bonus`, `promotional`, `event_reward`, `referral_bonus`, `loyalty`, `compensation`, `admin_grant` | `promotional_bubble_grants.grant_type` |
| `ReferralStatus` | `pending`, `completed`, `expired`, `cancelled` | `referral_records.status` |
| `AuditAction` | `freeze`, `unfreeze`, `adjust_balance`, `grant_bubbles`, `update_tier`, `manual_override` | `wallet_audit_logs.action` |

---

## Tables by Service

### Members Service

| Table | Description |
|-------|-------------|
| `members` | Core member identity and auth linkage |
| `member_profiles` | Extended profile information |
| `member_memberships` | Tier subscriptions and status |
| `member_preferences` | Swimming preferences |
| `member_availabilities` | Schedule availability |
| `member_emergency_contacts` | Emergency contact info |
| `coach_profiles` | Coach-specific information and grades |
| `coach_bank_accounts` | Coach payout information |
| `coach_payouts` | Payout history |
| `pending_registrations` | Incomplete registrations |
| `club_challenges` | Challenge definitions |
| `member_challenge_completions` | Challenge completion records |
| `volunteer_roles` | Available volunteer positions |
| `volunteer_interests` | Member volunteer signups |

### Academy Service

| Table | Description |
|-------|-------------|
| `programs` | Program definitions |
| `program_curricula` | Versioned curricula |
| `curriculum_weeks` | Weekly curriculum breakdown |
| `curriculum_lessons` | Individual lessons |
| `skills` | Reusable skill library |
| `lesson_skills` | Junction: lessons to skills |
| `cohorts` | Program cohort instances |
| `cohort_resources` | Cohort-specific materials |
| `cohort_complexity_scores` | Complexity scoring for coach assignment |
| `enrollments` | Student enrollments |
| `milestones` | Program milestones |
| `student_progress` | Student milestone progress |
| `program_interests` | Waitlist/interest signups |

### Sessions Service

| Table | Description |
|-------|-------------|
| `sessions` | Scheduled sessions |
| `session_templates` | Recurring session templates |
| `session_coaches` | Coach assignments to sessions |
| `session_ride_configs` | Ride-share configuration |

### Attendance Service

| Table | Description |
|-------|-------------|
| `attendance_records` | Session attendance tracking |

### Communications Service

| Table | Description |
|-------|-------------|
| `announcements` | Platform announcements |
| `announcement_reads` | Read tracking |
| `announcement_comments` | Comments on announcements |
| `announcement_category_configs` | Category settings |
| `content_posts` | Blog/content posts |
| `content_comments` | Comments on posts |
| `message_logs` | Notification history |
| `notification_preferences` | User notification settings |

### Payments Service

| Table | Description |
|-------|-------------|
| `payments` | Payment transactions |
| `discounts` | Discount codes |

### Events Service

| Table | Description |
|-------|-------------|
| `events` | Community events |
| `event_rsvps` | Event RSVPs |

### Media Service

| Table | Description |
|-------|-------------|
| `media_items` | Uploaded files and URLs |
| `media_tags` | Media tagging |
| `albums` | Photo albums |
| `album_items` | Album contents |
| `site_assets` | Platform assets |

### Transport Service

| Table | Description |
|-------|-------------|
| `ride_areas` | Service areas |
| `pickup_locations` | Pickup points |
| `ride_bookings` | Ride reservations |
| `route_info` | Route definitions |

### Store Service

| Table | Description |
|-------|-------------|
| `store_products` | Product catalog |
| `store_product_variants` | Size/color variants |
| `store_product_images` | Product images |
| `store_categories` | Product categories |
| `store_collections` | Curated collections |
| `store_collection_products` | Collection membership |
| `store_inventory_items` | Inventory tracking |
| `store_inventory_movements` | Stock movements |
| `store_carts` | Shopping carts |
| `store_cart_items` | Cart contents |
| `store_orders` | Customer orders |
| `store_order_items` | Order line items |
| `store_pickup_locations` | Store pickup points |
| `store_credits` | Store credit balances |
| `store_credit_transactions` | Credit history |
| `store_audit_logs` | Admin action logs |

### Wallet Service

| Table | Description |
|-------|-------------|
| `wallets` | Member wallet accounts with balance and tier (Phase 1) |
| `wallet_transactions` | All debit/credit transaction records (Phase 1) |
| `wallet_topups` | Paystack topup requests and status tracking (Phase 1) |
| `promotional_bubble_grants` | Admin-issued promotional Bubbles (Phase 1) |
| `wallet_audit_logs` | Admin action audit trail (Phase 1) |
| `referral_codes` | Member referral codes (Phase 3 stub) |
| `referral_records` | Referral tracking and rewards (Phase 3 stub) |
| `reward_rules` | Configurable reward rules (Phase 3 stub) |
| `wallet_events` | Wallet-related event log (Phase 3 stub) |
| `member_reward_history` | Member reward earning history (Phase 3 stub) |
| `family_wallet_links` | Linked family wallet relationships (Phase 4 stub) |
| `corporate_wallets` | Corporate/organization wallets (Phase 5 stub) |
| `corporate_wallet_members` | Corporate wallet member assignments (Phase 5 stub) |

---

## Adding New Enum Values

When adding new values to a shared enum:

1. **Update all service `models.py` files** that define the enum
2. **Update Pydantic schemas** if they reference the enum
3. **Update this documentation**
4. **No migration needed** - strings can hold any value

Example:
```python
# If adding GRADE_4 to CoachGrade:

# 1. Update academy_service/models.py
class CoachGrade(str, enum.Enum):
    GRADE_1 = "grade_1"
    GRADE_2 = "grade_2"
    GRADE_3 = "grade_3"
    GRADE_4 = "grade_4"  # New!

# 2. Update members_service/models.py (same change)

# 3. Update this docs file

# 4. No database migration needed!
```

---

## Migration Workflow

See [CLAUDE.md](../../CLAUDE.md) for detailed migration commands.

**Quick reference:**
```bash
# Generate migration after model change
./scripts/db/migrate.sh <service>_service "description"

# Apply migrations (dev)
./scripts/db/reset.sh dev

# Apply migrations (production - NEVER reset!)
alembic -c services/<service>_service/alembic.ini upgrade head
```

---

*Last updated: February 2026*
