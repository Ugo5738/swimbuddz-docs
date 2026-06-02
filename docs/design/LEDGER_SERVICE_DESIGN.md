# Ledger Service Architecture & Data Model Design

> **Status:** Draft — All open questions (A–E) resolved; awaiting final sign-off
> **Service Port:** 8018  (moved from 8017 in May 2026 when corporate_service shipped on 8017)
> **Service Name:** `ledger_service`
> **Date:** 2026-05-14
> **Author:** Daniel + AI collaborator

---

## 1. Overview

The Ledger Service is SwimBuddz's **double-entry accounting source of truth**. Every money-moving operation across the platform — Paystack payments, wallet top-ups, Bubbles spends, store sales, academy enrollments, coach payouts, refunds, no-show penalties, volunteer rewards — posts a journal entry to the ledger. From those entries the ledger derives every financial report (trial balance, P&L, balance sheet, cash position, deferred revenue) and emits FIRS-compliant e-invoices.

It is designed from day 1 as a **multi-tenant** service. SwimBuddz is tenant `#1`; future B2B customers will be tenants `#2..N` with no code changes — only data and configuration. This is the single most important constraint and the reason the service exists separately rather than as a `payments_service` module.

### Why a dedicated service

- **Accounting is a different shape from operations.** Operational tables (`Payment`, `Order`, `Enrollment`, `WalletTransaction`) optimise for the domain they serve. Accounting needs a uniform, immutable, double-entry view across all of them. Mixing concerns has produced "god objects" in this codebase before; this is the same trap.
- **B2B extractability requires architectural isolation.** A ledger built inside `payments_service` ties the schema to SwimBuddz's enum values. A standalone service with org-scoped data is portable to other operators (gyms, schools, clubs) without rewriting.
- **FIRS e-invoicing has hard structural requirements** (immutable invoice numbering, IRN linkage, VAT/WHT line-level tagging, real-time submission). Bolting these onto operational tables is brittle; the ledger gives a clean surface to build them once.
- **Service isolation per CLAUDE.md** — money flows are emitted by every service that touches them, but accounting is owned by none of them.

### Design principles

- **Multi-tenant from day 1.** `organization_id` on every row. RLS at the DB layer. Auth context carries org. No SwimBuddz-specific column names anywhere.
- **Double-entry, immutable.** Every journal entry has balanced debits and credits. Entries are never updated or deleted. Corrections are made by posting a reversing entry.
- **Idempotent posting.** Every emitter sends an `idempotency_key` (or `(source_service, source_type, source_id)` tuple). Replays are no-ops. Network glitches are safe.
- **The journal is the source of truth for money.** Operational tables remain — but the journal is what closes the books, what reconciles against Paystack, what builds the P&L.
- **Money as `bigint` minor units (kobo).** Never floats. Display layer divides. This is non-negotiable.
- **Chart of accounts is data, not schema.** Vertical templates (sports_club, school, gym, generic_smb) are seeded on org creation. Account *references* (e.g. `paystack_clearing`) are stable strings; account *codes* (e.g. `1200`) belong to the org.
- **Accrual by default, cash-basis as a view.** Necessary for academy cohort revenue recognition and for any operator with deferred services.
- **Build for the close.** Period locking, year-end roll-forward, audit trail, and reversing-entry workflow are first-class — not afterthoughts.
- **AI on top, not in the middle.** AI features (anomaly detection, narrated close, NL queries) read from the ledger but never write directly. The accounting layer is deterministic.

---

## 2. Scope — what the ledger owns and does not own

| Concern | Ledger | Operational service |
|---|---|---|
| Chart of accounts (per org) | ✅ | — |
| Journal entries (debits + credits) | ✅ | — |
| Account balances (per period) | ✅ | — |
| Trial balance, P&L, balance sheet | ✅ | — |
| Tax accounts (VAT, WHT) and computation | ✅ | — |
| Period close, year-end roll-forward | ✅ | — |
| Reconciliation against Paystack settlements | ✅ | — |
| FIRS e-invoice emission and IRN tracking | ✅ | — |
| Multi-currency / FX revaluation | ✅ | — |
| Paystack webhook handling | — | `payments_service` |
| `Payment` record (Paystack ref, status, payer) | — | `payments_service` |
| `WalletTransaction` (Bubbles balance change) | — | `wallet_service` |
| `Order` lifecycle (pending → shipped → delivered) | — | `store_service` |
| `Enrollment` lifecycle (active → completed → dropped) | — | `academy_service` |
| `CoachPayout` workflow (pending → approved → paid) | — | `payments_service` |

**Rule of thumb:** operational tables remain the authoritative record of *what happened in the business*; the ledger is the authoritative record of *what happened to the money*. They reconcile.

### Out of scope

- **Tax filing and FIRS submission UI** — the ledger emits FIRS-compliant invoices and tracks IRNs, but the act of submission and the merchant onboarding belong elsewhere (likely an integration module or admin tool). See §13.
- **Budgeting and forecasting** — separate concern; can read from the ledger.
- **Bank feed aggregation** — the ledger ingests bank statements when provided, but does not pull from Mono/Okra/etc. directly in phase 1.
- **Payroll execution** — payroll is a separate module that *posts to* the ledger. Coach payouts via `payments_service` is the existing pattern and continues; staff payroll is future.

---

## 3. Multi-tenancy model

This is the discipline that lets the ledger become a B2B product. Cutting these corners is the single largest risk.

### 3.1 The shape

- Every table has `organization_id` (UUID, NOT NULL, indexed).
- Every API call carries `organization_id` — either as a path segment (`/orgs/{org_id}/...`) for B2B contexts, or resolved from auth context.
- A Postgres session-level setting `app.current_org_id` is set at request entry. RLS policies on every table enforce `org_id = current_setting('app.current_org_id')::uuid`. Belt-and-braces — application-level filtering is still required, RLS is defence-in-depth.
- **No SwimBuddz-specific column names anywhere.** No `pool_id`, no `cohort_id`. Use generic `cost_center_id`, `dimension_1`, `dimension_2`, `external_ref` instead. SwimBuddz semantics live in the chart of accounts seed, not the schema.

### 3.2 During SwimBuddz internal dogfood

- One `organization` row exists: SwimBuddz.
- Its UUID is held in a config constant (`LEDGER_DEFAULT_ORG_ID` env var).
- All internal emitters resolve `org_id` from this config.
- The point: the code path is identical to what a B2B customer will exercise. Nothing is SwimBuddz-special.

### 3.3 Sub-orgs vs cost centers

Per the agreed decision, expansion (Lagos → Abuja → Accra) is modelled as **cost centers within one org**, not separate orgs. Separate orgs are only created when there's a separate legal entity.

```
SwimBuddz (org)
├── cost_center: lagos_yaba
├── cost_center: lagos_vi
├── cost_center: abuja_wuse
├── dimension: domain (academy | club | community | store | transport | events)
└── dimension: program (cohort_12 | cohort_13 | summer_camp | ...)
```

### 3.4 What B2B customers get

