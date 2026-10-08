# Alumni Evidence and Beyond the Pool rollout

## Product intent
A closed cohort is an immutable historical teaching/assessment record. An active or graduated learner may continue uploading additional milestone videos as evidence, without resetting verified progress. Videos stay private by default. Consent to be contacted is not publication permission.

## Academy implementation
- Academy service: `GET/POST /academy/enrollments/{enrollment_id}/evidence`.
- Payload: milestone_id, video_media_id, kind (cohort_archive or continued_progress), optional caption/recorded_on, consent_to_share.
- Ownership and enrollment checks happen on the server, not just in the React UI.
- Additional evidence rows never alter StudentProgress or MilestoneReviewEvent.
- Migrate Academy schema before deploying the frontend.
- **Pre-release hardening**: validate each video_media_id with Media Service for existence, video MIME type, uploader/owner and privacy; add integration tests covering forged media references, access denial and public publishing. Keep the feature behind deployment controls until verified.
- Coach feedback on supplementary videos and editorial public approval remain distinct future endpoints. Do not treat upload as coaching or marketing approval.

## Beyond the Pool
- Public `/learn`, `/beyond-the-pool`, `/beyond-the-pool/[id]`.
- Content posts with category `beyond_the_pool` use the existing admin content editor, with video_url, episode_number and guest_names.
- Only published posts appear publicly; YouTube URLs are allowlisted for embeds.
- Migrate communications schema before writing episode metadata.
- In Admin > Community > Content, create these two episodes, both with category beyond_the_pool and tier_access community:
  - Episode 1: **Is It Too Late to Learn Swimming as an Adult?** Video: https://www.youtube.com/watch?v=DDqH3JDcl_Y (confirm this is the actual episode video before publishing; the shared playlist URL references this video).
  - Episode 2: **How Busy Professionals Learned to Swim** Video: https://www.youtube.com/live/g_4oasxw46M (confirm whether this is the final trimmed replay).
- Add guest names, summary, detailed key takeaways and editorial thumbnails from original recordings with consent. Keep draft until validated.
- Relevant CTAs link to Academy and swimming assessment. Add UTM campaign tracking and conversion attribution with tests before claiming funnel measurement is operational.

## Product navigation
- Public navigation uses Learn to group episodes, articles, guides, highlights, and skill assessment.
- Homepage calls Community, Club, and Academy ways to swim rather than membership tiers.
- Existing `/tips`, `/gallery`, and `/guides` URLs remain intact.

## QA gates
1. Database migrations apply in production upgrade sequence without duplicate Alembic heads.
2. Learner in a completed cohort can append evidence; assessment status and reviewer remain unchanged.
3. Non-owner cannot read or write another learner's supplementary evidence.
4. Invalid or unowned media references are rejected after media-ownership validation is integrated.
5. Non-public evidence cannot be surfaced via public galleries, stories, or episode content.
6. Admin can draft/edit/publish episode; anonymous visitor sees only published episode.
7. No YouTube embed with unapproved/non-YouTube origin.
8. Run backend unit/integration tests and frontend type-check, lint, build; inspect CI before merge to develop.
9. Deploy backend/migrations before frontend, then publish episodes; do not publish an empty category.
10. Track episode views, clickthroughs, registration and conversions only after explicit measurement implementation.

## Not yet implemented
- Public stories approval and opt-in publishing workflow
- Full content analytics/attribution and experimental funnel reporting
- Separate coach review for post-cohort clips
- Public event taxonomy redesign, pool booking directory, and registration funnel overhaul
