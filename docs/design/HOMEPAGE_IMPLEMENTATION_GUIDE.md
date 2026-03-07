# SwimBuddz Homepage Redesign — Implementation Guide

> **Purpose:** A step-by-step implementation guide for redesigning the SwimBuddz homepage. Written so any developer (human or AI agent) can pick up each task independently and execute it with full context.
>
> **Source:** Derived from the [Homepage UX Audit](./HOMEPAGE_UX_AUDIT.md), feedback from a second UX review, and strategic insights from advisor conversations.
>
> **Second Agent Reconciliation:** A separate UX review scored the site 8/10, validating the CTA structure as sound (hero = 2 CTAs, tiers = 3 parallel, other sections = 1 each). Their primary gap identified was **missing community proof** — no volunteer recognition, contributor spotlights, or visible community identity. This aligns with our Section 7 (Community Spotlight) recommendation. Where the two audits disagree (e.g., CTA count interpretation), we've taken the more conservative approach — reducing redundant CTAs while keeping the structurally sound pattern intact.

---

## Table of Contents

1. [Section Reorder](#1-section-reorder)
2. [Hero Section Changes](#2-hero-section-changes)
3. [Audience Cards ("Who SwimBuddz Is For")](#3-audience-cards)
4. [Pricing Tiers ("Choose Your Level of Commitment")](#4-pricing-tiers)
5. [Community Gallery ("Building a Culture Together")](#5-community-gallery)
6. [How It Works](#6-how-it-works)
7. [Community Spotlight (NEW)](#7-community-spotlight-new-section)
8. [Testimonials ("What Our Swimmers Say")](#8-testimonials)
9. [Bubbles Section ("Earn Bubbles Every Time You Swim")](#9-bubbles-section)
10. [Final CTA ("Ready to swim...")](#10-final-cta)
11. [Navigation & Footer](#11-navigation--footer)
12. [Sections to Remove from Homepage](#12-sections-to-remove-from-homepage)
13. [Volunteer Page (NEW)](#13-volunteer-page-new)
14. [Store Page (NEW)](#14-store-page-new)
15. [Copy Rewrite — Emotion-Led Messaging](#15-copy-rewrite)

---

## Priority Legend

| Priority | Meaning |
|----------|---------|
| 🔴 P0 | Do first — blocks other work or is highest conversion impact |
| 🟡 P1 | Do second — important but not blocking |
| 🟢 P2 | Do when time allows — polish and enhancement |

---

## 1. Section Reorder

**Priority:** 🔴 P0

**Current order:**
1. Hero (carousel)
2. "Who SwimBuddz Is For" (3 audience cards)
3. "Choose Your Level of Commitment" (3 pricing tiers)
4. SwimBuddz Gear (4 category cards)
5. Upcoming Sessions & Events
6. "Building a Culture Together" (community gallery)
7. "How It Works" (4 steps)
8. "What Our Swimmers Say" (3 testimonials)
9. "Earn Bubbles Every Time You Swim"
10. Final CTA ("Ready to swim with people who actually show up?")

**New order:**
1. Hero (carousel — keep as-is)
2. "Who SwimBuddz Is For" (audience cards — enhanced)
3. "Building a Culture Together" (community photos — **moved UP**)
4. "How It Works" (4 steps — copy tweaked)
5. **Community Spotlight (NEW SECTION)**
6. "What Our Swimmers Say" (testimonials — enhanced)
7. "Choose Your Level of Commitment" (pricing tiers — with prices)
8. "Earn Bubbles" (shortened version)
9. Final CTA

**Sections removed from homepage:**
- SwimBuddz Gear → moved to `/store` page and/or Membership Benefits
- Upcoming Sessions & Events → the Sessions page in navbar already handles this; optionally show 2-3 inline sessions but remove dedicated section
- Full gallery grid → already has dedicated `/gallery` page

### Implementation Steps

1. Identify the homepage component file (likely a React/Next.js page component)
2. Each section is likely its own component — reorder the component imports/usage
3. Remove the `<GearSection />` and `<UpcomingSessionsSection />` components from the homepage (or repurpose inline)
4. Test that the page renders correctly in the new order
5. Verify mobile responsiveness after reorder

---

## 2. Hero Section Changes

**Priority:** 🟡 P1

**What to keep:**
- The carousel — leave as-is per product decision
- The hero image (real swimming photography)
- "Building globally · Currently active in Lagos" trust badge

**What to change:**

### 2a. Social proof number
Add a small counter near the hero text or trust badge:

```
"Join 60+ swimmers in Lagos"
```

**Where to place it:** Below the subtitle "SwimBuddz connects beginners, fitness swimmers, and competitors..." or next to the trust badge.

**Implementation:**
- Add a `<span>` or `<p>` element with the text "Join 60+ swimmers in Lagos"
- Style it with a subtle highlight — e.g., the teal accent color, or a small icon (🏊)
- This number can eventually be dynamic (pulled from member count API), but for now hardcode "60+"

### 2b. Primary CTA text change
- **Current:** "Join SwimBuddz"
- **New:** "Join Free" or "Create Your Free Account"

**Rationale:** Signaling zero cost removes the biggest friction for new visitors. "Join SwimBuddz" sounds like a commitment; "Join Free" sounds like a no-brainer.

### 2c. Emotion-led headline (see Section 15 for full copy guidance)
The current headline "Learn, train, and enjoy swimming with our swimming community" is accurate but doesn't speak to the emotional journey. Consider testing:

> *"Scared of deep water? You're not alone."*
> or
> *"From fear to freestyle — swim with people who get it."*

**Decision needed:** This is a significant brand decision. Can be A/B tested later. For now, keep the current headline but add an emotion-led subtitle. See [Section 15](#15-copy-rewrite) for copy guidance.

---

## 3. Audience Cards

**Priority:** 🟡 P1

**What exists:** Three cards — Beginners, Fitness Swimmers, Competitive / Ocean Curious

### Changes

#### 3a. Make cards clickable
Each card should link to the relevant program page or a dedicated landing section:

| Card | Link Target |
|------|-------------|
| Beginners | `/programs/academy` or anchor to Academy tier |
| Fitness Swimmers | `/programs/club` or anchor to Club tier |
| Competitive / Ocean Curious | `/programs/club` or relevant program page |

**Implementation:**
- Wrap each card in an `<a>` or `<Link>` component
- Add hover state: subtle scale (1.02) + border glow effect
- Add a subtle arrow or "Learn more" text on hover

#### 3b. Rename "Competitive / Ocean Curious"
- **Current:** "Competitive / Ocean Curious"
- **New:** "Advanced & Open Water"

**Rationale:** Clearer, more concise. "Ocean Curious" is playful but vague.

#### 3c. Add CTA to each card
Add a small "Learn more →" link at the bottom of each card, styled as a text link (not a button — to avoid CTA overload).

---

## 4. Pricing Tiers

**Priority:** 🔴 P0 — This is the highest-impact conversion change

**What exists:** Community, Club (Most Popular), Academy — no prices shown

### Changes

#### 4a. Show prices

| Tier | Price Display | Notes | Status |
|------|--------------|-------|--------|
| Community | **₦20,000/year** | Could also show as "₦1,667/mo" equivalent | ✅ Confirmed |
| Club | **₦X/month** | *Need actual price from product team* | ❓ TBD |
| Academy | **₦X per cohort** | *Need actual price from product team* | ❓ TBD |

**Implementation:**
- Add a price element below each tier name
- Format: `<span class="tier-price">₦20,000<span class="price-period">/year</span></span>`
- For Community, consider also showing: "That's less than ₦1,700/month" as a persuasion line

#### 4b. Differentiate CTA buttons

| Tier | Current CTA | New CTA |
|------|------------|---------|
| Community | "Learn more →" | **"Join Free Community"** or **"Start with Community — ₦20,000/yr"** |
| Club | "Learn more →" | **"Start Training"** |
| Academy | "Learn more →" | **"Apply for Next Cohort"** (creates scarcity + exclusivity) |

**Implementation:**
- Update button text for each tier
- Keep "Most Popular" badge on Club
- Consider adding scarcity text under Academy: "Limited spots per cohort"

#### 4c. Trim feature lists
Each tier currently shows 6-7 features. Reduce to 4-5 key differentiators:

**Community (keep 5):**
- Access to Global Community Network
- Community Events & Socials
- Swim tips & education
- Community group chats
- SwimBuddz merchandise access

**Club (keep 5):**
- Regular training exercises
- Track your times & performance
- Team culture & challenges
- Exclusive club events
- Everything in Community

**Academy (keep 5):**
- Structured curriculum/milestones
- Coach-assigned drills and goals
- Certification
- Cohort-based program
- Everything in Community & Club

---

## 5. Community Gallery

**Priority:** 🟡 P1

**What exists:** "Building a Culture Together" section with 6 photos in a grid + "Browse Gallery" CTA

### Changes

#### 5a. Move up on the page
This section moves from position 6 to position 3 in the new order. (Handled in Section 1 reorder.)

#### 5b. Add captions to 1-2 photos (optional)
Add brief captions overlaid on photos:
- *"Saturday morning session at Rowe Park"*
- *"Academy cohort graduation day"*

**Implementation:**
- Add a semi-transparent overlay with caption text on 1-2 featured photos
- Use CSS `position: absolute; bottom: 0` with a gradient backdrop

#### 5c. Consider adding a short auto-play video (optional, P2)
A 5-10 second muted video clip of a session in progress would dramatically increase engagement. If video content is available, embed it as the first item in the grid.

---

## 6. How It Works

**Priority:** 🟢 P2

**What exists:** 4 steps — Join the Community, Pick Your Path, Show Up Consistently, Grow With the Pod

### Change — Step 4 copy rewrite

- **Current Step 4:** "Grow With the Pod — Take on challenges, volunteer, and be part of building SwimBuddz."
- **New Step 4:** "See Real Progress — Track your improvement, earn Bubbles, and celebrate milestones with the pod."

**Rationale:** The current Step 4 asks the user to do things *for* SwimBuddz (volunteer, build the community). At this stage of the page, the user hasn't even joined yet. Step 4 should focus on *their* outcomes — what they'll gain.

**Implementation:**
- Update the heading text for step 4
- Update the description text
- Optionally update the step 4 icon if it currently references volunteering

---

## 7. Community Spotlight (NEW SECTION)

**Priority:** 🟡 P1

**What exists:** Nothing — this is a new section

### What to Build

A "Community Spotlight" section placed between "Building a Culture Together" (community photos) and "What Our Swimmers Say" (testimonials).

#### Layout

```
┌────────────────────────────────────────────────────┐
│  OUR COMMUNITY                                      │
│  Community Spotlight                                 │
│                                                      │
│  ┌──────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 🏆           │  │ Photo    │  │ Photo    │  │ Photo    │  │
│  │ Volunteer of │  │ Name     │  │ Name     │  │ Name     │  │
│  │ the Month    │  │ Role     │  │ Role     │  │ Role     │  │
│  │              │  │          │  │          │  │          │  │
│  │ [Photo]      │  │          │  │          │  │          │  │
│  │ Divine       │  │          │  │          │  │          │  │
│  │ Session Lead │  │          │  │          │  │          │  │
│  │ 24 hrs       │  │          │  │          │  │          │  │
│  └──────────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                      │
│  "Our volunteers have contributed 500+ hours"        │
└────────────────────────────────────────────────────┘
```

#### Structure

1. **Volunteer of the Month** — Featured larger card
   - Photo
   - Name
   - Role
   - Short quote or hours contributed
   - 🏆 badge/icon

2. **Community Contributors** — 3-5 smaller cards
   - Photo
   - Name
   - Role (e.g., "Ride Share Driver", "Media Volunteer", "Session Lead")

3. **Impact counter** — Simple stat line:
   - "Our volunteers have contributed X+ hours this year"

#### Data Source

This section should pull from the backend's volunteer/spotlight system. If the API is not ready, hardcode the first version with real member data.

**Backend considerations:**
- Needs an endpoint to fetch the current "Volunteer of the Month" and "Top Contributors"
- Reference the existing volunteer service work (conversation `c40889a1` — featured volunteer system)
- The admin should be able to set the VotM and contributors from the admin panel

#### Implementation Steps

1. Create a new component: `CommunitySpotlight.tsx` (or `.jsx`)
2. Design the card layout — use the same dark card style as other sections
3. The VotM card should be visually larger/more prominent (gold border? 🏆 icon?)
4. Contributor cards are a horizontal row of 3-5 smaller cards
5. Add the impact counter as a centered text line below
6. Insert the component in the homepage between community photos and testimonials
7. Initially hardcode data; later connect to the backend volunteer spotlight API
8. Ensure mobile responsiveness — stack cards vertically on mobile

---

## 8. Testimonials

**Priority:** 🔴 P0

**What exists:** 3 testimonial cards with quotes and attribution ("SwimBuddz Member", "Club Member", "Academy Graduate")

### Changes

#### 8a. Add real names and photos

- **Current:** "— SwimBuddz Member"
- **New:** "— Ade, SwimBuddz Member since 2025" + photo

**Implementation:**
- Add a circular avatar image to each testimonial card (40-50px)
- Use real member photos (with permission)
- Add first name and join date
- If photos aren't available yet, use initials in a colored circle as placeholder

#### 8b. Add transformation context

Rewrite at least one testimonial to include measurable progress:

- **Current:** "I went from being afraid of water to swimming across the pool confidently."
- **Better:** "When I joined, I couldn't put my face in the water. 3 months later, I swam my first 50 meters. SwimBuddz changed everything for me."

**Note:** These should be real quotes from real members. Gather them via a quick survey or WhatsApp ask.

#### 8c. Consider video testimonials (P2)

If short video clips are available (even 15-second iPhone clips), embed one as a featured testimonial. This is 10x more powerful than text.

---

## 9. Bubbles Section

**Priority:** 🟢 P2

**What exists:** "Earn Bubbles Every Time You Swim" with 4 earning method cards (Attend Sessions, Refer Friends, Graduate Academy, Volunteer) + "Join SwimBuddz" CTA

### Changes

#### 9a. Add concrete examples

Current copy is vague about the value of Bubbles. Add a tangible example:

> "Attend 1 session = 50 Bubbles | 500 Bubbles = 1 Free Session"

or a mini exchange rate table:

| Activity | Bubbles Earned |
|----------|----------|
| Attend a session | 50 |
| Refer a friend | 200 |
| Graduate Academy | 500 |
| Volunteer | 100 |

**Implementation:**
- Add a subtitle or small text block below the main heading with concrete examples
- The earning amounts should come from the rewards engine configuration — for now, use placeholder amounts and validate with the product team

#### 9b. Remove "Join SwimBuddz" CTA from this section

This CTA is redundant — it appears in the hero and the final CTA. Remove it from the Bubbles section to reduce CTA fatigue.

**Implementation:**
- Remove the "Join SwimBuddz" button from this section
- The section becomes purely informational/delightful — not a conversion point

---

## 10. Final CTA

**Priority:** 🟡 P1

**What exists:** "Ready to swim with people who actually show up?" + "Join SwimBuddz" + "Learn More About Us"

### Changes

#### 10a. Change primary CTA text
- **Current:** "Join SwimBuddz"
- **New:** "Join Free Today"

#### 10b. Remove secondary CTA
- **Remove:** "Learn More About Us"
- **Rationale:** At the bottom of the page, the user either converts or leaves. "Learn More" is an exit ramp — it sends them to another page instead of converting. Every page should have one clear action.

**Implementation:**
- Update button text
- Remove the "Learn More About Us" button
- Keep the wave/gradient background design

---

## 11. Navigation & Footer

**Priority:** 🟡 P1

### 11a. Simplify main navigation

**Current nav (8+ items):** Home, About, Programs ▾, Sessions, Tips, Gallery, Dashboard, Profile, Logout

**New nav for logged-out users (6 items):**
| Item | Notes |
|------|-------|
| Home | Keep |
| About | Keep |
| Programs ▾ | Keep with dropdown |
| Sessions | Keep |
| Community | **NEW** — links to community page showing volunteers, spotlights, leaderboard |
| Store | **NEW** — links to the gear store page |
| **Join Free** (accent button) | Primary CTA in nav — replaces generic "Join" |

**Where Tips goes:** Tips is already a functioning blog/resources section. Keep it as a nav item but consider renaming to "Resources" or nesting it inside the Programs dropdown for cleaner navigation. **Do not remove it** — it's working well as-is.

**For logged-in users:**
- Replace "Join Free" with a user avatar dropdown containing: Dashboard, Profile, Logout
- The current Dashboard button + Profile + Logout links get consolidated into the avatar dropdown

### 11b. Add "Community" nav item

This is a key recommendation from the second UX review. The Community page would contain:
- Community Spotlight / Volunteer of the Month
- Volunteer leaderboard
- Member milestones
- Community photos
- How to volunteer (simplified public-facing version of the 13 roles)

**Implementation:**
- Add "Community" link to the main navigation
- Create a basic `/community` page (can start simple and grow)
- This page becomes the home for volunteer recognition that's too detailed for the homepage

### 11c. Footer — keep as-is
The footer is clean and functional. No changes needed.

---

## 12. Sections to Remove from Homepage

### 12a. SwimBuddz Gear
- **Remove** from homepage entirely
- Create a dedicated `/store` page (see Section 14)
- Add "Store" to the main navigation
- Optionally feature gear as a benefit on a "Membership Benefits" page

### 12b. Upcoming Sessions & Events (partial removal)
- **Remove** the dedicated section with the empty calendar CTA
- **Option A:** Replace with 2-3 inline upcoming session cards (dynamically pulled) showing date, time, and "RSVP" button
- **Option B:** Remove entirely and rely on the "Sessions" nav link

**Implementation for Option A:**
- Create a small `UpcomingSessions` component that fetches the next 2-3 sessions from the sessions API
- Display as compact cards: `[Date] [Time] [Location] [RSVP →]`
- If no upcoming sessions exist, hide the component entirely (don't show an empty state)
- Place this optionally below the pricing tiers

---

## 13. Volunteer Page (NEW)

**Priority:** 🟡 P1

### What to Build

A dedicated `/community/volunteers` or `/volunteer` page that surfaces the volunteer system publicly.

**Content structure:**
1. **Hero:** "Help Build the SwimBuddz Community" + brief description
2. **Impact stats:** Total volunteer hours, number of active volunteers, number of sessions supported
3. **Volunteer of the Month:** Featured card with photo, name, quote
4. **How Volunteering Works:** Simple 3-step process (Sign Up → Get Matched → Show Up)
5. **Volunteer Categories (4 broad groups):**
   - 🏊 Session Support (Session Lead, Lane Marshal, Check-in, Safety, Warm-up)
   - 📸 Media & Content (Media Volunteer, Gallery Support)
   - 🤝 Community (Welcome Volunteer, Mentor/Buddy, Ride Share)
   - 📋 Events & Logistics (Events Volunteer, Trip Planner, Academy Assistant)

   *Note: These are simplified public-facing categories. The full 13 roles from [VOLUNTEER_ROLES.md](../community/VOLUNTEER_ROLES.md) are shown during onboarding/dashboard.*
6. **Recognition tiers:** Bronze / Silver / Gold with perks
7. **CTA:** "Indicate Your Interest" → links to profile volunteer preferences

### Implementation Steps

1. Create the page component at the appropriate route
2. Design the layout using the existing dark theme + teal accents
3. Pull Volunteer of the Month data from the backend (or hardcode initially)
4. Link the 4 broad categories to brief descriptions
5. Add the page to the "Community" nav dropdown or as a sub-page of Community
6. Ensure the page is accessible from the About page's "How to Get Involved" section (which already links to `/community/volunteers`)

---

## 14. Store Page (NEW)

**Priority:** 🟢 P2

### What to Build

A dedicated `/store` page that houses the gear content removed from the homepage.

**Content structure:**
1. **Header:** "SwimBuddz Gear — Essentials for Every Swimmer"
2. **Category grid:** Goggles, Caps, Swimwear, Training Equipment
3. **Product listings** (when products are available)
4. **For members only:** Consider showing member-exclusive gear or discounts

**Note:** This page may already partially exist in the codebase (the store documentation in `docs/store/` suggests a store system is planned). The key action is removing gear from the homepage and ensuring there's a nav link to the store.

---

## 15. Copy Rewrite — Emotion-Led Messaging

**Priority:** 🔴 P0 — Upgraded from P1 based on advisor validation (see [Advisor Insights](../company/ADVISOR_INSIGHTS_ROLF_FEB2026.md))

> **Context from advisor feedback (Rolf Groenewold, Feb 2026):** "Speak to the problem you're trying to solve. Articulate how people actually feel. When somebody reads language that is actually how they feel, then they feel like that you understand them."
>
> The current copy is "very normal" and "middle of the road." It's professional but doesn't speak to the emotional reality of the target audience.
>
> **Key insight:** SwimBuddz's competitive advantage is **emotional transformation** (fear → confidence). The target audience is people who are scared of water, live in areas where swimming is rare, and need community to feel safe learning. The copy must speak to this fear directly.

### Target Audience Emotional Profile

SwimBuddz's primary audience (per advisor conversation) is people who:
- Are scared of water or swimming
- Live in areas where swimming is rare / not part of the culture
- Want to learn but feel intimidated by traditional swimming environments
- Need community and accountability to show up consistently

### Copy Principles

1. **Lead with the fear, then resolve it:** Don't start with what SwimBuddz is. Start with what the user feels.
2. **Use "you" language:** Speak directly to the reader's experience
3. **Show transformation:** Before → After framing
4. **Avoid generic community language:** "Join our community" could be any product. Be specific to swimming.

### Copy Examples for Key Sections

#### Hero subtitle options (test alongside current)
- *"Afraid of the deep end? Start here. We've got you."*
- *"Your swimming journey starts with people who understand."*
- *"60+ swimmers started exactly where you are."*

#### Audience cards — subtitle tweaks
| Card | Current | Emotion-Led Alternative |
|------|---------|----------------------|
| Beginners | "Start from zero in a safe, supportive environment" | "Never swum before? Neither had most of us. Start here." |
| Fitness Swimmers | "Improve your technique, build endurance..." | "Ready to get serious? Train with swimmers who push each other." |
| Advanced & Open Water | "Explore more advanced training..." | "You can swim. Now go further — open water, challenges, competitions." |

#### Pricing section — add value framing
Under the Community tier price, add:
> "That's less than a single pool visit per week — and you get a whole community."

**Implementation:**
- Create a copy document with all proposed changes
- Get approval on the new copy before implementing
- Update text content in the relevant components
- Consider A/B testing on the hero specifically

---

## Implementation Order (Recommended)

### Sprint 1 — Highest Impact (Week 1-2)
1. 🔴 Show prices on pricing tiers (Section 4a)
2. 🔴 Differentiate tier CTAs (Section 4b)
3. 🔴 Add real names/photos to testimonials (Section 8a)
4. 🔴 Reorder homepage sections (Section 1)
5. 🔴 Copy rewrite — emotion-led messaging (Section 15) *(upgraded from Sprint 3 per advisor validation)*

### Sprint 2 — Community & Navigation (Week 3-4)
6. 🟡 Build Community Spotlight section (Section 7)
7. 🟡 Create Volunteer page (Section 13)
8. 🟡 Simplify navigation + add Community nav item (Section 11)
9. 🟡 Hero CTA text change + social proof number (Section 2)

### Sprint 3 — Polish & Optimization (Week 5-6)
10. 🟢 Move gear off homepage, create Store page (Section 12a, 14)
11. 🟢 Bubbles section — add concrete examples (Section 9)
12. 🟢 How It Works — Step 4 copy rewrite (Section 6)
13. 🟢 Final CTA refinements (Section 10)

### Ongoing
- Collect real testimonials with names and photos
- Record short video testimonials
- Populate Community Spotlight with real volunteer data
- Track conversion metrics: registration rate, tier selection rate, bounce rate

---

## Dependencies & Open Questions

| Item | Status | Owner |
|------|--------|-------|
| Community tier price | ✅ **₦20,000/year** | Confirmed |
| Club tier price | ❓ Needed | Product |
| Academy tier price | ❓ Needed | Product |
| Real member photos for testimonials | ❓ Need to collect | Community team |
| Volunteer of the Month — first selection | ❓ Need to decide | Admin |
| Short video testimonial clips | ❓ Need to record | Media volunteers |
| Backend endpoint for Volunteer Spotlight | 🔧 Partially built | Backend (ref: conversation c40889a1) |
| Bubbles earning amounts (final values) | ❓ Needed | Product |

---

*Last updated: March 2026*