A B2B customer onboards by:
1. Creating an org (name, base currency, fiscal year start, accounting standard).
2. Picking a CoA template (sports_club / school / gym / generic_smb).
3. Optionally extending the CoA.
4. Configuring tax registration (VAT number, FIRS taxpayer ID).
5. Connecting Paystack (or other PSP — multi-PSP architecture from day 1, see §11).
6. Inviting users (mapped to roles: admin, accountant, viewer).

Their domain services (their own POS, their own membership system) post journal entries via the same API.

---

## 4. Data model

All tables are in the `ledger_service` schema. All have `org_id` (omitted from snippets for brevity but present on every table).

### 4.1 Core

```
organizations
  id (uuid, pk)
  name (text)
  legal_name (text)
  base_currency (char(3), default 'NGN')
  fiscal_year_start_month (smallint, default 1)
  accounting_standard (enum: accrual | cash, default accrual)
  tax_country (char(2), default 'NG')
  vat_number (text, nullable)
  firs_taxpayer_id (text, nullable)
  status (enum: active | suspended | closed)
  metadata (jsonb)
  created_at, updated_at
```

```
chart_of_accounts
  id (uuid, pk)
  code (text)                      -- e.g. '1200'
  name (text)                      -- e.g. 'Paystack Clearing'
  type (enum: asset | liability | equity | revenue | expense
            | contra_asset | contra_liability | contra_revenue | contra_expense)
  normal_balance (enum: debit | credit)
  parent_id (uuid, nullable, self-ref)
  is_active (bool)
  is_system (bool)                 -- true = seeded, can't be renamed/deleted
  metadata (jsonb)                 -- e.g. {"maps_to": "paystack_clearing"}

  UNIQUE(org_id, code)
  INDEX (org_id, type)
  INDEX (org_id, (metadata->>'maps_to')) WHERE metadata ? 'maps_to'
```

```
journal_entries
  id (uuid, pk)
  entry_date (date)                -- accounting date
  posting_date (timestamptz)       -- wall-clock when posted
  description (text)
  source_service (text)            -- 'payments' | 'wallet' | 'store' | ...
  source_type (text)               -- 'payment_succeeded' | 'wallet_topup' | ...
  source_id (text, nullable)       -- ID in the source service
  idempotency_key (text)
  status (enum: posted | reversed)
  reversal_of_entry_id (uuid, nullable, fk → journal_entries)
  reversed_by_entry_id (uuid, nullable, fk → journal_entries)
  period_id (uuid, fk → periods)
  posted_by_user_id (uuid, nullable)
  posted_by_service (text, nullable)
  metadata (jsonb)
  created_at, posted_at

  UNIQUE(org_id, idempotency_key)
  INDEX (org_id, entry_date DESC)
  INDEX (org_id, source_service, source_type, source_id)
  INDEX (org_id, period_id)
```

```
journal_lines
  id (uuid, pk)
  entry_id (uuid, fk → journal_entries, ON DELETE RESTRICT)
  account_id (uuid, fk → chart_of_accounts)
  debit_minor (bigint, default 0, check >= 0)
  credit_minor (bigint, default 0, check >= 0)
  currency (char(3))
  fx_rate (numeric(18,8), nullable)
  base_debit_minor (bigint, default 0)
  base_credit_minor (bigint, default 0)
  cost_center_id (uuid, nullable, fk → cost_centers)
  dimension_1 (text, nullable)     -- generic dim (e.g. domain: 'academy')
  dimension_2 (text, nullable)     -- generic dim (e.g. program: 'cohort_12')
  member_ref (text, nullable)      -- customer-level for AR / per-member reports
  external_ref (text, nullable)    -- opaque pointer to operational row
  tax_code_id (uuid, nullable, fk → tax_codes)
  description (text)

  CHECK (debit_minor = 0 OR credit_minor = 0)   -- one side per line
  INDEX (entry_id)
  INDEX (account_id, entry_id)
  INDEX (cost_center_id) WHERE cost_center_id IS NOT NULL
  INDEX (member_ref) WHERE member_ref IS NOT NULL
```

**Invariant** (enforced by service code in a transaction, and verified by trigger on COMMIT):

```
SUM(debit_minor) = SUM(credit_minor) per journal_entry
SUM(base_debit_minor) = SUM(base_credit_minor) per journal_entry
```

```
account_balances                   -- materialized, refreshed on post
  org_id, account_id, period_id,
  opening_minor, debits_minor, credits_minor, closing_minor,
  currency
  PRIMARY KEY (org_id, account_id, period_id)
```

```
periods
  id (uuid, pk)
  period_name (text)               -- '2026-05', '2026-Q2', '2026-FY'
  period_type (enum: month | quarter | year)
  start_date, end_date
  status (enum: open | soft_closed | hard_closed)
  closed_at, closed_by_user_id
  UNIQUE (org_id, period_name)
```

```
cost_centers
  id (uuid, pk)
  code, name, is_active, parent_id, metadata
  UNIQUE (org_id, code)
```

### 4.2 Reconciliation

```
external_transactions               -- bank/PSP statements
  id (uuid, pk)
  source (enum: paystack | flutterwave | bank | manual | ...)
  external_id (text)                -- PSP's own reference
  amount_minor (bigint)
  currency (char(3))
  direction (enum: credit | debit)
  transaction_date (timestamptz)
  description (text)
  raw_payload (jsonb)
  matched_entry_id (uuid, nullable, fk → journal_entries)
  matched_at (timestamptz, nullable)
  matched_by_user_id (uuid, nullable)
  status (enum: unmatched | matched | disputed | ignored)
  UNIQUE (org_id, source, external_id)
  INDEX (org_id, status, transaction_date)
```

```
reconciliation_breaks               -- exceptions queue
  id, org_id, external_transaction_id, expected_entry_id,
  break_type (enum: unmatched_external | unmatched_internal | amount_mismatch
                  | currency_mismatch | date_mismatch | duplicate),
  notes (text), status, resolved_at, resolved_by_user_id
```

### 4.3 Multi-currency

```
fx_rates
  id, org_id (nullable — global rates allowed),
  from_currency, to_currency, rate (numeric(18,8)),
  rate_date, source (text), created_at
  INDEX (from_currency, to_currency, rate_date DESC)
```

### 4.4 Tax (FIRS-ready)

```
tax_codes
  id, org_id, code (e.g. 'NG_VAT_STANDARD' | 'NG_VAT_ZERO' | 'NG_VAT_EXEMPT' | 'NG_WHT_5')
  description, rate (numeric(7,4)), tax_type (enum: output_vat | input_vat | wht | exempt | zero_rated)
  account_id (fk → chart_of_accounts)   -- which account the tax posts to
  is_active
  UNIQUE (org_id, code)
```

```
invoices                            -- emitted invoices, FIRS-tracked
  id (uuid, pk)
  org_id, invoice_number (text)     -- the customer-facing number
  invoice_type (enum: invoice | credit_note | proforma)
  customer_member_ref (text)
  customer_name, customer_email, customer_tax_id
  issue_date, due_date
  currency, subtotal_minor, tax_minor, total_minor
  status (enum: draft | issued | sent | paid | cancelled | voided)
  journal_entry_id (uuid, fk → journal_entries)
  firs_irn (text, nullable)         -- Invoice Reference Number from FIRS
  firs_status (enum: pending | submitted | accepted | rejected | not_required)
  firs_submitted_at, firs_response (jsonb)
  pdf_storage_key (text, nullable)
  metadata (jsonb)
  UNIQUE (org_id, invoice_number)
  INDEX (org_id, firs_status) WHERE firs_status IN ('pending','submitted','rejected')
```

