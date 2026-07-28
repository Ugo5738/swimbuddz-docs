# API Endpoint Reference (auto-generated)

> **Generated** by `scripts/api/generate-endpoints-doc.py` from `openapi.json`. Do not hand-edit — regenerate after backend changes. Worked examples, auth flows, and request/response walkthroughs live in the curated [API_ENDPOINTS.md](./API_ENDPOINTS.md).

All paths are shown as exposed through the gateway (`/api/v1/...`). `internal/*` routes are service-to-service (service-role JWT, not gateway-exposed).

**903 operations across 100 tags.**

## academy

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/academy/admin/enrollments/{enrollment_id}/dropout-action` | Admin Dropout Action |
| POST | `/api/v1/academy/admin/enrollments/{enrollment_id}/mark-paid` | Admin Mark Enrollment Paid |
| DELETE | `/api/v1/academy/admin/members/{member_id}` | Admin Delete Member Academy Records |
| POST | `/api/v1/academy/admin/progress/override` | Override Progress |
| POST | `/api/v1/academy/admin/tasks/reconcile-chat-memberships` | Trigger Chat Reconciliation |
| POST | `/api/v1/academy/admin/tasks/transition-cohort-statuses` | Trigger Cohort Status Transitions |
| GET | `/api/v1/academy/coach/me/cohorts/{cohort_id}` | Get Coach Cohort Detail |
| GET | `/api/v1/academy/coach/me/dashboard` | Get Coach Dashboard |
| GET | `/api/v1/academy/coach/me/earnings` | Get My Coach Earnings |
| POST | `/api/v1/academy/coach/me/milestone-reviews/{progress_id}` | Review Milestone Claim |
| GET | `/api/v1/academy/coach/me/pending-reviews` | List Pending Milestone Reviews |
| GET | `/api/v1/academy/coach/me/resources` | List My Coach Resources |
| GET | `/api/v1/academy/coach/me/students` | List My Coach Students |
| GET | `/api/v1/academy/cohorts` | List Cohorts |
| POST | `/api/v1/academy/cohorts` | Create Cohort |
| GET | `/api/v1/academy/cohorts/by-coach/{coach_member_id}` | List Cohorts By Coach |
| GET | `/api/v1/academy/cohorts/coach/me` | List My Coach Cohorts |
| GET | `/api/v1/academy/cohorts/enrollable` | List Enrollable Cohorts |
| GET | `/api/v1/academy/cohorts/open` | List Open Cohorts |
| GET | `/api/v1/academy/cohorts/{cohort_id}` | Get Cohort |
| PUT | `/api/v1/academy/cohorts/{cohort_id}` | Update Cohort |
| DELETE | `/api/v1/academy/cohorts/{cohort_id}` | Delete Cohort |
| POST | `/api/v1/academy/cohorts/{cohort_id}/ai-score` | Ai Score Cohort |
| POST | `/api/v1/academy/cohorts/{cohort_id}/ai-suggest-coach` | Ai Suggest Coach |
| GET | `/api/v1/academy/cohorts/{cohort_id}/analytics` | Get Cohort Analytics |
| GET | `/api/v1/academy/cohorts/{cohort_id}/complexity-score` | Get Cohort Complexity Score |
| POST | `/api/v1/academy/cohorts/{cohort_id}/complexity-score` | Create Cohort Complexity Score |
| PUT | `/api/v1/academy/cohorts/{cohort_id}/complexity-score` | Update Cohort Complexity Score |
| DELETE | `/api/v1/academy/cohorts/{cohort_id}/complexity-score` | Delete Cohort Complexity Score |
| POST | `/api/v1/academy/cohorts/{cohort_id}/complexity-score/review` | Mark Complexity Score Reviewed |
| GET | `/api/v1/academy/cohorts/{cohort_id}/eligible-coaches` | Get Eligible Coaches For Cohort |
| GET | `/api/v1/academy/cohorts/{cohort_id}/enrollment-stats` | Get Cohort Enrollment Stats |
| GET | `/api/v1/academy/cohorts/{cohort_id}/enrollments` | List Cohort Enrollments |
| GET | `/api/v1/academy/cohorts/{cohort_id}/progress-report.pdf` | Download Cohort Progress Report |
| GET | `/api/v1/academy/cohorts/{cohort_id}/resources` | List Cohort Resources |
| GET | `/api/v1/academy/cohorts/{cohort_id}/students` | List Cohort Students |
| GET | `/api/v1/academy/cohorts/{cohort_id}/timeline-shifts` | List Cohort Timeline Shift Logs |
| POST | `/api/v1/academy/cohorts/{cohort_id}/timeline-shifts` | Apply Cohort Timeline Shift |
| POST | `/api/v1/academy/cohorts/{cohort_id}/timeline-shifts/preview` | Preview Cohort Timeline Shift |
| GET | `/api/v1/academy/enrollments` | List Enrollments |
| POST | `/api/v1/academy/enrollments` | Enroll Student |
| POST | `/api/v1/academy/enrollments/me` | Self Enroll |
| GET | `/api/v1/academy/enrollments/{enrollment_id}` | Get Enrollment |
| PATCH | `/api/v1/academy/enrollments/{enrollment_id}` | Update Enrollment |
| GET | `/api/v1/academy/enrollments/{enrollment_id}/certificate.pdf` | Download Certificate |
| POST | `/api/v1/academy/enrollments/{enrollment_id}/pause` | Admin Pause Enrollment |
| GET | `/api/v1/academy/enrollments/{enrollment_id}/progress` | Get Student Progress |
| POST | `/api/v1/academy/enrollments/{enrollment_id}/progress/{milestone_id}/claim` | Claim Milestone |
| GET | `/api/v1/academy/enrollments/{enrollment_id}/progress/{progress_id}/events` | List Milestone Review Events |
| POST | `/api/v1/academy/enrollments/{enrollment_id}/resume` | Admin Resume Enrollment |
| POST | `/api/v1/academy/milestones` | Create Milestone |
| GET | `/api/v1/academy/my-enrollments` | Get My Enrollments |
| GET | `/api/v1/academy/my-enrollments/{enrollment_id}` | Get My Enrollment |
| GET | `/api/v1/academy/my-enrollments/{enrollment_id}/onboarding` | Get Enrollment Onboarding |
| POST | `/api/v1/academy/my-enrollments/{enrollment_id}/pause` | Pause My Enrollment |
| POST | `/api/v1/academy/my-enrollments/{enrollment_id}/resume` | Resume My Enrollment |
| GET | `/api/v1/academy/my-enrollments/{enrollment_id}/waitlist-position` | Get My Waitlist Position |
| POST | `/api/v1/academy/my-enrollments/{enrollment_id}/withdraw` | Withdraw My Enrollment |
| GET | `/api/v1/academy/programs` | List Programs |
| POST | `/api/v1/academy/programs` | Create Program |
| GET | `/api/v1/academy/programs/published` | List Published Programs |
| GET | `/api/v1/academy/programs/{program_id}` | Get Program |
| PUT | `/api/v1/academy/programs/{program_id}` | Update Program |
| DELETE | `/api/v1/academy/programs/{program_id}` | Delete Program |
| GET | `/api/v1/academy/programs/{program_id}/interest` | Check Program Interest |
| POST | `/api/v1/academy/programs/{program_id}/interest` | Register Program Interest |
| DELETE | `/api/v1/academy/programs/{program_id}/interest` | Remove Program Interest |
| GET | `/api/v1/academy/programs/{program_id}/milestones` | List Program Milestones |
| POST | `/api/v1/academy/progress` | Update Student Progress |
| POST | `/api/v1/academy/scoring/calculate` | Preview Complexity Score |
| GET | `/api/v1/academy/scoring/dimensions/{category}` | Get Scoring Dimensions |
| GET | `/api/v1/academy/stats/public` | Get Public Academy Stats |

## admin

| Method | Path | Summary |
|--------|------|---------|
| DELETE | `/api/v1/admin/members/{member_id}` | Admin Delete Member Comments |

## admin-chat

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/chat/audit` | Admin List Audit |
| GET | `/api/v1/admin/chat/channels/{channel_id}` | Admin Get Channel |
| POST | `/api/v1/admin/chat/channels/{channel_id}/archive` | Admin Archive Channel |
| PATCH | `/api/v1/admin/chat/channels/{channel_id}/members/{member_id}` | Admin Update Member Role |
| DELETE | `/api/v1/admin/chat/channels/{channel_id}/members/{member_id}` | Admin Remove Member |
| DELETE | `/api/v1/admin/chat/messages/{message_id}` | Admin Hard Delete Message |
| GET | `/api/v1/admin/chat/reports` | Admin List Reports |
| PATCH | `/api/v1/admin/chat/reports/{report_id}` | Admin Resolve Report |
| GET | `/api/v1/admin/chat/safeguarding/health` | Safeguarding Health |

## admin-coaches

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/coaches/` | List Coaches For Admin |
| GET | `/api/v1/admin/coaches/agreements` | List Agreement Versions |
| POST | `/api/v1/admin/coaches/agreements` | Create Agreement Version |
| GET | `/api/v1/admin/coaches/agreements/{version_id}` | Get Agreement Version Detail |
| GET | `/api/v1/admin/coaches/applications` | List Coach Applications |
| GET | `/api/v1/admin/coaches/applications/{coach_profile_id}` | Get Coach Application |
| DELETE | `/api/v1/admin/coaches/applications/{coach_profile_id}` | Delete Coach Application |
| POST | `/api/v1/admin/coaches/applications/{coach_profile_id}/approve` | Approve Coach Application |
| POST | `/api/v1/admin/coaches/applications/{coach_profile_id}/reject` | Reject Coach Application |
| POST | `/api/v1/admin/coaches/applications/{coach_profile_id}/request-info` | Request More Info |
| GET | `/api/v1/admin/coaches/eligible/{category}/{required_grade}` | List Eligible Coaches |
| POST | `/api/v1/admin/coaches/handbook` | Create Handbook Version |
| GET | `/api/v1/admin/coaches/handbook/versions` | List Handbook Versions |
| GET | `/api/v1/admin/coaches/{coach_profile_id}/grades` | Get Coach Grades |
| PUT | `/api/v1/admin/coaches/{coach_profile_id}/grades` | Update Coach Grades |
| POST | `/api/v1/admin/coaches/{coach_profile_id}/suggest-grades` | Suggest Coach Grades |

## admin-cohort-makeups

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/payments/admin/cohort-makeups/` | List Makeup Obligations |
| PATCH | `/api/v1/payments/admin/cohort-makeups/{obligation_id}/cancel` | Admin Cancel Makeup |
| PATCH | `/api/v1/payments/admin/cohort-makeups/{obligation_id}/schedule` | Admin Schedule Makeup |

