# SwimBuddz Academy: Cohort Scoring Tool

**Purpose:** Standardized tool for scoring program/cohort complexity to determine required coach grade and compensation band.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Manual Scoring Form](#2-manual-scoring-form)
3. [Scoring Instructions](#3-scoring-instructions)
4. [Category-Specific Forms](#4-category-specific-forms)
5. [System Integration Specification](#5-system-integration-specification)
6. [Examples](#6-examples)

---

## 1. Overview

### 1.1 Purpose

The Cohort Scoring Tool provides a standardized method for:
- Determining the complexity of any program or cohort
- Identifying the required coach grade
- Setting the appropriate compensation band
- Ensuring consistent assignments across SwimBuddz

### 1.2 When to Use

Score a cohort when:
- Creating a new program
- Setting up a new cohort for an existing program
- Reviewing or updating an existing cohort's requirements
- Assigning coaches to cohorts
- Resolving compensation questions

### 1.3 Who Uses This Tool

| Role | Usage |
|------|-------|
| Academy Manager | Score new programs and cohorts |
| Head Coach | Review and validate scores |
| Operations Manager | Audit scores for consistency |
| System | Automated scoring when creating cohorts (future) |

### 1.4 Scoring Flow

```
┌─────────────────────────────────────────┐
│     1. IDENTIFY PROGRAM CATEGORY        │
│     (Select 1 of 7 categories)          │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│     2. COMPLETE CATEGORY FORM           │
│     (Score 7 dimensions, 1-5 each)      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│     3. CALCULATE TOTAL SCORE            │
│     (Sum of all dimension scores)       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│     4. DETERMINE COACH GRADE            │
│     7-14 = Grade 1                      │
│     15-24 = Grade 2                     │
│     25-35 = Grade 3                     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│     5. IDENTIFY PAY BAND                │
│     (Grade × Category adjustment)       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│     6. RECORD AND ASSIGN                │
│     (Save to system, assign coach)      │
└─────────────────────────────────────────┘
```

---

## 2. Manual Scoring Form

### 2.1 Cohort Information Header

Complete this section for every cohort:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    SWIMBUDDZ COHORT SCORING FORM                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Program Name: _______________________________________________________      ║
║                                                                              ║
║  Cohort Name/ID: ____________________________________________________       ║
║                                                                              ║
║  Location: __________________________________________________________       ║
║                                                                              ║
║  Start Date: ________________    End Date: ________________                  ║
║                                                                              ║
║  Duration: _______ weeks (_______ 4-week blocks)                             ║
║                                                                              ║
║  Learner Capacity: _______                                                   ║
║                                                                              ║
║  Scorer Name: ________________________   Date: ________________              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

### 2.2 Category Selection

Select ONE category that best describes this program:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                         STEP 1: SELECT CATEGORY                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  [ ] 1. LEARN-TO-SWIM (CORE)                                                 ║
║      Age-segmented programs: water confidence to fitness swimming            ║
║      Examples: Adult beginner, Kids freestyle, Senior aquatics               ║
║                                                                              ║
║  [ ] 2. SPECIAL POPULATIONS                                                  ║
║      Adaptive programs for specific needs                                    ║
║      Examples: Disability, rehab, prenatal, trauma recovery                  ║
║                                                                              ║
║  [ ] 3. INSTITUTIONAL PROGRAMS                                               ║
║      Programs for organizations                                              ║
║      Examples: Schools, corporates, military, hotels                         ║
║                                                                              ║
║  [ ] 4. COMPETITIVE & ELITE TRACK                                            ║
║      Performance-focused training                                            ║
║      Examples: Club swimming, national squad, Olympic prep                   ║
║                                                                              ║
║  [ ] 5. CERTIFICATIONS                                                       ║
║      Credential programs                                                     ║
║      Examples: Lifeguard, instructor, first aid, SwimBuddz levels            ║
║                                                                              ║
║  [ ] 6. SPECIALIZED DISCIPLINES                                              ║
║      Sport-specific training                                                 ║
║      Examples: Diving, water polo, synchro, triathlon, survival              ║
║                                                                              ║
║  [ ] 7. ADJACENT SERVICES                                                    ║
║      Related aquatic services                                                ║
║      Examples: Aqua fitness, therapy, camps, travel programs                 ║
║                                                                              ║
║  Selected Category: ______________________________________                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 3. Scoring Instructions

### 3.1 General Guidelines

1. **Be honest and consistent** - Score based on actual requirements, not aspirations
2. **Use the scale definitions** - Refer to the scale descriptions for each dimension
3. **Consider worst-case scenarios** - If uncertainty exists, score higher for safety
4. **Document rationale** - Note any unusual factors in the comments section
5. **Seek validation** - Have a second person review scores for new program types

### 3.2 Score Scale

| Score | Meaning |
|-------|---------|
| 1 | Low complexity / minimal requirement |
| 2 | Below average complexity |
| 3 | Average / moderate complexity |
| 4 | Above average complexity |
| 5 | High complexity / maximum requirement |

### 3.3 Grade Thresholds

| Total Score (7-35) | Coach Grade | Description |
|--------------------|-------------|-------------|
| 7-14 | Grade 1 – Foundational | Entry-level, standard conditions |
| 15-24 | Grade 2 – Technical | Moderate complexity, skill-intensive |
| 25-35 | Grade 3 – Advanced/Specialist | High complexity, specialized |

---

## 4. Category-Specific Forms

### 4.1 Category 1: Learn-to-Swim (Core)

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                 CATEGORY 1: LEARN-TO-SWIM (CORE)                             ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  DIMENSION 1: AGE GROUP COMPLEXITY                                           ║
║  ────────────────────────────────────────────────────────────────────────    ║
║  How demanding is the age group to teach?                                    ║
║                                                                              ║
║  1 = Teens/young adults (18-30)     - Independent, low supervision           ║
║  2 = Adults (30-45)                 - Some anxiety, manageable               ║
║  3 = Children (7-12) / Adults (45-55) - Moderate patience required           ║
║  4 = Children (5-6) / Seniors (55-65) - High patience, adaptation            ║
║  5 = Toddlers (2-4) / Seniors (65+) - Maximum patience, specialized care     ║
║                                                                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  ────────────────────────────────────────────────────────────────────────    ║
║  DIMENSION 2: SKILL PHASE                                                    ║
║  ────────────────────────────────────────────────────────────────────────    ║
║  What level of swimming is being taught?                                     ║
║                                                                              ║
║  1 = Water confidence only          - Basic comfort, floating                ║
║  2 = Early beginner                 - First strokes, breathing               ║
║  3 = Stroke development             - Technique refinement                   ║
║  4 = Multi-stroke competency        - All strokes, transitions               ║
║  5 = Fitness/lap swimming           - Endurance, pacing, sets                ║
║                                                                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  ────────────────────────────────────────────────────────────────────────    ║
║  DIMENSION 3: LEARNER-TO-COACH RATIO                                         ║
║  ────────────────────────────────────────────────────────────────────────    ║
║  How many learners per coach?                                                ║
║                                                                              ║
║  1 = 1-4 learners                   - High individual attention              ║
║  2 = 5-6 learners                   - Good attention possible                ║
║  3 = 7-10 learners                  - Moderate attention                     ║
║  4 = 11-15 learners                 - Group management required              ║
║  5 = 16+ learners                   - Significant group management           ║
║                                                                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  ────────────────────────────────────────────────────────────────────────    ║
║  DIMENSION 4: EMOTIONAL LABOUR                                               ║
║  ────────────────────────────────────────────────────────────────────────    ║
║  How much emotional support/patience is required?                            ║
║                                                                              ║
║  1 = Confident learners             - Minimal emotional support              ║
║  2 = Some nervousness               - Occasional reassurance                 ║
║  3 = Mild anxiety/fear              - Regular reassurance needed             ║
║  4 = Significant fear               - High patience and trust-building       ║
║  5 = High fear/trauma history       - Specialized emotional care             ║
║                                                                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  ────────────────────────────────────────────────────────────────────────    ║
║  DIMENSION 5: ENVIRONMENT                                                    ║
║  ────────────────────────────────────────────────────────────────────────    ║
║  What environment will sessions take place in?                               ║
║                                                                              ║
║  1 = Shallow pool only (<1.2m)      - Low risk, controlled                   ║
║  2 = Shallow + some deep            - Transitional environment               ║
║  3 = Deep pool (>1.5m)              - Standard pool risk                     ║
║  4 = Olympic/large pool             - Distance, depth variables              ║
║  5 = Open water                     - Unpredictable conditions               ║
║                                                                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  ────────────────────────────────────────────────────────────────────────    ║
║  DIMENSION 6: SESSION PREP & ADAPTATION                                      ║
║  ────────────────────────────────────────────────────────────────────────    ║
║  How much preparation does each session require?                             ║
║                                                                              ║
║  1 = Reusable drills                - Standard curriculum, minimal prep      ║
║  2 = Minor adjustments              - Small tweaks session-to-session        ║
║  3 = Weekly customization           - Adapt based on group progress          ║
║  4 = Significant adaptation         - Individual tracking, custom drills     ║
║  5 = Fully adaptive                 - Complete customization per session     ║
║                                                                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  ────────────────────────────────────────────────────────────────────────    ║
║  DIMENSION 7: PARENT/GUARDIAN MANAGEMENT                                     ║
║  ────────────────────────────────────────────────────────────────────────    ║
║  How much parent/guardian involvement is required?                           ║
║                                                                              ║
║  1 = None                           - Adult learners only                    ║
║  2 = Minimal                        - Drop-off/pickup only                   ║
║  3 = Periodic updates               - Progress reports, occasional chat      ║
║  4 = Regular communication          - Frequent updates, concerns             ║
║  5 = In-session involvement         - Parent-child classes, active support   ║
║                                                                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  TOTAL SCORE: _______ / 35                                                   ║
║                                                                              ║
║  COACH GRADE:  [ ] Grade 1 (7-14)  [ ] Grade 2 (15-24)  [ ] Grade 3 (25-35)  ║
║                                                                              ║
║  PAY BAND:     Grade 1: 35-42%  |  Grade 2: 43-52%  |  Grade 3: 53-65%       ║
║                                                                              ║
║  Comments: _____________________________________________________________     ║
║            _____________________________________________________________     ║
║                                                                              ║
║  Reviewer: ______________________    Date: ________________                  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

### 4.2 Category 2: Special Populations

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                 CATEGORY 2: SPECIAL POPULATIONS                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  DIMENSION 1: POPULATION TYPE                                                ║
║  1 = General water phobia           3 = Physical disability / Prenatal       ║
║  5 = Cognitive disability / Severe trauma / Post-surgery rehab               ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 2: MEDICAL/SAFETY COORDINATION                                    ║
║  1 = None required                  3 = Occasional check-ins with medical    ║
║  5 = Active collaboration with medical professionals                         ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 3: ADAPTATION INTENSITY                                           ║
║  1 = Minor adjustments              3 = Significant modifications            ║
║  5 = Fully customized approach for each learner                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 4: PSYCHOLOGICAL SENSITIVITY                                      ║
║  1 = Standard patience              3 = Elevated care and awareness          ║
║  5 = Trauma-informed specialist approach                                     ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 5: CAREGIVER/SUPPORT COORDINATION                                 ║
║  1 = None                           3 = Updates and handoffs                 ║
║  5 = In-session involvement required                                         ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 6: LIABILITY & DOCUMENTATION                                      ║
║  1 = Standard waiver                3 = Enhanced documentation               ║
║  5 = Medical-legal protocols required                                        ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 7: COACH CERTIFICATION REQUIRED                                   ║
║  1 = Standard SwimBuddz             3 = Additional internal training         ║
║  5 = External specialist certification required                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  TOTAL SCORE: _______ / 35                                                   ║
║  COACH GRADE:  [ ] Grade 1 (7-14)  [ ] Grade 2 (15-24)  [ ] Grade 3 (25-35)  ║
║  PAY BAND:     Grade 1: 38-45%  |  Grade 2: 46-55%  |  Grade 3: 56-68%       ║
║  NOTE: Special Populations has +3-5% category adjustment                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

### 4.3 Category 3: Institutional Programs

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                 CATEGORY 3: INSTITUTIONAL PROGRAMS                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  DIMENSION 1: INSTITUTION TYPE                                               ║
║  1 = Hotel guests / casual          3 = Schools / Corporates                 ║
║  5 = Military / Government / High-stakes contracts                           ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 2: GROUP SIZE                                                     ║
║  1 = Under 10 participants          3 = 10-25 participants                   ║
║  5 = 25+ participants or multiple concurrent groups                          ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 3: LOGISTICS COMPLEXITY                                           ║
║  1 = Single location, fixed time    3 = Multi-session coordination           ║
║  5 = Multi-site, variable scheduling, transport coordination                 ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 4: REPORTING & ACCOUNTABILITY                                     ║
║  1 = Informal feedback only         3 = Periodic formal reports              ║
║  5 = Compliance documentation, formal assessments                            ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 5: CUSTOMIZATION REQUIRED                                         ║
║  1 = Standard off-the-shelf program 3 = Moderate tailoring                   ║
║  5 = Fully bespoke curriculum designed for institution                       ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 6: STAKEHOLDER MANAGEMENT                                         ║
║  1 = Single point of contact        3 = Multiple contacts                    ║
║  5 = Committee/hierarchy involvement, multiple approval levels               ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 7: CONTRACT/COMMERCIAL PRESSURE                                   ║
║  1 = Casual engagement, low stakes  3 = Repeat client expectation            ║
║  5 = High-value contract, renewal dependency, reputation risk                ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  TOTAL SCORE: _______ / 35                                                   ║
║  COACH GRADE:  [ ] Grade 1 (7-14)  [ ] Grade 2 (15-24)  [ ] Grade 3 (25-35)  ║
║  PAY BAND:     Grade 1: 33-40%  |  Grade 2: 41-50%  |  Grade 3: 51-62%       ║
║  NOTE: Institutional has -2-3% category adjustment (SwimBuddz handles sales) ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

### 4.4 Category 4: Competitive & Elite Track

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                 CATEGORY 4: COMPETITIVE & ELITE TRACK                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  DIMENSION 1: PERFORMANCE LEVEL                                              ║
║  1 = Club/developmental             3 = State/national level                 ║
║  5 = International/professional                                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 2: TRAINING VOLUME                                                ║
║  1 = 2-3 sessions/week              3 = 5-6 sessions/week                    ║
║  5 = 8+ sessions/week (doubles)                                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 3: PERIODIZATION COMPLEXITY                                       ║
║  1 = Basic seasonal plan            3 = Multi-phase periodization            ║
║  5 = Olympic cycle planning, advanced peaking                                ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 4: TECHNICAL PRECISION                                            ║
║  1 = General technique focus        3 = Stroke-specific refinement           ║
║  5 = Biomechanical optimization, video analysis                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 5: MENTAL PERFORMANCE COACHING                                    ║
║  1 = Basic motivation               3 = Pre-competition mental prep          ║
║  5 = Sports psychologist collaboration                                       ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 6: ATHLETE MANAGEMENT                                             ║
║  1 = Basic guidance only            3 = Structured support team              ║
║  5 = Full performance team integration (nutrition, physio, etc.)             ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 7: COMPETITION & TRAVEL                                           ║
║  1 = Local meets only               3 = National circuit                     ║
║  5 = International travel and competition                                    ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  TOTAL SCORE: _______ / 35                                                   ║
║  COACH GRADE:  [ ] Grade 1 (7-14)  [ ] Grade 2 (15-24)  [ ] Grade 3 (25-35)  ║
║  PAY BAND:     Grade 1: 37-44%  |  Grade 2: 45-55%  |  Grade 3: 55-68%       ║
║  NOTE: Competitive & Elite has +2-5% category adjustment                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

### 4.5 Category 5: Certifications

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                 CATEGORY 5: CERTIFICATIONS                                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  DIMENSION 1: CERTIFICATION TYPE                                             ║
║  1 = Internal SwimBuddz levels      3 = Industry-recognized (lifeguard)      ║
║  5 = Statutory/regulatory (first aid, CPR)                                   ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 2: ASSESSMENT RIGOR                                               ║
║  1 = Informal sign-off              3 = Practical demonstration              ║
║  5 = Written + practical + timed scenarios                                   ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 3: CURRICULUM STANDARDIZATION                                     ║
║  1 = SwimBuddz-designed, flexible   3 = Aligned to external standards        ║
║  5 = Externally mandated syllabus, no deviation                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 4: INSTRUCTOR QUALIFICATION REQUIRED                              ║
║  1 = Any Grade 2+ coach             3 = Certified trainer                    ║
║  5 = External examiner required                                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 5: LIABILITY & COMPLIANCE                                         ║
║  1 = Low stakes (internal)          3 = Moderate (employment relevance)      ║
║  5 = High (legal/safety liability)                                           ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 6: PASS RATE PRESSURE                                             ║
║  1 = Flexible, developmental        3 = Moderate expectations                ║
║  5 = Strict standards, reputation impact                                     ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 7: MATERIALS & EQUIPMENT                                          ║
║  1 = Basic materials only           3 = Specialized equipment                ║
║  5 = Full rescue/medical kit, mannequins, AEDs                               ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  TOTAL SCORE: _______ / 35                                                   ║
║  COACH GRADE:  [ ] Grade 1 (N/A)   [ ] Grade 2 (15-24)  [ ] Grade 3 (25-35)  ║
║  PAY BAND:     Grade 2: 46-55%  |  Grade 3: 56-68%                           ║
║  NOTE: Grade 1 coaches cannot deliver certification programs                 ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

### 4.6 Category 6: Specialized Disciplines

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                 CATEGORY 6: SPECIALIZED DISCIPLINES                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Discipline: [ ] Stroke Mastery  [ ] Diving  [ ] Water Polo  [ ] Synchro     ║
║              [ ] Underwater/Breath-hold  [ ] Triathlon  [ ] Survival         ║
║                                                                              ║
║  DIMENSION 1: DISCIPLINE TYPE                                                ║
║  1 = Stroke mastery (4 strokes)     3 = Triathlon / Underwater               ║
║  5 = Water polo / Synchro / Survival / Diving                                ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 2: TECHNICAL SPECIALIZATION                                       ║
║  1 = General competence             3 = Sport-specific technique             ║
║  5 = Elite-level specialization                                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 3: SAFETY & RISK PROFILE                                          ║
║  1 = Low (stroke work, pool)        3 = Moderate (open water, endurance)     ║
║  5 = High (diving, breath-hold, survival)                                    ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 4: EQUIPMENT & FACILITY REQUIREMENTS                              ║
║  1 = Standard pool only             3 = Lane ropes, pace clocks              ║
║  5 = Goals, blocks, platforms, open water access                             ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 5: PHYSICAL CONDITIONING DEMANDS                                  ║
║  1 = Basic fitness                  3 = Structured conditioning              ║
║  5 = Sport-specific strength & flexibility                                   ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 6: COACH BACKGROUND REQUIRED                                      ║
║  1 = Strong swimmer                 3 = Discipline experience                ║
║  5 = Competitive/professional history in discipline                          ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 7: COMPETITION/PERFORMANCE PATHWAY                                ║
║  1 = Recreational only              3 = Local/regional competition           ║
║  5 = National/international structure                                        ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  TOTAL SCORE: _______ / 35                                                   ║
║  COACH GRADE:  [ ] Grade 1 (7-14)  [ ] Grade 2 (15-24)  [ ] Grade 3 (25-35)  ║
║  PAY BAND:     Grade 1: 37-44%  |  Grade 2: 45-55%  |  Grade 3: 55-68%       ║
║  NOTE: Specialized Disciplines has +2-5% category adjustment                 ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

### 4.7 Category 7: Adjacent Services

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                 CATEGORY 7: ADJACENT SERVICES                                ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Service Type: [ ] Aqua Fitness  [ ] Therapy/Rehab  [ ] Coach Academy        ║
║                [ ] Event Hosting  [ ] Swim Camps  [ ] Travel Programs        ║
║                                                                              ║
║  DIMENSION 1: SERVICE TYPE                                                   ║
║  1 = Aqua fitness                   3 = Events / Coach academy               ║
║  5 = Therapy-rehab / Camps / Travel programs                                 ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 2: PARTICIPANT MANAGEMENT                                         ║
║  1 = Drop-in attendance             3 = Registered cohort                    ║
║  5 = Residential / Traveling group                                           ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 3: EXTERNAL PARTNERSHIPS                                          ║
║  1 = None                           3 = Facility/vendor partnerships         ║
║  5 = Medical / Federations / Travel operators                                ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 4: OPERATIONAL COMPLEXITY                                         ║
║  1 = Single session                 3 = Multi-day program                    ║
║  5 = Multi-location / Overnight / International                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 5: STAFF REQUIREMENTS                                             ║
║  1 = Solo coach                     3 = Coach + assistant                    ║
║  5 = Multi-disciplinary team                                                 ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 6: REVENUE & COMMERCIAL MODEL                                     ║
║  1 = Per-session / drop-in          3 = Package / Membership                 ║
║  5 = B2B contract / Sponsorship                                              ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
║  DIMENSION 7: RISK & INSURANCE                                               ║
║  1 = Standard                       3 = Elevated                             ║
║  5 = High (medical, minors overnight, travel)                                ║
║  Score: [ ]    Rationale: ___________________________________________        ║
║                                                                              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  TOTAL SCORE: _______ / 35                                                   ║
║  COACH GRADE:  [ ] Grade 1 (7-14)  [ ] Grade 2 (15-24)  [ ] Grade 3 (25-35)  ║
║  PAY BAND:     Variable by service type (30-65%)                             ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 5. System Integration Specification

This section defines how the Cohort Scoring Tool integrates with the SwimBuddz platform.

### 5.1 Data Model Extensions

#### 5.1.1 New Enum: ProgramCategory

```python
# services/academy_service/models.py

class ProgramCategory(str, Enum):
    LEARN_TO_SWIM = "learn_to_swim"
    SPECIAL_POPULATIONS = "special_populations"
    INSTITUTIONAL = "institutional"
    COMPETITIVE_ELITE = "competitive_elite"
    CERTIFICATIONS = "certifications"
    SPECIALIZED_DISCIPLINES = "specialized_disciplines"
    ADJACENT_SERVICES = "adjacent_services"
```

#### 5.1.2 New Enum: CoachGrade

```python
class CoachGrade(str, Enum):
    GRADE_1 = "grade_1"  # Foundational
    GRADE_2 = "grade_2"  # Technical
    GRADE_3 = "grade_3"  # Advanced/Specialist
```

#### 5.1.3 New Model: CohortComplexityScore

```python
class CohortComplexityScore(Base):
    __tablename__ = "cohort_complexity_scores"

    id = Column(Integer, primary_key=True)
    cohort_id = Column(Integer, ForeignKey("cohorts.id"), nullable=False, unique=True)

    # Category
    category = Column(Enum(ProgramCategory), nullable=False)

    # Dimension scores (1-5)
    dimension_1_score = Column(Integer, nullable=False)
    dimension_1_rationale = Column(Text, nullable=True)
    dimension_2_score = Column(Integer, nullable=False)
    dimension_2_rationale = Column(Text, nullable=True)
    dimension_3_score = Column(Integer, nullable=False)
    dimension_3_rationale = Column(Text, nullable=True)
    dimension_4_score = Column(Integer, nullable=False)
    dimension_4_rationale = Column(Text, nullable=True)
    dimension_5_score = Column(Integer, nullable=False)
    dimension_5_rationale = Column(Text, nullable=True)
    dimension_6_score = Column(Integer, nullable=False)
    dimension_6_rationale = Column(Text, nullable=True)
    dimension_7_score = Column(Integer, nullable=False)
    dimension_7_rationale = Column(Text, nullable=True)

    # Calculated fields
    total_score = Column(Integer, nullable=False)
    required_coach_grade = Column(Enum(CoachGrade), nullable=False)

    # Pay band (percentage range)
    pay_band_min = Column(Float, nullable=False)
    pay_band_max = Column(Float, nullable=False)

    # Audit
    scored_by_id = Column(UUID, ForeignKey("members.id"), nullable=False)
    scored_at = Column(DateTime, default=datetime.utcnow)
    reviewed_by_id = Column(UUID, ForeignKey("members.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    # Relationships
    cohort = relationship("Cohort", back_populates="complexity_score")
    scored_by = relationship("Member", foreign_keys=[scored_by_id])
    reviewed_by = relationship("Member", foreign_keys=[reviewed_by_id])
```

#### 5.1.4 Extend Cohort Model

```python
# Add to existing Cohort model

class Cohort(Base):
    # ... existing fields ...

    # New fields
    required_coach_grade = Column(Enum(CoachGrade), nullable=True)

    # Relationship to complexity score
    complexity_score = relationship("CohortComplexityScore", back_populates="cohort", uselist=False)
```

#### 5.1.5 Extend Coach Profile (in Members service)

```python
# Coach-related fields in Member or new CoachProfile model

class CoachProfile(Base):
    __tablename__ = "coach_profiles"

    id = Column(Integer, primary_key=True)
    member_id = Column(UUID, ForeignKey("members.id"), nullable=False, unique=True)

    # Grade by category
    learn_to_swim_grade = Column(Enum(CoachGrade), nullable=True)
    special_populations_grade = Column(Enum(CoachGrade), nullable=True)
    institutional_grade = Column(Enum(CoachGrade), nullable=True)
    competitive_elite_grade = Column(Enum(CoachGrade), nullable=True)
    certifications_grade = Column(Enum(CoachGrade), nullable=True)
    specialized_disciplines_grade = Column(Enum(CoachGrade), nullable=True)
    adjacent_services_grade = Column(Enum(CoachGrade), nullable=True)

    # Progression tracking
    total_coaching_hours = Column(Integer, default=0)
    cohorts_completed = Column(Integer, default=0)
    average_feedback_rating = Column(Float, nullable=True)

    # Credentials
    first_aid_expiry = Column(Date, nullable=True)
    cpr_expiry = Column(Date, nullable=True)
    lifeguard_cert_expiry = Column(Date, nullable=True)

    # Status
    is_active = Column(Boolean, default=True)
    last_active_date = Column(Date, nullable=True)
```

### 5.2 API Endpoints

#### 5.2.1 Scoring Endpoints

```
POST   /api/v1/academy/cohorts/{cohort_id}/score
       Create complexity score for a cohort
       Body: { category, dimension_scores[], rationales[] }
       Returns: CohortComplexityScore with calculated grade and pay band

GET    /api/v1/academy/cohorts/{cohort_id}/score
       Get complexity score for a cohort
       Returns: CohortComplexityScore or 404

PUT    /api/v1/academy/cohorts/{cohort_id}/score
       Update complexity score
       Requires: reviewer role or admin
       Body: { dimension_scores[], rationales[] }

POST   /api/v1/academy/cohorts/{cohort_id}/score/review
       Mark score as reviewed
       Requires: Head Coach or Admin role
       Body: { reviewed_by_id }
```

#### 5.2.2 Coach Assignment Endpoints

```
GET    /api/v1/academy/coaches/eligible
       Get coaches eligible for a specific cohort
       Query params: cohort_id, category, required_grade
       Returns: List of eligible coaches with their grades

POST   /api/v1/academy/cohorts/{cohort_id}/assign-coach
       Assign coach to cohort
       Validates: Coach has required grade for category
       Body: { coach_id }
```

#### 5.2.3 Calculation Endpoint

```
POST   /api/v1/academy/scoring/calculate
       Preview score calculation without saving
       Body: { category, dimension_scores[] }
       Returns: { total_score, required_grade, pay_band_min, pay_band_max }
```

### 5.3 Business Logic

#### 5.3.1 Score Calculation Function

```python
def calculate_complexity_score(category: ProgramCategory, dimension_scores: List[int]) -> dict:
    """
    Calculate complexity score, grade, and pay band.

    Args:
        category: The program category
        dimension_scores: List of 7 scores (1-5 each)

    Returns:
        dict with total_score, required_grade, pay_band_min, pay_band_max
    """
    # Validate inputs
    if len(dimension_scores) != 7:
        raise ValueError("Exactly 7 dimension scores required")

    for score in dimension_scores:
        if not 1 <= score <= 5:
            raise ValueError("Each score must be between 1 and 5")

    # Calculate total
    total_score = sum(dimension_scores)

    # Determine grade
    if total_score <= 14:
        required_grade = CoachGrade.GRADE_1
    elif total_score <= 24:
        required_grade = CoachGrade.GRADE_2
    else:
        required_grade = CoachGrade.GRADE_3

    # Get pay band based on category and grade
    pay_band = get_pay_band(category, required_grade)

    return {
        "total_score": total_score,
        "required_grade": required_grade,
        "pay_band_min": pay_band["min"],
        "pay_band_max": pay_band["max"]
    }


# Pay band lookup table
PAY_BANDS = {
    ProgramCategory.LEARN_TO_SWIM: {
        CoachGrade.GRADE_1: {"min": 0.35, "max": 0.42},
        CoachGrade.GRADE_2: {"min": 0.43, "max": 0.52},
        CoachGrade.GRADE_3: {"min": 0.53, "max": 0.65},
    },
    ProgramCategory.SPECIAL_POPULATIONS: {
        CoachGrade.GRADE_1: {"min": 0.38, "max": 0.45},
        CoachGrade.GRADE_2: {"min": 0.46, "max": 0.55},
        CoachGrade.GRADE_3: {"min": 0.56, "max": 0.68},
    },
    ProgramCategory.INSTITUTIONAL: {
        CoachGrade.GRADE_1: {"min": 0.33, "max": 0.40},
        CoachGrade.GRADE_2: {"min": 0.41, "max": 0.50},
        CoachGrade.GRADE_3: {"min": 0.51, "max": 0.62},
    },
    ProgramCategory.COMPETITIVE_ELITE: {
        CoachGrade.GRADE_1: {"min": 0.37, "max": 0.44},
        CoachGrade.GRADE_2: {"min": 0.45, "max": 0.55},
        CoachGrade.GRADE_3: {"min": 0.55, "max": 0.68},
    },
    ProgramCategory.CERTIFICATIONS: {
        CoachGrade.GRADE_1: None,  # Not applicable
        CoachGrade.GRADE_2: {"min": 0.46, "max": 0.55},
        CoachGrade.GRADE_3: {"min": 0.56, "max": 0.68},
    },
    ProgramCategory.SPECIALIZED_DISCIPLINES: {
        CoachGrade.GRADE_1: {"min": 0.37, "max": 0.44},
        CoachGrade.GRADE_2: {"min": 0.45, "max": 0.55},
        CoachGrade.GRADE_3: {"min": 0.55, "max": 0.68},
    },
    ProgramCategory.ADJACENT_SERVICES: {
        CoachGrade.GRADE_1: {"min": 0.30, "max": 0.40},
        CoachGrade.GRADE_2: {"min": 0.40, "max": 0.55},
        CoachGrade.GRADE_3: {"min": 0.55, "max": 0.65},
    },
}


def get_pay_band(category: ProgramCategory, grade: CoachGrade) -> dict:
    """Get pay band for category and grade."""
    band = PAY_BANDS.get(category, {}).get(grade)
    if band is None:
        raise ValueError(f"No pay band defined for {category} at {grade}")
    return band
```

#### 5.3.2 Coach Eligibility Check

```python
def is_coach_eligible(coach_profile: CoachProfile, cohort: Cohort) -> bool:
    """
    Check if a coach is eligible for a cohort based on grade requirements.
    """
    if not cohort.complexity_score:
        return True  # No score = no restriction

    required_grade = cohort.complexity_score.required_coach_grade
    category = cohort.complexity_score.category

    # Get coach's grade for this category
    coach_grade = getattr(coach_profile, f"{category.value}_grade", None)

    if coach_grade is None:
        return False  # Coach not graded in this category

    # Grade comparison (Grade 3 can do Grade 2 work, etc.)
    grade_order = [CoachGrade.GRADE_1, CoachGrade.GRADE_2, CoachGrade.GRADE_3]
    coach_level = grade_order.index(coach_grade)
    required_level = grade_order.index(required_grade)

    return coach_level >= required_level
```

### 5.4 Admin UI Components

#### 5.4.1 Scoring Form Component

Location: `/admin/academy/cohorts/[id]/score`

Features:
- Category selector (step 1)
- Dynamic dimension form based on category (step 2)
- Score sliders or dropdowns (1-5)
- Rationale text fields
- Real-time total calculation
- Grade and pay band display
- Save and submit for review

#### 5.4.2 Coach Assignment Component

Location: `/admin/academy/cohorts/[id]/assign-coach`

Features:
- Display cohort requirements (grade, category)
- Filter eligible coaches
- Show coach grades and availability
- One-click assignment
- Confirmation with compensation estimate

### 5.5 Database Migration

```python
# alembic revision for cohort_complexity_scores

def upgrade():
    # Create program_category enum
    op.execute("""
        CREATE TYPE program_category AS ENUM (
            'learn_to_swim',
            'special_populations',
            'institutional',
            'competitive_elite',
            'certifications',
            'specialized_disciplines',
            'adjacent_services'
        )
    """)

    # Create coach_grade enum
    op.execute("""
        CREATE TYPE coach_grade AS ENUM (
            'grade_1',
            'grade_2',
            'grade_3'
        )
    """)

    # Create cohort_complexity_scores table
    op.create_table(
        'cohort_complexity_scores',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('cohort_id', sa.Integer(), sa.ForeignKey('cohorts.id'), nullable=False, unique=True),
        sa.Column('category', sa.Enum('program_category'), nullable=False),
        sa.Column('dimension_1_score', sa.Integer(), nullable=False),
        sa.Column('dimension_1_rationale', sa.Text(), nullable=True),
        # ... dimensions 2-7 ...
        sa.Column('total_score', sa.Integer(), nullable=False),
        sa.Column('required_coach_grade', sa.Enum('coach_grade'), nullable=False),
        sa.Column('pay_band_min', sa.Float(), nullable=False),
        sa.Column('pay_band_max', sa.Float(), nullable=False),
        sa.Column('scored_by_id', sa.UUID(), sa.ForeignKey('members.id'), nullable=False),
        sa.Column('scored_at', sa.DateTime(), default=sa.func.now()),
        sa.Column('reviewed_by_id', sa.UUID(), sa.ForeignKey('members.id'), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
    )

    # Add required_coach_grade to cohorts
    op.add_column('cohorts', sa.Column('required_coach_grade', sa.Enum('coach_grade'), nullable=True))


def downgrade():
    op.drop_column('cohorts', 'required_coach_grade')
    op.drop_table('cohort_complexity_scores')
    op.execute("DROP TYPE coach_grade")
    op.execute("DROP TYPE program_category")
```

---

## 6. Examples

### 6.1 Example: Adult Beginner Freestyle (12 weeks)

**Header:**
- Program: Adult Beginner Freestyle
- Cohort: January 2026 Batch
- Location: Rowe Park Pool, Yaba
- Duration: 12 weeks (3 blocks)
- Capacity: 8 learners

**Category:** Learn-to-Swim (Core)

**Scores:**

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Age Group Complexity | 2 | Adults 25-45, manageable |
| Skill Phase | 2 | Beginner to basic stroke development |
| Learner-to-Coach Ratio | 3 | 8 learners |
| Emotional Labour | 4 | Adults with moderate fear, some ego |
| Environment | 2 | Shallow pool with some deep exposure |
| Session Prep | 3 | Weekly adjustments based on progress |
| Parent Management | 1 | None (adults) |

**Total: 17**

**Result:**
- Coach Grade: **Grade 2 – Technical**
- Pay Band: **43-52%**

---

### 6.2 Example: Military Survival Swimming (24 weeks)

**Header:**
- Program: Military Survival Swimming
- Cohort: Nigerian Navy Q1 2026
- Location: Open water + pool combination
- Duration: 24 weeks (6 blocks)
- Capacity: 12 participants

**Category:** Specialized Disciplines

**Scores:**

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Discipline Type | 5 | Survival swimming (tactical) |
| Technical Specialization | 5 | Military-specific techniques, clothed swimming |
| Safety & Risk Profile | 5 | Open water, exhaustion, high consequence |
| Equipment & Facility | 5 | Open water access, safety boats, rescue equipment |
| Physical Conditioning | 5 | Extreme endurance and stress tolerance |
| Coach Background | 5 | Military or professional survival experience |
| Competition Pathway | 3 | Pass/fail certification, not competitive |

**Total: 33**

**Result:**
- Coach Grade: **Grade 3 – Advanced/Specialist**
- Pay Band: **55-68%**

---

### 6.3 Example: Kids Freestyle (8 weeks)

**Header:**
- Program: Kids Learn to Swim
- Cohort: School Holiday Program
- Location: VI Sports Complex
- Duration: 8 weeks (2 blocks)
- Capacity: 12 children

**Category:** Learn-to-Swim (Core)

**Scores:**

| Dimension | Score | Rationale |
|-----------|-------|-----------|
| Age Group Complexity | 3 | Children 7-10 |
| Skill Phase | 2 | Water confidence to basic freestyle |
| Learner-to-Coach Ratio | 4 | 12 children |
| Emotional Labour | 3 | Some anxiety, short attention spans |
| Environment | 1 | Shallow pool only |
| Session Prep | 2 | Minor weekly adjustments |
| Parent Management | 4 | Regular updates, occasional concerns |

**Total: 19**

**Result:**
- Coach Grade: **Grade 2 – Technical**
- Pay Band: **43-52%**

---

## Related Documentation

- [COACH_OPERATIONS_FRAMEWORK.md](./COACH_OPERATIONS_FRAMEWORK.md) - Complete framework reference
- [COACH_AGREEMENT.md](./COACH_AGREEMENT.md) - Legal agreement template
- [COACH_HANDBOOK.md](./COACH_HANDBOOK.md) - Coach-facing guide

---

*Document Owner: Academy Operations*
*Last Updated: February 2026*
*Version: 1.0*