```
invoice_lines
  id, invoice_id, sequence,
  description, quantity, unit_price_minor, line_subtotal_minor,
  tax_code_id, tax_minor, line_total_minor,
  account_id, journal_line_id (nullable)
```

```
invoice_sequences                   -- monotonic per-org-per-year numbering (see §13.1)
  org_id (uuid)
  fiscal_year (smallint)
  prefix (text)                     -- e.g. 'SB'
  next_value (bigint)               -- next sequence number to allocate
  PRIMARY KEY (org_id, fiscal_year)
  -- allocation: SELECT ... FOR UPDATE, increment, format, in the invoice's posting txn
```

### 4.5 Audit & users

```
ledger_users                        -- org-scoped users (B2B); SwimBuddz internal users mirrored
  id, org_id, auth_id (supabase),
  role (enum: viewer | accountant | admin | owner),
  created_at, deactivated_at
```

```
audit_log
  id, org_id, actor_user_id, actor_service,
  action (enum: entry_posted | entry_reversed | period_closed | invoice_issued
              | account_created | account_modified | tax_code_modified
              | reconciliation_matched | ...),
  subject_type, subject_id, payload (jsonb), created_at
  INDEX (org_id, created_at DESC)
```

---

## 5. Chart of accounts — SwimBuddz seed

Seeded on org creation from a **template**, not via Alembic data migration. Templates live in `services/ledger_service/coa_templates/<vertical>.yaml` and are version-tracked. Customer additions are stored in `chart_of_accounts` with `is_system=false`.

The SwimBuddz CoA uses the **sports_club** template:

```
1000  Assets
  1100  Cash & Bank
    1110  Bank — Operating (NGN)            (maps_to: bank_operating_ngn)
    1120  Bank — Operating (USD)            (maps_to: bank_operating_usd)
    1130  Petty Cash
  1200  Receivables
    1210  Paystack Clearing                 (maps_to: paystack_clearing)
    1220  Flutterwave Clearing              (maps_to: flutterwave_clearing)
    1230  Accounts Receivable               (maps_to: accounts_receivable)
    1240  Unbilled Receivables              (maps_to: unbilled_receivables)
  1300  Inventory
    1310  Store Inventory                   (maps_to: store_inventory)
  1400  Other Current Assets
    1410  Prepaid Expenses
  1500  Fixed Assets
    1510  Equipment
    1520  Accumulated Depreciation          (contra_asset)
  1800  Tax Receivable
    1810  VAT Input Receivable              (maps_to: vat_input_receivable)
    1820  WHT Receivable                    (maps_to: wht_receivable)

2000  Liabilities
  2100  Payables
    2110  Accounts Payable                  (maps_to: accounts_payable)
    2120  Coach Payouts Payable             (maps_to: coach_payouts_payable)
    2130  Refunds Payable                   (maps_to: refunds_payable)
  2200  Wallet & Customer Liabilities
    2210  Bubbles Liability                 (maps_to: bubbles_liability)
    2220  Bubbles Liability — Promotional   (maps_to: bubbles_liability_promo)
  2300  Deferred Revenue
    2310  Deferred Revenue — Academy        (maps_to: deferred_revenue_academy)
    2320  Deferred Revenue — Club Membership(maps_to: deferred_revenue_club)
    2330  Deferred Revenue — Community      (maps_to: deferred_revenue_community)
    2340  Deferred Revenue — Session Bundles(maps_to: deferred_revenue_session_bundle)
    2350  Customer Deposits — Pre-orders    (maps_to: customer_deposits)
    2360  Deferred Revenue — Events         (maps_to: deferred_revenue_events)
  2400  Tax Payable
    2410  VAT Output Payable                (maps_to: vat_output_payable)
    2420  WHT Payable                       (maps_to: wht_payable)
    2430  Income Tax Payable

3000  Equity
  3100  Owner's Capital
  3900  Retained Earnings                   (maps_to: retained_earnings)
  3990  Current-Year Earnings               (maps_to: current_year_earnings, system)

4000  Revenue
  4100  Academy Revenue                     (maps_to: revenue_academy)
  4200  Club Revenue
    4210  Club Membership Revenue           (maps_to: revenue_club_membership)
    4220  Club Session Revenue              (maps_to: revenue_club_session)
    4230  No-show Penalty Revenue           (maps_to: revenue_penalty)
  4300  Community Revenue                   (maps_to: revenue_community)
  4400  Store Revenue                       (maps_to: revenue_store)
  4500  Events Revenue                      (maps_to: revenue_events)
  4600  Transport Revenue                   (maps_to: revenue_transport)
  4900  Other Revenue
    4910  Bubbles Breakage                  (maps_to: revenue_bubbles_breakage)

5000  Cost of Sales
  5100  COGS — Store                        (maps_to: cogs_store)
  5200  Pool Fees Paid                      (maps_to: cogs_pool_fees)
  5300  Coach Pay — Academy                 (maps_to: cogs_coach_academy)
  5400  Coach Pay — Club                    (maps_to: cogs_coach_club)
  5500  Ride-share Driver Pay               (maps_to: cogs_ride_driver)

6000  Operating Expenses
  6100  Payment Processing Fees             (maps_to: expense_psp_fees)
  6200  Volunteer Rewards                   (maps_to: expense_volunteer_rewards)
  6300  Marketing                           (maps_to: expense_marketing)
  6400  Software & Infrastructure
  6500  Office & Admin
  6900  Other Expenses
```

**`maps_to`** is the indirection that lets emitters use stable refs across all orgs. The numeric codes can vary per customer; the refs cannot.

> **PR-0 cross-check (2026-06-01):** building the machine-readable template (`services/ledger_service/coa_templates/sports_club.yaml`) and diffing its `maps_to` set against every ref used in §8 surfaced three refs that §8 relies on but this listing originally omitted: `accounts_payable` (2110; §8.3 inventory received, §8.5 driver pay), `expense_marketing` (6300; §8.2 welcome bonus + promo grants), and a missing account **2360 Deferred Revenue — Events** (`deferred_revenue_events`; §8.7). All three are now in both the template and this listing. The YAML is the executable source; this table is the human view — a validation step keeps them in sync.

---

## 6. Posting API

```
POST /orgs/{org_id}/journal-entries
Idempotency-Key: <uuid>
Content-Type: application/json

{
  "entry_date": "2026-05-14",
  "description": "Academy enrollment — Cohort 12 — Member 8421",
  "source_service": "academy",
  "source_type": "enrollment_paid",
  "source_id": "enr_01HXYZ...",
  "metadata": { "enrollment_id": "...", "cohort_id": "cohort_12" },
  "lines": [
    {
      "account_ref": "paystack_clearing",
      "debit": 15000000,
      "currency": "NGN",
      "description": "Paystack receivable for enrollment fee"
    },
    {
      "account_ref": "deferred_revenue_academy",
      "credit": 15000000,
      "currency": "NGN",
      "cost_center": "lagos_yaba",
      "dimension_1": "academy",
      "dimension_2": "cohort_12",
      "member_ref": "member_8421",
      "external_ref": "enr_01HXYZ..."
    }
  ]
}
```

