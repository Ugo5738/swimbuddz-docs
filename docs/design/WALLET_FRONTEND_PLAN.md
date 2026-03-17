# Wallet, Rewards & Referrals — Frontend Implementation Plan

> **Status:** Not started
> **Backend:** Phase 3 complete (51 endpoints live, 21 reward rules seeded)
> **Existing Frontend:** Wallet dashboard, topup, transactions (member + coach + admin)
> **This Plan Covers:** All remaining frontend work for rewards, referrals, and related features

---

## Overview

Phase 3 of the wallet service added referrals, a rewards engine, anti-abuse monitoring, notification preferences, ambassador badges, and referral leaderboards — all backend-only. This document defines the frontend pages and components needed to surface these features to members, coaches, admins, and the public.

The plan is organised into 5 priority tiers. Each tier can be implemented independently, and each task within a tier can be worked on as a standalone unit.

**API Base Paths:**

- Member: `/api/v1/wallet/*`
- Admin: `/api/v1/admin/wallet/*`

**Existing Patterns to Follow:**

- Client components (`"use client"`) with `useState`/`useEffect`
- `apiGet`/`apiPost`/`apiPatch` from `@/lib/api` with `{ auth: true }`
- `formatBubbles()`, `formatNaira()`, `formatDate()` from `@/lib/format`
- `toast` from `sonner` for notifications
- `LoadingPage`/`LoadingCard` for loading states
- `Card`, `Badge`, `Button` from `@/components/ui/`
- Icons from `lucide-react`
- Tailwind CSS with mobile-first responsive design

---

## Priority 1 — Core Member Experience

> **Goal:** Give members a reason to engage with the rewards system.
> **Depends on:** Existing wallet pages (already built).
> **Estimated scope:** 4 pages + 1 component update.

---

### P1.1 – Referral Hub

- [ ] **P1.1 – Referral Hub Page**
  - **Route:** `/account/wallet/referrals`
  - **File:** `src/app/(member)/account/wallet/referrals/page.tsx`
  - **Goal:** Members can generate, view, copy, and share their referral code. They see who they've referred and the status of each referral.
  - **API Endpoints:**
    - `GET /api/v1/wallet/referral/code` — get or generate referral code
    - `POST /api/v1/wallet/referral/code` — generate code (if none exists)
    - `GET /api/v1/wallet/referral/stats` — referral stats summary
    - `GET /api/v1/wallet/referral/records` — list of referral records
    - `GET /api/v1/wallet/referral/ambassador` — ambassador badge status
  - **Requirements:**
    - **Referral Code Card:** Large, prominent display of the member's referral code with copy-to-clipboard button and share button (WhatsApp deep link: `https://wa.me/?text=...`)
    - **Shareable Link:** Display `https://swimbuddz.com/join?ref=CODE` with copy button
    - **Stats Row:** 3-column grid — Total Referrals, Successful, Bubbles Earned
    - **Ambassador Progress:** Progress bar showing X/10 referrals toward ambassador status. If already ambassador, show badge with `ambassador_since` date
    - **Referral List:** Card list of referrals with: referee status badge (pending → registered → qualified → rewarded), date, Bubbles earned (if rewarded)
    - **Empty State:** "Share your code to start earning Bubbles!" with illustration
  - **UI Notes:**
    - Referral code card: gradient background (cyan-to-blue), large monospace font for code
    - Ambassador badge: gold/amber accent colour, star or trophy icon
    - Share button should use `navigator.share()` with fallback to WhatsApp link
    - Mobile: stack stats vertically on small screens
  - **Output:**
    - New page file
    - Update `ROUTES_AND_PAGES.md`

---

### P1.2 – Rewards Dashboard

