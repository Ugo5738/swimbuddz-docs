# Academy Layer Documentation

Documentation for the **Academy Layer** - formal swim education with cohort-based programs.

---

## Overview

The Academy Layer provides structured swim education through cohort-based programs with formal curriculum, milestone tracking, and certificates. Students progress through defined learning paths with coaches and peers.

### Key Characteristics

- **Cohort-Based** - Students enrolled in fixed-duration programs with start/end dates
- **Curriculum-Driven** - Structured learning modules and milestone progression
- **Formal Assessment** - Milestone claims, coach reviews, certificates
- **Enrollment Management** - Capacity limits, waitlists, enrollment periods
- **Certificate Completion** - Students receive certificates upon program completion

---

## Related Services

| Service | Purpose |
|---------|---------|
| **Academy Service** | Programs, cohorts, enrollment, curriculum, progress tracking |
| **Payments Service** | Program fees, enrollment payments |
| **Members Service** | Student profiles, coach profiles |
| **Communications Service** | Enrollment notifications, cohort announcements |
| **Media Service** | Milestone evidence (photos/videos) |

---

## Documentation Files

### Architecture & Review

- **[ACADEMY_REVIEW.md](./ACADEMY_REVIEW.md)** - Complete architecture review and implementation status

### Coach Operations (NEW)

- **[COACH_OPERATIONS_FRAMEWORK.md](./COACH_OPERATIONS_FRAMEWORK.md)** - **Master framework** covering coach engagement, program complexity grading, compensation, and progression pathways
- **[COACH_AGREEMENT.md](./COACH_AGREEMENT.md)** - Legal agreement template for coach independent contractors
- **[COHORT_SCORING_TOOL.md](./COHORT_SCORING_TOOL.md)** - Manual forms and system integration spec for scoring program/cohort complexity
- **[COACH_HANDBOOK.md](./COACH_HANDBOOK.md)** - Coach-facing operational guide with system integration spec

### Planned Documentation

- **ACADEMY_CURRICULUM.md** - Curriculum design, module structure, milestone definitions
- **ACADEMY_ENROLLMENT.md** - Enrollment process, payment, waitlist management
- **ACADEMY_CERTIFICATES.md** - Certificate generation, verification, delivery

---

## Core Concepts

### Programs

Programs define the curriculum and structure for a learning track.

**Examples:**
- Learn to Swim (Beginners)
- Stroke Refinement (Intermediate)
- Advanced Techniques (Advanced)
- Open Water Swimming
- Triathlon Preparation

**Key Fields:**
- Title, description, level (beginner/intermediate/advanced)
- Duration (arbitrary, defined per program)
- Price
- Curriculum (modules and milestones)
- Prerequisites

### Cohorts

Cohorts are instances of programs with specific start/end dates and enrolled students.

**Status Lifecycle:**
- `DRAFT` - Being set up, not visible to students
- `OPEN` - Accepting enrollments
- `ACTIVE` - Program has started, in progress
- `COMPLETED` - Program finished
- `CANCELLED` - Cancelled before completion

**Key Fields:**
- Name (e.g., "Batch 5", "Jan 2026 Cohort")
- Start date, end date
- Capacity (max students)
- Enrollment open/close dates
- Assigned coach

### Enrollment

Students enroll in specific cohorts (not programs directly).

**Enrollment Flow:**
1. Student browses programs
2. Views available cohorts for program
3. Enrolls in specific cohort
4. Makes payment
5. Receives confirmation and onboarding info

**Status:**
- `PENDING` - Awaiting payment confirmation
- `ACTIVE` - Fully enrolled, attending
- `WITHDRAWN` - Student withdrew
- `COMPLETED` - Finished program

### Milestones

Milestones are learning objectives students must achieve.

**Milestone Claim Flow:**
1. Student claims they achieved milestone
2. Provides evidence (text, photo, video)
3. Coach reviews claim
4. Coach approves or requests revision
5. Approved milestones count toward completion

**Status:**
- `NOT_STARTED` - Not attempted yet
- `IN_PROGRESS` - Student working on it
- `CLAIMED` - Awaiting coach review
- `APPROVED` - Coach approved
- `NEEDS_REVISION` - Coach requested changes

---

## Key Differences from Community/Club

| Aspect | Community | Club | Academy |
|--------|-----------|------|---------|
| **Commitment** | Drop-in | Regular attendance | Cohort-based enrollment |
| **Cost** | Low/Pay-per-event | Membership + session fees | Program fees |
| **Structure** | Informal | Structured training | Formal curriculum |
| **Goals** | Social, fitness | Performance improvement | Skill acquisition |
| **Attendance** | Optional | Tracked, consequences | Required, tracked |
| **Duration** | Event-based | Ongoing membership | Fixed program duration |
| **Assessment** | None | Informal | Formal milestones & certificates |

