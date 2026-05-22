# Code-Review Follow-ups (deferred, tracked)

Authoritative backlog for the items from the comprehensive code review
that were **deliberately not finished inline** — either because they're
inherently incremental (codified rule + reference exemplar, then
migrate-on-touch) or because they're standalone projects (DB
migrations / product input) that must not be bulk-executed in a
cleanup batch.

Everything else from the review is **closed** (see commit history:
E1/E3/E4, F2/F4/F5–F7 rules, G2/G3/G4 rules + full G4 sweep,
D1/D3/D4/D6/D7, H1/H4/H5, FU1/2/3/5/6/7/8/9). This file tracks only
what remains.

Status legend: 🟦 backlog (rule live, migrate-on-touch) · 📋 project
(needs its own PR series) · ✍️ needs product input · ✅ done.

---

## 1. F5/F6/F7 — Type discipline 🟦

**What:** ~50 components still use the raw `fetch()` + manual
`useState/useEffect/catch` triad; ~130 `any`-typed API payloads.

**Already done:** rule codified — `CONVENTIONS.md` §3 (no `any` on
payloads = review blocker) and §6 (`useApi` is the canonical client GET
hook; **migrate-on-touch**). Foundation `src/hooks/useApi.ts` shipped +
unit-tested (11 cases). Reference migrations: `community/directory`,
`community/tips`, `community/events` pages.

**Definition of done:** raw-`fetch()` component count and `any`-payload
count trend to ~0 via migrate-on-touch; new code uses `useApi`
(or React Query for cache-sharing) from the start.

**How to measure:**
`grep -rlE "fetch\(" src --include="*.tsx" | grep -v __tests__ | wc -l`
and `grep -rnE ":\s*any\b|as any\b" src --include="*.ts*" | grep -v __tests__ | wc -l`.

**Optional hardening (later):** add an ESLint rule banning raw `fetch`
in `src/app|src/components` once the count is low enough to flip to
`error`.

---

## 2. G2 — Mega-component splits 🟦

**What:** files over the `CONVENTIONS.md` §12 caps — ~5 pages >800
lines (admin volunteers 1.5k, store product edit 1.4k, onboarding
1.25k, academy cohorts/new, account/billing) and several components
>500.

**Already done:** §12 rule + how-to-split + backlog policy codified;
ESLint `max-lines` warn@500 is **live** (`.eslintrc.json`, with the
`api-types.ts` override). Reference split: homepage `page.tsx`
980→915, two static sections extracted to `src/app/_homepage/`.

**Definition of done:** oversize files split (page = thin orchestrator
of focused children, per §12). Once the backlog is clear, raise
`max-lines` from `warn` → `error` so new violations block CI.

**Note:** these are stateful pages with no test safety net — split
them in **dedicated PRs** (one file or cluster each), not bulk. Don't
bulk-rewrite untested 1k-line pages.

---

## 3. G4 — Raw `<img>` → `next/image` ✅ (closed 2026-05-22)

**Closed:** swept across 8 PRs (442f9bb → 54d615b). Final state: zero
raw `<img>` in JSX. The 4 remaining grep matches are:
- `src/components/ui/MediaInput.tsx` — blob-preview exception (line 247,
  eslint-disabled) + the comment explaining it (line 244).
- `src/app/(admin)/admin/gallery/[id]/upload/page.tsx` — same blob
  exception (line 396, eslint-disabled with a documented comment).
- `src/components/admin/EnrollmentEvidenceGallery.tsx` — false positive
  (the string `<img>` appears in a JSDoc comment).

`@next/next/no-img-element` flipped from `warn` to `error` in
`.eslintrc.json` — new violations now fail CI. `CONVENTIONS.md` §5
documents three patterns (width/height, fill, intrinsic
width-0/height-0) plus the blob exception.

---

## 4. B4 — Audit-log unification 📋

**What:** `wallet_audit_logs`, `store_audit_logs`, `chat_audit_log`
are three divergently-shaped tables.

**Already done:** full design + scoping note —
[`docs/design/B4_AUDIT_LOG_UNIFICATION.md`](./design/B4_AUDIT_LOG_UNIFICATION.md).
Key correction captured: a single shared table would violate service
isolation; unification = a shared **shape** (`libs/common` mixin), not
a shared table. First PR (wallet) spawned as a dedicated task.

**Definition of done:** three sequenced PRs (wallet → store → chat),
each: model→canonical, `migrate.sh`-generated migration + lossless
compliance-grade backfill (row-count invariant), readers/writers
updated, contract test for the canonical shape. **Never** hand-write
the migrations.

---

## 5. D2 / H2 — `PRODUCT_ANALYSIS.md` missing ✍️

**What:** the review flagged a missing product-analysis document.

**Why deferred:** this is product-strategy content, not a code
finding. A stub adds no value; it needs founder/product input on
scope and intent. Not appropriate for an AI agent to fabricate.

**Definition of done:** product owner specifies the doc's purpose and
audience; then it can be drafted. Until then, intentionally open.

---

## 6. FU4 — React Query underused ✅ (by policy)

Addressed by convention rather than a sweep: `CONVENTIONS.md` §6 now
directs cache-sharing cases to React Query and GET-with-state to
`useApi`. Adoption is incremental alongside §1 (F5–F7). No standalone
action required.

---

## Spawned task chips

- **B4 wallet PR1** — open (see §4).
- **Middleware dead-branch fix** — ✅ already fixed directly in commit
  `7c69f1e` (the `requiredTier` lowest-tier correction + symmetric
  academy-lapsed→billing). The chip is **redundant — safe to dismiss.**

---

_Last updated: 2026-05-22 (G4 closed)._
