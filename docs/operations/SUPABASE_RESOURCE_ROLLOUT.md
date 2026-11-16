# Supabase resource incident — November 16 rollout

The Free-plan restriction was triggered by shared-pooler egress. S3 delivery
bytes shown in the Media Vault dashboard are a separate usage category. The
identified amplification was repeated unsuccessful media reconciliation plus
unnecessary member relationship loading; query/connection log totals alone do
not establish the exact share of billed egress or prove which AI tool introduced
a regression.

The release preserves raw accounting evidence, bounds media attribution retries,
includes measured preview delivery in the S3 dashboard, narrows member and safety
reads, and suppresses hidden-tab polling. Reporting keeps its hourly schedule;
default Academy attendance keeps its five-minute safety-aware reconciliation.

Backend deployment must pass its new private snapshot backup + isolated restore
gate before migrations. A production drill at 08:27:22 UTC restored all 304 tables
and matched 62,175 rows from a 6,005,872-byte archive. The release itself takes a
fresh backup. Keep local pooling disabled for the initial rollout; subsequently
evaluate only the media worker with two connections and no overflow.

Release backend `develop` to `main`, verify health, retry classification and
member/payment/media reads, then release frontend `develop` to `main`. Capture
timestamped counter deltas, log-path counts and actual Usage-dashboard readings.
The 100 MB/day egress and 20 MB/day log ingestion budgets remain engineering
targets to validate over multiple full days. No billing upgrade is required by
these code changes and no quota outcome has yet been demonstrated in production.

Canonical implementation/recovery instructions:

- `swimbuddz-backend/docs/operations/PRODUCTION_DATABASE_RECOVERY.md`
- `swimbuddz-backend/docs/operations/MEDIA_VAULT_BANDWIDTH_RECONCILIATION.md`
- `swimbuddz-backend/docs/QUARTERLY_REPORTING_METRICS.md`
- `swimbuddz-frontend/UI_FLOWS.md`

The backup is private on the server and includes application/Auth database
schemas. It does not replace encrypted off-host disaster recovery or copying S3
objects/platform secrets. Never attach live dumps to GitHub or a support ticket.