## admin-corporate-contacts

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/corporate/contacts` | List Contacts |
| POST | `/api/v1/admin/corporate/contacts` | Create Contact |
| GET | `/api/v1/admin/corporate/contacts/{contact_id}` | Get Contact |
| PATCH | `/api/v1/admin/corporate/contacts/{contact_id}` | Update Contact |
| DELETE | `/api/v1/admin/corporate/contacts/{contact_id}` | Delete Contact |

## admin-corporate-deals

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/admin/corporate/contacts/{contact_id}/deals` | Create Deal |
| GET | `/api/v1/admin/corporate/deals` | List Deals |
| GET | `/api/v1/admin/corporate/deals/{deal_id}` | Get Deal |
| PATCH | `/api/v1/admin/corporate/deals/{deal_id}` | Update Deal |
| POST | `/api/v1/admin/corporate/deals/{deal_id}/lose` | Lose Deal |
| POST | `/api/v1/admin/corporate/deals/{deal_id}/win` | Win Deal |

## admin-corporate-employees

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/corporate/programs/{program_id}/employees` | List Employees |
| POST | `/api/v1/admin/corporate/programs/{program_id}/employees` | Bulk Add Employees |
| POST | `/api/v1/admin/corporate/programs/{program_id}/employees/match-members` | Match Employees To Members |
| DELETE | `/api/v1/admin/corporate/programs/{program_id}/employees/{employee_id}` | Remove Employee |

## admin-corporate-orchestration

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/admin/corporate/programs/{program_id}/enroll-all` | Enroll All Employees |
| POST | `/api/v1/admin/corporate/programs/{program_id}/link-cohort` | Link Cohort |
| POST | `/api/v1/admin/corporate/programs/{program_id}/provision-wallet` | Provision Wallet |

## admin-corporate-outreach

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/corporate/contacts/{contact_id}/outreach` | Get Outreach State |
| POST | `/api/v1/admin/corporate/contacts/{contact_id}/outreach/pause` | Pause Outreach |
| GET | `/api/v1/admin/corporate/contacts/{contact_id}/outreach/preview` | Preview Outreach |
| POST | `/api/v1/admin/corporate/contacts/{contact_id}/outreach/resume` | Resume Outreach |
| POST | `/api/v1/admin/corporate/contacts/{contact_id}/outreach/send-now` | Send Now |
| POST | `/api/v1/admin/corporate/contacts/{contact_id}/outreach/start` | Start Outreach |
| POST | `/api/v1/admin/corporate/outreach/run-cycle` | Run Cycle |

## admin-corporate-programs

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/corporate/programs` | List Programs |
| POST | `/api/v1/admin/corporate/programs` | Create Program |
| GET | `/api/v1/admin/corporate/programs/{program_id}` | Get Program |
| PATCH | `/api/v1/admin/corporate/programs/{program_id}` | Update Program |
| DELETE | `/api/v1/admin/corporate/programs/{program_id}` | Cancel Program |

## admin-corporate-reports

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/corporate/programs/{program_id}/report` | Get Program Outcome Report |
| POST | `/api/v1/admin/corporate/programs/{program_id}/report/email` | Email Program Outcome Report |

## admin-corporate-touchpoints

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/corporate/contacts/{contact_id}/touchpoints` | List Touchpoints |
| POST | `/api/v1/admin/corporate/contacts/{contact_id}/touchpoints` | Create Touchpoint |

## admin-flywheel

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/reports/flywheel/cohorts` | Flywheel Cohorts |
| GET | `/api/v1/admin/reports/flywheel/funnel` | Flywheel Funnel |
| GET | `/api/v1/admin/reports/flywheel/overview` | Flywheel Overview |
| POST | `/api/v1/admin/reports/flywheel/refresh` | Flywheel Refresh |
| GET | `/api/v1/admin/reports/flywheel/wallet` | Flywheel Wallet |

## admin-guardians

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/members/guardians` | List Guardian Links |
| POST | `/api/v1/admin/members/guardians` | Create Guardian Link |
| PATCH | `/api/v1/admin/members/guardians/{link_id}` | Update Guardian Link |

## admin-members

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/admin/members/by-auth/{auth_id}/academy/activate` | Admin Activate Academy Membership By Auth |
| POST | `/api/v1/admin/members/by-auth/{auth_id}/academy/expire` | Admin Expire Academy Membership By Auth |
| POST | `/api/v1/admin/members/by-auth/{auth_id}/academy/project` | Admin Project Academy Membership By Auth |
| POST | `/api/v1/admin/members/by-auth/{auth_id}/club/activate` | Admin Activate Club Membership By Auth |
| POST | `/api/v1/admin/members/by-auth/{auth_id}/club/extend` | Admin Extend Club Membership By Auth |
| POST | `/api/v1/admin/members/by-auth/{auth_id}/club/post-academy-bridge` | Admin Grant Post Academy Club Bridge By Auth |
| POST | `/api/v1/admin/members/by-auth/{auth_id}/community/activate` | Admin Activate Community Membership By Auth |
| POST | `/api/v1/admin/members/by-auth/{auth_id}/community/extend` | Admin Extend Community Membership By Auth |
| PATCH | `/api/v1/admin/members/by-auth/{auth_id}/membership` | Admin Patch Membership By Auth |
| GET | `/api/v1/admin/members/by-email/{email}` | Get Member By Email |
| GET | `/api/v1/admin/members/pending` | List Pending Members |
| POST | `/api/v1/admin/members/{member_id}/approve` | Approve Member |
| POST | `/api/v1/admin/members/{member_id}/approve-upgrade` | Approve Member Upgrade |
| POST | `/api/v1/admin/members/{member_id}/reject` | Reject Member |

## admin-payouts

| Method | Path | Summary |
|--------|------|---------|
| PATCH | `/api/v1/admin/store/payouts/{payout_id}/status` | Update Payout Status |
| GET | `/api/v1/admin/store/suppliers/{supplier_id}/payouts` | List Supplier Payouts |
| POST | `/api/v1/admin/store/suppliers/{supplier_id}/payouts` | Create Payout |
| GET | `/api/v1/payments/admin/payouts/` | List Payouts |
| POST | `/api/v1/payments/admin/payouts/` | Create Payout |
| GET | `/api/v1/payments/admin/payouts/summary` | Get Payout Summary |
| GET | `/api/v1/payments/admin/payouts/{payout_id}` | Get Payout |
| PUT | `/api/v1/payments/admin/payouts/{payout_id}/approve` | Approve Payout |
| PUT | `/api/v1/payments/admin/payouts/{payout_id}/complete-manual` | Complete Manual Payout |
| PUT | `/api/v1/payments/admin/payouts/{payout_id}/fail` | Fail Payout |
| POST | `/api/v1/payments/admin/payouts/{payout_id}/initiate-transfer` | Initiate Transfer |
| PUT | `/api/v1/payments/admin/payouts/{payout_id}/recalculate` | Recalculate Payout |

## admin-pool-related

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/pools/{pool_id}/agreements` | List Agreements |
| POST | `/api/v1/admin/pools/{pool_id}/agreements` | Create Agreement |
| PATCH | `/api/v1/admin/pools/{pool_id}/agreements/{agreement_id}` | Update Agreement |
| DELETE | `/api/v1/admin/pools/{pool_id}/agreements/{agreement_id}` | Delete Agreement |
| GET | `/api/v1/admin/pools/{pool_id}/assets` | List Assets |
| POST | `/api/v1/admin/pools/{pool_id}/assets` | Create Asset |
| PATCH | `/api/v1/admin/pools/{pool_id}/assets/{asset_id}` | Update Asset |
| DELETE | `/api/v1/admin/pools/{pool_id}/assets/{asset_id}` | Delete Asset |
| GET | `/api/v1/admin/pools/{pool_id}/contacts` | List Contacts |
| POST | `/api/v1/admin/pools/{pool_id}/contacts` | Create Contact |
| PATCH | `/api/v1/admin/pools/{pool_id}/contacts/{contact_id}` | Update Contact |
| DELETE | `/api/v1/admin/pools/{pool_id}/contacts/{contact_id}` | Delete Contact |
| GET | `/api/v1/admin/pools/{pool_id}/status-history` | List Status History |
| GET | `/api/v1/admin/pools/{pool_id}/visits` | List Visits |
| POST | `/api/v1/admin/pools/{pool_id}/visits` | Create Visit |
| PATCH | `/api/v1/admin/pools/{pool_id}/visits/{visit_id}` | Update Visit |
| DELETE | `/api/v1/admin/pools/{pool_id}/visits/{visit_id}` | Delete Visit |

## admin-pool-submissions

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/pools/submissions` | List Submissions |
| GET | `/api/v1/admin/pools/submissions/{submission_id}` | Get Submission |
| POST | `/api/v1/admin/pools/submissions/{submission_id}/approve` | Approve Submission |
| POST | `/api/v1/admin/pools/submissions/{submission_id}/reject` | Reject Submission |

## admin-pools

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/pools` | List Pools |
| POST | `/api/v1/admin/pools` | Create Pool |
| GET | `/api/v1/admin/pools/{pool_id}` | Get Pool |
| PATCH | `/api/v1/admin/pools/{pool_id}` | Update Pool |
| DELETE | `/api/v1/admin/pools/{pool_id}` | Delete Pool |
| POST | `/api/v1/admin/pools/{pool_id}/status` | Update Partnership Status |

## admin-recurring-payouts

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/payments/admin/recurring-payouts/` | List Recurring Payout Configs |
| POST | `/api/v1/payments/admin/recurring-payouts/` | Create Recurring Payout Config |
| GET | `/api/v1/payments/admin/recurring-payouts/{config_id}` | Get Recurring Payout Config |
| PATCH | `/api/v1/payments/admin/recurring-payouts/{config_id}` | Update Recurring Payout Config |
| GET | `/api/v1/payments/admin/recurring-payouts/{config_id}/preview` | Preview Recurring Payout |
| POST | `/api/v1/payments/admin/recurring-payouts/{config_id}/run-now` | Run Recurring Payout Now |

## admin-referral

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/wallet/referrals/` | List Referrals |
| GET | `/api/v1/admin/wallet/referrals/leaderboard` | Get Referral Leaderboard |
| GET | `/api/v1/admin/wallet/referrals/stats` | Get Program Stats |
| PATCH | `/api/v1/admin/wallet/referrals/{referral_id}` | Update Referral Status |