- [ ] **P1.2 – Rewards Dashboard Page**
  - **Route:** `/account/wallet/rewards`
  - **File:** `src/app/(member)/account/wallet/rewards/page.tsx`
  - **Goal:** Members see what rewards they can earn, their recent reward history, and how the system works.
  - **API Endpoints:**
    - `GET /api/v1/wallet/rewards/history?limit=10` — recent reward history
    - `GET /api/v1/wallet/rewards/rules` — active reward rules (public-facing)
    - `GET /api/v1/wallet/referral/ambassador` — ambassador status (for badge display)
  - **Requirements:**
    - **Hero Section:** Total Bubbles earned from rewards (sum from history), with encouraging message
    - **"How to Earn" Section:** Grid of cards showing active reward rules grouped by category:
      - 🏊 Attendance (session attendance, streaks)
      - 👥 Referrals (refer a friend, ambassador milestone)
      - 🎓 Academy (graduation, milestones, perfect attendance)
      - 🤝 Community (volunteering, peer coaching, content, rideshare)
      - 💰 Spending (first topup, large topup, store purchase, tier upgrade)
    - Each card shows: rule display name, Bubble amount, brief description, any caps (e.g., "max 5/month")
    - **Recent Rewards:** List of last 10 rewards earned — rule name, Bubbles, date
    - **"View All" link** → `/account/wallet/rewards/history`
  - **UI Notes:**
    - Category cards with distinct colour accents per category
    - Bubble emoji (🫧) throughout
    - Rules that require admin confirmation show a subtle "verified by admin" note
    - Rules the member has maxed out (lifetime cap reached) show as greyed/completed
  - **Output:**
    - New page file
    - Update `ROUTES_AND_PAGES.md`

---

### P1.3 – Reward History

- [ ] **P1.3 – Reward History Page**
  - **Route:** `/account/wallet/rewards/history`
  - **File:** `src/app/(member)/account/wallet/rewards/history/page.tsx`
  - **Goal:** Full paginated list of all rewards the member has earned.
  - **API Endpoints:**
    - `GET /api/v1/wallet/rewards/history?limit=20&offset=0` — paginated history
  - **Requirements:**
    - **Filter:** Dropdown by category (all, acquisition, retention, community, spending, academy)
    - **List Items:** Each row shows: reward rule display name, Bubble amount (green badge), date, reward description
    - **Pagination:** Previous/Next buttons, 20 items per page
    - **Empty State:** "No rewards yet — start earning by attending sessions!"
    - **Back Button:** → `/account/wallet/rewards`
  - **UI Notes:**
    - Follow the same pattern as `/account/wallet/transactions/page.tsx`
    - Green Bubble badges for amounts (emerald colour scheme)
  - **Output:**
    - New page file
    - Update `ROUTES_AND_PAGES.md`

---

### P1.4 – Update Existing Wallet Dashboard

- [ ] **P1.4 – Add Rewards & Referral CTAs to Wallet Dashboard**
  - **File:** `src/app/(member)/account/wallet/page.tsx` (existing)
  - **Goal:** Surface rewards and referrals from the main wallet page so members discover these features.
  - **Requirements:**
    - **Add to Stats Row:** Add a 4th stat — "Rewards Earned" showing total Bubbles from rewards (fetch from rewards history or stats endpoint)
    - **Referral CTA Card:** Below the balance card, add an emerald gradient card: "Refer a friend, earn 15 🫧" with button → `/account/wallet/referrals`
    - **Ambassador Badge:** If member is ambassador, show small gold badge next to their balance or in a dedicated banner
    - **Quick Links:** Add "My Rewards" and "Referrals" as quick action links below the CTA
  - **UI Notes:**
    - CTA card: `bg-gradient-to-br from-emerald-50 to-emerald-100`, dismissible (localStorage flag)
    - Keep existing layout intact — additions should feel natural, not cluttered
  - **Output:**
    - Modified existing file

---

### P1.5 – Navigation Update (Member)

