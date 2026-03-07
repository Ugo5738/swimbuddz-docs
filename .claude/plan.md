# Homepage Redesign & Volunteer System Implementation Plan

## Overview
Implement the changes outlined in HOMEPAGE_UX_AUDIT.md, HOMEPAGE_IMPLEMENTATION_GUIDE.md, and ADVISOR_INSIGHTS_ROLF_FEB2026.md. The current homepage is a single monolithic `"use client"` component at `src/app/page.tsx` (~700 lines). We'll refactor it into composable sections and apply all recommended changes.

## Current State
- **Homepage:** Single `page.tsx` file with all sections inline, no separate components
- **Store page:** Already exists at `(public)/store/page.tsx` — fully functional
- **Community page:** Already exists at `(public)/community/page.tsx` — has volunteer spotlight integration
- **Volunteer Hub:** Already exists at `(member)/community/volunteers/page.tsx` — full featured
- **Header:** `components/layout/Header.tsx` — has nav, auth dropdown
- **Footer:** Inline in `components/layout/MainLayout.tsx`

## Implementation Plan (Following Sprint Order from Guide)

### Phase 1: P0 — Highest Impact Changes (in `page.tsx`)

**Step 1: Section Reorder + Remove Gear & Sessions sections**
- File: `src/app/page.tsx`
- Reorder sections from current (Hero → Audience → Tiers → Gear → Sessions → Gallery → How It Works → Testimonials → Bubbles → Final CTA) to new order:
  1. Hero
  2. "Who SwimBuddz Is For" (audience cards)
  3. "Building a Culture Together" (community gallery — moved UP from #6)
  4. "How It Works" (4 steps)
  5. Community Spotlight (NEW — Phase 2)
  6. "What Our Swimmers Say" (testimonials)
  7. "Choose Your Level of Commitment" (pricing tiers — moved DOWN from #3)
  8. "Earn Bubbles" (shortened)
  9. Final CTA
- **Remove entirely:** SwimBuddz Gear section (store page already exists) and Upcoming Sessions & Events section (sessions nav link handles this)

**Step 2: Show prices on pricing tiers**
- File: `src/app/page.tsx` — `tiers` array
- Add price fields: Community = `₦20,000/year`, Club = `Contact us` (TBD), Academy = `Per cohort` (TBD)
- Add price display element below tier name
- Add value framing under Community: "That's less than ₦1,700/month"

**Step 3: Differentiate tier CTAs**
- File: `src/app/page.tsx` — tier card rendering
- Community → "Start with Community"
- Club → "Start Training"
- Academy → "Apply for Next Cohort"
- Trim feature lists to 5 items each per the guide

**Step 4: Testimonials — add real names/photos + transformation context**
- File: `src/app/page.tsx` — `testimonials` array
- Add `name`, `since`, `initials` fields (use initials as avatar placeholders until real photos available)
- Rewrite quotes to show transformation journey per advisor insights
- Add circular avatar with initials to each testimonial card

**Step 5: Copy rewrite — emotion-led messaging (P0 per advisor)**
- File: `src/app/page.tsx`
- Hero subtitle: Add emotion-led line — "Your swimming journey starts with people who understand."
- Hero social proof: Add "Join 60+ swimmers in Lagos" below subtitle
- Audience card descriptions: Update to emotion-led alternatives from guide
- Rename "Competitive / Ocean Curious" → "Advanced & Open Water"
- Hero primary CTA: "Join SwimBuddz" → "Join Free"

### Phase 2: P1 — Community & Navigation

**Step 6: Build Community Spotlight section (NEW)**
- File: Create `src/app/page.tsx` (inline section, matching existing pattern)
- Layout: Featured "Volunteer of the Month" card + 3 smaller contributor cards + impact counter
- Data: Initially hardcoded with placeholder data, uses same `VolunteersApi.getSpotlight()` pattern from community page
- Placed between "How It Works" and "Testimonials" in the page

**Step 7: Hero section changes**
- File: `src/app/page.tsx`
- Add social proof "Join 60+ swimmers in Lagos" (already done in Step 5)
- Primary CTA: "Join Free" (already done in Step 5)
- Add "Nigeria's first swimming community" trust signal per advisor

**Step 8: Audience cards — make clickable + add CTAs**
- File: `src/app/page.tsx`
- Wrap each card in `<Link>` to relevant program page
- Add "Learn more →" text link at bottom of each card
- Add `link` field to `whoSwimBudzIsFor` data

**Step 9: Navigation simplification**
- File: `src/components/layout/Header.tsx`
- For logged-out: Consolidate nav items, add "Community" link, add "Store" link
- Rename "Join" button → "Join Free"
- Move Tips inside Programs dropdown as "Tips & Resources"
- Remove Gallery from main nav (accessible via community photos section)

**Step 10: Final CTA refinements**
- File: `src/app/page.tsx`
- Change "Join SwimBuddz" → "Join Free Today"
- Remove "Learn More About Us" secondary CTA

### Phase 3: P2 — Polish

**Step 11: Bubbles section — add concrete examples + remove CTA**
- File: `src/app/page.tsx`
- Add exchange rate examples: "Attend 1 session = 50 Bubbles"
- Remove "Join SwimBuddz" button from section

**Step 12: How It Works — Step 4 copy rewrite**
- File: `src/app/page.tsx`
- Step 4: "Grow With the Pod" → "See Real Progress"
- Update description to focus on user outcomes

**Step 13: Community Gallery — add captions**
- File: `src/app/page.tsx`
- Add semi-transparent caption overlays on 1-2 photos

## Files Modified
1. `swimbuddz-frontend/src/app/page.tsx` — Main homepage (major rewrite)
2. `swimbuddz-frontend/src/components/layout/Header.tsx` — Navigation changes

## Files NOT Modified (already exist and are sufficient)
- `(public)/store/page.tsx` — Store already exists
- `(public)/community/page.tsx` — Community page with volunteer spotlight already exists
- `(member)/community/volunteers/page.tsx` — Volunteer hub already exists
- `MainLayout.tsx` — Footer is fine as-is per guide

## Implementation Notes
- Keep homepage as a single `"use client"` component (matching existing pattern — not extracting into separate component files since the codebase doesn't use that pattern for the homepage)
- All changes are frontend-only — no backend changes needed
- Hardcode Community Spotlight data initially (backend volunteer spotlight API already exists but may not have data)
- Prices for Club and Academy are TBD — show "Contact us" / "Per cohort" until confirmed
- Use initials avatars for testimonials until real photos are collected