## admin-reports

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/reports/quarterly/export.csv` | Admin Export Csv |
| POST | `/api/v1/admin/reports/quarterly/generate` | Admin Generate Report |
| GET | `/api/v1/admin/reports/quarterly/members` | Admin List Member Reports |
| GET | `/api/v1/admin/reports/quarterly/overview` | Admin Quarterly Overview |
| POST | `/api/v1/admin/reports/quarterly/send-emails` | Admin Send Report Emails |
| GET | `/api/v1/admin/reports/quarterly/status` | Admin Report Status |

## admin-rewards

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/wallet/rewards/alerts` | List Alerts |
| GET | `/api/v1/admin/wallet/rewards/alerts/summary` | Get Alert Summary |
| GET | `/api/v1/admin/wallet/rewards/alerts/{alert_id}` | Get Alert |
| PATCH | `/api/v1/admin/wallet/rewards/alerts/{alert_id}` | Update Alert |
| GET | `/api/v1/admin/wallet/rewards/analytics` | Get Reward Analytics |
| GET | `/api/v1/admin/wallet/rewards/events` | List Reward Events |
| GET | `/api/v1/admin/wallet/rewards/events/failed` | List Failed Events |
| POST | `/api/v1/admin/wallet/rewards/events/submit` | Admin Submit Event |
| GET | `/api/v1/admin/wallet/rewards/rules` | List Reward Rules |
| POST | `/api/v1/admin/wallet/rewards/rules` | Create Reward Rule |
| GET | `/api/v1/admin/wallet/rewards/rules/{rule_id}` | Get Reward Rule |
| PATCH | `/api/v1/admin/wallet/rewards/rules/{rule_id}` | Update Reward Rule |
| GET | `/api/v1/admin/wallet/rewards/stats` | Get Reward Stats |

## admin-seasonality

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/reports/seasonality/actuals` | List Actuals |
| POST | `/api/v1/admin/reports/seasonality/actuals/auto-ingest` | Auto Ingest Actuals |
| POST | `/api/v1/admin/reports/seasonality/actuals/ingest` | Ingest Actual |
| POST | `/api/v1/admin/reports/seasonality/external-factors/seed` | Seed External Factors |
| GET | `/api/v1/admin/reports/seasonality/forecast/{forecast_year}` | Get Forecast |
| GET | `/api/v1/admin/reports/seasonality/forecast/{forecast_year}/calendar` | Get Forecast Calendar |
| GET | `/api/v1/admin/reports/seasonality/forecast/{forecast_year}/export.csv` | Export Csv |
| GET | `/api/v1/admin/reports/seasonality/forecast/{forecast_year}/export.html` | Export Html |
| GET | `/api/v1/admin/reports/seasonality/forecast/{forecast_year}/export.md` | Export Markdown |
| POST | `/api/v1/admin/reports/seasonality/generate` | Generate Forecast |

## admin-store

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/store/categories` | List All Categories |
| POST | `/api/v1/admin/store/categories` | Create Category |
| PATCH | `/api/v1/admin/store/categories/{category_id}` | Update Category |
| DELETE | `/api/v1/admin/store/categories/{category_id}` | Delete Category |
| GET | `/api/v1/admin/store/collections` | List All Collections |
| POST | `/api/v1/admin/store/collections` | Create Collection |
| GET | `/api/v1/admin/store/collections/{collection_id}` | Get Collection |
| PATCH | `/api/v1/admin/store/collections/{collection_id}` | Update Collection |
| POST | `/api/v1/admin/store/collections/{collection_id}/products/{product_id}` | Add Product To Collection |
| DELETE | `/api/v1/admin/store/collections/{collection_id}/products/{product_id}` | Remove Product From Collection |
| GET | `/api/v1/admin/store/credits` | List All Store Credits |
| POST | `/api/v1/admin/store/credits` | Create Store Credit |
| GET | `/api/v1/admin/store/inventory` | List Inventory |
| GET | `/api/v1/admin/store/inventory/low-stock` | Get Low Stock Items |
| PATCH | `/api/v1/admin/store/inventory/{inventory_id}` | Adjust Inventory |
| POST | `/api/v1/admin/store/maintenance/cleanup` | Run Cleanup |
| GET | `/api/v1/admin/store/orders` | List All Orders |
| GET | `/api/v1/admin/store/orders/new-count` | Get New Order Count |
| GET | `/api/v1/admin/store/orders/{order_id}` | Get Order Admin |
| PATCH | `/api/v1/admin/store/orders/{order_id}` | Update Order |
| POST | `/api/v1/admin/store/orders/{order_id}/mark-paid` | Mark Order Paid |
| POST | `/api/v1/admin/store/orders/{order_id}/refund` | Issue Refund |
| PATCH | `/api/v1/admin/store/orders/{order_id}/status` | Update Order Status |
| GET | `/api/v1/admin/store/pickup-locations` | List All Pickup Locations |
| POST | `/api/v1/admin/store/pickup-locations` | Create Pickup Location |
| PATCH | `/api/v1/admin/store/pickup-locations/{location_id}` | Update Pickup Location |
| DELETE | `/api/v1/admin/store/pickup-locations/{location_id}` | Delete Pickup Location |
| GET | `/api/v1/admin/store/products` | List All Products |
| POST | `/api/v1/admin/store/products` | Create Product |
| GET | `/api/v1/admin/store/products/{product_id}` | Get Product Admin |
| PATCH | `/api/v1/admin/store/products/{product_id}` | Update Product |
| DELETE | `/api/v1/admin/store/products/{product_id}` | Archive Product |
| POST | `/api/v1/admin/store/products/{product_id}/images` | Add Product Image |
| PATCH | `/api/v1/admin/store/products/{product_id}/images/{image_id}` | Update Product Image |
| DELETE | `/api/v1/admin/store/products/{product_id}/images/{image_id}` | Delete Product Image |
| POST | `/api/v1/admin/store/products/{product_id}/variants` | Create Variant |
| PATCH | `/api/v1/admin/store/products/{product_id}/variants/{variant_id}` | Update Variant |
| DELETE | `/api/v1/admin/store/products/{product_id}/variants/{variant_id}` | Delete Variant |
| POST | `/api/v1/admin/store/products/{product_id}/videos` | Add Product Video |
| DELETE | `/api/v1/admin/store/products/{product_id}/videos/{video_id}` | Delete Product Video |
| GET | `/api/v1/admin/store/reports/inventory` | Get Inventory Report |
| GET | `/api/v1/admin/store/reports/sales` | Get Sales Summary |
| GET | `/api/v1/admin/store/reports/suppliers` | Get Supplier Performance |
| GET | `/api/v1/admin/store/reports/top-products` | Get Top Selling Products |
| GET | `/api/v1/admin/store/stats` | Get Dashboard Stats |

## admin-suppliers

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/store/suppliers` | List Suppliers |
| POST | `/api/v1/admin/store/suppliers` | Create Supplier |
| GET | `/api/v1/admin/store/suppliers/{supplier_id}` | Get Supplier |
| PATCH | `/api/v1/admin/store/suppliers/{supplier_id}` | Update Supplier |
| POST | `/api/v1/admin/store/suppliers/{supplier_id}/activate` | Activate Supplier |
| POST | `/api/v1/admin/store/suppliers/{supplier_id}/suspend` | Suspend Supplier |

## admin-tasks

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/admin/members/tasks/reconcile-location-chat-memberships` | Trigger Location Chat Reconciliation |
| POST | `/api/v1/admin/members/tasks/reconcile-pod-chat-memberships` | Trigger Pod Chat Reconciliation |
| POST | `/api/v1/events/admin/tasks/reconcile-event-chat-memberships` | Trigger Event Chat Reconciliation |
| POST | `/api/v1/transport/admin/tasks/reconcile-trip-chat-memberships` | Trigger Trip Chat Reconciliation |

