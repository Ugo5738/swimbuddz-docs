# Launch Readiness Content Checklist

This checklist identifies critical content and structure requirements to ensure valid user onboarding, trust, and operational efficiency for the SwimBuddz platform launch.

## 1. Trust & Safety (Critical for Parents)
- [ ] **Safety & Guidelines Page** (`/safety`)
    - [ ] Lifeguard presence and certifications.
    - [ ] Pool hygiene and water quality standards.
    - [ ] Child protection policy (Guardian supervision rules).
    - [ ] Emergency procedures summary.
- [ ] **Privacy Policy** (`/privacy`) - *Already linked in Footer, need to verify content.*
- [ ] **Terms of Service** (`/terms`) - *Missing*. Required for Paystack and recurring billing.
- [ ] **Refund & Cancellation Policy** (`/refund-policy`) - *Missing*. Critical for Store and Academy (missed classes).

## 2. Onboarding & Conversion
- [ ] **"How it Works" Guide** (`/how-it-works` or section)
    - [ ] Visual flow: Community -> Club -> Academy.
    - [ ] Explanation of "Assessments" and "Cohorts".
- [ ] **FAQ / Help Center** (`/faq`)
    - [ ] "What do I need to bring?" (Goggles, Cap, etc.).
    - [ ] "Can I pause my membership?".
    - [ ] "How do I enroll my child?" (Explain linked accounts vs separate accounts).
- [ ] **Contact / Support** (`/contact`)
    - [ ] WhatsApp integration link (Operational efficiency).
    - [ ] Email support form or link.
    - [ ] Physical location map (for drop-offs).

## 3. Operational Efficiency
- [ ] **"First Session" Guide**
    - [ ] Checklist for new members (e.g., "Arrive 15 mins early").
    - [ ] Parking instructions.

## 4. Technical / Structural Gaps
- [ ] **Footer Update**: Currently hardcoded in `MainLayout.tsx`. Needs to include:
    - [ ] Links to Terms, Refund Policy, Contact, FAQ.
    - [ ] Social media links.
- [ ] **Store Integration**: Ensure Refund Policy is visible during checkout.

## 5. Implementation Plan

### Phase 1: Critical Pages (Day 1)
1.  Scaffold `/terms`, `/refund-policy`, `/faq`, `/contact`.
2.  Update `MainLayout.tsx` Footer to include these links.
3.  Draft content for Safety page (`/safety`).

### Phase 2: Enhanced Content (Day 2-3)
1.  "How it Works" dedicated page (if landing page is insufficient).
2.  "First Session" guide (can be an email or page).

---

## Status Tracker

- [ ] Safety Page
- [ ] Terms of Service
- [ ] Refund Policy
- [ ] FAQ
- [ ] Contact Page
- [ ] Footer Update