- [ ] **P1.5 – Add Referral & Rewards Links to Member Sidebar**
  - **File:** `src/components/layout/MemberLayout.tsx` (existing)
  - **Goal:** Members can navigate to referrals and rewards from the sidebar.
  - **Requirements:**
    - Under the existing "Wallet" nav item, add sub-items:
      - `Referrals` → `/account/wallet/referrals` (icon: `Users` or `Gift`)
      - `Rewards` → `/account/wallet/rewards` (icon: `Award` or `Star`)
    - Alternatively, if the sidebar doesn't support nesting, add them as separate items in the "My Account" section below Wallet
  - **UI Notes:**
    - Match the existing nav item style exactly
    - Consider adding a "NEW" badge to draw attention on first release (removable after a month)
  - **Output:**
    - Modified existing file

---

## Priority 2 — Admin Management

> **Goal:** Give admins full control over the reward economy.
> **Depends on:** Nothing (can be built in parallel with Priority 1).
> **Estimated scope:** 6 pages + 1 modal + 1 navigation update.

---

### P2.1 – Reward Rules Manager

- [ ] **P2.1 – Reward Rules List Page**
  - **Route:** `/admin/wallet/rewards`
  - **File:** `src/app/(admin)/admin/wallet/rewards/page.tsx`
  - **Goal:** Admins see all 21+ reward rules, toggle them on/off, and navigate to edit individual rules.
  - **API Endpoints:**
    - `GET /api/v1/admin/wallet/rewards/rules` — list all rules
    - `GET /api/v1/admin/wallet/rewards/stats` — dashboard stats
    - `PATCH /api/v1/admin/wallet/rewards/rules/{ruleId}` — toggle active/inactive
  - **Requirements:**
    - **Stats Bar:** Active rules count, total events processed, total Bubbles granted, unique members rewarded
    - **Filter:** By category (dropdown), by active status (toggle)
    - **Rules Table/Cards:** Each row shows: rule name, event type, Bubble amount, category badge, active toggle switch, caps (lifetime/period), priority
    - **Quick Toggle:** Active/inactive switch inline (PATCH on toggle)
    - **Click Row** → `/admin/wallet/rewards/[ruleId]` for full edit
    - **"Submit Event" Button** → opens manual event submission modal (P2.3)
  - **Output:**
    - New page file
    - Update `ROUTES_AND_PAGES.md`

---

### P2.2 – Reward Rule Detail/Edit

- [ ] **P2.2 – Reward Rule Detail Page**
  - **Route:** `/admin/wallet/rewards/[ruleId]`
  - **File:** `src/app/(admin)/admin/wallet/rewards/[ruleId]/page.tsx`
  - **Goal:** Admins edit a single reward rule and see its usage statistics.
  - **API Endpoints:**
    - `GET /api/v1/admin/wallet/rewards/rules/{ruleId}` — rule detail with stats
    - `PATCH /api/v1/admin/wallet/rewards/rules/{ruleId}` — update rule
  - **Requirements:**
    - **Rule Info Card:** Display name, description, event type, category, priority
    - **Editable Fields:** Bubble amount, max per member lifetime, max per member per period, period (day/week/month/year), is_active, requires_admin_confirmation
    - **Non-Editable Fields:** rule_name (system identifier), created_at, event_type
    - **Usage Stats Section:** Times granted (total), unique members, total Bubbles awarded via this rule
    - **Save Button:** PATCH with changed fields, toast on success
    - **Back Button:** → `/admin/wallet/rewards`
  - **UI Notes:**
    - Follow the same edit pattern as other admin detail pages
    - Number inputs for Bubble amount and caps
    - Select dropdown for period
    - Toggle switches for booleans
  - **Output:**
    - New page file
    - Update `ROUTES_AND_PAGES.md`

---

### P2.3 – Manual Event Submission Modal

- [ ] **P2.3 – Manual Reward Event Submission**
  - **Location:** Modal component, triggered from P2.1 rewards page
  - **File:** `src/components/admin/ManualRewardEventModal.tsx` (new component)
  - **Goal:** Admins can manually trigger a reward event for a member (edge cases the automated system missed).
  - **API Endpoints:**
    - `POST /api/v1/admin/wallet/rewards/events/submit` — submit event
  - **Requirements:**
    - **Form Fields:**
      - Member auth ID (text input, or search-by-email if feasible)
      - Event type (dropdown of known event types)
      - Event data (JSON textarea for advanced use, or structured fields for common types)
      - Admin confirmed checkbox (pre-checked)
    - **Confirmation:** Show the matching rule(s) and expected Bubble amount before submission
    - **Submit:** POST, show toast with result (Bubbles granted or "no matching rule")
  - **Output:**
    - New component file