**Response (success):**

```json
{
  "entry_id": "01HZ...",
  "status": "posted",
  "period_id": "01HY..."
}
```

**Response (idempotent replay):** identical body, no new entry created.

**Validation:**

- `sum(debits) == sum(credits)` in entry currency
- `sum(base_debits) == sum(base_credits)` if multi-currency
- `account_ref` resolves to an active account for the org
- Period containing `entry_date` is `open` (rejected with 409 if `hard_closed`)
- `idempotency_key` is unique per org

**Other endpoints (illustrative, not exhaustive):**

```
GET    /orgs/{org_id}/journal-entries/{id}
POST   /orgs/{org_id}/journal-entries/{id}/reverse
GET    /orgs/{org_id}/accounts
POST   /orgs/{org_id}/accounts                       -- non-system only
GET    /orgs/{org_id}/balances?as_of=2026-05-31&account=...
GET    /orgs/{org_id}/reports/trial-balance?as_of=...
GET    /orgs/{org_id}/reports/profit-loss?from=...&to=...&group_by=domain
GET    /orgs/{org_id}/reports/balance-sheet?as_of=...
POST   /orgs/{org_id}/periods/{id}/close
POST   /orgs/{org_id}/reconciliation/external        -- ingest PSP/bank rows
POST   /orgs/{org_id}/reconciliation/match
POST   /orgs/{org_id}/invoices                       -- emit invoice (also posts entry)
POST   /orgs/{org_id}/invoices/{id}/firs/submit
```

Service-to-service callers use the existing service-role JWT pattern from `libs/auth`.

---

## 7. Domain event contracts — what each service emits

Every money-moving service emits **one well-defined event per business operation**. The contract is the same shape as the existing `emit_rewards_event()` pattern (`libs/common/service_client.py`): a synchronous HTTP POST with an `idempotency_key` and a typed payload, sent as a service-role call.

A thin emitter helper lives in `libs/common/ledger_client.py`:

```python
async def post_journal_entry(
    *,
    org_id: UUID,
    entry_date: date,
    description: str,
    source_service: str,
    source_type: str,
    source_id: str,
    lines: list[JournalLineSpec],
    metadata: dict | None = None,
    calling_service: str,
) -> JournalEntryResult: ...
```

`idempotency_key` is derived deterministically as `f"{source_service}:{source_type}:{source_id}"` so replays from any code path collapse to a single entry.

### 7.1 What the emitter MUST know about accounting

Almost nothing. Emitters know:
- The business event (`payment_succeeded`, `enrollment_paid`, `bubbles_topup_confirmed`, …)
- The amounts in kobo
- Stable account refs (`paystack_clearing`, `deferred_revenue_academy`, …)
- The dimensions (cost center, domain, program) that matter to that business event

Emitters DO NOT know:
- Account codes
- Whether the org is on accrual or cash basis (the ledger handles deferred-revenue posting based on the event type, but emitters never special-case)
- VAT rates (lines carry a `tax_code_ref` like `NG_VAT_STANDARD`; the ledger computes split)

---

## 8. Integration with existing services — full mapping

Money types in the source services are inconsistent today (`Float`, `Integer` kobo, `Decimal(12,2)`). The emitter helper normalises to `bigint` kobo before posting; non-NGN currencies pass through as-is with the source currency.

### 8.1 `payments_service` → ledger

| Source event | Trigger | Journal posting |
|---|---|---|
| Paystack `charge.success` for COMMUNITY/CLUB | webhook `_mark_paid_and_apply()` | DR `paystack_clearing` / CR `deferred_revenue_club` (or `deferred_revenue_community`) |
| Paystack `charge.success` for ACADEMY_COHORT | webhook | DR `paystack_clearing` / CR `deferred_revenue_academy` |
| Paystack `charge.success` for SESSION_FEE | webhook | DR `paystack_clearing` / CR `revenue_club_session` *(earned immediately — single session)* |
| Paystack `charge.success` for SESSION_BUNDLE | webhook | DR `paystack_clearing` / CR `deferred_revenue_session_bundle` |
| Paystack `charge.success` for STORE_ORDER | webhook | DR `paystack_clearing` / CR `revenue_store` + CR `vat_output_payable` (if taxable). Separate entry: DR `cogs_store` / CR `store_inventory` |
| Paystack `charge.success` for WALLET_TOPUP | webhook (via `confirm-topup`) | DR `paystack_clearing` / CR `bubbles_liability` |
| Paystack `charge.success` for RIDE_SHARE | webhook | DR `paystack_clearing` / CR `revenue_transport` |
| Paystack `charge.failed` | webhook | **No posting** (no money moved). Entry is only on success. |
| Paystack settlement (daily) | reconciliation ingestion | DR `bank_operating_ngn` + DR `expense_psp_fees` / CR `paystack_clearing` |
| Manual payment approved | `manual.py` approval | Same as Paystack equivalent for the purpose, with `source_type=manual_payment` |
| Refund issued (cash) | `refunds` flow | DR (revenue or deferred account) / CR `bank_operating_ngn` |
| Coach payout — pending → approved | admin approval | **No posting** (commitment, not cash) |
| Coach payout — paid (Paystack `transfer.success`) | webhook | DR `coach_payouts_payable` / CR `bank_operating_ngn` |
| Coach payout — accrual at block end (recurring) | worker (per `RecurringPayoutConfig` block) | DR `cogs_coach_academy` (or `cogs_coach_club`) / CR `coach_payouts_payable` |

### 8.2 `wallet_service` → ledger

The wallet's existing `WalletTransaction` table remains the single-entry Bubbles ledger. For each balance change, the wallet *also* emits a Naira-side journal entry to the ledger. Bubbles ↔ NGN at the fixed `naira_per_bubble = 100`.

| Source event | Journal posting (NGN) |
|---|---|
| Topup confirmed (Paystack-backed) | **Posted by `payments_service` already** (see 8.1). Wallet does NOT double-post. |
| Topup confirmed (admin grant, real Naira cost) | DR `bubbles_liability_promo` *(or `expense_*`)* / CR `bubbles_liability` |
| Welcome bonus (10 🫧, ₦1,000) | DR `expense_marketing` / CR `bubbles_liability_promo` |
| Promotional grant (campaign) | DR `expense_marketing` / CR `bubbles_liability_promo` |
| Spend on session (21 🫧, ₦2,100) | DR `bubbles_liability` *(or `bubbles_liability_promo` if grant-funded)* / CR `revenue_club_session` |
| Spend on academy enrollment | DR `bubbles_liability` / CR `deferred_revenue_academy` |
| Spend on store order | DR `bubbles_liability` / CR `revenue_store` (+ COGS entry) |
| Spend on event | DR `bubbles_liability` / CR `revenue_events` |
| Spend on ride | DR `bubbles_liability` / CR `revenue_transport` |
| No-show penalty | DR `bubbles_liability` / CR `revenue_penalty` |
| Refund to wallet | DR (revenue or deferred account) / CR `bubbles_liability` |
| Promotional expiry | DR `bubbles_liability_promo` / CR `revenue_bubbles_breakage` |

