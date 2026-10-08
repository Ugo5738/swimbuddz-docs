# SwimBuddz Alumni Evidence, Beyond the Pool, Stories and Learn: Rollout

## Product contract
- Academy, Club, Community are ways to swim with us, not membership tiers.
- An alumni member can keep their Academy history and add supplementary milestone videos even after the cohort closes or the member's Community membership expires. Suspended accounts cannot upload.
- Supplementary evidence NEVER changes the verified StudentProgress row or milestone assessment audit trail.
- Coaching on supplementary uploads is optional, never an implied paid coaching commitment.
- An uploaded video is private. Asking to be contacted for a feature is not publication consent.
- Consent for each video is explicit, revocable and separate from an admin editorial approval. The swimmer can use a chosen public display name or remain anonymous.
- Media belonging to another account cannot be attached to an enrollment. Private media is excluded from anonymous media listings/URL resolution.

## Implementation: Academy and media
- `GET/POST /academy/enrollments/{enrollment_id}/evidence`: member-owned archive and progress videos.
- `PATCH /academy/enrollments/{enrollment_id}/evidence/{evidence_id}/publication-consent`: opt in, display name or withdraw consent; changing consent revokes prior approval.
- `GET /academy/coach/evidence`: assigned coach's cohort videos.
- `POST /academy/evidence/{evidence_id}/coach-review`: optional feedback; milestone grades remain unchanged.
- `GET /academy/admin/evidence`: admin review queue.
- `POST /academy/admin/evidence/{evidence_id}/showcase`: approve or revoke only with verified separate publication release.
- `GET /academy/public/showcase`: public, approved, consented story metadata only.
- `GET /academy/public/showcase/{evidence_id}/play`: checks current consent/approval on each request and issues a short-lived redirected private video URL through Media Service.
- `GET /academy/evidence/{evidence_id}/play`: authenticated, role- and cohort-checked playback for owners/coaches/admins.
- Media Service supplies an internal service-role-only ownership check and short-lived playback signer. **Public showcase playback requires STORAGE_BACKEND=s3 and a configured private bucket**; never move restricted clips to a public gallery bucket just to make playback work.

## Implementation: Learn and Beyond the Pool
- Public hub at `/learn`, episodes at `/beyond-the-pool` and `/beyond-the-pool/[id]`.
- Member journeys at `/account/academy/enrollments/[id]`.
- Admin evidence management at `/admin/academy/evidence`; coach review at `/coach/alumni-evidence`.
- Public swimmer stories at `/learn/stories`; the listing displays only consented and admin-approved clips.
- Use the existing ContentPost editor (Admin > Community > Content), category `beyond_the_pool`, plus episode number, guest names and verified YouTube URL. Published posts only are visible anonymously.
- Existing `/tips`, `/guides`, `/gallery` routes are retained. Avoid advertising partner pools as standalone destinations.


## Content-attributed registration, using existing service boundaries

- The episode CTA carries a validated first-party `content_id` into the existing member registration page.
- Members persists the content origin as `MemberPreferences.discovery_source` when registration completes, alongside the existing independent acquisition channel.
- The existing Members `/internal/members/joined-tier` reporting contract exposes an optional `content_source` and internal member auth ID. Only Reporting consumes these fields for attribution.
- Reporting refreshes its own `content_acquisition_snapshots` through the existing Reporting → Members and Reporting → Payments internal reporting paths, using its ARQ worker. Payments supplies only settled, NGN, purpose-grouped statistics for bounded member batches. There are no payment-initiated callbacks, cross-service FKs, or direct domain-table reads.
- Admin displays the Reporting-owned confirmed registration snapshot and Communications-owned anonymous engagement aggregate as separate datasets.
- This measures **persisted registrations and paid payment records** for the same content-sourced registration cohorts, not proof of causality or settled accounting revenue. The purpose filter excludes wallet top-ups and store orders. Session-type bookings are currently grouped with session payments; do not claim that all of them are public events.
- A failed Members query must not silently clear existing attribution data. Snapshot counts are recomputed for the selected period, not cumulatively inflated.

## Analytics: what counts and what does not
- Anonymous aggregate-only counts: page views, player loads and clicks to Academy/assessment (and supported future CTAs).
- Admin report: `/admin/community/content/analytics`, API `/content/admin/engagement`.
- No viewer identity, IP or device fingerprints stored in engagement counters.
- Anonymous clicks are **NOT** registrations or paid conversions. Reporting snapshots separately measure completed registrations and Payments-confirmed payment counts/amounts, grouped by the content that originated the first-party registration. This is *source-cohort association*, not proof that a specific video caused a payment.

## Your manual admin tasks after backend migrations + verified release
1. Open Admin > Community > Content; create Episode 1, **Is It Too Late to Learn Swimming as an Adult?** (August 18, 2026). Shared playlist URL contains `DDqH3JDcl_Y`; verify final trimmed video URL.
2. Create Episode 2, **How Busy Professionals Learned to Swim** (September 3, 2026). Shared live URL: https://www.youtube.com/live/g_4oasxw46M ; verify the final replay.
3. Add episode summaries, guest names, key takeaways and the final approved thumbnails. Set category `beyond_the_pool`, audience `community`, episode numbers 1 and 2; publish when satisfied.
4. For swimmer stories, obtain and verify separate publication permission covering the swimmer and anyone identifiable, then approve in Admin > Academy > Evidence. Withdrawal must remove the video immediately from the public listing.
5. Review editorial analytics after traffic is present. Low or zero counts do not imply the feature has failed.

## Release gates
- Academy and Communications Alembic migrations have one head each and upgrade/downgrade cleanly.
- CI fully passes: backend Ruff, migrations, unit and integration tests, OpenAPI snapshot; frontend lint, types, tests and build.
- Test on staging: graduated alumni upload, verified milestone unchanged, private media ownership denial, coach authorization, opt-in, admin approval, anonymous playback, withdrawal revocation and anonymous search privacy.
- Confirm S3 private bucket configuration, access lifetimes and approved-video playback. Do not mark public video playback available until verified in staging.
- Deploy backend and migrations before frontend, then make the features discoverable; no merge straight to `main`.

## Explicit follow-on/limits
- Click counters now have initial coverage. Server-side *confirmed* registration/booking/payment attribution and a complete conversion funnel remain out of scope until cross-service linkage is implemented.
- A standalone public event taxonomy or partner-pool booking marketplace is separate from this Learn/alumni scope.
