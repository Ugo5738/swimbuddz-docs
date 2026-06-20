# Stroke Lab — VLM Coach & Component Architecture (Design)

**Status:** Design + working prototype (not yet wired into production)
**Owner:** Daniel (founder) + Engineering
**Last updated:** 2026-06-18
**Relationship to other docs:** Supersedes the *metrics-engine* direction in
[AI_SWIM_ANALYZER_DESIGN.md](./AI_SWIM_ANALYZER_DESIGN.md) (stroke-rate / body-roll /
breath numbers). The funnel, auth, storage and infra in
[STROKELAB_PUBLIC_ANALYZER_DESIGN.md](./STROKELAB_PUBLIC_ANALYZER_DESIGN.md) still hold.

---

## 1. Why we pivoted (measurement → coach's eye)

The original engine produced three numbers (stroke rate, body-roll proxy, breath
balance). Measured against a hand-labeled golden set, those numbers were **not
defensible**: the stroke-rate counter over-counted ~2×, the 2-D roll proxy was
unreliable, and breathing false-fired. The deeper finding (see project memory):

- **A vision LLM is good at qualitative judgment** ("dropped elbow at recovery",
  "is this side-on") but **bad at precise counting** (off 2–3× even when confident).
- So: stop asking the model to be a *calculator*; ask it to be a *coach's eye*.
  Give honest, frame-cited technique feedback + a few defensible observations,
  and **never** emit a stroke-rate/cadence number.

This is a **trust-first** product. The prime directive everywhere: **honesty over
helpfulness** — an honest "I can't coach this clip well" is a success; a
confident wrong critique is the worst possible output.

---

## 2. Architecture — a staged pipeline of plug-and-play components

