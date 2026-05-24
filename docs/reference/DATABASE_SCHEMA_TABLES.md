# Database Schema — Table Reference (auto-generated)

> **Generated** by `scripts/db/generate-schema-doc.py`. Do not hand-edit — regenerate after model changes. Conventions, the string-enum pattern, and shared enum values are documented in the curated [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md).

Tables are grouped by the service whose models package defines them. Cross-service references are plain UUID/string columns with no FK constraint (see SERVICE_COMMUNICATION.md) — a column pointing at another service's row will NOT show an FK below.

## members_service

### `agreement_versions`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `agreement_type` | VARCHAR(40) | NOT NULL |  | coach_agreement |
| `version` | VARCHAR(20) | NOT NULL |  |  |
| `title` | VARCHAR(200) | NOT NULL |  |  |
| `content` | TEXT | NOT NULL |  |  |
| `content_hash` | VARCHAR(64) | NOT NULL |  |  |
| `effective_date` | DATE | NOT NULL |  |  |
| `is_current` | BOOLEAN | NOT NULL |  | false |
| `created_by_id` | UUID |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `uq_agreement_version_per_type` (UniqueConstraint)

### `challenge_badge_awards`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_id` | UUID | NOT NULL | idx |  |
| `challenge_id` | UUID | NOT NULL | idx |  |
| `submission_id` | UUID |  | FK→member_challenge_completions.id |  |
| `badge_name` | VARCHAR | NOT NULL |  |  |
| `badge_image_media_id` | UUID |  |  |  |
| `awarded_at` | DATETIME | NOT NULL |  |  |
| `revoked_at` | DATETIME |  |  |  |

_Constraints:_ `uq_badge_member_challenge` (UniqueConstraint)

### `challenge_example_media`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `challenge_id` | UUID | NOT NULL | FK→club_challenges.id, idx |  |
| `media_id` | UUID | NOT NULL |  |  |
| `order_idx` | INTEGER | NOT NULL |  | 0 |
| `caption` | VARCHAR |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `challenge_submission_media`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `submission_id` | UUID | NOT NULL | FK→member_challenge_completions.id, idx |  |
| `media_id` | UUID | NOT NULL |  |  |
| `order_idx` | INTEGER | NOT NULL |  | 0 |
| `created_at` | DATETIME | NOT NULL |  |  |

### `challenge_submission_members`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `submission_id` | UUID | NOT NULL | FK→member_challenge_completions.id, idx |  |
| `member_id` | UUID | NOT NULL | idx |  |
| `role` | VARCHAR |  |  |  |
| `badge_awarded` | BOOLEAN | NOT NULL |  | false |
| `bubbles_grant_id` | UUID |  |  |  |
| `volunteer_hours_log_id` | UUID |  |  |  |
| `rewarded_at` | DATETIME |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `uq_submission_member` (UniqueConstraint)

### `club_challenges`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `title` | VARCHAR | NOT NULL |  |  |
| `description` | VARCHAR |  |  |  |
| `instructions` | TEXT |  |  |  |
| `challenge_type` | VARCHAR | NOT NULL |  |  |
| `badge_name` | VARCHAR | NOT NULL |  |  |
| `reward_badge_image_media_id` | UUID |  |  |  |
| `reward_bubbles_amount` | INTEGER |  |  |  |
| `reward_volunteer_hours` | NUMERIC(5, 2) |  |  |  |
| `criteria_json` | VARCHAR |  |  |  |
| `audience` | VARCHAR | NOT NULL |  | all |
| `club_id` | UUID |  |  |  |
| `academy_cohort_id` | UUID |  |  |  |
| `format` | VARCHAR | NOT NULL |  | participatory |
| `winner_submission_id` | UUID |  |  |  |
| `series_slug` | VARCHAR |  |  |  |
| `series_order` | INTEGER |  |  |  |
| `requires_challenge_id` | UUID |  |  |  |
| `is_active` | BOOLEAN | NOT NULL |  |  |
| `is_public` | BOOLEAN | NOT NULL |  | true |
| `show_winner_media_publicly` | BOOLEAN | NOT NULL |  | true |
| `starts_at` | DATETIME |  |  |  |
| `ends_at` | DATETIME |  |  |  |
| `team_enabled` | BOOLEAN | NOT NULL |  | false |
| `team_min_size` | SMALLINT |  |  |  |
| `team_max_size` | SMALLINT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `clubs`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `name` | VARCHAR | NOT NULL |  |  |
| `slug` | VARCHAR | NOT NULL | idx, uniq |  |
| `description` | VARCHAR |  |  |  |
| `location` | VARCHAR |  |  |  |
| `is_active` | BOOLEAN | NOT NULL |  | true |
| `default_session_day` | VARCHAR(3) | NOT NULL |  | sat |
| `default_session_time` | TIME | NOT NULL |  | 09:00 |
| `default_session_duration_minutes` | INTEGER | NOT NULL |  | 180 |
| `default_pool_id` | UUID |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `coach_agreements`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `coach_profile_id` | UUID | NOT NULL | FK→coach_profiles.id, idx |  |
| `agreement_version` | VARCHAR(20) | NOT NULL |  |  |
| `agreement_content_hash` | VARCHAR(64) | NOT NULL |  |  |
| `signature_type` | VARCHAR(20) | NOT NULL |  |  |
| `signature_data` | TEXT | NOT NULL |  |  |
| `signature_media_id` | UUID |  |  |  |
| `signed_at` | DATETIME | NOT NULL |  |  |
| `handbook_acknowledged` | BOOLEAN | NOT NULL |  | false |
| `handbook_version` | VARCHAR(20) |  |  |  |
| `ip_address` | VARCHAR(45) |  |  |  |
| `user_agent` | TEXT |  |  |  |
| `is_active` | BOOLEAN | NOT NULL |  | true |
| `superseded_by_id` | UUID |  | FK→coach_agreements.id |  |
| `superseded_at` | DATETIME |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `coach_bank_accounts`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_id` | UUID | NOT NULL | FK→members.id, uniq |  |
| `bank_code` | VARCHAR(10) | NOT NULL |  |  |
| `bank_name` | VARCHAR(100) | NOT NULL |  |  |
| `account_number` | VARCHAR(20) | NOT NULL |  |  |
| `account_name` | VARCHAR(200) | NOT NULL |  |  |
| `paystack_recipient_code` | VARCHAR(50) |  |  |  |
| `is_verified` | BOOLEAN | NOT NULL |  | false |
| `verified_at` | DATETIME |  |  |  |
| `verified_by` | VARCHAR |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `coach_profiles`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_id` | UUID | NOT NULL | FK→members.id, uniq |  |
| `display_name` | VARCHAR |  |  |  |
| `coach_profile_photo_media_id` | UUID |  |  |  |
| `short_bio` | VARCHAR |  |  |  |
| `full_bio` | TEXT |  |  |  |
| `certifications` | ARRAY |  |  |  |
| `other_certifications_note` | TEXT |  |  |  |
| `coaching_years` | INTEGER | NOT NULL |  | 0 |
| `coaching_experience_summary` | TEXT |  |  |  |
| `coaching_specialties` | ARRAY |  |  |  |
| `levels_taught` | ARRAY |  |  |  |
| `age_groups_taught` | ARRAY |  |  |  |
| `preferred_cohort_types` | ARRAY |  |  |  |
| `languages_spoken` | ARRAY |  |  |  |
| `coaching_portfolio_link` | VARCHAR |  |  |  |
| `coaching_document_link` | VARCHAR |  |  |  |
| `coaching_document_file_name` | VARCHAR |  |  |  |
| `learn_to_swim_grade` | VARCHAR |  |  |  |
| `special_populations_grade` | VARCHAR |  |  |  |
| `institutional_grade` | VARCHAR |  |  |  |
| `competitive_elite_grade` | VARCHAR |  |  |  |
| `certifications_grade` | VARCHAR |  |  |  |
| `specialized_disciplines_grade` | VARCHAR |  |  |  |
| `adjacent_services_grade` | VARCHAR |  |  |  |
| `total_coaching_hours` | INTEGER | NOT NULL |  | 0 |
| `cohorts_completed` | INTEGER | NOT NULL |  | 0 |
| `average_feedback_rating` | FLOAT |  |  |  |
| `swimbuddz_level` | INTEGER |  |  |  |
| `last_active_date` | DATE |  |  |  |
| `first_aid_cert_expiry` | DATE |  |  |  |
| `has_cpr_training` | BOOLEAN | NOT NULL |  | false |
| `cpr_expiry_date` | DATETIME |  |  |  |
| `lifeguard_expiry_date` | DATETIME |  |  |  |
| `background_check_status` | VARCHAR | NOT NULL |  | not_required |
| `background_check_document_media_id` | UUID |  |  |  |
| `insurance_status` | VARCHAR | NOT NULL |  | none |
| `is_verified` | BOOLEAN | NOT NULL |  | false |
| `pools_supported` | ARRAY |  |  |  |
| `can_travel_between_pools` | BOOLEAN | NOT NULL |  | false |
| `travel_radius_km` | FLOAT |  |  |  |
| `max_swimmers_per_session` | INTEGER | NOT NULL |  | 10 |
| `max_cohorts_at_once` | INTEGER | NOT NULL |  | 1 |
| `accepts_one_on_one` | BOOLEAN | NOT NULL |  | true |
| `accepts_group_cohorts` | BOOLEAN | NOT NULL |  | true |
| `availability_calendar` | JSONB |  |  |  |
| `currency` | VARCHAR | NOT NULL |  | NGN |
| `one_to_one_rate_per_hour` | INTEGER |  |  |  |
| `group_session_rate_per_hour` | INTEGER |  |  |  |
| `academy_cohort_stipend` | INTEGER |  |  |  |
| `status` | VARCHAR | NOT NULL |  | draft |
| `application_submitted_at` | DATETIME |  |  |  |
| `application_reviewed_at` | DATETIME |  |  |  |
| `application_reviewed_by` | VARCHAR |  |  |  |
| `rejection_reason` | TEXT |  |  |  |
| `show_in_directory` | BOOLEAN | NOT NULL |  | true |
| `is_featured` | BOOLEAN | NOT NULL |  | false |
| `average_rating` | FLOAT | NOT NULL |  | 0.0 |
| `rating_count` | INTEGER | NOT NULL |  | 0 |
| `admin_notes` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `guardian_links`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `minor_member_id` | UUID | NOT NULL | FK→members.id, idx |  |
| `guardian_member_id` | UUID | NOT NULL | FK→members.id, idx |  |
| `relationship` | VARCHAR(14) | NOT NULL |  |  |
| `is_active` | BOOLEAN | NOT NULL |  | true |
| `verified_at` | DATETIME |  |  |  |
| `verified_by` | UUID |  |  |  |
| `notes` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `ck_guardian_link_distinct_members` (CheckConstraint)

