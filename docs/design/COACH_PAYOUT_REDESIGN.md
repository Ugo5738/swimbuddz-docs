# Coach Payout Redesign — Fixed Per-Class Rate

**Status:** Proposed (design) · **Date:** 2026-06-23 · **Owner:** Daniel
**Supersedes the calculation in** `swimbuddz-backend/services/payments_service/services/payout_calculator.py`
**Related:** [COACH_OPERATIONS_FRAMEWORK.md](../academy/COACH_OPERATIONS_FRAMEWORK.md) §6 · [PRICING_STRATEGY.md](../club/PRICING_STRATEGY.md) · [project memory: coach-payout-calculation]

---

## 1. Why

Academy coaches are paid a **revenue share of the cohort fee, per 4-week block** (COACH_OPERATIONS_FRAMEWORK §6). The intended decomposition: a coach earns `band% × cohort_price` per student who completes, delivered evenly across the cohort's classes. For a 40% band on a ₦150,000 cohort that is **₦60,000 per student**, i.e. **₦5,000 per class** across a 12-class cohort.

The current implementation diverges from this in three ways, all of which **underpay coaches**:

1. **Diluted rate.** The per-class rate is computed each block as
   `cohort_price × band% ÷ total_blocks ÷ sessions_in_block`, where `sessions_in_block`
   is the count of **all** non-cancelled cohort sessions in the 4-week window — **including make-up and extra sessions**, which are stored as ordinary cohort sessions. Extra sessions inflate the denominator and pull the per-class rate **below** the intended fixed amount. ([payout_calculator.py `_per_session_amount_kobo`](../../swimbuddz-backend/services/payments_service/services/payout_calculator.py))
2. **Make-ups mishandled.** A make-up should *recover one missed class* at the standard rate. Instead it adds an extra payable session at the **diluted** rate.
3. **Frozen snapshot.** A pending payout's amount is computed once when the block is generated and **never recomputes**; attendance marked later (the norm — see the chronic late-marking problem) is never credited.

**Worked example — coach Joseph, "Beginner Freestyle – Apr 2026", Block 2 (May 16 – Jun 13):**
The window held 7 sessions (4 weekly + 3 make-ups), so the rate became **₦2,857/session** instead of ₦5,000/class. A student who attended all 4 expected weeks earned the coach only **₦11,428** instead of ₦20,000.

