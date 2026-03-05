# SwimBuddz Store: Supplier System

**Version:** 1.0
**Date:** February 2026
**Status:** Phase 1 — SwimBuddz as Supplier #001

---

## Overview

This document defines how SwimBuddz manages suppliers — the entities that source, provide, and fulfill physical products sold through the SwimBuddz Store. It covers the full lifecycle from first-party operations (Phase 1) through to an open supplier marketplace (Phase 3).

**Core principle:** SwimBuddz is Supplier #001. Every rule, constraint, and SLA that will apply to external suppliers must first be tested internally.

---

## Table of Contents

1. [Supplier Model](#1-supplier-model)
2. [Phase 1: First-Party Store](#2-phase-1-first-party-store)
3. [Phase 2: Vetted Supplier Partners](#3-phase-2-vetted-supplier-partners)
4. [Phase 3: Open Supplier Marketplace](#4-phase-3-open-supplier-marketplace)
5. [Supplier Onboarding](#5-supplier-onboarding)
6. [Commission & Financial Model](#6-commission--financial-model)
7. [Quality Standards & SLAs](#7-quality-standards--slas)
8. [Supplier Data Model](#8-supplier-data-model)
9. [Supplier Admin System](#9-supplier-admin-system)
10. [Integration with Existing Services](#10-integration-with-existing-services)
11. [Access Model: Public Visibility, Gated Advantage](#11-access-model-public-visibility-gated-advantage)
12. [Fulfillment & Distribution](#12-fulfillment--distribution)
13. [Risk Register](#13-risk-register)
14. [Transition Conditions](#14-transition-conditions)
15. [What the Supplier System Is NOT](#15-what-the-supplier-system-is-not)

---

## 1. Supplier Model

### What is a Supplier?

A supplier is any entity that sources and provides products for sale on the SwimBuddz Store. This includes SwimBuddz itself.

| Attribute          | Description                                     |
| ------------------ | ----------------------------------------------- |
| **Identity**       | Name, contact, business details                 |
| **Verification**   | Vetted and approved by SwimBuddz                |
| **Commission**     | Percentage SwimBuddz retains per sale           |
| **Sourcing types** | Stocked, preorder, dropship, consignment        |
| **SLA**            | Fulfillment commitments (packing time, quality) |
| **Status**         | Active, suspended, probation, inactive          |

### Why SwimBuddz is Supplier #001

SwimBuddz treats itself as its own first supplier to:

- **Dogfood the system** — if it can't survive SwimBuddz as a supplier, it will collapse with external suppliers
- **Learn real margins** — COGS, commission viability, fulfillment friction
- **Build tooling** — supplier management, SLA tracking, commission reporting all get tested on real transactions
- **Enforce financial separation** — SwimBuddz operates with its own business account; supplier economics must be visible and sustainable independently

---

## 2. Phase 1: First-Party Store

> **Current phase.** SwimBuddz sources, stocks, and sells all products.

### How it works

- **One supplier:** SwimBuddz (Supplier #001)
- **Sourcing:** SwimBuddz buys inventory directly from importers/manufacturers
- **Pricing:** SwimBuddz sets all prices
- **Fulfillment:** SwimBuddz handles packing and pool pickup / delivery
- **Commission:** 100% to SwimBuddz (tracked internally for modeling)
- **Brand:** Members see "SwimBuddz Store" — no supplier visibility

### What to track (real data for later phases)

| Metric                     | Why it matters                                                             |
| -------------------------- | -------------------------------------------------------------------------- |
| **COGS per SKU**           | `cost_price_ngn` on Product — reveals true margin per item                 |
| **Gross margin**           | `(sell_price - cost_price) / sell_price` — sets floor for commission model |
| **Fulfillment time**       | Time from order-paid to ready-for-pickup — establishes realistic SLAs      |
| **Return/complaint rate**  | Per category — identifies high-risk product types                          |
| **Demand by category**     | Which SKUs move, which don't — informs what external suppliers should list |
| **Bubbles vs Naira split** | What percentage of orders use wallet — affects supplier payout timing      |

### SKU Strategy (Phase 1 MVP)

Start with 3-5 products. Do not exceed 8 SKUs in Phase 1.

| Product                   | Sourcing | Why                                                    |
| ------------------------- | -------- | ------------------------------------------------------ |
| Goggles (2 tiers)         | Stocked  | Predictable demand, low risk, every swimmer needs them |
| Swim caps                 | Stocked  | Cheap, moves fast, no sizing complexity                |
| Nose clips / ear plugs    | Stocked  | Low cost, high margin, impulse buy                     |
| Kickboard (optional)      | Preorder | Bulky, test demand before stocking                     |
| Anti-fog spray (optional) | Stocked  | Consumable, repeat purchase                            |

> [!IMPORTANT]
> **Avoid in Phase 1:** Complex apparel sizing, fashion merch, custom manufacturing, too many variants. These introduce return risk and ops complexity before you have the volume to justify it.

---

## 3. Phase 2: Vetted Supplier Partners

> **Trigger:** When external vendors start asking to list on SwimBuddz, or when Phase 1 data shows demand SwimBuddz can't serve alone.

### How it works

- **Multiple suppliers:** SwimBuddz + 2-5 vetted partners ("Featured Partners")
- **Onboarding:** Application → vetting → probation → full partner
- **Product ownership:** Each product has a `supplier_id` — inventory and fulfillment owned by the supplier
- **Commission:** SwimBuddz retains 10-20% per sale (configurable per supplier)
- **Quality control:** SwimBuddz approves every product listing before it goes live
- **Brand:** Members still see "SwimBuddz Store" — suppliers are invisible unless opted in
- **Payouts:** Suppliers receive (sale_price × (1 - commission)) after fulfillment confirmed

### What changes from Phase 1

| Component        | Phase 1                    | Phase 2                                              |
| ---------------- | -------------------------- | ---------------------------------------------------- |
| Product creation | Admin creates all products | Admin creates OR supplier submits for approval       |
| Inventory        | Admin manages all stock    | Supplier manages own stock (admin can override)      |
| Fulfillment      | SwimBuddz packs everything | Supplier ships to pickup location or directly        |
| Pricing          | Admin sets all prices      | Supplier proposes, SwimBuddz approves (within bands) |
| Commission       | 100% (self)                | 10-20% to platform, rest to supplier                 |
| Admin UI         | Single-supplier view       | Supplier filter on all admin views                   |

### Phase 2 backend requirements

| Feature                         | Description                                            | Priority     |
| ------------------------------- | ------------------------------------------------------ | ------------ |
| **Supplier CRUD**               | Admin endpoints to create/manage suppliers             | Required     |
| **Supplier product submission** | Supplier submits product for approval → goes to draft  | Required     |
| **Commission tracking**         | Per-order commission calculation and ledger            | Required     |
| **Payout tracking**             | Supplier payout records with status (pending → paid)   | Required     |
| **Supplier-scoped admin views** | Filter products/orders/inventory by supplier           | Required     |
| **Supplier notifications**      | New order, payout processed, product approved/rejected | Nice to have |

### Phase 2 frontend requirements

| Feature                               | Description                                               | Priority     |
| ------------------------------------- | --------------------------------------------------------- | ------------ |
| **Admin supplier management page**    | `/admin/store/suppliers` — list, create, edit, suspend    | Required     |
| **Admin supplier detail page**        | `/admin/store/suppliers/{id}` — products, orders, payouts | Required     |
| **Supplier product badge** (optional) | "By [Partner Name]" on product card if opted in           | Nice to have |

---

## 4. Phase 3: Open Supplier Marketplace

> **Trigger:** See [Transition Conditions](#14-transition-conditions). Requires all three conditions met.

### How it works

- **Self-service supplier portal:** Suppliers register, submit products, manage inventory, track payouts
- **Automated product moderation:** Product listings go through approval workflow
- **Supplier tiers:** Standard, Premium, Featured — with different commission rates and visibility
- **Supplier dashboard:** Separate auth role for supplier users
- **Dispute resolution:** Formalized process for quality issues, returns, complaints

### Phase 3 is NOT current scope

This phase is documented for architectural planning only. No code should be written for Phase 3 until Phase 2 is operating smoothly with at least 3 external suppliers.

---

## 5. Supplier Onboarding

### Phase 1: Self-onboarding

SwimBuddz creates Supplier #001 via seed data. No onboarding flow needed.

### Phase 2: Admin-managed onboarding

```
1. Vendor approaches SwimBuddz (or SwimBuddz identifies a vendor)
2. Admin creates Supplier record (name, contact, commission rate)
3. Supplier receives onboarding info (SLAs, quality standards, packing guide)
4. Supplier submits first product batch for review
5. Admin reviews and approves/rejects each product
6. Approved products go live on store
7. Supplier enters 90-day probation period
8. After probation: full partner status (or extend/reject)
```

### Vetting criteria

| Criterion                  | What to verify                                   |
| -------------------------- | ------------------------------------------------ |
| **Product authenticity**   | Are these genuine products? (not counterfeit)    |
| **Pricing sanity**         | Is the pricing competitive for the Lagos market? |
| **Fulfillment capability** | Can they deliver to pickup locations within SLA? |
| **Communication**          | Responsive? Reachable during business hours?     |
| **Track record**           | Have they sold this type of product before?      |

### Contract language

Suppliers are onboarded as **"Featured Partners"**, not "sellers" or "vendors" on the platform. This positions SwimBuddz as the curator, not a directory.

---

## 6. Commission & Financial Model

### Commission structure

| Phase   | Commission (SwimBuddz retains)     | Supplier receives |
| ------- | ---------------------------------- | ----------------- |
| Phase 1 | 100% (self)                        | N/A               |
| Phase 2 | 10-20% (configurable per supplier) | 80-90%            |
| Phase 3 | 10-25% (tiered by supplier level)  | 75-90%            |

### How commission is calculated

```
Order total: ₦12,000 (goggles)
Commission rate: 15%

SwimBuddz retains: ₦12,000 × 0.15 = ₦1,800
Supplier receives: ₦12,000 × 0.85 = ₦10,200
```

### What commission covers (SwimBuddz side)

- Platform infrastructure and hosting
- Payment processing (Paystack fees)
- Customer support
- Quality moderation
- Marketing and member acquisition
- Bubbles wallet subsidy (welcome bonuses, promotional grants)

### COGS tracking

Every product should track `cost_price_ngn` — the price SwimBuddz (or the supplier) paid to acquire the item.

```
Gross margin = (base_price_ngn - cost_price_ngn) / base_price_ngn

Example:
  Goggles sell price: ₦12,000
  Goggles cost price: ₦8,000
  Gross margin: 33%

  If commission is 15%, effective margin for supplier:
  Revenue after commission: ₦10,200
  COGS: ₦8,000
  Net margin: ₦2,200 (18%)
```

This data answers: "Can an external supplier survive on our platform?"

### Payout model (Phase 2+)

| Model                | Description                                                | When to use                       |
| -------------------- | ---------------------------------------------------------- | --------------------------------- |
| **Post-fulfillment** | Supplier paid after order marked `picked_up` / `delivered` | Default — lowest risk             |
| **Weekly batch**     | All fulfilled orders settled weekly                        | When trust established            |
| **Monthly**          | Monthly settlement with detailed report                    | Corporate/institutional suppliers |

---

## 7. Quality Standards & SLAs

### Fulfillment SLAs

| Metric                       | Target                                     | Measurement                                  |
| ---------------------------- | ------------------------------------------ | -------------------------------------------- |
| **Order acknowledgment**     | Within 4 hours of payment                  | Time from `paid` to `processing`             |
| **Packing**                  | Within 24 hours                            | Time from `processing` to `ready_for_pickup` |
| **Pickup availability**      | At designated location by next session day | Aligned with session schedule                |
| **Delivery** (if applicable) | Within 48 hours of packing                 | Time from `shipped` to `delivered`           |

### Product quality standards

| Standard                 | Requirement                                           |
| ------------------------ | ----------------------------------------------------- |
| **Authenticity**         | All products must be genuine. No counterfeits.        |
| **Condition**            | Items must be new, undamaged, in original packaging   |
| **Description accuracy** | Product listing must match the actual product         |
| **Images**               | Real product photos (no stock photos unless approved) |
| **Sizing**               | Must provide accurate size chart with measurements    |

### SLA violations

| Violation           | First                | Second              | Third      |
| ------------------- | -------------------- | ------------------- | ---------- |
| Late fulfillment    | Warning              | Probation (30 days) | Suspension |
| Product mismatch    | Warning + replace    | Probation           | Suspension |
| Counterfeit product | Immediate suspension | Permanent ban       | —          |
| Unresponsive (48h+) | Warning              | Probation           | Suspension |

---

## 8. Supplier Data Model

### New: `store_suppliers` table

```sql
store_suppliers (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,          -- "SwimBuddz (First-Party)", "AquaGear Lagos"
  slug VARCHAR(255) UNIQUE NOT NULL,   -- url-friendly identifier

  -- Contact
  contact_name VARCHAR(255),           -- primary contact person
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  description TEXT,                     -- internal notes

  -- Financial
  commission_percent DECIMAL(5,2),     -- e.g., 15.00 = 15% platform take
  payout_bank_name VARCHAR(255),       -- supplier bank details (Phase 2)
  payout_account_number VARCHAR(50),
  payout_account_name VARCHAR(255),

  -- Status
  is_verified BOOLEAN DEFAULT false,   -- vetted by SwimBuddz
  status VARCHAR(20) DEFAULT 'active', -- active, probation, suspended, inactive
  probation_ends_at TIMESTAMPTZ,

  -- Metrics (updated periodically)
  total_products INT DEFAULT 0,
  total_orders INT DEFAULT 0,
  average_fulfillment_hours DECIMAL(8,2),

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Modified: `store_products` table

```diff
 store_products (
   ...
+  supplier_id UUID REFERENCES store_suppliers(id) ON DELETE SET NULL,
+  cost_price_ngn DECIMAL(12,2),        -- what we paid for it (COGS)
   ...
 )
```

### Modified: `store_orders` / `store_order_items`

Phase 2 addition — snapshot supplier at order time:

```diff
 store_order_items (
   ...
+  supplier_id UUID,                    -- snapshot: which supplier fulfilled this item
+  supplier_name VARCHAR(255),          -- snapshot: supplier name at time of order
   ...
 )
```

### Future: `store_supplier_payouts` table (Phase 2)

```sql
store_supplier_payouts (
  id UUID PRIMARY KEY,
  supplier_id UUID REFERENCES store_suppliers(id),
  payout_period_start DATE,
  payout_period_end DATE,
  total_sales_ngn DECIMAL(12,2),
  commission_ngn DECIMAL(12,2),
  payout_amount_ngn DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, paid, failed
  paid_at TIMESTAMPTZ,
  payment_reference VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Sourcing types (expanded)

```python
class SourcingType(str, enum.Enum):
    STOCKED = "stocked"          # In our possession, ready to ship
    PREORDER = "preorder"        # Ordered on demand, lead time applies
    DROPSHIP = "dropship"        # Supplier ships directly to customer (Phase 2)
    CONSIGNMENT = "consignment"  # Supplier's stock, on our shelf (Phase 2)
```

---

## 9. Supplier Admin System

### Phase 1 admin pages (minimal)

| Page            | Route                         | Description                                   |
| --------------- | ----------------------------- | --------------------------------------------- |
| Supplier list   | `/admin/store/suppliers`      | View all suppliers (just SwimBuddz initially) |
| Supplier detail | `/admin/store/suppliers/{id}` | Products, orders, commission summary          |

### Phase 2 admin pages (full)

| Page                     | Route                                 | Description                                           |
| ------------------------ | ------------------------------------- | ----------------------------------------------------- |
| Supplier list            | `/admin/store/suppliers`              | All suppliers with status, product count, performance |
| Supplier create          | `/admin/store/suppliers/new`          | Onboard new supplier                                  |
| Supplier detail          | `/admin/store/suppliers/{id}`         | Full profile: products, orders, payouts, SLA metrics  |
| Supplier payouts         | `/admin/store/suppliers/{id}/payouts` | Payout history and pending settlements                |
| Supplier products filter | `/admin/store/products?supplier={id}` | Products filtered by supplier                         |
| Supplier orders filter   | `/admin/store/orders?supplier={id}`   | Orders filtered by supplier                           |

### Phase 2 API endpoints

```
# Supplier CRUD (admin)
POST   /api/v1/admin/store/suppliers          -- Create supplier
GET    /api/v1/admin/store/suppliers           -- List suppliers
GET    /api/v1/admin/store/suppliers/{id}      -- Get supplier detail
PATCH  /api/v1/admin/store/suppliers/{id}      -- Update supplier
POST   /api/v1/admin/store/suppliers/{id}/suspend    -- Suspend supplier
POST   /api/v1/admin/store/suppliers/{id}/activate   -- Reactivate supplier

# Supplier payouts (admin)
GET    /api/v1/admin/store/suppliers/{id}/payouts     -- Payout history
POST   /api/v1/admin/store/suppliers/{id}/payouts     -- Create payout
PATCH  /api/v1/admin/store/payouts/{id}/status        -- Update payout status

# Supplier reports
GET    /api/v1/admin/store/reports/supplier-performance  -- SLA and sales by supplier
```

---

## 10. Integration with Existing Services

### Wallet Service (Bubbles)

Bubbles integration is the store's unfair advantage:

| Trigger                | Action                                 | Example                                 |
| ---------------------- | -------------------------------------- | --------------------------------------- |
| **Enrollment**         | Auto-credit Bubbles toward starter kit | "Enroll in Academy → 50 🫧 for gear"    |
| **Session milestones** | Earn Bubbles for gear replacement      | "6 sessions → 20 🫧 toward new goggles" |
| **Referral**           | Both parties earn Bubbles for store    | "Refer a friend → 15 🫧 each"           |
| **Store purchase**     | Debit Bubbles via wallet internal API  | Pay with Bubbles at checkout            |

Member tier discounts also apply on top of Bubbles:

| Tier                | Discount | Bubbles + Discount Example |
| ------------------- | -------- | -------------------------- |
| Public (non-member) | 0%       | Goggles: ₦12,000 (120 🫧)  |
| Community           | 5%       | Goggles: ₦11,400 (114 🫧)  |
| Club                | 10%      | Goggles: ₦10,800 (108 🫧)  |
| Academy             | 15%      | Goggles: ₦10,200 (102 🫧)  |

### Communications Service

Existing store email templates in `communications_service/templates/store.py`:

- `store_order_confirmation` — order placed
- `store_order_ready` — ready for pickup

**Additional templates needed (Phase 2):**

- `supplier_new_order` — notify supplier of new order
- `supplier_payout_processed` — payout confirmation
- `supplier_product_approved` — product listing approved
- `supplier_sla_warning` — fulfillment SLA at risk

### Payments Service

Store orders use Paystack via `payments_service`:

- `PaymentPurpose.STORE_ORDER` for standard purchases
- Supplier payouts are separate bank transfers (not through Paystack initially)

---

## 11. Access Model: Public Visibility, Gated Advantage

### Pricing strategy

The store is **publicly visible** but **membership creates economic gravity**:

| Who            | Can browse? | Can buy? | Price        |
| -------------- | ----------- | -------- | ------------ |
| Non-member     | ✅          | ✅       | Full price   |
| Community tier | ✅          | ✅       | 5% discount  |
| Club tier      | ✅          | ✅       | 10% discount |
| Academy tier   | ✅          | ✅       | 15% discount |

Some bundles are **members-only** (starter kits, maintenance kits) — this turns the store into a membership conversion funnel.

### Why this model works

- Creates **economic gravity** into the community (membership saves money)
- Turns membership into a **financial decision**, not emotional begging
- Store acts as a **trust signal** and **authority layer** for non-members browsing
- Members-only bundles create **exclusivity** without blocking revenue

---

## 12. Fulfillment & Distribution

### For SwimBuddz members (primary)

Best distribution channels are **system-driven**, not social media:

| Channel                    | When                       | Example                                                      |
| -------------------------- | -------------------------- | ------------------------------------------------------------ |
| **Enrollment flow**        | After cohort signup        | "Starting Beginner Freestyle → add starter kit"              |
| **Session reminders**      | Before scheduled session   | "Don't forget your goggles — order now, pick up at the pool" |
| **Milestone triggers**     | After progress milestones  | "6 sessions complete → time to replace goggles"              |
| **Post-assessment emails** | After swim readiness score | "Based on your score, we recommend this kit"                 |
| **Academy credit**         | On enrollment              | "Academy members get 10% monthly gear credit"                |

> [!TIP]
> The store should never be the first touchpoint. Distribution path: **Free content → Trust → Community → Programs → Store**

### Pickup vs delivery

| Method             | Default? | Fee         | Details                                       |
| ------------------ | -------- | ----------- | --------------------------------------------- |
| **Session pickup** | ✅ Yes   | Free        | Pick up at pool on session day — best option  |
| **Pool pickup**    | ✅ Yes   | Free        | Pick up during pool operating hours           |
| **Home delivery**  | Optional | ₦2,000 flat | Opt-in, paid, slightly inconvenient by design |

**Why pickup is default:**

- Zero delivery coordination
- Natural bundling with attendance
- Fewer failed deliveries
- Reinforces physical community presence

---

## 13. Risk Register

| Risk                                    | Likelihood | Impact | Mitigation                                                           |
| --------------------------------------- | ---------- | ------ | -------------------------------------------------------------------- |
| **External supplier sends counterfeit** | Medium     | High   | Vetting process, probation period, test orders                       |
| **Supplier misses SLA**                 | Medium     | Medium | SLA tracking, warning system, suspension policy                      |
| **Commission too high for suppliers**   | Medium     | Medium | Phase 1 data reveals viable commission range                         |
| **Supplier inventory mismatch**         | Medium     | Medium | Supplier manages own stock; reconciliation on complaints             |
| **Quality dispute with member**         | Low        | High   | SwimBuddz owns the customer relationship — always resolve for member |
| **Supplier exits suddenly**             | Low        | Medium | SwimBuddz can delist products instantly; stocked items unaffected    |
| **SKU explosion (too many products)**   | Medium     | Low    | Product approval required; category limits per supplier              |

---

## 14. Transition Conditions

### Phase 1 → Phase 2

All three conditions must be true:

| #   | Condition                | Measurement                                                        |
| --- | ------------------------ | ------------------------------------------------------------------ |
| 1   | **Demand concentration** | ≥100 store orders completed, predictable repeat purchase patterns  |
| 2   | **Supplier pull**        | At least 1 external vendor has asked to list on SwimBuddz          |
| 3   | **Ops stability**        | Fulfillment SLA consistently met for 3+ months, <5% complaint rate |

### Phase 2 → Phase 3

All three conditions must be true:

| #   | Condition                | Measurement                                                                     |
| --- | ------------------------ | ------------------------------------------------------------------------------- |
| 1   | **Active supplier base** | ≥3 external suppliers operating on platform                                     |
| 2   | **Self-service demand**  | Suppliers requesting ability to manage own listings                             |
| 3   | **Governance leverage**  | Can delist a supplier without fear; quality standards are established authority |

> [!CAUTION]
> **If the store grows faster than your leverage assets (free challenge, assessment, recorded library, community), you're building a trap.** The store must remain subordinate to the ecosystem.

---

## 15. What the Supplier System Is NOT

- ❌ **Not a Shopify competitor** — this is ecosystem infrastructure, not a standalone e-commerce platform
- ❌ **Not a general marketplace** — only swim-related, SwimBuddz-approved products
- ❌ **Not revenue-first** — the store exists to equip swimmers, not to maximize GMV
- ❌ **Not a separate brand** — suppliers are invisible to members unless explicitly featured
- ❌ **Not an excuse for complexity** — if supplier infrastructure outpaces demand, it's waste

### The north star

> **"The easiest way for a swimmer in Lagos to be properly equipped."**
>
> If you nail that, profit becomes a side effect.

---

## Implementation Status

### ✅ Completed

- Store service scaffolding (models, schemas, routers, admin endpoints)
- Wallet (Bubbles) integration design
- Store email templates in communications service
- Store architecture documentation

### 🔲 Phase 1 — Now

- [ ] Add `Supplier` model to store service
- [ ] Add `supplier_id` and `cost_price_ngn` to Product model
- [ ] Add `dropship` and `consignment` to `SourcingType` enum
- [ ] Seed SwimBuddz as Supplier #001
- [ ] Run initial database migration
- [ ] Add gateway proxy routes for `/store/*`
- [ ] Source 3-5 real products (talk to 1 Lagos swim retailer)
- [ ] Build store frontend pages
- [ ] Test end-to-end: checkout → Bubbles/Paystack → pool pickup
- [ ] Soft launch to existing community members

### 🔲 Phase 2 — When triggered

- [ ] Supplier CRUD admin endpoints and UI
- [ ] Supplier-scoped product/order/inventory views
- [ ] Commission tracking per order
- [ ] Payout tracking and management
- [ ] Supplier notification templates
- [ ] Supplier onboarding flow

### 🔲 Phase 3 — Future

- [ ] Supplier self-service portal
- [ ] Supplier auth role (RBAC)
- [ ] Supplier dashboard
- [ ] Automated product moderation workflow
- [ ] Supplier tier system

---

_Last updated: February 2026_