### `handbook_versions`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `version` | VARCHAR(20) | NOT NULL | uniq |  |
| `title` | VARCHAR(200) | NOT NULL |  |  |
| `content` | TEXT | NOT NULL |  |  |
| `content_hash` | VARCHAR(64) | NOT NULL |  |  |
| `effective_date` | DATE | NOT NULL |  |  |
| `is_current` | BOOLEAN | NOT NULL |  | false |
| `created_by_id` | UUID |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `legacy_volunteer_interests`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `role_id` | UUID | NOT NULL |  |  |
| `member_id` | UUID | NOT NULL |  |  |
| `status` | VARCHAR | NOT NULL |  |  |
| `notes` | VARCHAR |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `legacy_volunteer_roles`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `title` | VARCHAR | NOT NULL |  |  |
| `description` | VARCHAR |  |  |  |
| `category` | VARCHAR | NOT NULL |  |  |
| `is_active` | BOOLEAN | NOT NULL |  |  |
| `slots_available` | INTEGER |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `member_availabilities`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_id` | UUID | NOT NULL | FK→members.id, uniq |  |
| `available_days` | ARRAY |  |  |  |
| `preferred_times` | ARRAY |  |  |  |
| `preferred_locations` | ARRAY |  |  |  |
| `accessible_facilities` | ARRAY |  |  |  |
| `travel_flexibility` | VARCHAR |  |  |  |
| `equipment_needed` | ARRAY |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `member_challenge_completions`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_id` | UUID | NOT NULL |  |  |
| `challenge_id` | UUID | NOT NULL |  |  |
| `submitted_by_member_id` | UUID |  |  |  |
| `submission_note` | TEXT |  |  |  |
| `is_team_submission` | BOOLEAN | NOT NULL |  | false |
| `status` | VARCHAR | NOT NULL |  | pending |
| `reviewed_at` | DATETIME |  |  |  |
| `reviewed_by` | UUID |  |  |  |
| `reviewed_by_kind` | VARCHAR |  |  |  |
| `review_note` | TEXT |  |  |  |
| `revoked_at` | DATETIME |  |  |  |
| `revoked_by` | UUID |  |  |  |
| `revoke_note` | TEXT |  |  |  |
| `rewards_distributed_at` | DATETIME |  |  |  |
| `completed_at` | DATETIME | NOT NULL |  |  |
| `result_data` | VARCHAR |  |  |  |
| `verified_by` | UUID |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `member_emergency_contacts`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_id` | UUID | NOT NULL | FK→members.id, uniq |  |
| `name` | VARCHAR |  |  |  |
| `contact_relationship` | VARCHAR |  |  |  |
| `phone` | VARCHAR |  |  |  |
| `region` | VARCHAR |  |  |  |
| `medical_info` | VARCHAR |  |  |  |
| `safety_notes` | VARCHAR |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `member_memberships`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_id` | UUID | NOT NULL | FK→members.id, uniq |  |
| `primary_tier` | VARCHAR | NOT NULL |  | community |
| `active_tiers` | ARRAY |  |  |  |
| `requested_tiers` | ARRAY |  |  |  |
| `community_paid_until` | DATETIME |  |  |  |
| `club_paid_until` | DATETIME |  |  |  |
| `academy_paid_until` | DATETIME |  |  |  |
| `pending_payment_reference` | VARCHAR(50) |  | idx |  |
| `club_badges_earned` | ARRAY |  |  |  |
| `club_challenges_completed` | JSONB |  |  |  |
| `punctuality_score` | INTEGER | NOT NULL |  | 0 |
| `commitment_score` | INTEGER | NOT NULL |  | 0 |
| `club_notes` | VARCHAR |  |  |  |
| `academy_skill_assessment` | JSONB |  |  |  |
| `academy_goals` | VARCHAR |  |  |  |
| `academy_preferred_coach_gender` | VARCHAR |  |  |  |
| `academy_lesson_preference` | VARCHAR |  |  |  |
| `academy_certifications` | ARRAY |  |  |  |
| `academy_graduation_dates` | JSONB |  |  |  |
| `academy_alumni` | BOOLEAN | NOT NULL |  | false |
| `academy_focus_areas` | ARRAY |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `member_preferences`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_id` | UUID | NOT NULL | FK→members.id, uniq |  |
| `language_preference` | VARCHAR |  |  |  |
| `comms_preference` | VARCHAR |  |  |  |
| `payment_readiness` | VARCHAR |  |  |  |
| `currency_preference` | VARCHAR |  |  |  |
| `consent_photo` | VARCHAR |  |  |  |
| `community_rules_accepted` | BOOLEAN | NOT NULL |  | false |
| `volunteer_interest` | ARRAY |  |  |  |
| `volunteer_roles_detail` | VARCHAR |  |  |  |
| `discovery_source` | VARCHAR |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `member_profiles`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_id` | UUID | NOT NULL | FK→members.id, uniq |  |
| `phone` | VARCHAR |  |  |  |
| `address` | VARCHAR |  |  |  |
| `city` | VARCHAR |  |  |  |
| `state` | VARCHAR |  |  |  |
| `country` | VARCHAR |  |  |  |
| `time_zone` | VARCHAR |  |  |  |
| `gender` | VARCHAR |  |  |  |
| `date_of_birth` | DATETIME |  |  |  |
| `occupation` | VARCHAR |  |  |  |
| `area_in_lagos` | VARCHAR |  |  |  |
| `swim_level` | VARCHAR |  |  |  |
| `deep_water_comfort` | VARCHAR |  |  |  |
| `strokes` | ARRAY |  |  |  |
| `interests` | ARRAY |  |  |  |
| `personal_goals` | VARCHAR |  |  |  |
| `how_found_us` | VARCHAR |  |  |  |
| `acquisition_source` | VARCHAR(16) |  |  |  |
| `previous_communities` | VARCHAR |  |  |  |
| `hopes_from_swimbuddz` | VARCHAR |  |  |  |
| `social_instagram` | VARCHAR |  |  |  |
| `social_linkedin` | VARCHAR |  |  |  |
| `social_other` | VARCHAR |  |  |  |
| `show_in_directory` | BOOLEAN | NOT NULL |  | true |
| `interest_tags` | ARRAY |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `members`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `auth_id` | VARCHAR | NOT NULL | idx, uniq |  |
| `email` | VARCHAR | NOT NULL | idx, uniq |  |
| `first_name` | VARCHAR | NOT NULL |  |  |
| `last_name` | VARCHAR | NOT NULL |  |  |
| `is_active` | BOOLEAN | NOT NULL |  |  |
| `registration_complete` | BOOLEAN | NOT NULL |  |  |
| `roles` | ARRAY | NOT NULL |  | {member} |
| `approval_status` | VARCHAR | NOT NULL |  | pending |
| `approval_notes` | VARCHAR |  |  |  |
| `approved_at` | DATETIME |  |  |  |
| `approved_by` | VARCHAR |  |  |  |
| `profile_photo_media_id` | UUID |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `pending_registrations`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `email` | VARCHAR | NOT NULL | idx, uniq |  |
| `profile_data_json` | VARCHAR | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `pod_assignments`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `pod_id` | UUID | NOT NULL | FK→pods.id |  |
| `member_id` | UUID | NOT NULL | FK→members.id, idx |  |
| `joined_at` | DATETIME | NOT NULL |  |  |
| `left_at` | DATETIME |  |  |  |
| `assigned_by` | VARCHAR(13) | NOT NULL |  |  |
| `assigned_by_id` | UUID |  |  |  |

### `pods`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `club_id` | UUID | NOT NULL | FK→clubs.id, idx |  |
| `name` | VARCHAR(120) | NOT NULL |  |  |
| `slug` | VARCHAR(120) | NOT NULL |  |  |
| `handle` | VARCHAR(60) |  |  |  |
| `description` | TEXT |  |  |  |
| `pod_lead_id` | UUID | NOT NULL | FK→members.id, idx |  |
| `assistant_pod_lead_id` | UUID |  | FK→members.id |  |
| `min_size` | INTEGER | NOT NULL |  | 2 |
| `max_size` | INTEGER | NOT NULL |  | 5 |
| `default_session_day` | VARCHAR(3) | NOT NULL |  |  |
| `default_session_time` | TIME | NOT NULL |  |  |
| `default_session_duration_minutes` | INTEGER | NOT NULL |  | 180 |
| `default_pool_id` | UUID |  |  |  |
| `visibility` | VARCHAR(7) | NOT NULL |  | public |
| `status` | VARCHAR(8) | NOT NULL |  | active |
| `cycle_started_at` | DATETIME | NOT NULL |  |  |
| `review_due_at` | DATETIME | NOT NULL |  |  |
| `dissolved_at` | DATETIME |  |  |  |
| `created_by` | UUID | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `uq_pods_club_slug` (UniqueConstraint)

### `swim_assessments`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_id` | UUID |  | FK→members.id, idx |  |
| `answers` | JSONB | NOT NULL |  |  |
| `total_score` | INTEGER | NOT NULL |  |  |
| `raw_score` | INTEGER | NOT NULL |  |  |
| `level` | VARCHAR | NOT NULL | idx |  |
| `dimension_scores` | JSONB | NOT NULL |  |  |
| `ip_hash` | VARCHAR |  |  |  |
| `user_agent` | VARCHAR |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

## sessions_service

### `session_bookings`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `session_id` | UUID | NOT NULL | idx |  |
| `member_id` | UUID | NOT NULL | idx |  |
| `member_auth_id` | TEXT | NOT NULL | idx |  |
| `status` | VARCHAR(9) | NOT NULL |  | pending |
| `channel` | VARCHAR(14) | NOT NULL |  | member_self |
| `fee_amount_kobo` | INTEGER | NOT NULL |  | 0 |
| `payment_intent_id` | UUID |  | idx |  |
| `wallet_transaction_id` | UUID |  |  |  |
| `corporate_program_id` | UUID |  | idx |  |
| `notes` | TEXT |  |  |  |
| `booked_at` | DATETIME | NOT NULL |  |  |
| `confirmed_at` | DATETIME |  |  |  |
| `cancelled_at` | DATETIME |  |  |  |
| `expires_at` | DATETIME |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `uq_session_bookings_session_member` (UniqueConstraint)

### `session_bundle_carts`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_auth_id` | VARCHAR | NOT NULL | idx |  |
| `session_ids` | JSONB | NOT NULL |  |  |
| `status` | VARCHAR(16) | NOT NULL |  | open |
| `created_at` | DATETIME | NOT NULL |  | now() |
| `updated_at` | DATETIME | NOT NULL |  | now() |
| `expires_at` | DATETIME |  |  |  |

### `session_coaches`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `session_id` | UUID | NOT NULL | FK→sessions.id, idx |  |
| `coach_id` | UUID | NOT NULL | idx |  |
| `role` | VARCHAR | NOT NULL |  | lead |
| `created_at` | DATETIME | NOT NULL |  |  |

### `session_templates`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `title` | VARCHAR | NOT NULL |  |  |
| `description` | TEXT |  |  |  |
| `session_type` | VARCHAR(12) | NOT NULL |  |  |
| `pool_id` | UUID |  | idx |  |
| `location` | VARCHAR |  |  |  |
| `location_name` | VARCHAR |  |  |  |
| `capacity` | INTEGER | NOT NULL |  | 20 |
| `pool_fee` | INTEGER | NOT NULL |  | 0 |
| `ride_share_fee` | INTEGER | NOT NULL |  | 0 |
| `ride_share_config` | JSONB |  |  |  |
| `day_of_week` | INTEGER | NOT NULL |  |  |
| `start_time` | TIME | NOT NULL |  |  |
| `duration_minutes` | INTEGER | NOT NULL |  |  |
| `auto_generate` | BOOLEAN | NOT NULL |  | false |
| `is_active` | BOOLEAN | NOT NULL |  | true |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `sessions`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `session_type` | VARCHAR(12) | NOT NULL |  | club |
| `status` | VARCHAR(11) | NOT NULL |  | scheduled |
| `title` | VARCHAR | NOT NULL |  |  |
| `description` | TEXT |  |  |  |
| `notes` | TEXT |  |  |  |
| `starts_at` | DATETIME | NOT NULL |  |  |
| `ends_at` | DATETIME | NOT NULL |  |  |
| `timezone` | VARCHAR | NOT NULL |  | Africa/Lagos |
| `pool_id` | UUID |  | idx |  |
| `location` | VARCHAR(19) |  |  |  |
| `location_name` | VARCHAR |  |  |  |
| `location_address` | VARCHAR |  |  |  |
| `capacity` | INTEGER | NOT NULL |  | 20 |
| `pool_fee` | INTEGER | NOT NULL |  | 0 |
| `ride_share_fee` | INTEGER | NOT NULL |  | 0 |
| `cohort_id` | UUID |  | idx |  |
| `event_id` | UUID |  | idx |  |
| `pod_id` | UUID |  | idx |  |
| `week_number` | INTEGER |  |  |  |
| `lesson_title` | VARCHAR |  |  |  |
| `template_id` | UUID |  | FK→session_templates.id |  |
| `is_recurring_instance` | BOOLEAN | NOT NULL |  | false |
| `published_at` | DATETIME |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `ck_sessions_discriminator` (CheckConstraint)

## academy_service

