# Academy Implementation Roadmap

> **Living Document** - Updated regularly as features are implemented.  
> **Reference**: See [ACADEMY_REVIEW.md](./ACADEMY_REVIEW.md) for the full technical audit.

## Context & Decisions

Based on review feedback:

| Decision | Outcome |
|----------|---------|
| Self-enroll admin approval | **NOT NEEDED** - Direct pay-and-go flow. User selects cohort, pays, receives next session info. |
| Enrollment mode | **HYBRID** - Auto-enroll on payment success, but make it **configurable per cohort** |
| Post-enrollment | Implement **onboarding flow** showing next session, resources, how to track progress |
| Already enrolled cohorts | Implement **"View Details"** link/button instead of "Enroll" |

---

## Implementation Strategy

Rather than a strict priority list, this roadmap organizes work into **horizontal slices** - complete end-to-end features that provide value to a specific persona. This approach:

1. **Delivers usable features faster** - Each slice is testable and deployable
2. **Reduces context switching** - Work on related frontend + backend together
3. **Enables incremental rollout** - Can release member improvements while coach work continues

---

## Phase 1: Member Enrollment Experience 🎯

**Goal**: Smooth enrollment journey from cohort discovery to first session.

### Slice 1.1: Cohort Detail View

> Enable members to see cohort details before enrolling, and see "View Enrollment" for already-enrolled cohorts.

**Backend Changes:**
- None required (cohort details already in API response)

**Frontend Changes:**
| File | Change |
|------|--------|
| `src/app/(member)/account/academy/cohorts/[id]/page.tsx` | **NEW** - Cohort detail page showing: coach info, schedule, curriculum preview, price, enroll CTA |
| `src/app/(member)/account/academy/page.tsx` | Update cohort cards: "View Details" → detail page, show "View Enrollment" badge/link if enrolled |
| `src/components/academy/UpcomingCohorts.tsx` | Add "Enrolled" badge logic + "View Details" link |

**Acceptance Criteria:**
- [ ] Member can click cohort card → see detail page with full info
- [ ] If already enrolled, card shows "View Enrollment" instead of "Enroll Now"
- [ ] Detail page shows coach name/bio (if available), schedule, program description

---

### Slice 1.2: Post-Enrollment Onboarding

> After successful payment, show clear next steps instead of just a toast.

**Backend Changes:**
| File | Change |
|------|--------|
| `services/academy_service/router.py` | Add `GET /enrollments/{id}/onboarding` returning: next session, prep materials, dashboard links |

**Frontend Changes:**
| File | Change |
|------|--------|
| `src/app/(member)/account/academy/enrollment-success/page.tsx` | **NEW** - Success page after payment callback |
| `src/app/(member)/account/academy/page.tsx` | Add redirect logic: if just completed payment → show success page first |

**Onboarding Content:**
```markdown
## Welcome to [Program Name]! 🎉

### Your Next Session
📅 [Date/Time] at [Location]
📍 [Address]

### Before Your First Session
- [ ] Review the program curriculum
- [ ] Download prep materials
- [ ] Confirm your availability

### Track Your Progress
View your milestones and coach feedback in your Academy Dashboard.

[Go to My Academy →]
```

**Acceptance Criteria:**
- [ ] After successful payment, member sees onboarding page (not just a toast)
- [ ] Page shows first session details (if scheduled)
- [ ] Clear CTA to go to main academy dashboard

---

### Slice 1.3: Configurable Cohort Approval Mode

> Allow admins to set whether a cohort requires approval or auto-enrolls on payment.

**Backend Changes:**
| File | Change |
|------|--------|
| `services/academy_service/models.py` | Add `require_approval: Mapped[bool]` to Cohort (default False) |
| `services/academy_service/schemas.py` | Add `require_approval` to CohortCreate/Update/Response |
| `services/academy_service/router.py` | In `admin_mark_enrollment_paid`: check `cohort.require_approval` before auto-promoting status |
| Alembic migration | Add column |

**Logic:**
```python
# In admin_mark_enrollment_paid
if enrollment.status == EnrollmentStatus.PENDING_APPROVAL:
    cohort = await db.get(Cohort, enrollment.cohort_id)
    if cohort and cohort.require_approval:
        # Keep PENDING_APPROVAL, only update payment
        pass
    else:
        # Auto-promote to ENROLLED
        enrollment.status = EnrollmentStatus.ENROLLED
```

