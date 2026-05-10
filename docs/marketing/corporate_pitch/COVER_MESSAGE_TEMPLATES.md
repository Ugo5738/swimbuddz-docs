# Cover-message templates

The pitch PDF (`SwimBuddz_Corporate_Wellness_Pitch.pdf`) is **generic by design** — no company name on it — so it can be forwarded freely. The personalization happens in the **cover message** (email or WhatsApp text) that travels with the PDF.

Replace `[COMPANY]` and `[NAME]` placeholders before sending. The blocks below are paste-ready.

---

## A. You sending directly to an HR contact

### A1 — Email (cold or first contact)

> **Subject:** Adult swim wellness for [COMPANY] — 12-week cohort
>
> Hi [NAME],
>
> I run SwimBuddz, a swimming community building structured 12-week adult swim programs for working professionals in Lagos. Most of our learners never learned to swim, or learned badly as kids and gave up.
>
> I think this could be a useful addition to [COMPANY]'s wellness offering. Three reasons why:
>
> - Most wellness benefits go unused after Q1; structured cohorts have 75%+ completion
> - Lower-injury alternative to gym membership
> - Lifelong skill, group format, photogenic outcomes — useful for CSR / employer brand
>
> Attached: a short overview with pricing, logistics, and a pilot offer for the first 5 corporate partners.
>
> Worth a 20-minute call?
>
> Thanks,
> Daniel
> SwimBuddz
> swimbuddz@gmail.com · +234 703 358 8400
> instagram.com/swimbuddz · tiktok.com/swimbuddzglobe

### A2 — Email (warm intro / referred contact)

> **Subject:** Following up — SwimBuddz × [COMPANY]
>
> Hi [NAME],
>
> [REFERRER] suggested I reach out. I run SwimBuddz — a swim community running 12-week adult learn-to-swim cohorts for Lagos professionals.
>
> Quick context: most adults in Lagos never learned to swim or gave up as kids. Our cohorts run Saturday mornings at partner pools and end with measurable distance milestones. Around 75% of starters complete the program.
>
> Attached is our corporate overview — pricing, pilot offer, logistics. Happy to do a 20-minute call if it's worth a closer look at [COMPANY]'s wellness mix.
>
> Thanks,
> Daniel
> SwimBuddz
> swimbuddz@gmail.com · +234 703 358 8400

### A3 — WhatsApp (direct — keep short)

> Hi [NAME] — Daniel from SwimBuddz here. We run 12-week adult swim cohorts and I think it could fit [COMPANY]'s wellness budget. Sharing our corporate overview (pricing + pilot offer for the first 5 partners). 20-min call if you'd like to dig in?
>
> [attach PDF]
>
> swimbuddz@gmail.com · +234 703 358 8400

---

## B. A warm contact forwarding to *their* HR (give them this script)

When someone offers to introduce you internally, send them this so the forward writes itself. They paste, attach the PDF, change two fields. No drafting.

### B1 — For your contact to forward (email)

> **Subject:** Worth a look — SwimBuddz corporate wellness
>
> Hi [HR NAME],
>
> Forwarding this from a friend running SwimBuddz — they do 12-week adult learn-to-swim cohorts for Lagos professionals. Felt like a fit for what we're building on the wellness side at [COMPANY].
>
> Their corporate overview is attached. If you want to talk to them directly, Daniel's reachable on swimbuddz@gmail.com or +234 703 358 8400. Happy to introduce you on email if useful.
>
> Thanks,
> [YOUR FRIEND'S NAME]

### B2 — For your contact to forward (WhatsApp)

> Hey [HR NAME] — saw this and thought of you for [COMPANY]'s wellness side. SwimBuddz runs 12-week adult swim cohorts in Lagos. Founder is solid. Pitch deck attached. Want me to introduce you to him?
>
> [attach PDF]

---

## C. Follow-up sequences

If you don't hear back, send these (don't pile on; 7-day gaps are fine).

### C1 — Bump (Day 7, no reply)

> **Subject:** Re: Adult swim wellness for [COMPANY]
>
> Hi [NAME],
>
> Bumping this up in case it got buried. Happy to send the curriculum overview if that's more useful than a call.
>
> Thanks,
> Daniel

### C2 — Final (Day 14, no reply)

> **Subject:** Re: Adult swim wellness for [COMPANY]
>
> Hi [NAME],
>
> Last note from me — totally fine if it's not the right fit right now. If anyone else on your team is the better contact for wellness benefits, I'd appreciate a redirect.
>
> Thanks,
> Daniel

**Stop after 3.** If no reply, mark as cold and revisit in 6 months. (See `../CORPORATE_WELLNESS.md` Part 2 for the full sales-cycle playbook.)

---

## D. When to use a personalized PDF instead

Default: send the generic PDF. Personalize only when:

1. The contact is a **decision-maker** at a tier-1 target (Flutterwave, GTBank, Andela, etc.)
2. You're already several emails in and they've explicitly asked for a proposal
3. You're going into an in-person meeting and want a leave-behind

To generate a personalized version with `Prepared for [COMPANY]` on the cover:

```bash
cd docs/marketing/corporate_pitch
python3 build_pitch_pdf.py "Flutterwave"
# Outputs: SwimBuddz_Corporate_Wellness_Pitch_Flutterwave.pdf
```

For everyone else — the generic PDF, with a personalized email body, is faster and forwards better.