### `coach_assignments`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `cohort_id` | UUID | NOT NULL | FK→cohorts.id, idx |  |
| `coach_id` | UUID | NOT NULL | idx |  |
| `role` | VARCHAR(20) | NOT NULL |  |  |
| `start_date` | DATETIME | NOT NULL |  |  |
| `end_date` | DATETIME |  |  |  |
| `assigned_by_id` | UUID | NOT NULL |  |  |
| `status` | VARCHAR(20) | NOT NULL |  |  |
| `notes` | TEXT |  |  |  |
| `is_session_override` | BOOLEAN | NOT NULL |  | false |
| `session_date` | DATE |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `cohort_complexity_scores`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `cohort_id` | UUID | NOT NULL | FK→cohorts.id, uniq |  |
| `category` | VARCHAR | NOT NULL |  |  |
| `dimension_1_score` | INTEGER | NOT NULL |  |  |
| `dimension_1_rationale` | TEXT |  |  |  |
| `dimension_2_score` | INTEGER | NOT NULL |  |  |
| `dimension_2_rationale` | TEXT |  |  |  |
| `dimension_3_score` | INTEGER | NOT NULL |  |  |
| `dimension_3_rationale` | TEXT |  |  |  |
| `dimension_4_score` | INTEGER | NOT NULL |  |  |
| `dimension_4_rationale` | TEXT |  |  |  |
| `dimension_5_score` | INTEGER | NOT NULL |  |  |
| `dimension_5_rationale` | TEXT |  |  |  |
| `dimension_6_score` | INTEGER | NOT NULL |  |  |
| `dimension_6_rationale` | TEXT |  |  |  |
| `dimension_7_score` | INTEGER | NOT NULL |  |  |
| `dimension_7_rationale` | TEXT |  |  |  |
| `total_score` | INTEGER | NOT NULL |  |  |
| `required_coach_grade` | VARCHAR | NOT NULL |  |  |
| `pay_band_min` | INTEGER | NOT NULL |  |  |
| `pay_band_max` | INTEGER | NOT NULL |  |  |
| `scored_by_id` | UUID | NOT NULL |  |  |
| `scored_at` | DATETIME | NOT NULL |  |  |
| `reviewed_by_id` | UUID |  |  |  |
| `reviewed_at` | DATETIME |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `cohort_extension_requests`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `cohort_id` | UUID | NOT NULL | FK→cohorts.id, idx |  |
| `coach_id` | UUID | NOT NULL | idx |  |
| `weeks_requested` | INTEGER | NOT NULL |  |  |
| `reason` | TEXT | NOT NULL |  |  |
| `current_end_date` | DATETIME | NOT NULL |  |  |
| `proposed_end_date` | DATETIME | NOT NULL |  |  |
| `status` | VARCHAR(8) | NOT NULL |  |  |
| `reviewed_by_id` | UUID |  |  |  |
| `admin_notes` | TEXT |  |  |  |
| `reviewed_at` | DATETIME |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `cohort_resources`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `cohort_id` | UUID | NOT NULL | FK→cohorts.id |  |
| `title` | VARCHAR | NOT NULL |  |  |
| `resource_type` | VARCHAR | NOT NULL |  |  |
| `description` | TEXT |  |  |  |
| `source_type` | VARCHAR(6) | NOT NULL |  | url |
| `content_media_id` | UUID |  |  |  |
| `storage_path` | VARCHAR |  |  |  |
| `mime_type` | VARCHAR |  |  |  |
| `file_size_bytes` | INTEGER |  |  |  |
| `visibility` | VARCHAR(13) | NOT NULL |  | enrolled_only |
| `week_number` | INTEGER |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `cohort_timeline_shift_logs`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `cohort_id` | UUID | NOT NULL | idx |  |
| `idempotency_key` | VARCHAR |  |  |  |
| `actor_auth_id` | VARCHAR |  |  |  |
| `actor_member_id` | UUID |  |  |  |
| `reason` | TEXT |  |  |  |
| `old_start_date` | DATETIME | NOT NULL |  |  |
| `old_end_date` | DATETIME | NOT NULL |  |  |
| `new_start_date` | DATETIME | NOT NULL |  |  |
| `new_end_date` | DATETIME | NOT NULL |  |  |
| `delta_seconds` | INTEGER | NOT NULL |  |  |
| `options_json` | JSON | NOT NULL |  |  |
| `results_json` | JSON | NOT NULL |  |  |
| `warnings` | JSON | NOT NULL |  | [] |
| `created_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `uq_cohort_timeline_shift_logs_idempotency` (UniqueConstraint)

### `cohorts`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `program_id` | UUID | NOT NULL | FK→programs.id |  |
| `name` | VARCHAR | NOT NULL |  |  |
| `start_date` | DATETIME | NOT NULL |  |  |
| `end_date` | DATETIME | NOT NULL |  |  |
| `capacity` | INTEGER | NOT NULL |  |  |
| `type` | VARCHAR(11) | NOT NULL |  | group |
| `corporate_program_id` | UUID |  | idx |  |
| `timezone` | VARCHAR | NOT NULL |  | Africa/Lagos |
| `location_type` | VARCHAR(10) | NOT NULL |  | pool |
| `location_name` | VARCHAR |  |  |  |
| `location_address` | VARCHAR |  |  |  |
| `pool_id` | UUID |  | idx |  |
| `coach_id` | UUID |  |  |  |
| `price_override` | INTEGER |  |  |  |
| `default_pool_fee` | INTEGER |  |  |  |
| `default_ride_configs` | JSON |  |  |  |
| `status` | VARCHAR(9) | NOT NULL |  |  |
| `allow_mid_entry` | BOOLEAN | NOT NULL |  | false |
| `mid_entry_cutoff_week` | INTEGER | NOT NULL |  | 2 |
| `require_approval` | BOOLEAN | NOT NULL |  | false |
| `admin_dropout_approval` | BOOLEAN | NOT NULL |  | false |
| `notes_internal` | TEXT |  |  |  |
| `installment_plan_enabled` | BOOLEAN | NOT NULL |  | false |
| `installment_count` | INTEGER |  |  |  |
| `installment_deposit_amount` | INTEGER |  |  |  |
| `required_coach_grade` | VARCHAR |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `curriculum_lessons`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `week_id` | UUID | NOT NULL | FK→curriculum_weeks.id, idx |  |
| `title` | VARCHAR | NOT NULL |  |  |
| `description` | TEXT |  |  |  |
| `duration_minutes` | INTEGER |  |  |  |
| `order_index` | INTEGER | NOT NULL |  | 0 |
| `video_media_id` | UUID |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `curriculum_weeks`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `curriculum_id` | UUID | NOT NULL | FK→program_curricula.id, idx |  |
| `week_number` | INTEGER | NOT NULL |  |  |
| `theme` | VARCHAR | NOT NULL |  |  |
| `objectives` | TEXT |  |  |  |
| `order_index` | INTEGER | NOT NULL |  | 0 |
| `created_at` | DATETIME | NOT NULL |  |  |

### `enrollment_installments`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `enrollment_id` | UUID | NOT NULL | FK→enrollments.id, idx |  |
| `installment_number` | INTEGER | NOT NULL |  |  |
| `amount` | INTEGER | NOT NULL |  |  |
| `due_at` | DATETIME | NOT NULL |  |  |
| `status` | VARCHAR(7) | NOT NULL |  | pending |
| `paid_at` | DATETIME |  |  |  |
| `payment_reference` | VARCHAR |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `uq_enrollment_installment_number` (UniqueConstraint)

### `enrollments`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `program_id` | UUID |  | FK→programs.id, idx |  |
| `cohort_id` | UUID |  | FK→cohorts.id, idx |  |
| `member_id` | UUID | NOT NULL | idx |  |
| `member_auth_id` | VARCHAR |  | idx |  |
| `preferences` | JSON |  |  |  |
| `status` | VARCHAR(16) | NOT NULL |  |  |
| `payment_status` | VARCHAR(14) | NOT NULL |  |  |
| `price_snapshot_amount` | INTEGER |  |  |  |
| `currency_snapshot` | VARCHAR |  |  |  |
| `payment_reference` | VARCHAR |  |  |  |
| `paid_at` | DATETIME |  |  |  |
| `total_installments` | INTEGER | NOT NULL |  | 0 |
| `paid_installments_count` | INTEGER | NOT NULL |  | 0 |
| `missed_installments_count` | INTEGER | NOT NULL |  | 0 |
| `access_suspended` | BOOLEAN | NOT NULL |  | false |
| `uses_installments` | BOOLEAN | NOT NULL |  | false |
| `enrolled_at` | DATETIME |  |  |  |
| `dropped_at` | DATETIME |  |  |  |
| `source` | VARCHAR(7) | NOT NULL |  | web |
| `reminders_sent` | JSON | NOT NULL |  | [] |
| `certificate_issued_at` | DATETIME |  |  |  |
| `certificate_code` | VARCHAR(50) |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `lesson_skills`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `lesson_id` | UUID | NOT NULL | FK→curriculum_lessons.id, idx |  |
| `skill_id` | UUID | NOT NULL | FK→skills.id, idx |  |

### `milestone_review_events`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `progress_id` | UUID | NOT NULL | FK→student_progress.id, idx |  |
| `enrollment_id` | UUID | NOT NULL | idx |  |
| `milestone_id` | UUID | NOT NULL | idx |  |
| `event_type` | VARCHAR(14) | NOT NULL |  |  |
| `actor_id` | UUID | NOT NULL |  |  |
| `actor_role` | VARCHAR(20) | NOT NULL |  |  |
| `previous_status` | VARCHAR(8) |  |  |  |
| `new_status` | VARCHAR(8) | NOT NULL |  |  |
| `student_notes_snapshot` | TEXT |  |  |  |
| `coach_notes_snapshot` | TEXT |  |  |  |
| `evidence_media_id_snapshot` | UUID |  |  |  |
| `score_snapshot` | INTEGER |  |  |  |
| `override_of_event_id` | UUID |  | FK→milestone_review_events.id, idx |  |
| `override_reason` | TEXT |  |  |  |
| `ai_metadata` | JSONB |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `milestones`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `program_id` | UUID | NOT NULL | FK→programs.id |  |
| `name` | VARCHAR | NOT NULL |  |  |
| `criteria` | TEXT |  |  |  |
| `video_media_id` | UUID |  |  |  |
| `order_index` | INTEGER | NOT NULL |  | 0 |
| `milestone_type` | VARCHAR(10) | NOT NULL |  | skill |
| `rubric_json` | JSON |  |  |  |
| `required_evidence` | VARCHAR(10) | NOT NULL |  | none |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `program_curricula`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `program_id` | UUID | NOT NULL | FK→programs.id, idx |  |
| `version` | INTEGER | NOT NULL |  | 1 |
| `is_active` | BOOLEAN | NOT NULL |  | true |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `program_interests`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `program_id` | UUID | NOT NULL | FK→programs.id, idx |  |
| `member_id` | UUID | NOT NULL | idx |  |
| `member_auth_id` | VARCHAR | NOT NULL | idx |  |
| `email` | VARCHAR |  |  |  |
| `notified_at` | DATETIME |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `programs`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `name` | VARCHAR | NOT NULL |  |  |
| `slug` | VARCHAR |  | uniq |  |
| `description` | TEXT |  |  |  |
| `cover_image_media_id` | UUID |  |  |  |
| `level` | VARCHAR(12) | NOT NULL |  |  |
| `duration_weeks` | INTEGER | NOT NULL |  |  |
| `default_capacity` | INTEGER | NOT NULL |  | 10 |
| `currency` | VARCHAR | NOT NULL |  | NGN |
| `price_amount` | INTEGER | NOT NULL |  | 0 |
| `billing_type` | VARCHAR(12) | NOT NULL |  | one_time |
| `curriculum_json` | JSON |  |  |  |
| `prep_materials` | JSON |  |  |  |
| `faq_json` | JSON |  |  |  |
| `version` | INTEGER | NOT NULL |  | 1 |
| `is_published` | BOOLEAN | NOT NULL |  | false |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `shadow_evaluations`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `assignment_id` | UUID | NOT NULL | FK→coach_assignments.id, idx |  |
| `evaluator_id` | UUID | NOT NULL |  |  |
| `session_date` | DATE | NOT NULL |  |  |
| `scores` | JSON | NOT NULL |  |  |
| `feedback` | TEXT |  |  |  |
| `recommendation` | VARCHAR(30) | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `skills`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `name` | VARCHAR | NOT NULL |  |  |
| `category` | VARCHAR | NOT NULL |  |  |
| `description` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `student_progress`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `enrollment_id` | UUID | NOT NULL | FK→enrollments.id |  |
| `milestone_id` | UUID | NOT NULL | FK→milestones.id |  |
| `status` | VARCHAR(8) | NOT NULL |  |  |
| `achieved_at` | DATETIME |  |  |  |
| `evidence_media_id` | UUID |  |  |  |
| `score` | INTEGER |  |  |  |
| `reviewed_by_coach_id` | UUID |  |  |  |
| `reviewed_at` | DATETIME |  |  |  |
| `student_notes` | TEXT |  |  |  |
| `coach_notes` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

## attendance_service

### `attendance_records`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `session_id` | UUID | NOT NULL | idx |  |
| `member_id` | UUID | NOT NULL | idx |  |
| `status` | VARCHAR(9) | NOT NULL |  |  |
| `role` | VARCHAR(9) | NOT NULL |  |  |
| `notes` | VARCHAR |  |  |  |
| `wallet_transaction_id` | UUID |  |  |  |
| `booking_id` | UUID |  | idx |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `uq_session_member_attendance` (UniqueConstraint)

## payments_service

### `coach_payouts`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `coach_member_id` | UUID | NOT NULL | idx |  |
| `period_start` | DATETIME | NOT NULL |  |  |
| `period_end` | DATETIME | NOT NULL |  |  |
| `period_label` | VARCHAR(50) | NOT NULL |  |  |
| `academy_earnings` | INTEGER | NOT NULL |  |  |
| `session_earnings` | INTEGER | NOT NULL |  |  |
| `other_earnings` | INTEGER | NOT NULL |  |  |
| `total_amount` | INTEGER | NOT NULL |  |  |
| `currency` | VARCHAR(8) | NOT NULL |  |  |
| `status` | VARCHAR(10) | NOT NULL |  |  |
| `payout_method` | VARCHAR(17) |  |  |  |
| `approved_by` | VARCHAR |  |  |  |
| `approved_at` | DATETIME |  |  |  |
| `paid_at` | DATETIME |  |  |  |
| `payment_reference` | VARCHAR(100) |  |  |  |
| `paystack_transfer_code` | VARCHAR(50) |  |  |  |
| `paystack_transfer_status` | VARCHAR(20) |  |  |  |
| `admin_notes` | TEXT |  |  |  |
| `failure_reason` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `cohort_makeup_obligations`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `cohort_id` | UUID | NOT NULL | idx |  |
| `student_member_id` | UUID | NOT NULL | idx |  |
| `coach_member_id` | UUID | NOT NULL | idx |  |
| `original_session_id` | UUID |  |  |  |
| `scheduled_session_id` | UUID |  | idx |  |
| `reason` | VARCHAR(17) | NOT NULL |  |  |
| `status` | VARCHAR(9) | NOT NULL | idx |  |
| `completed_at` | DATETIME |  |  |  |
| `pay_credited_in_payout_id` | UUID |  |  |  |
| `notes` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `discounts`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `code` | VARCHAR(50) | NOT NULL | idx, uniq |  |
| `description` | VARCHAR(255) |  |  |  |
| `discount_type` | VARCHAR(10) | NOT NULL |  |  |
| `value` | FLOAT | NOT NULL |  |  |
| `applies_to` | JSONB |  |  |  |
| `valid_from` | DATETIME |  |  |  |
| `valid_until` | DATETIME |  |  |  |
| `max_uses` | INTEGER |  |  |  |
| `current_uses` | INTEGER | NOT NULL |  |  |
| `max_uses_per_user` | INTEGER |  |  |  |
| `is_active` | BOOLEAN | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `payments`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `reference` | VARCHAR | NOT NULL | idx, uniq |  |
| `member_auth_id` | VARCHAR | NOT NULL | idx |  |
| `payer_email` | VARCHAR |  | idx |  |
| `purpose` | VARCHAR(15) | NOT NULL |  |  |
| `amount` | FLOAT | NOT NULL |  |  |
| `currency` | VARCHAR(8) | NOT NULL |  |  |
| `status` | VARCHAR(14) | NOT NULL |  |  |
| `provider` | VARCHAR(32) |  |  |  |
| `provider_reference` | VARCHAR(128) |  | idx |  |
| `paid_at` | DATETIME |  |  |  |
| `payment_method` | VARCHAR(32) |  |  |  |
| `proof_of_payment_media_id` | UUID |  |  |  |
| `admin_review_note` | TEXT |  |  |  |
| `entitlement_applied_at` | DATETIME |  |  |  |
| `entitlement_error` | TEXT |  |  |  |
| `metadata` | JSONB |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `recurring_payout_configs`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `coach_member_id` | UUID | NOT NULL | idx |  |
| `cohort_id` | UUID | NOT NULL | idx |  |
| `band_percentage` | NUMERIC(5, 2) | NOT NULL |  |  |
| `total_blocks` | INTEGER | NOT NULL |  |  |
| `block_length_days` | INTEGER | NOT NULL |  |  |
| `cohort_start_date` | DATETIME | NOT NULL |  |  |
| `cohort_end_date` | DATETIME | NOT NULL |  |  |
| `cohort_price_amount` | INTEGER | NOT NULL |  |  |
| `currency` | VARCHAR(8) | NOT NULL |  |  |
| `block_index` | INTEGER | NOT NULL |  |  |
| `next_run_date` | DATETIME | NOT NULL | idx |  |
| `status` | VARCHAR(9) | NOT NULL | idx |  |
| `created_by_member_id` | UUID |  |  |  |
| `notes` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `uq_recurring_payout_coach_cohort` (UniqueConstraint)

## wallet_service

### `corporate_wallet_members`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `corporate_wallet_id` | UUID | NOT NULL | idx |  |
| `member_wallet_id` | UUID | NOT NULL | idx |  |
| `bubbles_allocated` | INTEGER | NOT NULL |  |  |
| `is_active` | BOOLEAN | NOT NULL |  |  |
| `added_at` | DATETIME | NOT NULL |  |  |
| `added_by` | VARCHAR | NOT NULL |  |  |

### `corporate_wallets`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `wallet_id` | UUID | NOT NULL | uniq |  |
| `company_name` | VARCHAR | NOT NULL |  |  |
| `company_email` | VARCHAR | NOT NULL |  |  |
| `admin_auth_id` | VARCHAR | NOT NULL | idx |  |
| `budget_total` | INTEGER | NOT NULL |  |  |
| `budget_remaining` | INTEGER | NOT NULL |  |  |
| `member_bubble_limit` | INTEGER |  |  |  |
| `is_active` | BOOLEAN | NOT NULL |  |  |
| `corp_metadata` | JSONB |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `family_wallet_links`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `parent_wallet_id` | UUID | NOT NULL | idx |  |
| `child_wallet_id` | UUID | NOT NULL | idx |  |
| `spending_limit_per_month` | INTEGER |  |  |  |
| `spent_this_month` | INTEGER | NOT NULL |  |  |
| `month_reset_date` | DATETIME |  |  |  |
| `is_active` | BOOLEAN | NOT NULL |  |  |
| `approved_at` | DATETIME |  |  |  |
| `approved_by` | VARCHAR |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `ck_family_no_self_link` (CheckConstraint), `uq_family_link` (UniqueConstraint)

### `member_reward_history`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_auth_id` | VARCHAR | NOT NULL | idx |  |
| `reward_rule_id` | UUID | NOT NULL | idx |  |
| `wallet_event_id` | UUID |  |  |  |
| `transaction_id` | UUID |  |  |  |
| `bubbles_awarded` | INTEGER | NOT NULL |  |  |
| `period_key` | VARCHAR |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `promotional_bubble_grants`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `wallet_id` | UUID | NOT NULL | FK→wallets.id, idx |  |
| `member_auth_id` | VARCHAR | NOT NULL | idx |  |
| `grant_type` | VARCHAR(15) | NOT NULL |  |  |
| `bubbles_amount` | INTEGER | NOT NULL |  |  |
| `reason` | VARCHAR | NOT NULL |  |  |
| `campaign_code` | VARCHAR |  |  |  |
| `expires_at` | DATETIME |  |  |  |
| `bubbles_remaining` | INTEGER | NOT NULL |  |  |
| `transaction_id` | UUID |  |  |  |
| `granted_by` | VARCHAR |  |  |  |
| `grant_metadata` | JSONB |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `ck_grant_amount_positive` (CheckConstraint), `ck_grant_remaining_non_negative` (CheckConstraint), `ck_grant_remaining_lte_amount` (CheckConstraint)