**Frontend Changes:**
| File | Change |
|------|--------|
| `src/app/(admin)/admin/academy/cohorts/new/page.tsx` | Add "Require Admin Approval" toggle |
| `src/components/academy/EditCohortModal.tsx` | Add toggle to edit modal |

**Acceptance Criteria:**
- [ ] Admin can set "Require Approval" when creating/editing cohort
- [ ] If require_approval=true: payment succeeds but status stays PENDING_APPROVAL until admin approves
- [ ] If require_approval=false: payment auto-promotes to ENROLLED (current behavior)

---

## Phase 2: Coach Experience 👨‍🏫

**Goal**: Enable coaches to manage their assigned cohorts and students.

### Slice 2.1: Coach Auth & Permissions

> Create coach role in auth system.

**Backend Changes:**
| File | Change |
|------|--------|
| `libs/auth/dependencies.py` | Add `require_coach()` and `require_coach_for_cohort()` dependencies |
| `services/members_service/coach_router.py` | On coach approval, add "coach" to `app_metadata.roles` via Supabase Admin API |

**SQL (Supabase):**
```sql
-- On coach approval, admin/system runs:
SELECT auth.admin_update_user(
    '[user_uuid]',
    jsonb_build_object(
        'app_metadata', 
        jsonb_set(
            COALESCE(raw_app_metadata, '{}'::jsonb),
            '{roles}',
            COALESCE(raw_app_metadata->'roles', '[]'::jsonb) || '["coach"]'::jsonb
        )
    )
);
```

**Acceptance Criteria:**
- [ ] When coach is approved, their JWT includes `"coach"` in roles
- [ ] `require_coach` allows coach OR admin
- [ ] `require_coach_for_cohort` validates coach is assigned to that specific cohort

---

### Slice 2.2: Coach Dashboard

> Build the coach dashboard UI.

**Frontend Changes:**
| File | Change |
|------|--------|
| `src/app/coach/account/page.tsx` | **NEW** - Main coach dashboard |
| `src/app/coach/account/layout.tsx` | **NEW** - Coach layout with sidebar |
| `src/app/coach/cohorts/[id]/page.tsx` | **NEW** - Cohort detail with student list |
| `src/app/coach/students/[enrollmentId]/page.tsx` | **NEW** - Individual student progress |
| `src/lib/coach.ts` | **NEW** - Coach-specific API functions |

**Dashboard Sections:**
```
┌─────────────────────────────────────────────┐
│  My Cohorts                                 │
├─────────────────────────────────────────────┤
│  [Cohort A]     [Cohort B]     [Cohort C]   │
│  12 students    8 students     UPCOMING     │
│  3 sessions     2 sessions                  │
│  left           left                        │
├─────────────────────────────────────────────┤
│  Upcoming Sessions                          │
├─────────────────────────────────────────────┤
│  📅 Jan 8 - Cohort A - Week 3 Lesson       │
│  📅 Jan 10 - Cohort B - Week 2 Lesson      │
└─────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Coach sees only their assigned cohorts
- [ ] Can view enrolled students for each cohort
- [ ] Can see upcoming sessions

---

### Slice 2.3: Student Progress Management

> Enable coaches to update student milestones.

**Backend Changes:**
| File | Change |
|------|--------|
| `services/academy_service/router.py` | Change `POST /progress` to use `require_coach_for_cohort` instead of `require_admin` |
| `services/academy_service/router.py` | Change `GET /cohorts/{id}/students` to allow coaches of that cohort |

**Frontend Changes:**
| File | Change |
|------|--------|
| `src/app/coach/students/[enrollmentId]/page.tsx` | Student detail with milestone checklist |
| `src/components/coach/MilestoneCheckbox.tsx` | **NEW** - Toggle milestone complete + add notes |

**Acceptance Criteria:**
- [ ] Coach can view all students in their cohort
- [ ] Coach can mark milestones as achieved
- [ ] Coach can add notes to each milestone
- [ ] Coach CANNOT modify students in cohorts they're not assigned to

---

## Phase 3: Operations Hardening 🔧

**Goal**: Production-ready reliability and safety.

### Slice 3.1: Capacity & Waitlist

> Enforce cohort capacity and enable waitlist.

**Backend Changes:**
| File | Change |
|------|--------|
| `services/academy_service/router.py` | In `self_enroll`: count current enrollments, if >= capacity → set status to WAITLIST |

```python
# In self_enroll, before creating enrollment
enrolled_count_result = await db.execute(
    select(func.count(Enrollment.id)).where(
        Enrollment.cohort_id == cohort_id,
        Enrollment.status.in_([
            EnrollmentStatus.ENROLLED, 
            EnrollmentStatus.PENDING_APPROVAL
        ])
    )
)
enrolled_count = enrolled_count_result.scalar()