---

### P2.4 – Alerts Dashboard

- [ ] **P2.4 – Reward Alerts Page**
  - **Route:** `/admin/wallet/rewards/alerts`
  - **File:** `src/app/(admin)/admin/wallet/rewards/alerts/page.tsx`
  - **Goal:** Admins monitor anti-abuse alerts and take action.
  - **API Endpoints:**
    - `GET /api/v1/admin/wallet/rewards/alerts?status=open` — list alerts
    - `GET /api/v1/admin/wallet/rewards/alerts/summary` — summary counts
    - `PATCH /api/v1/admin/wallet/rewards/alerts/{alertId}` — update status
  - **Requirements:**
    - **Summary Bar:** Counts by status — Open (red badge), Acknowledged (amber), Resolved (green), Dismissed (slate)
    - **Filter:** By status (tabs: Open / Acknowledged / Resolved / Dismissed / All), by severity
    - **Alert Cards:** Each shows: title, description, severity badge (low=blue, medium=amber, high=orange, critical=red), member auth ID (if applicable), created date, alert type
    - **Action Buttons (per alert):**
      - Acknowledge (if open)
      - Resolve with notes (opens inline text input)
      - Dismiss with notes
    - **Empty State:** "No open alerts — the system is healthy 🫧"
  - **UI Notes:**
    - Open alerts should feel urgent — use red/orange accent borders
    - Resolved/dismissed alerts should be muted
    - Consider auto-refresh (polling every 60 seconds) for the open alerts view
  - **Output:**
    - New page file
    - Update `ROUTES_AND_PAGES.md`

---

### P2.5 – Referral Admin

- [ ] **P2.5 – Admin Referral Leaderboard & Management**
  - **Route:** `/admin/wallet/referrals`
  - **File:** `src/app/(admin)/admin/wallet/referrals/page.tsx`
  - **Goal:** Admins see the full referral leaderboard with real member IDs and manage referral codes.
  - **API Endpoints:**
    - `GET /api/v1/admin/wallet/referrals/leaderboard?period=all_time` — full leaderboard
    - `GET /api/v1/admin/wallet/referrals/codes` — list all referral codes
    - `GET /api/v1/admin/wallet/referrals/stats` — referral program stats
  - **Requirements:**
    - **Period Filter:** Tabs or dropdown — All Time, This Month, This Year
    - **Leaderboard Table:** Rank, member auth ID (link to member detail if possible), referral code, successful referrals, total Bubbles earned, conversion rate
    - **Program Stats:** Total referral codes generated, total referrals, success rate, total Bubbles paid out
    - **Code Management:** List of all codes with active/inactive status, ability to deactivate a code
  - **Output:**
    - New page file
    - Update `ROUTES_AND_PAGES.md`

---

### P2.6 – Rewards Analytics

- [ ] **P2.6 – Rewards Analytics Page**
  - **Route:** `/admin/wallet/rewards/analytics`
  - **File:** `src/app/(admin)/admin/wallet/rewards/analytics/page.tsx`
  - **Goal:** Admins see data-driven insights about the reward economy.
  - **API Endpoints:**
    - `GET /api/v1/admin/wallet/rewards/analytics?period=this_month` — analytics data
  - **Requirements:**
    - **Period Filter:** Dropdown — This Week, This Month, This Year, All Time
    - **Summary Cards:** Total Bubbles granted, unique members rewarded, average Bubbles per member
    - **Category Breakdown:** Table or bar chart showing Bubbles granted per category (acquisition, retention, community, spending, academy) with percentage of total
    - **Top Event Types:** Ranked list of most-triggered event types
    - **Top Rules:** Ranked list of most-used reward rules
  - **UI Notes:**
    - Use horizontal bar visualization for category breakdown (Tailwind width percentages, no charting library needed)
    - Colour-code categories consistently with P1.2
  - **Output:**
    - New page file
    - Update `ROUTES_AND_PAGES.md`

