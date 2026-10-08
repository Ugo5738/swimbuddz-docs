# SwimBuddz Pool Access and Unified Booking Roadmap (2026-10-08)

## Product contract
Pool Access is a self-directed visit to a partner's facility, not a Club session, Academy make-up, coached lesson, or community event. All member categories may purchase Pool Access, and public guest checkout is the planned destination. A login is required for the first provisional booking implementation; public browsing requires none.

## Commerce model
SwimBuddz negotiates a pool cost in kobo, per verified person or per admitted group; SwimBuddz separately sets its selling price per participant. Public APIs expose only selling price. Admin APIs control negotiated costs. Immutable booking snapshots freeze both amounts. Under *per_person* contracts the payable estimate is cost × verified admissions; under *per_group* it is one contract charge if any admission was verified. This is an estimate of contractual liability and not itself a bank payout or ledger posting. Cancellation, no-show minimums, taxes, additional fees, and exceptions must be contract-specific before enabling payouts.

## Operational design
- A pool must be an active partner with independently published Pool Access inventory.
- An offer has explicit time interval, capacity, safety rules, amenities, cancellation policy and selling/cost basis. Creation always starts in draft.
- An authenticated buyer may temporarily hold 1–25 admission positions against capacity with a client idempotency key. The hold expires after 15 minutes.
- A booking contains individually named admissions, enabling split arrival and auditable check-ins.
- A provisional booking is **not** a ticket. Payment-service confirmed status and entitlement application must create admission credentials.
- QR credentials should use a signature, scoped admission IDs, short useful validity window, checked-in-once transaction semantics and reception staff restricted to their pool.
- Keep an explicit ledger movement per verified contractual payable and any adjustment; never pay indiscriminately from booking counts.
- No third-party facility names should be marketed as standalone brands over SwimBuddz experiences; members still need accurate addresses and access instructions.

## Implemented initial slice (feature branch)
Backend pool-access models/migration, public offer discovery, admin draft offer creation/publishing route, authenticated capacity-locked provisional reservation, booking list, pricing/QR signature policies, and public-safe serialization.
Frontend Pool Access discovery + draft booking UX, admin draft offer form, navigation entry and clearer payments label.

## Still required before production availability
1. Integrate verified Paystack payment intent with a dedicated pool-access payment purpose, backend quote, idempotent booking activation, refunds, webhooks and expiry/release.
2. Replace provisional reservation confirmation with a true payable checkout that never exposes QR before verified payment; publish must be disabled until the payment adapter and partner check-in are live.
3. Implement Partner Portal: restricted pool-level accounts, replay-resistant QR scanning, check-in event audit, network fallback and revocation.
4. Implement reconciliation statements, contract adjustments and finance integration, including disputes, refunds, taxes and payment execution.
5. Introduce non-member checkout with guest identity verification and rate limiting; continue to require signed safety disclosures as appropriate.
6. Integrate an aggregated My Bookings experience across Club/Academy/Community/Pool Access, with entitlement-accurate cancellation and transfers.
7. Refactor role-based navigation using end-to-end usability testing, then move full enrollment onboarding after checkout while retaining pre-payment suitability checks.
8. Build flexible scheduling for published pods, additional practices and academy make-ups without letting members create unsupervised coached sessions.
9. Add partner amenities verification, safe swimmer eligibility and per-facility rules before public marketing.

## Release gate
Do not deploy Pool Access for customer bookings until payment fulfillment, QR redemption, partner permissioning, reconciliation and end-to-end tests are complete. The first slice deliberately provides no paid status mutation or QR issue endpoint. After approval, pilot with one partner location and a few controlled admissions.

## Acceptance tests (planned)
- Concurrent holds never exceed confirmed capacity.
- A forged, reused, cancelled, expired or unpaid QR never allows entry.
- Pool A receptionist cannot see or redeem Pool B tickets.
- Repeated webhooks are exactly-once for entitlement application.
- Partner unit costs are never returned to public clients.
- Guest +1 check-in supports partial and out-of-order arrival.
- Finance reconciles verified admissions by negotiated contract and bookings separately; per-group is charged once.
- Refunded or disputed admission adjusts the payable and receipts without overwriting historical snapshots.
- First-time checkout works without extensive onboarding; Academy suitability is assessed before checkout and safety profile before first class.