if enrolled_count >= cohort.capacity:
    enrollment.status = EnrollmentStatus.WAITLIST
    # Don't create payment intent for waitlisted enrollments
```

**Frontend Changes:**
| File | Change |
|------|--------|
| `src/app/(member)/account/academy/page.tsx` | Show "Join Waitlist" if cohort is at capacity |
| `src/app/(member)/account/academy/page.tsx` | Show "You're #X on waitlist" for waitlisted enrollments |

**Acceptance Criteria:**
- [ ] Cannot over-enroll beyond capacity
- [ ] At-capacity cohorts show "Join Waitlist" instead of "Enroll"
- [ ] Waitlisted members see their position

---

### Slice 3.2: Payment Idempotency

> Prevent double-processing of payments.

**Backend Changes:**
| File | Change |
|------|--------|
| `services/payments_service/router.py` | In `_mark_paid_and_apply`: early return if `payment.status == PAID` |
| `services/payments_service/router.py` | In `paystack_webhook`: log and skip if already processed |

```python
async def _mark_paid_and_apply(...):
    if payment.status == PaymentStatus.PAID:
        logger.info(f"Payment {payment.reference} already processed, skipping")
        return payment
    # ... rest of function
```

**Acceptance Criteria:**
- [ ] Calling webhook twice with same event doesn't process twice
- [ ] Manual verify + webhook arriving later doesn't double-credit

---

### Slice 3.3: Member Payment Verification

> Let members manually trigger verification if webhook delayed.

**Frontend Changes:**
| File | Change |
|------|--------|
| `src/app/(member)/account/academy/page.tsx` | For enrollments with `payment_status=pending`: show "Verify Payment" button |

```typescript
const handleVerifyPayment = async (paymentReference: string) => {
    try {
        await apiPost(`/api/v1/payments/verify/${paymentReference}`, {}, { auth: true });
        toast.success("Payment verified!");
        loadData(); // Refresh
    } catch (e) {
        toast.error("Payment not found or still processing. Try again in a few minutes.");
    }
};
```

**Acceptance Criteria:**
- [ ] After returning from Paystack, if status still shows pending after 5s, show "Verify Payment" button
- [ ] Button triggers verification and updates UI on success

---

## Phase 4: Admin Enhancements 🛠

**Goal**: Streamline admin workflows.

### Slice 4.1: Enrollment Detail & Quick Actions

> Better enrollment management for admins.

**Frontend Changes:**
| File | Change |
|------|--------|
| `src/app/(admin)/admin/academy/enrollments/[id]/page.tsx` | **NEW** - Enrollment detail: member info, payment history, cohort assignment, approve/reject buttons |
| `src/app/(admin)/admin/academy/enrollments/page.tsx` | Add inline "Approve" button for pending enrollments (for cohorts with require_approval=true) |

**Acceptance Criteria:**
- [ ] Admin can view full enrollment details on separate page
- [ ] Can approve/reject from both list view (quick action) and detail view
- [ ] Can assign/change cohort from detail view

---

### Slice 4.2: Coach Assignment Picker

> Replace UUID input with searchable coach picker.

**Frontend Changes:**
| File | Change |
|------|--------|
| `src/components/admin/CoachPicker.tsx` | **NEW** - Searchable dropdown of approved coaches |
| `src/app/(admin)/admin/academy/cohorts/new/page.tsx` | Use CoachPicker instead of text UUID input |
| `src/components/academy/EditCohortModal.tsx` | Use CoachPicker |

**Backend Changes:**
| File | Change |
|------|--------|
| `services/members_service/coach_router.py` | Add `GET /coaches?status=approved` endpoint (may already exist) |

**Acceptance Criteria:**
- [ ] Admin can search coaches by name
- [ ] Shows coach's specialty/bio in dropdown option
- [ ] Stores coach's member_id (UUID) on save

---

## Implementation Tracker

| Slice | Status | Started | Completed | Notes |
|-------|--------|---------|-----------|-------|
| 1.1 Cohort Detail View | ✅ Complete | 2026-01-13 | 2026-01-13 | `/account/academy/cohorts/[id]/page.tsx` with coach info, schedule, curriculum, enroll CTA |
| 1.2 Post-Enrollment Onboarding | ✅ Complete | 2026-01-13 | 2026-01-13 | `/account/academy/enrollment-success/page.tsx` with cohort details, checklist, next session |
| 1.3 Configurable Approval | ✅ Complete | 2026-01-13 | 2026-01-13 | `require_approval` field + migration, toggle in cohort creation form |
| 2.1 Coach Auth | ✅ Complete | 2026-01-12 | 2026-01-12 | Added require_coach(), require_coach_for_cohort() deps; Supabase role update on approval |
| 2.2 Coach Dashboard | ✅ Complete | 2026-01-12 | 2026-01-12 | CoachLayout, /coach/dashboard, /coach/cohorts, /coach/cohorts/[id], lib/coach.ts |
| 2.3 Student Progress Mgmt | ✅ Complete | 2026-01-12 | 2026-01-12 | /coach/students/[enrollmentId], updated backend endpoints for coach access |
| 3.1 Capacity & Waitlist | ✅ Complete | 2026-01-12 | 2026-01-12 | Backend: Capacity check in self_enroll, WAITLIST status, enrollment-stats endpoint, waitlist-position endpoint. Frontend: "Join Waitlist" button, waitlist position banner |
| 3.2 Payment Idempotency | ✅ Complete | 2026-01-12 | 2026-01-12 | Added idempotency checks in _mark_paid_and_apply and paystack_webhook to prevent double-processing |
| 3.3 Member Payment Verify | ✅ Complete | 2026-01-12 | 2026-01-12 | "Verify Payment" button for pending payments, auto-verify on return from Paystack |
| 4.1 Enrollment Detail | ✅ Complete | 2026-01-13 | 2026-01-13 | Enhanced enrollment detail page with payment info, quick approve/reject actions, promote from waitlist. Added inline "Approve" button on enrollments list for paid+pending enrollments |
| 4.2 Coach Picker | ✅ Complete | 2026-01-13 | 2026-01-13 | CoachPicker component with search, GET /admin/coaches endpoint for approved coaches, integrated into cohort creation form |
| 5.1 Coach Students List | ✅ Complete | 2026-01-13 | 2026-01-13 | /coach/students page with search, cohort filter, progress filter |
| 5.2 Coach Schedule | ✅ Complete | 2026-01-13 | 2026-01-13 | /coach/schedule page with list and week view modes, GET /sessions/coach/me endpoint |
| 5.3 Coach Resources | ✅ Complete | 2026-01-13 | 2026-01-13 | /coach/resources page with cohort/type filters, GET /coach/me/resources endpoint |
| 5.4 Coach Notes Interface | ⬜ Deferred | | | Deferred - milestone notes already work via coach_notes field |
| 5.5 Coach Portal Link | ✅ Complete | 2026-01-13 | 2026-01-13 | "Coach Portal" link in MemberLayout footer for users with coach role |
| 5.6 Validate coach_id Assignment | ⬜ Deferred | | | Deferred - CoachPicker already filters to approved coaches |
| 5.7 Coach Payouts/Earnings | ✅ Complete | 2026-01-13 | 2026-01-13 | Earnings card on dashboard, GET /coach/me/earnings endpoint |
| 6.1 Legacy Code Cleanup | ✅ Complete | 2026-01-13 | 2026-01-13 | Deleted /account/coach, updated 4 files to link to /coach/dashboard |

**Legend:** ⬜ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked

---

## Suggested Working Order

For a **single developer** working slice-by-slice:

```
Week 1: Member Enrollment (Phase 1)
├── Day 1-2: Slice 1.1 (Cohort Detail)
├── Day 3-4: Slice 1.2 (Onboarding)
└── Day 5: Slice 1.3 (Configurable Approval)