The system is **components behind a shared interface**, run in stages. The MVP
coach is itself just *one component*, so the architecture is plug-and-play from
day one (build the simple thing as a component, don't monolith-then-refactor).

```
Stage 0 — INGEST & TRACK        (shared, local cv2, full video)
    decode (strided) → swimmer-box track → usability/quality signals
Stage 1 — SEGMENT / CLASSIFY    (shared) → the "map" of phase instances
    recovery #1..#N (frame spans), breath events, (later) catch/pull/kick
Stage 2 — ANALYZE               (components — independently toggleable)
    each component analyses the chunks/frames it consumes
Stage 3 — COLLATE               → UX sections + any derived metrics
```

**Layer split (Daniel's requirement):** Stage 1 (segment/classify — cheap) is
independent of Stage 2 (coach — expensive). Run Stage 1 alone to get *"here are
your 12 recoveries"*; trigger Stage 2 per instance on demand. **Default: all on;
each toggleable.**

### 2.1 Component contract (the plug-and-play unit)

Every analyzer implements one interface and emits **primitives**, not metrics:

```
Component:
  name:          str                    # e.g. "recovery_elbow"
  consumes:      Phase | "clip"         # which Stage-1 instances it needs
  granularity:   "frame" | "chunk"      # single key frame vs a multi-frame arc
  available(input_profile) -> bool      # is this assessable from THIS footage?
  run(chunks, context) -> Finding[]

Finding:
  component:      str
  instance_id:    int | None            # which recovery/breath, if per-instance
  observation:    str                   # the coaching point, plain language
  evidence_frames: [frame_idx | (start,end)]
  confidence:     float                 # honestly calibrated
  available:      bool                  # false => "can't see this from this angle"
```

**Three rules that keep plug-and-play honest** (bake in from day 1):
1. `confidence`, `available`, and `evidence_frames` are **mandatory** on every
   Finding — a new component cannot bluff.
2. **Availability is a function of the input**, not a static flag: an
   `above-water side-on` clip enables {body_line, recovery, head, breath};
   `underwater` enables {catch, pull, kick}. The pipeline asks the footage what
   it can support. This is how underwater is **built-in-but-dormant**, not thrown
   away.
3. Components emit primitives; **metrics are derived** by collators over
   primitives (Stage 3). New metric = new collator, no re-analysis.

---

## 3. Phases vs aspects, and the honest visibility taxonomy

Two orthogonal axes — don't conflate:
- **Phase** = where in the arm cycle (entry → catch → pull → recovery → breath).
  Drives Stage-1 segmentation.
- **Aspect** = the coachable thing reported. Drives Stage-2 components & UX.

From a **single side-on, above-water phone clip**:

| Visibility | Aspects | Notes |
|---|---|---|
| **Reliable** (coach freely) | body line, recovery/elbow, head position, breathing **side** | the strongest above-water signals |
| **Sometimes** (hedge, low conf) | entry/reach, body rotation | rotation lives between frames; crossover is a top-down fault, *not* reliably judgeable side-on |
| **Never** (honest-gap card → Academy hook) | catch, underwater pull, kick depth/timing, **stroke count / rate / cadence** | underwater or structurally non-defensible |

Catch/pull/kick = **dormant components** (`available=false`) until underwater
footage exists. Stroke rate is **banned** as a default output (see §6.3).

---

## 4. The Gate (3-tier, not binary)

The gate decides whether/how a clip can be coached. **Empirically, a binary
side-on/not gate cannot be made accurate** — the boundary between
"elevated-but-true-profile" (valid) and "rear-quarter/angled" (borderline) is too
fine. Golden-set grid (gate-voting, 3 votes; want normal/drills accept high,
degraded refuse high):

| model + prompt | normal | drills | degraded refused |
|---|---|---|---|
| nano + lenient | 13/15 | 8/8 | 3/16 |
| o4-mini + lenient | 15/15 | 6/8 | 1/16 |
| nano + **strict** | 11/15 | 6/8 | 7/16 |
| o4-mini + **strict** | **15/15** | 6/8 | 3/16 |

No config wins both axes. **But all 16 "degraded" clips are labeled `angled`
(borderline rear-quarter) — none are catastrophic.** A hard refuse of a
borderline-but-swimmer-visible clip is bad UX anyway. So:

**Decision — 3-tier gate**, driven by a **graded** gate output (`profile_quality:
clean | partial | poor` + catastrophic flags overhead/underwater/head-on), not a
binary `view`:
- **clean** → coach fully
- **partial / angled** → coach **with** a "film a truer side-on for sharper
  feedback" banner + lower confidence (soft, not refuse)
- **poor / overhead / underwater / head-on / non-freestyle** → hard refuse +
  credit refund + "how to film" guide

Use **gate-voting** (run the cheap gate N×, majority + agreement) — agreement
feeds the tier (split vote ⇒ borderline). **Gate model = o4-mini** (15/15 normal
accept; reasoning handles the borderline angle best).

> **Golden-set gap:** there are **no** catastrophic clips (overhead/underwater/
> head-on/non-freestyle) in the set, so the tier-3 *hard refuse* path is
> **unvalidated**. Add a handful before trusting it. The current
> `GATE_SYSTEM_PROMPT` is still binary and must be rewritten to the graded form.

---

## 5. The Coach (Stage-2 default component)

- **Model = gpt-4o** (locked by eval): across 34 accepted golden clips it
  produced **zero** honesty violations (no banned numbers, no faults on invisible
  aspects, no crossover, all citations valid), 2 fixes/clip, ~$0.023/clip.
  gpt-5-mini was 4× cheaper but **hallucinated 5 "crossover" faults** (a
  side-view-invisible fault) — rejected. gpt-5 (full) was unusable (empty/slow).
- Output schema (already built): view, stroke, usable, confidence (0–0.99),
  swimmer_count, summary, whats_working[], priority_fixes[] {fault, evidence,
  why_it_matters, drill}, honest_numbers {approx_cycles_seen, breathing_side},
  caveats[], coach_handoff. **Add** a closed-enum `area` to each fix (for the UX
  sections + share-cards).
- **Coach-trusts-gate:** the coach is told the gate already cleared the view, so
  it stops re-litigating angle (fixed the "accepted-but-uncoached" case). With
  the 3-tier gate, only tier-1/2 clips reach the coach.

---

## 6. Frames, instances, and the count question

### 6.1 MVP (today): sparse stills + one holistic pass
Selector picks ~8 swimmer-aware frames (full-frame, **not** cropped — cropping an
elevated angle reads as "overhead"; gate by swimmer size + motion-spread instead)
→ one coach call. Cheap, validated, shippable. *Not* as deep as the instance
model — it sees frozen instants, not arcs.

### 6.2 v2: instance segmentation (Daniel's model — the right upgrade)
Process the **full video**; detect **every recovery instance** as a multi-frame
**chunk** (hand exits water → over head → re-entry). Then:
- **Default-coach 1–2 representative instances**; let the user **drill into any
  specific instance on demand** (pay-per-inspect). Do **not** auto-VLM all 20
  recoveries — cost ×20 and mostly redundant.
- **Granularity per component:** recovery = chunk (the arc); hand-entry = single
  frame; body-line = glide frame.
- **The payoff is consistency/fatigue**, which a holistic pass *cannot* see:
  *"recovery is clean early but the elbow drops on the last third — you're
  fatiguing."* This is the real reason to build instances.

### 6.3 Counting & "stroke rate"
- **"How many recoveries" is allowed IF validated** — it's a count of discrete,
  visible over-water events (more defensible than a rate). The golden keys have
  `recovery_times`; **validate the detector against them with an accuracy gate
  before shipping the instance UX** (else "Recovery #4" is mislabeled and every
  drilldown is wrong — the make-or-break).
- **Stroke rate stays banned** as a default. A *gated, validated* rough tempo
  (recoveries ÷ duration, shown only if detector error < threshold, as a band) is
  a possible v3 — never a default promise.

**Built (the layered model — `pipeline/`):** the VLM **classifies every strip
frame** in one call — `phase` (recovery/entry/glide/breath/indeterminate) + `arm`
(near/far) + recovery `subphase` (exit/mid/entry) — and **every label is stored**
(no data discarded, for fine-tuning/expansion). A pure-code grouper
(`group_phase_instances`) turns the labels into per-phase, **per-arm** `Instance`
chunks — recovery split near vs far (the far arm is kept as its own chunks, not
thrown away), splash doubles merged, smoothed. **The segment stage does NO
counting**: it only classifies + groups + persists. Counting lives in the **Stage-3
`collate` component**, which derives the hedged *"~N near-arm recoveries"* (near
arm == stroke_cycles, 1:1) + per-phase counts from the instances — deterministic,
free, re-derivable. Count accuracy is ~53% within ±1 on the golden set, so the
copy always hedges (`~N`), never a hard number.

---

## 7. Cost & provider-agnosticism

- Agnostic via **LiteLLM** (`providers/base.call_vlm`) — swap a model string to
  move OpenAI → Claude → Gemini → open-weights (Qwen2.5-VL). Stills, not native
  video (provider-portable + cheaper).
- **Per-layer model pick:** gate = o4-mini (reasoning; ~$0.005/call, needs
  `max_tokens≥1500` + temperature dropped); coach = gpt-4o (~$0.023/clip).
  gpt-4o-mini is **unusable** for vision (image-token inflation + schema-parrot).
- **Rate-limit backoff** (`num_retries`) is in `call_vlm` — the org's gpt-4o cap
  is only 30k TPM; production will hit it.
- Tier A (hosted) now → Tier B/C (self-host/serverless open-weights) once volume
  justifies it. The moat is data + funnel + rubric, **not** the model.

---

## 8. Storage & UX (next phase)

- **Areas-of-analysis UX:** fixed section scaffold (Body line · Recovery/elbow ·
  Head & breathing · Entry · Catch & pull · Kick) in the same order every time;
  each section bound to its **evidence frame(s)**; invisible aspects show a
  neutral "can't see from above water — a coach in the pool can" card (the
  Academy hook). Refusal = a *success* state (refund + "how to film").
- **Share-cards** (`coach/cards.py`, built): each finding → a branded 9:16/1:1
  image (evidence frame + area pill + fault + brand). Server-rendered (cv2).
- **Persistence (built):** the worker stores the whole run on
  `AnalysisResult.coach_result` (JSON: `engine_version`, serialized `PipelineResult`,
  the VLM `cache` incl. every per-frame label + instances, and `evidence_keys` /
  `share_keys`). Evidence frames + share-cards upload to the per-env Supabase
  bucket; the result page resolves `<component>:<index>` citations → signed URLs.
  The `cache` doubles as the **run-store-reuse** ledger — re-running a stored clip
  replays the paid VLM outputs for **$0**.
- **`swim_frame_labels` table (built):** every classified frame is *also*
  normalized into its own table (`job_id`, `frame_index`, `timestamp_s`, `phase`,
  `arm`, `subphase`, `conf`, `engine_version`) so the classification corpus is
  **queryable** for analytics + future fine-tuning — not locked inside JSON.
  phase/arm/subphase are plain strings (not a DB enum) so the label vocabulary can
  grow without a migration. Idempotent on re-run (replace-by-`job_id`).
- **Open:** **consent + retention** model for storing real-swimmer images +
  labels (erasure must sweep cards, evidence, and the frame-label rows — the
  job-FK `ON DELETE CASCADE` already covers labels).

---

## 9. Roadmap

- **v1 (ship): MVP holistic coach as a component** — sparse-frame selection +
  3-tier gate (graded prompt) + gpt-4o coach, wired into the worker + a result
  page with evidence-frame sections. Gate it on the golden-set eval
  (`validation/coach_eval.py`).
- **v2: instances** — Stage 0/1 (track + **validated** recovery segmenter) +
  per-instance drilldown + the **consistency/fatigue** metric + share-cards +
  persistence/consent.
- **v3: extend** — underwater components flip to `available`; gated/validated
  recovery-tempo; open-weights model for unit-cost.

---

## 10. Open decisions / gaps

1. **Golden-set gap** — add catastrophic clips (overhead/underwater/head-on/
   non-freestyle) so the tier-3 refuse path is validated.
2. **Rewrite `GATE_SYSTEM_PROMPT`** from binary `view` to graded `profile_quality`
   + catastrophic flags; pick tier thresholds off profile_quality + agreement.
3. **Consent/retention** for storing real-swimmer frames + share-cards.
4. ~~Worker wiring + DB migration~~ **(done)** — pipeline runs in the worker;
   `coach_result` JSON + the normalized `swim_frame_labels` table both persist.
5. Recovery-detector accuracy gate (vs `recovery_times`) before the instance UX.

---

## 11. What exists today (built)

**Primitives — `services/ai_service/coach/`:** `frames.py` (key-frame + strip
extraction), `select.py` (YOLO/motion swimmer detection + gate-by-size +
motion-spread, full-frame), `prompt.py` (coach rubric + honesty gates), `coach.py`
(`run_coach`, `run_gate` + voting, `analyze`, coach-trusts-gate), `classify.py`
(per-frame phase+arm+subphase classifier, one call), `cards.py` (share-card
render), `providers/base.call_vlm` (agnostic vision + cost + retries).

**Pipeline framework — `services/ai_service/pipeline/`:** `types.py` (contracts:
`Instance` now carries `arm`), `component.py` (the interface +
`available()`/`unavailable_reason`), `registry.py`, `runner.py` (gate → tier →
enabled+available components; unavailable → honest card), `segment.py`
(`group_phase_instances` — classify→group all phases, recovery per arm),
`store.py` (run-store-reuse), and `components/`: `gate`, `phase_segment` (Stage 1,
no counting), `recovery_coach` (Stage 2), `holistic_coach` (Stage 2), `collate`
(Stage 3, counts), and the dormant underwater `catch`/`pull`/`flutter_kick`.
**`defaults.py` is the control file** — the flow + every per-component toggle.

**Wired into production:** the worker (`tasks/analyze.py`) runs the pipeline
best-effort after the metrics pass, uploads evidence + share-cards, and persists
`coach_result` JSON + the normalized `swim_frame_labels` rows; the public result
page (`swimbuddz-analyzer/.../r/[jobId]`) renders the coach sections with evidence
thumbnails + share links. Toggles in `libs/common/config.py`
(`STROKELAB_COACH_*`). Eval harnesses: `validation/coach_eval.py` (coach golden
set), `validation/recovery_eval.py` (recovery count, motion vs VLM). No-API unit
tests cover the framework (`pipeline/tests/`, 20 passing).