---

## Frontend Routes

### Public Routes
- `/academy` - Academy overview, program listings
- `/academy/programs/[id]` - Program details, cohort availability
- `/coaches/[id]` - Coach profile (planned)

### Member Routes
- `/account/academy` - Student dashboard
- `/account/academy/enrollments` - My enrollments
- `/account/academy/programs/[id]` - Program progress dashboard
- `/account/academy/programs/[id]/milestones` - Milestone tracking
- `/account/academy/programs/[id]/cohort` - Cohort info and members

### Admin Routes
- `/admin/academy/programs` - Manage programs
- `/admin/academy/programs/create` - Create program
- `/admin/academy/programs/[id]` - Edit program, view cohorts
- `/admin/academy/programs/[id]/cohorts/create` - Create cohort
- `/admin/academy/cohorts/[id]` - Manage cohort, view enrollments
- `/admin/academy/cohorts/[id]/progress` - Student progress tracking
- `/admin/academy/enrollments` - All enrollments dashboard
- `/admin/academy/milestone-claims` - Review milestone claims

---

## API Endpoints

See [API_ENDPOINTS.md](../../swimbuddz-backend/API_ENDPOINTS.md#7-academy-33-endpoints) for complete API reference.

**Program Management (33+ endpoints):**
- Programs: CRUD operations
- Cohorts: Create, manage, status transitions
- Curriculum: Modules and milestones
- Enrollment: Create, payment, completion
- Progress: Milestone claims, coach reviews

---

## Implementation Status

**✅ Production Ready (with gaps):**

The Academy service is production-ready with 20,332 lines of models and 33+ endpoints. However, some features are not yet implemented:

### Implemented ✅
- Program and cohort management
- Enrollment with payment tracking
- Curriculum and milestone definitions
- Milestone claim and review workflow
- Automated cohort status transitions
- Post-enrollment onboarding flow
- Student progress tracking
- Admin management interfaces

### Gaps (Not Implemented) ⚠️
- Coach dashboard and coaching tools
- Capacity enforcement (backend validation exists, not enforced)
- Waitlist automation
- Enrollment notification emails
- Certificate generation and delivery
- Mid-entry logic refinement
- Coach profile pages (public)

See [ACADEMY_REVIEW.md](./ACADEMY_REVIEW.md) for detailed analysis.

---

## User Flows

### Student Enrollment Flow

1. Browse programs at `/academy`
2. Click program → `/academy/programs/[id]`
3. View cohorts and select one
4. Enroll and make payment
5. Receive onboarding info
6. Access program dashboard

See [UI_FLOWS.md](../../swimbuddz-frontend/UI_FLOWS.md#8-member--enroll-in-academy-program) for detailed flow.

### Milestone Progress Flow

1. Student accesses program dashboard
2. Views curriculum and milestones
3. Claims milestone with evidence
4. Coach receives notification
5. Coach reviews and approves/revises
6. Milestone marked complete

### Cohort Creation Flow (Admin)

1. Admin navigates to program
2. Clicks "Create Cohort"
3. Sets name, dates, capacity, coach
4. Opens enrollment period
5. Students begin enrolling
6. Cohort transitions: OPEN → ACTIVE → COMPLETED

See [UI_FLOWS.md](../../swimbuddz-frontend/UI_FLOWS.md#9-admin--manage-academy-programs--cohorts) for detailed flow.

---

## Database Models

### Core Tables

- `programs` - Program definitions
- `cohorts` - Program instances
- `enrollments` - Student enrollments
- `curriculum_modules` - Learning modules
- `program_milestones` - Learning objectives
- `student_milestone_progress` - Progress tracking
- `milestone_claims` - Student claims with evidence
- `onboarding_info` - Post-enrollment onboarding data

See [Academy Service README](../../swimbuddz-backend/services/academy_service/README.md) for complete model definitions.

---

## Related Documentation

- **[ACADEMY_REVIEW.md](./ACADEMY_REVIEW.md)** - Complete architecture and status review
- [SERVICE_REGISTRY.md](../reference/SERVICE_REGISTRY.md) - Academy service overview
- [API_ENDPOINTS.md](../../swimbuddz-backend/API_ENDPOINTS.md) - Academy API reference
- [ROUTES_AND_PAGES.md](../../swimbuddz-frontend/ROUTES_AND_PAGES.md) - Academy routes
- [UI_FLOWS.md](../../swimbuddz-frontend/UI_FLOWS.md) - Academy user flows
- [Academy Service README](../../swimbuddz-backend/services/academy_service/README.md) - Service details

---

*Last updated: February 2026*