## admin-volunteers

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/volunteers/dashboard` | Admin Dashboard |
| POST | `/api/v1/admin/volunteers/hours/manual` | Add Manual Hours |
| GET | `/api/v1/admin/volunteers/opportunities` | List Opportunities |
| POST | `/api/v1/admin/volunteers/opportunities` | Create Opportunity |
| POST | `/api/v1/admin/volunteers/opportunities/bulk` | Bulk Create Opportunities |
| PATCH | `/api/v1/admin/volunteers/opportunities/{opp_id}` | Update Opportunity |
| DELETE | `/api/v1/admin/volunteers/opportunities/{opp_id}` | Cancel Opportunity |
| POST | `/api/v1/admin/volunteers/opportunities/{opp_id}/publish` | Publish Opportunity |
| GET | `/api/v1/admin/volunteers/opportunities/{opp_id}/slots` | List Slots |
| GET | `/api/v1/admin/volunteers/opportunity-templates` | List Opportunity Templates |
| POST | `/api/v1/admin/volunteers/opportunity-templates` | Create Opportunity Template |
| PATCH | `/api/v1/admin/volunteers/opportunity-templates/{template_id}` | Update Opportunity Template |
| DELETE | `/api/v1/admin/volunteers/opportunity-templates/{template_id}` | Delete Opportunity Template |
| POST | `/api/v1/admin/volunteers/opportunity-templates/{template_id}/materialise` | Materialise Opportunity Template |
| GET | `/api/v1/admin/volunteers/profiles` | List Profiles |
| GET | `/api/v1/admin/volunteers/profiles/{member_id}` | Get Profile |
| PATCH | `/api/v1/admin/volunteers/profiles/{member_id}` | Admin Update Profile |
| POST | `/api/v1/admin/volunteers/profiles/{member_id}/feature` | Feature Volunteer |
| DELETE | `/api/v1/admin/volunteers/profiles/{member_id}/feature` | Unfeature Volunteer |
| GET | `/api/v1/admin/volunteers/reliability-report` | Reliability Report |
| POST | `/api/v1/admin/volunteers/rewards` | Grant Reward |
| GET | `/api/v1/admin/volunteers/rewards/all` | List All Rewards |
| POST | `/api/v1/admin/volunteers/roles` | Create Role |
| PATCH | `/api/v1/admin/volunteers/roles/{role_id}` | Update Role |
| DELETE | `/api/v1/admin/volunteers/roles/{role_id}` | Deactivate Role |
| GET | `/api/v1/admin/volunteers/session-templates/{session_template_id}/slots` | List Session Template Slots |
| POST | `/api/v1/admin/volunteers/session-templates/{session_template_id}/slots` | Create Session Template Slot |
| PATCH | `/api/v1/admin/volunteers/session-templates/{session_template_id}/slots/{slot_id}` | Update Session Template Slot |
| DELETE | `/api/v1/admin/volunteers/session-templates/{session_template_id}/slots/{slot_id}` | Delete Session Template Slot |
| POST | `/api/v1/admin/volunteers/slots/bulk-complete` | Bulk Complete |
| PATCH | `/api/v1/admin/volunteers/slots/{slot_id}` | Update Slot |
| POST | `/api/v1/admin/volunteers/slots/{slot_id}/checkin` | Checkin Slot |
| POST | `/api/v1/admin/volunteers/slots/{slot_id}/checkout` | Checkout Slot |
| POST | `/api/v1/admin/volunteers/slots/{slot_id}/no-show` | Mark No Show |

## admin-wallet

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/wallet/audit-log` | Get Audit Log |
| GET | `/api/v1/admin/wallet/grants` | List All Grants |
| POST | `/api/v1/admin/wallet/grants` | Create Grant |
| GET | `/api/v1/admin/wallet/stats` | Get Stats |
| GET | `/api/v1/admin/wallet/topups` | List Topups Admin |
| GET | `/api/v1/admin/wallet/transactions` | List All Transactions |
| GET | `/api/v1/admin/wallet/wallets` | List Wallets |
| GET | `/api/v1/admin/wallet/wallets/{wallet_id}` | Get Wallet Detail |
| POST | `/api/v1/admin/wallet/wallets/{wallet_id}/adjust` | Adjust Balance |
| POST | `/api/v1/admin/wallet/wallets/{wallet_id}/freeze` | Freeze Wallet |
| POST | `/api/v1/admin/wallet/wallets/{wallet_id}/unfreeze` | Unfreeze Wallet |

## admin-weather

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/admin/weather/refresh` | Trigger Refresh |
| GET | `/api/v1/admin/weather/snapshots` | List Weather Snapshots |

## ai

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/ai/score/coach-grade` | Score Coach Grade Endpoint |
| POST | `/api/v1/ai/score/cohort-complexity` | Score Cohort Complexity Endpoint |
| POST | `/api/v1/ai/score/suggest-coach` | Suggest Coach Endpoint |

## ai-admin

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/ai/admin/models` | List Model Configs |
| POST | `/api/v1/ai/admin/models` | Create Model Config |
| GET | `/api/v1/ai/admin/prompts` | List Prompt Templates |
| POST | `/api/v1/ai/admin/prompts` | Create Prompt Template |
| GET | `/api/v1/ai/admin/requests` | List Ai Requests |

## ai-content

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/ai/content/drafts` | Create Content Draft |
| POST | `/api/v1/ai/content/images` | Create Content Image |

## announcement-categories

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/categories/` | List Announcement Categories |
| POST | `/api/v1/categories/` | Create Announcement Category |
| PATCH | `/api/v1/categories/{category_id}` | Update Announcement Category |
| DELETE | `/api/v1/categories/{category_id}` | Delete Announcement Category |

## announcements

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/announcements/` | List Announcements |
| POST | `/api/v1/announcements/` | Create Announcement |
| GET | `/api/v1/announcements/stats` | Get Announcement Stats |
| GET | `/api/v1/announcements/unread-count` | Get Unread Count |
| GET | `/api/v1/announcements/{announcement_id}` | Get Announcement |
| PATCH | `/api/v1/announcements/{announcement_id}` | Update Announcement |
| DELETE | `/api/v1/announcements/{announcement_id}` | Delete Announcement |
| GET | `/api/v1/announcements/{announcement_id}/comments` | List Announcement Comments |
| POST | `/api/v1/announcements/{announcement_id}/comments` | Create Announcement Comment |
| POST | `/api/v1/announcements/{announcement_id}/read` | Mark Announcement Read |
| GET | `/api/v1/announcements/{announcement_id}/read-stats` | Get Announcement Read Stats |
| GET | `/api/v1/announcements/{announcement_id}/read-status` | Get Announcement Read Status |

## assessments

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/assessments` | Submit Assessment |
| POST | `/api/v1/assessments/` | Submit Assessment |
| GET | `/api/v1/assessments/me` | Get My Assessments |
| GET | `/api/v1/assessments/stats` | Get Assessment Stats |
| GET | `/api/v1/assessments/{assessment_id}` | Get Assessment |

## attendance

| Method | Path | Summary |
|--------|------|---------|
| DELETE | `/api/v1/attendance/admin/members/{member_id}` | Admin Delete Member Attendance |
| GET | `/api/v1/attendance/cohorts/{cohort_id}/attendance/summary` | Get Cohort Attendance Summary |
| GET | `/api/v1/attendance/me` | Get My Attendance History |
| GET | `/api/v1/attendance/sessions/{session_id}/attendance` | List Session Attendance |
| POST | `/api/v1/attendance/sessions/{session_id}/attendance/guest` | Record Guest Attendance |
| POST | `/api/v1/attendance/sessions/{session_id}/attendance/public` | Public Sign In To Session |
| GET | `/api/v1/attendance/sessions/{session_id}/booked-member-ids` | List Session Booked Member Ids |
| POST | `/api/v1/attendance/sessions/{session_id}/coach-mark` | Coach Mark Session Attendance |
| GET | `/api/v1/attendance/sessions/{session_id}/pool-list` | Get Pool List Csv |
| POST | `/api/v1/attendance/sessions/{session_id}/sign-in` | Sign In To Session |

## audio

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/media/audio-tracks` | List Audio Tracks |
| POST | `/api/v1/media/audio-tracks` | Upload Audio Track |
| GET | `/api/v1/media/audio-tracks/{track_id}` | Get Audio Track |
| PUT | `/api/v1/media/audio-tracks/{track_id}` | Update Audio Track |
| DELETE | `/api/v1/media/audio-tracks/{track_id}` | Delete Audio Track |
| POST | `/api/v1/media/videos/{media_id}/apply-audio` | Apply Audio To Video |

## bookings

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/sessions/booking-guests/convert` | Convert Guest To Member |
| GET | `/api/v1/sessions/booking-guests/leads` | List Guest Leads |
| GET | `/api/v1/sessions/bookings/me` | List My Bookings |
| GET | `/api/v1/sessions/bookings/me/unpaid` | List My Unpaid Bookings |
| POST | `/api/v1/sessions/bookings/{booking_id}/cancel` | Cancel Booking |
| POST | `/api/v1/sessions/bookings/{booking_id}/confirm` | Confirm Booking |
| POST | `/api/v1/sessions/bookings/{booking_id}/excuse` | Excuse Booking |
| PATCH | `/api/v1/sessions/bookings/{booking_id}/guests/{guest_id}` | Name Booking Guest |
| POST | `/api/v1/sessions/bookings/{booking_id}/refund-pool-fee` | Admin Refund Pool Fee |
| POST | `/api/v1/sessions/bookings/{booking_id}/running-late` | Set Running Late |
| POST | `/api/v1/sessions/bookings/{booking_id}/trial-guest` | Add Trial Guest |
| POST | `/api/v1/sessions/{session_id}/admin/walk-in` | Admin Walk In Booking |
| POST | `/api/v1/sessions/{session_id}/book` | Book Session |
| GET | `/api/v1/sessions/{session_id}/bookings` | List Session Bookings |

## bundles

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/sessions/bundles` | Create Bundle Cart |
| GET | `/api/v1/sessions/bundles/{bundle_id}` | Get Bundle Cart |

## calendar

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/calendar` | Get Calendar |

## challenges

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/challenges/` | List Club Challenges |
| POST | `/api/v1/challenges/` | Create Club Challenge |
| POST | `/api/v1/challenges/completions` | Mark Challenge Complete |
| GET | `/api/v1/challenges/public/all` | List Public Challenges |
| GET | `/api/v1/challenges/public/{challenge_id}` | Get Public Challenge |
| GET | `/api/v1/challenges/series/list` | List Challenges By Series |
| GET | `/api/v1/challenges/submissions/list` | List Submissions |
| GET | `/api/v1/challenges/submissions/mine` | List My Submissions |
| GET | `/api/v1/challenges/submissions/pending` | List Pending Submissions Legacy |
| PATCH | `/api/v1/challenges/submissions/{submission_id}` | Review Challenge Submission |
| POST | `/api/v1/challenges/submissions/{submission_id}/mark-winner` | Mark Submission As Winner |
| POST | `/api/v1/challenges/submissions/{submission_id}/revoke` | Revoke Challenge Submission |
| GET | `/api/v1/challenges/{challenge_id}` | Get Club Challenge |
| PATCH | `/api/v1/challenges/{challenge_id}` | Update Club Challenge |
| DELETE | `/api/v1/challenges/{challenge_id}` | Delete Club Challenge |
| GET | `/api/v1/challenges/{challenge_id}/completions` | List Challenge Completions |
| POST | `/api/v1/challenges/{challenge_id}/submissions` | Create Challenge Submission |

## chat

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/chat/attachments` | Upload Attachment |
| GET | `/api/v1/chat/channels` | List My Channels |
| GET | `/api/v1/chat/channels/{channel_id}` | Get Channel |
| POST | `/api/v1/chat/channels/{channel_id}/leave` | Leave Channel |
| GET | `/api/v1/chat/channels/{channel_id}/messages` | List Channel Messages |
| POST | `/api/v1/chat/channels/{channel_id}/messages` | Send Channel Message |
| POST | `/api/v1/chat/channels/{channel_id}/mute` | Mute Channel |
| POST | `/api/v1/chat/channels/{channel_id}/read` | Mark Channel Read |
| PATCH | `/api/v1/chat/messages/{message_id}` | Edit Message |
| DELETE | `/api/v1/chat/messages/{message_id}` | Soft Delete Message |
| POST | `/api/v1/chat/messages/{message_id}/reactions` | Add Reaction |
| DELETE | `/api/v1/chat/messages/{message_id}/reactions/{emoji}` | Remove Reaction |
| POST | `/api/v1/chat/messages/{message_id}/reports` | Report Message |

## clubs

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/clubs/` | List Clubs |
| POST | `/api/v1/clubs/` | Create Club |
| GET | `/api/v1/clubs/{club_id}` | Get Club |
| PATCH | `/api/v1/clubs/{club_id}` | Update Club |
| DELETE | `/api/v1/clubs/{club_id}` | Delete Club |

