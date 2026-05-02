# AI Swim Technique Analyzer — Development Plan

**Status:** Design proposal — for implementation in a dedicated future session
**Owner:** Daniel (founder), Engineering
**Audience:** Daniel, plus future engineering session
**Last updated:** 2026-04-29

## Why this exists

SwimBuddz is service-business shaped today: cohorts scale linearly with coaches, pools, and admin hours. The AI swim technique analyzer is the **highest-asymmetry product bet** in the SwimBuddz portfolio:

- **Low downside**: v0 fits in 4 weeks of focused work, leverages existing open-source models, doesn't require capital-intensive data collection.
- **Uncapped upside**: works without a coach, scales infinitely, creates a content engine (every analysis = a TikTok), creates a defensible African-data moat over time.
- **Two business models layered**: B2C subscription for consumers, B2B for coaches and other operators.

This doc is the **development plan** so we can implement it in a focused session. It is not the implementation itself.

---

## Product scope (v0)

### What v0 does

A user uploads a video of themselves swimming. The system returns:
1. **Stroke type detected** (v0: freestyle only; reject other strokes)
2. **3 quantitative metrics**:
   - **Stroke rate** — strokes per minute
   - **Body roll proxy** — degrees of horizontal-vertical alignment (rough, computed from shoulder pose)
   - **Breathing side balance** — left/right breath count and ratio
3. **1 qualitative summary** (LLM-generated, 2-3 sentences) — interpretive feedback in plain language
4. **Visual annotation** — original video with pose-keypoint overlay shown to the user

### What v0 does NOT do