**Bubbles split logic (DECIDED — see §19-B):** when a member spends Bubbles, the wallet deducts from the **promotional bucket first (FIFO by grant date), then the purchased bucket.** Rationale: promotional Bubbles carry expiry, so spending them first means members don't lose them. A spend *draws down* the Bubbles liability, so the entry **debits** the matching liability sub-account — `bubbles_liability_promo` for the promotional portion, `bubbles_liability` for the purchased portion — against a single revenue credit. A spend that straddles both buckets produces **two debit lines** (one per sub-account). This is the only place the ledger and wallet are tightly coupled, and it's deliberate.

Worked example — member with 8 🫧 promo + 30 🫧 purchased spends 21 🫧 on a session (₦2,100):

```
DR bubbles_liability_promo     80,000   (8 🫧 promo, used first)
DR bubbles_liability          130,000   (13 🫧 purchased, remainder)
CR revenue_club_session       210,000   (₦2,100)
```

(After this spend: promo bucket 0 🫧, purchased bucket 17 🫧.)

### 8.3 `store_service` → ledger

`store_service` does NOT post the cash side of an order (`payments_service` already does that on `charge.success` with `STORE_ORDER`). `store_service` posts the **fulfillment / inventory side**:

| Source event | Journal posting |
|---|---|
| Order shipped | DR `cogs_store` / CR `store_inventory` (at cost) — only if not posted at sale time |
| Order delivered | No posting — operational state only |
| Order refunded | DR `revenue_store` / CR (`paystack_clearing` or `bubbles_liability`) + reverse inventory if returned |
| Inventory received from supplier | DR `store_inventory` / CR `accounts_payable` |

### 8.4 `academy_service` → ledger

Cohort revenue is recognised over the cohort delivery period, not at payment. `payments_service` posts the cash-in to `deferred_revenue_academy`; `academy_service` recognises earned revenue per block (28-day default, same cadence as `RecurringPayoutConfig`):

| Source event | Journal posting |
|---|---|
| Cohort block delivered (per enrollment) | DR `deferred_revenue_academy` / CR `revenue_academy` (proportional amount) |
| Enrollment installment paid | DR `paystack_clearing` / CR `deferred_revenue_academy` *(via `payments_service`)* |
| Enrollment withdrawal — refund issued | DR `deferred_revenue_academy` / CR (refund destination) + reverse any unearned recognition |
| Coach makeup obligation paid out | Already covered by `CoachPayout` accrual (see 8.1) |

### 8.5 `transport_service` → ledger

Most rides are paid through wallet or via a payments order; both are posted upstream. `transport_service` only posts:

| Source event | Journal posting |
|---|---|
| Driver pay accrued (post-trip) | DR `cogs_ride_driver` / CR `accounts_payable` *(or `bank_operating_ngn` if paid same day)* |

### 8.6 `volunteer_service` → ledger

| Source event | Journal posting |
|---|---|
| Volunteer reward granted as Bubbles | DR `expense_volunteer_rewards` / CR `bubbles_liability_promo` |
| Volunteer reward granted as discount | **No posting at grant.** Discount is realised at redemption (revenue is recorded net of discount). |

### 8.7 `events_service` → ledger

| Source event | Journal posting |
|---|---|
| Event ticket paid (via `payments_service`) | DR `paystack_clearing` / CR (`deferred_revenue_events` if pre-event, else `revenue_events`) |
| Event delivered | DR `deferred_revenue_events` / CR `revenue_events` |

### 8.8 What this looks like end-to-end

**Member pays ₦15,000 for a club month, attends 4 sessions, no-shows one.**

```
T+0  Paystack charge.success / CLUB
       DR paystack_clearing      1,500,000
       CR deferred_revenue_club  1,500,000

T+1d Paystack settles to bank (₦14,775 net, ₦225 fee)
       DR bank_operating_ngn     1,477,500
       DR expense_psp_fees          22,500
       CR paystack_clearing      1,500,000

Weekly Revenue recognition (¼ of month)
       DR deferred_revenue_club    375,000
       CR revenue_club_membership  375,000
   ... × 4 weeks

Member no-shows; wallet penalty 10 🫧 (₦1,000) charged from Bubbles
       DR bubbles_liability      100,000
       CR revenue_penalty        100,000
```

Trial balance closes. Revenue from the membership flows to `revenue_club_membership`; the penalty to `revenue_penalty`. The wallet's single-entry `WalletTransaction(PENALTY, DEBIT)` is preserved as the customer-facing record.

---

## 9. Money types & precision

A discipline note that affects every emitter:

| Source | Type today | Conversion to post |
|---|---|---|
| `payments_service.Payment.amount` (`Float` NGN) | Float | `int(round(amount * 100))` — but **also flag as tech debt** to migrate to bigint kobo. Float is a latent bug. |
| `Payment.currency` | String[8] | Pass through |
| `CoachPayout.*_earnings` (kobo) | Integer | Pass through directly |
| `Order.*_ngn` (`Decimal(12,2)` NGN) | Decimal | `int(value * 100)` |
| `EnrollmentInstallment.amount` (kobo) | Integer | Pass through |
| `WalletTopup.naira_amount` (kobo per agent report) | Integer | Pass through |
| `Wallet.balance` (Bubbles, integer) | Integer | × 100 (Bubble = ₦100) to get kobo |

The ledger never stores Bubbles. The wallet keeps doing that. The ledger stores the Naira value the Bubbles represent.

---

## 10. Revenue recognition & period close

### 10.1 Recognition rules (accrual default)

Driven by `source_type`, not by emitter intent. The recognition worker is a service-internal job, not an emitter responsibility.

| Product | Cash event | Recognition |
|---|---|---|
| Single session fee | At payment | At payment (point-in-time, no deferral) |
| Session bundle (N sessions) | At payment | 1/N per session attended |
| Academy cohort | At payment | Per 28-day block (DECIDED §19-A). A block recognises once 28 calendar days elapse since cohort start — **time-based, not attendance-based**. 12-week cohort ≈ 3 blocks → 3 recognition entries. Aligns with `RecurringPayoutConfig` coach-pay blocks for clean per-block margin. |
| Club membership (monthly) | At payment | Straight-line over month |
| Club membership (quarterly / bi-annual / annual) | At payment | Straight-line over period |
| Community membership (annual) | At payment | Straight-line over year |
| Store sale | At payment | At delivery (or at shipment, configurable) |
| Event ticket | At payment | At event date |
| Ride share | At payment | At ride completion |
| Bubbles top-up | At payment | **Never** — Bubbles are a liability until spent |

A nightly worker generates the period-end recognition entries by walking active deferred-revenue obligations and posting earned amounts.

### 10.2 Period close

