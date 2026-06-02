# Ledger Service — Build-Out Roadmap (to "done")

A **status-aware completion plan**. The *what* lives in
[LEDGER_SERVICE_DESIGN.md](./LEDGER_SERVICE_DESIGN.md); the Phase 0–1 *how* in
[LEDGER_IMPLEMENTATION_PLAN.md](./LEDGER_IMPLEMENTATION_PLAN.md). This doc tracks
the **remaining** phases that complete the design's vision — in priority order,
with current status, concrete work, acceptance, effort, and dependencies.

*Last verified against prod + code: 2026-06-02.*

---

## Where we are

Mapped to the design doc's own phased rollout (§16):

| Design phase | Status |
|---|---|
| Phase 0 — Design & scaffolding | ✅ Done |
| Phase 1 — Core ledger + `payments_service` integration | ✅ Done (cash-in only) |
| Phase 2 — Wallet integration | ❌ Not started |
| Phase 3 — Revenue recognition + period close | ❌ Not started |
| Phase 4 — Reconciliation | ❌ Not started |
| Phase 5 — Remaining emitters + historical backfill | 🟡 Backfill done; emitters not |
| Phase 6 — Tax + invoicing (FIRS-ready) | ❌ Not started |
| Phase 7 — FIRS live submission | ❌ Not started |
| Phase 8 — AI layer (`ai_service`) | ❌ Not started |
| Phase 9 — B2B productisation | ❌ Not started |

**What's live:** the double-entry engine (immutable, idempotent, reversible,
balanced); the `payments_service` cash-in emitter (the DR `*_clearing` / CR
`revenue_*`-or-`deferred_revenue_*` rows of §8.1, webhook + manual); trial
balance + P&L-by-domain reports; the four-role model + finance-team management +
finance-only access; the `/admin/finance` UI; and a historical backfill (102
entries, ₦734,100, balanced). RLS is enabled but inert under the BYPASSRLS DB
role (single-tenant — see R7).

**What that means (books are balanced but economically incomplete):**
- **Deferred revenue is frozen** — academy/club/community/bundle payments land in
  `deferred_revenue_*` (correct accrual) but nothing recognises them as earned.
  ~₦478k is stuck in deferred; P&L shows only the ~₦227k of point-in-time revenue.
