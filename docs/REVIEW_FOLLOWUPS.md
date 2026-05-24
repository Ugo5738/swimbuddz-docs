# Code-Review Follow-ups (deferred, tracked)

Authoritative backlog for the items from the comprehensive code review
that were **deliberately not finished inline** — either because they're
inherently incremental (codified rule + reference exemplar, then
migrate-on-touch) or because they're standalone projects (DB
migrations / product input) that must not be bulk-executed in a
cleanup batch.

Everything else from the review is **closed** (see commit history:
E1/E3/E4, F2/F4/F5–F7 rules, G2 5 named pages, G2/G3/G4 rules + full
G4 sweep, D1/D3/D4/D6/D7, H1/H4/H5, FU1/2/3/5/6/7/8/9). This file
tracks only what remains.

Status legend: 🟦 backlog (rule live, migrate-on-touch) · 📋 project
(needs its own PR series) · ✍️ needs product input · ✅ done.

---

## 1. F5/F6/F7 — Type discipline 🟦 (in progress)

**What:** ~50 components on the raw `fetch()` + manual
`useState/useEffect/catch` triad; ~130 `any`-typed API payloads.

**Already done:** rule codified — `CONVENTIONS.md` §3 (no `any` on
payloads = review blocker) and §6 (`useApi` is the canonical client GET
hook; **migrate-on-touch**). Foundation `src/hooks/useApi.ts` shipped +
unit-tested (11 cases). Reference migrations: `community/directory`,
`community/tips`, `community/events` pages.

**Sweep progress (2026-05-23 → 2026-05-24, 16 PRs):**

| PR | File(s) | Δ fetch | Δ any |
|---|---|---:|---:|
| `d9f1ebb` | `app/page.tsx` + new `_homepage/api.ts` + `MembersApi.getPublicMember` | −3 | −10 |
| `2877adc` | `(public)/gallery`, `(public)/tips/page`, `(public)/tips/[id]/page` | −3 files | 0 |
| `642890c` | `admin/homepage-media` + hoisted `SiteAsset` to `lib/media.ts` | −7 | −6 |
| `f60c6a2` | `admin/academy/enrollments/[id]` (drop no-op casts) | 0 | −9 |
| `9ebc32f` | `components/admin/TemplatesDrawer` + `RideShareConfigEntry` | 0 | −8 |
| `4c85937` | `admin/attendance` (memberId casts + 6 catch-any) | 0 | −8 |
| `58ff743` | `admin/academy/programs/[id]/edit` (curriculum_json types, STEPS tuple) | 0 | −7 |
| `87665b9` | `admin/sessions` cluster (`SessionFormModal` + `SessionPayload`/`SessionRideConfig`); **deleted dead 357-line `EditSessionForm.tsx`** | 0 | −16 |
| `e53b4d5` | `lib/registration.ts` (parseDateMs unknown; drop dead `(error as any)?.response.status`) | 0 | −3 |
| `d0e7302` | `admin/pools/page.tsx` (2 catch any → unknown narrowing) | 0 | −2 |
| `340d3d7` | `admin/dashboard/page.tsx` (4 raw fetches → Promise.all/apiGet; typed sort) | −1 | −2 |
| `b26fd79` | `attendance/page.tsx` (hoist Route; type optional pickup-loc routes; catch unknown) | 0 | −3 |
| `4be377a` | `admin/sessions/utils.ts` (FastAPI error body shape) | 0 | −2 |
| `558349c` | `lib/academy/types.ts` + `programs/[id]/page.tsx` + edit page (hoist CurriculumJson + PrepMaterials; drop 3 structural any from types.ts) | 0 | −7 |
| `8434afe` | `lib/academy/api.ts` (preferences → Record<string, unknown>) | 0 | −2 |
| `19df436` | `checkout/page.tsx` (intentPayload via Partial<CreatePaymentIntentRequest>; catch unknown) | 0 | −2 |
| **Total** | | **−5 files** | **−88 (116 → 28)** |

Counts as of `19df436`: **34 fetch files, 28 `any` usages.**

Patterns proven (in order of impact): useApi for client GETs ·
apiGet/apiPost/apiDelete + typed payload · drop no-op casts when the
type already covers the access · **delete dead code instead of typing
it** · `unknown + instanceof Error` for catch narrowing · `apiPost`
throws plain `Error` (no axios-style `.response.status` — string-match
the message or use HTTP status text) · **hoist structural JSON
shapes** out of "freeform" `any` columns (`CurriculumJson`,
`PrepMaterials`, `PaymentIntentRequest` via `Partial<components[…]>`).

**Top remaining `any` hotspots** (post-sweep, still migrate-on-touch):
1. `(member)/account/onboarding/page.tsx` — 4 (form-state casts)
2. `(member)/upgrade/academy/details/page.tsx` — 2 (skillAssessment casts)
3. Long tail of ~20 files with 1-2 each.

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

## 2. G2 — Mega-component splits ✅ (5 named pages done 2026-05-22)

**Closed for the 5 named candidates** in 5 dedicated PRs over the
800-line hard cap:

| Page | Before | After (raw) | Commit |
|---|---:|---:|---|
| `(member)/account/billing/page.tsx` | 1010 | 241 | `9fdda43` |
| `(admin)/admin/academy/cohorts/new/page.tsx` | 1074 | 249 | `ffe329b` |
| `(member)/account/onboarding/page.tsx` | 1242 | 746 | `83f6709` |
| `(admin)/admin/store/products/[id]/edit/page.tsx` | 1416 | 639 | `ec0e379` |
| `(admin)/admin/community/volunteers/page.tsx` | 1918 | 697 | `ecda90d` |