| Basis | Block 2 total |
|---|---|
| Stored / frozen (what's on the books) | **₦25,714** |
| Recomputed on today's attendance, current formula (÷7) | ₦48,571 |
| **Intended model (this doc)** — ₦5,000 × attended classes | **₦75,000** |

---

## 2. The model (agreed)

### 2.1 Fixed per-class rate, frozen at setup
When a coach's recurring-payout config is created, compute **once and store**:

```
per_class_amount = cohort_price × band% ÷ total_classes
```

| Input | Source | Frozen on config? |
|---|---|---|
| `cohort_price` | cohort price snapshot (`cohort_price_amount`, already stored) | ✓ existing |
| `band%` | the coach's **grade** → the category pay band (`scoring.py get_pay_band`; G1 35–42%, G2 43–52%, G3 53–65% for Learn-to-Swim), within the cohort's complexity-validated range; **auto-derived from grade**, admin-overridable | ✓ existing field `band_percentage` |
| `total_classes` | the **cohort's planned class count** — see §2.2 | ✕ **new field** |
| `per_class_amount_kobo` | computed from the three above | ✕ **new field** |

The rate is now a fixed property of *(this cohort, this coach)* and **cannot be diluted** by make-ups or extra sessions.

### 2.2 `total_classes` = the cohort's planned session count (NOT `duration_weeks`)
Cohorts of the **same program** run at different cadences. Verified in prod (2026-06-23):

| Cohort (Beginner Freestyle, `duration_weeks`=12) | Planned (week-numbered) cohort sessions |
|---|---|
| May 2026 | **24** (≈ 2×/week) |
| Apr 2026 | ~13 |
| Feb 2026 | ~13 |

So `duration_weeks` (12) is **not** the class count — the May cohort delivers 24 classes for the same 12-week program. The single existing program happens to have `duration_weeks` = curriculum weeks = curriculum lessons = 12, but the **cohort's cadence overrides this**, so the denominator must be cohort-specific.

**Source:** at config creation, count the cohort's **planned regular sessions** — the wizard-generated `cohort_class` sessions carrying a `week_number` (ad-hoc make-ups are created without one) — and freeze that as `total_classes`. Fallbacks if none exist yet: the active curriculum's lesson count, else `duration_weeks`. **Never hardcode 12 or assume 1/week.**

> **Revenue-share invariant this preserves:** a student attending every planned class yields the coach exactly `band% × cohort_price` for that student, *regardless of cadence*. A 1×/week cohort pays ₦5,000/class; a 2×/week cohort pays ₦2,500/class; both total ₦60,000/student at 40%.

### 2.3 What counts toward pay
Per student, per the founder's May-2026 policy (pay per lesson **actually held**):

```
paid_classes(student) = min( attended_classes + made_up_classes , total_classes )
coach_pay(student)    = per_class_amount × paid_classes(student)
```

- **attended** = a `present` or `late` attendance record on a cohort session (the coach marks this — see §2.5).
- **made-up** = a make-up the student attended (also a `present`/`late` record). Counted as an attended class — **no separate credit term, no double-count.**
- **cap** = a student never pays out more than `total_classes` × rate (= `band% × price`). Make-ups *recover* missed classes up to the cap; genuine extras beyond the plan add nothing (the student's fee only funded the planned classes).

This replaces the current "delivered_count + makeups_completed, at the diluted rate" with a single capped count at the fixed rate.

### 2.4 Two coaches (main + assistant) — shared pool, co-taught
When a cohort has a lead **and** an assistant:

- The cohort's pay band is **one shared pool**, split **70 / 30** (lead / assistant).
  - `lead_band   = cohort_band × 0.70`
  - `assistant_band = cohort_band × 0.30`
- **Co-taught:** both coaches earn their share for **every** attended student-class.
- Total coach cost is **unchanged** by adding an assistant (still one band's worth of the fee).

Each coach has their own `recurring_payout_config` (the table is already keyed per coach+cohort) holding their **effective** (post-split) band, so the per-coach math is identical to the single-coach case:

```
lead_per_class      = cohort_price × (cohort_band × 0.70) ÷ total_classes
assistant_per_class = cohort_price × (cohort_band × 0.30) ÷ total_classes
```

**Example** — ₦150k cohort, 40% band, 12 classes:
| | Effective band | Per class | Per student (12 classes) |
|---|---|---|---|
| Single coach | 40% | ₦5,000 | ₦60,000 |
| Lead (70%) | 28% | ₦3,500 | ₦42,000 |
| Assistant (30%) | 12% | ₦1,500 | ₦18,000 |
| **Lead + assistant total** | 40% | ₦5,000 | ₦60,000 |

Roles already exist in `CoachAssignment` (lead/assistant/shadow). **The split is driven by the count of ACTIVE paid coach assignments (lead + assistant) on the cohort:** 1 active coach → that coach gets the **full** band; 2 active coaches → **70/30** (lead/assistant). It's resolved when each coach's config is created/refreshed. (Note: a *cancelled* assignment doesn't count — e.g. the test assistant on the Apr-2026 cohort was cancelled 2026-06-23, so Joseph stays at the full 40%.)

### 2.5 Pay accrues when the coach marks attendance
Already supported: `POST /sessions/{session_id}/coach-mark` (assigned coach or admin) writes `present`/`late` records, which is what credits the coach. No change needed — but it makes **prompt attendance marking operationally essential** (unmarked = unpaid).

### 2.6 Recompute pending before pay (fixes the freeze)
A pending payout must be **recomputed from current attendance** at the moment it is approved/paid (and the live coach dashboard already recomputes on view). This captures attendance marked after the block was generated. Joseph's Block 2 corrects upward once recomputed.

---

## 3. Implementation plan (staged)

**Stage 1 — schema & freeze (migration)**
- Add to `recurring_payout_configs`: `total_classes` (int), `per_class_amount_kobo` (int), and `role` (enum: lead/assistant, default lead). Generate via `./scripts/db/migrate.sh payments_service "..."` (never hand-write).
- At config creation ([recurring_config.py](../../swimbuddz-backend/services/payments_service/routers/recurring_payout/recurring_config.py)): resolve `total_classes` (§2.2), `band%` from grade, apply the 70/30 split if a role is given, and store `per_class_amount_kobo`.

**Stage 2 — calculator rewrite**
- Rewrite `_per_session_amount_kobo` → read the frozen `per_class_amount_kobo` (drop the `÷ total_blocks ÷ sessions_in_block` dilution).
- `compute_block_payout`: per student, `paid_classes = min(present/late attended in block, remaining cap)`; remove the separate `makeups_completed` term (make-up attendance already counts as attended). Enforce the per-student cumulative cap at `total_classes`.

**Stage 3 — recompute before pay**
- On `approve` / `complete-manual` / `initiate-transfer`, recompute the payout from current attendance before locking the amount.

**Stage 4 — multi-coach**
- Allow creating an assistant config (role=assistant) with the 30% share; lead gets 70%. Confirm the coach dashboard renders both.

**Stage 5 — docs & tests**
- Update COACH_OPERATIONS_FRAMEWORK §6 + COACH_HANDBOOK with the fixed-per-class model and the 70/30 multi-coach split.
- Calculator tests: cadence 1×/week vs 2×/week; make-up recovery; the cap; lead/assistant split; recompute-before-pay.

**Stage 6 — backfill**
- Recompute existing PENDING payouts under the new model. Joseph's Block 2 (and any other open pending) correct to the fixed-rate figure. Journal before/after (prod write).

---

## 4. Edge cases & consequences

- **Extensions:** classes beyond the frozen `total_classes` are **not** separately paid — the student's fee funded the planned classes, and the coach's cap is `band% × price`. Extensions are for delivery quality / weather catch-up, funded by the original fee. (If genuinely-new paid classes are ever wanted, that's a price change, not a payout change.)
- **Cancelled sessions:** excluded (no lesson held) — unchanged.
- **Late join / dropout:** keep the existing eligibility clipping (a coach isn't paid for classes before a student enrolled or after they dropped); a missed pre-enrollment class becomes a make-up obligation, recoverable within the cap.
- **Cadence detection:** relies on planned sessions carrying `week_number`. If a cohort is mis-generated without week numbers, fall back to curriculum lessons / `duration_weeks` and log it.

---

## 5. Constraints / risks
- **Money-critical + shared cloud DB.** The migration and the backfill touch live pay. Stage, review each stage, journal the backfill.
- **Cannot be run/tested locally here** — needs the docker stack; rely on unit tests for the calculator + a staging run before backfill.
- **openapi + frontend types** must be regenerated after the config schema changes (`scripts/api/generate-openapi.py`, `npm run generate:types`).

---

## 6. Decisions captured (2026-06-23)
- Fixed per-class rate, frozen at setup. ✓
- `total_classes` = cohort planned session count (not `duration_weeks`). ✓
- Make-ups = attended classes, capped at `total_classes`; no separate credit. ✓
- Recompute pending before pay. ✓
- Multi-coach: shared pool, **70/30 lead/assistant**, co-taught. ✓
- Pay accrues on coach attendance-marking. ✓
