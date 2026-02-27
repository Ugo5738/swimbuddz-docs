# SwimBuddz - TODO & Future Enhancements

This document tracks planned features, improvements, and technical debt for the SwimBuddz platform.

---

## 🎯 High Priority

### Academy Service

- [x] **Coach Profile Pages (Public)** ✅
  - Create public-facing coach profile pages at `/coaches/[id]`
  - Display: full bio, certifications, experience, specialties, photo
  - Show current and past cohorts taught
  - ~~Include testimonials/reviews from students~~ (Future enhancement)
  - Make coach cards on cohort detail pages clickable to view full profile
  - **Why**: Helps members make informed enrollment decisions
  - **Completed**: January 2026

- [x] **Enrollment Reminders** ✅
  - Send automated emails X days before cohort starts
  - Configurable reminder schedule (e.g., 7 days, 3 days, 1 day before)
  - Include: cohort details, what to bring, location, first session time
  - Add to background tasks service
  - **Why**: Reduces no-shows and improves student preparedness
  - **Completed**: January 2026

- [x] **Waitlist Processing** ✅
  - Automatically promote waitlisted students when capacity opens
  - Send notification emails when promoted
  - Handle payment flows for promoted students
  - Admin dashboard to manually manage waitlist
  - **Why**: Improves enrollment efficiency and student satisfaction
  - **Completed**: January 2026

### Session Service

- [x] **Link Academy Cohorts to Sessions** ✅
  - Query sessions service from onboarding endpoint for actual next session
  - Replace placeholder `cohort.start_date` with real session data
  - Filter sessions by cohort_id for academy students
  - **Why**: Provides accurate "next session" info in onboarding
  - **Completed**: January 2026

---

## 📊 Medium Priority

### Academy Service

- [x] **Progress Reports** ✅
  - Generate weekly/monthly progress summaries for enrolled students
  - Email digest: milestones achieved, coach feedback, next goals
  - Admin view to see cohort-wide progress analytics
  - Export progress reports as PDF
  - **Why**: Keeps students engaged and parents informed
  - **Completed**: January 2026

- [x] **Certificate Generation** ✅
  - Auto-generate certificates when students graduate (complete all milestones)
  - Customizable certificate templates with program/cohort details
  - Digital certificates with verification codes
  - Email delivery + download from member dashboard
  - **Why**: Recognition motivates students and adds value to programs
  - **Completed**: January 2026

- [x] **Session Attendance Alerts** ✅
  - Notify coaches about low attendance patterns for specific students
  - Weekly attendance summary emails for coaches
  - Flag students at risk of falling behind due to absences
  - Suggest interventions (e.g., makeup sessions, check-ins)
  - **Why**: Enables proactive coaching and student retention
  - **Completed**: January 2026

- [x] **Mid-Entry Rules Enhancement** ✅
  - Refine logic for when students can join active cohorts
  - Add "catch-up sessions" for mid-entry students
  - Automated placement testing for mid-entry eligibility
  - **Why**: Flexibility for students while maintaining quality
  - **Completed**: January 2026

### Members Service

- [x] **Coach Dashboard (Core)** ✅
  - Dedicated coach view showing "my cohorts", "my students"
  - Quick access to mark milestone progress for students
  - **Why**: Streamlines coach workflows
  - **Completed**: January 2026

- [ ] **Coach Dashboard (Enhancements)**
  - Attendance tracking integration (UI missing)
  - Communication tools (message cohort, individual students)
  - **Depends on**:
    - Attendance Service: Expand endpoint with RBAC (see below)
    - Communications Service: Coach Messaging Feature (see below)
  - **Estimated effort**: 2-3 days (frontend only, after backend dependencies)

### Payments Service

