# Weather Module — Architecture & Data Model Design

> **Status:** Phase 1 shipped
> **Home:** module inside `pools_service` (`services/pools_service/weather/`) — **not** a standalone service
> **Date:** 2026-06-07
> **Author:** Daniel + AI collaborator

---

## 1. Overview

The weather module provides **cached, multi-day, hourly forecasts for SwimBuddz pool locations**, so members and admins can plan around Lagos's rainy season: same-day go/no-go calls on sessions, picking drier slots, packing a rain kit, and (later) proactive "rain likely at your session" alerts.

It exists because, during the June 2026 rainy season, these decisions were being made by hand-checking external weather sites for each pool. This module puts the same data inside the product, next to the session calendar.

---

## 2. Why a module in pools_service (not a standalone service)

This shipped first as a standalone `weather_service` (port 8019), then was **collapsed into `pools_service`** as a deliberate "keep it lean" decision. The reasoning is worth recording, because it's a reusable call.

A separate microservice earns its keep when **most** of these hold:

| Criterion | Weather | |
|---|---|---|
| Owns data (system of record) | ✗ | it's a **cache**; Open-Meteo is the source of record |
| Independent lifecycle/scaling | ~ | low volume, mild |
| Distinct runtime profile | ~ | external polling + cache, not dramatic |
| Multiple consumers, owned by none | ~ | sessions/transport/reporting *may* consume it later |
| Separate failure/security domain | ✗ | public data; degrades gracefully in-module |
| Independent team ownership | ✗ | solo |

That's ~1 of 6 strongly — below the bar set by, e.g., `chat_service` (real-time infra + safeguarding). Meanwhile **pools_service already owns pool coordinates**, which the forecast keys on. Hosting weather here:

- **Eliminates a cross-service hop** — the pre-fetch reads the `Pool` table in-process instead of HTTP-calling pools for coordinates.
- **Drops a container, a port, and gateway wiring** (the standalone API container + its service URL).
- Keeps the module **self-contained and liftable** (`services/pools_service/weather/`) — if it ever grows into a real cross-cutting domain (alerts, reschedule suggestions, attendance correlation with multiple consumers), it can be extracted into its own service with little churn.

Precedent both ways exists in the codebase: `ai_service` is a thin external-API wrapper that *is* its own service; but cross-cutting concerns like `libs/auth`, `libs/db`, `libs/service_client` are libraries, not services. Weather sat on the line; "lives in the service that owns its key data" broke the tie.

---

## 3. The three-layer model (what we can and can't forecast)

A hard truth shaped the design: **weather forecasting has a skill limit of ~14 days.** Beyond that it isn't a forecast, it's climatology. So the product is built as three honest layers, each labelled for what it is:

| Layer | Horizon | What it is | Status |
|---|---|---|---|
| **Real-time / today** | now → ~48h | Live conditions, hourly | ✅ Phase 1 (cache-aside) |
| **Forecast** | up to ~14 days | Genuine hourly forecast | ✅ Phase 1 (pre-fetched snapshot) |
| **Climatology** | 14 days → end of year | Historical seasonal *averages*, NOT a forecast | ⏳ Phase 2 |

> **Never present climatology as a forecast.** "June is typically ~17 rainy days, mornings wettest" is planning guidance, not a prediction. Phase 1 caps the horizon at `WEATHER_FORECAST_DAYS` (14) and does not pretend to forecast the rest of the year.

---

## 4. Data-fetching strategy — why pre-fetch, not pure on-demand

Two separable decisions: *when* we hit the upstream API (trigger) and *whether* we store the result (cache). The deciding fact: **weather for a (location, time) is identical for every member** — it's shared data, so we fetch once and serve many.

| Approach | Upstream calls | First-load latency | Enables alerts? |
|---|---|---|---|
| Pure on-demand (no cache) | 1 per card-view per user (1000s) | Slow (live round-trip every time) | ❌ |
| Cache-aside (on-demand + store) | dozens | Fast after first hit | ❌ |
| **Pre-fetch snapshot (chosen)** | ~80/day, fixed | Instant, always warm | ✅ |

**Chosen: pre-fetch snapshot, with cache-aside as the fallback path.** A scheduled worker pulls each active pool's 14-day forecast every 3 hours into `weather_snapshots`. One Open-Meteo call returns the whole 14-day hourly block for a location. Reads hit warm storage; arbitrary coordinates not yet cached fall through to a live fetch (cache-aside) and get stored. Pre-fetch is also the only option that lets proactive alerts fire without a user request.

---

## 5. Architecture

```
pools-worker (ARQ cron on queue arq:pools, every 3h)
   └─ SELECT active pools (Pool table, in-process — no HTTP)
   └─ for each pool w/ coords: provider.fetch_forecast() ── Open-Meteo
   └─ upsert WeatherSnapshot (one row per normalized location)

pools-service (FastAPI, :8014) — weather module mounted alongside pool routes
   ├─ GET /weather?lat&lon[&date]          ── cache-aside read
   ├─ GET /weather/pools/{pool_id}[&date]  ── by-pool read (resolve coords from Pool on miss)
   ├─ POST /admin/weather/refresh          ── run the pre-fetch inline
   └─ GET  /admin/weather/snapshots        ── debug/health
```