### `referral_codes`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_auth_id` | VARCHAR | NOT NULL | idx, uniq |  |
| `code` | VARCHAR(20) | NOT NULL | idx, uniq |  |
| `is_active` | BOOLEAN | NOT NULL |  |  |
| `max_uses` | INTEGER |  |  |  |
| `uses_count` | INTEGER | NOT NULL |  |  |
| `successful_referrals` | INTEGER | NOT NULL |  |  |
| `last_used_at` | DATETIME |  |  |  |
| `expires_at` | DATETIME |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `referral_records`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `referrer_auth_id` | VARCHAR | NOT NULL | idx |  |
| `referee_auth_id` | VARCHAR | NOT NULL | idx, uniq |  |
| `referral_code_id` | UUID | NOT NULL |  |  |
| `status` | VARCHAR(10) | NOT NULL |  |  |
| `referrer_reward_bubbles` | INTEGER |  |  |  |
| `referee_reward_bubbles` | INTEGER |  |  |  |
| `referrer_transaction_id` | UUID |  |  |  |
| `referee_transaction_id` | UUID |  |  |  |
| `qualified_at` | DATETIME |  |  |  |
| `rewarded_at` | DATETIME |  |  |  |
| `referee_registered_at` | DATETIME |  |  |  |
| `qualification_trigger` | VARCHAR |  |  |  |
| `referral_code` | VARCHAR(20) |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `reward_alerts`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `alert_type` | VARCHAR | NOT NULL | idx |  |
| `severity` | VARCHAR(8) | NOT NULL |  |  |
| `status` | VARCHAR(12) | NOT NULL |  |  |
| `member_auth_id` | VARCHAR |  | idx |  |
| `referral_code_id` | UUID |  |  |  |
| `title` | VARCHAR | NOT NULL |  |  |
| `description` | TEXT | NOT NULL |  |  |
| `alert_data` | JSONB | NOT NULL |  |  |
| `resolved_by` | VARCHAR |  |  |  |
| `resolved_at` | DATETIME |  |  |  |
| `resolution_notes` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `reward_notification_preferences`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_auth_id` | VARCHAR | NOT NULL | idx, uniq |  |
| `notify_on_reward` | BOOLEAN | NOT NULL |  |  |
| `notify_on_referral_qualified` | BOOLEAN | NOT NULL |  |  |
| `notify_on_ambassador_milestone` | BOOLEAN | NOT NULL |  |  |
| `notify_on_streak_milestone` | BOOLEAN | NOT NULL |  |  |
| `notify_channel` | VARCHAR | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `reward_rules`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `rule_name` | VARCHAR | NOT NULL | uniq |  |
| `display_name` | VARCHAR | NOT NULL |  |  |
| `description` | TEXT |  |  |  |
| `event_type` | VARCHAR | NOT NULL | idx |  |
| `trigger_config` | JSONB |  |  |  |
| `reward_bubbles` | INTEGER | NOT NULL |  |  |
| `reward_description_template` | TEXT |  |  |  |
| `max_per_member_lifetime` | INTEGER |  |  |  |
| `max_per_member_per_period` | INTEGER |  |  |  |
| `period` | VARCHAR(5) |  |  |  |
| `replaces_rule_id` | UUID |  |  |  |
| `category` | VARCHAR(11) | NOT NULL |  |  |
| `is_active` | BOOLEAN | NOT NULL |  |  |
| `priority` | INTEGER | NOT NULL |  |  |
| `requires_admin_confirmation` | BOOLEAN | NOT NULL |  |  |
| `created_by` | VARCHAR |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `ck_reward_rules_positive_bubbles` (CheckConstraint)

### `wallet_audit_logs`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `wallet_id` | UUID | NOT NULL | idx |  |
| `action` | VARCHAR(12) | NOT NULL |  |  |
| `performed_by` | VARCHAR | NOT NULL |  |  |
| `old_value` | JSONB |  |  |  |
| `new_value` | JSONB |  |  |  |
| `reason` | VARCHAR | NOT NULL |  |  |
| `ip_address` | VARCHAR(45) |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `wallet_events`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `event_id` | UUID | NOT NULL | idx, uniq |  |
| `event_type` | VARCHAR | NOT NULL | idx |  |
| `member_auth_id` | VARCHAR | NOT NULL | idx |  |
| `member_id` | UUID |  |  |  |
| `service_source` | VARCHAR | NOT NULL |  |  |
| `occurred_at` | DATETIME | NOT NULL |  |  |
| `received_at` | DATETIME | NOT NULL |  |  |
| `event_data` | JSONB | NOT NULL |  |  |
| `idempotency_key` | VARCHAR | NOT NULL | idx, uniq |  |
| `processed` | BOOLEAN | NOT NULL |  |  |
| `processed_at` | DATETIME |  |  |  |
| `rewards_granted` | INTEGER | NOT NULL |  |  |
| `processing_error` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `wallet_topups`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `wallet_id` | UUID | NOT NULL | FK→wallets.id, idx |  |
| `member_auth_id` | VARCHAR | NOT NULL | idx |  |
| `reference` | VARCHAR | NOT NULL | idx, uniq |  |
| `bubbles_amount` | INTEGER | NOT NULL |  |  |
| `naira_amount` | INTEGER | NOT NULL |  |  |
| `exchange_rate` | INTEGER | NOT NULL |  |  |
| `payment_reference` | VARCHAR |  |  |  |
| `payment_method` | VARCHAR(13) | NOT NULL |  |  |
| `status` | VARCHAR(10) | NOT NULL |  |  |
| `paystack_authorization_url` | TEXT |  |  |  |
| `paystack_access_code` | VARCHAR |  |  |  |
| `completed_at` | DATETIME |  |  |  |
| `failed_at` | DATETIME |  |  |  |
| `failure_reason` | TEXT |  |  |  |
| `topup_metadata` | JSONB |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `ck_topup_max_bubbles` (CheckConstraint), `ck_topup_naira_positive` (CheckConstraint), `ck_topup_min_bubbles` (CheckConstraint)

### `wallet_transactions`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `wallet_id` | UUID | NOT NULL | FK→wallets.id, idx |  |
| `idempotency_key` | VARCHAR | NOT NULL | idx, uniq |  |
| `transaction_type` | VARCHAR(18) | NOT NULL |  |  |
| `direction` | VARCHAR(6) | NOT NULL |  |  |
| `amount` | INTEGER | NOT NULL |  |  |
| `balance_before` | INTEGER | NOT NULL |  |  |
| `balance_after` | INTEGER | NOT NULL |  |  |
| `status` | VARCHAR(9) | NOT NULL |  |  |
| `description` | VARCHAR | NOT NULL |  |  |
| `service_source` | VARCHAR |  |  |  |
| `reference_type` | VARCHAR |  |  |  |
| `reference_id` | VARCHAR |  |  |  |
| `initiated_by` | VARCHAR |  |  |  |
| `txn_metadata` | JSONB |  |  |  |
| `reversed_by_transaction_id` | UUID |  |  |  |
| `reversal_of_transaction_id` | UUID |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `ck_transaction_amount_positive` (CheckConstraint)

### `wallets`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_id` | UUID | NOT NULL | idx, uniq |  |
| `member_auth_id` | VARCHAR | NOT NULL | idx, uniq |  |
| `balance` | INTEGER | NOT NULL |  |  |
| `lifetime_bubbles_purchased` | INTEGER | NOT NULL |  |  |
| `lifetime_bubbles_spent` | INTEGER | NOT NULL |  |  |
| `lifetime_bubbles_received` | INTEGER | NOT NULL |  |  |
| `status` | VARCHAR(9) | NOT NULL |  |  |
| `frozen_reason` | TEXT |  |  |  |
| `frozen_at` | DATETIME |  |  |  |
| `frozen_by` | VARCHAR |  |  |  |
| `wallet_tier` | VARCHAR(8) | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `ck_wallet_balance_non_negative` (CheckConstraint)

## communications_service

### `announcement_category_configs`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `name` | VARCHAR | NOT NULL | uniq |  |
| `display_name` | VARCHAR | NOT NULL |  |  |
| `description` | TEXT |  |  |  |
| `auto_expire_hours` | INTEGER |  |  |  |
| `default_notify_email` | BOOLEAN | NOT NULL |  |  |
| `default_notify_push` | BOOLEAN | NOT NULL |  |  |
| `icon` | VARCHAR |  |  |  |
| `color` | VARCHAR |  |  |  |
| `is_active` | BOOLEAN | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `announcement_comments`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `announcement_id` | UUID | NOT NULL |  |  |
| `member_id` | UUID | NOT NULL |  |  |
| `content` | TEXT | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `announcement_reads`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `announcement_id` | UUID | NOT NULL | idx |  |
| `member_id` | UUID | NOT NULL | idx |  |
| `read_at` | DATETIME | NOT NULL |  |  |
| `acknowledged` | BOOLEAN | NOT NULL |  |  |
| `acknowledged_at` | DATETIME |  |  |  |

