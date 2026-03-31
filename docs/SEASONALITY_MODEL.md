# SwimBuddz Seasonality Model — Method & Guide

## Overview

This document describes the seasonality forecasting model used by SwimBuddz to forecast demand, plan operations, and distinguish normal seasonal dips from real performance problems.

The model is designed for **Lagos, Nigeria** and accounts for:
- **Rainy season** (April–October) — the primary demand driver
- **School calendar** — term times, holidays, exam periods
- **Public holidays** — disruptions to regular attendance
- **Month-end cash flow** — salary cycle effects on payments
- **Growth trend** — startup trajectory overlaid on seasonal pattern

## The Formula

```
Expected Demand = Baseline × Seasonal Index × Trend × Campaign Multiplier
```

| Component | Description | Cold-Start Default |
|-----------|-------------|-------------------|
| **Baseline (B)** | Average monthly demand with seasonality removed | 150 attendance/month |
| **Seasonal Index (S)** | Month-specific multiplier; avg = 1.0 across 12 months | Lagos priors (0.70–1.15) |
| **Trend (T)** | Compound monthly growth since launch | 1.5% per month |
| **Campaign (C)** | Manual multiplier for known promos/events | 1.0 (no effect) |

## Lagos Seasonal Priors

These are the default demand multipliers based on Lagos climate, school calendar, and cultural patterns. They represent our best domain-knowledge estimate before platform data exists.

| Month | Index | Rationale |
|-------|-------|-----------|
| January | 1.15 | New Year motivation, dry season, schools resume |
| February | 1.10 | Peak dry season, pleasant weather |
| March | 1.05 | Dry season, school term winding down |
| April | 0.85 | Early rains begin, Easter break disruption |
| May | 0.80 | Rains intensify, mid-term |
| June | 0.75 | Peak rainfall, school holidays begin |
| July | 0.70 | Heaviest rain month + school holiday |
| August | 0.80 | "August break" — brief drier spell |
| September | 0.85 | Rains tapering, third term begins |
| October | 1.00 | Dry transition, Independence Day |
| November | 1.10 | Dry season begins, pleasant weather |
| December | 0.85 | Holiday travel, Christmas/New Year disruption |

**Key insight:** The ~40% swing between July (0.70) and January (1.15) is **normal and expected**. A dip in July is not failure — it's Lagos being Lagos.

## Calibration: How the Model Learns

The model uses a **Bayesian-inspired blending** approach:

```
blended_index = prior_weight × prior + (1 - prior_weight) × observed
prior_weight = max(0.05, 1 / (1 + months_of_data / 4))
```

| Months of Data | Prior Weight | Meaning |
|----------------|-------------|---------|
| 0 | 100% | Pure domain knowledge |
| 4 | 50% | Half prior, half data |
| 12 | 25% | Mostly data-driven |
| 24+ | ~5% | Almost entirely data-driven |

This ensures the model is useful from day one and gets progressively smarter.

## Confidence Bands

The model is honest about what it doesn't know:

```
uncertainty = 0.35 × e^(-0.08 × months_of_data) + 0.10
band = expected ± (uncertainty × expected)
```

| Months of Data | Uncertainty | Meaning |
|----------------|------------|---------|
| 0 | ±45% | Very wide — treat as rough guide |
| 6 | ±32% | Getting tighter |
| 12 | ±24% | Reasonably confident |
| 24+ | ±15% | Solid forecast |

## Status Labels

When comparing actuals to the forecast:

| Status | Meaning | Your Action |
|--------|---------|-------------|
| **Expected Seasonal Dip** | Demand is *supposed* to be low this month | Don't panic. Run retention, not acquisition. |
| **On Track** | Actual demand is within the confidence band | Continue as planned. |
| **Outperforming** | Actual demand exceeds the upper confidence bound | Investigate what's working — double down on it. |
| **Underperforming** | Actual demand falls below the lower bound | Investigate: operational issue? competition? external factor? |

## Decision Rules

### When to Run Promotions
- **Low demand months (Jun–Aug):** Retention campaigns, not acquisition
- **Pre-peak (Oct–Nov):** Acquisition campaigns to maximise peak season
- **Month-end:** Time promos around salary week (25th–30th)

