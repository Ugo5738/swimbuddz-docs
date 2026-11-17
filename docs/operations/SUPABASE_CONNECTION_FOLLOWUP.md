# Connection investigation — 17 November 2026

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