### `announcements`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `title` | VARCHAR | NOT NULL |  |  |
| `summary` | VARCHAR |  |  |  |
| `body` | TEXT | NOT NULL |  |  |
| `category` | VARCHAR(15) | NOT NULL |  |  |
| `custom_category` | VARCHAR |  |  |  |
| `status` | VARCHAR(9) | NOT NULL |  |  |
| `audience` | VARCHAR(9) | NOT NULL |  |  |
| `expires_at` | DATETIME |  |  |  |
| `notify_email` | BOOLEAN | NOT NULL |  |  |
| `notify_push` | BOOLEAN | NOT NULL |  |  |
| `is_pinned` | BOOLEAN | NOT NULL |  |  |
| `scheduled_for` | DATETIME |  |  |  |
| `published_at` | DATETIME |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `content_comments`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `post_id` | UUID | NOT NULL |  |  |
| `member_id` | UUID | NOT NULL |  |  |
| `content` | TEXT | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `content_posts`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `title` | VARCHAR | NOT NULL |  |  |
| `summary` | TEXT |  |  |  |
| `body` | TEXT | NOT NULL |  |  |
| `category` | VARCHAR | NOT NULL |  |  |
| `featured_image_media_id` | UUID |  |  |  |
| `published_at` | DATETIME |  |  |  |
| `is_published` | BOOLEAN | NOT NULL |  |  |
| `scheduled_for` | DATETIME |  |  |  |
| `tier_access` | VARCHAR | NOT NULL |  |  |
| `created_by` | UUID | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `message_logs`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `sender_id` | UUID | NOT NULL | idx |  |
| `recipient_type` | VARCHAR(7) | NOT NULL |  |  |
| `recipient_id` | UUID | NOT NULL | idx |  |
| `recipient_count` | INTEGER | NOT NULL |  |  |
| `subject` | VARCHAR | NOT NULL |  |  |
| `body` | TEXT | NOT NULL |  |  |
| `sent_at` | DATETIME | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `notification_preferences`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_auth_id` | VARCHAR | NOT NULL | idx, uniq |  |
| `email_announcements` | BOOLEAN | NOT NULL |  |  |
| `email_session_reminders` | BOOLEAN | NOT NULL |  |  |
| `email_academy_updates` | BOOLEAN | NOT NULL |  |  |
| `email_payment_receipts` | BOOLEAN | NOT NULL |  |  |
| `email_coach_messages` | BOOLEAN | NOT NULL |  |  |
| `email_marketing` | BOOLEAN | NOT NULL |  |  |
| `email_birthday` | BOOLEAN | NOT NULL |  | true |
| `push_announcements` | BOOLEAN | NOT NULL |  |  |
| `push_session_reminders` | BOOLEAN | NOT NULL |  |  |
| `push_academy_updates` | BOOLEAN | NOT NULL |  |  |
| `push_coach_messages` | BOOLEAN | NOT NULL |  |  |
| `subscribe_community_sessions` | BOOLEAN | NOT NULL |  |  |
| `subscribe_club_sessions` | BOOLEAN | NOT NULL |  |  |
| `subscribe_event_sessions` | BOOLEAN | NOT NULL |  |  |
| `reminder_24h_enabled` | BOOLEAN | NOT NULL |  |  |
| `reminder_3h_enabled` | BOOLEAN | NOT NULL |  |  |
| `weekly_digest` | BOOLEAN | NOT NULL |  |  |
| `weekly_session_digest` | BOOLEAN | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `notifications`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_id` | UUID | NOT NULL | idx |  |
| `type` | VARCHAR(100) | NOT NULL | idx |  |
| `category` | VARCHAR(50) | NOT NULL | idx |  |
| `title` | VARCHAR(255) | NOT NULL |  |  |
| `body` | TEXT |  |  |  |
| `icon` | VARCHAR(50) |  |  |  |
| `action_url` | VARCHAR(500) |  |  |  |
| `metadata` | JSONB |  |  |  |
| `read_at` | DATETIME |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `expires_at` | DATETIME |  |  |  |

### `scheduled_notifications`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `session_id` | UUID | NOT NULL | idx |  |
| `notification_type` | VARCHAR(17) | NOT NULL |  |  |
| `scheduled_for` | DATETIME | NOT NULL | idx |  |
| `status` | VARCHAR(9) | NOT NULL |  |  |
| `is_short_notice` | BOOLEAN | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `sent_at` | DATETIME |  |  |  |
| `error_message` | TEXT |  |  |  |

### `session_notification_logs`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `session_id` | UUID | NOT NULL | idx |  |
| `member_id` | UUID | NOT NULL | idx |  |
| `notification_type` | VARCHAR(17) | NOT NULL |  |  |
| `channel` | VARCHAR | NOT NULL |  |  |
| `sent_at` | DATETIME | NOT NULL |  |  |
| `delivery_status` | VARCHAR | NOT NULL |  |  |

### `testimonials`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `author_name` | VARCHAR | NOT NULL |  |  |
| `author_role` | VARCHAR | NOT NULL |  |  |
| `author_since` | VARCHAR |  |  |  |
| `author_initials` | VARCHAR(4) | NOT NULL |  |  |
| `author_photo_url` | VARCHAR |  |  |  |
| `quote` | TEXT | NOT NULL |  |  |
| `tracks` | JSON | NOT NULL |  | [] |
| `is_published` | BOOLEAN | NOT NULL |  | false |
| `sort_order` | INTEGER | NOT NULL |  | 100 |
| `consent_note` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

## events_service

### `event_rsvps`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `event_id` | UUID | NOT NULL |  |  |
| `member_id` | UUID | NOT NULL |  |  |
| `status` | VARCHAR | NOT NULL |  |  |
| `wallet_transaction_id` | UUID |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `events`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `title` | VARCHAR | NOT NULL |  |  |
| `description` | VARCHAR |  |  |  |
| `event_type` | VARCHAR | NOT NULL |  |  |
| `location` | VARCHAR |  |  |  |
| `start_time` | DATETIME | NOT NULL |  |  |
| `end_time` | DATETIME |  |  |  |
| `max_capacity` | INTEGER |  |  |  |
| `cost_kobo` | INTEGER |  |  |  |
| `tier_access` | VARCHAR | NOT NULL |  |  |
| `created_by` | UUID | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

## media_service

### `album_items`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `album_id` | UUID | NOT NULL | FK→albums.id |  |
| `media_item_id` | UUID | NOT NULL | FK→media_items.id |  |
| `order` | INTEGER | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `albums`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `title` | VARCHAR | NOT NULL |  |  |
| `description` | TEXT |  |  |  |
| `slug` | VARCHAR |  | uniq |  |
| `album_type` | VARCHAR | NOT NULL |  |  |
| `linked_entity_id` | UUID |  |  |  |
| `linked_entity_type` | VARCHAR |  |  |  |
| `owner_entity_id` | UUID |  |  |  |
| `cover_media_id` | UUID |  | FK→media_items.id |  |
| `is_public` | BOOLEAN | NOT NULL |  |  |
| `created_by` | UUID | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `audio_tracks`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `title` | VARCHAR(255) | NOT NULL |  |  |
| `artist` | VARCHAR(255) |  |  |  |
| `file_url` | VARCHAR(512) | NOT NULL |  |  |
| `duration_seconds` | FLOAT |  |  |  |
| `genre` | VARCHAR(100) |  |  |  |
| `license_type` | VARCHAR(30) | NOT NULL |  |  |
| `is_active` | BOOLEAN | NOT NULL |  |  |
| `uploaded_by` | UUID | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `media_audit_logs`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `domain` | VARCHAR(32) | NOT NULL | idx |  |
| `entity_type` | VARCHAR(32) | NOT NULL |  |  |
| `entity_id` | UUID | NOT NULL | idx |  |
| `action` | VARCHAR(64) | NOT NULL | idx |  |
| `actor_id` | UUID | NOT NULL | idx |  |
| `actor_label` | VARCHAR(255) |  |  |  |
| `old_value` | JSONB |  |  |  |
| `new_value` | JSONB |  |  |  |
| `reason` | TEXT |  |  |  |
| `ip_address` | INET |  |  |  |
| `created_at` | DATETIME | NOT NULL | idx |  |

### `media_items`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `media_type` | VARCHAR | NOT NULL |  |  |
| `file_url` | VARCHAR | NOT NULL |  |  |
| `thumbnail_url` | VARCHAR |  |  |  |
| `title` | VARCHAR |  |  |  |
| `description` | TEXT |  |  |  |
| `alt_text` | VARCHAR |  |  |  |
| `metadata_info` | JSONB |  |  |  |
| `is_processed` | BOOLEAN | NOT NULL |  |  |
| `uploaded_by` | UUID | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `media_tags`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `media_item_id` | UUID | NOT NULL | FK→media_items.id |  |
| `member_id` | UUID | NOT NULL |  |  |
| `x_coord` | FLOAT |  |  |  |
| `y_coord` | FLOAT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `site_assets`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `key` | VARCHAR | NOT NULL | uniq |  |
| `description` | VARCHAR |  |  |  |
| `media_item_id` | UUID | NOT NULL | FK→media_items.id |  |
| `is_active` | BOOLEAN | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

## transport_service

### `pickup_locations`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `name` | VARCHAR | NOT NULL |  |  |
| `description` | VARCHAR |  |  |  |
| `address` | VARCHAR |  |  |  |
| `latitude` | FLOAT |  |  |  |
| `longitude` | FLOAT |  |  |  |
| `area_id` | UUID | NOT NULL | FK→ride_areas.id |  |
| `is_active` | BOOLEAN | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `ride_areas`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `name` | VARCHAR | NOT NULL | uniq |  |
| `slug` | VARCHAR | NOT NULL | uniq |  |
| `is_active` | BOOLEAN | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `ride_bookings`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `session_id` | UUID | NOT NULL | idx |  |
| `member_id` | UUID | NOT NULL | idx |  |
| `session_ride_config_id` | UUID | NOT NULL | FK→session_ride_configs.id |  |
| `pickup_location_id` | UUID | NOT NULL | FK→pickup_locations.id |  |
| `assigned_ride_number` | INTEGER | NOT NULL |  |  |
| `num_seats` | INTEGER | NOT NULL |  | 1 |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `uq_session_member_booking` (UniqueConstraint)

### `route_info`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `origin_area_id` | UUID |  | FK→ride_areas.id |  |
| `origin_pickup_location_id` | UUID |  | FK→pickup_locations.id |  |
| `destination_pool_id` | UUID |  | idx |  |
| `destination` | VARCHAR |  |  |  |
| `destination_name` | VARCHAR | NOT NULL |  |  |
| `distance_text` | VARCHAR | NOT NULL |  |  |
| `duration_text` | VARCHAR | NOT NULL |  |  |
| `departure_offset_minutes` | INTEGER | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `session_ride_configs`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `session_id` | UUID | NOT NULL | idx |  |
| `ride_area_id` | UUID | NOT NULL | FK→ride_areas.id |  |
| `cost` | INTEGER | NOT NULL |  |  |
| `capacity` | INTEGER | NOT NULL |  |  |
| `departure_time` | DATETIME |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

## store_service

### `store_audit_logs`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `entity_type` | VARCHAR(15) | NOT NULL |  |  |
| `entity_id` | UUID | NOT NULL |  |  |
| `action` | VARCHAR(50) | NOT NULL |  |  |
| `old_value` | JSONB |  |  |  |
| `new_value` | JSONB |  |  |  |
| `performed_by` | VARCHAR(255) | NOT NULL |  |  |
| `performed_at` | DATETIME | NOT NULL |  |  |
| `ip_address` | VARCHAR(45) |  |  |  |
| `notes` | TEXT |  |  |  |

### `store_bundle_items`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `bundle_product_id` | UUID | NOT NULL | FK→store_products.id, idx |  |
| `component_product_id` | UUID | NOT NULL | FK→store_products.id, idx |  |
| `component_variant_id` | UUID |  | FK→store_product_variants.id |  |
| `quantity` | INTEGER | NOT NULL |  | 1 |
| `sort_order` | INTEGER | NOT NULL |  | 0 |
| `created_at` | DATETIME | NOT NULL |  |  |

### `store_cart_items`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `cart_id` | UUID | NOT NULL | FK→store_carts.id |  |
| `variant_id` | UUID | NOT NULL | FK→store_product_variants.id |  |
| `quantity` | INTEGER | NOT NULL |  |  |
| `unit_price_ngn` | NUMERIC(12, 2) | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `positive_quantity` (CheckConstraint), `unique_cart_variant` (UniqueConstraint)

### `store_carts`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_auth_id` | VARCHAR(255) |  | idx |  |
| `session_id` | VARCHAR(255) |  | idx |  |
| `discount_code` | VARCHAR(50) |  |  |  |
| `member_discount_percent` | NUMERIC(5, 2) |  |  |  |
| `status` | VARCHAR(9) | NOT NULL |  | active |
| `expires_at` | DATETIME |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `cart_one_owner` (CheckConstraint)

### `store_categories`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `name` | VARCHAR(100) | NOT NULL |  |  |
| `slug` | VARCHAR(100) | NOT NULL | uniq |  |
| `description` | TEXT |  |  |  |
| `image_media_id` | UUID |  |  |  |
| `parent_id` | UUID |  | FK→store_categories.id |  |
| `sort_order` | INTEGER | NOT NULL |  | 0 |
| `is_active` | BOOLEAN | NOT NULL |  | true |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `store_collection_products`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `collection_id` | UUID | NOT NULL | PK, FK→store_collections.id |  |
| `product_id` | UUID | NOT NULL | PK, FK→store_products.id |  |
| `sort_order` | INTEGER | NOT NULL |  | 0 |

