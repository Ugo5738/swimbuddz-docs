# Curriculum Validation Rules

Before outputting any curriculum, validate against ALL of these rules. A curriculum that violates any rule is not ready for production.

## Critical Rules (Must Pass)

### 1. Session Duration
- [ ] `session_duration_minutes` is 90 (not 60) unless explicitly requested otherwise
- **Why**: 60 minutes is too short for warm-up + instruction + practice + supplementary skills

### 2. Back Float Timing
- [ ] Back float is NOT a primary focus in Weeks 1-5
- [ ] Back float may appear as `supplementary_activity` from Week 6 onwards
- **Why**: Back floating requires trust that takes weeks to build. Front-first progression is safer.

### 3. Kick Phase Duration
- [ ] Kicks span at least 3 weeks (typically Weeks 3-6)
- [ ] Distance progression exists: 10m → 25m → 50m (or similar)
- [ ] Breathing is integrated with kicks from Week 3 or 4 (not separate)
- **Why**: Rushing kicks means weak foundation for pulls. Kicks continue through entire program.

### 4. Pull Phase Duration
- [ ] Pulls span at least 2 weeks (typically Weeks 7-9)
- [ ] Side breathing is taught during pull phase
- [ ] Kick continues during pull practice (not isolated arms)
- **Why**: Coordination takes time. Isolating arms creates bad habits.

### 5. Equipment Progression
- [ ] Equipment is specified per week (`equipment_required` field)
- [ ] Clear transition: noodle → kickboard → minimal/none
- [ ] No equipment in final assessment week
- **Why**: Students must graduate to independent swimming.

### 6. Measurable Objectives
- [ ] Every week has at least one measurable objective
- [ ] Distance milestones are specific: "Kick 25m" not "improve kicking"
- [ ] Final milestone is distance-based: "Swim 50m continuous"
- **Why**: Vague milestones can't be assessed.

### 7. Breathing Integration
- [ ] Breathing is NOT a standalone week (no "Week 7: Learning to Breathe")
- [ ] Breathing integrates with kicks from Week 2-3 (6-kick drill or similar)
- [ ] Side breathing taught with arm pulls, not before
- **Why**: Breathing is not a separate skill—it's integrated with movement.

### 8. Recovery to Standing
- [ ] Recovery to standing (tuck-press-rotate) is taught in Week 1
- [ ] Listed as a skill in Week 1 lessons
- **Why**: This is THE critical safety skill. Must come before any swimming.

### 9. Skills Library Consistency
- [ ] Every skill referenced in `lessons[].skills` exists in `skills_library`
- [ ] No orphan skills in library (every skill is used at least once)
- **Why**: Database integrity requires skill references to be valid.

### 10. Milestone Ordering
- [ ] Milestones have sequential `order_index` values (1, 2, 3...)
- [ ] Milestone order matches skill progression (can't have "Swim 50m" before "Kick 25m")
- **Why**: Students track progress through milestones in order.

---

## Warning Rules (Should Fix)

### 11. Lesson Description Length
- [ ] Each `lesson.description` is at least 100 characters
- [ ] Description explains "why" not just "what"
- **Why**: Adults need context to learn. Terse descriptions aren't useful.

### 12. Pool Depth Specification
- [ ] `pool_depth` is specified for weeks where it matters (especially Week 1)
- [ ] Deep pool is used in Week 1 for depth desensitization (or explicitly shallow for fearful)
- **Why**: Pool depth affects safety protocols.

### 13. Supplementary Activities Timing
- [ ] `supplementary_activity` is `null` for Weeks 1-5
- [ ] `supplementary_activity` has "(10 min)" or similar time notation
- **Why**: Supplementary skills shouldn't steal time from core instruction early on.

### 14. Program Level Matches Content
- [ ] `beginner_1` programs start with water confidence, end with 50m freestyle
- [ ] `beginner_2` programs assume water confidence, focus on stroke refinement
- [ ] `intermediate` programs assume freestyle, add other strokes
- **Why**: Level should accurately describe prerequisites and outcomes.

### 15. Price Consistency
- [ ] If `price_amount` > 0, `billing_type` is specified
- [ ] Price is in appropriate range for Nigerian market (if NGN)
- **Why**: Pricing errors cause customer service issues.

---

## Validation Checklist (Copy-Paste for Self-Check)

```
CRITICAL (Must ALL pass):
[ ] Session duration is 90 minutes
[ ] Back float not primary focus before Week 6
[ ] Kicks span 3+ weeks with distance progression
[ ] Pulls span 2+ weeks with breathing integration
[ ] Equipment progression specified and ends with minimal
[ ] Every week has measurable objective
[ ] Breathing integrates with kicks, not standalone
[ ] Recovery to standing in Week 1
[ ] All skill references exist in skills_library
[ ] Milestone ordering is logical

WARNINGS (Should fix):
[ ] Lesson descriptions are detailed (100+ chars)
[ ] Pool depth specified where relevant
[ ] Supplementary activities only from Week 6
[ ] Level matches actual content
[ ] Pricing is consistent
```

---

## Common Violations and Fixes

### Violation: Back float in Week 3
**Problem**: Curriculum has "Week 3: Floating on Your Back"

**Fix**: Move back float to supplementary activity from Week 6:
```json
{
  "week_number": 6,
  "supplementary_activity": "Back float practice (10 min)"
}
```

### Violation: 60-minute sessions
**Problem**: `session_duration_minutes: 60`

**Fix**: Change to 90 unless user explicitly requested shorter:
```json
{
  "session_duration_minutes": 90
}
```

### Violation: Breathing as standalone week
**Problem**: "Week 5: Breathing Techniques"

**Fix**: Integrate breathing with kicks starting Week 3:
```json
{
  "week_number": 3,
  "theme": "Kicking for Movement with Breathing Integration",
  "objectives": "Develop flutter kick while learning the 6-kick breathing drill"
}
```

### Violation: Vague milestone
**Problem**: `"name": "Improved kicking ability"`

**Fix**: Make it measurable:
```json
{
  "name": "Kick 25m with kickboard",
  "criteria": "Completes 25m using flutter kick with proper form: hip-driven movement, relaxed ankles, continuous rhythm"
}
```

### Violation: Missing equipment progression
**Problem**: No `equipment_required` fields

**Fix**: Add equipment per week:
```json
{
  "week_number": 3,
  "equipment_required": ["kickboard", "noodles"],
  ...
},
{
  "week_number": 6,
  "equipment_required": ["kickboard"],
  ...
},
{
  "week_number": 10,
  "equipment_required": [],
  ...
}
```

---

## Database Compatibility Notes

The generated JSON must be importable into the Swimbuddz database. Key constraints:

### Program Table
- `level` must be one of: `beginner_1`, `beginner_2`, `intermediate`, `advanced`, `specialty`
- `billing_type` must be one of: `one_time`, `subscription`, `per_session`
- `slug` must be unique and URL-friendly (lowercase, hyphens)

### Curriculum Tables
- Each lesson links to a week, each week links to a curriculum, each curriculum links to a program
- Skills are stored in a global library and linked via junction table

### Milestones Table
- `milestone_type` must be one of: `skill`, `endurance`, `technique`, `assessment`
- `required_evidence` must be one of: `none`, `video`, `time_trial`
- `rubric_json` is optional and stored as JSON blob

### Skills Table
- `category` must be one of: `water_confidence`, `stroke`, `safety`, `technique`, `endurance`
- Skill `name` should be unique within the system