Week 2: Coach Foundation (Phase 2.1-2.2)
├── Day 1-2: Slice 2.1 (Coach Auth)
└── Day 3-5: Slice 2.2 (Coach Dashboard skeleton)

Week 3: Coach & Ops (Phase 2.3 + Phase 3)
├── Day 1-2: Slice 2.3 (Progress Management)
├── Day 3: Slice 3.2 (Idempotency) + 3.3 (Manual Verify)
└── Day 4-5: Slice 3.1 (Capacity/Waitlist)

Week 4: Admin Polish (Phase 4)
├── Day 1-3: Slice 4.1 (Enrollment Detail)
└── Day 4-5: Slice 4.2 (Coach Picker)
```

**For parallel work** (multiple developers):
- **Dev A**: Member flows (Phase 1 + 3.3)
- **Dev B**: Coach flows (Phase 2)
- **Dev C**: Backend hardening (Phase 3.1, 3.2) + Admin (Phase 4)

---

## Phase 5: Coach Portal Completion 👨‍🏫

**Goal**: Complete all coach portal pages and integrate with member layout.

### Slice 5.1: Coach Students List

> Show all students across all of coach's cohorts.

**Frontend Changes:**
| File | Change |
|------|--------|
| `src/app/coach/students/page.tsx` | **NEW** - List all students with filters (by cohort, progress status) |

**Features:**
- Filter by cohort
- Show progress % per student
- Quick link to student detail page
- Search by name

**Acceptance Criteria:**
- [ ] Coach sees all their students in one list
- [ ] Can filter by cohort
- [ ] Can click to view individual student progress

---

### Slice 5.2: Coach Schedule

> Calendar view of coach's upcoming sessions.

**Backend Changes:**
| File | Change |
|------|--------|
| `services/sessions_service/router.py` | Add `GET /sessions/coach/me` endpoint filtered by cohort's coach_id |

**Frontend Changes:**
| File | Change |
|------|--------|
| `src/app/coach/schedule/page.tsx` | **NEW** - Calendar view using FullCalendar or similar |

**Acceptance Criteria:**
- [ ] Coach sees upcoming sessions for their cohorts
- [ ] Can view session details (time, location, cohort)
- [ ] Can mark attendance (links to attendance service)

---

### Slice 5.3: Coach Resources

> Teaching materials and curriculum access for coaches.

**Frontend Changes:**
| File | Change |
|------|--------|
| `src/app/coach/resources/page.tsx` | **NEW** - Resources page showing curriculum, prep materials per cohort |

**Features:**
- List cohort resources (CohortResource model exists)
- Link to program curriculum
- Download prep materials

**Acceptance Criteria:**
- [ ] Coach can view resources for their cohorts
- [ ] Can access curriculum content
- [ ] Can download materials

---

### Slice 5.4: Coach Notes Interface

> Add notes to students and sessions.

**Backend Changes:**
| File | Change |
|------|--------|
| `services/academy_service/router.py` | Add `POST /cohorts/{id}/session-notes` for per-session notes |

**Frontend Changes:**
| File | Change |
|------|--------|
| `src/app/coach/students/[enrollmentId]/page.tsx` | Add notes section with edit capability |
| `src/components/coach/SessionNotesForm.tsx` | **NEW** - Form for adding session notes |

**Acceptance Criteria:**
- [ ] Coach can add notes to individual student milestones (exists via coach_notes field)
- [ ] Coach can add session-level notes for the cohort
- [ ] Notes are visible to admin

---

### Slice 5.5: Coach Portal Link in Member Layout

> Allow users with coach role to access coach portal from member area.

**Frontend Changes:**
| File | Change |
|------|--------|
| `src/components/layout/MemberLayout.tsx` | Add "Coach Portal" link if user has coach role |
| `src/hooks/useUserRoles.ts` | **NEW** - Hook to check user roles from JWT/Supabase |

**Logic:**
```typescript
// In MemberLayout sidebar
const { hasRole } = useUserRoles();