### `store_collections`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `name` | VARCHAR(100) | NOT NULL |  |  |
| `slug` | VARCHAR(100) | NOT NULL | uniq |  |
| `description` | TEXT |  |  |  |
| `image_media_id` | UUID |  |  |  |
| `is_active` | BOOLEAN | NOT NULL |  | true |
| `sort_order` | INTEGER | NOT NULL |  | 0 |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `store_credit_transactions`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `store_credit_id` | UUID | NOT NULL | FK→store_credits.id |  |
| `order_id` | UUID | NOT NULL | FK→store_orders.id |  |
| `amount_ngn` | NUMERIC(12, 2) | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `store_credits`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_auth_id` | VARCHAR(255) | NOT NULL | idx |  |
| `amount_ngn` | NUMERIC(12, 2) | NOT NULL |  |  |
| `balance_ngn` | NUMERIC(12, 2) | NOT NULL |  |  |
| `source_type` | VARCHAR(9) | NOT NULL |  |  |
| `source_order_id` | UUID |  | FK→store_orders.id |  |
| `reason` | TEXT |  |  |  |
| `expires_at` | DATETIME |  |  |  |
| `issued_by` | VARCHAR(255) |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `store_inventory_items`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `variant_id` | UUID | NOT NULL | FK→store_product_variants.id, uniq |  |
| `quantity_on_hand` | INTEGER | NOT NULL |  | 0 |
| `quantity_reserved` | INTEGER | NOT NULL |  | 0 |
| `low_stock_threshold` | INTEGER | NOT NULL |  | 5 |
| `last_restock_at` | DATETIME |  |  |  |
| `last_sold_at` | DATETIME |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `positive_stock` (CheckConstraint), `valid_reserved` (CheckConstraint)

### `store_inventory_movements`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `inventory_item_id` | UUID | NOT NULL | FK→store_inventory_items.id |  |
| `movement_type` | VARCHAR(11) | NOT NULL |  |  |
| `quantity` | INTEGER | NOT NULL |  |  |
| `reference_type` | VARCHAR(30) |  |  |  |
| `reference_id` | UUID |  |  |  |
| `notes` | TEXT |  |  |  |
| `performed_by` | VARCHAR(255) |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `store_order_items`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `order_id` | UUID | NOT NULL | FK→store_orders.id |  |
| `variant_id` | UUID | NOT NULL | FK→store_product_variants.id |  |
| `product_name` | VARCHAR(255) | NOT NULL |  |  |
| `variant_name` | VARCHAR(255) |  |  |  |
| `sku` | VARCHAR(100) | NOT NULL |  |  |
| `quantity` | INTEGER | NOT NULL |  |  |
| `unit_price_ngn` | NUMERIC(12, 2) | NOT NULL |  |  |
| `line_total_ngn` | NUMERIC(12, 2) | NOT NULL |  |  |
| `is_preorder` | BOOLEAN | NOT NULL |  | false |
| `estimated_ship_date` | DATETIME |  |  |  |
| `supplier_id` | UUID |  |  |  |
| `supplier_name` | VARCHAR(255) |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `store_orders`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `order_number` | VARCHAR(20) | NOT NULL | idx, uniq |  |
| `member_auth_id` | VARCHAR(255) |  | idx |  |
| `customer_email` | VARCHAR(255) | NOT NULL |  |  |
| `customer_name` | VARCHAR(255) | NOT NULL |  |  |
| `customer_phone` | VARCHAR(50) |  |  |  |
| `subtotal_ngn` | NUMERIC(12, 2) | NOT NULL |  |  |
| `discount_amount_ngn` | NUMERIC(12, 2) | NOT NULL |  | 0 |
| `store_credit_applied_ngn` | NUMERIC(12, 2) | NOT NULL |  | 0 |
| `delivery_fee_ngn` | NUMERIC(12, 2) | NOT NULL |  | 0 |
| `total_ngn` | NUMERIC(12, 2) | NOT NULL |  |  |
| `discount_code` | VARCHAR(50) |  |  |  |
| `discount_breakdown` | JSONB |  |  |  |
| `status` | VARCHAR(16) | NOT NULL |  | pending_payment |
| `payment_reference` | VARCHAR(100) |  | idx |  |
| `bubbles_applied` | INTEGER |  |  |  |
| `wallet_transaction_id` | VARCHAR(100) |  | idx |  |
| `fulfillment_type` | VARCHAR(8) | NOT NULL |  | pickup |
| `pickup_location_id` | UUID |  | FK→store_pickup_locations.id |  |
| `pickup_session_id` | UUID |  |  |  |
| `delivery_address` | JSONB |  |  |  |
| `delivery_notes` | TEXT |  |  |  |
| `customer_notes` | TEXT |  |  |  |
| `admin_notes` | TEXT |  |  |  |
| `paid_at` | DATETIME |  |  |  |
| `fulfilled_at` | DATETIME |  |  |  |
| `cancelled_at` | DATETIME |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `store_pickup_locations`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `name` | VARCHAR(100) | NOT NULL |  |  |
| `address` | VARCHAR(500) |  |  |  |
| `description` | TEXT |  |  |  |
| `contact_phone` | VARCHAR(50) |  |  |  |
| `contact_email` | VARCHAR(255) |  |  |  |
| `pool_id` | UUID |  | idx |  |
| `is_active` | BOOLEAN | NOT NULL |  | true |
| `sort_order` | INTEGER | NOT NULL |  | 0 |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `store_product_images`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `product_id` | UUID | NOT NULL | FK→store_products.id |  |
| `variant_id` | UUID |  | FK→store_product_variants.id |  |
| `url` | VARCHAR(512) | NOT NULL |  |  |
| `alt_text` | VARCHAR(255) |  |  |  |
| `sort_order` | INTEGER | NOT NULL |  | 0 |
| `is_primary` | BOOLEAN | NOT NULL |  | false |
| `created_at` | DATETIME | NOT NULL |  |  |

### `store_product_variants`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `product_id` | UUID | NOT NULL | FK→store_products.id |  |
| `sku` | VARCHAR(100) | NOT NULL | uniq |  |
| `name` | VARCHAR(255) |  |  |  |
| `options` | JSONB | NOT NULL |  |  |
| `price_override_ngn` | NUMERIC(12, 2) |  |  |  |
| `weight_grams` | INTEGER |  |  |  |
| `is_active` | BOOLEAN | NOT NULL |  | true |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `store_product_videos`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `product_id` | UUID | NOT NULL | FK→store_products.id |  |
| `url` | VARCHAR(512) | NOT NULL |  |  |
| `thumbnail_url` | VARCHAR(512) |  |  |  |
| `title` | VARCHAR(255) |  |  |  |
| `sort_order` | INTEGER | NOT NULL |  | 0 |
| `is_processed` | BOOLEAN | NOT NULL |  | true |
| `media_item_id` | UUID |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `store_products`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `category_id` | UUID |  | FK→store_categories.id |  |
| `product_type` | VARCHAR(8) | NOT NULL |  | standard |
| `name` | VARCHAR(255) | NOT NULL |  |  |
| `slug` | VARCHAR(255) | NOT NULL | uniq |  |
| `description` | TEXT |  |  |  |
| `short_description` | VARCHAR(500) |  |  |  |
| `base_price_ngn` | NUMERIC(12, 2) | NOT NULL |  |  |
| `compare_at_price_ngn` | NUMERIC(12, 2) |  |  |  |
| `status` | VARCHAR(8) | NOT NULL |  | draft |
| `is_featured` | BOOLEAN | NOT NULL |  | false |
| `meta_title` | VARCHAR(255) |  |  |  |
| `meta_description` | VARCHAR(500) |  |  |  |
| `has_variants` | BOOLEAN | NOT NULL |  | false |
| `variant_options` | JSONB |  |  |  |
| `sourcing_type` | VARCHAR(11) | NOT NULL |  | stocked |
| `preorder_lead_days` | INTEGER |  |  |  |
| `requires_size_chart_ack` | BOOLEAN | NOT NULL |  | false |
| `size_chart_media_id` | UUID |  |  |  |
| `supplier_id` | UUID |  | FK→store_suppliers.id, idx |  |
| `cost_price_ngn` | NUMERIC(12, 2) |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `store_supplier_payouts`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `supplier_id` | UUID | NOT NULL | FK→store_suppliers.id, idx |  |
| `payout_period_start` | DATE | NOT NULL |  |  |
| `payout_period_end` | DATE | NOT NULL |  |  |
| `total_sales_ngn` | NUMERIC(12, 2) | NOT NULL |  |  |
| `commission_ngn` | NUMERIC(12, 2) | NOT NULL |  |  |
| `payout_amount_ngn` | NUMERIC(12, 2) | NOT NULL |  |  |
| `status` | VARCHAR(10) | NOT NULL |  | pending |
| `paid_at` | DATETIME |  |  |  |
| `payment_reference` | VARCHAR(255) |  |  |  |
| `notes` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `store_suppliers`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `name` | VARCHAR(255) | NOT NULL |  |  |
| `slug` | VARCHAR(255) | NOT NULL | uniq |  |
| `contact_name` | VARCHAR(255) |  |  |  |
| `contact_email` | VARCHAR(255) |  |  |  |
| `contact_phone` | VARCHAR(50) |  |  |  |
| `description` | TEXT |  |  |  |
| `commission_percent` | NUMERIC(5, 2) |  |  |  |
| `payout_bank_name` | VARCHAR(255) |  |  |  |
| `payout_account_number` | VARCHAR(50) |  |  |  |
| `payout_account_name` | VARCHAR(255) |  |  |  |
| `is_verified` | BOOLEAN | NOT NULL |  | false |
| `status` | VARCHAR(9) | NOT NULL |  | active |
| `probation_ends_at` | DATETIME |  |  |  |
| `total_products` | INTEGER | NOT NULL |  | 0 |
| `total_orders` | INTEGER | NOT NULL |  | 0 |
| `average_fulfillment_hours` | NUMERIC(8, 2) |  |  |  |
| `is_active` | BOOLEAN | NOT NULL |  | true |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

## ai_service

### `ai_model_configs`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `provider` | VARCHAR(50) | NOT NULL |  |  |
| `model_name` | VARCHAR(100) | NOT NULL |  |  |
| `is_enabled` | BOOLEAN | NOT NULL |  | true |
| `is_default` | BOOLEAN | NOT NULL |  | false |
| `max_tokens` | INTEGER | NOT NULL |  |  |
| `temperature` | FLOAT | NOT NULL |  |  |
| `input_cost_per_1k` | FLOAT |  |  |  |
| `output_cost_per_1k` | FLOAT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `ai_prompt_templates`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `name` | VARCHAR(100) | NOT NULL | idx |  |
| `version` | INTEGER | NOT NULL |  |  |
| `is_active` | BOOLEAN | NOT NULL |  | true |
| `system_prompt` | TEXT | NOT NULL |  |  |
| `user_prompt_template` | TEXT | NOT NULL |  |  |
| `output_schema` | JSON |  |  |  |
| `created_by_id` | UUID |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `ai_requests`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `request_type` | VARCHAR(50) | NOT NULL | idx |  |
| `model_provider` | VARCHAR(50) | NOT NULL |  |  |
| `model_name` | VARCHAR(100) | NOT NULL |  |  |
| `input_data` | JSON | NOT NULL |  |  |
| `output_data` | JSON |  |  |  |
| `status` | VARCHAR(20) | NOT NULL |  |  |
| `error_message` | TEXT |  |  |  |
| `latency_ms` | INTEGER |  |  |  |
| `input_tokens` | INTEGER |  |  |  |
| `output_tokens` | INTEGER |  |  |  |
| `cost_usd` | FLOAT |  |  |  |
| `requested_by_id` | UUID |  |  |  |
| `requesting_service` | VARCHAR(50) |  |  |  |
| `langfuse_trace_id` | VARCHAR(100) |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

## volunteer_service

### `session_template_volunteer_slots`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `session_template_id` | UUID | NOT NULL | idx |  |
| `role_id` | UUID | NOT NULL | FK→volunteer_roles.id, idx |  |
| `slots_needed` | INTEGER | NOT NULL |  | 1 |
| `opportunity_type` | VARCHAR(17) | NOT NULL |  |  |
| `min_tier` | VARCHAR(6) | NOT NULL |  |  |
| `qr_checkin_enabled` | BOOLEAN | NOT NULL |  | false |
| `title_override` | VARCHAR(200) |  |  |  |
| `description_override` | TEXT |  |  |  |
| `cancellation_deadline_hours` | INTEGER | NOT NULL |  |  |
| `is_active` | BOOLEAN | NOT NULL |  | true |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `volunteer_hours_log`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_id` | UUID | NOT NULL | FK→members.id, idx |  |
| `slot_id` | UUID |  | FK→volunteer_slots.id |  |
| `opportunity_id` | UUID |  | FK→volunteer_opportunities.id |  |
| `hours` | FLOAT | NOT NULL |  |  |
| `date` | DATE | NOT NULL | idx |  |
| `role_id` | UUID |  | FK→volunteer_roles.id |  |
| `source` | VARCHAR(50) | NOT NULL |  |  |
| `logged_by` | UUID |  |  |  |
| `notes` | TEXT |  |  |  |
| `external_reference_id` | VARCHAR(64) |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `volunteer_opportunities`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `title` | VARCHAR(200) | NOT NULL |  |  |
| `description` | TEXT |  |  |  |
| `role_id` | UUID |  | FK→volunteer_roles.id, idx |  |
| `date` | DATE | NOT NULL | idx |  |
| `start_time` | TIME |  |  |  |
| `end_time` | TIME |  |  |  |
| `session_id` | UUID |  |  |  |
| `event_id` | UUID |  |  |  |
| `location_name` | VARCHAR(200) |  |  |  |
| `slots_needed` | INTEGER | NOT NULL |  |  |
| `slots_filled` | INTEGER | NOT NULL |  |  |
| `opportunity_type` | VARCHAR(17) | NOT NULL |  |  |
| `status` | VARCHAR(11) | NOT NULL |  |  |
| `min_tier` | VARCHAR(6) | NOT NULL |  |  |
| `cancellation_deadline_hours` | INTEGER | NOT NULL |  |  |
| `created_by` | UUID |  |  |  |
| `metadata_json` | JSONB |  |  |  |
| `qr_checkin_enabled` | BOOLEAN | NOT NULL |  | false |
| `qr_token` | VARCHAR(64) |  | idx, uniq |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `volunteer_opportunity_templates`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `title` | VARCHAR(200) | NOT NULL |  |  |
| `description` | TEXT |  |  |  |
| `role_id` | UUID | NOT NULL | FK→volunteer_roles.id, idx |  |
| `day_of_week` | INTEGER | NOT NULL |  |  |
| `start_time` | TIME | NOT NULL |  |  |
| `duration_minutes` | INTEGER | NOT NULL |  |  |
| `location_name` | VARCHAR(200) |  |  |  |
| `slots_needed` | INTEGER | NOT NULL |  | 1 |
| `opportunity_type` | VARCHAR(17) | NOT NULL |  |  |
| `min_tier` | VARCHAR(6) | NOT NULL |  |  |
| `qr_checkin_enabled` | BOOLEAN | NOT NULL |  | false |
| `cancellation_deadline_hours` | INTEGER | NOT NULL |  |  |
| `auto_generate` | BOOLEAN | NOT NULL |  | false |
| `is_active` | BOOLEAN | NOT NULL |  | true |
| `last_materialised_through` | DATE |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `volunteer_profiles`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_id` | UUID | NOT NULL | FK→members.id, idx, uniq |  |
| `tier` | VARCHAR(6) | NOT NULL |  |  |
| `tier_override` | VARCHAR(6) |  |  |  |
| `total_hours` | FLOAT | NOT NULL |  |  |
| `total_sessions_volunteered` | INTEGER | NOT NULL |  |  |
| `total_no_shows` | INTEGER | NOT NULL |  |  |
| `total_late_cancellations` | INTEGER | NOT NULL |  |  |
| `reliability_score` | INTEGER | NOT NULL |  |  |
| `recognition_tier` | VARCHAR(6) |  |  |  |
| `preferred_roles` | ARRAY |  |  |  |
| `available_days` | ARRAY |  |  |  |
| `notes` | TEXT |  |  |  |
| `is_active` | BOOLEAN | NOT NULL |  |  |
| `admin_notes` | TEXT |  |  |  |
| `spotlight_quote` | TEXT |  |  |  |
| `is_featured` | BOOLEAN | NOT NULL | idx |  |
| `featured_from` | DATETIME |  |  |  |
| `featured_until` | DATETIME |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `volunteer_rewards`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_id` | UUID | NOT NULL | FK→members.id, idx |  |
| `reward_type` | VARCHAR(19) | NOT NULL |  |  |
| `title` | VARCHAR(200) | NOT NULL |  |  |
| `description` | TEXT |  |  |  |
| `trigger_type` | VARCHAR(50) |  |  |  |
| `trigger_value` | VARCHAR(100) |  |  |  |
| `is_redeemed` | BOOLEAN | NOT NULL |  |  |
| `redeemed_at` | DATETIME |  |  |  |
| `expires_at` | DATETIME |  |  |  |
| `discount_percent` | INTEGER |  |  |  |
| `discount_amount_ngn` | INTEGER |  |  |  |
| `granted_by` | UUID |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `volunteer_roles`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `title` | VARCHAR(120) | NOT NULL | uniq |  |
| `description` | TEXT |  |  |  |
| `category` | VARCHAR(17) | NOT NULL |  |  |
| `required_skills` | ARRAY |  |  |  |
| `min_tier` | VARCHAR(6) | NOT NULL |  |  |
| `icon` | VARCHAR(50) |  |  |  |
| `sort_order` | INTEGER | NOT NULL |  |  |
| `is_active` | BOOLEAN | NOT NULL |  |  |
| `time_commitment` | TEXT |  |  |  |
| `responsibilities` | ARRAY |  |  |  |
| `skills_needed` | TEXT |  |  |  |
| `best_for` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `volunteer_slots`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `opportunity_id` | UUID | NOT NULL | FK→volunteer_opportunities.id, idx |  |
| `member_id` | UUID | NOT NULL | FK→members.id, idx |  |
| `status` | VARCHAR(9) | NOT NULL |  |  |
| `claimed_at` | DATETIME | NOT NULL |  |  |
| `approved_at` | DATETIME |  |  |  |
| `approved_by` | UUID |  |  |  |
| `cancelled_at` | DATETIME |  |  |  |
| `cancellation_reason` | TEXT |  |  |  |
| `checked_in_at` | DATETIME |  |  |  |
| `checked_out_at` | DATETIME |  |  |  |
| `hours_logged` | FLOAT |  |  |  |
| `admin_notes` | TEXT |  |  |  |
| `member_feedback` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