- **Open** → entries freely accepted.
- **Soft-closed** → only adjusting / reversing entries by accountant role; normal emitters rejected.
- **Hard-closed** → no entries at all. Year-end auto-creates an entry: DR/CR `current_year_earnings` → `retained_earnings`.

### 10.3 Reversing entries

The only way to correct a posted entry. The reversing entry references the original; the original is marked `status=reversed`. Both remain queryable. UI surfaces both.

---

## 11. Reconciliation — Paystack settlements

Paystack pays out daily, net of fees. The ledger's job is to match each settlement to the gross `paystack_clearing` entries that made it up.

### 11.1 Ingestion

- A daily worker fetches Paystack settlement reports (one row per payout, with breakdown of which transactions composed it).
- Each settlement line lands as a row in `external_transactions`.
- The settlement payout itself (DR bank / DR fees / CR clearing) is posted as a single journal entry.

### 11.2 Matching engine

For each `external_transactions` row:
1. Exact match on `source='paystack' AND external_id = paystack_reference` against `journal_lines.external_ref`.
2. Amount + date window heuristic for the remainder.
3. Anything left → `reconciliation_breaks` queue with type `unmatched_external`.

### 11.3 Multi-PSP from day 1

The data model treats Paystack as a *value of an enum*, not as a baked-in assumption. Adding Flutterwave / Monnify / OPay / direct bank transfer is data + a new ingest worker. No schema changes. Critical for the B2B story — Nigerian operators rarely use only one PSP.

---

## 12. Multi-currency & FX

- Every line carries `currency` + `fx_rate` + `base_*_minor`.
- Foreign-currency entries store the original amount AND the base-currency equivalent at the rate on `entry_date`.
- `fx_rates` table seeded daily (CBN official rate by default; configurable).
- **FX revaluation:** at period close, foreign-currency monetary accounts (bank, AR, AP) are revalued; unrealised gain/loss posted to `4910/6910`.

NGN-only operators (SwimBuddz today) never see this machinery — it's silent until a non-NGN entry arrives.

---

## 13. FIRS e-invoicing

Nigeria's e-invoicing mandate (FIRS Merchant Buyer Solution / MBS) requires near-real-time invoice submission with an Invoice Reference Number (IRN). The mandate has rolled out in phases from large taxpayers downward. The ledger is designed to be ready before it's mandatory.

### 13.1 Invoice issuance flow

```
1. Triggering event (payment captured, service delivered, etc.) calls
   POST /orgs/{org_id}/invoices with line items + tax codes.
2. Ledger:
   a. Allocates invoice_number from the org's invoice series (see numbering below).
   b. Computes tax per line via tax_codes.
   c. Posts the corresponding journal_entry atomically.
   d. Renders PDF, stores in Supabase Storage.
   e. Submits to FIRS (if firs_taxpayer_id present and org opted-in):
      - POST to FIRS MBS endpoint
      - On accept: stores firs_irn, status=accepted
      - On reject: status=rejected, raw response stored, alert queue
3. Customer-facing invoice URL includes IRN once available.
```

**Invoice numbering (DECIDED — see §19-D):** `{ORG_PREFIX}-{YYYY}-{6-digit zero-padded sequence}`, e.g. `SB-2026-000123`.

- `ORG_PREFIX` — configurable per org; default = first 2–3 letters of `legal_name`, uppercase (SwimBuddz → `SB`).
- `YYYY` — the fiscal year of `issue_date`.
- Sequence — resets to 1 at the start of each fiscal year; monotonic and unique per `(org_id, fiscal_year)`, which satisfies FIRS's monotonic-and-unique requirement.
- Allocated from a dedicated table with row-level locking so concurrent issuance can't produce gaps or duplicates:

```
invoice_sequences
  org_id (uuid)
  fiscal_year (smallint)
  prefix (text)
  next_value (bigint)              -- next sequence number to allocate
  PRIMARY KEY (org_id, fiscal_year)
```

Allocation is `SELECT ... FOR UPDATE` on the `(org_id, fiscal_year)` row, increment `next_value`, format, commit — inside the same transaction that posts the invoice's journal entry, so a rolled-back invoice doesn't burn a number. Credit notes draw from the same series (a credit note is just an invoice with opposite sign), keeping one unbroken sequence per year as FIRS expects.

### 13.2 What this changes upstream

Each money-event needs to know:
- Is the customer a registered taxpayer?
- What VAT treatment applies (standard 7.5%, zero-rated, exempt)?
- Is WHT deductible (B2B services)?

This data sits on `member` records in `members_service` and on `chart_of_accounts` for line-level default treatment. Emitters pass `tax_code_ref` per line; ledger handles the split.

### 13.3 What FIRS does NOT change

- Internal management reporting unaffected.
- B2C low-value transactions may be exempt from real-time submission depending on phase rollout — controlled by org-level config.
- Phased: SwimBuddz starts with invoice issuance + IRN storage; live FIRS submission flips on when the operator is in scope.

### 13.4 Credit notes

A refund issues a `credit_note` with reference to the original invoice. Same flow, opposite sign.

---

## 14. Reporting layer

Read endpoints generated from the journal. None of these are stored; balances are derived from `account_balances` materialised view, refreshed on every posting.

| Report | Endpoint | Notes |
|---|---|---|
| Trial balance | `GET /reports/trial-balance?as_of=` | All accounts, debit/credit columns |
| Profit & loss | `GET /reports/profit-loss?from=&to=&group_by=` | `group_by`: `none | cost_center | dimension_1 | dimension_2` |
| Balance sheet | `GET /reports/balance-sheet?as_of=` | |
| Cash position | `GET /reports/cash?as_of=` | All cash + clearing accounts |
| AR aging | `GET /reports/ar-aging?as_of=` | Buckets 0–30 / 31–60 / 61–90 / 90+ |
| Deferred revenue schedule | `GET /reports/deferred-revenue?as_of=` | What's still owed in service |
| Per-domain margins | `GET /reports/margin?from=&to=` | Revenue – COGS by `dimension_1` (academy / club / store / …) |
| Bubbles liability | `GET /reports/bubbles-liability?as_of=` | Split purchased vs promotional |
| Coach pay summary | `GET /reports/coach-pay?from=&to=` | Per coach, with accrued vs paid |

A separate **AI reporting layer** (phase 8) reads these endpoints and emits NL summaries, anomaly flags, and close commentary. The deterministic reports above remain the system of record.

---

## 15. Permissions

| Role | Capabilities |
|---|---|
| `viewer` | Read all reports, journal entries, balances. No writes. |
| `accountant` | + Post manual journal entries, propose reversing entries, run period close, manage CoA (non-system accounts), match reconciliation. |
| `admin` | + Manage tax codes, fiscal periods, users, org settings. |
| `owner` | + Hard-close periods, manage billing (when productised). |

Service-to-service emitters use a `service` principal with scope `journal_entries:post` only. They cannot read reports, cannot reverse, cannot touch CoA.

SwimBuddz initial mapping:
- Daniel → `owner`
- Finance staff (when hired) → `accountant`
- Other admins → `viewer`

---

## 16. Phased rollout

Per the same principle as `chat_service`: **complete architecture, phased releases.**

