# Stroke Lab — Standalone PUBLIC Analyzer Design

**Status:** Proposed — for team review BEFORE any code touches production `ai_service`.
**Owner:** Daniel (founder) + backend.
**Scope:** A registration-OPTIONAL, public-facing front door for the existing Stroke Lab freestyle analyzer, marketed on Reddit, at a new domain **`analyzer.swimbuddz.com`**. It reuses the SAME backend (`api.swimbuddz.com` gateway → `ai_service` (8011) → ai-worker pipeline). The only net-new pieces are: a new Netlify front-end site, new **PUBLIC** (no-JWT) endpoints inside `ai_service`, a credits/paywall layer (Gumroad), and a separate compute queue/worker for public jobs.

**Last updated:** 2026-06-15

---

## 1. Overview, Goals, Non-Goals

### 1.1 What this is

Today every `/ai/analyze*` endpoint requires a Supabase JWT (`Depends(get_current_user)`, `services/ai_service/routers/analyze.py`). This design adds a parallel **public** surface — `/ai/public/*` — that identifies a guest by **email + a guest token** instead of a logged-in user, runs their freestyle video through the **same** analysis pipeline on an **isolated** queue, and **emails** them a magic-link to the result when it finishes hours later. A free tier (1 analysis per email) seeds a marketing list; beyond that, paid **Gumroad** credits are required.

### 1.2 Goals

- **Reuse the existing pipeline unchanged.** The ML worker (`services/ai_service/tasks/analyze.py` → `run_analysis(...)`) is reused verbatim; the same `task_analyze_swim_video` task runs public jobs on a different queue.
- **Async-notify, no real-time pressure.** Visitor uploads → honest "results in a few hours" estimate → **emailed** when done. Removes the real-time-spinner expectation and the Reddit-spike risk of a long synchronous request.
- **Compute isolation.** Public jobs run on a SEPARATE arq queue (`arq:ai-public`) + a dedicated, CPU/mem-capped worker container so a public spike cannot starve or crash member traffic on the existing `arq:ai` queue. (History: the uncapped ai-worker once melted the 2-core DigitalOcean box → site-wide Netlify edge timeouts.)
- **Email-gated free tier.** 1 free analysis per email; builds a marketing list of swimmers who opted in.
- **Gumroad credits.** Four live Gumroad products map permalink → credits. Crediting via Gumroad Ping webhook, with a license-key redeem fallback. Reserve-on-submit / refund-on-failure.
- **Honest, freestyle-only marketing.** The product analyzes freestyle only; the copy must say so.
- **Strict service isolation.** All new state (`analyzer_credit_accounts`, `analyzer_credit_ledger`) lives INSIDE `ai_service`. No cross-service imports, no cross-service DB access.

### 1.3 Non-Goals

- **Not multi-stroke.** Freestyle only. `SUPPORTED_STROKES = {"freestyle"}` (`services/ai_service/routers/analyze.py:55`) stays; the public submit endpoint rejects anything else with 400.
- **Not real-time.** No synchronous "watch it process" UX for public jobs. The member flow (with its own queue + polling) is unchanged.
- **Not a Paystack flow.** Public payments are **Gumroad** only. The existing `StrokeLabFoundingMember` Paystack path (`services/ai_service/routers/founding_members.py`) is a separate, parallel system and is NOT touched.
- **Not a new auth provider.** Guests have NO Supabase account. Identity = email + `guest_token` in the request body, plus a stateless signed JWT for the result magic-link (HS256, `SUPABASE_JWT_SECRET`, same secret used everywhere).
- **Not a change to member endpoints.** The 4 member endpoints, their queue (`arq:ai`), and their response schemas are untouched except where a column they read becomes nullable (see §3a — handled with a public-only response schema, no member-facing change).
- **Not a Bubbles/wallet integration.** Gumroad credits are a separate closed-loop currency from the `wallet_service` Bubbles system. We REPLICATE wallet's ledger patterns inside `ai_service`; we do NOT call `wallet_service`.

---

## 2. Architecture

```
                                  analyzer.swimbuddz.com
                         (NEW Netlify site — no Supabase, no auth)
                                          │
                 browser fetches go same-origin to /api/* (Netlify rewrite)
                                          │
                 netlify.toml:  /api/*  →  https://api.swimbuddz.com/api/:splat  (200, force)
                                          │
                                          ▼
                    ┌─────────────────────────────────────────────┐
                    │      gateway_service  (api.swimbuddz.com)     │
                    │  CORS allow_origins += analyzer.swimbuddz.com │
                    │  /api/v1/ai/{path}  → catch-all proxy to ai   │  (no gateway code change for routing)
                    │  + dedicated IP-rate-limited routes for the   │
                    │    public upload & webhook (placed ABOVE the  │
                    │    /api/v1/ai/{path:path} catch-all)          │
                    └─────────────────────────────────────────────┘
                                          │  /ai/public/*
                                          ▼
   ┌──────────────────────────────────────────────────────────────────────────┐
   │                         ai_service  (port 8011)                            │
   │                                                                            │
   │   NEW public_router (mounted at /ai, prefix /public)  — NO JWT             │
   │     POST /ai/public/analyze                (submit, reserve credit)        │
   │     GET  /ai/public/analyze/{job_id}       (poll/result, guest_token)     │
   │     GET  /ai/public/credits                (balance by email)              │
   │     POST /ai/public/credits/redeem         (license-key fallback)         │
   │     POST /ai/public/gumroad/webhook        (Ping → grant/revoke credits)  │
   │                                                                            │
   │   NEW models (IN ai_service):                                             │
   │     analyzer_credit_accounts   (email → balance, free_used)               │
   │     analyzer_credit_ledger     (append-only: grant/reserve/consume/...)   │
   │   ALTER swim_analysis_jobs: member_auth_id NULLABLE                       │
   │            + guest_email, guest_token, source(enum)                       │
   │                                                                            │
   │   enqueue_job("task_analyze_swim_video", _queue_name="arq:ai-public")     │
   └──────────────────────────────────────────────────────────────────────────┘
                 │  arq:ai-public (Redis)                  ▲  HTTP (service-role JWT)
                 ▼                                         │  EmailClient.send(...)
   ┌──────────────────────────────────┐        ┌──────────────────────────────────┐
   │   ai-worker-public (NEW)          │        │   communications_service (8004)   │
   │   same ai_service image           │        │   POST /email/send  (require_     │
   │   queue_name = "arq:ai-public"    │        │     service_role)                 │
   │   CPU/mem caps (mirror prod ai-w) │        │   → Brevo SMTP relay              │
   │   runs task_analyze_swim_video    │        └──────────────────────────────────┘
   │   on completion →                 │
   │     EmailClient.send("ready",     │   "ready" email contains magic-link:
   │       magic-link)                 │   https://analyzer.swimbuddz.com/r/{jobId}?t=<jwt>
   └──────────────────────────────────┘

   Gumroad  ──(server-to-server POST, form-encoded, no CORS)──▶  /api/v1/ai/public/gumroad/webhook
   Gumroad /v2/licenses/verify  ◀──(redeem fallback, permalink+key, no token)── ai_service
```

Key facts this diagram relies on (verified):

- The gateway AI proxy is a **pure catch-all** that forwards any `/api/v1/ai/*` to `ai_service` `/ai/*` with **no auth enforcement** (`services/gateway_service/app/main.py:526-531`). New `/ai/public/*` routes are reachable **with zero gateway routing changes**. The only gateway edits are the CORS origin (§4/§10) and the optional dedicated rate-limited routes (§9).
- Public routers mount inside `ai_service` via `create_app()` (`services/ai_service/app/main.py:19-46`) — `app.include_router(public_router, prefix="/ai")` → `/ai/public/*`.
- The Gumroad webhook is server-to-server (no `Origin` header) so CORS is irrelevant for it; it follows the existing Paystack-webhook shape (no-JWT POST inside a service, reached via the catch-all) — `services/payments_service/routers/webhooks.py:30,35`.
- Email is sent from the **worker** (the only place that knows when the hours-later job finishes) via the shared `EmailClient` over HTTP to `communications_service` — the same pattern `corporate-worker` uses (`services/corporate_service/services/outreach.py:198-205`).

---

## 3. Data Model Changes

All changes live INSIDE `ai_service` (hard constraint: no cross-service tables). Enum TYPE names are globally unique (single public schema) — every new `sa.Enum(name=...)` is namespaced to its table.

### 3a. Alter `AnalysisJob` (table `swim_analysis_jobs`)

File: `services/ai_service/models/analysis.py:46-116`.

| Column | Change | Type | Nullable | Default | Index |
|---|---|---|---|---|---|
| `member_auth_id` | **ALTER** `nullable=False` → `nullable=True` | `UUID(as_uuid=True)` | **yes** (was no) | — | `index=True` (unchanged) |
| `guest_email` | **ADD** | `String(320)` | yes | — | `index=True` |
| `guest_token` | **ADD** | `String(64)` | yes | — | `index=True` |
| `source` | **ADD** | `Enum(AnalysisJobSource, name="analysis_job_source_enum", values_callable=...)` | no | `MEMBER` / `server_default="member"` | — |
| `email_sent_at` | **ADD** | `DateTime(timezone=True)` | yes | — | — (set inside `_write_completed` so the "ready" email sends exactly once; §6.5) |

New enum (mirror the existing `swim_analysis_job_status_enum` pattern at `analysis.py:76-86`):

```python
class AnalysisJobSource(str, enum.Enum):
    MEMBER = "member"   # uploaded by a logged-in member (has member_auth_id)
    PUBLIC = "public"   # uploaded by an email-gated guest (has guest_email + guest_token)
```

Model edits (exact):

- `member_auth_id`: change `Mapped[uuid.UUID]` → `Mapped[Optional[uuid.UUID]]` and `nullable=False` → `nullable=True` (`analysis.py:58-60`).
- Add:
  ```python
  guest_email:  Mapped[Optional[str]] = mapped_column(String(320), nullable=True, index=True)
  guest_token:  Mapped[Optional[str]] = mapped_column(String(64),  nullable=True, index=True)
  email_sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
  source: Mapped[AnalysisJobSource] = mapped_column(
      Enum(AnalysisJobSource, name="analysis_job_source_enum",
           values_callable=lambda x: [e.value for e in x]),
      nullable=False, default=AnalysisJobSource.MEMBER, server_default="member",
  )
  ```
- `String(320)` for `guest_email` = the conventional local-part(64) + `@` + domain(255) email length (generous; matches the credit tables). `guest_token` is a 32-byte token rendered as ~43-char URL-safe base64; `String(64)` is comfortable headroom.

**`guest_token` is per-job, server-generated, never client-supplied.** A fresh `secrets.token_urlsafe(32)` is minted for **every** submit and stored on that one job. The submit endpoint does NOT accept a client-supplied `guest_token` (§4.1) — there is no "reuse my token" branch — so a leaked token exposes exactly one clip, never a visitor's whole history. "Returning visitor" is identified for credit/quota purposes purely by `guest_email` (the `analyzer_credit_accounts` key), not by a long-lived token. This makes §5.1's "one token = one job" literally true and keeps the `guest/{guest_token}/{job_id}` storage prefix a single-clip blast radius. The `guest_token` index is therefore non-unique only because the same UUIDv4 collision space already makes it effectively unique per job; we never query "all jobs for a token."

**CHECK constraint (hand-add to the migration — autogenerate WILL NOT detect it on an EXISTING table).** Enforce that the two identity modes are mutually consistent:

```python
op.create_check_constraint(
    "ck_swim_analysis_jobs_identity",
    "swim_analysis_jobs",
    "(source = 'member'  AND member_auth_id IS NOT NULL) OR "
    "(source = 'public'  AND guest_email IS NOT NULL AND guest_token IS NOT NULL)",
)
```

**Pre-existing rows satisfy this CHECK (verify before apply).** Adding `source NOT NULL server_default 'member'` backfills every legacy row to `source='member'`. The CHECK then requires those rows to have `member_auth_id IS NOT NULL`, which holds today because the column was `nullable=False` before this migration — so `op.create_check_constraint` validates cleanly on a populated table. The migration-review step (§11 step 4) must state this explicitly: a single legacy `member` row with a NULL `member_auth_id` would abort the apply, so the backfill ordering (add column with default, THEN add the CHECK) is mandatory.

**`is_public` is NOT overloaded.** `is_public` (`analysis.py:91-93`) remains a read-access/sharing gate; `source` is the member-vs-public discriminator. Do not conflate them.

**Index for the public lookups.** Add a composite index for the public poll/balance scans:

```python
op.create_index("ix_swim_analysis_jobs_guest_email_created", "swim_analysis_jobs",
                ["guest_email", "created_at"])
```

(The single-column `guest_token` index above lets the result poll find a job by token cheaply; the composite supports "all jobs for this email, newest first" if we ever expose a guest history.)

