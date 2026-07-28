# Session Costing and Location Pricing

_Status: proposed architecture for implementation_

_Last updated: July 2026_

## Purpose

This document defines how SwimBuddz should model pool fees, refreshments, and
other session-day costs across Lagos and future global locations.

The immediate question is whether a pool should belong to a locale, the locale
should carry a refreshment cost, and the pool should combine both into a daily
expense. That is directionally correct, but one important separation is needed:

- geography describes **where** an activity happens;
- rates describe **what a supplier charges, when, and per what unit**;
- a session budget describes **what this specific activity is expected to
  cost**;
- actual expenses describe **what was eventually paid**.

Putting all four ideas on `Pool` or `Locale` would make historical margins
change whenever a default price is edited.

## Decision

Use five concepts:

1. **Operating Area** for geographic hierarchy and defaults.
2. **Pool Rate** for the facility's contracted charges.
3. **Operating Cost Rate** for refreshments and other non-pool inputs.
4. **Session Cost Quote** for a calculated estimate before scheduling or sale.
5. **Session Budget Snapshot** for the approved line items attached to a
   particular session.

Do not make refreshments a required child of a pool. A refreshment rate can be
an area default, a supplier rate, or a pool-specific override.

## Why `OperatingArea`, Not `Locale`

In software, `locale` usually means language and formatting such as `en-NG`.
SwimBuddz needs an operational geography.

Recommended hierarchy:

```text
Nigeria
└── Lagos
    ├── Mainland
    │   ├── Yaba
    │   └── Surulere
    └── Island
        ├── Victoria Island
        ├── Ikoyi
        └── Lekki Phase 1
```

A pool belongs to the most specific useful area. Parent areas let an Island
default apply to VI and Ikoyi until a more specific rate exists.

An operating area should carry:

- name and slug;
- optional parent area;
- country code;
- timezone;
- currency;
- active status.

It should not carry one permanent `refreshment_price` column. Rates change over
time, differ by supplier, and can use different charging units.

## Core Data Model

### `operating_areas`

| Field | Purpose |
|---|---|
| `id` | Stable UUID |
| `name` | Victoria Island, Yaba, Lagos |
| `slug` | URL/reporting key |
| `parent_id` | Geographic hierarchy |
| `country_code` | `NG`, later other countries |
| `timezone` | `Africa/Lagos`, later cohort-local zones |
| `currency` | `NGN`, later other currencies |
| `is_active` | Operational availability |

`pools.operating_area_id` points to this table. The current free-text
`location_area` remains as a transition/display field until data is migrated.

### `pool_rates`

Pool charges deserve a dedicated, effective-dated table because facilities can
charge per swimmer, per lane, per hour, or a flat amount.

| Field | Purpose |
|---|---|
| `pool_id` | Pool being priced |
| `charge_basis` | `per_attendee`, `per_lane`, `per_hour`, `flat_session` |
| `amount_kobo` | Integer money storage |
| `currency` | Usually inherited from area, snapshotted here |
| `effective_from`, `effective_to` | Rate validity |
| `day_of_week` | Optional Saturday/weekend rule |
| `starts_after`, `ends_before` | Optional time-band rule |
| `minimum_quantity` | Contract minimum if any |
| `notes` | Contract context |
| `is_active` | Administrative control |

The current `price_per_swimmer_ngn` and `flat_session_fee_ngn` fields on
`Pool` can remain as compatibility fields during migration, but the rate table
should become the source of truth.

### `operating_cost_rates`

This table covers refreshments and other repeatable session inputs.

| Field | Purpose |
|---|---|
| `category` | `refreshment`, `lifeguard`, `coach_support`, `media`, `equipment`, `transport`, `other` |
| `operating_area_id` | Area default, nullable |
| `pool_id` | Pool-specific override, nullable |
| `supplier_id` | Optional selected vendor |
| `charge_basis` | `per_attendee`, `per_staff`, `per_hour`, `flat_session` |
| `amount_kobo` | Unit cost |
| `effective_from`, `effective_to` | Rate validity |
| `minimum_quantity` | Vendor minimum |
| `description` | e.g. "Light post-swim pack" |
| `is_active` | Administrative control |

Examples:

- Lagos Mainland refreshment default: N1,000 per attendee.
- Island parent-area refreshment default: N5,000 per attendee.
- A particular Ikoyi pool override: N6,500 per attendee because the venue
  requires its own catering.
- A VI supplier weekend package: N80,000 flat for up to 20 people.

### `session_budget_snapshots`

One row represents the approved budget for one session or event.

| Field | Purpose |
|---|---|
| `session_id` or `event_id` | Cross-service reference |
| `expected_attendees` | Quantity used for planning |
| `expected_staff` | Staff refreshment or support quantity |
| `currency` | Snapshot currency |
| `estimated_revenue_kobo` | Revenue expected for this activity |
| `estimated_cost_kobo` | Sum of lines |
| `estimated_margin_kobo` | Revenue minus cost |
| `status` | `draft`, `approved`, `superseded`, `reconciled` |
| `quoted_at`, `approved_at` | Audit dates |

### `session_budget_lines`

| Field | Purpose |
|---|---|
| `budget_id` | Parent snapshot |
| `category` | Pool, refreshment, staffing, logistics, contingency |
| `description` | Human-readable line |
| `unit_basis` | Per attendee, per hour, flat |
| `unit_cost_kobo` | Selected rate at quote time |
| `quantity` | Expected quantity |
| `total_cost_kobo` | Frozen line total |
| `source_rate_type`, `source_rate_id` | Trace back to the rule used |

