# SwimBuddz Store: Kit Specifications

**Version:** 1.0
**Date:** May 2026
**Status:** Source of truth for all SwimBuddz-branded kits & bundles.
**Owner:** Store / Operations

---

## Purpose

This document is the canonical, costed specification for every SwimBuddz kit. It exists because:

- Marketing copy, supplier briefs, and frontend listings need a single agreed source.
- Kit prices and contents must be defensible against the underlying product cost basis.
- New kits get added and old kits get rebalanced — drift between code, DB, and copy is expensive.

When this doc and the prod database disagree, **prod wins** for prices/SKUs and **this doc wins** for intent (what the kit is, why it exists, what should be in it). Update both together.

Cross-references:
- Bundle/product seed data: [scripts/seed/store_service.py](../../swimbuddz-backend/scripts/seed/store_service.py)
- Store data model: [STORE_ARCHITECTURE.md](./STORE_ARCHITECTURE.md)
- Supplier model: [SUPPLIER_SYSTEM.md](./SUPPLIER_SYSTEM.md)
- Bubbles equivalence: [docs/design/WALLET_SERVICE_DESIGN.md](../design/WALLET_SERVICE_DESIGN.md)

---

## Table of Contents

1. [Beginner Starter Kit](#1-beginner-starter-kit)
2. [Poolside First Aid Kit](#2-poolside-first-aid-kit)
3. [Image strategy for kits](#3-image-strategy-for-kits)
4. [AI composite hero — prompt templates](#4-ai-composite-hero--prompt-templates)
5. [Open questions & next steps](#5-open-questions--next-steps)

---

## 1. Beginner Starter Kit

**SKU prefix:** `SB-KIT-001`
**Slug:** `beginner-starter-kit`
**Category:** `kits-bundles`
**Status (prod):** active, `product_type=bundle`, `is_featured=true`
**Audience:** new adult learners and Academy enrolees (cohort starting kit).

### 1.1 Bill of materials (from prod)

| # | Component (prod name) | Slug | Qty | Sell ₦ | Cost ₦ |
|---|---|---|---:|---:|---:|
| 1 | Printed Silicone Swim Cap | `printed-silicone-swim-cap` | 1 | 5,000 | 1,100 |
| 2 | Transparent Anti-Fog Waterproof Swim Goggles with Earplugs | `anti-fog-waterproof-swim-goggles-with-earplugs` | 1 | 9,000 | 2,643 |
| 3 | EVA Silicone Swim Goggle Case | `eva-silicone-swim-goggle-case` | 1 | 3,500 | 1,248 |
| 4 | Professional Silicone Nose Clip | `silicone-nose-clip` | 1 | 1,500 | 211 |
| 5 | EPE Foam Pool Noodle | `epe-foam-pool-noodle` | 1 | 4,000 | 1,731 |
| | **Sum if bought separately** | | | **23,000** | **6,933** |

### 1.2 Pricing

| | ₦ |
|---|---:|
| Bundle base price | **20,000** |
| Compare-at price | 23,000 |
| Customer saves | 3,000 (~13%) |
| Cost basis | 6,933 |
| Gross margin | 13,067 (**65.3%**) |

Member-tier discounts apply on top of base price (community 5% / club 10% / academy 15% — see [SUPPLIER_SYSTEM.md](./SUPPLIER_SYSTEM.md)).
Bubbles equivalence: ₦20,000 ≈ **200 🫧** at the standard ₦100 = 1 🫧 rate.

### 1.3 Out-of-scope additions (kickboard, sunscreen)

Both were considered for inclusion. Decisions:

**Kickboard — recommend NOT including in this kit.**
- Three kickboards exist in prod (`swimbuddz-training-kickboard`, `swimbuddz-pro-kickboard`, `swimbuddz-kids-kickboard`, all ₦9,500–10,000).
- Adding a ₦10,000 kickboard pushes the kit's compare-at to ₦33,000 and bundle price would land at ~₦28,000–29,000 — a different price point and a different audience (already-training swimmer, not absolute beginner).
- Better as a separate **"Cohort Trainee Kit" (SB-KIT-003)** — see [section 5](#5-open-questions--next-steps).

**Sunscreen — cannot be included today.**
- Prod has 0 products in the `sun-protection` category (verified May 2026 against `store_products`). Nothing to add yet.
- Once a swim-grade reef-safe sunscreen SKU is sourced and added (target ₦3,000–5,000 retail), it should sit in a dedicated **"Outdoor Pool Kit"** rather than the indoor-pool starter, because most Lagos club-tier pools are indoor or shaded. Sunscreen is a high-priority addition for community-pool / open-water audiences.

> **Action required to add sunscreen to any kit:** source SKU → add to `PRODUCTS_DATA` in seed → migrate → re-evaluate kit composition. Until then, kits cannot reference it.

### 1.4 Image plan (see [section 3](#3-image-strategy-for-kits) for details)

- **Hero (primary):** AI-generated composite of all 5 components on a SwimBuddz-branded backdrop. Prompt template in [section 4](#4-ai-composite-hero--prompt-templates).
- **Gallery 2–6:** primary image of each constituent SKU, pulled directly from each component's `store_product_images` row. Order: cap, goggles, case, nose clip, noodle.
- **Gallery 7 (optional):** poolside lifestyle shot with the kit laid out on a teak deck.

**Today's state:** the prod kit row has 1 placeholder image (`picsum.photos/seed/beginner-starter-kit/600/600`). Replace before launch.

### 1.5 Marketing copy (current)

- **Description:** "Everything a new swimmer needs to get started. This beginner-friendly bundle includes a silicone swim cap, anti-fog goggles with earplugs, a protective goggle case, a nose clip, and a foam pool noodle for flotation support. Save over 10% compared to buying each item separately."
- **Short:** "Complete starter bundle for new swimmers — cap, goggles, case, nose clip & noodle"

Update with each composition change.

---

## 2. Poolside First Aid Kit

**SKU prefix:** `SB-KIT-002`
**Slug:** `poolside-first-aid-kit`
**Category:** `kits-bundles`
**Status (prod):** active, `product_type=standard` (⚠ should be `bundle` once components are SKU'd — see [section 5](#5-open-questions--next-steps))
**Audience:** swimmers, parents, and especially coaches/lifeguards. Also relevant to pool partners as a venue compliance item ([POOL_PARTNERSHIP_AGREEMENT.md](../company/POOL_PARTNERSHIP_AGREEMENT.md)).

### 2.1 Pricing (current, in prod)

| | ₦ |
|---|---:|
| Base price | **12,000** |
| Compare-at price | — |
| Cost basis (target) | 4,500 |
| Gross margin (target) | 7,500 (**62.5%**) |

> **Cost reality check:** the ₦4,500 cost only holds if assembled in-house from bulk-sourced components. A pre-packaged off-the-shelf kit with the same contents will land at ₦5,500–6,500 cost, dropping margin to ~50%. Revisit retail when sourcing SKU is finalised.

### 2.2 Bill of materials (recommended)

Anchored on (a) common pool-side incidents — slips on wet decks, chlorine eye irritation, swimmer's ear, scrapes from starting blocks, cramps; and (b) the partnership requirement that venues stock first-aid to local regulatory standards.

**Wound care**

| # | Item | Qty | Notes |
|---|---|---:|---|
| 1 | Waterproof adhesive bandages (assorted sizes) | 12 pcs | Most-used item — stock generously |
| 2 | Sterile gauze pads (10×10 cm) | 5 pcs | For larger abrasions |
| 3 | Medical tape (1.25 cm × 5 m) | 1 roll | To secure gauze |
| 4 | Antiseptic wipes (chlorhexidine, alcohol-free) | 10 pcs | Alcohol-free for kid-safe use |
| 5 | Povidone-iodine sachets (1 g) | 5 pcs | Primary topical antiseptic |

**Ear / eye / nose** (pool-specific)

| # | Item | Qty | Notes |
|---|---|---:|---|
| 6 | Ear drying drops (isopropyl + glycerin), 10 ml | 1 | Prevents swimmer's ear |
| 7 | Sterile saline eye wash, 30 ml | 1 | Chlorine flush |
| 8 | Cotton swabs | 10 pcs | |

**Cramp / impact**

| # | Item | Qty | Notes |
|---|---|---:|---|
| 9 | Single-use instant cold pack | 1 | Chemical, no fridge needed |
| 10 | Pain relief gel (menthol/methyl salicylate), 25 ml | 1 | Topical only |
| 11 | Crepe elastic bandage, 5 cm | 1 | Sprains/strapping |

**Tools & safety**

| # | Item | Qty | Notes |
|---|---|---:|---|
| 12 | Stainless steel tweezers | 1 | |
| 13 | Blunt-tip safety scissors | 1 | |
| 14 | Nitrile gloves (size M) | 2 pairs | |
| 15 | Triangular bandage / sling | 1 | Arm support |
| 16 | Whistle | 1 | Lifeguard signalling support |
| 17 | Laminated emergency procedure card | 1 | Pre-filled with SwimBuddz emergency contact + nearest hospital fields |
| 18 | Branded waterproof zip pouch | 1 | SwimBuddz wave + red cross |

**Total: 18 items.**

### 2.3 Explicit exclusions

The following must NOT be in the kit, both for liability reasons and to keep the kit truly "first aid" (immediate, non-prescription response):

- ❌ Oral / prescription medication (paracetamol, ibuprofen, antibiotics)
- ❌ Asthma inhalers
- ❌ EpiPens / adrenaline auto-injectors
- ❌ AEDs (defibrillators) — these are venue-level equipment, not bag-level
- ❌ Anything requiring refrigeration

State this on the PDP so coaches and parents understand what the kit covers and what they still need to bring personally.

### 2.4 Sourcing notes (for later procurement)

- **Two viable paths:**
  - **(a) Pre-packaged kit** — source a finished swim-specific kit from a supplier (Decathlon, AliExpress, Lagos pharma wholesalers). Faster to launch, ~₦5,500–6,500 cost, lower margin.
  - **(b) Self-assembled** — source each item individually in bulk, repackage into a SwimBuddz-branded pouch. Slower, ~₦4,500 cost, better margin and brand consistency. Recommended once volumes justify it.
- **Phase 1 plan:** start with (a) using a generic pouch; rebrand the pouch with SwimBuddz logo once first batch sells through.
- **Components 1–17 are NOT yet in the catalogue.** The seed file's `safety` category block is currently commented out. Sourcing each as an individual SKU would let the first-aid kit become a true `product_type=bundle` (composed of stocked components) — see [section 5](#5-open-questions--next-steps).
- **Regulatory:** confirm with a Lagos pharmacist that none of items 4–10 require a license to retail. Most are over-the-counter, but locally-sourced ear drying drops sometimes need a Form B.

### 2.5 Image plan (see [section 3](#3-image-strategy-for-kits))

- **Hero:** open zip pouch with all contents fanned out on a SwimBuddz-branded background. Pouch should display the SwimBuddz wave + red cross.
- **Gallery 2:** "what's inside" infographic — labelled callouts on every numbered item (great for the PDP, low-cost to produce).
- **Gallery 3:** lifestyle — pouch on a pool deck next to a coach's whistle and clipboard. Signals "every coach should carry one."
- **Gallery 4:** scale shot — pouch held in a hand to convey size.

**Today's state:** the prod row has 1 placeholder image (`picsum.photos/seed/poolside-first-aid-kit/600/600`). Replace before launch.

---

## 3. Image strategy for kits

Kit products are **composite SKUs** — they don't map to a single physical thing on a supplier's shelf. The image gallery should reflect this: a hero that shows the whole kit at a glance, plus close-ups of each constituent item so the customer can see exactly what they get.

**Recommended gallery composition (any kit):**

| Slot | Image | Source |
|---:|---|---|
| 1 (primary) | AI-composite hero showing all components on branded background | Generated (see [section 4](#4-ai-composite-hero--prompt-templates)) |
| 2 to N+1 | Primary image of each constituent SKU, in the same order as `store_bundle_items.sort_order` | Re-use existing `store_product_images` URLs from each component product |
| N+2 (optional) | Lifestyle / context shot | Original photography |
| N+3 (optional) | "What's inside" infographic with labels | Designed in Figma / Canva |

**Why this works:**
- The hero sells the bundle ("look how much you get").
- Per-component images build trust and let the customer evaluate each item — many buyers will treat the gallery as a fact-check.
- Re-using existing component images costs nothing and stays consistent with each component's own PDP.

**Implementation note:** the `store_product_images` table allows sharing URLs across products (the URL is a string, not an FK to a media asset). Inserting a row pointing the kit's `product_id` at a constituent's image URL is fine. If we later move to a media table with FKs, we'll need to re-think — but for now, copy the URL.

**Component image inventory (verified in prod, May 2026):**

| Component | Images available |
|---|---:|
| `printed-silicone-swim-cap` | 19 |
| `anti-fog-waterproof-swim-goggles-with-earplugs` | 11 |
| `silicone-nose-clip` | 11 |
| `eva-silicone-swim-goggle-case` | 6 |
| `epe-foam-pool-noodle` | 4 |

Plenty of supply for gallery composition.

---

## 4. AI composite hero — prompt templates

For the kit hero image, we want a single image showing all components arranged together on a clean, branded background. Two paths:

### 4.1 Path A — text-to-image (no reference inputs)

Use when generating from scratch. Best with Midjourney v6+, Imagen 3, DALL-E 3, Flux.

**Prompt template (Beginner Starter Kit):**

```
Professional product photography flat-lay of a swimming starter kit on a soft cyan-tinted white background. Five items arranged neatly with even spacing: a turquoise printed silicone swim cap (top centre), transparent large-frame anti-fog swim goggles with earplugs (top right), a black EVA semi-rigid goggle case (top left), a small white silicone nose clip (bottom left), and a coiled blue EPE foam pool noodle (bottom right). Soft top-down lighting, subtle shadows, clean composition, e-commerce style. 1:1 aspect ratio, high detail, photorealistic, sharp focus on every item. No text, no logos, no people.
```

**Prompt template (Poolside First Aid Kit):**

```
Professional product photography of an open swim-coach's first aid kit on a soft cyan-tinted white background. Compact dark-navy waterproof zip pouch open in centre. Contents fanned out neatly: assorted waterproof adhesive bandages, antiseptic wipes in white sachets, a small bottle of ear drying drops, a saline eye wash bottle, a single-use cold pack, a roll of medical tape, stainless steel tweezers, blunt-tip safety scissors, nitrile gloves, a triangular bandage, and a small whistle. Soft top-down lighting, even shadows, clean grid composition, e-commerce style. 1:1 aspect ratio, photorealistic, sharp focus. No text on items, no people.
```

**Negative prompt (where supported):** `text, watermark, logo, brand name, person, hand, blurry, low quality, plastic toys, cartoon, illustration`.

### 4.2 Path B — image-to-image / multi-reference composite

Use when you want the AI to honour the actual look of each component. Best with Google Gemini 2.5 ("Nano Banana"), Flux Kontext, Midjourney with `--cref`, or any tool that accepts multiple reference images.

**Setup:**
1. Download the primary image of each constituent SKU from the prod CloudFront URL (see [section 3](#3-image-strategy-for-kits) inventory).
2. Feed all 5 component images as references.
3. Use this prompt:

```
Compose these reference items into a single product flat-lay photograph. Arrange them on a soft cyan-tinted white background with even spacing. Match the exact appearance of each reference item — same colour, same shape, same texture. Top-down camera angle, soft daylight from upper-left, subtle shadows under each item, clean e-commerce composition. Output 1:1 square, photorealistic, sharp focus. Do not add text, logos, or new objects.
```

**Tips:**
- Generate 4 variants and pick the best.
- If items overlap awkwardly, regenerate with: "ensure no item overlaps another; maintain 2–3% padding between items."
- For the noodle (the longest item), explicitly say: "the pool noodle is shown coiled into a circle, not laid full-length."
- After generation, do a final cleanup pass in Photoshop / Affinity to align spacing and pure-white the background if needed.

### 4.3 Brand styling (apply to all hero images)

- **Background:** soft cyan tint (`#E8F7FB` to `#F4FCFE` gradient) or pure `#FFFFFF`. Match the homepage hero (`bg-gradient-to-br from-cyan-50 via-white to-blue-50`) so kit cards feel native to the site.
- **Aspect ratio:** 1:1 primary (matches `ProductCard` thumbnails). Generate a 4:5 or 3:4 secondary for mobile PDP viewports.
- **Logo overlay:** add SwimBuddz wordmark (bottom-right, 8% width, 60% opacity) post-generation — never baked into the prompt, so we can re-skin without re-generating.

---

## 5. Open questions & next steps

### 5.1 Database fixes

| Issue | Fix | Priority |
|---|---|---|
| `poolside-first-aid-kit` stored as `product_type=standard` instead of `bundle` | Source first-aid component SKUs → seed them → convert kit to `bundle` with `bundle_items` | P2 (cosmetic until components exist) |
| Both kits have `picsum.photos` placeholder hero images | Generate real heroes per [section 4](#4-ai-composite-hero--prompt-templates), upload to CloudFront, insert into `store_product_images` | **P0 — blocker for launch** |
| Kit galleries have only 1 image each; constituent components have 4–19 | Bulk-insert per-component primary image URLs into each kit's `store_product_images` rows (in `bundle_items.sort_order`) | P1 |

### 5.2 Catalogue gaps to source

| SKU need | Why | Used in |
|---|---|---|
| Sunscreen (reef-safe, swim-grade) | `sun-protection` category currently has 0 products | Future "Outdoor Pool Kit" |
| First-aid components (×17 SKUs from BOM in [section 2.2](#22-bill-of-materials-recommended)) | Lets first-aid kit become a true bundle, unlocks per-item Bubbles redemption | First Aid Kit |

### 5.3 Future kits (not yet built)

| Kit | Audience | Approx components | Approx price ₦ |
|---|---|---|---:|
| Cohort Trainee Kit (`SB-KIT-003`) | Active learners post-beginner | Cap + Speedo-tier goggles + case + nose clip + kickboard + pull buoy | ~28,000–32,000 |
| Outdoor Pool Kit (`SB-KIT-004`) | Community / open-water swimmers | Sunscreen + UV goggles + ear drying drops + lightweight towel | ~12,000–15,000 |
| Coach Day Kit (`SB-KIT-005`) | Coaches running sessions | First aid kit + whistle + waterproof clipboard + stopwatch | ~18,000–22,000 |

These should each get their own section in this doc when sourced and seeded.

---

*Last updated: 2026-05-05*