{hasRole('coach') && (
    <Link href="/coach/dashboard">
        <SidebarItem icon={GraduationCap} label="Coach Portal" />
    </Link>
)}
```

**Acceptance Criteria:**
- [ ] Coaches see "Coach Portal" link in member sidebar
- [ ] Link navigates to /coach/dashboard
- [ ] Non-coaches don't see the link

---

### Slice 5.6: Validate coach_id Assignment

> Ensure coach_id on cohort references a valid approved coach.

**Backend Changes:**
| File | Change |
|------|--------|
| `services/academy_service/router.py` | In create/update cohort: validate coach_id has approved CoachProfile |

```python
# In create_cohort / update_cohort
if cohort_in.coach_id:
    # Verify this member has an approved coach profile
    coach_check = await db.execute(
        select(CoachProfile).where(
            CoachProfile.member_id == cohort_in.coach_id,
            CoachProfile.status.in_(["approved", "active"])
        )
    )
    if not coach_check.scalar_one_or_none():
        raise HTTPException(400, "Invalid coach_id: member is not an approved coach")
```

**Acceptance Criteria:**
- [ ] Cannot assign non-coach member as cohort coach
- [ ] Cannot assign unapproved coach
- [ ] Clear error message if invalid

---

### Slice 5.7: Coach Payouts & Earnings Visibility

> Show coaches their earnings and payout history.

**Backend Changes:**
| File | Change |
|------|--------|
| `services/academy_service/router.py` | Add `GET /coach/me/earnings` endpoint for coach earnings summary |

**Frontend Changes:**
| File | Change |
|------|--------|
| `src/app/coach/dashboard/page.tsx` | Add earnings card with monthly breakdown |
| `src/lib/coach.ts` | Add `getMyCoachEarnings()` function |

**Data Sources:**
- `CoachProfile.academy_cohort_stipend` - per-cohort stipend rate
- `Cohort.coach_id` - link to calculate earnings per cohort
- Calculate: active/completed cohorts × stipend rate

**Acceptance Criteria:**
- [ ] Coach sees current month earnings on dashboard
- [ ] Coach sees earnings breakdown by cohort
- [ ] Coach sees payout history (when payments_service integration exists)
- [ ] Clear messaging when no earnings yet

---

## Phase 6: Cleanup & Consolidation 🧹

**Goal**: Remove legacy code and ensure consistency.

### Slice 6.1: Legacy Code Cleanup

> Remove deprecated `/account/coach` page and update all links to point directly to new coach portal.

**Changes:**
| Task | Details |
|------|---------|
| Delete `/account/coach` | Remove `src/app/(member)/account/coach/page.tsx` entirely |
| Update links | Change any links pointing to `/account/coach` to use `/coach/dashboard` instead |
| Fix CoachLayout nav | Ensure all nav links in CoachLayout point to existing pages |
| Update account page | If account page links to coach dashboard, update the link |

**Files to Modify:**
- `src/app/(member)/account/coach/page.tsx` - **DELETE**
- `src/app/(member)/account/page.tsx` - Update coach link if present
- `src/components/layout/CoachLayout.tsx` - Verify all nav links work
- Any other files linking to `/account/coach`

**Acceptance Criteria:**
- [ ] No 404 errors when navigating coach portal
- [ ] `/account/coach` route no longer exists (deleted, not redirected)
- [ ] All nav links in CoachLayout work
- [ ] All links to coach area point to `/coach/*` routes

---

## Questions to Discuss

1. **Session Scheduling**: Should cohort sessions be scheduled from cohort page or continue using sessions admin? (Currently separate)

2. **Email Notifications**: Which events should trigger emails?
   - Enrollment confirmed ✓ (already implemented)
   - Waitlist promotion
   - Cohort starting reminder (X days before)
   - Session reminder (day before)

3. **Coach Payouts**: Is this needed now or future phase? (CoachProfile has `academy_cohort_stipend` field)

4. **Progress Automation**: Should attendance auto-mark certain milestones? (e.g., "Completed 4 sessions" milestone)