## pools_service

### `pool_agreements`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `pool_id` | UUID | NOT NULL | FK→pools.id, idx |  |
| `title` | VARCHAR(255) | NOT NULL |  |  |
| `status` | VARCHAR(10) | NOT NULL | idx |  |
| `start_date` | DATE |  |  |  |
| `end_date` | DATE |  |  |  |
| `signed_at` | DATETIME |  |  |  |
| `commission_percentage` | NUMERIC(5, 2) |  |  |  |
| `flat_session_rate_ngn` | NUMERIC(10, 2) |  |  |  |
| `min_sessions_per_month` | INTEGER |  |  |  |
| `is_exclusive` | BOOLEAN | NOT NULL |  | false |
| `signed_doc_media_id` | UUID |  |  |  |
| `signed_doc_url` | TEXT |  |  |  |
| `notes` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `pool_assets`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `pool_id` | UUID | NOT NULL | FK→pools.id, idx |  |
| `asset_type` | VARCHAR(11) | NOT NULL |  |  |
| `media_id` | UUID |  |  |  |
| `url` | TEXT |  |  |  |
| `title` | VARCHAR(255) |  |  |  |
| `caption` | TEXT |  |  |  |
| `display_order` | INTEGER | NOT NULL |  | 0 |
| `is_primary` | BOOLEAN | NOT NULL |  | false |
| `uploaded_by_auth_id` | VARCHAR(255) |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `pool_contacts`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `pool_id` | UUID | NOT NULL | FK→pools.id, idx |  |
| `name` | VARCHAR(255) | NOT NULL |  |  |
| `role` | VARCHAR(10) | NOT NULL |  |  |
| `phone` | VARCHAR(50) |  |  |  |
| `email` | VARCHAR(255) |  |  |  |
| `whatsapp` | VARCHAR(50) |  |  |  |
| `notes` | TEXT |  |  |  |
| `is_primary` | BOOLEAN | NOT NULL |  | false |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `pool_status_changes`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `pool_id` | UUID | NOT NULL | FK→pools.id, idx |  |
| `from_status` | VARCHAR(14) |  |  |  |
| `to_status` | VARCHAR(14) | NOT NULL |  |  |
| `changed_by_auth_id` | VARCHAR(255) |  | idx |  |
| `reason` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL | idx |  |

### `pool_submissions`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `submitter_auth_id` | VARCHAR(255) | NOT NULL | idx |  |
| `submitter_display_name` | VARCHAR(255) |  |  |  |
| `submitter_email` | VARCHAR(255) |  |  |  |
| `pool_name` | VARCHAR(255) | NOT NULL |  |  |
| `location_area` | VARCHAR(255) |  |  |  |
| `address` | TEXT |  |  |  |
| `pool_type` | VARCHAR(9) |  |  |  |
| `contact_phone` | VARCHAR(50) |  |  |  |
| `contact_email` | VARCHAR(255) |  |  |  |
| `has_changing_rooms` | BOOLEAN |  |  |  |
| `has_showers` | BOOLEAN |  |  |  |
| `has_lockers` | BOOLEAN |  |  |  |
| `has_parking` | BOOLEAN |  |  |  |
| `has_lifeguard` | BOOLEAN |  |  |  |
| `visit_frequency` | VARCHAR(50) |  |  |  |
| `member_rating` | INTEGER |  |  |  |
| `member_notes` | TEXT |  |  |  |
| `photo_url` | TEXT |  |  |  |
| `status` | VARCHAR(8) | NOT NULL | idx | pending |
| `reviewed_by_auth_id` | VARCHAR(255) |  |  |  |
| `reviewed_at` | DATETIME |  |  |  |
| `review_notes` | TEXT |  |  |  |
| `promoted_pool_id` | UUID |  |  |  |
| `reward_granted` | BOOLEAN | NOT NULL |  | false |
| `reward_bubbles` | INTEGER |  |  |  |
| `reward_grant_id` | VARCHAR(255) |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `pool_visits`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `pool_id` | UUID | NOT NULL | FK→pools.id, idx |  |
| `visit_date` | DATE | NOT NULL | idx |  |
| `visit_type` | VARCHAR(19) | NOT NULL |  |  |
| `visitor_auth_id` | VARCHAR(255) |  | idx |  |
| `visitor_display_name` | VARCHAR(255) |  |  |  |
| `summary` | VARCHAR(500) | NOT NULL |  |  |
| `notes` | TEXT |  |  |  |
| `follow_up_action` | TEXT |  |  |  |
| `follow_up_due_at` | DATE |  |  |  |
| `follow_up_completed` | BOOLEAN | NOT NULL |  | false |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `pools`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `name` | VARCHAR(255) | NOT NULL |  |  |
| `slug` | VARCHAR(255) | NOT NULL | uniq |  |
| `location_area` | VARCHAR(255) |  | idx |  |
| `latitude` | FLOAT |  |  |  |
| `longitude` | FLOAT |  |  |  |
| `contact_person` | VARCHAR(255) |  |  |  |
| `contact_phone` | VARCHAR(50) |  |  |  |
| `contact_email` | VARCHAR(255) |  |  |  |
| `pool_length_m` | FLOAT |  |  |  |
| `depth_min_m` | FLOAT |  |  |  |
| `depth_max_m` | FLOAT |  |  |  |
| `number_of_lanes` | INTEGER |  |  |  |
| `indoor_outdoor` | VARCHAR(7) |  |  |  |
| `max_swimmers_capacity` | INTEGER |  |  |  |
| `water_quality` | INTEGER |  |  |  |
| `good_for_beginners` | INTEGER |  |  |  |
| `good_for_training` | INTEGER |  |  |  |
| `ease_of_access` | INTEGER |  |  |  |
| `management_cooperation` | INTEGER |  |  |  |
| `partnership_potential` | INTEGER |  |  |  |
| `overall_score` | INTEGER |  |  |  |
| `computed_score` | NUMERIC(3, 2) |  |  |  |
| `available_days_times` | JSONB |  |  |  |
| `exclusive_lanes_available` | BOOLEAN |  |  |  |
| `price_per_swimmer_ngn` | NUMERIC(10, 2) |  |  |  |
| `flat_session_fee_ngn` | NUMERIC(10, 2) |  |  |  |
| `group_discount_available` | BOOLEAN |  |  |  |
| `has_changing_rooms` | BOOLEAN |  |  |  |
| `has_showers` | BOOLEAN |  |  |  |
| `has_lockers` | BOOLEAN |  |  |  |
| `has_parking` | BOOLEAN |  |  |  |
| `has_lifeguard` | BOOLEAN |  |  |  |
| `video_content_allowed` | BOOLEAN |  |  |  |
| `trial_session_possible` | BOOLEAN |  |  |  |
| `lifeguard_count` | INTEGER |  |  |  |
| `has_first_aid_kit` | BOOLEAN |  |  |  |
| `has_aed` | BOOLEAN |  |  |  |
| `has_cctv` | BOOLEAN |  |  |  |
| `booking_lead_time_hours` | INTEGER |  |  |  |
| `preferred_contact_channel` | VARCHAR(9) |  |  |  |
| `source` | VARCHAR(17) |  |  |  |
| `last_verified_at` | DATETIME |  |  |  |
| `partnership_status` | VARCHAR(14) | NOT NULL | idx | prospect |
| `pool_type` | VARCHAR(9) |  |  |  |
| `notes` | TEXT |  |  |  |
| `is_active` | BOOLEAN | NOT NULL |  | true |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

## reporting_service

### `cohort_fill_snapshots`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `cohort_id` | UUID | NOT NULL | idx |  |
| `cohort_name` | VARCHAR | NOT NULL |  |  |
| `program_name` | VARCHAR |  |  |  |
| `capacity` | INTEGER | NOT NULL |  |  |
| `active_enrollments` | INTEGER | NOT NULL |  |  |
| `pending_approvals` | INTEGER | NOT NULL |  |  |
| `waitlist_count` | INTEGER | NOT NULL |  |  |
| `fill_rate` | FLOAT | NOT NULL |  |  |
| `starts_at` | DATETIME |  |  |  |
| `ends_at` | DATETIME |  |  |  |
| `cohort_status` | VARCHAR | NOT NULL |  |  |
| `days_until_start` | INTEGER |  |  |  |
| `snapshot_taken_at` | DATETIME | NOT NULL | idx |  |

_Constraints:_ `uq_cohort_fill_per_run` (UniqueConstraint)

### `community_quarterly_stats`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `year` | INTEGER | NOT NULL |  |  |
| `quarter` | INTEGER | NOT NULL |  |  |
| `total_active_members` | INTEGER | NOT NULL |  |  |
| `total_sessions_held` | INTEGER | NOT NULL |  |  |
| `total_attendance_records` | INTEGER | NOT NULL |  |  |
| `average_attendance_rate` | FLOAT | NOT NULL |  |  |
| `total_new_members` | INTEGER | NOT NULL |  |  |
| `total_milestones_achieved` | INTEGER | NOT NULL |  |  |
| `total_certificates_issued` | INTEGER | NOT NULL |  |  |
| `total_volunteer_hours` | FLOAT | NOT NULL |  |  |
| `total_rides_shared` | INTEGER | NOT NULL |  |  |
| `total_revenue_ngn` | INTEGER | NOT NULL |  |  |
| `total_pool_hours` | FLOAT | NOT NULL |  |  |
| `most_active_location` | VARCHAR |  |  |  |
| `busiest_session_title` | VARCHAR |  |  |  |
| `busiest_session_attendance` | INTEGER | NOT NULL |  |  |
| `most_popular_day` | VARCHAR |  |  |  |
| `most_popular_time_slot` | VARCHAR |  |  |  |
| `total_cohorts_completed` | INTEGER | NOT NULL |  |  |
| `stats_by_type` | JSONB |  |  |  |
| `community_milestones` | JSONB |  |  |  |
| `computed_at` | DATETIME | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `uq_community_year_quarter` (UniqueConstraint)

### `external_factors`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `year` | INTEGER | NOT NULL |  |  |
| `month` | INTEGER | NOT NULL |  |  |
| `rainfall_mm` | FLOAT | NOT NULL |  |  |
| `rainfall_category` | VARCHAR | NOT NULL |  |  |
| `school_term_active` | BOOLEAN | NOT NULL |  |  |
| `exam_period` | BOOLEAN | NOT NULL |  |  |
| `school_holiday` | BOOLEAN | NOT NULL |  |  |
| `holiday_names` | JSONB |  |  |  |
| `holiday_count` | INTEGER | NOT NULL |  |  |
| `salary_week` | BOOLEAN | NOT NULL |  |  |
| `campaign_names` | JSONB |  |  |  |
| `campaign_effect_multiplier` | FLOAT | NOT NULL |  |  |
| `source` | VARCHAR(6) | NOT NULL |  |  |

_Constraints:_ `uq_external_factor_year_month` (UniqueConstraint)

