# Ledger Service — Phase 0 + Phase 1 Implementation Plan

> **Status:** Phase 0 + Phase 1 COMPLETE — backend (PR-0→PR-3) + frontend (P1.12), built, tested, pushed
> **Scope:** Phase 0 (scaffolding) and Phase 1 (core ledger + `payments_service` integration) only.
> **Companion:** [LEDGER_SERVICE_DESIGN.md](./LEDGER_SERVICE_DESIGN.md) is the source of truth for the data model, CoA, and integration mappings. This plan does not redefine them — it sequences the build and pins the exact files, signatures, and conventions to follow.
> **Service port:** 8018
> **Date:** 2026-06-01

---

## Build status (2026-06-01)

Branch `feature/ledger-service-scaffold` in `swimbuddz-backend` (pushed). Backend is built, Ruff-clean, with green in-container integration tests (13). Frontend not started.

| PR | Scope | Status |
|---|---|---|
| PR-0 | Scaffold (service, gateway route, compose :8018, CoA template, `ledger_client`) | ✅ done |
| PR-1 | Schema models + migration (**applied** to dev DB) + RLS + org-context dep | ✅ done |
| PR-2 | Posting engine + internal route; CoA seed (**org seeded**); `payments_service` emitter + dead-letter (+ manual-approval emit) | ✅ done |
| PR-3 | Role enforcement + finance-user mgmt; admin reads; trial balance / P&L; reversing entries; tests | ✅ done |
| Frontend | `/admin/finance` pages — reports, journal browser, manual entry, finance team (P1.12) | ✅ done |

**RLS reality:** policies are enabled+forced but the `postgres` connection role has `BYPASSRLS`, so RLS is inert in single-tenant Phase 1 (nothing to isolate). App-level `org_id` filtering is the active guard. A non-`BYPASSRLS` role is a pre-B2B prerequisite.

**Apply steps still pending (operator):** the `payments_service` dead-letter migration (`ledger_post_failures`) and a recreate of `ledger-service` + `payments-service` to pick up `LEDGER_DEFAULT_ORG_ID` and the emitter code.

**Deferred follow-ups:** `Payment.amount` Float→bigint(kobo); revenue-recognition worker (Phase 3); reconciliation (Phase 4); other-service emitters + backfill (Phase 5); tax/FIRS (6–7); AI layer (8); B2B onboarding + non-BYPASSRLS role (9).

---

## 1. What this plan delivers

By the end of Phase 1:

- A running `ledger_service` on port 8018, scaffolded like `wallet_service`.
- Multi-tenant schema (org_id + RLS), CoA seeded from the `sports_club` template, idempotent journal-entry posting with double-entry validation.
- `payments_service` posts a journal entry on every `charge.success`, for all `PaymentPurpose` values, with a dead-letter fallback so no entry is ever silently lost.
- Trial balance + P&L + an admin "manual journal entry" surface at `/admin/finance/*`.
- **Outcome:** SwimBuddz finance has one source of truth for inflows.

Out of scope for this plan: wallet integration (Phase 2), revenue recognition worker (Phase 3), reconciliation (Phase 4), other services + backfill (Phase 5), tax/FIRS (6–7), AI (8), B2B (9). Those get their own plans.

---

## 2. Non-negotiable guardrails

These come from CLAUDE.md, project memory, and the design doc. Every task below respects them.

