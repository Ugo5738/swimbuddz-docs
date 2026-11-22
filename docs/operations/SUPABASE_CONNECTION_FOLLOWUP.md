# Connection investigation — 17 November 2026

## Chat-only activation — 22 November 2026

The owner separately approved activating Chat after the Members test had
remained enabled and passed current health checks. At 13:54 UTC (14:54 Lagos),
only Chat was recreated with its existing image, one retained connection per
process and zero overflow. Its GitHub production Environment flag is persisted
as true. Members is unchanged and media reuse remains off; source defaults stay
false. Chat authorization and moderation configuration are preserved.

Health, denied anonymous/invalid-token access and an authorized read passed.
Initial runtime checks showed one retained Chat socket and no restart,
operational-error or queue-timeout pattern. Rollback retains Members true and
sets only Chat false before recreating it with its saved image/configuration.
The private server manifest and detailed evidence are recorded in the backend
connection-canary runbook. No schema, financial record or billing plan changed.

In the before sample, 33 scheduled Chat requests opened 33 connections and
received 222,004 TCP payload bytes. After activation, 87 scheduled requests all
returned 200 with one new connection and 193,017 received bytes, including a few
read-only diagnostic requests. No observer drops or new Chat errors appeared;
direct and gateway authorization checks passed through 14:00 UTC. These windows
cover different hourly jobs and response sizes, so they establish reuse under
load rather than a daily provider-billed savings percentage.

The morning billing check showed 1.876/5 GB used; November 21 Shared Pooler
Egress was 253.689 MB. This remains above the roughly 130 MB/day remaining
budget. Other releases and workload changes prevent attributing the daily
improvement to Members alone. A complete provider-usage day after Chat activation
is still needed to establish sustainable savings.

## Members-only activation — 19 November 2026

The owner explicitly approved activating the prepared Members API canary. Only
Members was recreated at 03:00 UTC (04:00 Lagos), retaining its application image,
one-connection cap and zero overflow. Its GitHub production Environment flag is
persisted as true. Chat, media reuse and every other service remain unchanged.
Rollback metadata and the previous image are retained privately on the server.

The latest fixes were already running with both API reuse flags false. A fresh
five-minute pre-activation sample counted 80 new connections across services,
including 11 from Members. A successful read and one retained socket provide
initial verification, not a full-day savings result. Compare provider egress,
errors/latency and scheduled workloads before enabling Chat or widening scope.
There is no schema, financial-record or billing-plan change in this activation.

The deployed media retry fix is working: historical expensive lookups stopped
increasing, terminal classification is active, and all original S3 event/byte
evidence is retained. Remaining traffic is concentrated in persistent API
connections and their scheduled callers, rather than the media worker alone.

A six-minute passive sample attributed about 86% of connections/received TCP
payload to Members, Chat and Communications. A bounded read-only eight-operation
probe received 36,232 bytes with eight new connections versus 6,674 bytes with one
reused connection. These are encrypted TCP measurements, not a provider-billed
egress forecast. Neither the six-minute sample nor November 16's mixed-deployment
day establishes a sustainable daily rate.

The owner explicitly approved preparing a default-off Members/Chat API canary,
superseding the earlier media-worker-only configuration scope. Each API is capped
at one retained connection per process and zero overflow; current topology adds
at most two retained client connections if both are enabled. Prepare/review the
PR and deploy flags false first, then evaluate Members and Chat separately on
later approved deployments. Do not enable global pooling or the media pilot at
the same time. Preserve disabled prepared statements and connection guards.

Confirmed accompanying fixes remove invalid `prospect` announcement-enum filters
and narrow locked membership projection reads, preserving visibility, complete
responses, programme periods and conditional payment-reference rules. No live
financial records, billing plan or application configuration were changed by
the investigation.

The canonical evidence, per-role switches, GitHub Environment-variable wiring,
rollback flags and validation are in
`swimbuddz-backend/docs/operations/SUPABASE_CONNECTION_CANARY.md`.
