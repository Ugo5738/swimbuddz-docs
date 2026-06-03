# SwimBuddz Finance System — A Plain-English Guide

*What the finance system does, what every screen means, and how to read the
numbers — written so the founder can read it end to end, and the accountant can
trust it. Worked examples use real SwimBuddz figures.*

---

## 1. What this is, in one paragraph

Every time money moves in SwimBuddz — a member pays, buys Bubbles, gets a refund,
a coach gets paid — the system writes it into a **ledger**: a permanent, tamper-
evident record of the business's money. The apps (payments, wallet, store…) run
the business; the ledger quietly records the *accounting* truth underneath, so
you can open a screen and see real answers: **What did we earn? What do we own?
What do we owe? Where's our cash?** Without it, you'd be guessing from raw
payment rows.

The golden rule it follows is **double-entry**: every transaction is written in
two halves that must equal each other, so the books always balance and nothing
can quietly go missing. You don't need to understand the mechanics — but it's why
you can trust the totals.

**Two units to know:**
- Money is shown in **Naira (₦)**. (Internally it's stored in *kobo* — 100 kobo =
  ₦1 — just to avoid rounding errors.)
- **Bubbles** are the in-app credit. **1 Bubble = ₦100.**

---

## 2. The handful of ideas behind every screen

You only need these six to read everything:

1. **Accounts.** Everything is sorted into buckets: what you **own** (bank, cash
   in transit), what you **owe** (memberships you haven't delivered yet, Bubbles
   people haven't spent), what you've **earned** (revenue), what it **cost**
   (expenses), and your **stake** in the business (equity).

2. **Collecting money ≠ earning it.** If someone pays ₦60,000 for a year's
   membership today, you've *collected* ₦60,000 but you haven't *earned* it yet —
   you owe them a year of service. The unearned part is a debt you owe, called
   **deferred revenue**. You earn it bit by bit as the year passes. That bit-by-
   bit earning is called **recognition**, and it runs automatically every night.

3. **Money "in transit."** When a member pays with a card, the money doesn't land
   in your bank instantly — Paystack holds it for a day or two, then **settles** a
   batch to your bank (after taking its fee). While it's in limbo it sits in a
   **clearing** account ("collected, not yet in the bank").

4. **Bubbles are a promise.** When someone buys Bubbles, you've taken their cash
   but still owe them service — so Bubbles people hold are a **debt you owe**
   (a liability). When they *spend* Bubbles, you deliver the service, so that's
   when it becomes **revenue**.

5. **Reconciliation = "do the books match the bank?"** The system checks every
   payout Paystack made against what's recorded in the books. Anything that
   doesn't line up is flagged as a **break** for someone to look at.

6. **Periods.** The books are organised by month. A month can be **open** (still
   recording), **soft-closed** (only corrections allowed), or **hard-closed**
   (locked forever). You close a month once you've reviewed it.

That's the whole mental model. Everything below is just these ideas on screens.

---

## 3. Worked examples (real SwimBuddz numbers)

The clearest way to "get it" is to follow real money through the system.

### Example A — a member pays for community membership
**Peter pays ₦5,000** for community membership (this is a real payment in your
books).

1. He pays by card. The ₦5,000 is **collected but not in your bank yet** → it sits
   in *clearing*, and because membership is delivered over time, the ₦5,000 is
   recorded as **deferred revenue** ("we owe Peter a year of community
   membership"). Nothing is "earned" yet.
2. **Each night**, the system earns a sliver of it. Community runs ~365 days, so
   after ~4 months it has *recognised* roughly ₦1,650 as real **revenue** and
   ₦3,350 is still **deferred** (still owed in service).
3. A day or two later **Paystack settles** the cash to your bank (minus a small
   fee), and the clearing balance for Peter's payment drains to zero.

**Where you'd see it:** *Deferred Revenue* shows the ₦3,350 still owed; *P&L*
shows the ₦1,650 earned; *Cash Position* shows the cash moving from "in transit"
to "in bank."

### Example B — Paystack settles a big batch (this actually happened)
Over time SwimBuddz collected **₦734,100** by card. Paystack pays that out in
batches. When the batches were reconciled:
- **₦719,714 landed in your bank** (the net),
- **₦19,249 was Paystack's fees** (now correctly recorded as an expense),
- the **clearing account drained to ≈ ₦0** (the cash is no longer "in transit").

**Where you'd see it:** *Cash Position* — "in transit" drops to ~₦0 and "in bank"
holds the settled cash. The fees show up as an expense on the *P&L*.

### Example C — Bubbles, bought and spent
A member **tops up 50 Bubbles for ₦5,000**.
- You now **owe ₦5,000** of service → the **Bubbles Liability** goes up ₦5,000.

Later they **spend 10 Bubbles** on a session (10 × ₦100 = ₦1,000).
- You delivered ₦1,000 of service → that's **₦1,000 of revenue**, and the Bubbles
  Liability drops to ₦4,000 (they have 40 Bubbles left).

**Where you'd see it:** *Bubbles Liability* shows what's still owed; the spend
shows up as revenue on the *P&L*.

**Today's real number:** members hold **439 Bubbles**, so the books show a
**₦43,900** Bubbles liability — split **₦22,900 bought with cash** and **₦21,000
given out free** (promos/welcome bonuses).

### Example D — reconciliation catching a real problem
When the books were matched to Paystack's payouts, **101 of 102** transactions
matched perfectly. **One ₦5,000 payment** had settled at Paystack but was
**missing from the books** (its record had been lost during development). The
system flagged it as a **break**. We confirmed it was a real community payment,
**booked the missing ₦5,000**, and the break cleared. That's the safety net
working — it found the one needle in the haystack.

### Example E — the whole picture today
The books currently hold about **₦1.6 million** of total recorded activity, and
they **balance to the kobo**. Every figure on every screen traces back to a
dated, sourced entry you can open and inspect.

---

## 4. The screens, one by one

Everything lives under **`/admin/finance`** and needs a finance login (separate
from being an app admin — see *Finance Team*).

### `/admin/finance/reports` — your financial statements
Six reports stacked on one page. Pick a date (or date range) at the top of each.

- **Trial Balance** — a list of every account's balance, with a **Balanced**
  badge. This is the "are the books internally consistent?" check. If it says
  *Balanced*, every naira is accounted for.
- **Profit & Loss (P&L)** — **what you earned minus what it cost = profit (or
  loss)** over a period. View it "by domain" to see which parts (academy, club,
  store…) make money.
- **Balance Sheet** — a snapshot of the business: what you **own**, what you
  **owe**, and your **stake** (equity). It always balances (own = owe + stake).
  The "Current-Year Earnings" line is this year's profit so far.
- **Cash Position** — **where your cash is**: settled *in the bank* vs *in transit*
  at Paystack. In-transit should trend to ~₦0 as payouts arrive.
- **Gross Margin by Domain** — for each area, **revenue minus its direct cost**,
  and the margin %. Tells you which areas are actually profitable per sale.
- **Bubbles Liability** — **how much you owe members in unspent Bubbles**, split
  bought-with-cash vs given-free.

### `/admin/finance/deferred-revenue`
**Money you've collected but not yet earned** — memberships and cohorts you've
been paid for but are still delivering. The "Remaining" column is what you still
owe in service. As time passes it moves into earned revenue automatically.

### `/admin/finance/reconciliation`
**Does the bank match the books?** Shows how many of Paystack's settled
transactions matched your records, and lists any **breaks** (settled money that
isn't booked, or doesn't tie out). An empty list means everything ties. A break
is a to-do: investigate and book the missing piece.

### `/admin/finance/periods`
The **months** and their status. Close a month once reviewed — *soft-close*
allows corrections, *hard-close* locks it. This protects the books from
accidental backdated edits.

### `/admin/finance/journal-entries`
The **raw record** — every transaction and its two halves. This is the audit
trail: any number on any report can be traced back to entries here.

### `/admin/finance/invoices`  *(working via the system; on-screen page coming)*
Formal invoices with proper **gapless numbering** (`SB-2026-000123`). Today the
system can issue/list/cancel invoices; the clickable screen is the next addition
(see §6 for who actually needs it).

### `/admin/finance/users` — Finance Team
**Who can see the books**, and at what level (view-only, accountant, admin,
owner). Note: this is **separate** from general SwimBuddz admin — add your
accountant here to give them access.

---

## 5. The accountant's monthly checklist

1. **Trial Balance** says *Balanced*.
2. **P&L** reviewed (by domain).
3. **Balance Sheet** balances; deferred-revenue and Bubbles liabilities look
   right.
4. **Deferred Revenue** "Remaining" matches the Balance Sheet.
5. **Reconciliation** breaks worked down to zero (resolved or explained).
6. **Cash Position**: in-transit ≈ ₦0; bank matches the real bank statement.
7. **Close the month** (soft, then hard once final).

---

## 6. Do you need invoices yet — and for whom?

Short answer: **yes, but only for corporate (B2B) clients — not individual
members.**

- **Individual members** (academy/club/community/store) get an automatic
  **Paystack receipt** when they pay. That's enough for a consumer; they don't
  ask for a formal invoice, and Nigeria's e-invoicing rules don't require B2C
  invoicing for a business your size yet.
- **Corporate wellness clients** (companies buying programs for their staff) are
  different: a company **needs a formal invoice** — with your business details, a
  proper number, their company name — to pay you and to record the expense in
  *their* books. They will ask for one. This is the real near-term need, and it's
  where the gapless `SB-2026-…` numbering matters.

**Recommendation:** when we build the invoices screen, aim it at **corporate** —
issue an invoice against a corporate deal/program, view and print it, mark it
paid/void. Member invoicing can wait (receipts already cover it), and full tax
(VAT) invoicing waits until you've decided what's VAT-able and have FIRS
credentials.

---

## 7. What's done, and what's still ahead

**Done and live:** every money movement is recorded; nightly earning
(recognition) and month-close; bank-matching reconciliation; the full report set
(trial balance, P&L, balance sheet, cash, margin, deferred revenue, Bubbles
liability); a safety net so no entry is ever silently lost; and invoice numbering.

**Still ahead:**
- The **invoices screen** (for corporate — see §6).
- **VAT/tax invoicing & FIRS e-invoicing** — once you've set what's taxable and
  have FIRS credentials.
- **Store cost-of-sales and driver/pool payouts** — waiting on upstream data.
- A **stricter database isolation** step — only needed if/when you sell this to
  other organisations.

---

*Rule of thumb: if a number ever looks off, open `/admin/finance/journal-entries`
and find the entry behind it. Every figure has a dated, sourced, balanced record.*

*Last updated: 2026-06-03*