## coach-assignments

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/academy/coach-assignments/` | Create Assignment |
| GET | `/api/v1/academy/coach-assignments/coach/me` | List My Assignments |
| GET | `/api/v1/academy/coach-assignments/coach/{coach_id}` | List Coach Assignments |
| GET | `/api/v1/academy/coach-assignments/cohort/{cohort_id}` | List Cohort Assignments |
| GET | `/api/v1/academy/coach-assignments/readiness/{coach_id}` | Get Coach Readiness |
| PATCH | `/api/v1/academy/coach-assignments/{assignment_id}` | Update Assignment |
| DELETE | `/api/v1/academy/coach-assignments/{assignment_id}` | Cancel Assignment |
| GET | `/api/v1/academy/coach-assignments/{assignment_id}/evaluations` | List Evaluations |
| POST | `/api/v1/academy/coach-assignments/{assignment_id}/evaluations` | Create Shadow Evaluation |

## coach-cohort-makeups

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/payments/coach/me/cohort-makeups/` | Coach List Makeup Obligations |
| PATCH | `/api/v1/payments/coach/me/cohort-makeups/{obligation_id}/schedule` | Coach Schedule Makeup |

## coach-earnings

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/payments/coach/me/earnings/` | Coach Earnings Summary |

## coach-payouts

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/payments/coach/me/payouts/` | Get My Payouts |
| GET | `/api/v1/payments/coach/me/payouts/{payout_id}` | Get My Payout |

## coaches

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/coaches/agreement/current` | Get Current Agreement |
| GET | `/api/v1/coaches/agreement/history` | Get Agreement History |
| POST | `/api/v1/coaches/agreement/sign` | Sign Agreement |
| GET | `/api/v1/coaches/agreement/status` | Get Agreement Status |
| GET | `/api/v1/coaches/application-status` | Get Application Status |
| POST | `/api/v1/coaches/apply` | Apply As Coach |
| GET | `/api/v1/coaches/banks` | List Banks |
| GET | `/api/v1/coaches/handbook/current` | Get Current Handbook |
| GET | `/api/v1/coaches/handbook/{version}` | Get Handbook Version |
| GET | `/api/v1/coaches/me` | Get My Coach Profile |
| PATCH | `/api/v1/coaches/me` | Update My Coach Profile |
| GET | `/api/v1/coaches/me/availability` | Get My Availability |
| PUT | `/api/v1/coaches/me/availability` | Set My Availability |
| GET | `/api/v1/coaches/me/bank-account` | Get My Bank Account |
| POST | `/api/v1/coaches/me/bank-account` | Create Or Update Bank Account |
| DELETE | `/api/v1/coaches/me/bank-account` | Delete Bank Account |
| GET | `/api/v1/coaches/me/grades` | Get My Grades |
| POST | `/api/v1/coaches/me/onboarding` | Complete Coach Onboarding |
| POST | `/api/v1/coaches/me/preferences` | Update My Coach Preferences |
| GET | `/api/v1/coaches/me/progression` | Get My Progression |
| POST | `/api/v1/coaches/resolve-account` | Resolve Bank Account |
| GET | `/api/v1/members/coaches` | List Coaches |
| GET | `/api/v1/members/coaches/{member_id}` | Get Coach By Id |

## community-reports

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/reports/community/leaderboards` | Get Leaderboard |
| GET | `/api/v1/reports/community/quarterly` | Get Community Quarterly Stats |

## content

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/content/` | List Content Posts |
| POST | `/api/v1/content/` | Create Content Post |
| POST | `/api/v1/content/ai-drafts` | Create Ai Content Draft |
| GET | `/api/v1/content/{post_id}` | Get Content Post |
| PATCH | `/api/v1/content/{post_id}` | Update Content Post |
| DELETE | `/api/v1/content/{post_id}` | Delete Content Post |
| GET | `/api/v1/content/{post_id}/comments` | List Content Comments |
| POST | `/api/v1/content/{post_id}/comments` | Create Content Comment |
| POST | `/api/v1/content/{post_id}/email/retry-failed` | Retry Failed Content Post Emails |
| POST | `/api/v1/content/{post_id}/publish` | Publish Content Post |
| POST | `/api/v1/content/{post_id}/unpublish` | Unpublish Content Post |

## corporate-me

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/corporate/me` | Get My Account |
| GET | `/api/v1/corporate/me/programs` | List My Programs |
| GET | `/api/v1/corporate/me/programs/{program_id}` | Get My Program |
| GET | `/api/v1/corporate/me/programs/{program_id}/employees` | List My Program Employees |
| GET | `/api/v1/corporate/me/programs/{program_id}/report` | Get My Program Report |

## corporate-me-auth

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/corporate/me/auth/request-link` | Request Magic Link |
| POST | `/api/v1/corporate/me/auth/verify` | Verify Magic Link |

## curriculum

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/academy/curricula/{curriculum_id}/weeks` | Add Week |
| PUT | `/api/v1/academy/curricula/{curriculum_id}/weeks/reorder` | Reorder Weeks |
| PUT | `/api/v1/academy/curriculum-lessons/{lesson_id}` | Update Lesson |
| DELETE | `/api/v1/academy/curriculum-lessons/{lesson_id}` | Delete Lesson |
| PUT | `/api/v1/academy/curriculum-weeks/{week_id}` | Update Week |
| DELETE | `/api/v1/academy/curriculum-weeks/{week_id}` | Delete Week |
| POST | `/api/v1/academy/curriculum-weeks/{week_id}/lessons` | Add Lesson |
| PUT | `/api/v1/academy/curriculum-weeks/{week_id}/lessons/reorder` | Reorder Lessons |
| GET | `/api/v1/academy/programs/{program_id}/curriculum` | Get Program Curriculum |
| POST | `/api/v1/academy/programs/{program_id}/curriculum` | Create Program Curriculum |
| GET | `/api/v1/academy/skills` | List Skills |
| POST | `/api/v1/academy/skills` | Create Skill |
| PUT | `/api/v1/academy/skills/{skill_id}` | Update Skill |
| DELETE | `/api/v1/academy/skills/{skill_id}` | Delete Skill |

## email

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/email/send` | Send Single Email |
| POST | `/api/v1/email/send-bulk` | Send Bulk Emails |
| POST | `/api/v1/email/template` | Send Templated Email |

## events

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/events/` | List Events |
| POST | `/api/v1/events/` | Create Event |
| DELETE | `/api/v1/events/admin/members/{member_id}` | Admin Delete Member Event Rsvps |
| POST | `/api/v1/events/open-swim` | Create Open Swim |
| PATCH | `/api/v1/events/open-swim/{event_id}` | Update Open Swim |
| DELETE | `/api/v1/events/open-swim/{event_id}` | Cancel Open Swim |
| GET | `/api/v1/events/{event_id}` | Get Event |
| PATCH | `/api/v1/events/{event_id}` | Update Event |
| DELETE | `/api/v1/events/{event_id}` | Delete Event |
| POST | `/api/v1/events/{event_id}/rsvp` | Create Or Update Rsvp |
| GET | `/api/v1/events/{event_id}/rsvps` | List Event Rsvps |