- **`bubbles_liability` is overstated** — top-ups credit it, but spends never
  debit it (wallet doesn't emit).
- **`paystack_clearing` never clears** — cash-in debits it; no settlement entry
  moves it to bank.
- **The expense/cash-out side is absent** — payouts, refunds, COGS, driver pay,
  volunteer rewards don't post.

**Good news:** the seeded chart of accounts (68 accounts) **already covers the
entire vision** — every account the phases below need (`cogs_*`,
`coach_payouts_payable`, `refunds_payable`, `expense_psp_fees`, `vat_*`,
`wht_*`, `bubbles_liability_promo`, …) exists. So this is **emitters + workers +
reports**, not schema work.

---

## Build-out, in priority order

Sequencing rationale: **R1** makes the headline number (earned revenue) correct
and is self-contained on data we already have. **R2** completes the picture so
the P&L has both sides. **R3** makes the books *trustworthy* (ties to the bank)
and is the defensible Nigerian moat. **R4** reports become meaningful only after
R1–R3. **R5** is compliance. **R6–R7** are the product extensions (the original
"AI accountant" + B2B).

### R1 — Revenue recognition + period close · design Phase 3, §10 · effort **M**

**Goal:** move `deferred_revenue_*` → `revenue_*` on each product's cadence
(§10.1); unfreeze the ~₦478k; make the P&L reflect *earned* revenue.

**Work:**
- Recognition worker (ARQ, in `ledger_service`), nightly: walk open deferred
  obligations and post `DR deferred_revenue_* / CR revenue_*` per §10.1 —
  time-based straight-line for club (monthly) / community (annual) / session
  bundle (1/N). Needs a per-obligation **recognition schedule** (what's been
  earned so far) — store it at cash-in time or derive from the deferred balance +
  payment date.
- Delivery-based recognition (academy 28-day blocks §8.4, store at delivery,
  event at date) is **triggered by the domain service** on its delivery event —
  lands with R2's emitters for those services.
- Period close (§10.2): `ledger_periods` already auto-creates; add the
  open → soft-closed → hard-closed transitions + the year-end
  `current_year_earnings → retained_earnings` roll.
- Deferred-revenue schedule report (§14) as the verification view.

**Acceptance:** the stuck deferred balance recognises on cadence; P&L earned
revenue rises over the service period; withdrawal reverses unearned recognition;
deferred-revenue report shows the remaining obligation.
**Depends on:** nothing new (payments emitter already creates the deferred balances).

### R2 — Remaining emitters: every money movement posts · design Phase 2 + 5, §8.2–8.7 · effort **L**

**Goal:** make the ledger the *true* source of truth — the §8.1 gaps + every
other service. Each emitter follows the proven `payments_service` pattern
(`libs/common/ledger_client` + dead-letter + replay + tests).

**Status (2026-06): emitter coverage functionally complete.** Tracing every money
flow that exists in production today, the ledger now posts all of them. The
"remaining emitters" below were mostly already covered by the wallet source-map
(transport/events/store/volunteer all settle through Bubbles), and the genuine
leftovers are blocked on *upstream* product gaps — not ledger code.

**Done:**
- ✅ **`wallet_service`** (§8.2) — Bubbles **spends** with the §19-B promo-first
  split (`DR bubbles_liability[_promo] / CR revenue_*`), grants/welcome/promo
  (`DR expense_marketing / CR bubbles_liability_promo`), penalty →
  `revenue_penalty`, expiry → `revenue_bubbles_breakage`, refund-to-wallet.
  *Fixes the overstated liability.* The spend source-map
  (`("store","order")→revenue_store`, `("events","event")→revenue_events`,
  `("transport","ride_booking")→revenue_transport`, academy/attendance) means
  **every Bubbles-funded store/event/ride/club spend already posts** — those
  services needed no emitter of their own.
- ✅ **`payments_service`** (§8.1) — all 10 `PaymentPurpose`s map to a credit
  account (cash-in); **refunds** (`DR revenue/deferred / CR bank`); **coach payout
  accrual** (`DR cogs_coach_academy / CR coach_payouts_payable`) + **paid**
  (`DR coach_payouts_payable / CR bank` on `transfer.success`).

**Deferred — blocked on upstream gaps, not ledger work:**
- ⬜ **`store_service` COGS** (§8.3) — *revenue already posts* (`STORE_ORDER` cash +
  Bubbles `("store","order")`). COGS is blocked: `OrderItem` snapshots only the
  sale price (no `unit_cost`), inventory carries no cost basis, and
  `quantity_on_hand` is never decremented on sale. Crediting `store_inventory`
  with no offsetting purchase booking would only drive a fictional negative asset.
  **Needs first:** a cost snapshot on `OrderItem` + inventory-receipt booking
  (`DR store_inventory / CR accounts_payable` at cost). Near-zero store volume
  today → low priority.
- ⬜ **`transport_service` driver pay** (§8.5) / **pool fees** (`cogs_pool_fees`,
  §8.4) — *rider revenue already posts* (Bubbles rides). There is **no
  driver/pool-settlement flow in the product** — those parties aren't paid out
  through the system — so `cogs_ride_driver` / `cogs_pool_fees` have no source to
  emit from. Product gap, not a ledger gap.
- ⬜ **`volunteer_service`** (§8.6) — *liability already posts*: reward Bubbles flow
  rewards-engine → wallet grant → `DR expense_marketing / CR bubbles_liability[_promo]`.
  Routing volunteer rewards specifically to `expense_volunteer_rewards` is an
  **expense-reclassification refinement** (identical P&L bottom line): the rewards
  engine stamps every grant `service_source="rewards_engine"`, so it would need to
  thread the originating `event_type` onto the grant txn (or tag the rule with an
  expense account).
- ⬜ **`events_service` deferred recognition** — events post revenue immediately at
  RSVP (Bubbles); there is no cash `PaymentPurpose` and no `event_held` trigger.
  Deferring event revenue to the event date is an R1-style add and only matters if
  events grow material.

**Hardening shipped with this pass:** unmapped wallet PURCHASE sources now log a
loud warning instead of silently dropping revenue (the wallet emitter is log-only,
no dead-letter yet — see follow-ups).

**Acceptance (met for existing flows):** every money-moving event that exists in
production posts; `bubbles_liability[_promo]` tracks outstanding Bubbles × ₦100;
the P&L shows revenue + coach COGS + marketing/penalty/breakage. Store COGS and
driver/pool pay remain ⬜ pending the upstream flows above.
**Note:** `paystack_clearing` does **not** drain until **R3** (settlement ingest
posts `DR bank + DR expense_psp_fees / CR paystack_clearing`); until then PSP fees
are unexpensed and clearing accumulates. R3 is the next real money-flow item.
**Depends on:** R1 for the recognition accounts/cadence.

### R3 — Settlement + reconciliation · design Phase 4, §11 · effort **M–L**

**Goal:** tie the ledger to the bank — close `paystack_clearing` and prove the
books match reality. The painful, defensible Nigerian-rail piece.

**Work:**
- `external_transactions` + `reconciliation_breaks` tables (§4.2 data model).
- Daily Paystack settlement-report ingest worker; post the settlement entry
  `DR bank_operating_ngn + DR expense_psp_fees / CR paystack_clearing` (§8.1 /
  §11.1) — this is what finally clears the clearing account.
- Matching engine (§11.2): exact `external_ref` match → amount/date heuristic →
  anything left into the breaks queue.
- Multi-PSP as enum + per-PSP ingest workers (Flutterwave/Monnify/OPay/bank
  transfer) — data + workers, no schema change (§11.3).
- Admin breaks/exception queue UI.

**Acceptance:** `paystack_clearing` nets to ≈0 after each settlement; unmatched
items surface in the breaks queue; ledger bank balance reconciles to the actual
bank statement.
**Depends on:** Paystack settlement API access. Independent of R1/R2.

### R4 — Full reporting: balance sheet, cash, margins · design Phase 5, §14 · effort **M**

**Goal:** the rest of the §14 report set (only trial balance + P&L exist today).

**Work:** `GET /reports/` for balance-sheet, cash, deferred-revenue, margin
(revenue − COGS by `dimension_1`), ar-aging, bubbles-liability (purchased vs
promo), coach-pay — plus `/admin/finance` pages for each. Mostly query work over
existing `journal_lines` / `account_balances`.

**Acceptance:** balance sheet balances (A = L + E); cash position matches bank +
clearing; per-domain margin reconciles to P&L.
**Depends on:** R1 + R2 (otherwise the balance sheet / margins are incomplete).

### R5 — Tax + FIRS e-invoicing · design Phase 6–7, §13 · effort **L**

**Goal:** Naira-native compliance — VAT/WHT on entries + FIRS-compliant invoices.

**Work:** `tax_codes` (§4.4) + per-line VAT (7.5%) / WHT computation in posting;
invoice model + `invoice_sequences` numbering (`SB-2026-000123`, §13.1) + PDF +
storage; FIRS MBS submission + IRN storage + reject/alert queue (§13.1); credit
notes (§13.4); taxpayer flags on `members_service` records (§13.2). Phased:
issuance + IRN first, **live FIRS submission flips on when in scope** (§13.3).

**Acceptance:** taxable entries split VAT to `vat_output_payable`; invoices carry
monotonic per-year numbers; (when live) submissions return + store IRNs.
**Depends on:** R2 (entries to invoice). External: FIRS MBS credentials.

### R6 — AI accountant layer · design Phase 8 · effort **M–L**

The original ask. Built in **`ai_service`** (DECIDED §19-E), reading the §14
reports → NL summaries, anomaly flags, month-end close commentary, "explain this
movement." The deterministic ledger remains the system of record; AI sits on top.
**Depends on:** R1–R4 (needs complete, trustworthy reports to reason over).

### R7 — B2B productisation + RLS hardening · design Phase 9 + infra · effort **L**

Non-`BYPASSRLS` DB role (**required before a 2nd org** — the RLS policies are
inert until then; tracked task), org onboarding/self-serve, per-org CoA templates
(other verticals — gyms, schools, salons), plan/billing. This is where the ledger
becomes a sellable product.
**Depends on:** R1–R5 (a complete single-tenant product first).

---

## Definition of done (single-tenant SwimBuddz)

1. ✅ Double-entry engine, idempotent posting, reversals.
2. ⬜ Every money movement in §8 posts (R2) and deferred revenue recognises (R1).
3. ⬜ `paystack_clearing` reconciles to the bank; breaks queue manned (R3).
4. ⬜ Full §14 report set, all tying out (R4).
5. ⬜ VAT/WHT correct; FIRS invoices issued (R5).

R6 (AI) and R7 (B2B) are product extensions beyond "the books are complete and
correct."

---

*Last updated: 2026-06-02*