Module layout (`services/pools_service/weather/`): `models.py` (WeatherSnapshot), `schemas.py`, `provider.py` (provider abstraction + Open-Meteo), `snapshot_service.py` (cache-aside + storage), `refresh.py` (direct Pool query + orchestration), `routers.py` (member + admin), `tests/`.

### Provider abstraction
`provider.py` defines a `WeatherProvider` protocol with one method, `fetch_forecast(...) -> ForecastData`, and an `OpenMeteoProvider`. `get_provider()` selects by config. Parsing (`parse_open_meteo`) is split from the HTTP call so it's unit-testable without a network.

> **Provider licensing:** Open-Meteo's free tier is **non-commercial**. For production, set `WEATHER_PROVIDER` / `WEATHER_API_KEY` to a commercial provider, or self-host Open-Meteo. The abstraction is the single place a second provider gets wired in.

### Caching & resilience
- `location_key` = `"lat,lon"` rounded to 2 dp (~1km), so nearby pools share one row.
- `expires_at = fetched_at + WEATHER_CACHE_TTL_MINUTES` (default 180). Past expiry → refetch on read.
- **Serve-stale-on-failure:** if the provider errors and a stale row exists, the read returns the stale row rather than erroring.

### "Real-time" expectation
Upstream models update roughly every few hours; "real-time" here means *refreshed every 15–60 min via cache-aside / every 3h via the worker*, not live to the second.

---

## 6. Data model

`WeatherSnapshot` (`weather_snapshots`) — owned by pools_service:

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `location_key` | str, **unique**, indexed | `"6.51,3.37"` — upsert key + dedup |
| `latitude`, `longitude` | float | requested coords |
| `pool_id` | UUID, nullable, indexed | plain UUID, **no FK** (kept liftable) |
| `label` | str, nullable | e.g. "Yaba" |
| `provider` | str | e.g. "open-meteo" |
| `timezone` | str | e.g. "Africa/Lagos" |
| `forecast_days` | int | horizon cached |
| `hourly` | JSONB | parallel arrays: `time`, `precipitation_probability`, `precipitation`, `temperature_2m`, `weather_code` |
| `daily` | JSONB, nullable | daily summary |
| `fetched_at` | timestamptz, indexed | |
| `expires_at` | timestamptz | TTL boundary |
| `created_at`, `updated_at` | timestamptz | |

Migration: `49800070bb20_add_weather_snapshot_cache_table` in the **pools_service** alembic chain (version table `alembic_version_pools`), generated via `./scripts/db/migrate.sh pools_service`.

---

## 7. API

See [API_ENDPOINTS.md](../../swimbuddz-backend/docs/API_ENDPOINTS.md#weather-pools_service-module) for the canonical list. Summary:

- `GET /api/v1/weather?lat&lon[&date]` — member, cached forecast for coordinates.
- `GET /api/v1/weather/pools/{pool_id}[&date]` — member, cached forecast for a pool.
- `POST /api/v1/admin/weather/refresh` — admin, run the pre-fetch inline.
- `GET /api/v1/admin/weather/snapshots` — admin, list cached snapshots.

`?date=YYYY-MM-DD` trims the response to a single local day (mobile bandwidth). The gateway proxies `/api/v1/weather/*` and `/api/v1/admin/weather/*` to `pools_client`.

---

## 8. Configuration

| Setting | Default | Meaning |
|---|---|---|
| `WEATHER_PROVIDER` | `open-meteo` | provider key |
| `WEATHER_API_KEY` | `""` | commercial-provider key (blank = Open-Meteo free) |
| `WEATHER_FORECAST_DAYS` | `14` | horizon to cache (Open-Meteo max 16) |
| `WEATHER_CACHE_TTL_MINUTES` | `180` | snapshot freshness window |

(No `WEATHER_SERVICE_URL` — there's no separate service; the gateway routes weather to `pools_service`.)

---

## 9. Phasing & future work

- **Phase 1 (done):** snapshot pre-fetch + cache-aside reads, member + admin endpoints, Open-Meteo provider, 14-day horizon — as a pools_service module.
- **Phase 2 — frontend:** weather chip on each session card (FullCalendar) for the next 14 days; climatology layer for long-range admin planning.
- **Phase 3 — proactive:** "rain likely at your session tomorrow" alerts via `communications_service` / `chat_service`.
- **Phase 4 — decision support:** auto-flag high-rain-risk sessions and suggest drier reschedule slots; `reporting_service` correlation of weather vs. attendance.

> **If/when weather grows** into a genuine cross-cutting domain with several independent consumers, revisit the §2 decision and extract it back into its own service — the module is intentionally self-contained to make that cheap.

---

## 10. Open questions

- **Pool coverage:** the worker caches active partner pools with coordinates. If sessions ever run at non-partner pools, widen the `refresh.py` query.
- **Commercial provider:** finalize the production provider + key before public launch (licensing note above).
- **Lightning/thunder:** Open-Meteo `weather_code` distinguishes thunderstorms; surfacing a clear "lightning = unsafe to swim" signal (vs. mere rain) would directly serve the rain go/no-go policy.