## extension-requests

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/academy/extension-requests/coach/me` | List My Extension Requests |
| GET | `/api/v1/academy/extension-requests/cohorts/{cohort_id}` | List Extension Requests For Cohort |
| POST | `/api/v1/academy/extension-requests/cohorts/{cohort_id}` | Create Extension Request |
| GET | `/api/v1/academy/extension-requests/pending` | List Pending Extension Requests |
| POST | `/api/v1/academy/extension-requests/{request_id}/approve` | Approve Extension Request |
| POST | `/api/v1/academy/extension-requests/{request_id}/reject` | Reject Extension Request |

## internal

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/internal/academy/coaches/{coach_member_id}/cohort-ids` | List Cohort Ids For Coach |
| GET | `/api/v1/internal/academy/cohorts` | List Cohorts Internal |
| GET | `/api/v1/internal/academy/cohorts/{cohort_id}` | Get Cohort Internal |
| GET | `/api/v1/internal/academy/cohorts/{cohort_id}/check-enrollment/{member_id}` | Check Cohort Enrollment Internal |
| GET | `/api/v1/internal/academy/cohorts/{cohort_id}/enrolled-students` | Get Cohort Enrolled Students Internal |
| GET | `/api/v1/internal/academy/cohorts/{cohort_id}/enrollment-counts` | Get Cohort Enrollment Counts Internal |
| GET | `/api/v1/internal/academy/enrollments/{enrollment_id}` | Get Enrollment Internal |
| GET | `/api/v1/internal/academy/member-cohort-enrollments/{member_auth_id}` | Get Member Cohort Enrollments Internal |
| GET | `/api/v1/internal/academy/member-summary/{member_auth_id}` | Get Member Academy Summary |
| GET | `/api/v1/internal/attendance/member/{member_id}` | Get Member Attendance |
| GET | `/api/v1/internal/attendance/session/{session_id}/member-ids` | Get Session Attendee Member Ids |
| GET | `/api/v1/internal/attendance/stats/member/{member_auth_id}` | Get Member Attendance Stats |
| POST | `/api/v1/internal/communications/session-cancelled` | Handle Session Cancelled |
| POST | `/api/v1/internal/communications/session-published` | Handle Session Published |
| GET | `/api/v1/internal/members/active` | Get Active Members |
| GET | `/api/v1/internal/members/admins` | Get Admin Members |
| GET | `/api/v1/internal/members/approved-list` | Get Approved Members List |
| GET | `/api/v1/internal/members/birthdays-today` | Get Birthdays Today |
| POST | `/api/v1/internal/members/bulk` | Get Members Bulk |
| GET | `/api/v1/internal/members/by-auth/{auth_id}` | Get Member By Auth Id |
| GET | `/api/v1/internal/members/coaches/eligible` | Get Eligible Coaches |
| GET | `/api/v1/internal/members/coaches/{member_id}/availability` | Get Coach Availability |
| GET | `/api/v1/internal/members/coaches/{member_id}/profile` | Get Coach Profile |
| GET | `/api/v1/internal/members/coaches/{member_id}/readiness` | Get Coach Readiness Data |
| GET | `/api/v1/internal/members/joined-tier` | Get Members Who Joined Tier |
| GET | `/api/v1/internal/members/pods` | List Pods Internal |
| GET | `/api/v1/internal/members/pods/{pod_id}` | Get Pod Internal |
| GET | `/api/v1/internal/members/search` | Search Members |
| GET | `/api/v1/internal/members/{member_id}` | Get Member By Id |
| GET | `/api/v1/internal/members/{member_id}/bank-account` | Get Member Bank Account |
| GET | `/api/v1/internal/members/{member_id}/membership` | Get Member Membership |
| GET | `/api/v1/internal/members/{member_id}/tier-history` | Get Member Tier History |
| POST | `/api/v1/internal/payments/discounts/validate` | Internal Validate Discount |
| POST | `/api/v1/internal/payments/initialize` | Internal Initialize Payment |
| POST | `/api/v1/internal/payments/makeup-obligations/{obligation_id}/complete` | Internal Complete Makeup Obligation |
| POST | `/api/v1/internal/payments/makeup-obligations/{obligation_id}/schedule` | Internal Schedule Makeup Obligation |
| GET | `/api/v1/internal/payments/member-summary/{member_auth_id}` | Get Member Payment Summary |
| GET | `/api/v1/internal/payments/paystack/banks` | Internal Paystack Banks |
| POST | `/api/v1/internal/payments/paystack/recipients` | Internal Paystack Create Recipient |
| POST | `/api/v1/internal/payments/paystack/resolve-account` | Internal Paystack Resolve Account |
| GET | `/api/v1/internal/payments/paystack/verify/{reference}` | Internal Verify Paystack Reference |
| POST | `/api/v1/internal/payments/{reference}/annotate-refund` | Annotate Refund Obligation |
| POST | `/api/v1/internal/reporting/generate-snapshot` | Trigger Snapshot Generation |
| POST | `/api/v1/internal/sessions/bookings/bulk` | Bulk Create Bookings |
| POST | `/api/v1/internal/sessions/bookings/bundle/confirm` | Confirm Bundle Bookings |
| POST | `/api/v1/internal/sessions/bookings/bundle/release` | Release Bundle Bookings |
| POST | `/api/v1/internal/sessions/bookings/bundle/reserve` | Reserve Bundle Bookings |
| GET | `/api/v1/internal/sessions/bookings/campaign-stats` | Get Campaign Booking Stats |
| GET | `/api/v1/internal/sessions/bookings/confirmed` | List Confirmed Bookings Since |
| GET | `/api/v1/internal/sessions/bookings/{booking_id}` | Get Booking Internal |
| POST | `/api/v1/internal/sessions/bookings/{booking_id}/confirm` | Internal Confirm Booking |
| GET | `/api/v1/internal/sessions/cohorts/{cohort_id}/completed-session-ids` | Get Completed Session Ids For Cohort |
| POST | `/api/v1/internal/sessions/cohorts/{cohort_id}/generate` | Generate Cohort Sessions |
| GET | `/api/v1/internal/sessions/cohorts/{cohort_id}/next-session` | Get Next Session For Cohort |
| GET | `/api/v1/internal/sessions/cohorts/{cohort_id}/session-ids` | Get Session Ids For Cohort |
| GET | `/api/v1/internal/sessions/cohorts/{cohort_id}/sessions` | Get Sessions For Cohort Internal |
| GET | `/api/v1/internal/sessions/detailed-stats` | Get Session Detailed Stats |
| GET | `/api/v1/internal/sessions/durations` | Get Session Durations |
| GET | `/api/v1/internal/sessions/member/{member_auth_id}/session-commitments` | List Member Session Commitments |
| GET | `/api/v1/internal/sessions/range-stats` | Get Session Range Stats |
| GET | `/api/v1/internal/sessions/scheduled` | Get Scheduled Sessions |
| GET | `/api/v1/internal/sessions/{session_id}` | Get Session By Id |
| GET | `/api/v1/internal/sessions/{session_id}/access` | Get Member Session Access |
| GET | `/api/v1/internal/sessions/{session_id}/bookings/by-member/{member_id}` | Get Booking For Session Member |
| GET | `/api/v1/internal/sessions/{session_id}/coaches` | Get Session Coach Ids |
| GET | `/api/v1/internal/sessions/{session_id}/confirmed-booking-member-ids` | Get Confirmed Booking Member Ids |
| GET | `/api/v1/internal/store/member-summary/{member_auth_id}` | Get Member Store Summary |
| GET | `/api/v1/internal/transport/member-summary/{member_auth_id}` | Get Member Transport Summary |
| POST | `/api/v1/internal/transport/ride-quotes` | Quote Bundle Rides |
| POST | `/api/v1/internal/transport/sessions/{session_id}/ride-configs` | Attach Ride Configs Internal |

## internal-chat

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/internal/chat/channels/ensure` | Ensure Channel |
| POST | `/api/v1/internal/chat/memberships/reconcile` | Reconcile Membership |

## internal-guardians

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/internal/members/guardians/for-minor/{minor_member_id}` | Get Guardians For Minor |

## internal-rewards

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/internal/wallet/events` | Ingest Event |

## internal-volunteer

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/internal/volunteer/ensure-profile` | Ensure Volunteer Profile |
| POST | `/api/v1/internal/volunteer/log-hours` | Internal Log Hours |
| GET | `/api/v1/internal/volunteer/member-summary/{member_auth_id}` | Get Member Volunteer Summary |
| POST | `/api/v1/internal/volunteer/opportunities/cancel-for-context` | Cancel Opportunities For Context |
| POST | `/api/v1/internal/volunteer/opportunities/from-session-template` | Materialise From Session Template |

## internal-wallet

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/internal/wallet/balance/{auth_id}` | Internal Get Balance |
| POST | `/api/v1/internal/wallet/challenge-completion-reward` | Internal Challenge Completion Reward |
| POST | `/api/v1/internal/wallet/check-balance` | Internal Check Balance |
| POST | `/api/v1/internal/wallet/confirm-topup` | Internal Confirm Topup |
| POST | `/api/v1/internal/wallet/corporate/create` | Create Corporate Wallet |
| POST | `/api/v1/internal/wallet/create` | Internal Create Wallet |
| POST | `/api/v1/internal/wallet/credit` | Internal Credit |
| POST | `/api/v1/internal/wallet/debit` | Internal Debit |
| GET | `/api/v1/internal/wallet/ecosystem-stats` | Get Ecosystem Stats |
| POST | `/api/v1/internal/wallet/holds` | Internal Create Hold |
| POST | `/api/v1/internal/wallet/holds/{hold_id}/capture` | Internal Capture Hold |
| POST | `/api/v1/internal/wallet/holds/{hold_id}/release` | Internal Release Hold |
| GET | `/api/v1/internal/wallet/member-summary/{member_auth_id}` | Get Member Wallet Summary |
| POST | `/api/v1/internal/wallet/pool-submission-reward` | Internal Pool Submission Reward |
| GET | `/api/v1/internal/wallet/referral-link/{member_auth_id}` | Get Member Referral Link |
| POST | `/api/v1/internal/wallet/referral-qualify` | Internal Referral Qualify |
| POST | `/api/v1/internal/wallet/scholarship-credit` | Internal Scholarship Credit |
| POST | `/api/v1/internal/wallet/welcome-bonus` | Internal Grant Welcome Bonus |

## ledger-admin

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/finance/accounts` | List Accounts |
| GET | `/api/v1/admin/finance/invoices` | Admin List Invoices |
| POST | `/api/v1/admin/finance/invoices` | Admin Create Invoice |
| GET | `/api/v1/admin/finance/invoices/{invoice_id}` | Admin Get Invoice |
| POST | `/api/v1/admin/finance/invoices/{invoice_id}/void` | Admin Void Invoice |
| GET | `/api/v1/admin/finance/journal-entries` | List Journal Entries |
| POST | `/api/v1/admin/finance/journal-entries` | Create Manual Entry |
| GET | `/api/v1/admin/finance/journal-entries/{entry_id}` | Get Journal Entry |
| POST | `/api/v1/admin/finance/journal-entries/{entry_id}/reverse` | Reverse Journal Entry |
| GET | `/api/v1/admin/finance/periods` | List Periods |
| POST | `/api/v1/admin/finance/periods/{period_id}/transition` | Transition Period Route |
| GET | `/api/v1/admin/finance/reports/balance-sheet` | Get Balance Sheet |
| GET | `/api/v1/admin/finance/reports/bubbles-liability` | Get Bubbles Liability |
| GET | `/api/v1/admin/finance/reports/cash-position` | Get Cash Position |
| GET | `/api/v1/admin/finance/reports/deferred-revenue` | Get Deferred Revenue |
| GET | `/api/v1/admin/finance/reports/margin` | Get Margin |
| GET | `/api/v1/admin/finance/reports/profit-loss` | Get Profit Loss |
| GET | `/api/v1/admin/finance/reports/reconciliation` | Get Reconciliation |
| GET | `/api/v1/admin/finance/reports/trial-balance` | Get Trial Balance |

## ledger-admin-users

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/finance/users` | List Finance Users |
| POST | `/api/v1/admin/finance/users` | Add Finance User |
| GET | `/api/v1/admin/finance/users/me` | Get My Finance Membership |
| PATCH | `/api/v1/admin/finance/users/{user_id}` | Update Finance User Role |
| DELETE | `/api/v1/admin/finance/users/{user_id}` | Deactivate Finance User |
| POST | `/api/v1/admin/finance/users/{user_id}/invite` | Resend Finance User Invite |

## ledger-internal

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/internal/ledger/external-transactions` | Post External Transactions |
| POST | `/api/v1/internal/ledger/invoices` | Post Invoice |
| POST | `/api/v1/internal/ledger/journal-entries` | Post Journal Entry |