**Member-facing serialization safety.** `AnalysisJobResponse.member_auth_id: uuid.UUID` is non-optional (`services/ai_service/schemas/analysis.py:28-42`). A guest job has `member_auth_id = NULL`, which would fail that schema. We therefore introduce **separate public response schemas** (§4) rather than relaxing the member schema — member endpoints never return guest jobs, so their schema is unchanged. (If we later want one schema for both, make `member_auth_id` `Optional[uuid.UUID]`; not required for this design.)

### 3b. New table `analyzer_credit_accounts` (running balance, keyed by email)

One row per email (lowercased before write). Mirrors `wallet_service`'s `wallets` balance row, replicated in-service.

| Column | Type | Nullable | Default | Constraints / Index |
|---|---|---|---|---|
| `id` | `UUID(as_uuid=True)` PK | no | `uuid.uuid4` | PK |
| `email` | `String(320)` | no | — | `unique=True, index=True` (store lowercased) |
| `remaining_credits` | `Integer` | no | `0` / `server_default="0"` | `CheckConstraint("remaining_credits >= 0", name="ck_analyzer_acct_remaining_nonneg")` |
| `reserved_credits` | `Integer` | no | `0` / `server_default="0"` | `CheckConstraint("reserved_credits >= 0", name="ck_analyzer_acct_reserved_nonneg")` |
| `free_used` | `Boolean` | no | `false` / `server_default="false"` | — |
| `lifetime_purchased` | `Integer` | no | `0` / `server_default="0"` | — |
| `lifetime_spent` | `Integer` | no | `0` / `server_default="0"` | — |
| `created_at` | `DateTime(timezone=True)` | no | `utc_now` | — |
| `updated_at` | `DateTime(timezone=True)` | no | `utc_now` (`onupdate=utc_now`) | — |

Because this is a **NEW** table, the inline `CheckConstraint(...)` declarations DO render in autogenerate's `create_table`. Still verify the generated file contains them; hand-add if missing.

### 3c. New table `analyzer_credit_ledger` (append-only source of truth)

One row per grant / free-grant / reserve / consume / refund / revoke. Mirrors `wallet_transactions` (`services/wallet_service/models/transaction.py`), replicated in-service. The FK to `analyzer_credit_accounts` is an **intra-service** FK (allowed).