These lines are snapshots. Editing a future default does not change them.

## Rate Resolution

For each cost category, select the most specific valid rule:

```text
session override
    ↓
pool-specific active rate
    ↓
most-specific operating-area rate
    ↓
nearest parent-area rate
    ↓
global default
    ↓
missing-rate warning
```

This removes the need for every pool to manually "take a combo." A Yaba pool
inherits the Mainland refreshment default automatically. A VI pool inherits the
Island default. Only exceptions need pool-specific configuration.

Rate selection must also match:

- the session date;
- day of week and time band, when specified;
- charging basis;
- currency;
- minimum quantities.

If two equally specific rules are valid, the quote should fail and ask an admin
to resolve the ambiguity. Financial calculations should not choose silently.

## From Quote to Actual Expense

The lifecycle should be:

```text
Choose date, pool, format, and expected headcount
                    ↓
Resolve effective pool and operating rates
                    ↓
Create editable cost quote
                    ↓
Admin approves schedule and selling price
                    ↓
Freeze session budget snapshot
                    ↓
Run session
                    ↓
Record actual expense lines and variance
```

A quote can be recalculated. An approved snapshot must be superseded by a new
version, not edited in place.

## Example Calculations

### Mainland Club session

Assumptions:

- 1 attendee;
- pool: N3,000 per attendee;
- refreshment: N1,000 per attendee.

```text
Pool          N3,000 × 1 = N3,000
Refreshment   N1,000 × 1 = N1,000
Per-member session cost  = N4,000
12-session quarter       = N48,000
N60,000 Club price       = N12,000 contribution before shared overhead
```

### Victoria Island Club session

Assumptions:

- pool: N7,000 per attendee;
- light refreshment: N5,000 per attendee.

```text
Pool          N7,000 × 1 = N7,000
Refreshment   N5,000 × 1 = N5,000
Per-member session cost  = N12,000
12-session quarter       = N144,000
```

A N60,000 Island package would therefore be structurally loss-making before
coaching, support, payment fees, or contingency. Island Club needs a separate
price family or a different service format.

### High-cost Island pool

At N12,500 pool + N5,000 refreshment:

```text
Per-member session cost  = N17,500
12-session quarter       = N210,000
```

This should never be handled as an unexpected venue top-up after a member has
already bought a N60,000 quarter. It needs an explicit premium package or an
opt-in premium-venue differential shown before purchase.

## Registration and Price Calculator

The member-facing calculator should not expose raw database rules. It should
offer purchasable packages derived from approved operating assumptions.

Recommended inputs:

- city or operating area;
- preferred pool/location;
- quarter;
- included number of sessions;
- included refreshment package;
- optional quarter meet;
- any premium-venue differential.

Recommended output:

- Club training quarter price;
- quarter-meet opt-in price;
- what is included;
- selected pool/area;
- total due today;
- clear note for variable or premium venue days.

The commercial price should be versioned separately from cost. Cost plus a
fixed N12,000 margin is not enough once payment fees, staff time, no-shows,
weather disruptions, and central overhead are included.

Use:

```text
selling price =
    expected direct cost
  + allocated operating overhead
  + risk/contingency allowance
  + target contribution margin
```

## Service Ownership

Recommended ownership within the current architecture:

- `pools_service`: operating areas, pools, pool rates, supplier/operating rate
  catalogue, and cost quoting inputs;
- `sessions_service`: session schedule and reference to the approved quote or
  snapshot;
- `events_service`: event schedule and reference to its approved quote or
  snapshot;
- `ledger_service`: actual expenses, reconciliation, and budget-versus-actual
  financial reporting;
- gateway/frontend: calculator and admin workflow orchestration.

Services continue to communicate over HTTP. A pool or cost table must not
foreign-key directly into another service's tables.

## Implementation Sequence

### Phase 1: geography and rate catalogue

- Add `operating_areas`.
- Link pools with nullable `operating_area_id`.
- Backfill Lagos, Mainland, Island, Yaba, VI, Ikoyi, and known pool areas.
- Add effective-dated `pool_rates`.
- Add `operating_cost_rates` with refreshment as the first category.
- Add admin screens for areas and rates.

### Phase 2: quote engine

- Resolve rates by date, pool, area hierarchy, and basis.
- Return detailed quote lines and warnings.
- Add tests for pool override, parent fallback, effective dates, minimums, and
  ambiguous matches.

### Phase 3: session budget snapshots

- Create snapshots when a session or event is approved.
- Show expected cost, revenue, and margin to admins.
- Require explicit approval for negative-margin activities.

### Phase 4: reconciliation

- Record actual pool, refreshment, and support expenses.
- Compare actual against budget.
- Use variance data to improve future area defaults and package prices.

## Guardrails

- Store money as integer kobo plus currency.
- Never infer current cost from a pool's address alone.
- Never overwrite historical snapshot rates.
- Do not use one refreshment quantity for both attendees and staff without
  making that assumption visible.
- Do not silently substitute another currency.
- Do not allow two equally specific active rates for the same date and basis.
- Do not promise one national price when direct costs vary materially by
  operating area.

## Open Decisions Before Migration

1. Should refreshments be included for every Club session or only selected
   sessions?
2. Does the refreshment quantity include coaches, volunteers, and guests?
3. Are Island packages pool-specific or grouped into one commercial price
   band?
4. What overhead and contingency percentages should the calculator use?
5. Who can approve a negative-margin community acquisition event?
6. Should the quarter meet have its own budget and price, or be bundled into
   selected Club packages?

These decisions affect commercial packaging, but they do not change the
underlying area-rate-snapshot architecture.
