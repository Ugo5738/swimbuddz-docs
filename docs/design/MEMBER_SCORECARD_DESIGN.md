# Member Swim Scorecard — Product & Architecture Design

- **Status:** Settled & Implemented (November 2026)
- **Owner:** Founder + Engineering
- **Related Decisions:** [`ADR-001`](../DECISIONS.md#adr-001-independent-annual-membership-vs-participation-programmes-club--academy), [`ADR-004`](../DECISIONS.md#adr-004-academy-attendance-defaults-per-student-session-participation--class-consumption), [`ADR-005`](../DECISIONS.md#adr-005-location-first-club-onboarding-readiness-assessment-gate--mobility), [`ADR-009`](../DECISIONS.md#adr-009-academy-knowledge-quizzes-milestone-evidence--coachadmin-review-overrides), [`ADR-010`](../DECISIONS.md#adr-010-modular-academy-curriculum-independent-milestones-drills-lessons--competency-ledger), [`ADR-013`](../DECISIONS.md#adr-013-stroke-lab-ai-video-analyzer--total-immersion-ti-coaching-doctrine), [`ADR-015`](../DECISIONS.md#adr-015-member-identity-audit-membernamechange-self-service-guardrails--softhard-delete), [`ADR-026`](../DECISIONS.md#adr-026-member-swim-scorecard--progressive-multi-stroke-progression-3-tier-trust-model--audience-scoped-visibility)
- **Related Docs:** [`docs/company/ABOUT_SWIMBUDDZ.md`](../company/ABOUT_SWIMBUDDZ.md), [`docs/company/ADULT_LEARNING_PRINCIPLES.md`](../company/ADULT_LEARNING_PRINCIPLES.md), [`swimbuddz-backend/docs/QUARTERLY_REPORTING_METRICS.md`](../../swimbuddz-backend/docs/QUARTERLY_REPORTING_METRICS.md)

---

## 1. Product Philosophy & Goals

SwimBuddz is an **Athletic Identity System** across three independent participation layers (`Community`, `Academy`, `Club` — `ADR-001`). Previously, a swimmer's progress was fragmented across Quarterly Reports (attendance/streaks), Academy milestones, Club Readiness assessments, Stroke Lab video diagnostics, and Volunteer tiers.

The **Member Swim Scorecard** creates one always-on, living **Swim Passport** answering *"What can I do in the water today, how efficiently am I swimming, and how far have I come?"*:

1. **Universal with Progressive Depth (Everyone, Not Club-Only):**
   - Every active member owns a living Swim Scorecard tied to `member_id` so their timeline carries seamlessly from **Community → Academy → Club** (*Before → After*).
   - Progressive disclosure ensures beginners see **Water Foundations & Safety** first without being intimidated by empty `Butterfly` or `400m Pace` boxes.
   - **Club Performance Perk:** Every member gets Foundations, the 6-domain Stroke & Sub-Skills Matrix, headline max-distance logging, Stroke Lab AI snapshots, and Consistency/Community stats. Active **Club members** (verified via dated `ClubEnrollment` / `has_current_club_access` per `ADR-001`), **Coaches**, and **Admins** unlock full **Performance & Efficiency Benchmarks** (`time_trial`, `spl`, `stroke_rate`, `swolf`, `open_water`), longitudinal trend charts, and **Coach/Pod-Lead Verified Benchmark Days**.
2. **Efficiency Over Speed & Zero Punitive Grades:**
   - Aligned with [ADULT_LEARNING_PRINCIPLES.md](../company/ADULT_LEARNING_PRINCIPLES.md) and Total Immersion (`ADR-013`), the scorecard NEVER collapses a swimmer into a single 0–100 score or letter grade.
   - Skills use four encouraging stages (`not_started` → `learning` → `confident` → `mastered`), and performance highlights **Strokes Per Length (SPL)**, **SWOLF**, **Stroke Rate (SPM)**, and **Relaxed Continuous Distance** alongside time trials.
3. **Clear Boundary with Quarterly Reports:**
   - **Swim Scorecard (`/account/scorecard`)** = Living, all-time capability & progression identity (*"Who I am in the water today"*).
   - **Quarterly Reports (`/account/reports`)** = Time-boxed periodic activity recap (*"How Q4 2026 went"*).

---

## 2. The Four Layers of the Scorecard

### Layer 1: Water Foundations & Safety (`foundations`)
Always visible for every swimmer. Includes safety-gated competencies (`is_safety_gate=true`) such as **30s Deep-Water Treading** and **25m Continuous Survival Swim**.
- Automatically projects verified status when a member passes a `ClubReadinessAssessment` (`club_ready` or `club_ready_modified`), so Club swimmers never start with empty foundations.

### Layer 2: Multi-Stroke & Sub-Skills Matrix (All 6 Domains, 34 Canonical Skills)
1. **Water Foundations & Safety** (`foundations` — 7 skills)
2. **Freestyle / Front Crawl** (`freestyle` — 8 TI-aligned skills)
3. **Backstroke** (`backstroke` — 5 skills)
4. **Breaststroke** (`breaststroke` — 4 skills)
5. **Butterfly** (`butterfly` — 5 skills)
6. **Turns, Starts & Open Water** (`advanced_skills` — 5 skills)

### Layer 3: Performance & Efficiency Benchmarks (Pool-Length Aware)
Every lap-based metric captures `pool_length_m` (optionally linked to `pools_service.pools.id` and `pool_name`) so Lagos venues of different lengths (12.5m, 15m, 20m, 25m, 50m) are never conflated:
- **`max_distance`** — Longest continuous swim per stroke (meters)
- **`time_trial`** — Timed distance swims (25m, 50m, 100m, 200m, 400m, 1000m, custom) with server-computed `pace_per_100m_seconds`
- **`spl`** — Strokes Per Length (`stroke_count`, requires `pool_length_m`; auto-computes `swolf_score` if single-length `duration_seconds` is also supplied)
- **`stroke_rate`** — Stroke Rate in Strokes Per Minute (`stroke_rate_spm`)
- **`swolf`** — Single-length efficiency (`duration_seconds + stroke_count`, requires `pool_length_m`)
- **`open_water`** — Open water distance, duration, auto-computed pace/100m, venue & conditions
- **Stroke Lab AI Mechanics** — Live read from `ai_service` (`stroke_rate_spm`, `body_roll_proxy_degrees`, `breath_balance_left_ratio`, TI focus area, summary)

### Layer 4: Consistency & Community Strip
Live cross-service enrichment (with graceful `source_availability` flags — never fabricating zeros when a downstream service is unreachable):
- **Academy:** Achieved milestones, in-progress milestones, certificates earned, completed cohorts (`academy_service`).
- **Consistency:** Total recorded swims, scheduled pool hours, longest/current streak, punctuality (`reporting_service`).
- **Community:** Volunteer tier, recognition tier, volunteer hours (`volunteer_service`), rides shared & events attended (`reporting_service`).

---

## 3. Three-Tier Trust & Verification Model

| Tier (`verification_source`) | How it is created | Invariants |
| :--- | :--- | :--- |
| **`self_logged`** | Member logs their own skill proficiency or personal benchmark | Never overwrites or downgrades a `coach_verified` baseline (`verified_proficiency` is preserved). Never unlocks safety gates (`is_safety_gate=true`), Club Readiness (`ADR-005`), or Academy graduation (`ADR-010`). Can optionally be flagged `pending_review` for Coach/Pod Lead verification. |
| **`strokelab_ai`** | Automatically projected from completed `ai_service` Stroke Lab analyses | Read-only derived diagnostics; never exposes private video storage paths or signed URLs to non-owners. |
| **`coach_verified`** | Auto-projected from passed `ClubReadinessAssessment` & approved Academy milestones, OR explicitly verified/recorded by an **Admin**, **Coach**, or **Pod Lead** (strictly scoped to active members of Pods they lead) | Records `verified_by_member_id`, `verified_by_role`, `verified_at`, and private `verifier_notes`. Members cannot delete `coach_verified` benchmarks. |

---

## 4. Audience-Scoped Visibility & Privacy Matrix

Enforced server-side via `project_scorecard_for_viewer`:

| Viewer Audience | Skills & Matrix | Benchmarks & Trends | Stroke Lab AI & Verifier Notes | Consistency & Community |
| :--- | :--- | :--- | :--- | :--- |
| **Self (Member)** | Full access + self-edit | Full access (Club-gated writes for advanced benchmark types) | Full private access | Full private access |
| **Coach / Admin** | Full access + verify/reject | Full access + log verified / batch Benchmark Day | Full access (no raw video URLs on scorecard) | Full access |
| **Pod Lead / Asst. Pod Lead** *(strictly for active members of Pods they actively lead, with active Club access)* | Full access + verify/reject | Full access + log verified / batch Benchmark Day | Verifier notes visible; raw Stroke Lab private findings excluded | Summary access |
| **Pod-Mate** *(shares an active Pod + target has `pod_visibility_enabled=true`)* | **Verified positive highlights only** (verified strokes unlocked, Club Ready badge). No `learning`/`not_started` skills. | Only verified distance/pace highlights if target also enables `show_benchmarks_to_pod=true`. | **Never visible** | Positive badges only (no attendance % or punctuality) |
| **Public Share Link (`/scorecard/[token]`)** *(strictly opt-in: `public_share_card_enabled=true`, default `false`, revocable/rotatable token)* | **Verified positive highlights only** (verified strokes unlocked, verified skills count, Club Ready badge) | Headline verified max distance only (no raw log table or notes) | **Never visible** | Lifetime pool hours / swims highlight & volunteer tier only |
| **Unrelated Member / Unauthenticated** | **403 Forbidden** (or 404 on invalid/disabled share token) | **403 Forbidden** | **403 Forbidden** | **403 Forbidden** |

---

## 5. Service Ownership, Database Schema & API Surface

### Ownership: `members_service`
Three new tables owned by `members_service` (all cascading cleanly on `Member` hard delete per `ADR-015`):
1. `member_skill_progress` — Per `(member_id, skill_code)` proficiency, lossless `verified_proficiency` snapshot, verification status, notes, reviewer attribution.
2. `member_swim_benchmarks` — Pool-length-aware performance & efficiency entries with server-computed pace/100m and SWOLF, trust tier, session/benchmark-day metadata, reviewer attribution.
3. `member_scorecard_settings` — Per-member audience visibility toggles, preferred pool length, and revocable `share_token`.

### Internal Cross-Service Read Endpoints (`require_service_role`)
- `academy_service`: `GET /internal/academy/members/{member_auth_id}/scorecard-summary`
- `ai_service`: `GET /internal/ai/members/{member_auth_id}/strokelab-summary`
- `reporting_service`: `GET /internal/reporting/members/{member_auth_id}/scorecard-summary`
- `volunteer_service`: `GET /internal/volunteer/members/{member_id}/scorecard-summary`

### Gateway-Proxied Endpoints (`/api/v1/scorecards/*` → `members_service`)
- `GET /scorecards/catalog` — Canonical skill domains, skills, benchmark types, strokes
- `GET /scorecards/me` — Full member scorecard
- `PUT /scorecards/me/skills/{skill_code}` — Self-log/update skill + optional review request
- `POST /scorecards/me/benchmarks` — Log personal benchmark (progressive Club gating on advanced types)
- `DELETE /scorecards/me/benchmarks/{benchmark_id}` — Delete own unverified self-logged benchmark
- `PATCH /scorecards/me/settings` — Update privacy toggles / rotate share token
- `GET /scorecards/public/{share_token}` — Public opt-in highlight card (no auth)
- `GET /scorecards/members/{member_id}` — Audience-scoped member scorecard read
- `GET /scorecards/pod/{pod_id}` — Pod roster overview (peer-sanitized for Pod-mates, full for Pod Leads/Coaches/Admins)
- `GET /scorecards/review-queue` — Pending skills & benchmarks for Coaches, Admins, and Pod Leads (scoped to led Pods)
- `GET /scorecards/roster` — Searchable swimmer scorecard roster for Coaches, Admins, and Pod Leads
- `POST /scorecards/members/{member_id}/skills/{skill_code}/verify` — Verify or reject a swimmer's skill
- `POST /scorecards/members/{member_id}/benchmarks` — Log a `coach_verified` benchmark for a swimmer
- `POST /scorecards/benchmarks/{benchmark_id}/review` — Approve or reject a pending self-logged benchmark
- `POST /scorecards/benchmark-day/batch` — Batch-record verified benchmarks for a Club Benchmark Day session

### Frontend Routes
- `/account/scorecard` — Member Swim Scorecard (all 4 layers, self-logging, trend charts, privacy & share controls)
- `/account/pod-lead/scorecards` — Pod Lead verification & Club Benchmark Day workspace
- `/coach/scorecards` — Coach verification, roster & Benchmark Day workspace
- `/admin/scorecards` — Admin verification, roster & Benchmark Day workspace
- `/scorecard/[token]` — Public opt-in shareable Swim Scorecard highlight page
