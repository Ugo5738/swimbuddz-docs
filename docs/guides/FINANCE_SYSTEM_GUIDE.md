# SwimBuddz Finance & Accounting System — Guide

*A guide to the SwimBuddz ledger: what it is, what every screen and term means,
and how to read, interpret, and use the books. Written for the founder and for
an accountant reviewing the system.*

---

## 1. The big picture

SwimBuddz runs a **double-entry accounting ledger** that records every money
movement in the platform as balanced journal entries. The operational apps
(payments, wallet, store, academy, etc.) run the business; the **ledger records
the accounting truth** on top of them, so you get real, auditable financial
statements instead of guessing from raw payment rows.

Two ideas underpin everything:

- **Double-entry.** Every transaction touches at least two accounts, and the
  total **debits always equal the total credits**. Because of this the books can
  never silently lose money — they always balance. (The "Trial Balance" screen
  shows you this balance at a glance.)
- **Single source of financial truth.** Each operational service (a payment, a
  Bubbles spend, a coach payout) *emits* a journal entry to the ledger. The
  ledger is where you go for "what did we actually earn / owe / hold."

The ledger is multi-tenant-capable but today runs a single organization
(SwimBuddz).

### Money units

- Internally, all amounts are stored in **kobo** (₦1 = 100 kobo). This avoids
  rounding errors. Every screen **displays Naira**.
- **Bubbles** are SwimBuddz's in-app credit. **1 Bubble = ₦100** (= 10,000 kobo).

---

## 2. Concepts you need (plain English, with accountant notes)

**Chart of accounts.** Every account belongs to one of five types:

| Type | Meaning | Examples |
|---|---|---|
| **Asset** | What you own or are owed | Bank, Paystack Clearing, Receivables, Store Inventory |
| **Liability** | What you owe | Deferred Revenue, Bubbles Liability, Coach Payouts Payable |
| **Equity** | The owners' stake + accumulated earnings | Owner's Capital, Retained Earnings |
| **Revenue** | What you earn | Academy, Club, Community, Store, Events, Transport revenue |
| **Expense** | What it costs you | Coach pay (COGS), PSP fees, Marketing |

*(Accountant note: assets & expenses are debit-normal; liabilities, equity &
revenue are credit-normal.)*

**Cash ≠ revenue.** Collecting cash is not the same as earning it. If a member
pays for a 12-month membership today, you've collected the cash but you'll
*earn* it over the 12 months. The unearned part is a liability called **deferred
revenue**.

**Recognition.** The nightly process that converts **deferred revenue → earned
revenue** as the service is delivered (straight-line over the membership/cohort
term). After it runs, the P&L shows the portion you've genuinely earned.

**Clearing account.** When a member pays via Paystack, the money isn't in your
bank yet — Paystack holds it and settles it a day or two later. While it's "in
transit," it sits in the **Paystack Clearing** account. When Paystack settles to
your bank, the clearing account drains and the **bank** + **PSP fees** are
recorded.

**Bubbles (the wallet).** A closed-loop credit. **1 Bubble = ₦100.**
- When a member **buys** Bubbles with cash, you now owe them service → a
  **Bubbles Liability**.
- When you **grant** free Bubbles (promos, welcome bonuses), it's a marketing
  cost and a **promotional** Bubbles liability.
- When a member **spends** Bubbles, you deliver service → **revenue**, and the
  liability is drawn down.
- The liability is split **purchased** (cash-backed) vs **promotional** (granted
  free). Spends draw **promo-first** (design §19-B).

**Periods.** Accounting months. Each can be **open** (postable), **soft-closed**
(only adjusting entries allowed), or **hard-closed** (locked — nothing posts).

**Idempotency.** Every emitted entry has a stable key, so the same event can
never be booked twice — safe to retry, replay, or re-run.

---

## 3. The screens — what each shows and how to use it

All finance screens live under **`/admin/finance`** and require a finance role
(separate from general admin — see *Finance Team* below).

### `/admin/finance/reports` — the financial statements

This page stacks six statements. Each has an "as of" date or date range.

#### Trial Balance
- **Shows:** every account's net balance (as a debit or a credit) on a date, plus
  a **Balanced** badge.
- **Read it:** total debits must equal total credits — the badge confirms the
  books are internally consistent. This is the accountant's first sanity check.
- **Use it:** scan for any account with an unexpected balance.

#### Profit & Loss (P&L)
- **Shows:** revenue − expenses over a date range = **net income**, grouped by
  domain or by account.
- **Read it:** *Revenue* = what you earned (recognised, not just collected);
  *Expense* = what it cost; *Net* = profit or loss. "By domain" splits it across
  academy / club / community / store / etc.