---

### P2.7 – Admin Member Reward History

- [ ] **P2.7 – Member Reward History Lookup**
  - **Route:** `/admin/wallet/rewards/member/[authId]`
  - **File:** `src/app/(admin)/admin/wallet/rewards/member/[authId]/page.tsx`
  - **Goal:** Admins look up any member's reward history.
  - **API Endpoints:**
    - `GET /api/v1/admin/wallet/rewards/history/{memberAuthId}` — member's reward history
  - **Requirements:**
    - **Member Header:** Show member auth ID (and name if available from member service)
    - **Reward List:** Same format as P1.3 but for any member
    - **Link From:** Admin wallet detail page and admin member detail page should link here
  - **Output:**
    - New page file
    - Update `ROUTES_AND_PAGES.md`

---

### P2.8 – Navigation Update (Admin)

- [ ] **P2.8 – Add Rewards & Referral Links to Admin Sidebar**
  - **File:** `src/components/layout/AdminLayout.tsx` (existing)
  - **Goal:** Admins can navigate to reward management, referral admin, and alerts.
  - **Requirements:**
    - Under or alongside the existing "Wallet" nav item, add:
      - `Rewards` → `/admin/wallet/rewards` (icon: `Award`)
      - `Referrals` → `/admin/wallet/referrals` (icon: `Users`)
      - `Alerts` → `/admin/wallet/rewards/alerts` (icon: `AlertTriangle`, with badge count of open alerts)
      - `Analytics` → `/admin/wallet/rewards/analytics` (icon: `BarChart3`)
  - **UI Notes:**
    - Alert badge should show count of open alerts (fetch on layout mount) — red dot or number
  - **Output:**
    - Modified existing file

---

## Priority 3 — Public & Growth

> **Goal:** Drive sign-ups and engagement through public-facing features.
> **Depends on:** Priority 1 (referral hub should exist first).
> **Estimated scope:** 3 pages/components.

---

### P3.1 – Referral Landing Page

- [ ] **P3.1 – Referral Sign-Up Landing Page**
  - **Route:** `/join` (with `?ref=CODE` query param)
  - **File:** `src/app/(public)/join/page.tsx`
  - **Goal:** When someone clicks a referral link, they land on a page that explains the referral bonus and directs them to sign up.
  - **API Endpoints:**
    - `GET /api/v1/wallet/referral/validate?code=CODE` — validate the referral code (public, no auth)
  - **Requirements:**
    - **Hero Section:** "You've been invited to SwimBuddz!" with referral code displayed
    - **Bonus Display:** "Sign up and earn 10 🫧 (₦1,000 value)"
    - **Code Validation:** If code is invalid/expired, show gentle message: "This referral link has expired, but you can still join!"
    - **CTA Button:** "Join SwimBuddz" → `/auth/register?ref=CODE` (pass code through to registration)
    - **What is SwimBuddz:** Brief value prop section (reuse content from landing page)
  - **Integration Notes:**
    - Registration flow (`/auth/register`) needs to accept `ref` query param and pass it to the backend during sign-up
    - If the registration page already exists, update it to read `ref` from URL and include in the registration API call
  - **Output:**
    - New page file
    - Possibly modify registration page to accept `ref` param
    - Update `ROUTES_AND_PAGES.md`

---

### P3.2 – Public Referral Leaderboard