## makeups

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/makeups/bookable-slots` | Get Bookable Slots |
| GET | `/api/v1/makeups/bookings` | List Makeup Bookings |
| POST | `/api/v1/makeups/bookings` | Confirm Makeup Booking |
| POST | `/api/v1/makeups/bookings/{booking_id}/cancel` | Cancel Makeup Booking |
| POST | `/api/v1/makeups/bookings/{booking_id}/complete` | Complete Makeup Booking |
| POST | `/api/v1/makeups/bookings/{booking_id}/confirm` | Confirm Makeup Request |
| GET | `/api/v1/makeups/me/options` | Get My Bookable Options |
| GET | `/api/v1/makeups/me/requests` | List My Makeups |
| POST | `/api/v1/makeups/me/requests` | Request Makeup |
| POST | `/api/v1/makeups/open-slot` | Create Open Slot Makeup |

## media

| Method | Path | Summary |
|--------|------|---------|
| DELETE | `/api/v1/media/admin/members/{member_id}` | Admin Delete Member Media |
| GET | `/api/v1/media/albums` | List Albums |
| POST | `/api/v1/media/albums` | Create Album |
| GET | `/api/v1/media/albums/{album_id}` | Get Album |
| PUT | `/api/v1/media/albums/{album_id}` | Update Album |
| PATCH | `/api/v1/media/albums/{album_id}` | Update Album |
| DELETE | `/api/v1/media/albums/{album_id}` | Delete Album |
| GET | `/api/v1/media/assets` | List Site Assets |
| POST | `/api/v1/media/assets` | Create Site Asset |
| GET | `/api/v1/media/assets/{key}` | Get Site Asset |
| PUT | `/api/v1/media/assets/{key}` | Update Site Asset |
| DELETE | `/api/v1/media/assets/{key}` | Delete Site Asset |
| GET | `/api/v1/media/health` | Health Check |
| GET | `/api/v1/media/media` | List Media |
| POST | `/api/v1/media/media` | Upload Media |
| GET | `/api/v1/media/media/{media_id}` | Get Media Item |
| PUT | `/api/v1/media/media/{media_id}` | Update Media |
| DELETE | `/api/v1/media/media/{media_id}` | Delete Media |
| GET | `/api/v1/media/media/{media_id}/play` | Get Media Item Playback |
| HEAD | `/api/v1/media/media/{media_id}/play` | Head Media Item Playback |
| POST | `/api/v1/media/media/{media_id}/tags` | Tag Member In Media |
| DELETE | `/api/v1/media/media/{media_id}/tags/{member_id}` | Remove Tag |
| POST | `/api/v1/media/register-url` | Register External Url |
| POST | `/api/v1/media/uploads` | Upload File |
| POST | `/api/v1/media/urls` | Resolve Media Urls |

## media-admin

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/media/admin/enrollments/{enrollment_id}/evidence` | List Enrollment Evidence |
| GET | `/api/v1/media/admin/items/{media_id}/download` | Get Media Download Url |

## media-internal

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/internal/media/direct-uploads` | Create Direct Upload |
| POST | `/api/v1/internal/media/objects/delete` | Delete Object |
| POST | `/api/v1/internal/media/objects/sign` | Sign Object |
| POST | `/api/v1/internal/media/objects/upload` | Upload Object |
| POST | `/api/v1/internal/media/objects/verify` | Verify Object |

## members

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/members/` | List Members |
| POST | `/api/v1/members/` | Create Member |
| POST | `/api/v1/members/bulk-basic` | Get Members Bulk Basic |
| GET | `/api/v1/members/by-auth/{auth_id}` | Get Member By Auth Id |
| GET | `/api/v1/members/directory` | List Directory Members |
| GET | `/api/v1/members/me` | Get Current Member Profile |
| PATCH | `/api/v1/members/me` | Update Current Member |
| GET | `/api/v1/members/me/badges` | List My Badges |
| GET | `/api/v1/members/public` | List Public Members |
| GET | `/api/v1/members/public/{member_id}` | Get Member For Verification |
| GET | `/api/v1/members/stats` | Get Member Stats |
| GET | `/api/v1/members/{member_id}` | Get Member |
| PATCH | `/api/v1/members/{member_id}` | Update Member |
| DELETE | `/api/v1/members/{member_id}` | Delete Member |

## messaging

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/messages/cohorts/{cohort_id}` | Send Cohort Message |
| POST | `/api/v1/messages/enrollments/{enrollment_id}` | Send Student Message |
| GET | `/api/v1/messages/logs` | List Message Logs |

## notifications

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/notifications/` | List Notifications |
| POST | `/api/v1/notifications/admin/cleanup` | Cleanup Expired Notifications |
| GET | `/api/v1/notifications/admin/stats` | Get Notification Stats |
| POST | `/api/v1/notifications/dispatch` | Dispatch Notification |
| POST | `/api/v1/notifications/read-all` | Mark All Notifications Read |
| GET | `/api/v1/notifications/unread-count` | Get Unread Count |
| DELETE | `/api/v1/notifications/{notification_id}` | Delete Notification |
| POST | `/api/v1/notifications/{notification_id}/read` | Mark Notification Read |

## payments

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/payments/` | List Payments Admin |
| POST | `/api/v1/payments/admin/bookings/{booking_id}/offline-payment` | Admin Record Booking Offline Payment |
| POST | `/api/v1/payments/admin/bookings/{booking_id}/payment-link` | Admin Generate Booking Pay Link |
| GET | `/api/v1/payments/admin/discounts` | List Discounts |
| POST | `/api/v1/payments/admin/discounts` | Create Discount |
| GET | `/api/v1/payments/admin/discounts/{discount_id}` | Get Discount |
| PATCH | `/api/v1/payments/admin/discounts/{discount_id}` | Update Discount |
| DELETE | `/api/v1/payments/admin/discounts/{discount_id}` | Delete Discount |
| DELETE | `/api/v1/payments/admin/members/by-auth/{auth_id}` | Admin Delete Member Payments |
| GET | `/api/v1/payments/admin/pending-reviews` | List Pending Review Payments |
| GET | `/api/v1/payments/admin/refunds-owed` | List Refunds Owed |
| POST | `/api/v1/payments/admin/refunds-owed/{reference}/mark-disbursed` | Mark Refund Disbursed |
| POST | `/api/v1/payments/admin/{reference}/approve` | Approve Manual Payment |
| POST | `/api/v1/payments/admin/{reference}/reject` | Reject Manual Payment |
| POST | `/api/v1/payments/admin/{reference}/replay-entitlement` | Replay Payment Entitlement |
| POST | `/api/v1/payments/discounts/preview` | Preview Discount |
| POST | `/api/v1/payments/generate-reference` | Generate Payment Reference |
| POST | `/api/v1/payments/intents` | Create Payment Intent |
| GET | `/api/v1/payments/me` | List My Payments |
| POST | `/api/v1/payments/paystack/verify/{reference}` | Verify My Paystack Payment |
| GET | `/api/v1/payments/pricing` | Get Pricing Config |
| POST | `/api/v1/payments/webhooks/paystack` | Paystack Webhook |
| POST | `/api/v1/payments/{reference}/complete` | Complete Payment |
| POST | `/api/v1/payments/{reference}/proof` | Submit Proof Of Payment |

## pending-registrations

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/pending-registrations/` | Create Pending Registration |
| DELETE | `/api/v1/pending-registrations/by-email/{email}` | Delete Pending Registration By Email |
| POST | `/api/v1/pending-registrations/complete` | Complete Pending Registration |

## pods

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/members/pods/i-lead` | List Pods I Lead |
| GET | `/api/v1/members/pods/me` | Get My Pod |
| POST | `/api/v1/members/pods/me/leave` | Member Leave Pod |
| GET | `/api/v1/members/pods/public` | List Public Pods |
| POST | `/api/v1/members/pods/{pod_id}/join` | Member Join Pod |

## pods-admin

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/members/pods` | Admin List Pods |
| POST | `/api/v1/admin/members/pods` | Admin Create Pod |
| GET | `/api/v1/admin/members/pods/review-queue` | Admin Review Queue |
| GET | `/api/v1/admin/members/pods/{pod_id}` | Admin Get Pod |
| PATCH | `/api/v1/admin/members/pods/{pod_id}` | Admin Update Pod |
| POST | `/api/v1/admin/members/pods/{pod_id}/dissolve` | Admin Dissolve Pod |
| POST | `/api/v1/admin/members/pods/{pod_id}/extend` | Admin Extend Pod |
| POST | `/api/v1/admin/members/pods/{pod_id}/members` | Admin Add Member |
| DELETE | `/api/v1/admin/members/pods/{pod_id}/members/{member_id}` | Admin Remove Member |
| POST | `/api/v1/admin/members/pods/{pod_id}/transfers` | Admin Transfer Member |

## pool-submissions

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/pools/submissions` | Create Submission |
| GET | `/api/v1/pools/submissions/mine` | List My Submissions |
| GET | `/api/v1/pools/submissions/{submission_id}` | Get My Submission |

## pools

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/pools` | List Partner Pools |
| GET | `/api/v1/pools/{pool_id}` | Get Partner Pool |

## preferences

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/preferences/me` | Get My Preferences |
| PATCH | `/api/v1/preferences/me` | Update My Preferences |

## public-corporate

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/corporate/leads` | Create Public Lead |
| GET | `/api/v1/corporate/leads/health` | Leads Health |

## referral

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/wallet/referral/ambassador` | Get Ambassador Status |
| POST | `/api/v1/wallet/referral/apply` | Apply Referral |
| GET | `/api/v1/wallet/referral/code` | Get My Referral Code |
| GET | `/api/v1/wallet/referral/history` | Get My Referral History |
| GET | `/api/v1/wallet/referral/leaderboard` | Get Public Leaderboard |
| GET | `/api/v1/wallet/referral/stats` | Get My Referral Stats |
| GET | `/api/v1/wallet/referral/validate` | Validate Referral Code |

## reports

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/reports/me/quarterly` | Get My Quarterly Report |
| GET | `/api/v1/reports/me/quarterly/card` | Get My Quarterly Card |
| GET | `/api/v1/reports/me/quarterly/pdf` | Get My Quarterly Pdf |
| PUT | `/api/v1/reports/me/quarterly/privacy` | Toggle Leaderboard Privacy |
| GET | `/api/v1/reports/quarterly/available` | List Available Quarters |

