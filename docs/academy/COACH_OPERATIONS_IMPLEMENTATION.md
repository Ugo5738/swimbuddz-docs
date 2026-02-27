# Coach Operations Implementation Tasks

**Document Type:** Implementation Roadmap
**Status:** Active
**Created:** February 2026

This document tracks all implementation tasks for the Coach Operations system, including coach grading, cohort scoring, coach dashboard, and agreement signing flow.

---

## Table of Contents

1. [Implementation Status Overview](#implementation-status-overview)
2. [Phase 1: Backend Foundation](#phase-1-backend-foundation)
3. [Phase 2: Coach Profile System](#phase-2-coach-profile-system)
4. [Phase 3: Coach Dashboard](#phase-3-coach-dashboard)
5. [Phase 4: Agreement & Onboarding Flow](#phase-4-agreement--onboarding-flow)
6. [Phase 5: Admin Tools](#phase-5-admin-tools)
7. [Database Migrations](#database-migrations)
8. [Testing Requirements](#testing-requirements)

---

## Implementation Status Overview

| Component | Status | Priority | Notes |
|-----------|--------|----------|-------|
| Cohort Scoring Models | ✅ Complete | P0 | Models added, migration applied |
| Cohort Scoring API | ✅ Complete | P0 | Routes added to academy router |
| Scoring Business Logic | ✅ Complete | P0 | scoring.py created |
| Coach Profile Extension | ✅ Complete | P1 | Grade fields + progression tracking added |
| Coach Grade Management API | ✅ Complete | P1 | Endpoints in members_service coach_router |
| Coach Dashboard Backend | ✅ Complete | P1 | Dashboard + milestone review endpoints |
| Coach Dashboard Frontend | ✅ Complete | P1 | Dashboard page + reviews page implemented |
| Admin Scoring UI | ✅ Complete | P2 | Full scoring workflow page implemented |
| Agreement Model & Endpoints | ✅ Complete | P2 | Model + 4 API endpoints |
| Agreement Signing Frontend | ✅ Complete | P2 | Full page with typed/drawn signatures |
| Coach Onboarding Enhancement | ⏳ Pending | P3 | Integration with agreement check |

---

## Phase 1: Backend Foundation

### ✅ 1.1 Cohort Complexity Scoring (COMPLETE)

**Files Modified:**
- `services/academy_service/models.py` - Added enums and CohortComplexityScore model
- `services/academy_service/schemas.py` - Added scoring schemas
- `services/academy_service/scoring.py` - NEW: Business logic and pay bands
- `services/academy_service/router.py` - Added scoring endpoints

**New Enums:**
- `ProgramCategory` - 7 categories for scoring
- `CoachGrade` - GRADE_1, GRADE_2, GRADE_3

**New Model:**
- `CohortComplexityScore` - Stores scoring for cohorts

**New Endpoints:**
```
POST   /api/v1/academy/scoring/calculate           - Preview score calculation
GET    /api/v1/academy/scoring/dimensions/{category} - Get dimension labels
POST   /api/v1/academy/cohorts/{id}/complexity-score - Create score
GET    /api/v1/academy/cohorts/{id}/complexity-score - Get score
PUT    /api/v1/academy/cohorts/{id}/complexity-score - Update score
DELETE /api/v1/academy/cohorts/{id}/complexity-score - Delete score
POST   /api/v1/academy/cohorts/{id}/complexity-score/review - Mark reviewed
GET    /api/v1/academy/cohorts/{id}/eligible-coaches - Get eligible coaches
```

**Migration Required:** Yes (see Phase: Database Migrations)

---

## Phase 2: Coach Profile System

### ✅ 2.1 Extend Coach Profile Model (COMPLETE)

**Status:** ✅ Complete

**Location:** `services/members_service/models.py`

**Files Modified:**
- `services/members_service/models.py` - Added CoachGrade enum and new fields to CoachProfile
- `services/members_service/coach_schemas.py` - Added grade-related schemas
- `services/members_service/coach_router.py` - Added grade management endpoints

**Added Fields to CoachProfile:**

```python
# Grades by category (all added)
learn_to_swim_grade: Optional[CoachGrade]
special_populations_grade: Optional[CoachGrade]
institutional_grade: Optional[CoachGrade]
competitive_elite_grade: Optional[CoachGrade]
certifications_grade: Optional[CoachGrade]
specialized_disciplines_grade: Optional[CoachGrade]
adjacent_services_grade: Optional[CoachGrade]

# Progression tracking (all added)
total_coaching_hours: int = 0
cohorts_completed: int = 0
average_feedback_rating: Optional[float]

# Credential tracking (added)
first_aid_cert_expiry: Optional[date]
swimbuddz_level: Optional[int]  # Internal certification level (1, 2, 3)
last_active_date: Optional[date]
```

**Tasks:** ✅ All Complete
- [x] Add CoachGrade enum to members_service models
- [x] Add grade columns to coach_profiles table
- [x] Add progression tracking columns
- [x] Add credential columns (first_aid_cert_expiry, swimbuddz_level, last_active_date)
- [x] Update CoachProfile schemas

**Migration Required:** Run Alembic autogenerate for members_service

### ✅ 2.2 Coach Grade Management Endpoints (COMPLETE)

**Status:** ✅ Complete

**Location:** `services/members_service/coach_router.py`

**New Endpoints Added:**
```
GET    /api/v1/coaches/me/grades                      - Get my grades
GET    /api/v1/coaches/me/progression                 - Get my progression stats
GET    /api/v1/admin/coaches/{id}/grades              - Get coach grades (admin)
PUT    /api/v1/admin/coaches/{id}/grades              - Update coach grades (admin)
GET    /api/v1/admin/coaches/eligible/{category}/{grade} - List eligible coaches
```

**New Schemas Added:**
- `CoachGradesResponse` - Full grade response with all categories
- `AdminUpdateCoachGrades` - Admin update payload
- `CoachProgressionStats` - Progression statistics
- `EligibleCoachListItem` - Coach item for eligible list

**Tasks:** ✅ All Complete
- [x] Create grade management endpoints
- [x] Create progression stats endpoint
- [x] Create eligible coaches endpoint

### 2.3 Coach Credential Tracking

**Status:** ⏳ Deferred (using simple fields instead of separate model)

**Implementation Notes:**
Credentials are tracked directly on CoachProfile using simple fields:
- `first_aid_cert_expiry` - Date field
- `cpr_expiry_date` - DateTime field (existing)
- `lifeguard_expiry_date` - DateTime field (existing)
- `swimbuddz_level` - Integer (1, 2, 3)

The `CoachProgressionStats` endpoint includes credential expiry checking.

**Tasks:**
- [x] Add credential expiry fields to model
- [x] Include expiry checking in progression endpoint
- [ ] Add expiry notification system (background task) - Future enhancement

---

## Phase 3: Coach Dashboard

### ✅ 3.1 Backend Endpoints (COMPLETE)

**Status:** ✅ Complete

**Location:** `services/academy_service/router.py`

**Endpoints Implemented:**

```python
# --- Coach Dashboard Endpoints (all implemented) ---

# Overview & Dashboard
GET    /api/v1/academy/coach/me/dashboard        - Dashboard summary ✅
GET    /api/v1/academy/coach/me/earnings         - Earnings history ✅ (existing)

# Cohorts
GET    /api/v1/academy/cohorts/coach/me          - My assigned cohorts ✅ (existing)
GET    /api/v1/academy/coach/me/cohorts/{id}     - Cohort detail with progress ✅

# Students
GET    /api/v1/academy/coach/me/students         - All students across cohorts ✅ (existing)

# Milestone Review
GET    /api/v1/academy/coach/me/pending-reviews  - Pending milestone claims ✅
POST   /api/v1/academy/coach/me/milestone-reviews/{id} - Approve/reject ✅

# Resources
GET    /api/v1/academy/coach/me/resources        - All resources ✅ (existing)
```

**New Schemas Added:**
- `CoachDashboardSummary` - Dashboard home page data
- `UpcomingSessionSummary` - Session preview for dashboard
- `CoachCohortDetail` - Detailed cohort view with progress
- `PendingMilestoneReview` - Milestone claim waiting for review
- `MilestoneReviewAction` - Approve/reject action payload

**Tasks:** ✅ Core Complete
- [x] Create coach dashboard summary endpoint
- [x] Create earnings calculation endpoint (existing)
- [x] Extend cohort endpoints with coach-specific views
- [x] Create milestone review queue endpoint
- [x] Create milestone review action endpoint
- [ ] Add session attendance marking (needs Session model updates)
- [ ] Add session notes functionality (needs Session model updates)
- [ ] Add availability management (deferred)

### ✅ 3.2 Frontend Components (CORE COMPLETE)

**Status:** ✅ Core Complete

**Location:** `swimbuddz-frontend/src/app/coach/`

**Implemented Routes:**
- `/coach/dashboard` - Main dashboard with stats, cohorts, pending reviews ✅
- `/coach/reviews` - Milestone review queue page ✅
- `/coach/cohorts` - My cohorts list (existing)
- `/coach/cohorts/[id]` - Cohort detail (existing)
- `/coach/students` - All students (existing)
- `/coach/students/[enrollmentId]` - Student detail (existing)
- `/coach/payouts` - Earnings/payouts (existing)
- `/coach/resources` - Resource library (existing)

**Files Modified/Created:**
- `src/app/coach/dashboard/page.tsx` - Enhanced with dashboard API, pending reviews section
- `src/app/coach/reviews/page.tsx` - NEW: Full milestone review workflow
- `src/lib/coach.ts` - Added types and API functions for dashboard, grades, reviews

**New Types Added:**
- `CoachGrade`, `ProgramCategory`
- `CoachGrades`, `CoachProgressionStats`
- `CoachDashboardSummary`, `UpcomingSessionSummary`
- `CoachCohortDetail`
- `PendingMilestoneReview`, `MilestoneReviewAction`

**New API Functions Added:**
- `getCoachDashboard()` - Dashboard summary
- `getCoachCohortDetail()` - Detailed cohort view
- `getPendingMilestoneReviews()` - Milestone review queue
- `reviewMilestoneClaim()` - Approve/reject milestone
- `getMyCoachGrades()` - Coach's grades by category
- `getMyCoachProgression()` - Progression stats
- Grade helper functions

**Tasks:** ✅ Core Complete
- [x] Create CoachDashboardOverview component
- [x] Create milestone review workflow UI
- [x] Add pending reviews to dashboard
- [x] Create standalone reviews page
- [ ] Build attendance marking interface (needs Session model)
- [ ] Implement session calendar (deferred)
- [ ] Build availability manager (deferred)
- [ ] Create profile and progression views (deferred)

### 3.3 State Management

**Tasks:**
- [ ] Create coach dashboard context/store
- [ ] Add API hooks for coach endpoints
- [ ] Implement optimistic updates for attendance
- [ ] Add offline support for attendance marking (PWA)

---

## Phase 4: Agreement & Onboarding Flow

### ✅ 4.1 Agreement Storage Model (COMPLETE)

**Status:** ✅ Complete

**Location:** `services/members_service/models.py`

**Model Implemented:**
```python
class CoachAgreement(Base):
    __tablename__ = "coach_agreements"

    id: UUID (PK)
    coach_profile_id: UUID (FK to coach_profiles)
    agreement_version: str  # e.g., "1.0"
    agreement_content_hash: str  # SHA-256 hash of agreement text
    signed_at: datetime
    ip_address: Optional[str]  # IPv6 compatible
    user_agent: Optional[str]

    # Signature
    signature_type: str  # "typed_name" or "drawn"
    signature_data: str  # Typed name or base64 drawing

    # Status
    is_active: bool = True
    superseded_by_id: Optional[UUID]  # Self-referential FK
    superseded_at: Optional[datetime]

    # Timestamps
    created_at, updated_at
```

**Tasks:** ✅ All Complete
- [x] Create CoachAgreement model
- [x] Add model to alembic env.py imports
- [x] Add agreement content versioning system (hash-based)

**Migration Required:** Run `./scripts/db/migrate.sh members_service "add_coach_agreements"`

### ✅ 4.2 Agreement Signing Endpoints (COMPLETE)

**Status:** ✅ Complete

**Location:** `services/members_service/coach_router.py`

**Endpoints Implemented:**
```
GET    /api/v1/coaches/agreement/current   - Get current agreement text ✅
POST   /api/v1/coaches/agreement/sign      - Sign agreement ✅
GET    /api/v1/coaches/agreement/status    - Check if signed ✅
GET    /api/v1/coaches/agreement/history   - Agreement history ✅
```

**Schemas Added to coach_schemas.py:**
- `SignatureTypeEnum` - "typed_name" or "drawn"
- `AgreementContentResponse` - Agreement text with version and hash
- `SignAgreementRequest` - Signature submission
- `CoachAgreementResponse` - Signed agreement response
- `CoachAgreementStatusResponse` - Quick status check
- `CoachAgreementHistoryItem` - Historical agreement record

**Tasks:** ✅ Core Complete
- [x] Create agreement content endpoint
- [x] Implement digital signature capture
- [x] Add agreement status check
- [x] Add agreement history endpoint
- [ ] Generate signed PDF with signature (deferred)
- [ ] Email signed copy to coach (deferred)

### ✅ 4.3 Agreement Signing Frontend (COMPLETE)

**Status:** ✅ Complete

**Location:** `swimbuddz-frontend/src/app/coach/agreement/page.tsx`

**Features Implemented:**
- Agreement content viewer with markdown rendering
- Signature type selector (typed name or drawn)
- Canvas-based drawn signature capture with touch support
- Terms acceptance checkbox
- Agreement history display
- Status banner showing signed/unsigned state

**Files Created/Modified:**
- `src/app/coach/agreement/page.tsx` - NEW: Full agreement signing page
- `src/lib/coaches.ts` - Added agreement types and API functions
- `src/components/layout/CoachLayout.tsx` - Added "Coach Agreement" nav link

**New Types Added:**
- `SignatureType`, `AgreementContent`
- `SignAgreementRequest`, `CoachAgreementResponse`
- `AgreementStatus`, `AgreementHistoryItem`

**New API Functions Added:**
- `AgreementApi.getCurrentAgreement()` - Get agreement text
- `AgreementApi.getAgreementStatus()` - Check if signed
- `AgreementApi.signAgreement()` - Submit signature
- `AgreementApi.getAgreementHistory()` - Get history

**Tasks:** ✅ Core Complete
- [x] Create agreement viewer component
- [x] Implement typed name signature
- [x] Implement drawn signature (canvas)
- [x] Add agreement status banner
- [x] Add signing history
- [x] Add navigation link
- [ ] Integrate with onboarding flow (deferred)
- [ ] Add agreement gating on dashboard (deferred)

### 4.4 Frontend Onboarding Flow Enhancement

**Status:** ⏳ Pending (Future Enhancement)

**Location:** `swimbuddz-frontend/src/app/coach/onboarding/`

**Potential Flow Steps:**
1. Welcome screen with overview
2. Profile completion check
3. **Agreement review and signing** (link to /coach/agreement)
4. Credential verification
5. Training materials acknowledgment
6. Dashboard redirect

**Tasks:**
- [ ] Add agreement status check to onboarding flow
- [ ] Redirect unsigned coaches to agreement page
- [ ] Add agreement gating (can't proceed without signing)

---

## Phase 5: Admin Tools

### ✅ 5.1 Cohort Scoring Admin UI (COMPLETE)

**Status:** ✅ Complete

**Location:** `swimbuddz-frontend/src/app/(admin)/admin/academy/cohorts/[id]/score/`

**Implemented as Single Page:**
The scoring UI is implemented as a single comprehensive page (`page.tsx`) with inline components:
- `CategorySelector` - Select program category with descriptions
- `DimensionScoringForm` - Score all 7 dimensions with rationale inputs
- `ScoreReview` - View total score, grade, pay band, and eligible coaches
- `StepIndicator` - Shows progress through the 3-step flow

**Files Created/Modified:**
- `src/app/(admin)/admin/academy/cohorts/[id]/score/page.tsx` - NEW: Full scoring workflow
- `src/app/(admin)/admin/academy/cohorts/[id]/page.tsx` - Added "Complexity Score" button
- `src/lib/academy.ts` - Added scoring types and API functions

**New Types Added:**
- `ProgramCategory`, `CoachGrade` enums
- `DimensionScore`, `CohortComplexityScoreCreate`
- `CohortComplexityScoreResponse`, `ComplexityScoreCalculation`
- `EligibleCoach`, `DimensionLabels`

**New API Functions Added:**
- `previewComplexityScore()` - Calculate without saving
- `getDimensionLabels()` - Get dimension names for category
- `getCohortComplexityScore()` - Get existing score
- `createCohortComplexityScore()` - Create new score
- `updateCohortComplexityScore()` - Update existing score
- `deleteCohortComplexityScore()` - Remove score
- `markComplexityScoreReviewed()` - Mark as reviewed
- `getEligibleCoaches()` - Get coaches meeting grade requirement

**Tasks:** ✅ All Complete
- [x] Create category selection UI
- [x] Build dynamic dimension scoring form
- [x] Add real-time score preview
- [x] Create eligible coaches display
- [ ] Add scoring audit history view (deferred - basic info shown)

### 5.2 Coach Grade Management Admin UI

**Status:** ⏳ Pending

**Location:** `swimbuddz-frontend/src/app/(admin)/admin/members/coaches/`

**Pages:**
- `/admin/members/coaches` - Coach list with grades
- `/admin/members/coaches/[id]` - Coach detail with grade management
- `/admin/members/coaches/[id]/progression` - Progression review

**Tasks:**
- [ ] Create coach list with grade filters
- [ ] Build grade management interface
- [ ] Create progression review workflow
- [ ] Add credential verification UI

### 5.3 Coach Assignment UI Enhancement

**Status:** ⏳ Pending

**Location:** Existing cohort management pages

**Enhancement:**
When assigning coach to cohort:
1. Show required grade from complexity score
2. Filter coaches by eligibility
3. Show coach's grade and stats
4. Warn if coach doesn't meet requirements

**Tasks:**
- [ ] Enhance coach assignment dropdown
- [ ] Add eligibility filtering
- [ ] Add grade mismatch warning

---

## Database Migrations

### Migration 1: Cohort Complexity Scoring

**Status:** ⏳ Pending (run manually)

**Service:** academy_service

**Changes:**
- Create `program_category_enum` type
- Create `coach_grade_enum` type
- Create `cohort_complexity_scores` table
- Add `required_coach_grade` column to `cohorts` table

**Command:**
```bash
cd swimbuddz-backend
docker-compose exec academy_service alembic revision --autogenerate -m "add_cohort_complexity_scoring"
docker-compose exec academy_service alembic upgrade head
```

### Migration 2: Coach Profile Extension

**Status:** ⏳ Pending

**Service:** members_service

**Changes:**
- Add grade columns (7 category-specific)
- Add progression tracking columns
- Add credential tracking columns

### Migration 3: Coach Agreements

**Status:** ⏳ Pending

**Service:** members_service (or new agreements_service)

**Changes:**
- Create `coach_agreements` table

---

## Testing Requirements

### Unit Tests

**Location:** `swimbuddz-backend/tests/`

**Required Tests:**
- [ ] `test_scoring.py` - Scoring calculation logic
- [ ] `test_cohort_complexity.py` - API endpoints
- [ ] `test_coach_grades.py` - Grade management
- [ ] `test_coach_eligibility.py` - Eligibility checks

### Integration Tests

**Required Tests:**
- [ ] Full scoring workflow (create → calculate → assign coach)
- [ ] Coach onboarding with agreement signing
- [ ] Grade progression workflow

### Frontend Tests

**Required Tests:**
- [ ] Scoring form component tests
- [ ] Agreement signing component tests
- [ ] Coach dashboard component tests

---

## Implementation Order (Recommended)

### Sprint 1: Foundation
1. Run cohort scoring migration
2. Test scoring endpoints
3. Build basic admin scoring UI

### Sprint 2: Coach Profiles
1. Extend coach profile model
2. Run coach profile migration
3. Build grade management endpoints
4. Build grade management admin UI

### Sprint 3: Coach Dashboard
1. Create coach dashboard backend endpoints
2. Build coach dashboard frontend components
3. Implement attendance marking
4. Build milestone review workflow

### Sprint 4: Onboarding
1. Create agreement model and endpoints
2. Build agreement signing UI
3. Integrate into onboarding flow
4. Add email notifications

### Sprint 5: Polish
1. Add comprehensive tests
2. Performance optimization
3. Mobile responsiveness
4. Documentation updates

---

## Related Documentation

- [COACH_OPERATIONS_FRAMEWORK.md](./COACH_OPERATIONS_FRAMEWORK.md) - Master framework
- [COACH_AGREEMENT.md](./COACH_AGREEMENT.md) - Agreement template
- [COHORT_SCORING_TOOL.md](./COHORT_SCORING_TOOL.md) - Scoring documentation
- [COACH_HANDBOOK.md](./COACH_HANDBOOK.md) - Coach-facing guide

---

*Document Owner: Engineering*
*Last Updated: February 2026*
