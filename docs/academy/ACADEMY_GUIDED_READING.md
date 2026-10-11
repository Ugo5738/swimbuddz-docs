# Academy Guided Learning & Recommended Reading

> **Status:** Proposed product and curriculum specification (11 October 2026). **Documentation only; not yet implemented.**
>
> **Applies to:** Current 12-class Beginner Freestyle cohorts first, then any Academy pathway or modular programme.
>
> **Related:** [Academy overview](./README.md), [modular curriculum](./MODULAR_CURRICULUM_PATHWAY.md), and the existing public [SwimBuddz tips library](https://www.swimbuddz.com/tips). The broader Learn hub is separately documented in `docs/marketing/BEYOND_POOL_AND_ALUMNI_ROLLOUT.md` on the integration branch; this proposal should align with it rather than duplicate it.

## Objective

Make SwimBuddz articles useful **during** the learning journey rather than leaving them as a separate marketing library. Each Academy student should see a small, relevant set of readings that explains what they may be experiencing in the water, supports coached instruction, and normalizes gradual adult progress.

Reading is a **supplement**, never a prerequisite for attending classes, satisfying milestones, graduating, or receiving a certificate. The student should not be pressured to report that they have read an article.

## Product principles

1. **Curriculum-aligned, competency-aware:** Recommend by programme/module, lesson stage, milestone, and optionally a self-selected concern (e.g., breathing or water anxiety). Stage is a default, not a diagnosis. A Class 8 learner still struggling with breathing should continue to see breathing resources.
2. **Small and explainable:** Show two or three priority articles at a time, with a short `Why this is useful now` explanation. Offer `View all Academy resources` rather than a long compulsory checklist.
3. **Coached learning is the authority:** Articles do not replace in-water supervision, individual safety instructions, or a coach's assessment. Do not turn panic management or deep-water recovery into unsupervised homework.
4. **One canonical article:** Keep editorial content and published status in the existing Content/Learn system. Academy should reference those posts, not duplicate their bodies or create a parallel article CMS.
5. **Flexible pathways:** The current 12-class timetable is a starting presentation. Persist recommendation rules in terms of programme/module/milestone or progress bands so shorter foundation modules, makeup classes, cohort transfers, and future programmes work without rewriting every rule.
6. **No new direct cross-service dependency:** Follow existing service contracts, projections, and frontend integration patterns. Do not introduce synchronous Academy-to-Communications database reads or an Academy-to-Content service requirement on critical enrollment/progress paths.
7. **Editorial ownership:** Coaches suggest learning topics; an authorized Academy/content administrator curates and publishes approved recommendations.

## Suggested content sequence for the current Beginner Freestyle programme

These are **recommended teaching windows**, not guaranteed achievement dates or hard content locks.

| Learning window | Student need | Primary suggested reading | Optional companion |
|---|---|---|---|
| Before first class | Know what to expect | What to Expect at Your First SwimBuddz Session | I'm an Adult & I Can't Swim — Where Do I Start? |
| Classes 1–3: water confidence, safe recovery, breathing and float foundations | Understand fear, breathing, buoyancy | Breathing Basics: Why Most Adults Struggle in Water; Why Panic Happens in Water & How to Manage It; Floating vs Sinking: Debunking the Myths | How Long Does It Take to Learn Swimming as an Adult? |
| Classes 4–6: supported propulsion and breathing rhythm | Recognize incremental improvement; establish practice routine | Signs You're Improving Even If It Doesn't Feel Like It; How Often Should an Adult Swim per Week? | Why Adults Learn Better Together |
| Classes 7–9: stroke coordination and consolidating distance | Manage variable progress without rushing | Plateaus in Swimming Are Totally Normal; Why SwimBuddz Focuses on Consistency, Not Speed | Why Community Matters More Than Talent |
| Classes 10–12: swim consistency, graduation and next steps | Build sustainable habits and peer support | Why Adults Learn Better Together; Hydration & Recovery After Swimming | How Often Should an Adult Swim per Week? |

**Evergreen companion:** *Skin & Hair Care Tips for Frequent Swimmers* should be discoverable from onboarding onward, alongside practical gear and recovery resources; it is not an end-of-course reward.

**Example canonical links supplied by the Academy team:**

- [Why Panic Happens in Water & How to Manage It](https://www.swimbuddz.com/tips/81bf6f20-12b6-4ab2-afc9-153de2cf083c)
- [Floating vs Sinking: Debunking the Myths](https://www.swimbuddz.com/tips/7e224d33-5ce6-46a7-b67e-81ad4e5b631b)
- [Skin & Hair Care Tips for Frequent Swimmers](https://www.swimbuddz.com/tips/c3eae1da-3883-468e-b3f1-ffbd2e8b7a62)

Other titles should be linked by **their existing canonical content records**, not by guessed UUIDs or copied article bodies. The content team must check each post's public availability and current guidance before featuring it.

## Student experience

### Enrollment and onboarding

After a confirmed Academy enrollment, offer an optional `Prepare for your first class` resource strip. Do not depend on article delivery to complete a payment or enrollment. An orientation WhatsApp message may link to the same published resource collection, but the member dashboard is the durable home.

### Academy dashboard

Show a `Recommended for your stage` section:

- Two or three suggested articles with title, topic, reading reason, and canonical link.
- A `More learning resources` link to the public Tips/Learn hub.
- Optional `Read` or `Save for later` interaction **only if** the team can implement it simply and privately. Never treat opening a link as proof of comprehension.
- Suggestions refresh when a student's learning stage or verified milestones change; remain accessible if the student is repeating content or taking makeup sessions.
- A safe empty state if all recommendations are unpublished or temporarily unavailable, without blocking the Academy dashboard.

### Coach and cohort communication

Coaches may select one relevant existing article for an upcoming session or an observed learning difficulty. Share topic-based suggestions in cohort WhatsApp groups with a short explanation, not a bulk list of all posts. Coach recommendations are advisory and do not alter the verified curriculum or student progress.

### After completion

Graduates retain access to useful reading through their long-lived Academy journey/history. Continue to surface fitness, practice, recovery and Club-transition topics where relevant; do not infer eligibility for the Club from having read an article or merely completing the Academy.

## Admin and editorial workflow (proposed)

An authorized admin can:

1. Choose an existing **published** article from the current content library.
2. Assign the article to one or more programmes, modules, milestones, class ranges/progress bands, or topic tags.
3. Choose priority, optional/primary placement, and a brief `Why now` note.
4. Preview recommendations as a beginner, as a learner needing more breathing practice, and as a graduate.
5. Publish/unpublish a **recommendation** independently from publishing/unpublishing the original **article**.

If a source article is unpublished, archived, or its canonical URL becomes invalid, the student UI must not present it as a working recommendation. Keep the curriculum mapping so that editors can repair it, but hide broken recommendations gracefully.

An editor should be able to adjust the curation without a code deploy; the first MVP may be simpler than a full visual rule builder, provided ownership and status are clear.

## Engineering boundary and data guidance

- **Content/Learn remains source of truth** for article identity, title, description, canonical URL, and publication state.
- **Academy owns recommendation rules**, referencing stable canonical content IDs and storing curriculum targeting, priority and `why now` copy. Do not store article bodies or maintain a second editorial copy.
- Read recommendations through established interfaces or approved materialized/cached projections; failures in a content-facing dependency must not interrupt enrollment, class attendance, milestone progress or certificates.
- Member-facing access checks should use existing Academy permissions. General public articles remain public; private learner signals must not leak into public recommendation URLs or anonymous analytics.
- Avoid cross-service foreign keys and direct cross-service table access. Use existing frontend conventions and generated API contracts if/when implementation is approved.
- If analytics are needed, prefer existing anonymous, aggregate content engagement counters. Reading/clickthrough rates are directional and **not** evidence that a swimmer acquired a skill.

## Incremental rollout

**Phase 0 — Now, no engineering changes**

- Share the three foundational articles with the four currently active cohorts, and link to the full Tips library.
- Schedule 1–2 relevant follow-up shares as classes progress; coaches can tailor recommendations.
- Track qualitatively which questions recur; do not require replies or completion reports.

**Phase 1 — Minimum product feature**

- Admin-curated recommendations for the existing 12-class Beginner Freestyle programme.
- Member Academy `Recommended for your stage` panel and pre-first-class preparation link.
- A stable fallback to public Tips/Learn when stage-specific recommendations are unavailable.

**Phase 2 — More adaptive learning**

- Target by verified skills and coach-approved concerns rather than only class number.
- Extend to Intro to Water, modular pathways, repeat cohorts and graduates without duplicating definitions.
- Optional opt-in read-later and useful aggregate engagement reporting.

## Acceptance criteria for future implementation

- [ ] An enrolled student can see a small set of relevant published articles in the Academy dashboard.
- [ ] A student at a later class can still access breathing/panic/floating resources when needed.
- [ ] The admin can edit recommendation-to-curriculum mappings without changing source articles or deploying code.
- [ ] Unpublished, missing or removed articles do not yield dead links or break the dashboard.
- [ ] A cohort transfer, makeup session or repeated class does not erase useful reading access.
- [ ] No recommendation is compulsory or changes attendance, assessment, graduation or Club eligibility.
- [ ] Enrollment/progress remain functional during Content/Learn outages.
- [ ] Privacy and existing microservice ownership rules remain intact.
- [ ] UI labels and reporting distinguish suggestions, article opens, and verified milestone achievements.

## Non-goals

- A replacement for professional swimming instruction or medical/safety advice.
- Automatically producing or rewriting existing articles.
- Blocking Academy completion on reading activity.
- Treating article clicks or quiz scores as swimming competency.
- Building a new CMS, new cross-service reporting pipeline, or a second content analytics system solely for Academy reading.