### `funnel_conversion_snapshots`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `funnel_stage` | VARCHAR(20) | NOT NULL | idx |  |
| `cohort_period` | VARCHAR | NOT NULL | idx |  |
| `period_start` | DATE | NOT NULL |  |  |
| `period_end` | DATE | NOT NULL |  |  |
| `observation_window_days` | INTEGER | NOT NULL |  |  |
| `source_count` | INTEGER | NOT NULL |  |  |
| `converted_count` | INTEGER | NOT NULL |  |  |
| `conversion_rate` | FLOAT | NOT NULL |  |  |
| `breakdown_by_source` | JSONB |  |  |  |
| `snapshot_taken_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `uq_funnel_per_period_per_run` (UniqueConstraint)

### `member_quarterly_reports`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `member_id` | UUID | NOT NULL | idx |  |
| `member_auth_id` | VARCHAR | NOT NULL | idx |  |
| `year` | INTEGER | NOT NULL |  |  |
| `quarter` | INTEGER | NOT NULL |  |  |
| `member_name` | VARCHAR | NOT NULL |  |  |
| `member_tier` | VARCHAR |  |  |  |
| `total_sessions_attended` | INTEGER | NOT NULL |  |  |
| `total_sessions_available` | INTEGER | NOT NULL |  |  |
| `attendance_rate` | FLOAT | NOT NULL |  |  |
| `sessions_by_type` | JSONB |  |  |  |
| `punctuality_rate` | FLOAT | NOT NULL |  |  |
| `streak_longest` | INTEGER | NOT NULL |  |  |
| `streak_current` | INTEGER | NOT NULL |  |  |
| `favorite_day` | VARCHAR |  |  |  |
| `favorite_location` | VARCHAR |  |  |  |
| `milestones_achieved` | INTEGER | NOT NULL |  |  |
| `milestones_in_progress` | INTEGER | NOT NULL |  |  |
| `programs_enrolled` | INTEGER | NOT NULL |  |  |
| `certificates_earned` | INTEGER | NOT NULL |  |  |
| `total_spent_ngn` | INTEGER | NOT NULL |  |  |
| `bubbles_earned` | INTEGER | NOT NULL |  |  |
| `bubbles_spent` | INTEGER | NOT NULL |  |  |
| `rides_taken` | INTEGER | NOT NULL |  |  |
| `rides_offered` | INTEGER | NOT NULL |  |  |
| `volunteer_hours` | FLOAT | NOT NULL |  |  |
| `orders_placed` | INTEGER | NOT NULL |  |  |
| `store_spent_ngn` | INTEGER | NOT NULL |  |  |
| `events_attended` | INTEGER | NOT NULL |  |  |
| `pool_hours` | FLOAT | NOT NULL |  |  |
| `is_first_quarter` | BOOLEAN | NOT NULL |  |  |
| `member_joined_at` | VARCHAR |  |  |  |
| `attendance_percentile` | FLOAT | NOT NULL |  |  |
| `academy_skills` | JSONB |  |  |  |
| `cohorts_completed` | INTEGER | NOT NULL |  |  |
| `leaderboard_opt_out` | BOOLEAN | NOT NULL |  |  |
| `card_image_path` | VARCHAR |  |  |  |
| `computed_at` | DATETIME | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME |  |  |  |

_Constraints:_ `uq_member_year_quarter` (UniqueConstraint)

### `monthly_actuals`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `year` | INTEGER | NOT NULL |  |  |
| `month` | INTEGER | NOT NULL |  |  |
| `active_members` | INTEGER | NOT NULL |  |  |
| `total_sessions_held` | INTEGER | NOT NULL |  |  |
| `total_attendance` | INTEGER | NOT NULL |  |  |
| `new_signups` | INTEGER | NOT NULL |  |  |
| `churned_members` | INTEGER | NOT NULL |  |  |
| `total_revenue_ngn` | INTEGER | NOT NULL |  |  |
| `attendance_by_type` | JSONB |  |  |  |
| `revenue_by_type` | JSONB |  |  |  |
| `rainfall_mm` | FLOAT |  |  |  |
| `is_school_term` | BOOLEAN | NOT NULL |  |  |
| `is_exam_period` | BOOLEAN | NOT NULL |  |  |
| `holiday_count` | INTEGER | NOT NULL |  |  |
| `source` | VARCHAR(6) | NOT NULL |  |  |
| `computed_at` | DATETIME | NOT NULL |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `uq_monthly_actual_year_month` (UniqueConstraint)

### `quarterly_snapshots`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `year` | INTEGER | NOT NULL |  |  |
| `quarter` | INTEGER | NOT NULL |  |  |
| `status` | VARCHAR(9) | NOT NULL |  |  |
| `started_at` | DATETIME |  |  |  |
| `completed_at` | DATETIME |  |  |  |
| `member_count` | INTEGER | NOT NULL |  |  |
| `error_message` | VARCHAR |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `uq_snapshot_year_quarter` (UniqueConstraint)

### `seasonality_forecasts`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `forecast_year` | INTEGER | NOT NULL | idx |  |
| `generated_at` | DATETIME | NOT NULL |  |  |
| `status` | VARCHAR(9) | NOT NULL |  |  |
| `model_params` | JSONB | NOT NULL |  |  |
| `monthly_forecasts` | JSONB | NOT NULL |  |  |
| `months_of_real_data` | INTEGER | NOT NULL |  |  |
| `prior_weight` | FLOAT | NOT NULL |  |  |
| `markdown_path` | VARCHAR |  |  |  |
| `csv_path` | VARCHAR |  |  |  |
| `html_path` | VARCHAR |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `wallet_ecosystem_snapshots`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `period_start` | DATE | NOT NULL |  |  |
| `period_end` | DATE | NOT NULL |  |  |
| `period_days` | INTEGER | NOT NULL |  |  |
| `active_wallet_users` | INTEGER | NOT NULL |  |  |
| `single_service_users` | INTEGER | NOT NULL |  |  |
| `cross_service_users` | INTEGER | NOT NULL |  |  |
| `cross_service_rate` | FLOAT | NOT NULL |  |  |
| `total_bubbles_spent` | INTEGER | NOT NULL |  |  |
| `total_topup_bubbles` | INTEGER | NOT NULL |  |  |
| `spend_distribution` | JSONB |  |  |  |
| `snapshot_taken_at` | DATETIME | NOT NULL | idx |  |

_Constraints:_ `uq_wallet_ecosystem_per_period_per_run` (UniqueConstraint)

## chat_service

### `chat_audit_log`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `actor_id` | UUID |  |  |  |
| `action` | VARCHAR(19) | NOT NULL |  |  |
| `channel_id` | UUID |  |  |  |
| `message_id` | UUID |  |  |  |
| `subject_member_id` | UUID |  |  |  |
| `payload` | JSONB | NOT NULL |  | {} |
| `created_at` | DATETIME | NOT NULL |  |  |

### `chat_channel_members`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `channel_id` | UUID | NOT NULL | PK, FK→chat_channels.id |  |
| `member_id` | UUID | NOT NULL | PK |  |
| `role` | VARCHAR(9) | NOT NULL |  |  |
| `joined_at` | DATETIME | NOT NULL |  |  |
| `left_at` | DATETIME |  |  |  |
| `muted_until` | DATETIME |  |  |  |
| `last_read_message_id` | UUID |  |  |  |
| `derived_from` | VARCHAR(14) | NOT NULL |  |  |
| `derivation_ref` | UUID |  |  |  |

### `chat_channels`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `type` | VARCHAR(9) | NOT NULL |  |  |
| `parent_entity_type` | VARCHAR(8) | NOT NULL |  |  |
| `parent_entity_id` | UUID |  |  |  |
| `name` | VARCHAR(200) | NOT NULL |  |  |
| `description` | TEXT |  |  |  |
| `created_by` | UUID |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `archived_at` | DATETIME |  |  |  |
| `retention_policy` | VARCHAR(15) | NOT NULL |  |  |
| `safeguarding_flags` | JSONB | NOT NULL |  | {} |
| `metadata` | JSONB | NOT NULL |  | {} |

### `chat_message_reactions`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `message_id` | UUID | NOT NULL | PK, FK→chat_messages.id |  |
| `member_id` | UUID | NOT NULL | PK |  |
| `emoji` | VARCHAR(32) | NOT NULL | PK |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `chat_message_reports`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `message_id` | UUID | NOT NULL | FK→chat_messages.id |  |
| `reporter_id` | UUID | NOT NULL |  |  |
| `reason` | VARCHAR(12) | NOT NULL |  |  |
| `note` | TEXT |  |  |  |
| `status` | VARCHAR(12) | NOT NULL |  |  |
| `assigned_to` | UUID |  |  |  |
| `resolved_at` | DATETIME |  |  |  |
| `resolution_note` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

### `chat_messages`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `channel_id` | UUID | NOT NULL | FK→chat_channels.id |  |
| `sender_id` | UUID | NOT NULL |  |  |
| `body` | TEXT | NOT NULL |  |  |
| `attachments` | JSONB | NOT NULL |  | [] |
| `reply_to_id` | UUID |  | FK→chat_messages.id |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `edited_at` | DATETIME |  |  |  |
| `deleted_at` | DATETIME |  |  |  |
| `deleted_by` | UUID |  |  |  |
| `safeguarding_review_state` | VARCHAR(17) | NOT NULL |  |  |
| `metadata` | JSONB | NOT NULL |  | {} |

## corporate_service

### `corporate_contacts`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `company_name` | VARCHAR(255) | NOT NULL | idx |  |
| `company_website` | VARCHAR(255) |  |  |  |
| `industry` | VARCHAR(14) |  |  |  |
| `company_size` | VARCHAR(11) |  |  |  |
| `hq_location` | VARCHAR(255) |  |  |  |
| `primary_contact_name` | VARCHAR(255) | NOT NULL |  |  |
| `primary_contact_role` | VARCHAR(255) |  |  |  |
| `primary_contact_email` | VARCHAR(255) | NOT NULL | idx |  |
| `primary_contact_phone` | VARCHAR(50) |  |  |  |
| `primary_contact_whatsapp` | VARCHAR(50) |  |  |  |
| `source` | VARCHAR(13) | NOT NULL |  | cold_outbound |
| `owner_auth_id` | VARCHAR(255) |  | idx |  |
| `notes` | TEXT |  |  |  |
| `is_active` | BOOLEAN | NOT NULL |  | true |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `corporate_deals`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `contact_id` | UUID | NOT NULL | FK→corporate_contacts.id, idx |  |
| `title` | VARCHAR(255) | NOT NULL |  |  |
| `stage` | VARCHAR(15) | NOT NULL | idx | lead |
| `expected_employees` | INTEGER |  |  |  |
| `expected_discount_tier` | VARCHAR(12) |  |  |  |
| `expected_total_kobo` | INTEGER |  |  |  |
| `expected_close_date` | DATE |  |  |  |
| `actual_close_date` | DATE |  |  |  |
| `next_action` | TEXT |  |  |  |
| `next_action_due` | DATE |  |  |  |
| `last_touch_at` | DATETIME |  |  |  |
| `lost_reason` | VARCHAR(19) |  |  |  |
| `lost_notes` | TEXT |  |  |  |
| `owner_auth_id` | VARCHAR(255) |  | idx |  |
| `notes` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `corporate_program_employees`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `program_id` | UUID | NOT NULL | FK→corporate_programs.id, idx |  |
| `full_name` | VARCHAR(255) | NOT NULL |  |  |
| `email` | VARCHAR(255) | NOT NULL | idx |  |
| `phone` | VARCHAR(50) |  |  |  |
| `member_id` | UUID |  | idx |  |
| `member_auth_id` | VARCHAR(255) |  | idx |  |
| `enrollment_status` | VARCHAR(10) | NOT NULL | idx | pending |
| `invitation_sent_at` | DATETIME |  |  |  |
| `registered_at` | DATETIME |  |  |  |
| `enrolled_at` | DATETIME |  |  |  |
| `notes` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

_Constraints:_ `uq_corporate_program_employee_email` (UniqueConstraint)

### `corporate_programs`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `contact_id` | UUID | NOT NULL | FK→corporate_contacts.id, idx |  |
| `deal_id` | UUID |  | FK→corporate_deals.id, idx, uniq |  |
| `name` | VARCHAR(255) | NOT NULL |  |  |
| `status` | VARCHAR(9) | NOT NULL | idx | draft |
| `employee_count` | INTEGER | NOT NULL |  | 0 |
| `discount_tier` | VARCHAR(12) | NOT NULL |  | full_price |
| `per_employee_kobo` | INTEGER | NOT NULL |  |  |
| `total_kobo` | INTEGER | NOT NULL |  |  |
| `payment_terms` | VARCHAR(12) | NOT NULL |  | deposit_half |
| `deposit_paid_kobo` | INTEGER | NOT NULL |  | 0 |
| `balance_paid_kobo` | INTEGER | NOT NULL |  | 0 |
| `cohort_id` | UUID |  | idx |  |
| `corporate_wallet_id` | UUID |  | idx |  |
| `expected_start_date` | DATE |  |  |  |
| `actual_start_date` | DATE |  |  |  |
| `expected_end_date` | DATE |  |  |  |
| `actual_end_date` | DATE |  |  |  |
| `is_pilot_partner` | BOOLEAN | NOT NULL |  | false |
| `notes` | TEXT |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |
| `updated_at` | DATETIME | NOT NULL |  |  |

### `corporate_touchpoints`

| Column | Type | Null | Key | Default |
|--------|------|------|-----|---------|
| `id` | UUID | NOT NULL | PK |  |
| `contact_id` | UUID | NOT NULL | FK→corporate_contacts.id, idx |  |
| `deal_id` | UUID |  | FK→corporate_deals.id, idx |  |
| `type` | VARCHAR(16) | NOT NULL |  |  |
| `direction` | VARCHAR(8) | NOT NULL |  | outbound |
| `occurred_at` | DATETIME | NOT NULL | idx |  |
| `summary` | VARCHAR(500) |  |  |  |
| `outcome` | TEXT |  |  |  |
| `next_action` | TEXT |  |  |  |
| `logged_by_auth_id` | VARCHAR(255) |  |  |  |
| `created_at` | DATETIME | NOT NULL |  |  |

---

_154 tables across 17 services._