1. **Money is `bigint` minor units (kobo).** No `Float`, no bare `Numeric` for amounts. (The design doc §9 flags `Payment.amount` as `Float` — that's the parallel track in §9 of this plan, *not* a ledger column.)
2. **Migrations: generate with `./scripts/db/migrate.sh ledger_service "desc"`, apply with `alembic upgrade head`.** **NEVER `reset.sh` to apply** — `reset.sh` runs `nuke.py` (drops ALL tables) and `.env.dev` points at a *shared Supabase cloud DB*. Never hand-write a migration file (invents colliding revision IDs); use `--manual` mode for RLS/raw-SQL so the revision chain stays intact.
3. **No SwimBuddz-specific columns in ledger tables.** `cost_center_id`, `dimension_1/2`, `external_ref`, `member_ref` only. No `pool_id`, no `cohort_id`.
4. **`org_id` on every table and every query.** App-level filtering is mandatory; RLS is defence-in-depth on top.
5. **Idempotent posting.** Every entry has a unique `(org_id, idempotency_key)`. Replays are no-ops.
6. **Posted entries are immutable.** Corrections = reversing entries. No UPDATE/DELETE of posted rows.
7. **The ledger emitter is NOT best-effort.** Unlike `emit_rewards_event` (which swallows exceptions), `ledger_client.post_journal_entry` *raises* on failure so the caller can dead-letter and retry. A dropped journal entry is a silent books error — unacceptable.
8. **Alembic env gotcha:** import every new model in `alembic/env.py` and add its table to `SERVICE_TABLES`, or autogenerate won't see it.

---

## 3. Target service structure

Mirror `services/wallet_service/` (the newest, async, internal-router-having analog). Package subdirs, not single files.

```
services/ledger_service/
├── __init__.py
├── alembic.ini
├── Dockerfile
├── alembic/
│   ├── env.py                      # SERVICE_TABLES + model imports; version_table="alembic_version_ledger"
│   └── versions/
├── app/
│   ├── __init__.py
│   ├── main.py                     # create_app(); register_health_check(app, "ledger")
│   └── deps.py                     # get_ledger_db (org-context + RLS), resolve_org_id, role deps
├── models/
│   ├── __init__.py                 # re-export all; imported by alembic/env.py
│   ├── enums.py                    # AccountType, NormalBalance, EntryStatus, PeriodStatus, ...
│   ├── organization.py             # Organization
│   ├── accounts.py                 # ChartOfAccounts, CostCenter
│   ├── journal.py                  # JournalEntry, JournalLine
│   ├── balances.py                 # AccountBalance (materialized snapshot table)
│   ├── period.py                   # Period
│   └── audit.py                    # AuditLog, LedgerUser
├── schemas/
│   ├── __init__.py
│   ├── journal.py                  # JournalEntryCreate, JournalLineSpec, JournalEntryResult
│   ├── accounts.py
│   └── reports.py                  # TrialBalanceRow, ProfitLossReport, ...
├── routers/
│   ├── __init__.py
│   ├── internal.py                 # POST /internal/ledger/journal-entries  (require_service_role)
│   ├── admin.py                    # /admin/finance/*  (role-gated: viewer/accountant/admin/owner)
│   ├── users.py                    # /admin/finance/users  (finance-team mgmt; admin/owner)
│   └── health.py                   # (if not via register_health_check)
├── services/
│   ├── __init__.py
│   ├── posting.py                  # post_entry(): the atomic double-entry transaction
│   ├── accounts.py                 # account_ref resolution (maps_to → account_id), CoA seeding
│   ├── balances.py                 # balance recompute-from-lines on post (DECIDED §11.3)
│   ├── periods.py                  # period resolution for an entry_date
│   ├── reports.py                  # trial balance, P&L queries
│   └── ledger_users.py             # role lookup + finance-user management
├── coa_templates/
│   └── sports_club.yaml            # the SwimBuddz chart of accounts seed (design doc §5)
└── tests/                          # NOTE: services have no local tests dir today;
    └── (fixtures live in top-level tests/conftest.py — see §6)
```

`libs/common/ledger_client.py` lives in the shared lib (parallel to `service_client/`), not in the service.

---

## 4. Phase 0 — scaffolding

Each task lists the real file to touch (from the pattern scan).

### P0.1 — Service skeleton
- Create the tree in §3 with empty/stub modules.
- `app/main.py`: copy `services/wallet_service/app/main.py:22` `create_app()` pattern; `register_health_check(app, "ledger")`; include `internal_router`, `admin_router`.
- `Dockerfile`: copy `services/wallet_service/Dockerfile`, swap paths to `services/ledger_service/`, `EXPOSE 8018`, uvicorn target `services.ledger_service.app.main:app --port 8018`.
- **Deliverable:** `docker compose up ledger-service` serves `/health`.

### P0.2 — Config
- `libs/common/config.py` (~line 57, after `CORPORATE_SERVICE_URL`): add
  ```python
  LEDGER_SERVICE_URL: str = "http://ledger-service:8018"
  LEDGER_DEFAULT_ORG_ID: str = ""   # SwimBuddz org UUID; set in .env.dev / prod env
  ```
- **Deliverable:** settings load; `LEDGER_DEFAULT_ORG_ID` documented in `.env.example`.

### P0.3 — docker-compose
- `swimbuddz-backend/docker-compose.yml`: mirror the `wallet-service` block — `container_name: swimbuddz_ledger`, Dockerfile path, `ports: ["8018:8018"]`, `env_file: .env.dev`, `PYTHONPATH=/app`, volume `.:/app`.
- **Deliverable:** container builds and joins the compose network.

### P0.4 — Gateway wiring
- `services/gateway_service/app/clients.py` (~line 119): `ledger_client = ServiceClient(settings.LEDGER_SERVICE_URL)`.
- `services/gateway_service/app/main.py` (~line 449, mirror `proxy_admin_wallet`): add
  ```python
  @app.api_route("/api/v1/admin/finance/{path:path}",
                 methods=["GET","POST","PUT","PATCH","DELETE"])
  async def proxy_admin_finance(path: str, request: Request):
      return await proxy_request(clients.ledger_client, f"/admin/finance/{path}", request)
  ```
- **Internal posting routes are NOT proxied** — emitters call `LEDGER_SERVICE_URL` directly (same as `emit_rewards_event` calling `WALLET_SERVICE_URL`). Reserve `/api/v1/ledger/*` for future member-facing (invoices); not implemented in Phase 1.
- **Deliverable:** `GET /api/v1/admin/finance/health` reaches the service through the gateway.

### P0.5 — Register service in migration tooling
- `scripts/db/migrate.sh` (SERVICES array ~line 51): add `"ledger_service"`.
- `alembic.ini`: `script_location = services/ledger_service/alembic`.
- `alembic/env.py`: copy wallet's; set `version_table="alembic_version_ledger"`; import models + define `SERVICE_TABLES` (filled in P1.1).
- **Deliverable:** `./scripts/db/migrate.sh ledger_service "noop"` runs without error.

### P0.6 — CoA template
- Author `coa_templates/sports_club.yaml` from design doc §5 (codes, names, type, normal_balance, `maps_to`, `is_system: true`).
- **Deliverable:** YAML parses; `maps_to` values match the refs used in design doc §8 mappings (cross-check `paystack_clearing`, `deferred_revenue_*`, `bubbles_liability*`, `revenue_*`, `cogs_*`, `expense_*`).

### P0.7 — `ledger_client` skeleton
- `libs/common/ledger_client.py` — mirror `service_client/wallet.py:199` structure but **raise on failure** (see §5 of this plan for the full contract). Skeleton + types only in P0; wired in P1.4.
- **Deliverable:** importable; `post_journal_entry(...)` signature stable.

---

## 5. Phase 1 — core ledger + payments integration

### Workstream 1A — Schema & migrations

**P1.1 — Models** (design doc §4)
- Implement all models from §4.1 (organizations, chart_of_accounts, cost_centers, journal_entries, journal_lines, account_balances, periods) + §4.5 (ledger_users, audit_log). Defer reconciliation/FX/tax/invoice tables (§4.2–4.4) to their phases.
- All amount columns `BigInteger` (kobo). `CHECK (debit_minor = 0 OR credit_minor = 0)` on lines. `UNIQUE(org_id, idempotency_key)` on entries.
- `org_id` NOT NULL + indexed on every table.
- Import all in `alembic/env.py`; add every table name to `SERVICE_TABLES`.

**P1.2 — Initial migration**
- `./scripts/db/migrate.sh ledger_service "initial ledger schema"` → **review the generated file** (FK constraints, indexes, CHECKs present) → apply with `alembic upgrade head` against a local/dev DB.
- ⚠️ Do not `reset.sh`.

**P1.3 — RLS + org-context (net-new to the codebase — no precedent exists)**
- `--manual` migration (`./scripts/db/migrate.sh --manual ledger_service "rls policies"`): `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + policy `USING (org_id = current_setting('app.current_org_id')::uuid)` on every table.
- `app/deps.py`:
  ```python
  async def get_ledger_db(request: Request,
                          session: AsyncSession = Depends(get_async_db)) -> AsyncSession:
      org_id = resolve_org_id(request)          # auth claim → path → LEDGER_DEFAULT_ORG_ID
      # SET LOCAL is transaction-scoped → pooler-safe (pgbouncer txn mode); plain SET is not.
      await session.execute(text("SET LOCAL app.current_org_id = :o"), {"o": str(org_id)})
      request.state.org_id = org_id
      yield session
  ```
- **Risk to verify in this task:** `SET LOCAL` must run inside the same transaction as the queries. With the Supabase **transaction-mode pooler** + `NullPool` + `prepare_threshold=None` (per `libs/db/config.py`), confirm the setting survives to subsequent statements on the same session. Add an integration test that asserts a cross-org read returns zero rows.
- App-level filtering (`.where(Model.org_id == request.state.org_id)`) is still written on every query — RLS is the backstop, not the primary guard.

### Workstream 1B — Posting engine

**P1.4 — `services/posting.py`** — the atomic core. One transaction:
1. Look up `(org_id, idempotency_key)` → if exists, return it (no-op replay).
2. Resolve each line's `account_ref` → `account_id` via `chart_of_accounts.metadata->>'maps_to'` (`services/accounts.py`).
3. Validate: `sum(debit_minor) == sum(credit_minor)`; each line one-sided; accounts active & belong to org; `entry_date`'s period is `open` (else 409).
4. Insert `journal_entry` + `journal_lines`.
5. Recompute affected `account_balances` rows (`services/balances.py`).
6. Commit. Return `JournalEntryResult{entry_id, status, period_id}`.
- Enforce the balance invariant with a defensive assert AND (P1 hardening) a DB trigger as belt-and-braces.

**P1.5 — Reversing entries** — `POST /admin/finance/journal-entries/{id}/reverse`: posts a mirror entry, links both via `reversal_of_entry_id`/`reversed_by_entry_id`, marks original `reversed`. Accountant role only.

### Workstream 1C — API surface

**P1.6 — Internal posting route** — `routers/internal.py`:
```
POST /internal/ledger/journal-entries     (Depends(require_service_role))
```
Body = design doc §6. `org_id` resolved server-side (Phase 1: always `LEDGER_DEFAULT_ORG_ID`; the `/orgs/{org_id}/…` REST surface in design doc §6 is the Phase-9 B2B shape — Phase 1 keeps SwimBuddz-conventional paths with implicit org). `Idempotency-Key` honored.

**P1.6b — Ledger roles & finance-user management** (DECIDED: full role model in Phase 1, not just `require_admin` — see §11 Q2)

The full `viewer / accountant / owner`… role model from design doc §15 ships in Phase 1 so real finance users can be onboarded immediately, in parallel with the rest of the build.

- **`ledger_users` table** (already in P1.1 / `models/audit.py`): `(org_id, auth_id, role, created_at, deactivated_at)`, `UNIQUE(org_id, auth_id)`. `role ∈ {viewer, accountant, admin, owner}`.
- **Role dependency** in `app/deps.py`:
  ```python
  RANK = {"viewer": 0, "accountant": 1, "admin": 2, "owner": 3}
  def require_ledger_role(minimum: str):
      async def dep(user: AuthUser = Depends(get_current_user),
                    session: AsyncSession = Depends(get_ledger_db)) -> LedgerUser:
          lu = await get_active_ledger_user(session, request.state.org_id, user.auth_id)
          if lu is None or RANK[lu.role] < RANK[minimum]:
              raise HTTPException(403, "Insufficient ledger role")
          return lu
      return dep
  ```
  Higher roles inherit lower capabilities (owner ⊇ admin ⊇ accountant ⊇ viewer). A Supabase login with **no** `ledger_users` row gets 403 — being a SwimBuddz admin does not implicitly grant finance access. Internal emitters keep using `require_service_role` (unchanged) and bypass this entirely.
- **Bootstrap:** the org seed script (Q1) creates Daniel's `owner` row. Break-glass: the seed/CLI is the only path that can mint the first owner; re-runnable and idempotent.
- **User-management endpoints** — `routers/admin.py`, `require_ledger_role("admin")`:
  ```
  GET    /admin/finance/users                 # list finance team + roles
  POST   /admin/finance/users                 # register a user by email/auth_id + role
  PATCH  /admin/finance/users/{id}            # change role
  DELETE /admin/finance/users/{id}            # deactivate (sets deactivated_at; never hard-delete)
  ```
  Registering by email resolves the Supabase auth_id via `members_service`/auth lookup; if the person has no auth account yet, store the email and bind on first login.
- Every role change is written to `audit_log`.

**P1.7 — Admin routes** — `routers/admin.py`, each gated by the minimum role from design doc §15:
```
GET  /admin/finance/accounts                          require_ledger_role("viewer")
GET  /admin/finance/journal-entries                   require_ledger_role("viewer")    # list/filter
GET  /admin/finance/journal-entries/{id}              require_ledger_role("viewer")
GET  /admin/finance/reports/trial-balance?as_of=      require_ledger_role("viewer")
GET  /admin/finance/reports/profit-loss?...&group_by= require_ledger_role("viewer")
POST /admin/finance/journal-entries                   require_ledger_role("accountant")  # manual entry
POST /admin/finance/journal-entries/{id}/reverse      require_ledger_role("accountant")
```
(Period close, CoA management, tax codes, reconciliation matching arrive in later phases but slot onto the same role gates — accountant for the accounting actions, admin/owner for configuration and hard-close.)

### Workstream 1D — payments_service emitter (highest-value integration)

**P1.8 — Dead-letter table in payments_service**
- New model `LedgerPostFailure` in `payments_service` (its own DB): stores the full intended entry payload + `idempotency_key`, `attempts`, `last_error`, `status (pending|replayed|abandoned)`.
- This *is* the Phase-1 "dead-letter fallback" from design doc §19-C — not a full outbox (happy path posts inline).

**P1.9 — Emit on `charge.success`**
- In `payments_service/routers/webhooks.py` `_mark_paid_and_apply()`: after the Payment is committed PAID, build lines per design doc §8.1 (keyed on `PaymentPurpose`) and call `ledger_client.post_journal_entry(...)`.
- Mapping table (design doc §8.1) → e.g. `WALLET_TOPUP` → DR `paystack_clearing` / CR `bubbles_liability`; `ACADEMY_COHORT` → DR `paystack_clearing` / CR `deferred_revenue_academy`; etc.
- `idempotency_key = f"payments:charge_success:{payment.reference}"`.
- **On failure:** catch, write `LedgerPostFailure`, log, **do not fail the webhook** (Paystack would retry a legitimately-paid charge). A small replay command/endpoint drains `LedgerPostFailure`.
- Amount conversion: `Payment.amount` is `Float` NGN today → `int(round(amount * 100))` with a `round-half-even` rule; flag each conversion site for the §9 parallel migration.

**P1.10 — `ledger_client.post_journal_entry` (full)**
```python
async def post_journal_entry(*, org_id, entry_date, description,
                             source_service, source_type, source_id,
                             lines, calling_service, metadata=None) -> dict:
    key = f"{source_service}:{source_type}:{source_id}"
    resp = await internal_post(service_url=settings.LEDGER_SERVICE_URL,
        path="/internal/ledger/journal-entries", calling_service=calling_service,
        json={...}, )                      # Idempotency-Key header = key
    resp.raise_for_status()                # RAISES — caller dead-letters. Not best-effort.
    return resp.json()
```

### Workstream 1E — Reporting

**P1.11 — Trial balance & P&L** — `services/reports.py` over `journal_lines`/`account_balances`. P&L `group_by ∈ {none, cost_center, dimension_1}`. Pure reads; no stored report rows.

### Workstream 1F — Frontend (admin)

**P1.12 — `/admin/finance` pages** (Next.js, Mantine; `npm run generate:types` after API lands):
- Trial balance table (as-of date picker).
- P&L (date range + group-by).
- Journal entry browser (filter by source/date; entry detail shows balanced lines + reversal link).
- Manual journal entry form (accountant) with live debit=credit validation.
- **Finance team page** (`/admin/finance/users`, admin/owner only): list members + roles, register by email with a role picker, change role, deactivate. This is what lets you onboard real users yourself while the rest is built — no DB access needed.
- UI hides/disables actions above the signed-in user's role (server still enforces; this is just UX).
- Server Components by default; client only for the entry form and the user-management actions.

### Workstream 1G — Tests

**P1.13 — Integration tests** (top-level `tests/`; add a `ledger_client` AsyncClient fixture mirroring `tests/conftest.py:420`; reuse `db_session` transactional-rollback fixture + `make_service_role_user`/`make_admin_user`):
- Posting: balanced entry succeeds; unbalanced rejected; idempotent replay returns original; closed-period rejected; unknown `account_ref` rejected.
- RLS: cross-org read returns zero rows (the §P1.3 verification test).
- Reversal: original→reversed, balances net to zero.
- Emitter: each `PaymentPurpose` posts the design-doc §8.1 mapping; ledger-down path writes `LedgerPostFailure` and the webhook still 200s; replay drains it.
- Reports: trial balance balances; P&L `group_by` buckets correctly.
- Roles: `viewer` blocked from POST entry (403); `accountant` can post + reverse but blocked from user-management; `admin` can manage users; user with no `ledger_users` row gets 403; role escalation above own rank rejected.

---

## 6. Testing notes (from the real conftest)

- Fixtures are centralized in top-level `conftest.py` / `tests/conftest.py` — **services have no local `tests/` dir today.** Add ledger fixtures there.
- `test_engine` (session scope) `pytest.skip()`s when the DB is unreachable — so integration tests "pass" as skipped locally without a DB. Run inside the container against a reachable dev DB (see project memory: run from inside the container, not host, to avoid pooler max-clients).
- `db_session` wraps each test in a transaction with `join_transaction_mode="create_savepoint"` and rolls back — but note RLS `SET LOCAL` is transaction-scoped, so the test must set `app.current_org_id` within the same transaction the fixture provides. Bake this into the ledger fixture.
- Ledger tables must exist in the test DB first: apply via `alembic upgrade head` (not `reset.sh`).

---

## 7. Sequencing & suggested PR breakdown

Dependency order (→ = blocks):

```
P0.1 skeleton → P0.2 config → P0.3 compose → P0.4 gateway → P0.5 migrate-reg → P0.6 CoA → P0.7 client-stub
        │
        └─→ P1.1 models → P1.2 migration → P1.3 RLS
                              │
                              ├─→ P1.4 posting → P1.5 reversal
                              │        │
                              │        ├─→ P1.6 internal route → P1.8 dead-letter → P1.9 emit → P1.10 client
                              │        ├─→ P1.6b roles + user-mgmt ─┐
                              │        └─→ P1.7 admin routes → P1.11 reports → P1.12 frontend
                              │                                   (P1.7 gates depend on P1.6b)
                              └─────────────────────────────────────→ P1.13 tests (alongside each above)
```

Suggested PRs (each independently reviewable & shippable):
1. **PR-0 Scaffold** — P0.1–P0.7 (service boots, health green, no business logic).
2. **PR-1 Schema** — P1.1–P1.3 (models incl. `ledger_users`, migration, RLS + the cross-org test).
3. **PR-2 Posting** — P1.4–P1.6 + tests (internal posting works end-to-end via service-role).
4. **PR-3 Roles + admin + reports** — P1.6b (role deps + finance-user management), P1.7 role-gated routes, P1.11 reports, P1.5 reversal + tests. *Ship this early so you can register real users.*
5. **PR-4 Payments emitter** — P1.8–P1.10 + tests (the value moment).
6. **PR-5 Frontend** — P1.12 (incl. the finance-team page).

Write `API_ENDPOINTS.md` entries and run `npm run generate:types` as part of PR-2/PR-3/PR-4 as endpoints land (CLAUDE.md checklist).

---

## 8. Parallel track — `Payment.amount` Float → bigint(kobo)

Independent of the ledger but flagged by design doc §9/§17. `payments_service.Payment.amount` is `Float` — a latent rounding bug regardless of the ledger.

- **Don't block Phase 1 on it.** Phase 1 converts at the emitter boundary (`int(round(amount*100))`, round-half-even) and records each call site.
- Separate mini-plan: add `amount_minor BigInteger`, backfill `= round(amount*100)`, dual-write for one release, cut reads over, drop `amount`. Each step its own migration via `migrate.sh`. Reconcile `sum(amount_minor)` vs `sum(round(amount*100))` before the cutover.
- Spin this off as its own task — do not fold into ledger PRs.

---

## 9. Definition of done (Phase 1)

- [ ] `ledger_service` boots on 8018; health green through gateway at `/api/v1/admin/finance/health`.
- [ ] Schema migrated via `migrate.sh` + `alembic upgrade head`; RLS on; cross-org read test passes.
- [ ] Internal posting endpoint: balanced ✓, unbalanced ✗, idempotent replay ✓, closed-period ✗.
- [ ] `payments_service` posts on `charge.success` for **every** `PaymentPurpose`; ledger-down path writes `LedgerPostFailure` and webhook still succeeds; replay drains it.
- [ ] Trial balance balances to zero; P&L renders with group-by.
- [ ] Role model live: `viewer/accountant/admin/owner` enforced per endpoint; owner seeded; admin can register/deactivate finance users from the UI; no-role login is 403.
- [ ] `/admin/finance` pages live (incl. finance-team page); manual entry enforces debit=credit.
- [ ] Integration tests green in-container; `API_ENDPOINTS.md` + generated FE types updated.
- [ ] **Outcome demo:** a day of real Paystack charges shows up as a balanced trial balance and a P&L by domain.

---

## 10. Implementation risks specific to Phase 1

| Risk | Mitigation |
|---|---|
| RLS `SET LOCAL` doesn't survive on the Supabase txn pooler | P1.3 ships with an explicit cross-org test; fallback is app-level filtering only + RLS deferred to a hardening pass (app-level guard is already mandatory) |
| `charge.success` fires before entitlement/related rows are committed → emit reads stale state | Emit *after* the Payment PAID commit; entry only needs amount + purpose + reference, all on Payment |
| `Float` rounding drift in conversion | Single helper `kobo(amount)` with round-half-even; reconciled in the §8 parallel track |
| Double-posting if Paystack retries the webhook | `idempotency_key = payments:charge_success:{reference}` makes replays no-ops |
| CoA `maps_to` ref typo → emit fails at runtime | P0.6 cross-checks every ref against design doc §8; unknown-ref returns 4xx and dead-letters (visible, not silent) |
| Period not yet created for an entry_date | `services/periods.py` auto-creates the open month-period on first entry if absent |

---

## 11. Implementation decisions (resolved 2026-06-01)

1. **Org bootstrap — DECIDED: idempotent seed script.** `scripts/seed/ledger_org.py` creates the SwimBuddz `Organization` row, seeds the CoA from the `sports_club` template, and seeds Daniel's `owner` `ledger_users` row. Run once per environment; re-runnable (upserts). `LEDGER_DEFAULT_ORG_ID` is set from the created org UUID into env. This is also the break-glass path to (re)mint the first owner.
2. **Ledger roles — DECIDED: full role model in Phase 1 (not just `require_admin`).** All four roles `viewer/accountant/admin/owner` from design doc §15 ship in Phase 1, with finance-user management endpoints + UI, so real users can be onboarded immediately while later phases are built. Scoped as **P1.6b** + role gates on **P1.7** + the finance-team page in **P1.12**. (Reason: you want to register people to start using what's there in parallel with the build.)
3. **Balance recompute — DECIDED: recompute-from-lines.** On each post, recompute affected `(account, period)` balances from `journal_lines` rather than incrementing in place. Correctness over speed; optimize to incremental only if posting latency becomes a problem. Scoped in **P1.4** / `services/balances.py`.

No open questions remain for Phase 0 + Phase 1.

---

*Last updated: 2026-06-01*
