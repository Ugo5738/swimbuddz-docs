# Stroke Lab — VLM Coach & Component Architecture (Design)

**Status:** Stage 1 shipped to production; Stage 2 (goal-aware aspect analyzers) designed & approved — see §12
**Owner:** Daniel (founder) + Engineering
**Last updated:** 2026-06-21
**Relationship to other docs:** Supersedes the *metrics-engine* direction in
[AI_SWIM_ANALYZER_DESIGN.md](./AI_SWIM_ANALYZER_DESIGN.md) (stroke-rate / body-roll /
breath numbers). The funnel, auth, storage and infra in
[STROKELAB_PUBLIC_ANALYZER_DESIGN.md](./STROKELAB_PUBLIC_ANALYZER_DESIGN.md) still hold.
The coaching rubric is now anchored by
[STROKELAB_TI_COACHING_KNOWLEDGE_BANK.md](./STROKELAB_TI_COACHING_KNOWLEDGE_BANK.md).

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
- **v2: full goal-aware aspect set** *(designed — see §12)* — `body_line` +
  `head_breathing` + `entry_reach` analyzers (plus the promoted `recovery_elbow`),
  the `CoachContext` discipline steer (soft prompt clause + deterministic
  `grade()`), share-cards + persistence/consent.
- **v2.5: per-instance drilldown** *(GATED, §12.5)* — unlocks the
  `POST /ai/analyze/{job_id}/inspect` endpoint + the **consistency/fatigue** metric
  **only** once `validation/recovery_eval.py` count accuracy clears ~80% within ±1.
- **v3: extend** — underwater components flip to `available`; gated/validated
  recovery-tempo; open-weights model for unit-cost.

---

## 10. Open decisions / gaps

1. **Golden-set gap** — add catastrophic clips (overhead/underwater/head-on/
   non-freestyle) so the tier-3 refuse path is validated.
2. **Rewrite `GATE_SYSTEM_PROMPT`** from binary `view` to graded `profile_quality`
   + catastrophic flags; pick tier thresholds off profile_quality + agreement.
3. **Consent/retention** for storing real-swimmer frames + share-cards — now also
   covers `goal_text` (free-text PII); see §12.7.5.
4. ~~Worker wiring + DB migration~~ **(done)** — pipeline runs in the worker;
   `coach_result` JSON + the normalized `swim_frame_labels` table both persist.
5. Recovery-detector accuracy gate (vs `recovery_times`) before the instance UX —
   this is the **~80% within ±1** bar that gates §12.5 drilldown.
6. **Scrub "crossover"** from `coach/prompt.py` `_SYSTEM_PROMPT_BODY`'s can-see list
   so holistic and the new `entry_reach` analyzer agree (§12.1 note).
7. **Stage-2 full aspect set + goal-awareness** — the design to approve is §12.

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

---

## 12. Stage-2 — the full goal-aware aspect analyzer set (design to approve)

**Status:** Approved design, not yet built. Supersedes the single-`holistic_coach`
Stage-2 with a full set of focused, plug-and-play aspect Components steered by the
swimmer's goal. Founder decisions are locked (see §12.0); this section is how we
build *within* them.

### 12.0 Locked decisions this design implements

1. **Full aspect set.** One independent `Component` per coachable aspect —
   `body_line`, `recovery_elbow` (the existing `recovery_coach`, promoted),
   `head_breathing`, `entry_reach` — plus `catch`/`pull`/`flutter_kick` which stay
   **dormant** (`profiles=(UNDERWATER,)`). No mega-prompt fold-in: each aspect is a
   real Component so per-aspect honesty gating and drilldown stay clean.
2. **Goal-aware coaching.** The frontend passes the swimmer's `discipline`
   (sprint | distance | general). Discipline steers coaching in **two split
   places**: a soft *prompt clause* (phrasing/drill only — the only thing that
   touches the paid call) and a deterministic *code re-grade* (`pipeline/grade.py`)
   that maps an already-honest closed-enum verdict → severity/rank by discipline.
   The VLM's perception stays discipline-blind; discipline only changes how a
   visible truth is *graded and framed*.