### When to Conserve Cash
- **Jun–Aug:** Reduced revenue is normal. Cut discretionary spend.
- **April:** Easter disruption + early rains. Budget conservatively.
- **December:** Holiday travel reduces attendance. Skeleton crew.

### When to Push Acquisition
- **January:** New Year energy + dry season = highest conversion potential
- **September:** School resumes, new routines established
- **November:** Dry season begins, outdoor appetite returns

### When to Investigate
- **Two consecutive months underperforming:** Something operational is wrong
- **Peak month (Jan/Feb) below forecast:** Serious concern — investigate immediately
- **Sudden drop in a normally stable month:** External factor or operational issue

## Data Quality Risks

1. **Cold start (0–6 months):** Forecasts are domain estimates with wide error bars. Useful for planning, not for precision.
2. **Small samples:** Each month is a single data point. The model doesn't overfit to noise.
3. **Regime changes:** New pool locations, market expansion, or pricing changes break historical patterns. Use the `campaign_multiplier` to account for known changes.
4. **Missing data:** If data ingestion fails for a month, that month won't calibrate the model. CLI can re-ingest.

## Quickstart

### First-time setup (no database needed)

```bash
cd swimbuddz-backend
python -m services.reporting_service.cli.generate_forecast --year 2026
```

This generates three files in `./reports/seasonality/`:
- `SEASONALITY_MODEL_2026.md` — Full report
- `SEASONALITY_CALENDAR_2026.csv` — Spreadsheet-ready
- `seasonality_report_2026.html` — Visual report with charts

### With custom parameters

```bash
# Override baseline and growth rate
python -m services.reporting_service.cli.generate_forecast \
    --year 2026 \
    --baseline 200 \
    --trend 0.02

# With actual data from CSV
python -m services.reporting_service.cli.generate_forecast \
    --year 2026 \
    --actuals ./data/monthly_actuals.csv
```

The actuals CSV should have columns: `month,total_attendance`

### How data gets into the model

There are **three ways** to feed actual data — pick whichever fits your workflow:

| Method | How | When to use |
|--------|-----|-------------|
| **Auto-ingest (recommended)** | API call pulls from live services | Services are running, you want zero manual effort |
| **Manual API entry** | POST JSON with monthly numbers | Services are down, or you want to enter data from memory/spreadsheets |
| **CSV file** | Pass a CSV to the CLI | Offline use, no database needed |

**Auto-ingest** is built into the `/generate` endpoint — it automatically pulls the latest data from attendance, sessions, payments, and members services before running the forecast. You don't need to do anything extra.

### Monthly rerun workflow

**With services running (recommended):**
1. Hit `POST /admin/reports/seasonality/generate` with `{"forecast_year": 2026, "force_regenerate": true}`
2. The system auto-ingests all completed months from live services, then forecasts
3. Download the HTML report and share with stakeholders

**Without services (CLI + CSV):**
1. Create/update a CSV with your monthly numbers
2. Rerun: `python -m services.reporting_service.cli.generate_forecast --year 2026 --actuals data.csv`
3. Open the HTML report

### Via API (when reporting_service is running)

```bash
# Auto-ingest actuals from live services (pulls from attendance, sessions, payments, members)
POST /api/v1/admin/reports/seasonality/actuals/auto-ingest?year=2026

# Seed external factors for the year
POST /api/v1/admin/reports/seasonality/external-factors/seed
{"year": 2026}

# Enter actuals
POST /api/v1/admin/reports/seasonality/actuals/ingest
{"year": 2026, "month": 1, "total_attendance": 165, "active_members": 45, ...}

# Generate forecast (auto-ingests actuals first, then forecasts)
POST /api/v1/admin/reports/seasonality/generate
{"forecast_year": 2026}

# View calendar
GET /api/v1/admin/reports/seasonality/forecast/2026/calendar

# Download reports
GET /api/v1/admin/reports/seasonality/forecast/2026/export.csv
GET /api/v1/admin/reports/seasonality/forecast/2026/export.html
GET /api/v1/admin/reports/seasonality/forecast/2026/export.md
```

---

*Last updated: March 2026*