- Other strokes (breaststroke, backstroke, butterfly) — defer to v1
- Real-time analysis (live coaching) — defer to v2
- Comparative analysis ("you vs. an Olympian") — defer to v2
- Underwater pose estimation — surface-level only in v0 (most learners don't have underwater cameras)
- Coach replacement claims — explicitly position as **technique check, not coaching**

### Success criteria for v0 (ship if all of these are true)

- 100 founding members pre-sold at ₦15-25k lifetime
- Pose detection accuracy >85% on tests with SwimBuddz cohort footage
- End-to-end latency <90 seconds for a 60-second video
- Zero false positives that say "you're doing great" when the user clearly isn't
- One TikTok showing the analyzer in action gets >5k views

---

## Architecture

### High-level

```
[Mobile/web user] → upload video (≤60s, ≤50MB)
                      ↓
[ai_service /analyze endpoint] → enqueue ARQ job
                      ↓
[ARQ worker] → 1. Validate video (length, format, single subject)
               2. Extract frames (e.g., 10 fps) using ffmpeg
               3. Run pose estimation (MediaPipe BlazePose) per frame
               4. Compute metrics from pose timeseries
               5. Generate summary text via LLM (Claude Haiku, low cost)
               6. Render annotated video (pose overlay)
               7. Store result + return webhook/polling response
                      ↓
[ai_service /analyze/{job_id}] → returns metrics + annotated video URL
                      ↓
[Frontend] → display result, show annotated video, prompt to share/save
```

### Service placement

Existing `ai_service` (port 8011) is the right home. Today it does cohort scoring + coach grading. Adding `/analyze/*` endpoints aligns with its role as the AI compute service.

### Tech choices (v0)

- **Pose estimation**: MediaPipe BlazePose (Google, free, runs on CPU). Already battle-tested.
- **Video frame extraction**: ffmpeg (subprocess from Python).
- **Metric computation**: numpy / scipy from pose keypoint timeseries.
- **LLM summary**: Anthropic Claude Haiku 4.5 (cheap, fast, good enough for 2-3 sentences). Uses prompt caching for the system prompt.
- **Storage**: Supabase storage for uploaded videos and annotated outputs (existing infrastructure).
- **Queue**: ARQ (existing in reporting_service, replicate the pattern).
- **Auth**: existing Supabase JWT validation via `libs/auth`.
- **Database**: new tables `analysis_jobs` and `analysis_results` in `ai_service`.

### Data model

```python
# services/ai_service/models/analysis.py

class AnalysisJob(Base):
    __tablename__ = "swim_analysis_jobs"
    id: UUID, primary_key
    member_auth_id: str, indexed
    video_url: str  # Supabase storage path
    stroke_type: str  # "freestyle" only in v0
    status: enum  # PENDING, PROCESSING, COMPLETED, FAILED
    error_message: str | None
    created_at: datetime
    started_at: datetime | None
    completed_at: datetime | None

class AnalysisResult(Base):
    __tablename__ = "swim_analysis_results"
    id: UUID, primary_key
    job_id: UUID, FK to AnalysisJob, unique
    detected_stroke: str
    stroke_rate: float  # SPM
    body_roll_proxy: float  # degrees
    breath_count_left: int
    breath_count_right: int
    breath_balance: float  # left/(left+right) ratio
    summary_text: str  # LLM-generated 2-3 sentences
    annotated_video_url: str  # Supabase storage path
    raw_pose_data: dict  # JSONB, full pose timeseries for debugging
    created_at: datetime
```

### API endpoints

```
POST   /api/v1/ai/analyze                       Body: video_url, stroke_type. Creates job. Returns job_id.
GET    /api/v1/ai/analyze/{job_id}              Returns status + result if ready.
GET    /api/v1/ai/analyze/me                    List user's analyses (last 50)
DELETE /api/v1/ai/analyze/{job_id}              Delete a job + its video assets

# Internal (admin)
GET    /admin/ai/analyze/queue                  Job queue depth, success/failure rates
POST   /admin/ai/analyze/reanalyze/{job_id}     Re-run a job (e.g., after fixing a bug)
```

### Frontend pages

- `/analyze` — upload + result display page (authed)
- `/analyze/{job_id}` — single result view (shareable link if user opts in)
- `/admin/ai/queue` — admin monitoring page

---

## Cost model

Per analysis (rough):
- Compute: ~30 seconds CPU on a small VM (~₦5-15 in real terms depending on infra)
- Storage: ~50MB video upload + 50MB annotated output = ~100MB Supabase storage. At Supabase pricing ~$0.021/GB/month, this is ~₦5/month per stored analysis.
- LLM call (Haiku for ~500 tokens): ~$0.0001 per analysis (~₦0.15)
- Total marginal cost per analysis: ~₦10-25

At ₦5,000 per analysis (paid tier) or ₦3,000/month unlimited (subscription), gross margin >95%. **This is product margin, not service margin.**

For the founding members tier (₦15-25k lifetime): assume average user does 2 analyses/month for 12 months = 24 analyses = ~₦600 marginal cost vs. ₦15-25k revenue. >95% margin even with generous usage.

---

## Implementation plan (4 weeks)

### Week 1 — Foundation

**Backend:**
- [ ] Create `services/ai_service/models/analysis.py` with both tables
- [ ] Update `services/ai_service/alembic/env.py` `SERVICE_TABLES` set
- [ ] Generate + apply migration
- [ ] Add `pip install mediapipe opencv-python-headless ffmpeg-python` to ai_service requirements
- [ ] Build a CLI script: `python -m services.ai_service.scripts.analyze_local <video.mp4>` that runs the full pipeline locally (no API yet)
- [ ] Validate on 5 sample swim videos (any source — YouTube, your phone, cohort footage with consent)

**Output of week 1:** local script that takes a video, returns 3 metrics + summary + annotated video. No API, no UI, no auth. Just proof the math works.

### Week 2 — API + Queue

**Backend:**
- [ ] Wrap CLI logic into ARQ task `task_analyze_swim_video(ctx, job_id)`
- [ ] Add ARQ worker config to ai_service (replicate `reporting_service/tasks/worker.py` pattern)
- [ ] Implement `POST /api/v1/ai/analyze` endpoint (creates job, enqueues)
- [ ] Implement `GET /api/v1/ai/analyze/{job_id}` endpoint
- [ ] Implement `GET /api/v1/ai/analyze/me` endpoint
- [ ] Add Supabase storage helpers for upload + annotated output
- [ ] Update `gateway_service` proxy config for `/api/v1/ai/analyze/*`
- [ ] Regenerate types

**Output of week 2:** working API. You can curl an upload, poll for results, get JSON back.

### Week 3 — Frontend (consumer)

**Frontend:**
- [ ] `/analyze/page.tsx` — upload form (file picker, stroke type selector limited to "freestyle"), submit handler, polling for result
- [ ] `/analyze/[job_id]/page.tsx` — result view: 3 metric cards, summary text, annotated video player, share button
- [ ] Mobile-first design (most users will record on their phone, upload from phone)
- [ ] Error states: video too long, wrong format, processing failed
- [ ] Loading state with animated explanation of what's happening (3 phases: uploading → analyzing → rendering)

**Output of week 3:** end-to-end consumer flow works on mobile.

### Week 4 — Polish + Pre-sale launch

**Backend / Frontend / Marketing:**
- [ ] Add `/admin/ai/queue` admin page for monitoring
- [ ] Founding Members pre-sale page: `/founding-members` — explain the product, ₦15-25k lifetime tier, capped at 100, payment via Paystack
- [ ] Add `analysis_credits` field to wallet system (existing wallet service can be extended)
- [ ] Beta-test with 10 cohort members (free)
- [ ] Iterate based on feedback (likely: improve summary text quality, fix pose detection edge cases)
- [ ] Record 1-2 demo TikToks showing the product in action
- [ ] Pre-sale soft launch: WhatsApp + Instagram + email blast

**Output of week 4:** product live, pre-sale running, first revenue.

---

## Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Pose estimation accuracy is poor on low-light pool footage | High | High | Validate on real cohort footage in week 1 before committing further. If accuracy <70%, pivot scope or delay. |
| Video upload failures on Lagos 3G/4G | High | Medium | Compress client-side before upload (target <20MB). Use Supabase resumable uploads. |
| LLM summary text gives bad advice / false confidence | Medium | High | Constrain via system prompt: only describe observed metrics, never prescribe. Always include disclaimer "Not coach replacement." Run 50 outputs by Daniel before launch. |
| Founding members pre-sale doesn't hit 100 | Medium | Low | Start price low (₦15k), drop cap if needed. Use the pre-sale itself as validation: if <30 sign up at ₦15k, demand isn't there — kill the project before week 5. |
| Compute costs spike with usage | Low | Medium | Rate-limit per user (5 analyses/day v0). Move to GPU only if compute volume justifies it. |
| Privacy concerns about uploading video of self | Medium | Medium | Make all results private by default. Sharing requires explicit toggle. Option to delete analysis + video at any time. |

---

## Validation gate (week 1 → continue or pivot)

Before committing weeks 2-4 of work, validate at end of week 1:

- [ ] Pose estimation works on ≥3 of 5 sample videos (defined as: skeleton overlay tracks the swimmer for >80% of frames)
- [ ] Stroke rate is within 10% of manual count
- [ ] Breath balance metric is correct on a video where you intentionally breathe one-sided
- [ ] Total processing time on a 60-second video is <90 seconds on a small VM

If any fail, **stop, debug, or pivot scope.** Don't push through.

---

## Open questions for founder

1. **Pre-sale price**: ₦15k, ₦20k, or ₦25k for founding lifetime? My recommendation: **₦20k** — psychologically meaningful, high enough to filter freebie-hunters, low enough to clear 100. Cap firm at 100.
2. **Naming**: "SwimBuddz Stroke Check" / "SwimBuddz AI Coach" / "Stroke Lab" / "SwimAI by SwimBuddz"? Naming affects positioning — "AI Coach" overpromises; "Stroke Check" undersells. Recommended: **"Stroke Lab"** — implies experimentation, quantification, learning.
3. **Free tier policy**: Does every Academy student get unlimited free analysis? My recommendation: **yes** — drives Academy retention, generates content, generates training data. Founding-tier ₦20k is for non-Academy users; Academy students get it free as a benefit.
4. **Privacy default**: All analyses private unless user toggles share? My recommendation: **yes**, private by default. Public requires opt-in.
5. **Open-source training data**: Do we open-source pose-keypoint datasets from anonymized cohort footage in 12 months? Could become an African-swim-data thought leadership moat. Decision deferred.

---

## What this unlocks (12-24 months out)

If v0 ships and v1 (4 strokes) lands within 6 months:

- **Coach upsell**: B2B subscription (₦15-30k/month) for swim coaches outside SwimBuddz to use Stroke Lab on their own students
- **Defensible African-data moat**: As you accumulate analyses, you have the largest African-adult-swimmer dataset in existence. Future ML training on this data is an asymmetric long-tail bet.
- **Content flywheel**: Every public analysis = a TikTok. Every TikTok with >10k views drives non-trivial app installs. Compounds without paid acquisition.
- **Partnership leverage**: Sport-tech operators globally (Phlex AI, Strava, swim federations) take meetings with the team that has the data + the active African community.
- **Validation for SaaS pivot**: A working AI product is the proof-point that lets you license SwimBuddz OS to other African community sport orgs in 18-24 months.

---

## Decision required before next session

- [ ] Approve scope (v0 = freestyle only, 3 metrics + 1 summary)
- [ ] Confirm price (₦20k recommended)
- [ ] Confirm name (Stroke Lab recommended)
- [ ] Confirm Academy free / non-Academy paid model
- [ ] Greenlight the 4-week build with explicit kill gate at end of week 1

When greenlit, schedule the focused implementation session.