## rewards-member

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/wallet/rewards/history` | Get My Reward History |
| GET | `/api/v1/wallet/rewards/rules` | List Active Reward Rules |

## session-templates

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/sessions/templates` | List Templates |
| POST | `/api/v1/sessions/templates` | Create Template |
| GET | `/api/v1/sessions/templates/{template_id}` | Get Template |
| PATCH | `/api/v1/sessions/templates/{template_id}` | Update Template |
| DELETE | `/api/v1/sessions/templates/{template_id}` | Delete Template |
| POST | `/api/v1/sessions/templates/{template_id}/generate` | Generate Sessions |

## sessions

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/sessions/` | List Sessions |
| POST | `/api/v1/sessions/` | Create Session |
| DELETE | `/api/v1/sessions/by-cohort/{cohort_id}` | Delete Sessions For Cohort |
| GET | `/api/v1/sessions/coach/me` | List My Coach Sessions |
| GET | `/api/v1/sessions/stats` | Get Session Stats |
| GET | `/api/v1/sessions/{session_id}` | Get Session |
| PATCH | `/api/v1/sessions/{session_id}` | Update Session |
| DELETE | `/api/v1/sessions/{session_id}` | Delete Session |
| POST | `/api/v1/sessions/{session_id}/cancel` | Cancel Session |
| POST | `/api/v1/sessions/{session_id}/publish` | Publish Session |

## store

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/store/cart` | Get Cart |
| POST | `/api/v1/store/cart/discount` | Apply Discount Code |
| DELETE | `/api/v1/store/cart/discount` | Remove Discount Code |
| POST | `/api/v1/store/cart/items` | Add To Cart |
| PATCH | `/api/v1/store/cart/items/{item_id}` | Update Cart Item |
| DELETE | `/api/v1/store/cart/items/{item_id}` | Remove Cart Item |
| GET | `/api/v1/store/categories` | List Categories |
| GET | `/api/v1/store/categories/{slug}` | Get Category |
| POST | `/api/v1/store/checkout/payment` | Initialize Payment |
| POST | `/api/v1/store/checkout/start` | Start Checkout |
| GET | `/api/v1/store/checkout/verify/{reference}` | Verify Payment |
| GET | `/api/v1/store/collections` | List Collections |
| GET | `/api/v1/store/collections/{slug}` | Get Collection |
| GET | `/api/v1/store/credits/me` | Get My Store Credits |
| GET | `/api/v1/store/orders` | List My Orders |
| GET | `/api/v1/store/orders/{order_number}` | Get Order |
| GET | `/api/v1/store/pickup-locations` | List Pickup Locations |
| GET | `/api/v1/store/products` | List Products |
| GET | `/api/v1/store/products/{slug}` | Get Product |

## stroke-lab

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/ai/analyze` | Upload a freestyle swim video and queue a Stroke Lab analysis |
| GET | `/api/v1/ai/analyze/me` | List the caller's most recent Stroke Lab jobs |
| GET | `/api/v1/ai/analyze/{job_id}` | Fetch a Stroke Lab job's status + result + signed URLs |
| DELETE | `/api/v1/ai/analyze/{job_id}` | Delete a Stroke Lab job and its storage assets |
| POST | `/api/v1/ai/analyze/{job_id}/inspect` | Coach one stored instance on demand (gated; 409 until unlocked) |

## stroke-lab-admin

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/ai/admin/analyze/queue` | Stroke Lab queue health: counts by status, recent jobs, success rate |
| POST | `/api/v1/ai/admin/analyze/reanalyze/{job_id}` | Reset a job to PENDING and re-enqueue the worker task |

## stroke-lab-founding

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/ai/founding-members/claim` | Verify a reference via payments_service and record (client fallback) |
| POST | `/api/v1/ai/founding-members/initialize` | Start a Paystack checkout for a founding-member spot |
| GET | `/api/v1/ai/founding-members/me` | Has the authenticated caller already claimed? |
| GET | `/api/v1/ai/founding-members/stats` | Public counter |

## stroke-lab-founding-internal

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/internal/ai/founding-members/confirm` | Record a founding member after payment clears (webhook-driven) |

## stroke-lab-public

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/ai/public/analyze` | Upload a freestyle swim video as a guest and queue an analysis |
| POST | `/api/v1/ai/public/analyze/uploads` | Create a guest job and issue a media-service upload URL |
| GET | `/api/v1/ai/public/analyze/{job_id}` | Poll a guest Stroke Lab job's status + result (guest_token) |
| POST | `/api/v1/ai/public/analyze/{job_id}/complete-upload` | Verify a direct upload, reserve credit, and queue analysis |
| POST | `/api/v1/ai/public/analyze/{job_id}/inspect` | Coach one stored instance on demand, guest (gated; 409 until unlocked) |
| POST | `/api/v1/ai/public/analyze/{job_id}/retry` | Re-run a failed or partial guest analysis on its stored clip — free (guest_token) |
| GET | `/api/v1/ai/public/credits` | Coarse analyzer credit balance for an email |
| POST | `/api/v1/ai/public/credits/redeem` | Redeem a Gumroad license key for analyzer credits |
| POST | `/api/v1/ai/public/gumroad/webhook` | Gumroad Ping — grant credits on sale, revoke on refund/dispute |

## system

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/health` | Health Check |

## testimonials

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/admin/testimonials` | Admin List Testimonials |
| POST | `/api/v1/admin/testimonials` | Admin Create Testimonial |
| PATCH | `/api/v1/admin/testimonials/{testimonial_id}` | Admin Update Testimonial |
| DELETE | `/api/v1/admin/testimonials/{testimonial_id}` | Admin Delete Testimonial |
| GET | `/api/v1/testimonials/public` | List Public Testimonials |

## transport

| Method | Path | Summary |
|--------|------|---------|
| DELETE | `/api/v1/transport/admin/members/{member_id}` | Admin Delete Member Transport |
| GET | `/api/v1/transport/areas` | List Ride Areas |
| POST | `/api/v1/transport/areas` | Create Ride Area |
| GET | `/api/v1/transport/areas/{area_id}` | Get Ride Area |
| PATCH | `/api/v1/transport/areas/{area_id}` | Update Ride Area |
| DELETE | `/api/v1/transport/areas/{area_id}` | Delete Ride Area |
| POST | `/api/v1/transport/areas/{area_id}/locations` | Add Pickup Location |
| PATCH | `/api/v1/transport/locations/{location_id}` | Update Pickup Location |
| DELETE | `/api/v1/transport/locations/{location_id}` | Delete Pickup Location |
| GET | `/api/v1/transport/routes` | List Routes |
| POST | `/api/v1/transport/routes` | Create Route |
| PATCH | `/api/v1/transport/routes/{route_id}` | Update Route |
| DELETE | `/api/v1/transport/routes/{route_id}` | Delete Route |
| POST | `/api/v1/transport/sessions/ride-configs/batch` | Get Ride Configs Batch |
| GET | `/api/v1/transport/sessions/{session_id}/bookings` | List Session Bookings |
| POST | `/api/v1/transport/sessions/{session_id}/bookings` | Create Ride Booking |
| GET | `/api/v1/transport/sessions/{session_id}/bookings/me` | Get My Booking |
| GET | `/api/v1/transport/sessions/{session_id}/ride-configs` | Get Session Ride Configs |
| POST | `/api/v1/transport/sessions/{session_id}/ride-configs` | Attach Ride Areas To Session |

## volunteers

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/volunteers/hours/leaderboard` | Leaderboard |
| GET | `/api/v1/volunteers/hours/me` | My Hours |
| GET | `/api/v1/volunteers/hours/me/summary` | My Hours Summary |
| POST | `/api/v1/volunteers/interest` | Register Volunteer Interest |
| GET | `/api/v1/volunteers/opportunities` | List Opportunities |
| GET | `/api/v1/volunteers/opportunities/upcoming` | List Upcoming Opportunities |
| GET | `/api/v1/volunteers/opportunities/{opp_id}` | Get Opportunity |
| POST | `/api/v1/volunteers/opportunities/{opp_id}/claim` | Claim Slot |
| DELETE | `/api/v1/volunteers/opportunities/{opp_id}/claim` | Cancel My Claim |
| GET | `/api/v1/volunteers/profile/me` | Get My Profile |
| POST | `/api/v1/volunteers/profile/me` | Register As Volunteer |
| PATCH | `/api/v1/volunteers/profile/me` | Update My Profile |
| POST | `/api/v1/volunteers/qr-checkin` | Qr Checkin |
| GET | `/api/v1/volunteers/rewards/me` | My Rewards |
| POST | `/api/v1/volunteers/rewards/{reward_id}/redeem` | Redeem Reward |
| GET | `/api/v1/volunteers/roles` | List Roles |
| GET | `/api/v1/volunteers/roles/{role_id}` | Get Role |
| GET | `/api/v1/volunteers/roles/{role_id}/interested` | List Interested Members |
| GET | `/api/v1/volunteers/spotlight` | Get Spotlight |

## wallet

| Method | Path | Summary |
|--------|------|---------|
| POST | `/api/v1/wallet/check-balance` | Member Check Balance |
| POST | `/api/v1/wallet/create` | Create My Wallet |
| POST | `/api/v1/wallet/credit` | Member Credit |
| POST | `/api/v1/wallet/debit` | Member Debit |
| GET | `/api/v1/wallet/me` | Get My Wallet |
| GET | `/api/v1/wallet/notifications/preferences` | Get Notification Preferences |
| PATCH | `/api/v1/wallet/notifications/preferences` | Update Notification Preferences |
| POST | `/api/v1/wallet/topup` | Start Topup |
| GET | `/api/v1/wallet/topup/{topup_id}` | Get Topup Status |
| GET | `/api/v1/wallet/topups` | List My Topups |
| POST | `/api/v1/wallet/topups/reconcile/{topup_reference}` | Reconcile My Topup Return |
| GET | `/api/v1/wallet/transactions` | List My Transactions |
| GET | `/api/v1/wallet/transactions/{transaction_id}` | Get Transaction Detail |

## weather

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/weather` | Get Weather |
| GET | `/api/v1/weather/pools/{pool_id}` | Get Weather For Pool |

## weekly-digest

| Method | Path | Summary |
|--------|------|---------|
| GET | `/api/v1/digest/admin/configs` | List Digest Configs |
| PATCH | `/api/v1/digest/admin/configs/{audience}` | Update Digest Config |
| GET | `/api/v1/digest/admin/stats` | Get Digest Stats |
| GET | `/api/v1/digest/click/{token}/{kind}/{resource_id}` | Track Digest Click |