- [ ] **P3.2 – Community Referral Leaderboard**
  - **Route:** `/community/leaderboard` or component on `/community` page
  - **File:** `src/app/(public)/community/leaderboard/page.tsx` OR embed in existing community page
  - **Goal:** Public top-10 referral leaderboard to gamify referrals.
  - **API Endpoints:**
    - `GET /api/v1/wallet/referral/leaderboard` — public, anonymized top-10
  - **Requirements:**
    - **Leaderboard Table:** Rank (with medal emoji for top 3: 🥇🥈🥉), anonymized code (`SWIMB***`), successful referrals count, total Bubbles earned
    - **CTA:** "Want to be on the leaderboard? Get your referral code!" → login or `/account/wallet/referrals`
    - **Refresh:** Monthly leaderboard with clear labelling ("February 2026 Top Referrers")
  - **UI Notes:**
    - Gold/amber accent for top 3
    - Compact table, mobile-friendly
    - Can be a standalone page or a section within the community page
  - **Output:**
    - New page file or component
    - Update `ROUTES_AND_PAGES.md`

---

### P3.3 – Landing Page Rewards Section

- [ ] **P3.3 – "Earn Bubbles" Section on Landing Page**
  - **File:** `src/app/page.tsx` (existing landing page)
  - **Goal:** Explain the rewards system to potential members as a sign-up incentive.
  - **Requirements:**
    - **New Section:** Add between existing sections on the landing page
    - **Content:**
      - Heading: "Earn Bubbles Every Time You Swim"
      - 3–4 feature cards: "Attend Sessions → Earn 🫧", "Refer Friends → Earn 🫧", "Graduate Academy → Earn 🫧", "Volunteer → Earn 🫧"
      - Brief explanation: what Bubbles are, what they can be used for
      - CTA: "Join SwimBuddz" → `/auth/register`
    - **Design:** Cyan/emerald gradient section, bubble illustrations
  - **Output:**
    - Modified existing landing page

---

## Priority 4 — Settings & Coach Parity

> **Goal:** Polish the experience with notification controls and coach support.
> **Depends on:** Priority 1 (member rewards pages should exist).
> **Estimated scope:** 3 page updates.

---

### P4.1 – Notification Preferences

- [ ] **P4.1 – Add Reward Notification Preferences to Settings**
  - **Route:** `/account/settings` (existing page — add section)
  - **File:** `src/app/(member)/account/settings/page.tsx` (existing) or new sub-page
  - **Goal:** Members control which reward notifications they receive.
  - **API Endpoints:**
    - `GET /api/v1/wallet/notifications/preferences` — get current prefs (lazy-creates defaults)
    - `PATCH /api/v1/wallet/notifications/preferences` — update prefs
  - **Requirements:**
    - **New Section:** "Reward Notifications" with toggle switches:
      - Notify on reward earned (default: on)
      - Notify on referral qualified (default: on)
      - Notify on ambassador milestone (default: on)
      - Notify on streak milestone (default: on)
    - **Channel Selector:** For future use — currently only "in_app" is supported, so show as informational text ("Notifications appear in-app") rather than a dropdown
    - **Auto-Save:** PATCH on each toggle change with debounce, or explicit "Save" button
  - **Output:**
    - Modified existing settings page

---

### P4.2 – Coach Referral & Rewards Pages

- [ ] **P4.2 – Mirror Referral & Rewards Pages for Coaches**
  - **Routes:**
    - `/coach/wallet/referrals`
    - `/coach/wallet/rewards`
    - `/coach/wallet/rewards/history`
  - **Files:**
    - `src/app/coach/wallet/referrals/page.tsx`
    - `src/app/coach/wallet/rewards/page.tsx`
    - `src/app/coach/wallet/rewards/history/page.tsx`
  - **Goal:** Coaches get the same referral/rewards experience as members.
  - **Requirements:**
    - Identical functionality to P1.1, P1.2, P1.3
    - Consider extracting shared components to `src/components/wallet/` to avoid code duplication:
      - `ReferralHub.tsx` — shared referral code + stats + ambassador display
      - `RewardsDashboard.tsx` — shared rewards overview
      - `RewardHistory.tsx` — shared paginated history list
    - Coach-specific routes use `/coach/wallet/*` prefix
  - **Output:**
    - 3 new page files (thin wrappers around shared components)
    - Potentially 3 new shared components in `src/components/wallet/`
    - Update coach sidebar navigation in `src/components/layout/CoachLayout.tsx`
    - Update `ROUTES_AND_PAGES.md`