| Column | Type | Nullable | Default | Constraints / Index |
|---|---|---|---|---|
| `id` | `UUID(as_uuid=True)` PK | no | `uuid.uuid4` | PK |
| `account_id` | `UUID(as_uuid=True)` | no | — | `ForeignKey("analyzer_credit_accounts.id", ondelete="CASCADE")`, `index=True` |
| `email` | `String(320)` | no | — | `index=True` (denormalized for lookup) |
| `idempotency_key` | `String(120)` | no | — | **`unique=True, index=True`** |
| `entry_type` | `Enum(..., name="analyzer_credit_entry_enum")` | no | — | values: `gumroad_grant`, `free_grant`, `reserve`, `consume`, `refund`, `revoke` |
| `direction` | `Enum(..., name="analyzer_credit_direction_enum")` | no | — | values: `credit`, `debit` |
| `amount` | `Integer` | no | — | `CheckConstraint("amount > 0", name="ck_analyzer_ledger_amount_pos")` |
| `balance_before` | `Integer` | no | — | snapshot |
| `balance_after` | `Integer` | no | — | snapshot |
| `source` | `String(20)` | no | — | `'gumroad'` / `'free'` / `'system'` |
| `gumroad_sale_id` | `String(120)` | yes | — | **`unique=True`** (sale dedup key) |
| `gumroad_license_key` | `String(120)` | yes | — | redeem fallback (NOT unique — double-grant is prevented by `gumroad_sale_id` uniqueness, since both webhook and redeem resolve to `gumroad-sale-{sale_id}`) |
| `gumroad_permalink` | `String(40)` | yes | — | `vrjec`/`fgopu`/`puxlbz`/`arlum` |
| `job_id` | `UUID(as_uuid=True)` | yes | — | `index=True` — the `swim_analysis_jobs.id` a reserve/consume/refund belongs to. Plain UUID, NO FK (`swim_analysis_jobs` is the same service, but we keep this loose so a deleted job doesn't cascade-wipe ledger history) |
| `reversal_of_id` | `UUID(as_uuid=True)` | yes | — | points back at the entry a refund/revoke cancels |
| `created_at` | `DateTime(timezone=True)` | no | `utc_now` | — |

Enum TYPE names: `analyzer_credit_entry_enum`, `analyzer_credit_direction_enum` (globally unique).

**Idempotency keys (natural unique keys via `idempotency_key`):**

| Operation | `idempotency_key` |
|---|---|
| Free grant (1 per email) | `free-{canonical_email}` |
| Gumroad sale grant | `gumroad-sale-{sale_id}` |
| License-redeem grant | resolves to `gumroad-sale-{sale_id}` (use the `sale_id` returned by `/v2/licenses/verify`, NOT the license key — so webhook + redeem can't double-grant the same sale) |
| Reserve on submit | `reserve-{job_id}` |
| Consume on success | `consume-{job_id}` |
| Refund on failure | `refund-{job_id}` |
| Gumroad refund/dispute revoke | `gumroad-revoke-{sale_id}` |

**`{canonical_email}` is the normalized address (see §5.2 / §6.4), not the raw input.** Before keying the free grant (and before creating/looking up an `analyzer_credit_accounts` row) the email is canonicalized: lowercased, `+tag` stripped, and for Gmail the dots removed from the local part. This collapses `me+1@gmail.com`, `me+2@…`, and `m.e@gmail.com` to one free-tier identity, the cheapest high-impact anti-farm control.

**The `free-{canonical_email}` unique key is necessary but NOT sufficient on its own** — the actually-contended resource on a brand-new email is the `analyzer_credit_accounts` row, which does not yet exist (you cannot `SELECT … FOR UPDATE` a row that hasn't been inserted). Two concurrent first-submits for the same new email would both read "no account / `free_used == False`." Exactly-once is therefore enforced by an **upsert-then-lock** sequence (§6.2): `INSERT … ON CONFLICT (email) DO NOTHING` to materialize the account row, THEN `SELECT … FOR UPDATE` to lock it, THEN check `free_used` under the lock and write the `free-{canonical_email}` ledger row. The ledger unique key is the final backstop; the account-row upsert is what makes the lock meaningful.

### 3d. Alembic env.py registration (REQUIRED for the new tables)

`services/ai_service/alembic/env.py` (verified at `:20-27` and `:40-47`):

1. Add the two new model classes to the import block (`:20-27`):
   ```python
   from services.ai_service.models import (
       AIModelConfig, AIPromptTemplate, AIRequest,
       AnalysisJob, AnalysisResult, StrokeLabFoundingMember,
       AnalyzerCreditAccount, AnalyzerCreditLedger,   # NEW
   )
   ```
2. Add both table names to `SERVICE_TABLES` (`:40-47`):
   ```python
   "analyzer_credit_accounts",
   "analyzer_credit_ledger",
   ```
3. Re-export the classes from `services/ai_service/models/__init__.py` (add to both the import list and `__all__`).

Without BOTH the import AND the `SERVICE_TABLES` entry, `include_object` (`env.py:50-55`) silently emits nothing for the new tables.

Altering `swim_analysis_jobs` needs no env.py change — it's already in `SERVICE_TABLES` and imported.

---

## 4. API Contract — PUBLIC endpoints

All under `/ai/public/*` (reached via gateway `/api/v1/ai/public/*`). **Auth = none** (no `Depends(get_current_user)`). Router: `APIRouter(prefix="/public", tags=["stroke-lab-public"])`, mounted with `prefix="/ai"`.

**Route-ordering pitfall (verified):** the literal `/public/credits` and `/public/credits/redeem` routes MUST be registered before any `/public/analyze/{job_id}` wildcard within the router, and the `analyze` collection route before its `{job_id}` variant — same ordering discipline as the member router where `/me` precedes `/{job_id}` (`services/ai_service/routers/analyze.py`).

**Heavy-import hygiene (CI constraint):** the public router/schemas MUST NOT import the ML pipeline at module load (CI installs only `.[dev]`, no cv2/mediapipe/torch; `generate-openapi.py` imports `ai_app`). The pipeline is reached only inside the worker, which already imports it lazily (`analysis/__init__.py` PEP-562). Public submit only enqueues.

---

### 4.1 `POST /ai/public/analyze` — submit a guest job

- **Auth:** none. **Content-Type:** `multipart/form-data`.
- **Form fields:**
  - `video: UploadFile` (required) — freestyle clip.
  - `guest_email: str` (required) — validated as email; canonicalized server-side (lowercase, strip `+tag`, drop Gmail dots; §6.4).
  - `stroke_type: str = "freestyle"` (must be `freestyle` → else 400).
  - **No `guest_token` field.** The server ALWAYS mints a fresh per-job token (`secrets.token_urlsafe(32)`) and returns it; the client never supplies one (§3a/§5.1). This removes the "leaked token exposes all my jobs" escalation.
- **Server-side validation (do NOT trust the client):**
  - `stroke_type` not in `SUPPORTED_STROKES` → **400**.
  - empty file → **400**.
  - `len(data) > PUBLIC_MAX_UPLOAD_BYTES` (**50 MB — matches the member cap** at `analyze.py:58`; this bounds the *compressed* upload, not the raw file — the browser runs `compressVideoForUpload` first, exactly like the member flow, so large raw iPhone clips are downscaled to ~10–30 MB before upload) → **413**.
  - email fails format check → **422**.
  - **kill switch:** if `PUBLIC_ANALYZER_ENABLED` is false (env) → **503** with `{"detail": "temporarily_unavailable"}` before any work (§9.5).
  - **global daily cap:** if today's public-job count ≥ `PUBLIC_DAILY_JOB_CAP` (or free-job count ≥ `PUBLIC_DAILY_FREE_CAP`) → **503** (§9.5). Defeats a botnet/viral spike that per-IP limits miss.
  - **Note on duration:** the size cap does NOT bound worker time (a 30 MB, 10-minute 240p clip is small but burns the whole `job_timeout`). The **duration cap is enforced in the WORKER, not here** — see §9.3 for why (the API image has no ffmpeg/ffprobe and the heavy-import-hygiene rule forbids loading it). The client also fast-fails on duration (`readVideoDuration > 90s`, §10.3) for UX, but that is advisory only.
- **Identity / quota / reserve — ONE atomic transaction, explicit ordering (resolves the compensating-refund race):**
  The job INSERT, the credit reserve, and the storage-path write share **one DB transaction and one session**. Credits are reserved **only after** the upload succeeds, so an upload failure means nothing was ever reserved and a plain `rollback()` of the job INSERT is sufficient — **no compensating refund exists, because no reserve happened.** Sequence:
  1. **INSERT** `AnalysisJob(status=PENDING, source=PUBLIC, guest_email=<canonical>, guest_token=<fresh>, member_auth_id=NULL, stroke_type="freestyle")`; `flush()` for `job.id`. (No reserve yet.)
  2. **Upload** the video bytes to storage under the guest key `guest/{guest_token}/{job_id}.{suffix}` (§5.4). On failure → `rollback()` (drops the un-committed job row) → **502**. Nothing was reserved; nothing to refund.
  3. **In the same transaction, with the account row locked** (upsert-then-lock per §6.2: `INSERT analyzer_credit_accounts … ON CONFLICT (email) DO NOTHING`, then `SELECT … FOR UPDATE`):
     - If `free_used == False`: write `free_grant` (`free-{canonical_email}`), set `free_used=True`, `remaining_credits += 1`.
     - If now `remaining_credits < 1` → **402 Payment Required** `{"detail": "no_credits", "buy_url_base": "https://swimbuddz.gumroad.com/l/"}` (the whole transaction rolls back — the job row never persists, so a paywalled visitor leaves no orphan job).
     - Reserve 1 credit: write `reserve` debit (`reserve-{job_id}`), `remaining_credits -= 1`, `reserved_credits += 1`.
     - Set `job.video_storage_path = <guest key>`.
  4. **`commit()`** — job + reserve + storage-path land atomically.
  5. **Enqueue** `enqueue_job("task_analyze_swim_video", str(job.id), _queue_name=PUBLIC_QUEUE_NAME)` (`PUBLIC_QUEUE_NAME = "arq:ai-public"`). **Enqueue failure** (Redis down) happens AFTER commit, so the reserve IS committed — this is the ONE place a compensating refund is needed: on `enqueue_job` raising, write `refund-{job_id}` and mark the job `FAILED`, then **502**. (See §6.1 — the compensating refund covers enqueue failure, not storage failure.)
- **Response (202):** new schema `PublicAnalysisJobResponse`:
  ```json
  {
    "job_id": "uuid",
    "status": "pending",
    "guest_token": "string",          // echo so the FE can store it
    "estimated_ready_hint": "We'll email you when it's ready — usually a few hours.",
    "credits_remaining": 0
  }
  ```
- **Status codes:** 202 created · 400 bad stroke/empty · 402 no credits · 413 too large/too long · 422 bad email/duration · 502 storage failure.
- **Rate limit:** dedicated gateway route `@limiter.limit("5/minute")` (IP-keyed) ABOVE the AI catch-all (§9) + per-email business limit (max N in-flight PENDING/PROCESSING jobs per email, e.g. 1) returning **429** in-service.

### 4.2 `GET /ai/public/analyze/{job_id}` — poll / fetch result

- **Auth:** none. Identity proof via one of (prefer the header/body forms to keep the bearer capability out of access logs and `Referer`, §5.6):
  - request header `X-Guest-Token: <token>` (preferred), or query `?guest_token=<token>` (fallback for the in-session FE), must equal the job's `guest_token`, OR
  - query `?t=<magic_jwt>` (HS256, `purpose="analyzer_view_result"`, `job_id` claim must equal path `job_id`; §5/§8) — unavoidably in the URL because it is an emailed link, so its TTL/exchange is tightened in §5.3/§5.6.
- If neither proof matches → **404** (not 403 — match the member endpoint's existence-non-leak at `analyze.py:303-305`).
- **Response (200):** `PublicAnalysisJobDetailResponse` — reuses the member detail shape (`AnalysisJobDetailResponse`, `schemas/analysis.py:94-100`) minus `member_auth_id`, plus `status`, `result: AnalysisResultPayload | null`, `original_video_url`, `annotated_video_url` (signed URLs, 1 h TTL via `signed_url_for_*`). Drills resolved at response time via `resolve_drill(...)` exactly as `analyze.py:92-101`.
- **`status="failed"` is a first-class response, not an error.** When the job FAILED (corrupt video, low pose-detection, worker crash), return 200 with `status="failed"`, `result=null`, and a user-safe `failure_reason` string (e.g. `"could_not_track"` / `"video_unreadable"`). The FE renders a "we couldn't analyze this one — your credit was refunded, try another clip" panel (§10.3). A **low pose-detection** job still COMPLETES (it is not a failure) — the result page frames a low-tracking report honestly rather than as an error so the user doesn't feel cheated.
- Signed URLs are included only when the token proof matches (always true here since a match is required to get 200) and only when `status="completed"`.
- **Status codes:** 200 (incl. `pending`/`processing`/`completed`/`failed`) · 404 (bad/missing token, or job not found) · 410 (job assets deleted/expired — retention TTL, §13.2).
- **Rate limit:** default IP bucket is sufficient (cheap read); the FE poll interval is widened to ~15 s (§10).

### 4.3 `GET /ai/public/credits?email=<email>` — balance for an email

This is an **unauthenticated email oracle** if it returns `free_used`/raw balance for any address — anyone could enumerate "is this person a customer / has this email used the free tier." To avoid that while still serving the FE's only real need ("show paywall or free button?"), the endpoint returns a **coarse, non-enumerable** shape and does NOT expose `free_used` to anyone lacking a token for that email.

- **Auth:** none for the coarse fields; a matching `guest_token` (header/query) or magic-JWT for that email unlocks the exact balance.
- **Response (200), no token:**
  ```json
  { "email": "user@example.com", "can_submit_free": false, "remaining_credits": 0 }
  ```
  `can_submit_free` is the single boolean the paywall needs; `remaining_credits` is the purchasable balance (the thing a paying user wants to confirm after buying). **`free_used` is NOT returned without a token** — because `free_used: true` *is* exactly the "has this email ever been used" reveal the oracle must not give to strangers.
- **Response (200), with a valid token for the email:** adds `"free_used": <bool>` and any internal detail the owner is entitled to.
- **Rate limit:** IP-keyed; this is the "I've paid — refresh my credits" affordance, so allow a modest burst (e.g. `20/minute`); the `5/min`-style brute-force ceiling is unnecessary here since no secret is guessed, but the daily-cap kill switch still applies.
- **Status codes:** 200 · 422 bad email.

### 4.4 `POST /ai/public/credits/redeem` — license-key fallback

For buyers who paid with a different email than the one they analyze under.

- **Auth:** none. **Body (JSON):**
  ```json
  { "email": "claim-to@example.com", "license_key": "XXXX-...", "product_permalink": "puxlbz" }
  ```
- **Flow:** server calls Gumroad `POST https://api.gumroad.com/v2/licenses/verify` with `product_permalink` + `license_key` (NO access token needed). On `success: true`:
  - Extract `sale_id` from the verify response → grant `PERMALINK_CREDITS[permalink]` credits to `email` under `idempotency_key=gumroad-sale-{sale_id}` (so a sale already credited by the webhook can't double-grant). **The `gumroad-sale-{sale_id}` key is the single-use guarantee** — re-redeeming the same key (same sale) hits the existing ledger row and returns 409. (We do NOT rely on a `gumroad_license_key` unique column; §3c.)
  - Optionally increment Gumroad's `uses` to mark the key consumed (requires the access token; OPTIONAL — see §7).
- **Response (200):**
  ```json
  { "granted": 10, "remaining_credits": 10 }
  ```
- **Status codes:** 200 · 400 invalid permalink · 402/422 verify failed/invalid key · 409 already redeemed (our idempotency) · 502 Gumroad unreachable.
- **FE error states (§10.3) — this is the highest-friction paid path, so each maps to a clear message:**
  - 422 invalid/unknown key → "That license key wasn't recognized. It's in your Gumroad receipt email and your Gumroad Library."
  - 409 already redeemed → "Those credits are already on **{email-on-record}** — sign in with that email." (Reveal only the email the sale credited, to the holder of a valid key.)
  - 400 wrong product → "That key is for a different product."
  - The redeem box shows inline help on where the key lives (receipt email / Library), since most buyers don't know.
- **Rate limit:** dedicated `@limiter.limit("5/minute")` (brute-force protection on license keys is critical).

### 4.5 `POST /ai/public/gumroad/webhook` — Gumroad Ping

- **Auth:** none from Gumroad's side (no HMAC), so we layer THREE checks (§7.2), in order: (1) an unguessable **shared-secret path token** on the Ping URL — `…/gumroad/webhook?token=<GUMROAD_PING_TOKEN>` configured in env and pasted into the Gumroad dashboard Ping URL (the closest analog to Paystack's HMAC); (2) `seller_id` match; (3) **mandatory** license re-verify (`/v2/licenses/verify`) before granting. **Content-Type:** `application/x-www-form-urlencoded` → parse with `await request.form()`, NOT JSON.
- **Behavior:** parse `sale_id`, `email` (buyer), `product_permalink`, `license_key`, `seller_id`, `refunded`, `disputed`.
  - On a **sale**: a sale Ping that lacks a verifiable `license_key` is **rejected, not granted** — `seller_id` alone (which is public, §7.2) is never sufficient. With a verified key: grant `PERMALINK_CREDITS[permalink]` to buyer email (`idempotency_key=gumroad-sale-{sale_id}`).
  - On **refund/dispute/chargeback** Pings (`refunded=true`/`disputed=true`): apply the SAME path-token + `seller_id` authenticity gate as the grant path (otherwise a spoofer who knows a real `sale_id` could forge a refund Ping to **revoke a victim's credits**), then write a `revoke` debit (`idempotency_key=gumroad-revoke-{sale_id}`, idempotent against replay). When the access token is provisioned, additionally confirm the sale is genuinely refunded via the API before revoking.
- **Response:** **always 200** `{"received": true}` on every non-fatal path (unknown permalink, duplicate sale, unhandled event, AND authenticity failure — we 200-and-drop so we never leak which checks ran) so Gumroad does not retry-storm — exactly the Paystack webhook's ack discipline (`webhooks.py:106,227-231`). A bad/missing path `token` is the one exception: return **403** before parsing the body (it is not a real Gumroad Ping).
- **`response_model`:** returns a JSON body, so no `-> None`/204 concern here. (The 204-crash workaround `response_model=None` applies only to any future no-content public route, e.g. a guest delete; flag it there.)
- **Rate limit:** dedicated gateway route `@limiter.limit("30/minute")` (IP-keyed) ABOVE the catch-all, to blunt abuse of the public webhook path.

### 4.6 `DELETE /ai/public/analyze/{job_id}` — guest delete (ships, for erasure)

Owner-proof via `guest_token` (header or query) or the magic-JWT; `status_code=204, response_model=None` — the **`response_model=None` is the mandatory FastAPI-0.111.1 workaround** for a `-> None` 204 route (a 204 with a `-> None` annotation crashes at import; replicate the member delete at `analyze.py:322-352`). Deletes the job row + its storage objects (original + annotated). **This SHIPS (not optional)** because it is the GDPR right-to-erasure path (§13); a stranger's video + email is identifiable PII the moment we post to Reddit. A no-token request → 404 (existence non-leak). Erasure-by-email (delete all jobs for an email) is admin-side or a follow-up; the per-job delete covers the common request.

### Permalink → credits map (code constant, env-overridable)

```python
PERMALINK_CREDITS = {"vrjec": 1, "fgopu": 3, "puxlbz": 10, "arlum": 25}
# vrjec  → $6  Single   (1)
# fgopu  → $12 Starter  (3)
# puxlbz → $29 Popular  (10)
# arlum  → $59 Coach    (25)
```

---

## 5. Guest Identity & Security

### 5.1 `guest_token` — generation & secrecy

- Generated server-side with `secrets.token_urlsafe(32)` (32 random bytes → ~43 chars) **on every submit** — never accepted from the client. Stored on the job (`swim_analysis_jobs.guest_token`) and returned to the FE on submit. The FE persists it in `localStorage` keyed by `jobId` for the in-session "queued" return path.
- The token is a **bearer capability** for that single job: anyone with `(job_id, guest_token)` can read that ONE result. Because tokens are minted per-job, a leaked token never exposes a visitor's other jobs (the prior draft's "returning visitor reuses an existing token" branch is removed — returning visitors are recognized by `guest_email` for quota/credit purposes, never by a long-lived token).
- There is no per-token revocation in Phase 0–4 (low value for a freestyle clip the user just uploaded); deletion of the job removes access.
- **It is NOT a session/account.** It does not grant access to other jobs or to the credit balance. One token = one job — literally, by construction.

### 5.2 Email gating

- The free tier is enforced by `analyzer_credit_accounts.free_used` + the upsert-then-lock sequence (§6.2) + the `free-{canonical_email}` idempotency key — a **DB business rule**, not a transport rate limit (slowapi can't key on a body field; verified `_get_user_or_ip` runs before body parse). This is the correct layer for an email quota.
- Email is **not verified** before the free analysis (no double-opt-in) — friction would kill the funnel. The cost of a fake email is one free analysis on the isolated queue; acceptable. The "ready" email simply bounces for fake addresses. Real marketing-list value comes from people who want their result emailed.

### 5.3 Result magic-link (the emailed link)

- Link: `https://analyzer.swimbuddz.com/r/{jobId}?t=<jwt>`.
- JWT: `jose` HS256 signed with `SUPABASE_JWT_SECRET` (reuse, no new secret), claims `{ "purpose": "analyzer_view_result", "job_id": str, "guest_email": str, "iat", "exp" }`. Minted in `ai_service` (new `services/ai_service/auth.py`, copying `corporate_service/auth.py:mint_token`).
- **TTL = 7 days** (down from the draft's 30 — a long-lived bearer token in a URL is a leak risk via `Referer`/history/logs; 7 days still covers the realistic "click later" window). The `corporate_service` magic-link uses a 24 h TTL with a magic→session swap (`auth.py:MAGIC_LINK_TTL`); we adopt the same *pattern* below.
- **Single-exchange → httpOnly cookie (recommended), mirroring `corporate_service/auth.py`:** the first `GET /r/{jobId}?t=<jwt>` exchanges the URL token for a short httpOnly, `Secure`, `SameSite=Lax` cookie scoped to the result path, and the FE strips `?t=` from the address bar (`history.replaceState`). Subsequent polls authenticate via the cookie, so the bearer token stops appearing in URLs/logs/referrers after the first hop. (If cookie-swap is deferred past Phase 4, the 7-day TTL + `Referrer-Policy: no-referrer` + log scrubbing in §5.6 are the fallback.)
- Verify on `GET /ai/public/analyze/{job_id}?t=...` (or the swapped cookie): `jwt.decode(..., algorithms=["HS256"], options={"verify_aud": False})`, assert `purpose == "analyzer_view_result"` and `claims["job_id"] == path job_id`. Holding the token IS the auth — no Supabase JWT, no login.

### 5.4 Signed-URL exposure on public jobs

- Video access is ALWAYS via short-lived signed URLs (`DEFAULT_SIGNED_URL_TTL_SECONDS = 3600`, `storage.py:43`) using the service-role client. Buckets stay **private** (`strokelab-uploads`, `strokelab-annotated`). The guest never gets a permanent public URL.
- **Storage key scheme for guests:** member keys are `{member_auth_id}/{job_id}.{suffix}` (`storage.py:46-52`). Guests have no member id, so add a guest-aware key builder: `guest/{guest_token}/{job_id}.{suffix}`. The `guest_token` prefix keeps guest objects namespaced and unguessable (the token is 32 random bytes). The worker uses the job's stored `video_storage_path` directly (it doesn't re-derive the key), so only the upload-time key builder changes.

### 5.5 Abuse vectors & mitigations

| Vector | Mitigation |
|---|---|
| Free-tier farming (many fake emails) | Isolated `arq:ai-public` queue + gateway IP rate-limit (`5/min` on submit) caps throughput; free analysis is cheap on the capped worker; `free-{email}` makes each email exactly 1 free. |
| Reddit spike DoS on shared gateway RAM (50 MB × N buffered twice) | Public cap = member **50 MB** (parity; client compresses first); gateway IP rate-limit + `Content-Length` pre-check on the public upload route; worker-side duration cap. Members are light users so shared resources are ample (founder decision, Jun 2026). |
| Guessing another guest's `job_id` | Reads require the matching `guest_token` or magic-JWT; 404 on mismatch (no existence leak). `job_id` is a UUIDv4; `guest_token` is 32 random bytes. |
| License-key brute force on redeem | `5/min` IP limit on `/credits/redeem`; Gumroad's own verify is the real gate; our `gumroad_sale_id` uniqueness prevents replay. |
| Webhook spoofing (fake "sale" → free credits) | `seller_id` match + optional license re-verify before granting (§7); idempotent on `sale_id`. |
| Header-spoofed email quota bypass | Quota is keyed on the **body** `guest_email` in DB logic, not a header; can't be spoofed past the unique `free-{email}` key. |
| Stored XSS via `guest_email` in the "ready" email | Escape `guest_email` when rendering email HTML; never reflect it unescaped. Validate email format server-side. |
| Free-tier farming via plus-addressing / dotted Gmail | Canonicalize email before keying (`+tag` strip, Gmail dot strip, lowercase) so `me+1@`, `me+2@`, `m.e@gmail.com` collapse to one free identity (§6.4). |
| Botnet / viral spike that defeats per-IP limits | Global `PUBLIC_DAILY_JOB_CAP` + `PUBLIC_DAILY_FREE_CAP` and a `PUBLIC_ANALYZER_ENABLED` kill switch (§9.5). |
| Buy credits → extract reports → refund on Gumroad ("digital-goods fraud") | Accepted, bounded: revoke only blocks *future* analyses (the report was already delivered); refunded email may be flagged/blocked from the free tier; Gumroad dispute fees are a cost line (§7.7). |

### 5.6 Bearer-token leakage via logs / Referer / history

The `guest_token` and the magic-JWT are bearer capabilities; in URLs they leak via `Referer` headers, browser history, server access logs, and the gateway's `proxy_request`, which appends `query_params` to the forwarded path (`gateway_service/app/main.py:786-788`) — so `?t=`/`?guest_token=` would land in `ai_service` logs too. Mitigations (all in scope for launch):

- **Prefer header/body over query** for `guest_token` on the poll (`X-Guest-Token`, §4.2). The query form stays only as the FE in-session fallback.
- **Magic-JWT single-exchange → httpOnly cookie** (§5.3) removes it from URLs after the first hop; TTL cut to 7 days.
- **`Referrer-Policy: no-referrer`** header on the analyzer Netlify site so the result URL never leaks to third-party assets (§10.4).
- **Scrub `t` and `guest_token`** from request logging at the gateway and in `ai_service` (redact those query keys before the access-log line is written). Verify they are not currently logged in plaintext.

---

## 6. Free Tier + Credit Logic

### 6.1 Reserve-on-submit / refund-on-failure (atomic, replicated from wallet)

Replicate `wallet_service`'s atomic pattern in-service (NO import of wallet code; verified isolation requirement). The wallet pattern assumes the balance row already exists; the email-keyed account does NOT for a first-time email, so we add an upsert step the wallet pattern lacks:

0. **Materialize the account row first (upsert):** `INSERT INTO analyzer_credit_accounts (email, …) VALUES (<canonical>, …) ON CONFLICT (email) DO NOTHING`. Without this, `SELECT … FOR UPDATE` on a not-yet-inserted row locks nothing and two concurrent first-submits both proceed. The upsert makes the row exist so the lock in step 2 is real.
1. **Pre-check idempotency:** `SELECT analyzer_credit_ledger WHERE idempotency_key == key` → return existing if found (wallet `wallet_ops.py:226-237`).
2. **Row lock:** `select(AnalyzerCreditAccount).where(email==<canonical>).with_for_update()` serializes concurrent submits for the same email (wallet `wallet_ops.py:240-241`) — now meaningful because step 0 guaranteed the row exists.
3. **Validate + write:** check `remaining_credits >= 1` (after free-grant if applicable), write the ledger row with `balance_before`/`balance_after` snapshots, update the account.
4. **Commit with `IntegrityError` fallback:** on a unique-key race (ledger `idempotency_key`, or the account `unique(email)` if two requests both raced the upsert), rollback and re-fetch the winning row (wallet `wallet_ops.py:301-319`).

Lifecycle per job:

- **Submit:** `free_grant` (if first time) → `reserve` (`reserve-{job_id}`): `remaining_credits -= 1`, `reserved_credits += 1`. Ordering, atomicity, and the enqueue-failure compensating refund are specified in §4.1 (one transaction; reserve only after upload succeeds; refund only on enqueue failure).
- **Worker success:** `consume` (`consume-{job_id}`): `reserved_credits -= 1`, `lifetime_spent += 1`. (Net: the reserved credit is now spent.) Idempotent on `consume-{job_id}`.
- **Worker failure (`_mark_failed`):** `refund` credit (`refund-{job_id}`, `reversal_of_id` = the reserve entry): `remaining_credits += 1`, `reserved_credits -= 1`. A failed analysis never costs the user a credit.

**The consume/refund write MUST share the SAME `AsyncSessionLocal()` transaction and `commit()` as the status flip** (verified: `_write_completed` and `_mark_failed` each open their own session and commit independently — `tasks/analyze.py`). Both the credit tables and `swim_analysis_jobs` are in-`ai_service`, so a single transaction over both is legal and required:

- In `_write_completed(...)`: inside the existing `async with AsyncSessionLocal() as session:` block, after setting `status=COMPLETED` and adding the `AnalysisResult` row, perform the `consume-{job_id}` ledger write + account update on that **same `session`**, then a **single `commit()`**. If the process dies before the commit, NOTHING is persisted (status still PENDING/PROCESSING, credit still reserved) and a re-run redoes the whole unit; if it dies after, everything is consistent. A separate-transaction consume would strand a reserved credit on a COMPLETED job forever — this is the bug being closed.
- In `_mark_failed(...)`: same discipline — the `refund-{job_id}` write rides the same session/commit as the `status=FAILED` flip. A separate refund could leak a reserved credit on a FAILED job.
- **Idempotency under any future retry:** the consume/refund are keyed `consume-{job_id}` / `refund-{job_id}`, and `_write_completed` is already idempotent (it deletes+recreates the result row). So even a re-run of the completion path cannot double-debit. See §6.5 for the worker-retry semantics that this depends on.

No cross-service hop: the worker uses the same in-service credit-ops module (NO import of `wallet_service`).

### 6.2 Free tier (1 per email) — upsert-then-lock

First submit for a canonical email with `free_used == False` → `free_grant` (`free-{canonical_email}`), `free_used=True`, then reserve. **Exactly-once requires the upsert-then-lock sequence (§6.1 step 0), not the ledger unique key alone**, because the contended resource is the account row, which does not exist yet for a new email:

1. `INSERT analyzer_credit_accounts (email=<canonical>, free_used=false, …) ON CONFLICT (email) DO NOTHING` — both racers' inserts converge on one row; the loser is a no-op.
2. `SELECT … WHERE email=<canonical> FOR UPDATE` — now locks a real row; the second racer blocks here until the first commits.
3. Under the lock, re-read `free_used`. The first racer sees `false` → grants the free credit and sets `free_used=true`; the second, on acquiring the lock, sees `true` → no free grant (paywall or paid credit instead).
4. The `free-{canonical_email}` ledger unique key is the final backstop against any path that still double-attempts.

After the free analysis, `remaining_credits` is 0 until the user buys credits → submit returns **402**, FE shows the paywall.

### 6.3 Permalink → credit mapping

`PERMALINK_CREDITS = {"vrjec": 1, "fgopu": 3, "puxlbz": 10, "arlum": 25}` (kept in code; env-overridable so price/credit changes don't require a deploy of the map). Webhook and redeem both grant `PERMALINK_CREDITS[permalink]`.

### 6.4 Email canonicalization (anti-farm)

Before keying ANY account/ledger lookup or write, normalize the email to a single canonical form:

```python
def canonicalize_email(raw: str) -> str:
    local, _, domain = raw.strip().lower().partition("@")
    local = local.split("+", 1)[0]                 # strip +tag
    if domain in {"gmail.com", "googlemail.com"}:
        local = local.replace(".", "")             # Gmail ignores dots
    return f"{local}@{domain}"
```

- The canonical form is what goes in `analyzer_credit_accounts.email` and every `idempotency_key`. The original `guest_email` is still stored on the job for the "ready" email (we email the address the user typed, tag and all).
- Collapses the cheapest free-tier farm (`me+1@`, `me+2@`, `m.e@gmail.com`). Disposable-domain blocking stays an optional add-on (§14.5); canonicalization is the high-leverage piece and ships in Phase 2.

### 6.5 Worker retry semantics (consume/email idempotency depend on this)

Verified: `task_analyze_swim_video` **catches all exceptions and `return`s `{"status": "failed"}`** rather than re-raising (`tasks/analyze.py:110-113`), so arq does NOT retry today. The consume/email design relies on this:

- Pin `PublicWorkerSettings.max_tries = 1` and **preserve the no-raise pattern** — if anyone later makes the task raise (or sets `max_tries > 1`), `_write_completed` could re-fire, sending a **duplicate "ready" email** and (absent the guards below) a double consume.
- **Email-send idempotency:** add an `email_sent_at TIMESTAMPTZ NULL` column to `swim_analysis_jobs` (or a `ready_email_sent` boolean), set inside the same `_write_completed` transaction; the worker only sends if it is null, so a re-run never re-emails.
- **Consume idempotency:** keyed `consume-{job_id}` (§6.1) — a re-run re-checks the ledger and no-ops.

(`email_sent_at` is an in-service column add on an existing table — fold it into the same migration as the identity columns; it is nullable so it is safe on populated rows. Update the §11 model-edit step accordingly.)

---

## 7. Gumroad Integration

### 7.1 Ping webhook payload

Gumroad "Ping" POSTs **`application/x-www-form-urlencoded`** to our endpoint on each sale (and on refund/dispute if resource-subscriptions are registered — see §7.5). Relevant fields we read via `await request.form()`:

- `sale_id` — unique per sale → our idempotency/dedup key.
- `email` — buyer email → credit target.
- `product_permalink` (or `permalink`) — maps to credits.
- `license_key` — the per-sale license key (Gumroad issues one per sale when "generate license keys" is enabled).
- `seller_id` — our seller id (authenticity check).
- `refunded` / `disputed` — booleans on refund/dispute notifications.

### 7.2 Authenticity (Gumroad has NO HMAC header)

Unlike Paystack (HMAC-SHA512 over raw body, `_paystack.py:50-53`), Gumroad Ping is **not signed**. `seller_id` is **NOT a secret** — it appears in public Gumroad product URLs/pages — so matching it stops nothing on its own. We layer three checks, of which the license re-verify is the real gate:

1. **Shared-secret path token (the HMAC analog).** The Ping URL configured in Gumroad is `…/gumroad/webhook?token=<GUMROAD_PING_TOKEN>`, a long random value in env. A request without the correct `token` is rejected (**403**) before the body is parsed. This is unguessable, unlike `seller_id`.
2. **`seller_id` match** — compare posted `seller_id` against env `GUMROAD_SELLER_ID`; mismatch → 200-and-drop. (Weak by itself; kept as a cheap sanity filter.)
3. **Mandatory license re-verify before granting** — call Gumroad `POST /v2/licenses/verify` with the posted `product_permalink` + `license_key` (no token); only grant if `success: true` AND the verified `sale_id` matches the posted one AND the verified product is ours. **A sale Ping with no verifiable `license_key` is rejected, never granted** — `seller_id` alone is never sufficient. This requires "generate license keys" ON for all four products (now a Phase-2 precondition, §7.6 — no longer an open question).

Together: a spoofer would need both the secret path token AND a genuine license key for our product — i.e. they'd have to have actually bought. The same path-token + `seller_id` gate applies to refund/dispute Pings (§7.5) so a forged refund can't revoke a victim's credits.

### 7.3 Idempotency

- DB: `analyzer_credit_ledger.gumroad_sale_id` is `unique=True`; `idempotency_key=gumroad-sale-{sale_id}`.
- App: pre-check `SELECT ... WHERE gumroad_sale_id == sale_id` before granting; on the unique-constraint race, catch `IntegrityError` and treat as already-granted (wallet pattern).
- Webhook + redeem converge on the SAME `gumroad-sale-{sale_id}` key, so a buyer who both triggers the Ping and later redeems the license cannot double-credit.

### 7.4 License redeem (`/v2/licenses/verify`)

- Endpoint: `POST https://api.gumroad.com/v2/licenses/verify`, params `product_permalink` + `license_key` (NO access token). Optionally `increment_uses_count=false` to avoid consuming a use during a balance check.
- Used by `POST /ai/public/credits/redeem` (§4.4) for buyers whose Gumroad email differs from their analyzer email.
- Grant under `gumroad-sale-{sale_id}` using the `sale_id` from the verify response.

### 7.5 Refund / dispute → revoke

- If we register Gumroad **resource subscriptions** for `refund`/`dispute`/`cancellation` (requires the OPTIONAL access token, §7.6), those Pings hit the same webhook with `refunded=true`/`disputed=true`. The revoke path runs the **same authenticity gate as the grant path** (path token + `seller_id`; §7.2) — without it, a spoofer who knows a real `sale_id` could forge a refund Ping to wipe a victim's credits. We then write a `revoke` debit (`gumroad-revoke-{sale_id}`, idempotent against replay) subtracting the originally granted credits.
- **Clamp is APPLICATION logic, not the CHECK.** A DB `CheckConstraint("remaining_credits >= 0")` REJECTS (raises `IntegrityError`); it does not clamp. So the revoke amount is computed in code as `applied = min(granted, account.remaining_credits)` BEFORE the write, the ledger row records the shortfall (`granted` vs `applied` in `balance_before`/`balance_after`), and `remaining_credits -= applied`. The `ck_analyzer_acct_remaining_nonneg` check is only a backstop that proves the app-side clamp is correct. Policy: clamp at 0 (no negative "debt"); decided in §13.4.

### 7.6 The OPTIONAL Gumroad access token

- **NOT required** for: crediting on sale Ping (we read the Ping payload), or license redeem (`/v2/licenses/verify` needs only permalink + key).
- **Only required** to programmatically **register resource subscriptions** (so refund/dispute Pings are delivered) and to increment license `uses`. If `GUMROAD_ACCESS_TOKEN` is unset, we ship sale-grant + redeem; refund-revoke is then handled manually (admin) until the token is provisioned. Stored in env, never hardcoded.

**License-key generation is a HARD Phase-2 precondition (not an open question).** The mandatory re-verify (§7.2) collapses to the worthless `seller_id`-only check if a sale Ping carries no `license_key`. So before any public traffic, confirm "generate license keys" is ON for ALL FOUR products (`vrjec`/`fgopu`/`puxlbz`/`arlum`); a sale Ping lacking a verifiable key is rejected rather than granted.

### 7.7 Refund-after-delivery fraud (accepted, bounded)

The known Reddit-traffic pattern: buy credits, get the report(s), then refund/dispute on Gumroad to claw the money back while keeping the analysis. Because the product is a **delivered digital good**, revoking the *credit* recovers nothing already consumed — the report was viewed/emailed. We accept this explicitly:

- **Revoke only blocks FUTURE analyses.** Already-consumed credits (and the reports they produced) are not retrievable; revoke clamps `remaining_credits` (§7.5) so the buyer can't run *more* on a refunded sale.
- **Flag the email.** A refunded/disputed email is marked (e.g. a `flagged_at` on the account or a `revoke` ledger entry) and **loses re-access to the free tier** — so "refund, then farm free analyses on the same email" is blocked.
- **Cost line.** Gumroad charges dispute fees; treat them as marketing CAC, not a bug. The capped public worker bounds the compute already extracted.

Env keys: `GUMROAD_SELLER_ID` (required), `GUMROAD_PING_TOKEN` (required — the shared-secret path token, §7.2), `GUMROAD_ACCESS_TOKEN` (optional), `GUMROAD_VERIFY_URL` (default `https://api.gumroad.com/v2/licenses/verify`), `GUMROAD_CHECKOUT_BASE` (default `https://swimbuddz.gumroad.com/l/`).

---

## 8. Async-Notify + Email

### 8.1 Who sends, and when

The **ai-worker-public** sends the "your analysis is ready" email **on completion**, from inside `services/ai_service/tasks/analyze.py` `_write_completed(...)` — after the `COMPLETED` status + `AnalysisResult` row are committed (same transaction as the consume; §6.1). The FastAPI submit route only enqueues and returns 202; it cannot know when the hours-later job finishes, so the worker is the only correct trigger (matches the async-notify decision and the `corporate-worker` precedent).

- Gate it on `source == PUBLIC and guest_email is not None and email_sent_at is None` so member jobs never trigger a guest email and a re-run never double-sends (§6.5).
- Set `email_sent_at = utc_now()` in the same transaction; only attempt the send if it was null on read.
- **Serialization caveat (not a correctness bug):** the public worker is `max_jobs=1`, so the "ready" send is serialized behind ML inference. But the send is a fast HTTP POST to `communications_service` (sub-second) relative to multi-minute inference, so the post-completion email adds negligible latency to the already-honest "a few hours" promise. It does NOT run in parallel; reviewers should not assume so.

### 8.2 How the worker reaches email (isolation-respecting)

```python
from libs.common.emails.client import get_email_client
await get_email_client().send(
    to_email=job.guest_email,
    subject="Your SwimBuddz freestyle analysis is ready",
    body=plain_text_with_link,
    html_body=html_with_magic_link,
)
```

- `EmailClient` is a **shared lib** (`libs/common/emails/client.py:54`) → importing it is allowed (not a cross-service import). Under the hood it mints a 60 s service-role JWT and POSTs to `communications_service` `/email/send` (`require_service_role`), with a direct-SMTP fallback on transport error. The worker shares the `ai_service` image, which bundles `libs/`, so no new dependency.
- **Best-effort:** wrap in `try/except`, log on failure. A failed email MUST NOT flip a COMPLETED job to FAILED (mirror `outreach.py:199-213` and `me_auth.py:123-137`).
- **Do NOT:** import `communications_service` code, enqueue onto `arq:communications`, or call `core.send_email` directly (use `EmailClient` to inherit central logging + fallback).

### 8.3 Magic-link (no login to view)

The email contains `https://analyzer.swimbuddz.com/r/{jobId}?t=<jwt>` (§5.3). The result page reads `?t=` and calls `GET /ai/public/analyze/{job_id}?t=...`. No Supabase JWT involved.

### 8.4 Template options

- **Launch (quickest):** build `html_body` + plain text in the worker and call `EmailClient.send(...)` — no `communications_service` change. (There is no analyzer template in `email.py` `template_handlers` today.)
- **Later (cleaner):** add an `analysis_ready` handler to `communications_service/routers/email.py` `template_handlers` and call `EmailClient.send_template("analysis_ready", ...)` once copy stabilizes.

### 8.5 Deliverability (cold Reddit → Gmail)

- All mail goes through **Brevo** (`smtp-relay.brevo.com:587`, STARTTLS) from the already-warmed **`no-reply@swimbuddz.com`** / "SwimBuddz". Keep using this warmed sender (do NOT spin up a cold analyzer subdomain unless we re-do SPF/DKIM and warm it).
- **Pre-launch checklist (DNS/Brevo, outside the repos):** confirm SPF, DKIM, and a DMARC policy for `swimbuddz.com` are configured in Brevo + GoDaddy DNS, and that Brevo lists `swimbuddz.com` as an authenticated sender domain.
- Send **multipart plain+HTML** (the `EmailClient` path already attaches both) — HTML-only hurts Gmail placement.
- The free tier is email-gated: the user typed their email and EXPECTS the result email, which improves open/engagement signals vs cold blasts.
- **Volume risk:** email throughput is SHARED with member traffic on the same Brevo account (only compute is isolated). Confirm the Brevo plan's send limits can absorb a Reddit spike before launch; consider a per-hour public-email cap with retry (§14.4).
- **Bounce suppression protects MEMBER deliverability.** A cold Reddit list will generate hard bounces (fake/typo'd emails). Hard bounces MUST be suppressed (Brevo suppression list) so the analyzer's junk addresses don't degrade the shared sender reputation of `no-reply@swimbuddz.com` — the exact thing compute isolation can't protect. Wire Brevo bounce webhooks → suppression before the Reddit launch.

### 8.6 Failure-notification email (job FAILED)

A FAILED public job (corrupt/unreadable video, worker crash) must NOT leave the visitor waiting silently — for cold traffic this is the #1 support driver.

- In `_mark_failed(...)`, gated on `source == PUBLIC and guest_email is not None and email_sent_at is None`, send a best-effort "we couldn't analyze this one" email: states the credit was **refunded** (it was — §6.1), links back to re-upload, and is sent via the same `EmailClient` path with the same `email_sent_at` single-send guard.
- A **low pose-detection** job is NOT a failure — it COMPLETES and gets the normal "ready" email; the result page frames the low-tracking report honestly (§4.2/§10.3) so the user doesn't feel charged (it was free or the credit was spent on a real, if sparse, result).

---

## 9. Compute Isolation

### 9.1 Separate queue + dedicated worker

- New queue constant `PUBLIC_QUEUE_NAME = "arq:ai-public"`. **First extract a shared constant** for the queue name — it is currently a hardcoded string literal in three places (`tasks/worker.py:29`, `routers/analyze.py:160`, `routers/admin_analyze.py:209`); add e.g. `services/ai_service/constants.py` (or extend `libs/common/arq_config.py`) with `MEMBER_QUEUE_NAME = "arq:ai"` and `PUBLIC_QUEUE_NAME = "arq:ai-public"` so member vs public enqueue can't drift.
- New `WorkerSettings` subclass (e.g. `PublicWorkerSettings` in `services/ai_service/tasks/worker.py`): `queue_name = PUBLIC_QUEUE_NAME`, `functions = [task_analyze_swim_video]` (reuses the WHOLE pipeline), `max_jobs = 1`, `job_timeout = 600`, `redis_settings = get_redis_settings()`. Run via `arq services.ai_service.tasks.worker.PublicWorkerSettings`.
- New compose service **`ai-worker-public`** sharing the `ai_service` image, `command:` pointing at `PublicWorkerSettings`, with its OWN `cpus` / `mem_limit` / `memswap_limit` caps **mirroring the prod ai-worker caps** at `docker-compose.prod.yml:484-513`. (Note: the dev `docker-compose.yml` ai-worker has NO caps at `:603-628` — public worker caps matter in **prod**.)
- The member worker (`arq:ai`) is untouched, so a public spike fills `arq:ai-public` (processed by the capped public worker) while member jobs keep draining on `arq:ai`.

### 9.2 Backpressure / honest queue estimate

- Submit can read the public queue depth (arq Redis) and PENDING-public job count and return an honest hint. Phase 0–4 ships a static hint ("usually a few hours"); a dynamic "you're ~N in line" is a Phase-2+ enhancement (open question §14).
- Optionally cap concurrent in-flight public jobs per email (e.g. 1 PENDING/PROCESSING) → 429 on the 2nd, so one email can't flood the queue.
- **Max-queue-depth soft-503:** past `PUBLIC_MAX_QUEUE_DEPTH`, submit returns **503** ("we're slammed, try later") rather than enqueuing into a multi-day backlog that would churn a "few hours" promise into days. The FE renders the soft message (§10.3).
- **SLA-ceiling reassurance email:** a job still PENDING past `PUBLIC_SLA_CEILING_HOURS` triggers a "still working, sorry for the delay" email (best-effort, once). Past the stale-job ceiling (§9.5) the sweeper fails+refunds+notifies instead — so a stuck worker never leaves a user silent with a reserved credit.

### 9.3 Server-side file limits (NEW vs member path)

- **Size:** `PUBLIC_MAX_UPLOAD_BYTES = 50 MB` (**matches the member cap** at `analyze.py:58` — founder decision Jun 2026: parity with the current flow). The cap bounds the *compressed* upload, not the raw file: the browser runs `compressVideoForUpload` first (downscale to ~1920px, drop audio), turning a 100–200 MB raw iPhone clip into ~10–30 MB before the POST — identical to the member flow. The gateway `Content-Length` pre-check + IP rate-limit + the capped public worker bound the double-buffer/spike risk without shrinking the allowed clip below the member experience.
- **Gateway `Content-Length` pre-check:** the dedicated public-upload proxy route rejects an oversize upload via the `Content-Length` header **before** buffering the body (the gateway otherwise `await request.body()` buffers the whole file, then ai_service `await video.read()` buffers it again — `gateway_service/app/main.py`). A header-based 413 at the gateway avoids the double buffer entirely for the obvious-oversize case (a forged/missing `Content-Length` still falls through to the in-service size check, so this is an optimization, not the security boundary).
- **Duration — enforced in the WORKER, not the API route.** The size cap does NOT bound worker time (a 30 MB, 10-minute 240p clip burns the whole `job_timeout=600`). The member path has no server-side duration check either (the `≤60s` in the member `File(...)` description is documentation only). The obvious place — probe in the public submit route — is **not viable**: the `ai_service` API container does NOT install the ML/ffmpeg stack (CI installs only `.[dev]`; no cv2/ffmpeg-python) and the heavy-import-hygiene rule (§4) forbids loading it. ffprobe also needs the bytes on disk and the binary in the API image, which only the worker image has. **Decision: the worker enforces the cap.** After download, the worker probes duration (the pipeline already decodes the video, so duration is available cheaply); if `duration > PUBLIC_MAX_DURATION_SECONDS` (~90 s) it **rejects → refunds the reserved credit (`refund-{job_id}`) → marks the job FAILED** with `failure_reason="too_long"` → sends the failure email (§8.6). An over-long upload therefore consumes ONE capped queue slot and transient storage, which is acceptable precisely because the public worker is CPU/mem-capped and `max_jobs=1` (a single bad clip can't starve members). The FE also fast-fails on duration client-side (`readVideoDuration`, §10.3) so the common case never reaches the worker — but that is advisory, not the enforcement boundary.

### 9.4 Rate limits (gateway)

Add dedicated, IP-keyed routes ABOVE the `/api/v1/ai/{path:path}` catch-all in `gateway_service/app/main.py` (catch-all is registered last, so a more specific route wins — same trick as `proxy_session_book` vs the sessions catch-all):

```python
@app.api_route("/api/v1/ai/public/analyze", methods=["POST"])
@limiter.limit("5/minute")          # IP-keyed (gateway never sets request.state.user)
async def proxy_public_analyze(request: Request):
    return await proxy_request(clients.ai_client, "/ai/public/analyze", request)

@app.api_route("/api/v1/ai/public/gumroad/webhook", methods=["POST"])
@limiter.limit("30/minute")
async def proxy_public_gumroad(request: Request):
    return await proxy_request(clients.ai_client, "/ai/public/gumroad/webhook", request)

@app.api_route("/api/v1/ai/public/credits/redeem", methods=["POST"])
@limiter.limit("5/minute")
async def proxy_public_redeem(request: Request):
    return await proxy_request(clients.ai_client, "/ai/public/credits/redeem", request)
```

- Limits are **IP-keyed** (the gateway never populates `request.state.user`, so `_get_user_or_ip` falls back to IP). A NAT'd Reddit crowd shares one IP bucket — tune numbers accordingly.
- **Email quotas are NOT slowapi** — they're DB business logic in `ai_service` (§5.2/§6.2). slowapi's `key_func` runs before the body is parsed and can't read `guest_email`.

### 9.5 Global cost ceiling + kill switch + stale-job sweeper

Per-IP limits do NOT stop a botnet or a viral post (many IPs). Two global controls + a sweeper bound total cost:

- **Kill switch:** `PUBLIC_ANALYZER_ENABLED` (env, default true). When false, the public submit returns **503** immediately (§4.1) while `GET /ai/public/analyze/{job_id}` keeps serving — so already-queued users still get their reports. Runbook order under a spike/abuse wave: (1) drop the global free cap to 0 (disables free, keeps paid), (2) flip `PUBLIC_ANALYZER_ENABLED=false` (disables all new submits), (3) result polling stays up throughout.
- **Global daily caps:** `PUBLIC_DAILY_JOB_CAP` and `PUBLIC_DAILY_FREE_CAP` — counted in-service from `swim_analysis_jobs` (`source='public'`, `created_at::date = today`). Submit returns **503** past the cap. This is the control a per-IP limit can't provide.
- **Stale-job sweeper (cron):** a job stuck `PENDING`/`PROCESSING` beyond `PUBLIC_STALE_JOB_HOURS` (e.g. 6 h — a crashed worker leaves it PENDING forever with the credit reserved) → mark FAILED + `refund-{job_id}` + failure email. Same mechanism guards against the "reserved credit leaked" case the monitoring query in §15 also surfaces. Run it on the existing reporting/cron path or a small ARQ cron on the public worker.

---

## 10. Frontend

### 10.1 Separate Netlify site

A brand-new Next.js 14 App-Router site, isolated from the main app, deployed to its own Netlify site at `analyzer.swimbuddz.com`. **No Supabase client, no `middleware.ts`, no `auth.ts`** (the site has no protected routes).

### 10.2 Reused modules (copy, don't share a package)

| Source (main frontend) | Action |
|---|---|
| `src/lib/videoCompress.ts` | **Copy verbatim** — pure browser APIs, zero auth coupling. |
| `src/lib/strokelab.ts` (types/helpers/constants) | Copy `AnalysisJobStatus`, `AnalysisJob`, `DrillSuggestion`, `Observation`, `TrackingGap`, `AnalysisResultPayload`, `AnalysisJobDetail`, `statusLabel`, `statusTone`, `readVideoDuration`, `MAX_UPLOAD_BYTES` (50 MB, same as member), `MAX_DURATION_SECONDS`, `ACCEPTED_VIDEO_MIME`. Update `member_auth_id: string` → `string \| null` and add `source`/`guest_email` if returned. |
| `src/lib/strokelab.ts` (API fns) | **Rewrite:** `createAnalysisJob` → POST `/api/v1/ai/public/analyze` with `guest_email` + `guest_token` (no JWT, no `is_public`); `getAnalysisJob` → GET `/api/v1/ai/public/analyze/{jobId}?guest_token=` / `?t=`. **Drop** `listMyAnalyses`, `deleteAnalysisJob`, all `founding_members`/admin fns. |
| `src/lib/api.ts` | Copy, **delete the auth branch** (`buildHeaders(auth)` → no `getCurrentAccessToken`). |
| `src/lib/config.ts` | Copy, keep the relative-URL behavior (unset `NEXT_PUBLIC_API_BASE_URL` → client fetches go to `/api/*` rewrite). |
| `[jobId]/page.tsx` renderer (`MetricCard`, `ObservationRow`, `fmtTime`, the poll loop, metric/video rendering) | Copy into the new result page; swap to the public getter + `guest_token`/`t`; widen poll to ~15 s; rewrite the "ready in a couple minutes" copy to the honest multi-hour estimate. |
| `src/app/(member)/account/strokelab/page.tsx` (upload+compress phase machine) | Copy; swap to the public POST; add the email gate + paywall. |
| `src/middleware.ts`, `src/lib/auth.ts` | **DO NOT copy.** |
| The `@/components/ui/*` primitives used (`Alert`, `Badge`, `Button`, `Card`, `LoadingSpinner`) + `lucide-react`, `sonner`, `date-fns` | Vendor the handful of primitives; keep the bundle tiny (isolation goal — avoid the main app's Mantine/BlockNote/Supabase weight). |

### 10.3 Screen flow (async-notify)

- **`/`** — Hero (honest, freestyle-only scope: stroke rate SPM, body-roll proxy, breath balance, pose-detection rate, observations, drills; "measurement tool, not a coach") + **privacy notice + consent checkboxes** (§13 — process-this-video consent + separable marketing opt-in) + **email gate** + upload. On submit: `readVideoDuration` fail-fast (>90 s, advisory) → `compressVideoForUpload` (progress UI) → POST to `/ai/public/analyze` → **queued-confirmation screen** ("You're in the queue. Public analyses run on a separate worker and take a few hours. We'll email you a link when it's ready."). Store `guest_token`+`jobId` in `localStorage`. **No aggressive polling here.** On a **503** (kill switch / daily cap / queue too deep, §9.2/§9.5): show a soft "We're slammed right now — try again later" instead of silently enqueuing into a multi-day backlog.
- **`/r/[jobId]`** — emailed magic-link result page. Reads `?t=` (magic-JWT) or `?guest_token=`; **on first load it exchanges `?t=` for an httpOnly cookie and strips the token from the URL** (`history.replaceState`, §5.3) so the bearer token leaves the address bar; reuses the entire renderer; polls at ~15 s in case the link is opened before the worker finishes.
  - **`status="failed"` render:** a clear "We couldn't analyze this clip — your credit was refunded. Try a clearer/closer freestyle clip." panel with a re-upload CTA (the API returns `failure_reason`; map known reasons — `too_long`, `video_unreadable`, `could_not_track` — to friendly copy). **Low pose-detection still renders as a (sparse) success**, framed honestly, never as an error.
  - The redeem-box error states (invalid key / already-redeemed → "credits already on {email} " / wrong product) and the "where's my key" help are specified in §4.4.
- **Paywall** — after the free analysis (per email), the upload step shows the paywall: Gumroad overlay buttons for the 4 products (`https://gumroad.com/js/gumroad.js`, `<a class="gumroad-button" href="https://swimbuddz.gumroad.com/l/<permalink>">`), a "I've paid — refresh my credits" affordance that re-calls `GET /ai/public/credits?email=`, and a **license-redeem box** (email + license_key + product → `POST /ai/public/credits/redeem`).

### 10.4 Netlify config / CORS

- Copy the `/api/*` rewrite verbatim into the new site's `netlify.toml`: `from "/api/*" → to "https://api.swimbuddz.com/api/:splat", status=200, force=true` (`netlify.toml:21-26`). This makes browser fetches **same-origin** to `analyzer.swimbuddz.com` → Netlify forwards server-side → **no CORS triggered for `/api/*` traffic**.
- Copy the security headers, but verify the Gumroad **overlay** (iframe/popup) isn't blocked by CSP. `X-Frame-Options: DENY` frames *your* site (fine for the overlay, which iframes Gumroad's content into your page). `Permissions-Policy` disabling camera/mic/geolocation is fine (compression uses `<video>`/`MediaRecorder` on a file, not getUserMedia).
- **CSP for the Gumroad overlay (test against the ACTUAL copied CSP — this breaks silently).** `gumroad.js` is a third-party script + iframe on the isolated site. If a `Content-Security-Policy` is present (copied or added), it must allow Gumroad explicitly:
  - `script-src` += `https://gumroad.com` (loads `https://gumroad.com/js/gumroad.js`)
  - `frame-src` += `https://gumroad.com https://*.gumroad.com` (the checkout overlay iframe)
  - `connect-src` += `https://api.gumroad.com` if any client-side call is made (our redeem call goes through the `/api/*` rewrite → same-origin, so this is only needed if the overlay itself calls Gumroad XHR; verify).
  - Test the overlay end-to-end against the deployed CSP before launch.
- **`Referrer-Policy: no-referrer`** on the analyzer site so the `/r/[jobId]?t=` / `?guest_token=` URLs never leak via `Referer` to third-party assets (§5.6).
- **Gateway CORS:** append `"https://analyzer.swimbuddz.com"` to `allow_origins` (`gateway_service/app/main.py:39-43`). Required for any direct (non-rewrite) call and to be safe on multipart preflight; the Gumroad webhook needs no CORS (server-to-server). Existing `allow_methods`/`allow_headers` already cover multipart POST + GET polling.
- **Env:** leave `NEXT_PUBLIC_API_BASE_URL` **unset** (all fetches are client-side → use the `/api/*` rewrite). No Supabase env vars. `NEXT_PUBLIC_APP_URL` optional. If any Server Component fetches the API, you MUST set `NEXT_PUBLIC_API_BASE_URL=https://api.swimbuddz.com` (config throws server-side in prod when unset, `config.ts:32-37`).
- **DNS:** GoDaddy CNAME `analyzer` → the new Netlify site; add the custom domain in Netlify; Netlify provisions TLS.

---

## 11. Migration Plan (exact ordered steps)

Respects every migration constraint: generate via `migrate.sh`, never hand-write revision IDs, never `reset.sh`, update env.py for new tables, hand-add CHECKs on existing tables, hand-add the enum-drop on downgrade, regen openapi.json on a constrained host venv.

1. **Edit models** (`services/ai_service/models/analysis.py` + new `services/ai_service/models/credits.py`):
   - `member_auth_id` → `nullable=True` (`Mapped[Optional[uuid.UUID]]`).
   - Add `guest_email`, `guest_token`, `email_sent_at`, `source` (`Enum(name="analysis_job_source_enum")`) + the `AnalysisJobSource` enum. (`email_sent_at` is the single-send guard, §6.5 — nullable, safe on populated rows.)
   - Add `AnalyzerCreditAccount` (table `analyzer_credit_accounts`, incl. an optional `flagged_at` for refund-flagged emails, §7.7) + `AnalyzerCreditLedger` (table `analyzer_credit_ledger`) with inline `CheckConstraint`s and the two namespaced enums (`analyzer_credit_entry_enum`, `analyzer_credit_direction_enum`).
2. **Register the new models** in `services/ai_service/models/__init__.py` (import list + `__all__`) **and** `services/ai_service/alembic/env.py` (import block `:20-27` + `SERVICE_TABLES` `:40-47` → add `"analyzer_credit_accounts"`, `"analyzer_credit_ledger"`). Both are required.
3. **Generate the migration:**
   ```bash
   cd swimbuddz-backend
   ./scripts/db/migrate.sh ai_service "guest analyzer jobs + analyzer credits"
   ```
   (Loads `.env.dev` → the shared Supabase **cloud dev** DB. New down_revision will auto-chain off current head `4ea4b98e07f4` — never hand-pick a revision ID.)
4. **Review the generated file** (template: `services/ai_service/alembic/versions/9cd30c0c14e0_add_stroke_lab_analysis_tables.py`):
   - Confirm `op.alter_column('swim_analysis_jobs', 'member_auth_id', nullable=True)`.
   - Confirm `op.add_column(...)` for `guest_email`, `guest_token`, `email_sent_at`, `source` and the `create_table`s for both credit tables with their indexes + inline CHECKs.
   - **Order matters:** the `add_column` for `source` (with `server_default 'member'`) MUST precede the identity CHECK so legacy rows backfill to `member` (all of which have a non-NULL `member_auth_id` today) and the CHECK validates — see the §3a note. A single legacy `member` row with NULL `member_auth_id` would abort the apply.
   - **Hand-add** `op.create_check_constraint("ck_swim_analysis_jobs_identity", ...)` on `swim_analysis_jobs` (autogenerate misses CHECKs on EXISTING tables) and the composite index `ix_swim_analysis_jobs_guest_email_created` if not emitted.
   - **Hand-add to `downgrade()`** the enum-drops (autogenerate won't drop Postgres enum types): `sa.Enum(name="analysis_job_source_enum").drop(op.get_bind(), checkfirst=True)`, `analyzer_credit_entry_enum`, `analyzer_credit_direction_enum` — copy the idiom at `9cd30c0c14e0_...py:66-68`.
   - Verify autogenerate didn't re-render unrelated `server_default` diffs on `status`/`is_public`; remove any spurious ones.
   - Add the "hand-written migration" docstring marker noting the manual CHECK/enum-drop additions.
5. **Apply the migration** (NEVER `reset.sh` — it nukes the shared cloud DB):
   ```bash
   alembic -c services/ai_service/alembic.ini upgrade head
   ```
   (Existing rows already satisfy `member_auth_id` nullable; new columns are nullable/defaulted → safe on the populated table.)
6. **Regenerate `openapi.json`** on a host venv installed with `-c constraints.txt` (so bytes match CI):
   ```bash
   python scripts/api/generate-openapi.py > openapi.json
   ```
   The new no-JWT `/ai/public/*` routes change `openapi.json`; if a second backend PR also edits it, rebase and re-run (the artifact is a single committed file the deploy workflow diffs).
7. **Regenerate frontend types** in the main app if it consumes the shared spec (`npm run generate:types`) — the public routes are additive.
8. **Prod apply** is via `scripts/db/migrate-prod.sh --all` (runs `alembic upgrade head`, does NOT drop data) through the deploy workflow — same chain, applied to `alembic_version_ai`.

---

## 12. Phased Rollout

**Phase 0 — Backend foundation (no public traffic yet).**
- Model edits + migration (§11 steps 1–6): `member_auth_id` nullable; `guest_email`/`guest_token`/`source`; `analyzer_credit_accounts` + `analyzer_credit_ledger`.
- Extract the queue-name constant (§9.1).
- Add the public router skeleton (`/ai/public/analyze` submit + `/ai/public/analyze/{job_id}` poll), guest storage-key builder, guest response schemas. Submit still enqueues to `arq:ai` (no isolation yet) behind a feature flag / not yet exposed via the new domain.
- Tests: guest submit/poll, identity 404 non-leak, schema serialization with null `member_auth_id`.

**Phase 1 — Compute isolation.**
- `PublicWorkerSettings` (`arq:ai-public`) + `ai-worker-public` compose service with CPU/mem caps mirroring prod ai-worker (`docker-compose.prod.yml:484-513`).
- Switch the public submit to enqueue `_queue_name="arq:ai-public"`.
- Add `source` filtering to the admin queue views (`admin_analyze.py`) so member/public counts don't blur.
- Server-side size (30 MB) + duration (~90 s) caps; gateway IP rate-limits on the public routes.
- Verify the public worker imports `torch`/pipeline cleanly in its container before relying on it (per memory: ML import gotchas).

**Phase 2 — Credits + Gumroad.**
- Credit-ops module (reserve/consume/refund/grant/revoke) replicating wallet's atomic pattern in-service.
- Reserve-on-submit / refund-on-failure wired into submit + worker `_write_completed`/`_mark_failed`.
- Free-tier gate (`free_used`, `free-{email}`).
- `POST /ai/public/gumroad/webhook` (seller_id + license re-verify, idempotent on sale_id) and `POST /ai/public/credits/redeem` (`/v2/licenses/verify`) and `GET /ai/public/credits`.
- Create the 4 Gumroad products live (already done: `vrjec`/`fgopu`/`puxlbz`/`arlum`), set `GUMROAD_SELLER_ID`; optionally provision `GUMROAD_ACCESS_TOKEN` + register refund/dispute resource subscriptions.

**Phase 3 — Frontend (separate Netlify site).**
- New site: hero/email-gate/upload, queued-confirmation, `/r/[jobId]` result page, paywall + Gumroad overlay + redeem box. Reused modules per §10. Async-notify copy.
- Wire the worker "ready" email (magic-link, `EmailClient.send`, best-effort) in `_write_completed`.
- Confirm Brevo SPF/DKIM/DMARC for `swimbuddz.com`.

**Phase 4 — DNS / Ping / launch.**
- GoDaddy CNAME `analyzer` → Netlify; add custom domain + TLS in Netlify.
- Append `https://analyzer.swimbuddz.com` to gateway CORS `allow_origins`.
- Point the Gumroad Ping URL at `https://api.swimbuddz.com/api/v1/ai/public/gumroad/webhook`; test a $6 `vrjec` live sale end-to-end (Ping → credit → submit → email).
- Soft launch (low rate-limit numbers) → monitor queue depth, worker CPU/mem, Brevo send volume → Reddit launch.

---

## 13. Privacy, Consent & Data Retention (launch-gating)

Public, unauthenticated uploads of identifiable people swimming, plus an email marketing list, are EU-reachable PII the moment we post to Reddit — so this is a launch requirement, not a backlog item.

### 13.1 Consent at the email gate

- The hero/email-gate (§10.3) shows a **privacy notice** and two **separable** checkboxes: (a) consent to process the uploaded video + email for analysis (required to submit), (b) marketing opt-in to the swimmer list (optional; defaulted OFF — the marketing-list value comes from real opt-in, not a pre-ticked box). Store the marketing-consent flag on the account.
- A **Privacy Policy + Terms** page lives on the analyzer site (`/privacy`, `/terms`), linked from the gate and footer.

### 13.2 Retention TTL (built, not deferred)

- Guest uploads + annotated videos + the job row are TTL'd (default **30 days** from completion — comfortably beyond the 7-day magic-link window, so a link that still validates can still 410 on expired assets, which the FE handles) by a cron sweeper: delete storage objects, then mark the job assets-expired. `GET /ai/public/analyze/{job_id}` returns **410** once assets are gone.
- The credit ledger (financial record) is retained longer; only the video assets + PII-bearing fields are purged on TTL.

### 13.3 Right to erasure (built)

- `DELETE /ai/public/analyze/{job_id}` (§4.6) ships — owner deletes a job + its assets on request. An erasure-by-email path (purge all jobs + the marketing-list entry for an email) is the follow-up to satisfy a full "delete me" request; until then it is an admin action.
- Refund-flagged emails (§7.7) are handled here too: a `flagged_at` blocks free-tier re-access without retaining more PII than needed.

### 13.4 Refund underflow policy (decided)

Clamp at 0 (no negative debt). The revoke amount is application-clamped to `remaining_credits` before the write; the `ck_analyzer_acct_remaining_nonneg` CHECK is the backstop (§7.5). Refund-after-delivery fraud is accepted and bounded (§7.7).

---

## 14. Open Questions & Risks

1. **Dynamic queue-position estimate.** Phase 0–4 ships a static "few hours" hint + an SLA-ceiling reassurance email (§9.2). Worth building a live "~N in line" from arq queue depth? (Risk: a wrong estimate is worse than an honest range.)
2. **Email verification (double-opt-in).** We do NOT verify the email before the free analysis (funnel friction). Accepted cost: one isolated-queue job per fake email + a bounced email that is suppressed (§8.5). Revisit only if farm volume defeats canonicalization (§6.4) + global caps (§9.5).
3. **Streaming upload path.** A 30 MB cap + gateway `Content-Length` pre-check (§9.3) + `5/min` IP limit + global caps bound the double-buffer risk, but a true streaming upload (larger change to `proxy_request`) would remove the in-memory buffer entirely. Deferred unless gateway RAM proves tight under a real spike.
4. **Brevo throughput under a Reddit spike.** Compute is isolated, but email is shared with member traffic on one Brevo account. Confirm plan limits; the per-hour public-email cap + bounce suppression (§8.5) protect member deliverability.
5. **Disposable-email domains.** Canonicalization (§6.4) handles plus/dot farming; blocking known disposable domains is an optional add-on (cost of a miss is one capped job).
6. **Resource-subscription provisioning.** Refund/dispute auto-revoke needs the optional `GUMROAD_ACCESS_TOKEN` (§7.6); until provisioned, revoke is a manual admin action. License-key generation, by contrast, is a hard precondition (§7.6), not an open question.

---

## 15. Monitoring & Alerting

Cold-traffic launch requires visibility on the exact things that broke before (worker RAM) and the things that leak money/PII. Emit these to the existing metrics/logging path and alert on the thresholds.

| Signal | Source | Alert |
|---|---|---|
| **Public worker CPU / mem** | `ai-worker-public` container (the box that melted before) | mem > 80% of `mem_limit` sustained → page; this is the documented prior incident. |
| **Public queue depth** | arq `arq:ai-public` (Redis) | depth > `PUBLIC_MAX_QUEUE_DEPTH` → warn (backlog forming; soft-503 engages). |
| **Stuck/reserved-credit leak** | `SELECT count(*) FROM analyzer_credit_ledger l JOIN swim_analysis_jobs j ON j.id=l.job_id WHERE l.entry_type='reserve' AND NOT EXISTS (consume/refund for same job_id) AND j.status IN ('completed','failed')` | any > 0 → warn (a reserved credit was never consumed/refunded — the §6.1 bug class). Stale-job sweeper (§9.5) should keep this at 0. |
| **Free vs paid submit rate** | `swim_analysis_jobs` (`source='public'`) + ledger `free_grant`/`reserve` | spike in free rate → possible farm; cross-check daily cap. |
| **Gumroad webhook success/failure** | webhook handler logs | rising 403 (bad path token) or verify-failures → possible spoof attempts. |
| **Email send success (Brevo)** | `EmailClient` / Brevo | drop in success or rising hard-bounce rate → protect shared sender reputation (§8.5). |
| **402 / 429 / 503 rates** | gateway + ai_service | sustained 503 → caps/kill-switch engaged; sustained 429 → per-email/IP limits biting. |

Add a small admin view (extend `admin_analyze.py`) filtered by `source='public'` so member/public counts never blur (already in Phase 1, §12).

---

## 16. Test Plan / Acceptance Criteria

The security-critical and money paths must be verifiable, not implied. Minimum matrix (per CONVENTIONS test layout; note per-service suites are NOT run in CI by default — run them explicitly):

| # | Path | Assertion |
|---|---|---|
| 1 | Identity non-leak | `GET /ai/public/analyze/{job_id}` with wrong/missing token → **404** (never 403/200). |
| 2 | Free-tier race | Two concurrent first-submits, same canonical email → **exactly one** `free_grant`; the other reserves a paid credit or gets 402. (Exercises upsert-then-lock, §6.2.) |
| 3 | Email canonicalization | `me+1@gmail.com`, `me+2@gmail.com`, `m.e@gmail.com` → one free-tier identity. |
| 4 | Reserve/upload ordering | Storage failure → job row NOT persisted, NO reserve written, NO compensating refund needed (§4.1). |
| 5 | Enqueue-failure compensation | `enqueue_job` raises after commit → `refund-{job_id}` written, job FAILED (§4.1). |
| 6 | Worker consume atomicity | COMPLETED status + `consume-{job_id}` land in one commit; kill the worker mid-`_write_completed` → status still PENDING, credit still reserved, re-run consistent (§6.1). |
| 7 | Worker refund atomicity | FAILED status + `refund-{job_id}` in one commit; over-long clip → `too_long` FAILED + credit refunded (§9.3). |
| 8 | Email single-send | Re-run of `_write_completed` (or a forced retry) → `email_sent_at` guard prevents a duplicate "ready" email (§6.5). |
| 9 | Webhook idempotency | Replay same `sale_id` Ping → granted once (`gumroad-sale-{sale_id}`). |
| 10 | Webhook authenticity | Ping with bad/missing `?token=` → **403** before body parse; sale Ping with no verifiable `license_key` → not granted (§7.2). |
| 11 | Forged refund Ping | Refund Ping with bad path token → 403, no revoke (§7.5). |
| 12 | Redeem-after-webhook | Webhook grants, then redeem same sale → no double grant, 409 (§4.4). |
| 13 | Refund underflow | Revoke > remaining → clamps to 0, ledger records shortfall, no `IntegrityError` (§7.5). |
| 14 | Schema serialization | Guest job (`member_auth_id = NULL`) serializes via `PublicAnalysisJobDetailResponse`; member schema never sees a guest job (§3a). |
| 15 | Failed-job UX | `status='failed'` → 200 with `failure_reason`; failure email sent once (§4.2/§8.6). |
| 16 | Kill switch / caps | `PUBLIC_ANALYZER_ENABLED=false` → 503 on submit, poll still 200; daily-cap exceeded → 503 (§9.5). |
| 17 | Migration | On a populated `swim_analysis_jobs`, `alembic upgrade head` applies cleanly; identity CHECK validates (all legacy rows are `member` with non-NULL `member_auth_id`); `downgrade()` drops all three enums (§11). |
| 18 | Heavy-import hygiene | `python scripts/api/generate-openapi.py` runs under `.[dev]` (no cv2/torch) — the public router imports nothing heavy at module load (§4). |

---

## 17. Hard Constraints Honored — Checklist

| Hard constraint | Where satisfied |
|---|---|
| Service isolation: HTTP only, no cross-service imports/DB; cross-service IDs are plain UUIDs (no FK) | `analyzer_credit_accounts`/`analyzer_credit_ledger` live INSIDE `ai_service` (§3b/§3c); wallet patterns are REPLICATED, not imported (§6.1); the "ready" email uses the shared-lib `EmailClient` over HTTP to `communications_service`, not a cross-service import/enqueue (§8.2); `job_id` in the ledger is a plain UUID, no cross-service FK (§3c). |
| Migrations: generate via `./scripts/db/migrate.sh ai_service "desc"`; never hand-write; apply via `alembic upgrade head` (never `reset.sh`) | §11 steps 3 (migrate.sh), 5 (`alembic -c .../alembic.ini upgrade head`, explicit "NEVER reset.sh"). |
| New tables require updating `services/ai_service/alembic/env.py` (model import + `SERVICE_TABLES`) | §3d + §11 step 2 (import block `:20-27` + `SERVICE_TABLES` `:40-47`), and `models/__init__.py` re-export. |
| CHECK constraints added to EXISTING tables are NOT auto-detected — hand-add `op.create_check_constraint` | §3a (`ck_swim_analysis_jobs_identity`) + §11 step 4 (hand-add to the generated file). New-table CHECKs render inline (§3b/§3c). |
| Postgres enum TYPE names are GLOBAL — any `sa.Enum(name=...)` must be globally unique, namespaced to the table | `analysis_job_source_enum`, `analyzer_credit_entry_enum`, `analyzer_credit_direction_enum` (§3a/§3c); enum-drop on downgrade hand-added (§11 step 4). |
| FastAPI 0.111.1: a 204/304 route annotated `-> None` crashes at import; use `response_model=None` | Applied to the (now shipped, for GDPR erasure) guest delete `DELETE /ai/public/analyze/{job_id}` — `status_code=204, response_model=None` (§4.6); the Gumroad webhook returns a JSON body (200), no 204 concern (§4.5). |
| `openapi.json` regenerated + diffed in CI after backend changes (regen on host venv) | §11 step 6 (`python scripts/api/generate-openapi.py > openapi.json` on a `-c constraints.txt` venv; 2-PR rebase note). Public routers avoid eager ML imports so `import ai_app` stays clean under `.[dev]` (§4 heavy-import hygiene). |
| CORS: `https://analyzer.swimbuddz.com` must be allowed by the gateway | §4 (diagram), §10.4, §12 Phase 4 — append to `allow_origins` at `gateway_service/app/main.py:39-43` (the ONLY CORS location). |
| Compute isolation: separate `arq:ai-public` queue + capped worker so a public spike can't starve members | §9.1 — `PublicWorkerSettings` (`arq:ai-public`) + `ai-worker-public` compose service with caps mirroring `docker-compose.prod.yml:484-513`; member `arq:ai` untouched. |
| Free tier email-gated (1 per email) as a DB rule, not a transport throttle | §5.2/§6.2 — `analyzer_credit_accounts.free_used` + **upsert-then-lock** on the account row + unique `free-{canonical_email}` ledger key (slowapi can't key on a body field); email canonicalized to defeat plus/dot farming (§6.4). |
| Gumroad credits (permalink→credits), reserve-on-submit / refund-on-failure, idempotent on sale_id | §6 (reserve/consume/refund), §7 (`PERMALINK_CREDITS`, `gumroad-sale-{sale_id}` uniqueness), §4.1/§4.4/§4.5. |
| Freestyle-only, honest marketing | §1.3 (non-goal: multi-stroke), §4.1 (400 on non-freestyle), §10.3 (honest hero copy). |
| Guest identity: no JWT; email + `guest_token`; `member_auth_id` nullable + `guest_email`/`guest_token`/`source` | §3a (columns, incl. `email_sent_at`), §4 (no-auth routes), §5 (per-job token + magic-JWT). |
| Async-notify: emailed when done; email sent from the worker (only place completion is known) | §8.1 — `_write_completed` in `ai-worker-public`, best-effort `EmailClient.send` with a 7-day magic-link, `email_sent_at` single-send guard; failure email in `_mark_failed` (§8.6). |
| Credit-write atomicity (no double-spend / leaked reserve) | §4.1 (one-transaction reserve, reserve-after-upload, enqueue-failure compensation), §6.1 (consume/refund in the SAME `_write_completed`/`_mark_failed` transaction as the status flip), §6.5 (worker `max_tries=1` + idempotency guards). |
| Concurrency: exactly-one free per email under races | §6.2 — upsert (`ON CONFLICT DO NOTHING`) then `FOR UPDATE` lock, since the account row is the contended resource; §6.4 canonical-email keying. |
| Gumroad authenticity (no HMAC) | §7.2 — shared-secret path token (`GUMROAD_PING_TOKEN`, 403 on mismatch) + `seller_id` filter + **mandatory** license re-verify; same gate on refund/dispute Pings (§7.5); license-key generation is a hard precondition (§7.6). |
| Bearer-token leakage (Referer/logs/history) | §5.6 — header-preferred `X-Guest-Token`, magic-JWT single-exchange→httpOnly cookie + 7-day TTL, `Referrer-Policy: no-referrer`, gateway log-scrubbing of `t`/`guest_token`. |
| DoS / cost ceiling | §9.3 (30 MB size cap + gateway `Content-Length` pre-check + worker-side duration cap), §9.5 (`PUBLIC_ANALYZER_ENABLED` kill switch + daily caps + stale-job sweeper), §9.2 (max-queue-depth soft-503). |
| Privacy / GDPR (EU-reachable PII) | §13 — consent at the gate, retention TTL (410), shipped per-job erasure (`DELETE`, §4.6), refund-flagging; privacy/terms pages. |
| Monitoring & verification | §15 (metrics + alerts incl. worker-mem page and reserved-credit-leak query), §16 (security/money test matrix). |

---

## Review notes resolved

The two review passes surfaced concentrated risk in concurrency, credit atomicity, Gumroad authenticity, and several operational/abuse gaps the draft hand-waved. Key issues and how the final doc addresses them:

- **Free-grant + reserve atomicity (blocker).** The draft interleaved credit writes, the job INSERT, and the storage upload without specifying the transaction boundary, creating a compensating-refund double-refund/leak race. **Fixed in §4.1:** one transaction; reserve happens **only after** the upload succeeds (so upload failure needs no refund — nothing was reserved); the only compensating refund is for `enqueue_job` failure after commit.
- **Worker consume/refund transaction boundary (blocker).** `_write_completed`/`_mark_failed` each open their own session and commit independently; a separate consume/refund write would strand a reserved credit on a COMPLETED/FAILED job. **Fixed in §6.1:** the `consume-{job_id}`/`refund-{job_id}` write rides the **same `AsyncSessionLocal()` transaction and commit** as the status flip.
- **Account-row creation race / "exactly one free" (blocker).** `SELECT … FOR UPDATE` locks nothing on a not-yet-inserted account row, so two concurrent first-submits could both get a free analysis; the ledger `free-{email}` key alone is insufficient. **Fixed in §6.1 step 0 / §6.2:** `INSERT … ON CONFLICT (email) DO NOTHING` (upsert) THEN `FOR UPDATE` lock THEN check `free_used`.
- **Server-side duration cap was a TODO masquerading as spec (major).** The API image has no ffmpeg/ffprobe and heavy-import hygiene forbids loading it. **Fixed in §9.3:** the cap is enforced in the **worker** (probe after download → reject + refund + FAILED + failure email), accepting one capped queue slot per over-long clip.
- **Gumroad authenticity weak (major).** `seller_id` is public; the license re-verify leg was conditional. **Fixed in §7.2/§7.6:** added a shared-secret path token (`GUMROAD_PING_TOKEN`, the HMAC analog), made license re-verify **mandatory** (reject sales with no verifiable key), made license-key generation a hard precondition, and applied the same gate to refund/dispute Pings (§7.5) so forged refunds can't revoke a victim's credits.
- **Credit-balance oracle leaked `free_used` (major).** **Fixed in §4.3:** unauthenticated callers get only `can_submit_free` + `remaining_credits`; `free_used` requires a token for that email.
- **`guest_token` reuse contradiction / leak blast radius (major).** **Fixed in §3a/§4.1/§5.1:** the token is minted **per job, server-side, never client-supplied**; returning visitors are recognized by `guest_email`. "One token = one job" is now literally true.
- **Bearer tokens in query strings (major).** **Fixed in §5.3/§5.6/§10.4:** header-preferred `X-Guest-Token`, magic-JWT single-exchange → httpOnly cookie + 7-day TTL, `Referrer-Policy: no-referrer`, gateway log-scrubbing.
- **`gumroad_license_key` uniqueness inconsistency (minor).** **Fixed in §3c/§4.4:** dropped the false uniqueness claim; `gumroad_sale_id` is the sole double-grant guard.
- **CHECK-constraint "clamp" conflation (minor).** **Fixed in §7.5:** the revoke is **application-clamped** before the write; the CHECK is only a backstop (a CHECK rejects, it does not clamp).
- **Pre-existing-row CHECK validation (minor).** **Fixed in §3a/§11:** documented that legacy rows backfill to `source='member'` with non-NULL `member_auth_id`, so the identity CHECK validates; add-column-then-CHECK ordering is mandatory.
- **OPTIONS / preflight on the dedicated routes (minor).** **Noted in §9.4/§4.5:** the routes intentionally omit OPTIONS because `CORSMiddleware` answers preflight first; adding OPTIONS to `@limiter.limit` would rate-limit preflights.
- **Plus-addressing / dotted-Gmail farming (P1).** **Fixed in §6.4:** email canonicalization before keying.
- **User-facing failure/retry UX (P1).** **Added §4.2/§8.6/§10.3:** `status="failed"` is a first-class 200 with `failure_reason`, a failure email (credit-refunded), and a friendly render; low pose-detection stays a (sparse) success.
- **Refund-after-delivery fraud (P0).** **Added §7.7:** accepted and bounded — revoke blocks only future analyses, refunded emails lose free-tier re-access, dispute fees are a cost line.
- **No kill switch / cost ceiling (P0).** **Added §9.5:** `PUBLIC_ANALYZER_ENABLED` kill switch + `PUBLIC_DAILY_JOB_CAP`/`PUBLIC_DAILY_FREE_CAP` + stale-job sweeper + a runbook (free off → submit off, polling stays up).
- **GDPR / retention as a real obligation (P1).** **Added §13:** consent at the gate, retention TTL + 410, shipped per-job erasure, privacy/terms pages.
- **Monitoring/alerting entirely absent (P1).** **Added §15:** worker-mem page (the prior incident), public queue depth, reserved-credit-leak query, webhook/email/2xx-4xx-5xx rates.
- **No consolidated test plan (P2).** **Added §16:** an 18-row matrix covering identity non-leak, free-tier race, webhook idempotency/authenticity, reserve-leak, refund underflow, and migration.
- **Quick wins.** Enqueue-failure compensating refund (§4.1), gateway `Content-Length` pre-check (§9.3), Brevo bounce suppression to protect member deliverability (§8.5), worker-serialized (not parallel) email send caveat (§8.1), CSP `script-src`/`frame-src`/`connect-src` for the Gumroad overlay (§10.4) — all incorporated.
