# Membership and Programme State Model

_Last updated: October 2026_

## Canonical model

SwimBuddz no longer models a person as belonging to one hierarchical "tier".

The system now separates:

- **Annual Membership** — the person's current SwimBuddz membership entitlement.
- **Academy programme** — an independent, time-bounded learning programme.
- **Club programme** — an independent, time-bounded Club entitlement and placement.
- **Programme requests** — pending Academy/Club onboarding or payment states.
- **Club placement** — current Club and Pod assignment, separate from annual Membership.

A person can therefore have multiple programme states at the same time. For
example, someone can have active annual Membership, active Club, and an expired
Academy programme.

## Source of truth

New product logic, admin UI, reporting, and authorization must use dated
programme/entitlement records and the canonical programme projection used on
the Admin Members page.

Do **not** use these legacy compatibility fields as the source of truth for new
logic:

- `primary_tier`
- `active_tiers`
- `requested_tiers`
- `membership_tier`
- `paid_tier` / `paid_tiers`

They remain only where older APIs or persisted data still require compatibility.

### Club

Club state comes from effective `ClubEnrollment` records plus current Club/Pod
placement. Historical reporting should ask whether the Club enrollment
overlapped the reporting period.

A "new Club member" means a swimmer whose **first recorded Club enrollment**
starts in the reporting period. This is independent from retention analysis.

Retention requires a trustworthy preceding-period entitlement baseline. If that
baseline predates the ClubEnrollment model and cannot be reconstructed, report
retention as **N/A**, not 0%.

### Academy

Academy state comes from dated Academy cohort enrollment and progress records.
An expired Academy programme can coexist with active Club.

### Annual Membership

Annual Membership is independent from Club and Academy. Programme access must
not be inferred from annual Membership alone.

## Admin presentation

The Admin Members page is the canonical presentation pattern:

- Membership
- Programmes
- Club / Pod
- Account

Quarterly reporting should use the same language. Do not display a generic
"Tier" column. Historical swimmer reports should show the programme represented
by the swimmer's actual programme commitments/enrollments in that quarter.

## Historical-data rule

When a newer entitlement model does not cover the full historical period:

1. Report metrics that can be supported by current dated records.
2. Mark unsupported historical comparisons as **N/A**.
3. Add a data-quality note explaining the limitation.
4. Never turn missing historical records into zero performance.

## Terminology

Older documents may still use "tier" as commercial shorthand. Treat that word as
legacy language, not the data model. New code and new documentation should use
**Membership**, **Academy programme**, **Club programme**, and **programme state**.