> **Live status + prioritized completion plan:** see
> [LEDGER_ROADMAP.md](./LEDGER_ROADMAP.md). Phases 0–1 are shipped; the roadmap
> tracks the remaining build-out (recognition → emitters → reconciliation →
> reports → tax/FIRS → AI → B2B) with status, acceptance, and effort. The
> per-phase text below is the original plan.

### Phase 0 — Design & scaffolding (current)
- This doc reviewed and accepted
- Service scaffolded at `services/ledger_service/`, port 8018
- Gateway routing for `/ledger/*` → `ledger_service:8018`
- CoA template (`sports_club.yaml`) drafted
- `libs/common/ledger_client.py` skeleton + service-role auth contract agreed
- `LEDGER_DEFAULT_ORG_ID` env-var wiring decided

### Phase 1 — Core ledger + payments_service integration
- Multi-tenant schema with RLS
- Posting API with idempotency
- CoA seeding from template on org creation
- Manual journal entry admin UI
- `payments_service` emits on `charge.success` (all `PaymentPurpose` values)
- Trial balance + P&L (no recognition logic yet — all revenue immediate)
- **Release:** SwimBuddz finance can see one source of truth for inflows

### Phase 2 — Wallet integration
- `wallet_service` emits on every transaction
- Bubbles split logic (purchased vs promotional buckets at spend time)
- Bubbles liability report
- **Release:** wallet finance picture is correct on the books

### Phase 3 — Revenue recognition + period close
- Deferred-revenue worker (cohort blocks, monthly/annual memberships, bundles)
- Period close workflow (open → soft → hard)
- Reversing-entry UI
- Year-end roll-forward
- **Release:** SwimBuddz can close a month

### Phase 4 — Reconciliation
- Paystack settlement ingestion worker
- Matching engine + breaks queue
- Bank statement ingestion (manual CSV upload first)
- **Release:** Paystack ↔ ledger is auditable

### Phase 5 — Remaining service integrations + historical backfill
- `store_service`, `academy_service`, `transport_service`, `volunteer_service`, `events_service`
- Backfill from inception to present (one-shot replay of all `Payment`, `WalletTransaction`, `Order`, `Enrollment`, `CoachPayout` rows through the emitter)
- **Outbox cutover (DECIDED §19-C):** this is the trigger point to move every emitter from synchronous HTTP to a per-emitter outbox-table pattern. By phase 5 the third+ money-moving service is integrating; that's when sync-HTTP coupling starts to bite. (Bring it forward if any lost-entry incident happens earlier.)
- **Release:** full coverage; older finance reports re-runnable

### Phase 6 — Tax + invoicing (FIRS-ready, not yet live)
- Tax codes, VAT/WHT computation
- Invoice issuance + PDF rendering + storage
- IRN field present, FIRS submission not yet enabled
- **Release:** invoices look right, audit-ready

### Phase 7 — FIRS live submission
- MBS integration when operator falls in scope
- Submission worker + retry + breaks queue
- Credit notes
- **Release:** compliant e-invoicing

### Phase 8 — AI layer (built in `ai_service`, DECIDED §19-E)
- Lives as a new capability in the existing `ai_service` (port 8011), **not** inside `ledger_service`. Reads ledger reports via API; never writes journal entries.
- Anomaly detection on posted entries (z-score on per-account daily volume, flag outliers)
- Auto-narration of P&L variances vs prior period
- Natural-language query: "what did we earn from academy in April?"
- AI can *propose* a journal entry (e.g. a suggested accrual or correction); an accountant reviews and posts it. The ledger stays deterministic.
- **Release:** the "AI accountant" feature surface SwimBuddz finance interacts with

### Phase 9 — B2B productisation
- Org self-serve onboarding (sign-up, choose vertical, pick CoA template)
- Multi-org user accounts
- Pricing & billing for ledger usage (likely per-tx + per-user)
- Documentation portal
- **Release:** first paying B2B customer

Phases 1–4 are the minimum to fix SwimBuddz's internal accounting problem. Phase 8 is the AI feature that motivated this work. Phase 9 is the commercial extraction.

---

## 17. Dependencies & risks

### Dependencies (must exist before Phase 1 ships)

- `LEDGER_DEFAULT_ORG_ID` env var seeded in `libs/common/config.py`
- `libs/common/ledger_client.py` (parallel to `service_client.py`)
- Gateway routing for `/ledger/*`
- RLS-aware DB connection helper in `libs/db`
- Supabase service role for `ledger_service` (already pattern-established)

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Backfill mismatches modern emitter logic | High | High | Snapshot every emitter as a backfill-replayer; reconcile against operational tables before going live |
| Float-NGN in `payments_service.Payment` causes 1-kobo rounding drift | Medium | Low (visible, easy to fix) | Document the rounding rule (`round-half-even`); migrate `Payment.amount` to bigint kobo as separate task |
| Bubbles split logic wrong — wrong liability bucket debited | Medium | Medium | Property test: `purchased + promo` reconciles to `wallet.balance` (in kobo) for every wallet, nightly |
| Period close blocks emitters in the middle of a Paystack burst | Low | Medium | "Posting date" vs "entry date" split — late-arriving events for closed periods auto-route to the next open period with a flag |
| FIRS API spec changes during phase 6/7 | Medium | Medium | Wrap FIRS client behind interface; treat MBS as one provider of many |
| Multi-tenant assumption skipped under pressure | Medium | **Very high** (kills B2B) | Code review rule: any PR adding a SwimBuddz-specific column to ledger tables is auto-blocked; CoA additions go through template files |
| Reconciliation breaks pile up unattended | High | Medium | Breaks queue dashboard with SLA tags; alert to finance when > N unmatched > X days |

---

## 18. Anti-patterns (do not do)

- ❌ **Storing money as `Float` or untyped `Numeric`** anywhere in `ledger_service`. Always `bigint` minor units.
- ❌ **Adding SwimBuddz-specific columns** to ledger tables. Use `cost_center` + `dimension_*` only.
- ❌ **Letting AI write journal entries directly.** AI can propose, accountant posts. Always.
- ❌ **Editing posted entries.** Only reversing entries.
- ❌ **Cross-service reads** into ledger tables from other services. Always go through API.
- ❌ **Skipping idempotency on emitters.** Network glitches must be safe.
- ❌ **Hardcoding account codes** in emitters. Use `account_ref` (the `maps_to` value), always.
- ❌ **Posting cash on `charge.failed`.** Only successful money moves create entries.
- ❌ **Double-posting between `payments_service` and `wallet_service`.** For wallet top-ups, `payments_service` posts the cash-in / Bubbles-liability entry. `wallet_service` only posts on spend / promo / breakage.
- ❌ **Skipping the CoA template indirection** when "we'll only ever have SwimBuddz." This is the multi-tenant moat; do not lose it.

---

## 19. Decisions & remaining questions

### Resolved (from prior conversation)

