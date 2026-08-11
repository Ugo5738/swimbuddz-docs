# SwimBuddz Pod Roster Design

_Status: operating and product design_

_Last updated: August 11, 2026_

## Purpose

The pod roster is the authoritative view of who belongs to a Club pod during a
quarter. It supports staffing, capacity, privacy, transfers, and the pod's
three-month review. It is not the same thing as a session attendance sheet:

- the roster answers **who belongs to this pod now and how did they get here?**
- attendance answers **who attended a particular official session?**
- Club payment answers **does this member currently have a valid Club
  entitlement?**

These records should be joined in the admin experience without duplicating
their sources of truth.

## Existing Foundation

The system already has the correct core model:

- `pods` stores the Club, lead, optional assistant, visibility, capacity,
  default schedule, cycle dates, and status;
- `pod_assignments` stores active and historical membership with `joined_at`,
  `left_at`, and assignment source;
- one member can have only one active pod assignment;
- add, remove, transfer, extend, rebalance, and dissolve flows already preserve
  assignment history;
- the admin pod detail page already renders active members and management
  actions.

The next step is to treat that member section explicitly as the **Pod roster**
and enrich it with operational context. A new competing roster table is not
needed.

## Admin Roster View

### Pod header

Show these before the member rows:

| Field | Why it matters |
|---|---|
| Club and pod name/handle | Establishes identity and ownership |
| Visibility | Makes public/private handling explicit |
| Default pool and schedule | Shows where and when the pod normally trains |
| Cycle start and review due date | Keeps the quarterly operating rhythm visible |
| Lead and assistant | Clarifies responsibility |
| Active members / capacity | Makes open slots and over-capacity errors obvious |
| Pod status | Active, review due, or inactive |

### Active roster columns

| Column | Source | Treatment |
|---|---|---|
| Member | Members service | Full identity for authorized admins; never public for private pods |
| Pod role | Pod + assignment | Lead, Assistant Lead, or Member |
| Joined | Pod assignment | Date and source: admin, self, or lead transfer |
| Club access | Payments/entitlements | Active, grace, expiring, or action required; do not store payment state on the pod |
| Attendance | Sessions service | Quarter-to-date attended/official sessions, with a link to detail |
| Lane/pace band | Future member/pod profile | Optional operational grouping; not a public ranking |
| Media/privacy | Existing consent profile | Show only the minimum actionable state; do not copy sensitive data into assignments |
| Actions | Pod API | Transfer, remove, assign lead/assistant where authorized |

Do not show a member as unpaid merely because an event has a fixed attendee
price. Counted Club sessions are `included`; event tickets and Club
entitlements are separate commercial records.

## Historical Roster

Keep former assignments in a collapsed history section with joined date, left
date, assignment source, and destination pod when the change was a transfer.
This makes quarter reviews and disputes auditable. Never delete an assignment
to represent a move.

## Capacity And Waitlist

For the initial release, capacity is `active assignments / max_size` and the
admin can see available members in the existing add-member picker. Add a
formal waitlist only when self-selection demand requires queue order,
notifications, expiry, and acceptance deadlines. Until then, a generic notes
field or an external list is less risky than pretending every interested
member has a guaranteed place.

When a waitlist is implemented, it should be a separate lifecycle object, not
an active `pod_assignment`. Suggested states are `waiting`, `offered`,
`accepted`, `expired`, and `withdrawn`.

## Private And Elite Pod Rules

- The public website may show only a neutral Club/location signal and should
  not expose the roster, handle, exact venue, or attendee count by default.
- Only assigned members and authorized admins can see the roster.
- Media consent must be checked per person before photos or names are shared.
- Admin exports should be permission-gated and logged.
- Member-facing roster visibility should be configurable: full first names,
  chosen display names, or no peer roster for identity-sensitive pods.
- Attendance and performance comparisons should remain private unless every
  affected member has opted in.

## Quarter Review Workflow

Seven days before `review_due_at`, create an admin review task:

1. Check lead/assistant continuation.
2. Review active Club access and unresolved payment actions.
3. Review attendance, capacity, and member transfer requests.
4. Decide continue, rebalance, or dissolve.
5. Record transfers by closing old assignments and creating new assignments.
6. Extend the pod cycle only after the roster is confirmed.

The annual calendar can show an internal pod-review operation at each quarter
end, but private pod names and member details must never enter the public
calendar.

## Recommended Delivery Order

1. Rename the current admin member section to **Pod roster** and retain its
   add/remove/transfer actions.
2. Add assignment source, Club access summary, and quarter attendance summary
   to the roster response/read model.
3. Add historical assignments and a review checklist to the pod detail page.
4. Add privacy-aware member-facing roster access.
5. Add a formal waitlist only after the operating rules and demand justify it.

## Related Documentation

- [Pod Operations](./POD_OPERATIONS.md)
- [Pod Lead Guide](./POD_LEAD_GUIDE.md)
- [Session Costing and Location Pricing](./SESSION_COSTING_AND_LOCATION_PRICING.md)
- [Annual Activity Calendar](../community/ANNUAL_ACTIVITY_CALENDAR.md)
- [Tier Boundary Policy](../community/TIER_BOUNDARY_POLICY.md)
