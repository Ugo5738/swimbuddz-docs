# Academy Journey & Enrollment Management

## Relationship boundaries

- AcademyJourney is a durable per-member, per-programme identity. It survives graduation, enrollment replacements, cancelled applications, repeat cohorts and different locations.
- Enrollment is one attempt/placement in a particular cohort. The historical enrollment row remains available after replacement.
- EnrollmentInstallment and Payments are financial records, not the learner's programme identity.
- AcademyEnrollmentChange is an immutable history of a requested or completed cohort correction. Its snapshot preserves source/target, quoted base price and payment references.
- StudentProgress remains enrollment-scoped; any paid/attended transfer requires controlled mapping and admin review.

## Switch policy

1. Member chooses another open/eligible cohort in the same programme.
2. Backend checks owner, destination mid-entry window, publication and capacity, existing destination placements, installment state and progress.
3. Backend asks payments-service about **all** Academy payment intents, including PENDING and PENDING_REVIEW. A payment initiated without submitted proof is *not* evidence that the bank transfer never happened.
4. If financial activity/progress is present, create a `needs_review` change record. Never delete invoices or move credit automatically.
5. Only for requests with no payment activity or recorded progress, replace cohort enrollment transactionally, preserving the historical attempt and recomputing the published base price. The member returns to a new checkout.

### Shared couple bank transfer

One ₦100,000 bank transfer should be recorded as one external receipt with two explicitly attributed ₦50,000 allocations, each referencing its own member and enrollment. A proof upload is not payment approval. Until both allocations are verified by an admin, no enrollment change may claim the funds as received, and no user must be asked to transfer again automatically. The original VI enrollment's ₦5,000 negotiated discount is not automatically portable to Yaba. The admin should approve/reprice the new package and capture an auditable adjustment.

## Important release limitations

- The current `needs_review` endpoint **records** a review request but intentionally does not complete paid/cohort-attended transfers. Admin review resolution, ledger split of shared receipts, refund/credit postings, receipt notification and payment-intent cancellation require dedicated workflows.
- The initial Journey table identifies one member/programme and the GET read projection groups existing enrollments even before a migration/backfill runs; future cohorts must attach to that identity.
- Do not auto-run DDL until the migration revision graph has been verified against the deployed head.
- The UI shows published cohort price only; discounts remain dependent on payment-service checkout conditions.

## Before release

- Verify Academy Alembic migration head and apply safely.
- Verify service-to-service financial-state call, payment metadata mapping and authorization.
- End-to-end test: no-payment switch, Paystack pending, bank transfer initiated/proof pending, paid installment, progress, full cohort and rapid concurrent requests.
- Add admin resolution for reviewed changes and shared deposit allocation before turning this on for a member who has already transferred money.
- Verify both repos' CI, OpenAPI/types regeneration and no regressions in pending billing.