- **Use it:** set the range (e.g. this month); flip to "By domain" to see which
  parts of the business make money.

#### Balance Sheet
- **Shows:** your financial position on a date. **Assets = Liabilities + Equity**
  (the `A = L + E` badge).
- **Read it:** *Assets* = what you own/are owed (bank, clearing, receivables);
  *Liabilities* = what you owe (deferred revenue, Bubbles, payables); *Equity* =
  owners' stake + accumulated earnings. The **"Current-Year Earnings
  (unclosed)"** row is this year's profit that hasn't been formally closed into
  retained earnings yet.
- **Use it:** confirm it balances; your **equity total is your net worth**.

#### Cash Position
- **Shows:** where your cash actually is — **settled in the bank** vs **in transit
  at the PSP** (clearing).
- **Read it:** *In bank* = money that has settled; *In transit (clearing)* =
  collected but not yet paid out by Paystack; *Total* = both. In-transit drains
  toward ₦0 as settlements are ingested.
- **Use it:** a large in-transit balance means Paystack still owes you a payout.
  After settlements are reconciled it should be ≈ ₦0.

#### Gross Margin by Domain
- **Shows:** **revenue − COGS** (cost of the goods/services sold) per domain, with
  a margin %.
- **Read it:** for each area: revenue, the direct cost, the margin, and the %.
  This is **gross** margin — it excludes overheads (rent, software, admin).