---

### P4.3 – Coach Notification Preferences

- [ ] **P4.3 – Add Notification Preferences to Coach Settings**
  - **Route:** `/coach/preferences` (existing)
  - **File:** `src/app/coach/preferences/page.tsx` (existing)
  - **Goal:** Coaches control reward notification preferences, same as P4.1.
  - **Requirements:**
    - Same toggle section as P4.1, added to the coach preferences page
    - Reuse the notification preferences component from P4.1
  - **Output:**
    - Modified existing file

---

## Priority 5 — Enhancements

> **Goal:** Polish, gamification, and quality-of-life improvements.
> **Depends on:** Priorities 1–4.
> **Estimated scope:** Individual features, pick as desired.

---

### P5.1 – Social Share Integration

- [ ] **P5.1 – Share-to-Earn Flow**
  - **Location:** Button on referral hub page and rewards dashboard
  - **Goal:** When a member shares their referral code to social media, trigger the `event_social_share` reward event.
  - **Requirements:**
    - Use `navigator.share()` API (Web Share API) on mobile
    - Fallback: WhatsApp (`https://wa.me/?text=...`), Twitter/X (`https://x.com/intent/tweet?text=...`), copy link
    - After share dialog closes or link is copied, call `POST /api/v1/wallet/rewards/events` with `event_type: "content.share"`
    - Toast: "Thanks for sharing! You earned 2 🫧"
    - Track per-session to avoid spamming (localStorage cooldown)
  - **Output:**
    - Shared `ShareButton.tsx` component

---

### P5.2 – Animated Bubble Counter

- [ ] **P5.2 – Bubble Count Animation**
  - **Location:** Wallet dashboard balance display
  - **Goal:** Satisfying count-up animation when Bubbles are earned or balance changes.
  - **Requirements:**
    - Animate from previous balance to new balance on page load
    - Use `requestAnimationFrame` or a lightweight animation library
    - Duration: ~1 second, ease-out curve
    - Only animate if there's a difference (compare with localStorage cached value)
  - **Output:**
    - `AnimatedBubbleCounter.tsx` component

---

### P5.3 – Achievement Badges Gallery

- [ ] **P5.3 – Badges & Achievements Page**
  - **Route:** `/account/wallet/badges`
  - **File:** `src/app/(member)/account/wallet/badges/page.tsx`
  - **Goal:** Visual gallery of all badges a member has earned and can earn.
  - **Requirements:**
    - **Earned Badges:** Ambassador (gold), streak badges (silver/bronze), milestone badges
    - **Locked Badges:** Greyed-out versions of badges not yet earned, with progress indicators
    - **Badge Detail:** Click to see how to earn and current progress
  - **Notes:**
    - This requires defining a badge system beyond what the current API provides. May need a new backend endpoint or derive badges from reward history.
  - **Output:**
    - New page file
    - Potentially new shared component

---

### P5.4 – Reward History Export

- [ ] **P5.4 – CSV Export for Reward History**
  - **Location:** Button on P1.3 (member) and P2.7 (admin) reward history pages
  - **Goal:** Members and admins can download reward history as CSV.
  - **Requirements:**
    - Client-side CSV generation from API data
    - Columns: date, rule name, category, Bubbles awarded, description
    - File name: `swimbuddz-rewards-{date}.csv`
  - **Output:**
    - `exportToCsv.ts` utility function
    - Button additions to history pages

---

### P5.5 – Real-Time Alert Badge

- [ ] **P5.5 – Live Alert Count in Admin Sidebar**
  - **Location:** Admin sidebar, alerts nav item
  - **Goal:** Red badge showing open alert count that updates without page refresh.
  - **Requirements:**
    - Fetch alert summary on admin layout mount
    - Poll every 60 seconds (or use Server-Sent Events if available)
    - Show red dot with count next to "Alerts" nav item
    - Clear badge when alerts page is visited
  - **Output:**
    - Modified `AdminLayout.tsx`

---

## Implementation Notes

### Shared Components to Extract