3. **Representative now, per-instance drilldown later.** Each analyzer coaches ONE
   representative instance at MVP. True per-instance drilldown ("inspect recovery
   #N", fatigue trend) is **designed-for but GATED** on segmentation count accuracy
   clearing **~80% within ±1** (currently ~53% per `validation/recovery_eval.py`).
   No rubric rewrite unlocks it — only lifting `max_coached_recoveries` and a
   pay-per-inspect endpoint.
4. **Cost ceiling.** Recommended **$0.06/clip** hard cap, enforced in the worker.
   See §12.4.

### 12.1 The full analyzer set

All analyzers consume Stage-1 `Instance`s already on `ctx.instances` (per-phase,
per-arm). They re-use the validated classifier phases only — note
`coach/classify.py` emits **`recovery / entry / glide_extension / breath /
indeterminate`** and **never a catch/pull phase**, which is exactly why the
underwater components can never be fed bad data side-on.

| Component (`name`) | Aspect | Consumes (`Phase`) | Granularity | Visible side-on | Closed-enum output | `area` bucket | Honesty gate |
|---|---|---|---|---|---|---|---|
| `body_line` | Head/hip/leg sink, pike, arch — horizontal balance | `GLIDE` (fallback: lowest-motion key frame near a glide peak) | `FRAME` | **yes** | `body_line ∈ {flat, hips_low, legs_low, piked, arched, unclear}` | `body_line` | Must see the waterline cutting the *side* of the body. Consume a **GLIDE** frame, never a BREATH frame (a head-up breath transiently lifts the hips → false `hips_low`). Prompt: "ignore any frame where the head is turned to breathe." No clear glide frame → `unclear`, no fault, conf ≤ 0.4. |
| `recovery_elbow` (promote existing `recovery_coach`) | Over-water elbow: high / dropped / wide | `RECOVERY`, `arm="near"` (fallback far) | `CHUNK` | **yes** | `elbow ∈ {high, dropped, wide, unclear}` (unchanged) | `recovery_elbow` | Judge over the multi-frame arc, not one frozen frame. Absent recoveries → **zero findings** (honest, already implemented). Far-arm read carries lower confidence + caveat. |
| `head_breathing` | Head carriage (neutral/down vs lifted) + breath **side** | `BREATH` (side); `GLIDE` fallback for resting head | `FRAME` | **yes** | `head ∈ {neutral, lifted, unclear}`; `breath_side ∈ {left, right, both, none_seen}` | `head_breath` | `breath_side` ONLY if a frame actually shows the head turned mid-breath; else `none_seen`. **Never** a breaths-per-length / rhythm / cadence number or a "you only breathe right" *fault*. Head cropped/ambiguous → `unclear`. |
| `entry_reach` | Hand entry & front extension: clean / short / over-reach | `ENTRY` (+ adjacent `GLIDE` for extension) | `FRAME` | **partial** | `entry ∈ {clean_extended, short, overreach, unclear}` — **no crossover value** | `entry_reach` | Hardest gate. **Crossover is structurally excluded** (no enum value + explicit in-prompt ban: "side-on CANNOT judge cross-midline"). Reach judged only relative to the head. Default `unclear`, confidence ≤ 0.5. |
| `catch` *(dormant)* | High-elbow catch / EVF | `CATCH` | `CHUNK` | **no** | unavailable card | `catch_pull` | `profiles=(UNDERWATER,)` → runner emits honest-gap card. Never coached side-on. |
| `pull` *(dormant)* | Underwater pull path (S vs straight) | `PULL` | `CHUNK` | **no** | unavailable card | `catch_pull` | Underwater → honest-gap card. |
| `flutter_kick` *(dormant)* | Kick depth / amplitude / 2-4-6-beat timing | `CLIP` | `CHUNK` | **no** | unavailable card | `kick` | Underwater/between-frames → honest-gap card. Carries discipline-flavoured Academy-hook copy (sprint 6-beat vs distance 2-beat) — **copy only, no verdict**. |

`area` strings are the **existing** `coach/cards.py:AREA_LABELS` keys
(`head_breath`, `entry_reach` — *not* `head_breathing`/`entry`), so share-cards and
the result-page scaffold work unchanged.

**Killed verdicts (never emit, even when goal "wants" them):** crossover/midline
at entry; a confident sprint "dead-spot / front-quad stall" *fault* judged from
stills (a pause lives **between** frames — allowed only as a hedged ≤0.5 info note
requiring frames that show a *held, fully-extended* front arm); body-rotation
magnitude/degrees; breathing rhythm/frequency/bilateral *pattern* fault; any
above-water catch/pull-shape/kick-depth/timing verdict; any hard stroke
count/SPM/cadence number (only the collate `~N (approximate)` hedge survives).

> **Scrub the shipped holistic prompt:** `coach/prompt.py` `_SYSTEM_PROMPT_BODY`
> still lists "an overreaching or **crossover** entry" in its can-see list — this
> contradicts §3 and the §5 finding that gpt-5-mini was rejected for hallucinating
> crossover. Remove "crossover" from that line so holistic and the new
> `entry_reach` analyzer agree. (Tracked in §10.)

### 12.2 CoachContext schema + flow (minimal input, biggest lift)

One required field carries almost all the value. A small frozen dataclass in
`pipeline/types.py` (import-light — plain `str`, no cv2/litellm):

```python
@dataclass(frozen=True)
class CoachContext:
    discipline: str = "general"      # "sprint" | "distance" | "general"  (REQUIRED at API; default general)
    level: Optional[str] = None      # "beginner" | "intermediate" | "advanced"  (tunes drill/tone only)
    focus_area: Optional[str] = None # "body_line" | "recovery_elbow" | "head_breath" | "entry_reach"  (forces rank-1)
    goal_text: Optional[str] = None  # free-text ≤200 chars; tone-only, fenced, never an observation
```

Added to `RunContext`:
`coaching: CoachContext = field(default_factory=CoachContext)`. Every existing
component (gate/segment/collate/underwater) ignores it and is unaffected — the
`general` default reproduces today's behaviour exactly.

**End-to-end flow:**

```
Frontend (swimbuddz-analyzer page.tsx): Distance is the active public choice and
  submits the TI-informed efficiency model. Sprint remains visible but disabled
  as "coming soon"; General is hidden from the public selector. The API enum still
  accepts sprint/distance/general for compatibility and future activation.
    │  publicAnalyzer.ts createPublicAnalysis(): fd.append("discipline", …) etc.
    ▼
API  routers/public.py create_public_analysis_job  (+ member path routers/analyze.py):
  new Form() params, validated against the closed enum (fallback "general"), goal_text
  clamped ≤200 chars. Persist to NEW typed columns on AnalysisJob (swim_analysis_jobs):
    discipline String(16) NOT NULL server_default "general"   ← typed, like stroke_type String(20)
    level      String(16) NULL
    focus_area String(24) NULL
    goal_text  String(200) NULL
  Migration via ./scripts/db/migrate.sh ai_service  (NEVER hand-written); review the
  generated file; confirm ai_service alembic env.py SERVICE_TABLES (swim_analysis_jobs).
    ▼
Worker tasks/analyze.py: analyze_swim_video reads job.discipline/level/focus_area/
  goal_text (alongside the stroke_type/source it already pulls) and passes them into
  _run_coach_pipeline(video_path, coach_context=CoachContext(...)). NOTE: today
  _run_coach_pipeline takes only video_path — add the kwarg.
    ▼
RunContext: ctx.coaching = coach_context  (set where ctx is built, ~analyze.py:310).
    ▼
Each analyzer.run(ctx):
  (1) PROMPT (soft, paid): coach/rubric.py build_goal_block(ctx.coaching) appends a
      discipline clause to that analyzer's system prompt (mirrors how _gate_note is
      appended in coach.py). It steers PHRASING/DRILL only and explicitly states it
      "MUST NOT make you see a fault not in the frames — judge the frames honestly
      first." goal_text is fenced: "Swimmer's stated goal, for tone only, not an
      observation: <text>".
  (2) GRADE (hard, $0): pipeline/grade.py grade(verdict, ctx.coaching) → (severity, rank)
      re-maps the already-honest closed-enum verdict by discipline. Deterministic.
```

**Cache-safety / free re-grade:** discipline is **NOT** part of the VLM cache key —
the paid verdict is discipline-blind. So a swimmer can re-run "as a sprinter" vs
"as a distance swimmer" and `grade()` re-prioritises from the SAME cached verdicts
for **$0** (run-store-reuse). `focus_area` bumps its analyzer to rank-1 and
`coach_detail="high"`; honesty gates always beat discipline.

### 12.3 Discipline rubric matrix (discipline-dependent aspects only)

`grade()` maps `(verdict, discipline)` → `(severity, rank)`; the prompt clause
swaps the *advice framing*. Faults that are wrong for everyone are
**discipline-neutral** (graded identically).

| Aspect / verdict | sprint | distance | general | Advice shift |
|---|---|---|---|---|
| **`body_line`** `hips_low`/`legs_low`/`piked`/`arched` | FIX (high, below propulsion) | **FIX, rank-1** | **FIX, rank-1** | "even a sprint dies if the hips drag" vs "this is what tires you out over the lap" |
| `body_line` `flat` | STRENGTH | STRENGTH | STRENGTH | neutral; a ruler-still line w/ zero roll → INFO for sprint only ("fine for a blast, limits reach over distance"), never a fault |
| **`recovery_elbow`** `dropped` | **FIX** | **FIX** | **FIX** | *Neutral fault.* sprint: "lead with the elbow, keep it quick"; distance: "fingertip-drag / zipper drill, relaxed" |
| `recovery_elbow` `wide` | INFO (sprinters trade width for tempo) | **FIX** | FIX | sprint downgrades `wide` unless a true shoulder-stress swing |
| `recovery_elbow` `high` | STRENGTH | STRENGTH | STRENGTH | neutral |
| **`head_breathing`** `lifted` head | **FIX** | **FIX** | **FIX** | *Neutral fault* (sinks legs). Highest-impact adult fault. |
| `head_breathing` `breath_side` one-sided | not a fault (INFO) | INFO + gentle bilateral nudge | INFO | sprint: one-sided is legitimate; distance: "bilateral helps you swim straighter" — a **side observation**, never a rhythm/pattern fault |
| **`entry_reach`** `clean_extended` (long front extension) | **the flip:** held long extension → hedged INFO note "watch for a dead-spot; start the catch sooner" (≤0.5 conf, never a hard FIX) | **STRENGTH** "lovely long reach — free distance per stroke" | STRENGTH | the headline goal-awareness case |
| `entry_reach` `short` | INFO (fine for high tempo) | FIX (gentle reach cue) | FIX | flips opposite to the long-extension case |
| `entry_reach` `overreach` | INFO ("reaching past, keep it in front of the shoulder") | INFO | INFO | coached as info only — **never** as "crossover" |

**Discipline-neutral aspects** (no matrix; graded the same for all three): every
`*_low`/`piked`/`arched` body-line fault, `dropped` elbow, `lifted` head, and all
dormant underwater cards. `general` = the most conservative grading and is the
default whenever the swimmer doesn't pick.

### 12.4 Cost model

Shared stages (gate, segment) are run **once** and read by every aspect — the
aspect count does **not** multiply cost. Per clip, representative mode (MVP):

| Stage | Calls | ~Cost | Notes |
|---|---|---|---|
| gate | 3 votes (o4-mini, low) | ~$0.005 | REFUSE short-circuits **all** aspect cost |
| phase_segment | 1 logical (gpt-4o, low, batched) | ~$0.006–0.012 | **shared** by all aspects (they read `ctx.instances`) |
| `recovery_elbow` | 1 (chunk arc, auto) | ~$0.012 | the one chunk-granularity aspect |
| `body_line` + `head_breathing` + `entry_reach` | **1 batched** (low detail, multi-question json_object) | ~$0.008 | three single-frame aspects share ONE call |
| `holistic_coach` | 1 (8 key frames, auto) — *optional* | ~$0.023 | safety-net narrative during rollout; **retire** once aspects are eval-clean |
| collate + dormant | 0 | $0 | deterministic / unavailable cards |

- **With holistic ON (rollout):** ~$0.05–0.06/clip.
- **Aspect-only (holistic retired):** ~$0.035/clip.

**Recommended default ceiling: $0.06/clip**, enforced in the worker (sum
`result.total_cost_usd`; if a clip projects over, drop to representative-only + skip
holistic and emit a "not analyzed (budget)" info card rather than a fake verdict).
Economics check: the **$6 Single** pack ≈ huge margin; the **$59 Coach** pack (25
clips) ≈ ~$1.50–2.00 VLM cost.

**Levers, cheapest first:** (a) **batch** `body_line`+`head_breathing`+`entry_reach`
into one VLM call (biggest win — 3 calls → 1); (b) representative-only
(`max_coached_recoveries=1`, one rep per aspect) — already the default;
(c) `image_detail="low"` on every single-frame aspect (recovery's arc + the gate
keep `auto`); (d) **gate-skip** — REFUSE pays only the ~$0.005 gate; (e)
**run-store-reuse** — re-grade by discipline, drilldown, and re-runs replay cached
verdicts for $0; (f) **retire `holistic_coach`** once aspects cover its surface
(biggest single line item); (g) later, swap segment/aspect model to open-weights
(Qwen2.5-VL) for unit cost. **Drilldown is pay-per-inspect** (1 aspect call per
inspected instance, billed to the user) so it never counts against the per-clip
ceiling.

### 12.5 Now (representative) vs per-instance drilldown

| Aspect | NOW (MVP, representative) | DRILLDOWN (unlocks at the gate) |
|---|---|---|
| `body_line` | one verdict on the middle GLIDE instance (or holistic body-line read) | one Finding per GLIDE instance → "hips drop on the last two glides — you're sinking as you tire" |
| `recovery_elbow` | one near-arm recovery (`max_coached_recoveries=1`) | every near-arm recovery → the consistency/fatigue card ("clean early, elbow drops on the last third") — the marquee payoff |
| `head_breathing` | one head-carriage + one breath-side observation | per-breath instance → "breath stays clean on the left, you lift on the right"; per-clip side balance (still **never** a rhythm number) |
| `entry_reach` | one representative near-arm ENTRY verdict (the discipline flip is applied here) | per-entry consistency → "your reach shortens on later strokes" |

**The gate that controls drilldown:** segmentation count accuracy must clear
**~80% within ±1** on `validation/recovery_eval.py` (currently ~53%). Below it,
"recovery #N" mislabels the instance and every paid inspect cites the wrong cycle.
**No analyzer rubric changes** unlock drilldown — the per-arm `Instance` +
`instance_id` structure already supports it; you only:

1. lift `max_coached_recoveries` (and the per-aspect rep cap), and
2. ship the pay-per-inspect endpoint **`POST /ai/analyze/{job_id}/inspect`**
   `{aspect, instance_id}` (+ a public-token variant). It rebuilds `RunContext`
   with `cache` set from `coach_result`, so gate/segment **replay at $0** and only
   the one aspect call is paid; persists the new Finding back into `coach_result`;
   returns it. **409 "drilldown not yet available"** until the accuracy gate passes.

Ship the drilldown affordance **visibly LOCKED** ("unlocks at higher accuracy") so
the value is teased without the accuracy debt.

### 12.6 Build order (sequenced, each step shippable)

0. **Types + plumbing, no behaviour change.** Add `CoachContext` to
   `pipeline/types.py` + `RunContext.coaching`. Pure types — keeps `openapi.json`
   byte-identical until endpoints change. Unit-test it imports import-light.
1. **The discipline logic, no API.** Add `coach/rubric.py:build_goal_block(ctx)`
   (soft prompt clause) + `pipeline/grade.py:grade(verdict, ctx)->(severity, rank)`
   (deterministic re-grade). **Exhaustively unit-test `grade()` per discipline** —
   this is where goal-awareness is cheaply verifiable and must be bulletproof
   (same verdict, different severity/rank by discipline).
2. **Promote `recovery_coach` → shared base.** Extract an `AspectCoachComponent`
   helper (consumes a `Phase` + arm filter, picks reps by `instance_id`, windows
   the strip, replays `ctx.cache` by key, routes verdict→severity through
   `grade()`). `recovery_coach` becomes its first subclass — behaviour-preserving;
   `pipeline/tests/` must still pass. Add `grade()`-table unit tests.
3. **`body_line`** (`pipeline/components/body_line.py`, consumes `GLIDE`) — highest
   value, most discipline-neutral → safest new analyzer to validate the pattern.
   Register in `defaults.py` behind `STROKELAB_COACH_BODY_LINE` (default off until
   eval). No-API unit tests first.
4. **`entry_reach`** — highest discipline-divergence AND highest hallucination risk
   (crossover). Bake the crossover ban + the no-crossover enum + the
   sprint-dead-spot demotion to hedged INFO. Toggle `STROKELAB_COACH_ENTRY`.
5. **`head_breathing`** (consumes `BREATH` + `GLIDE` fallback), reuse the
   `breathing_side` semantics from the existing `honest_numbers`. Toggle
   `STROKELAB_COACH_HEAD`.
6. **Retrofit** `holistic_coach` (and the promoted `recovery_elbow`) to read
   `ctx.coaching` via `build_goal_block` + `grade()`. Backwards-compatible.
7. **DB + API + frontend.** `./scripts/db/migrate.sh ai_service "add coach context
   to analysis jobs"` (the four typed columns); review the generated file. Add the
   `Form()` params to `routers/public.py` + the member create path; thread
   `job.*` → `_run_coach_pipeline` → `ctx.coaching`. Regenerate `openapi.json` **on
   the host venv** + frontend types. Add the discipline picker to the upload form.
8. **Eval gate per toggle.** Extend `validation/coach_eval.py` with the
   **falsifiable honesty checks**: the SAME clip yields the SAME
   `body_line/entry/elbow` enum under sprint vs distance (only severity/rank flips);
   **zero** crossover language ever; no invented breathing side; no unsupported
   STRENGTH (a positive verdict needs the same frame-cited evidence as a fault).
   Flip each toggle on only after its eval is clean. Keep `holistic_coach` on as the
   safety net through this phase; evaluate retiring it after (cost lever).
9. **GATED (later): per-instance drilldown.** When `validation/recovery_eval.py`
   clears ~80% within ±1: lift the rep caps, ship `POST /ai/analyze/{job_id}/inspect`
   (replay cache → $0 gate/segment, pay only the one aspect call), surface the
   `ctx.instances` list to the UX, add the consistency/fatigue collation. Until
   then the endpoint 409s and the affordance shows LOCKED.

### 12.7 Decisions (resolved 2026-06-21)

1. **Holistic retirement → SAFETY-NET, THEN RETIRE.** Keep `holistic_coach` on
   through rollout as a narrative safety-net, demote to a fallback (fires only when
   <2 structured findings), then retire for cost once the four aspects are
   eval-clean (target ~$0.035/clip).
2. **Cost ceiling → $0.06/clip**, worker-enforced. Over-budget clips drop to
   representative-only + skip holistic and emit a "not analyzed (budget)" info card,
   never a fake verdict.
3. **Discipline input → Distance live, Sprint coming soon.** The public selector
   defaults to Distance so the live path uses the TI-informed efficiency model.
   Sprint stays visible but inactive until the sprint-specific rubric is ready;
   General remains an accepted backend value but is not shown publicly.
4. **Optional fields → discipline-only MVP**, `focus_area` as the fast-follow
   (cheapest big UX win — "you asked about your breathing"), `level` after.
5. **`goal_text` retention/consent → adopted.** Length-clamp ≤200, never logged,
   folded into the job-FK `ON DELETE CASCADE` + `delete_job_assets` sweep, kept out
   of share-cards; the public guest-delete path covers it + drilldown findings.
6. **Drilldown billing → pay-per-inspect** (1 credit / micro-charge per inspect),
   off the per-clip budget, replay-cached at $0 on re-view.
7. **Sprint dead-spot → conservative.** Never a hard FIX from stills; only a hedged
   ≤0.5 INFO note requiring frames that show a *held, fully-extended* front arm;
   eval-asserted that discipline can't bias the VLM into *seeing* a dead-spot.
8. **Scrub crossover from the holistic prompt → done.** `coach/prompt.py` no longer
   lists "crossover" as visible, so holistic and `entry_reach` agree with §3.