- **Use it:** see which areas are profitable at the unit level (e.g. is the
  academy's coach cost leaving healthy margin?).

#### Bubbles Liability
- **Shows:** what you owe members in **unspent Bubbles**, split **purchased**
  (bought with cash) vs **promotional** (granted free).
- **Read it:** *Purchased* is a real cash-backed obligation; *Promotional* are
  free Bubbles you've given out; *Total owed* is the full liability. Members can
  still spend all of these on service.
- **Use it:** ties to the Bubbles liability lines on the Balance Sheet.

### `/admin/finance/deferred-revenue`
- **Shows:** money collected but **not yet earned** — what you still owe in
  service — by category (academy, club, community, session bundles). Columns:
  *Collected*, *Recognised* (earned so far), *Remaining*.
- **Read it:** **Remaining** is the liability: service you've been paid for but
  haven't fully delivered. It's recognised straight-line over each
  membership/cohort term.
- **Use it:** the totals here reconcile to the deferred-revenue liabilities on
  the Balance Sheet.

### `/admin/finance/reconciliation`
- **Shows:** proof that the books match the bank. Every Paystack **settlement
  transaction** is matched to a journal entry; anything that settled but isn't in
  the books — or doesn't tie out — becomes a **break**.
- **Read it:** *Matched* / *Unmatched* counts; *Open breaks* + their total; and a
  table of each break (type, reference, what the books say vs what the PSP
  reported, and a detail note).
- **Use it:** a break is a discrepancy to chase — e.g. a payment that settled at
  Paystack but whose record was lost. Booking the missing entry clears it on the
  next reconciliation pass. **An empty breaks list means the books tie to the
  bank.**

### `/admin/finance/periods`
- **Shows:** the accounting months and their status (open / soft-closed /
  hard-closed).
- **Use it:** once a month is reviewed, **soft-close** it (adjustments still
  allowed) and later **hard-close** it (fully locked). This stops accidental or
  fraudulent backdated edits.

### `/admin/finance/journal-entries`
- **Shows:** the raw ledger — every journal entry and its debit/credit lines.
  The full audit trail.
- **Use it:** drill into any transaction to see exactly what posted and why
  (each entry records the source service, type, and reference).

### `/admin/finance/invoices`  *(API available; UI screen pending)*
- **Shows:** issued invoices with **gapless, audit-grade numbering**
  (`SB-2026-000123`) — required for compliant invoicing (and FIRS-ready). You can
  issue, list, fetch, and void invoices via the API today; the on-screen page is
  the next addition.

### `/admin/finance/users` — Finance Team
- **Shows:** who has finance access and their **role**: *viewer* (read reports),
  *accountant* (post manual entries, void invoices), *admin*, *owner*.
- **Important:** finance access is **separate from general SwimBuddz admin** — an
  app admin does **not** automatically see the books. Add your accountant here as
  a *viewer* or *accountant*.

---

## 4. How money flows into the books

A reference for the accountant — what the system posts for each event
(*DR* = debit, *CR* = credit):

| Business event | Journal entry |
|---|---|
| Member pays online — academy / club / community | **DR** Paystack Clearing · **CR** Deferred Revenue *(then recognised over the term)* |
| Member pays a single session fee | **DR** Paystack Clearing · **CR** Club Session Revenue *(earned at once)* |
| Recognition runs (nightly) | **DR** Deferred Revenue · **CR** Revenue *(the elapsed portion)* |
| Paystack settles a batch to the bank | **DR** Bank · **DR** PSP Fees · **CR** Paystack Clearing |
| Member buys Bubbles (top-up) | **DR** Paystack Clearing · **CR** Bubbles Liability |
| Free Bubbles granted (promo / welcome) | **DR** Marketing Expense · **CR** Bubbles Liability (Promo) |
| Member spends Bubbles on a service | **DR** Bubbles Liability · **CR** Revenue (that domain) |
| Refund disbursed | **DR** Revenue / Deferred · **CR** Bank |
| Coach payout — accrue, then pay | **DR** Coach Pay (COGS) · **CR** Payable; then **DR** Payable · **CR** Bank |

Notes:
- **Online payments use the clearing account** because the cash isn't in the bank
  yet. **Manual bank transfers** debit the bank directly.
- Every entry is **idempotent** and **best-effort with a dead-letter**: if the
  ledger is briefly unavailable when an event fires, the intended entry is parked
  and **replayed** — it's never lost.

---

## 5. The monthly close — an accountant's checklist

1. **Trial Balance** — confirm it shows *Balanced*.
2. **P&L** — review revenue vs expenses for the month (by domain).
3. **Balance Sheet** — confirm `A = L + E`; sanity-check the deferred-revenue and
   Bubbles liabilities.
4. **Deferred Revenue** — the *Remaining* total should match the deferred lines
   on the Balance Sheet.
5. **Reconciliation** — work the **open breaks** to zero (resolve or document
   each).
6. **Cash Position** — clearing should be ≈ ₦0 (settlements ingested); the bank
   balance should match your actual bank statement.
7. **Periods** — **soft-close** the month; **hard-close** once everything's final.

---

## 6. Glossary

- **Journal entry** — one recorded transaction; a set of balanced debit/credit
  lines.
- **Debit / Credit** — the two sides of every entry. Total debits = total credits.
- **Kobo** — ₦1 = 100 kobo; the internal storage unit.
- **Bubble** — in-app credit; **1 Bubble = ₦100**.
- **Clearing account** — money collected via the PSP but not yet settled to the
  bank ("in transit").
- **PSP** — Payment Service Provider (Paystack).
- **Settlement** — when Paystack pays a batch of collected transactions into your
  bank, net of its fees.
- **Deferred revenue** — cash collected for service not yet delivered; a
  liability.
- **Recognition** — converting deferred revenue into earned revenue over time.
- **COGS** — Cost of Goods/Services Sold (e.g. coach pay, store cost) — the direct
  cost of what you sold.
- **Gross margin** — revenue − COGS (before overheads).
- **Bubbles liability** — what you owe members in unspent Bubbles; split purchased
  (cash-backed) vs promotional (granted).
- **Reconciliation break** — a settled transaction that doesn't match a booked
  entry (a discrepancy to investigate).
- **Period** — an accounting month; open / soft-closed / hard-closed.
- **Retained earnings** — accumulated profit from prior periods, in equity.
- **Trial balance** — the list of every account's balance, used to confirm the
  books balance.
- **IRN / FIRS** — Nigeria's electronic-invoicing identifiers/authority (planned).

---

## 7. What's built, and what's still on the roadmap

**Built and live:** double-entry posting for every money movement; nightly
revenue recognition + period close; PSP settlement reconciliation (drain + line-
item matching + breaks queue); the full statement set (trial balance, P&L,
balance sheet, cash position, gross margin, deferred revenue, Bubbles liability);
durable emit/replay (no entry can be silently dropped); invoice issuing with
gapless numbering (API).

**On the roadmap / not yet built:**
- **Invoices UI screen** (the issuing/numbering API exists; the page is next).
- **VAT/WHT + FIRS e-invoicing** — deferred until the tax determinations (what's
  VAT-able) and FIRS credentials are in hand; the invoice model already carries
  the placeholders.
- **Store COGS and driver/pool payouts** — waiting on upstream data (product cost
  tracking; an in-app payout flow).
- **Bubbles historical reconciliation** — correcting the historical Bubbles
  liability + the per-Bubble rate is an in-progress activation.
- **Strict row-level DB isolation** — a hardening step gated on B2B (multi-org).

---

*Questions about a specific number on a screen? Open
`/admin/finance/journal-entries` and find the entry behind it — every figure
traces back to a dated, sourced, balanced journal entry.*

*Last updated: 2026-06-03*