Pattern: thin orchestrator `page.tsx` + `_<page>/` sub-directory with
focused JSX-section components and (optionally) hooks for substantial
business logic. All split-out children are well under the 500-line
component cap.

**Note:** the larger pages (onboarding, store product, volunteers)
still have a single `max-lines` warning around 600–620 lint-counted —
the structural floor for orchestrators that own many `useState`
declarations and share a single `load`/refetch path across tabs.
Pushing them further would mean a megahook (hides line count without
reducing complexity) or fragmenting form state across step files
(adds prop drilling). All five are well under the 800 hard cap.

**Still open (not in the named-5 list):** a number of other pages and
components still exceed the soft target, eg. `admin/attendance`,
`admin/transport`, `admin/academy/cohorts/[id]/score`,
`admin/homepage-media`, `admin/academy/programs/[id]/edit`,
`(public)/store/product/[slug]`, plus components like `PoolForm` (922
raw lines), `SessionSignIn` (798). They're below the named-5
threshold; address them as migrate-on-touch the next time someone is
working in those files.

**Flipping the rule:** before raising `max-lines` from `warn` →
`error`, the remaining oversize files (above) need to either be split
or get an ESLint per-file override. Defer until that backlog is
clear.

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

## 4. B4 — Audit-log unification ✅ (closed 2026-05-24)

**What:** `wallet_audit_logs`, `store_audit_logs`, `chat_audit_log`
were three divergently-shaped tables.

**Closed:** three sequenced PRs (wallet → store → chat) — each adopted
the canonical shape from `libs/common/audit.py` (`AuditLogMixin` +
`AuditLogRead` Pydantic + `make_action` / `parse_uuid_or_none`
helpers). Each service keeps its **own** physical table per the
service-isolation rule; what they share is the **column shape**. Full
design in
[`docs/design/B4_AUDIT_LOG_UNIFICATION.md`](./design/B4_AUDIT_LOG_UNIFICATION.md).

| PR | Status | Commit | Notes |
|---|---|---|---|
| Wallet | ✅ done 2026-05-24 | swimbuddz-backend `d32c9f6` | `libs/common/audit.py` (mixin + Pydantic + helpers), wallet model adopts canonical 12 cols, 3 writers + reader + schema migrated, 2 alembic migrations applied to dev DB (Supabase `bhdugkgialnkbvdbtnpi`, eu-central-1), 1 row backfilled cleanly, row-count invariant held, 36/36 wallet tests + 26/26 contract tests pass. |
| Store | ✅ done 2026-05-24 | swimbuddz-backend `0b4f9ed` | StoreAuditLog inherits mixin. `log_audit` helper namespaces action (`store.<verb>`), parses actor_id best-effort, maps `notes`→`reason`. 14 callers unchanged (helper signature kept stable). Stage 1 adds nullable cols + new composite index; stage 2 converts entity_type enum→String, backfills, drops legacy + `store_audit_entity_type_enum`. Applied to dev DB (0 rows). 20/21 store integration tests pass (1 pre-existing failure unrelated). |
| Chat | ✅ done 2026-05-24 | swimbuddz-backend `3ebd103` | ChatAuditLog inherits mixin; keeps `channel_id` / `subject_member_id` as chat-specific denormalized scope columns for admin filters; drops `message_id` (now in `entity_id` when entity_type=`message`) and `payload` (split per backfill). `log_action()` uses per-`ChatAuditAction` `_ENTITY_MAP` to derive entity_type + COALESCE-pick entity_id. Admin reader projects canonical→legacy `AuditLogItem` so the API contract stays stable. Stage 1 additive; stage 2 converts action enum→String, backfills per-action via CASE arms, drops legacy + `chat_audit_action_enum`. Applied to dev DB; 3 rows backfilled cleanly. 13/13 chat integration + 26/26 contract tests pass. |

**Patterns proved (in order of impact):**
- `libs/common/audit.py` is the single source of truth — services
  just inherit `AuditLogMixin` and import `DOMAIN_*` / `make_action` /
  `parse_uuid_or_none`.
- Two-stage migration: stage 1 = additive nullable columns (safe
  rollback boundary); stage 2 = backfill + ALTER NOT NULL + drop
  legacy. Convert any enum→String **before** writing namespaced text
  into the column.
- Row-count invariant: pre-flight `COUNT(*)` compared post-backfill;
  migration raises `RuntimeError` if any row failed to populate the
  always-required canonical cols (domain / entity_type / entity_id /
  created_at depending on service).
- Service-specific extras (chat's `channel_id` /
  `subject_member_id`) live on the concrete model, not the mixin —
  pragmatic when admin filters need them as denormalized refs.

**Optional follow-up (later, not scoped here):** the canonical shape
makes a cross-domain audit reader (e.g. "show everything this
admin did across services") structurally feasible. Product-side
decision when the need arises.

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

- **B4 wallet PR1** — ✅ closed (see §4); all three B4 PRs landed.
- **Middleware dead-branch fix** — ✅ already fixed directly in commit
  `7c69f1e` (the `requiredTier` lowest-tier correction + symmetric
  academy-lapsed→billing). The chip is **redundant — safe to dismiss.**

---

_Last updated: 2026-05-24 (B4 fully closed across wallet/store/chat; F5/F6/F7 16-PR sweep → 34 fetch, 28 `any`)._