- [ ] **Payment Plans / Installments**
  - Allow students to pay in installments for expensive programs
  - Automated reminder for upcoming installment payments
  - Partial access until full payment (e.g., can attend but can't graduate)
  - **Why**: Makes programs accessible to more students
  - **Estimated effort**: 3-4 days

- [ ] **Multi-Currency Support**
  - Add currency selection beyond NGN
  - Display prices in local currency based on user IP/preference
  - Integration with payment gateways for settlement
  - **Why**: Supports international expansion
  - **Estimated effort**: 3-4 days

- [ ] **Coach Payout Management**
  - Track coach stipends and earnings
  - Automated calculation based on sessions/cohorts
  - Payout history and banking details management
  - **Why**: Automates financial operations
  - **Estimated effort**: 4-5 days

---

## 🔧 Low Priority / Nice to Have

### Academy Service

- [ ] **Student Progress Analytics Dashboard**
  - Charts showing cohort progress over time
  - Compare cohorts (success rates, completion times)
  - Identify high-performing vs struggling students
  - **Estimated effort**: 3-4 days

- [ ] **Peer Reviews / Student Feedback**
  - Allow students to rate/review coaches and programs (after completion)
  - Display aggregate ratings on coach profiles and program pages
  - **Depends on**: Coach Profile Pages (✅ Completed)
  - **Estimated effort**: 2-3 days

- [ ] **Skill Assessments**
  - Pre-program skill assessments to recommend correct level
  - Post-program assessments to validate learning
  - Automated level recommendations based on assessment results
  - **Estimated effort**: 5-6 days

- [ ] **Private Lessons Booking**
  - Students can book 1-on-1 sessions with coaches
  - Calendar integration for coach availability
  - Separate pricing for private vs group sessions
  - **Estimated effort**: 4-5 days

- [ ] **Cohort Chat / Community**
  - In-app messaging for cohort members
  - Share photos, videos, celebrate milestones
  - Coach can post announcements
  - **Estimated effort**: 5-7 days

- [ ] **Video Analysis Feature**
  - Upload training videos
  - Coach annotates video with feedback (drawings, voiceover)
  - Student library of analyzed swims
  - **Why**: Premium coaching experience
  - **Estimated effort**: 4-5 days

### Communications Service

- [x] **Activate Academy Email Sending** ✅
  - Email functions in `libs/common/emails/academy.py` are now callable
  - Enrollment confirmation, reminders, waitlist promotion, progress reports, certificates, attendance alerts
  - **Completed**: January 2026

- [x] **Centralize Email Sending in Communications Service** ✅
  - Created centralized email API:
    - `POST /api/v1/email/send` - Single email
    - `POST /api/v1/email/send-bulk` - Bulk emails with logging
    - `POST /api/v1/email/template` - Templated emails (11 templates)
  - Created `libs/common/emails/client.py` - HTTP client for service-to-service calls
  - All services now use centralized email client (with fallback to direct SMTP)
  - Templates: enrollment_confirmation, enrollment_reminder, waitlist_promotion, progress_report, certificate, attendance_summary, low_attendance_alert, payment_approved, session_confirmation, store_order_confirmation, store_order_ready
  - **Completed**: January 2026

- [x] **Coach Messaging Feature** ✅
  - Added endpoints:
    - `POST /api/v1/messages/cohorts/{cohort_id}` - Message all students in cohort
    - `POST /api/v1/messages/enrollments/{enrollment_id}` - Message individual student
  - Validates coach ownership, logs all sent messages
  - Integrated into Coach Dashboard UI
  - **Completed**: January 2026

- [x] **Complete Content Posts Frontend** ✅
  - Public tips/content feed at `/community/tips`
  - Admin content management UI at `/admin/community/content`
  - Tier-based filtering and category discovery
  - **Completed**: January 2026

- [x] **Build Comments UI** ✅
  - Comment display and creation on announcements
  - Comment display and creation on content posts
  - Announcements pages now use real API instead of mock data
  - **Completed**: January 2026

- [x] **Add Notification Preferences** ✅
  - Created `NotificationPreferences` model with email/push/digest settings
  - API endpoints: `GET/PATCH /api/v1/preferences/me`
  - Frontend UI at `/account/settings`
  - **Completed**: January 2026

- [x] **Fix Hardcoded SMTP Credentials** ✅
  - Moved to `libs/common/config.py` settings pattern
  - Uses `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `BREVO_KEY`/`SMTP_PASSWORD`
  - **Completed**: January 2026

- [ ] **SMS Notifications**
  - Send SMS reminders for sessions, payments
  - Opt-in/opt-out management
  - Integration with Twilio or similar
  - **Estimated effort**: 2-3 days

### Attendance Service

- [x] **Expand Attendance Endpoint with Role-Based Access Control** ✅
  - Added coach access to attendance endpoints
  - Created `require_admin_or_coach_for_session` dependency
  - Added cohort attendance summary endpoint: `GET /attendance/cohorts/{id}/summary`
  - Integrated into Coach Dashboard with at-risk student indicators
  - **Completed**: January 2026

### Media Service

---

## 🐛 Technical Debt / Refactoring

- [ ] **Unify Member Lookup Pattern**
  - Create reusable service for member lookups across services
  - Reduce duplicate SQL queries (many places do `SELECT * FROM members WHERE id=...`)
  - Consider caching layer for frequently accessed member data
  - **Estimated effort**: 2-3 days

- [ ] **API Type Generation Automation**
  - Automate frontend type generation on backend changes (CI/CD hook)
  - Reduce manual `npm run generate:types` steps
  - **Estimated effort**: 1 day

- [ ] **Database Indexing Review**
  - Analyze slow queries in production logs
  - Add indexes on frequently queried columns (e.g., `member_auth_id`, `cohort_id`)
  - **Estimated effort**: 1-2 days

- [ ] **Error Handling Standardization**
  - Standardize error response formats across all services
  - Add error tracking (Sentry, Rollbar, etc.)
  - **Estimated effort**: 2-3 days

- [ ] **Unit Test Coverage**
  - Increase backend test coverage (currently minimal)
  - Add integration tests for critical flows (enrollment, payment)
  - Frontend component tests for key UI elements
  - **Estimated effort**: Ongoing (5-10 days initial sprint)

---

## 📝 Documentation

- [ ] **API Documentation Hosting**
  - Host Swagger/OpenAPI docs publicly for frontend devs
  - Add examples and use cases for each endpoint
  - **Estimated effort**: 1 day

- [ ] **Admin User Guide**
  - Step-by-step guide for common admin tasks
  - Screenshots and video tutorials
  - **Estimated effort**: 2-3 days

- [ ] **Developer Onboarding Guide**
  - Comprehensive setup instructions for new developers
  - Architecture walkthrough
  - Code contribution guidelines
  - **Estimated effort**: 2-3 days

---

## 🚀 Long-Term Vision

- [ ] **Mobile App (React Native / Flutter)**
  - Native iOS/Android apps for better mobile UX
  - Push notifications for sessions, milestones
  - Offline mode for viewing progress
  - **Estimated effort**: 6-8 weeks

- [ ] **Multi-Location Support**
  - Support multiple pools/locations for academy programs
  - Location-based cohort filtering
  - **Estimated effort**: 2-3 weeks

- [ ] **Partner Program**
  - White-label solution for other swim schools
  - Multi-tenant architecture
  - **Estimated effort**: 8-12 weeks

- [ ] **AI Coaching Assistant**
  - AI-powered stroke analysis from video
  - Personalized training recommendations
  - **Estimated effort**: Research project (3-6 months)

---

## 📅 Maintenance Tasks

### Weekly
- [ ] Review logs for errors/warnings
- [ ] Check cohort status transitions are running
- [ ] Monitor payment success/failure rates

### Monthly
- [ ] Database backup verification
- [ ] Performance review (slow queries, API latency)
- [ ] Security updates for dependencies

### Quarterly
- [ ] User feedback review and prioritization
- [ ] Roadmap planning session
- [ ] Tech stack evaluation (new tools, frameworks)

---

## 🎉 Completed Features

- ✅ POST-enrollment onboarding flow with structured endpoint
- ✅ Automated cohort status transitions (OPEN→ACTIVE→COMPLETED)
- ✅ Coach details display on cohort pages
- ✅ Payment callback redirect to onboarding success page
- ✅ Admin button to manually trigger cohort status transitions
- ✅ Milestone claim workflow with coach review system
- ✅ Video Milestone Evidence (Upload support implemented)

---

## 💡 Future Ideas

Use this section to list **scoped ideas** that are not part of the current TODO sequence. These are exploratory concepts that may be evaluated for future roadmap inclusion.

### Member Experience

- **Member Scorecard** - Visual representation of a member's progress, skills, and achievements
  - Swimming level progression tracker
  - Academy milestones completed
  - Club attendance stats and streaks
  - Badges and achievements system
  - Link to Academy service progress data

- **Referral Program** - Member-to-member referral tracking and rewards
  - Unique referral codes per member
  - Track successful referrals (new member registrations)
  - Reward system (discounts, free sessions, store credits)
  - Referral leaderboard

- **Social Features** - Enhanced community engagement
  - Member profiles with swim history
  - Follow other swimmers
  - Activity feed (recent swims, milestones)
  - Swim buddy matching based on level/location

- **Parent/Guardian Portal** - Managed accounts for under-18s
  - Linked accounts (Parent -> Children profiles)
  - Unified family billing and activity view
  - Consent management for minors
  - Delegated permissions (nanny/driver pickup)

### Communication & Integration

- **WhatsApp Integration** - Automated announcements and reminders
  - WhatsApp Business API integration
  - Send session reminders via WhatsApp
  - Automated payment confirmations
  - Cohort start notifications
  - Two-way communication for quick responses

- **SMS Notifications** - Text message alerts for critical events
  - Session reminders (24h and 2h before)
  - Payment confirmations
  - Enrollment confirmations
  - Emergency cancellations/weather updates

### Analytics & Reporting

- **Advanced Analytics Dashboard** - Detailed insights for admins
  - Member growth trends and churn analysis
  - Revenue by service (Club, Academy, Store, Events)
  - Attendance patterns and peak times
  - Geographic distribution of members
  - Cohort completion rates and student success metrics
  - Payment collection efficiency

- **Business Intelligence Reports** - Exportable reports for decision-making
  - Monthly financial summary
  - Member retention reports
  - Coach performance metrics
  - Inventory turnover (store)
  - Session capacity utilization

### Payment & Financial

- **Stripe Integration** - Replace manual payment reference with automated processing
  - Real-time payment processing
  - Automated payment confirmations
  - Subscription management for recurring fees
  - Refund handling
  - Multi-currency support for international expansion

- **Automated Invoicing** - Generate and send invoices automatically
  - PDF invoice generation
  - Email delivery to members
  - Payment tracking and reminders
  - Tax compliance features

### Advanced Features

- **Mobile App (Native)** - iOS and Android applications
  - React Native or Flutter implementation
  - Push notifications for reminders
  - Offline mode for viewing progress
  - Mobile-optimized session sign-in
  - QR code scanning for check-ins

- **AI Coaching Assistant** - Intelligent swim training recommendations
  - Video analysis of swimming technique
  - Personalized training suggestions
  - Stroke correction recommendations
  - Progress predictions based on historical data

- **Multi-Location Management** - Support for multiple pool locations
  - Location-based session filtering
  - Regional cohorts and programs
  - Location-specific pricing
  - Travel coordination between locations

- **White-Label Platform** - Partner program for other swim schools
  - Multi-tenant architecture
  - Customizable branding per school
  - Separate databases per tenant
  - Centralized updates and maintenance

### MCP & AI Integration

- **Additional MCP Tools** - Extend Model Context Protocol capabilities
  - Payment verification tool
  - Member lookup tool
  - Session capacity checker
  - Cohort enrollment status tool
  - Analytics query tool

### Gamification

- **Achievements & Badges** - Reward system for engagement
  - Attendance streaks
  - Milestone completion badges
  - First-time achievements (first session, first cohort)
  - Community contribution badges
  - Display on member profiles

- **Leaderboards** - Friendly competition
  - Most active members (monthly)
  - Fastest milestone progression
  - Highest attendance rates
  - Top referrers

---

## How to Use This TODO

1. **Adding Items**: Create a new entry with:
   - Clear title and description
   - "Why" this matters (business value)
   - Estimated effort (time/complexity)

2. **Prioritization**: Move items between High/Medium/Low based on:
   - User impact
   - Business value
   - Technical dependencies
   - Team capacity

3. **Updates**: When starting work, create a branch: `feature/todo-item-name`

4. **Completion**: Move completed items to "Completed Features" section with date

5. **Future Ideas**: Items in "Future Ideas" are not prioritized yet. Evaluate and move to appropriate priority section when ready to implement.

---

*Last updated: January 2026*