| # | Item | Decision |
|---|---|---|
| 1 | Cash or accrual | **Accrual default; cash-basis as a view** |
| 2 | SwimBuddz org granularity | **One org + cost centers** (Lagos / VI / Abuja) |
| 3 | Payroll | **Separate module that posts to ledger.** Coach payouts continue via `payments_service` (already exists and is correct); staff payroll is future. |
| 4 | FIRS e-invoicing | **Ledger emits FIRS-compliant invoices and tracks IRN.** Live submission is phased; structure is ready from phase 6. |
| 5 | Multi-tenancy | **From day 1.** `org_id` + RLS + no SwimBuddz columns. |
| 6 | Money types | **`bigint` minor units (kobo) for all amount columns in ledger tables.** Source services migrate over time. |
| 7 | Academy recognition cadence | **Block-based (28-day).** Aligned to existing `RecurringPayoutConfig` blocks; ~3 entries per 12-week cohort; clean per-block margins. A block is "delivered" by calendar time (28 days elapsed), not by sessions attended. See §10.1. |
| 8 | Bubbles-spend bucket order | **Promotional first (FIFO by grant date), then purchased.** Protects members from losing expiring promo Bubbles. See §8.2. |
| 9 | Outbox pattern timing | **Phase 1 = synchronous HTTP** (existing `emit_rewards_event` pattern) + dead-letter table per emitter. Move to per-emitter outbox at the 3rd money-moving integration (≈ phase 5) or on any lost-entry incident. See §16 phase 5. |
| 10 | Invoice numbering | **`{ORG_PREFIX}-{YYYY}-{6-digit zero-padded sequence}`** (e.g. `SB-2026-000123`). Org prefix configurable (default = first 2–3 letters of legal name, uppercase); sequence resets yearly; monotonic per (org, year); allocated from `invoice_sequences` with row-lock. See §13.1. |
| 11 | AI accountant location | **`ai_service` (port 8011) capability.** Reads ledger via API, never writes entries. Keeps ledger deterministic. Built in phase 8. See §16 phase 8. |

### Decision detail (A–E)

All previously-open questions are now resolved. Detail and rationale retained below.

**A. Recognition cadence for academy cohorts — DECIDED: block-based (28-day).**

Block-based matches `RecurringPayoutConfig` and keeps coach pay aligned with revenue recognition (clean margin reporting per block). Daily straight-line was the alternative — more precise at month-end close but ~84 entries per enrollment and revenue rhythm misaligned with coach-pay rhythm. A block is "delivered" by calendar time (28 days elapsed since cohort start), **not** by sessions attended, so recognition is deterministic; attendance issues are handled as explicit adjustments. Revisit only if finance wants exact-to-the-day month-end numbers (→ daily straight-line worker).

**B. Bubbles-spend liability bucket order — DECIDED: promotional first, then purchased.**

When a member spends Bubbles, deduct promotional Bubbles first (FIFO by grant date), then purchased Bubbles. Rationale: promotional Bubbles carry expiry; spending them first means members don't lose them. The journal entry credits the matching liability sub-account (`bubbles_liability_promo` vs `bubbles_liability`). See §8.2 for the posting rule.

**C. Outbox pattern — DECIDED: synchronous HTTP in phase 1; outbox at 3rd integration or first incident.**

Phase 1 uses synchronous HTTP (the existing `emit_rewards_event` pattern). Failure mode: if `ledger_service` is down when an emitter tries to post, the emitter retries with backoff; if it ultimately fails, an entry is written to a dead-letter table in the emitter's DB and a manual replay tool exists. Acceptable for SwimBuddz volume. **Move every emitter to an outbox-table pattern** when the third money-moving service is integrated (≈ phase 5) or on any real lost-entry incident, whichever comes first.

**D. Per-org invoice numbering scheme — DECIDED: `{ORG_PREFIX}-{YYYY}-{6-digit sequence}`.**

E.g. `SB-2026-000123`. Org prefix configurable per org (default = first 2–3 letters of legal name, uppercase). Sequence resets each fiscal year; monotonic and unique per (org, year), which satisfies FIRS. Allocated from a dedicated `invoice_sequences` table with row-level locking on allocation to prevent gaps/duplicates under concurrency. See §13.1.

**E. Where the "AI accountant" lives — DECIDED: `ai_service` (option 2).**

The AI layer is a new capability in the existing `ai_service` (port 8011, already home to cohort-complexity / coach-grading / coach-matching scoring). It reads ledger reports via API and never writes journal entries directly — it can *propose* an entry, but an accountant posts it. Keeps the ledger deterministic and audit-clean. Built in phase 8.

### Future-work triggers

| Current choice | Revisit when | Likely alternative |
|---|---|---|
| Synchronous HTTP emitter | Lost-entry incident OR 3rd money-moving service added | Outbox pattern per emitter |
| Block-based academy recognition | Finance asks for daily precision | Daily straight-line worker |
| One PSP (Paystack) | Adding Flutterwave / Monnify | Multi-ingest workers, same `external_transactions` shape |
| Manual bank-statement CSV | > 5 hours/month spent uploading | Mono / Okra / Plaid integration |
| FIRS submission off | Operator falls in MBS scope | Phase 7 |
| AI in `ai_service` | AI workload distinct from scoring (latency, dependencies) | Dedicated `intelligence_service` |
| Templates: only `sports_club` | First non-club B2B customer | Add `school`, `gym`, `generic_smb` templates |

---

## 20. Acceptance checklist (for this doc)

- [ ] Scope (§2) covers everything SwimBuddz needs accounted for
- [ ] Multi-tenant model (§3) signed off — no SwimBuddz-specific schema
- [ ] Data model (§4) reviewed for completeness
- [ ] CoA template (§5) matches how SwimBuddz wants the books to look
- [ ] Posting API (§6) covers all emitter cases
- [ ] Integration mappings (§8) match how each service actually moves money today
- [ ] Money type conversions (§9) acknowledged as tech debt where present
- [ ] Recognition rules (§10) signed off by Daniel
- [ ] Phased rollout (§16) realistic and ordered correctly
- [ ] FIRS phasing (§13, §16 phases 6–7) acceptable
- [x] Port 8018 reserved in `docs/reference/SERVICE_REGISTRY.md`
- [x] Open questions (§19) captured — all resolved (A–E decided 2026-06-01)

Once accepted, next artefacts:
1. ✅ `SERVICE_REGISTRY.md` update (added `ledger_service` at 8018)
2. ✅ `DOCUMENTATION_INDEX.md` link
3. ✅ Implementation plan (Phase 0 + Phase 1) — [LEDGER_IMPLEMENTATION_PLAN.md](./LEDGER_IMPLEMENTATION_PLAN.md)
4. CoA template file (`services/ledger_service/coa_templates/sports_club.yaml`) — *scoped as task P0.6 in the impl plan*
5. `libs/common/ledger_client.py` skeleton — *scoped as task P0.7 / P1.10 in the impl plan*
6. `Payment.amount` Float-to-bigint migration plan (separate, parallel track) — *scoped in impl plan §8*

---

*Last updated: 2026-06-01 — resolved open questions A–E (academy recognition = block-based; Bubbles spend = promo-first; outbox at phase 5; invoice numbering `{ORG_PREFIX}-{YYYY}-{6-digit}`; AI accountant in `ai_service`). Reconciled service port to 8018 (8017 taken by corporate_service).*

*2026-05-14 — initial draft.*
