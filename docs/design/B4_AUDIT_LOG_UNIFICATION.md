# B4 — Audit-Log Unification (design note / scoping)

> **Status:** ✅ closed 2026-05-24 across all three services. Sequenced
> PRs landed as wallet (`d32c9f6`) → store (`0b4f9ed`) → chat
> (`3ebd103`). See [`docs/REVIEW_FOLLOWUPS.md`](../REVIEW_FOLLOWUPS.md)
> §4 for the per-PR summary table. This note remains the canonical
> design reference for the shape and the rationale.

## Problem

Three services keep separate, divergently-shaped audit tables:

| Table | Service | Entity model | Actor | Action | Extra |
|---|---|---|---|---|---|
| `wallet_audit_logs` | wallet | `wallet_id` (scoped) | `performed_by` **string** | `AuditAction` enum | `reason` (required), `ip_address` |
| `store_audit_logs` | store | generic `entity_type`+`entity_id` | — | `action` **free string** | — |
| `chat_audit_log` *(singular)* | chat | chat-specific targets | `actor_id` **UUID** (nullable) | `ChatAuditAction` enum | safeguarding fields |

Divergences blocking a naive merge: different entity models, different
actor representations (string vs UUID), three unrelated action
vocabularies, different required/optional columns, and even
plural-vs-singular table naming.

## Critical correction to the review's premise

The review framed B4 as "merge into one audit table." **That would
violate the service-isolation rule** (no shared cross-service tables,
no cross-service FKs — see `memory: project_no_cross_service_fks` and
`docs/reference/SERVICE_COMMUNICATION.md`). A single physical table
would require services to read/write each other's data.

**Unification therefore means a shared *shape*, not a shared table:**

1. A canonical audit contract in `libs/common` — a SQLAlchemy
   declarative **mixin** + Pydantic schema + a naming/enum convention.
2. Each service keeps **its own** per-service audit table, but adopts
   the canonical columns via the mixin.
3. (Optional, later) a common write path / shipper so audit rows can
   be fanned to a central read-only sink for cross-domain queries —
   without coupling the operational services.

## Proposed canonical shape (`libs/common/audit.py`)

```
id            UUID  pk
domain        str   -- "wallet" | "store" | "chat" (which service wrote it)
entity_type   str   -- generic; service-defined vocabulary
entity_id     UUID  -- the row the action touched
action        str   -- service-namespaced (e.g. "wallet.grant.revoke")
actor_id      UUID? -- normalized to UUID; null = system/service action
actor_label   str?  -- human/string actor when no UUID (wallet's performed_by)
old_value     JSONB?
new_value     JSONB?
reason        str?  -- promoted to optional-common (wallet requires it today)
ip_address    str?  -- optional-common
created_at    timestamptz
```

Keep `action`/`entity_type` as **strings** (not a shared enum) so each
service owns its vocabulary without a cross-service enum dependency;
validate against per-service enums at the write site.

## Sequenced plan (per service, one PR each — do NOT batch)

For each of wallet → store → chat:

1. Add the `libs/common` mixin + schema (first PR only).
2. Refactor the service's model to the canonical columns.
3. Generate the migration **via `./scripts/db/migrate.sh <svc> "…"`**
   (never hand-write — see `memory: feedback_no_handwritten_migrations`).
   Expect a `--manual` data-migration step for the backfill.
4. **Backfill** existing rows into the new columns
   (`performed_by` → `actor_label`, derive `domain`, map old enum
   values → namespaced `action`, default `entity_type`). Audit data is
   compliance-relevant: backfill must be lossless and reversible;
   verify row counts before/after.
5. Update all writers/readers in that service.
6. Run that service's full suite + a contract test asserting the
   canonical shape.

## Risks / why this is its own project

- **Data loss is unacceptable** (audit/compliance). Each backfill needs
  its own review and a verified row-count invariant.
- Three independent migrations + backfills; an agent cannot
  self-verify backfill correctness without dedicated checks.
- Touches admin reads in each service (dashboards that query the old
  columns) — coordinated FE/BE.

## Recommendation

Execute as three sequenced PRs (wallet first — smallest, has the
required-`reason` quirk that stress-tests the optional-common
decision). Not appropriate to bundle into a review-cleanup batch.