When building Priority 1 and Priority 4.2 (coach parity), extract these reusable components to avoid duplication:

| Component           | File                                          | Used By                                           |
| ------------------- | --------------------------------------------- | ------------------------------------------------- |
| `ReferralCodeCard`  | `src/components/wallet/ReferralCodeCard.tsx`  | Member referral hub, coach referral hub           |
| `AmbassadorBadge`   | `src/components/wallet/AmbassadorBadge.tsx`   | Referral hub, wallet dashboard, profile           |
| `RewardRuleCard`    | `src/components/wallet/RewardRuleCard.tsx`    | Member rewards dashboard, coach rewards dashboard |
| `RewardHistoryList` | `src/components/wallet/RewardHistoryList.tsx` | Member history, coach history, admin lookup       |
| `ShareButton`       | `src/components/wallet/ShareButton.tsx`       | Referral hub, rewards dashboard                   |
| `LeaderboardTable`  | `src/components/wallet/LeaderboardTable.tsx`  | Public leaderboard, admin leaderboard             |

### Colour Scheme Reference

| Category          | Colour     | Tailwind Classes                           |
| ----------------- | ---------- | ------------------------------------------ |
| Wallet/Bubbles    | Cyan       | `cyan-50`, `cyan-600`, `cyan-900`          |
| Rewards           | Emerald    | `emerald-50`, `emerald-600`, `emerald-900` |
| Referrals         | Blue       | `blue-50`, `blue-600`, `blue-900`          |
| Ambassador        | Amber/Gold | `amber-50`, `amber-500`, `amber-900`       |
| Alerts (critical) | Red        | `red-50`, `red-600`, `red-900`             |
| Alerts (medium)   | Orange     | `orange-50`, `orange-500`                  |
| Academy rewards   | Purple     | `purple-50`, `purple-600`                  |
| Community rewards | Teal       | `teal-50`, `teal-600`                      |

### Page Count Impact

| Priority  | New Pages | Modified Pages | Total   |
| --------- | --------- | -------------- | ------- |
| P1        | 3         | 2              | 5       |
| P2        | 6         | 1              | 7       |
| P3        | 2         | 1              | 3       |
| P4        | 3         | 2              | 5       |
| P5        | 1         | 2+             | 3+      |
| **Total** | **15**    | **8+**         | **23+** |

Current page count: 103 → after full implementation: ~118

---

## Testing Checklist

For each page, verify:

- [ ] Loading state displays correctly
- [ ] Empty state displays when no data
- [ ] Error state handles API failures gracefully (toast + fallback UI)
- [ ] Mobile viewport: all content is readable and usable at 375px width
- [ ] Auth: page redirects to login if not authenticated (member/coach/admin routes)
- [ ] Data refreshes correctly after actions (toggle, submit, etc.)
- [ ] Navigation links work in sidebar and breadcrumbs
- [ ] Copy-to-clipboard works for referral codes and links
- [ ] Pagination works (if applicable)
- [ ] Filters work (if applicable)

---

## Dependencies & Blockers

| Item                                     | Status      | Notes                                                                                    |
| ---------------------------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| Wallet backend Phase 3 (51 endpoints)    | ✅ Complete | All APIs ready                                                                           |
| 21 seed reward rules                     | ✅ Complete | Auto-seeded on DB reset                                                                  |
| Member wallet pages                      | ✅ Complete | Dashboard, topup, transactions                                                           |
| Coach wallet pages                       | ✅ Complete | Dashboard, topup, transactions                                                           |
| Admin wallet pages                       | ✅ Complete | List, detail, freeze, adjust                                                             |
| Referral code validate endpoint (public) | ⚠️ Check    | P3.1 needs a public validation endpoint — verify it exists or add it                     |
| Registration `ref` param support         | ⚠️ Check    | P3.1 needs registration to pass referral code to backend                                 |
| Member rewards rules (public-facing)     | ⚠️ Check    | P1.2 needs a member-facing endpoint that lists active rules — verify it exists or add it |

---

_Last updated: 2026-02-28_
