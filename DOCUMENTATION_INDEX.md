# SwimBuddz Documentation Index

**Master index** for all technical and operational documentation.

---

## 📖 Quick Start

**New to SwimBuddz?** Start here:

1. Read [CLAUDE.md](./CLAUDE.md) - AI assistant guide (project overview, tech stack, workflow)
2. Review [SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md) - All backend services
3. Check [ROUTES_AND_PAGES.md](./swimbuddz-frontend/ROUTES_AND_PAGES.md) - All 103 frontend routes

---

## 📂 Documentation Structure

```
swimbuddz/
├── CLAUDE.md                          # 🎯 START HERE - Complete AI assistant guide
├── DOCUMENTATION_INDEX.md             # This file - Master documentation index
├── SUPABASE_SETUP.md                  # Authentication and database setup
├── ANTIGRAVITY_PLAYBOOK.md            # AI agent workflow guidelines
│
├── docs/                              # 📚 Centralized documentation
│   ├── academy/                       # Academy layer (programs, cohorts, coaches)
│   ├── club/                          # Club layer (training, peer leaders, pricing)
│   ├── community/                     # Community layer (events, WhatsApp, tiers)
│   ├── store/                         # Store layer (e-commerce, suppliers)
│   ├── company/                       # Vision, brand, advisor insights, seasonality
│   ├── design/                        # Architecture design docs (homepage, wallet, rewards, chat)
│   ├── guides/                        # How-to guides (Supabase, email templates)
│   ├── launch/                        # Pre-launch readiness checklist
│   ├── marketing/                     # Social playbook, content calendar, creator agreement
│   └── reference/                     # Engineering reference (service registry, schema)
│
├── swimbuddz-backend/                 # Backend documentation
│   ├── README.md                      # Backend getting started guide
│   ├── ARCHITECTURE.md                # Microservices design and patterns
│   ├── CONVENTIONS.md                 # Python/FastAPI coding standards
│   ├── API_ENDPOINTS.md               # HTTP API reference
│   ├── API_TYPE_GENERATION.md         # TypeScript type generation workflow
│   ├── AGENT_INSTRUCTIONS.md          # AI assistant guidance for backend
│   ├── DEPLOY_ENV_GPG.md              # Environment and deployment setup
│   └── TODO.md                        # Backend task tracking
│
└── swimbuddz-frontend/                # Frontend documentation
    ├── README.md                      # Frontend getting started guide
    ├── ARCHITECTURE.md                # Next.js app structure
    ├── CONVENTIONS.md                 # TypeScript/React coding standards
    ├── ROUTES_AND_PAGES.md            # Complete route reference (103 pages)
    ├── UI_FLOWS.md                    # User journey documentation
    ├── DEPLOYMENT.md                  # Vercel deployment guide
    ├── AGENT_INSTRUCTIONS.md          # AI assistant guidance for frontend
    └── TODO.md                        # Frontend task tracking
```

---

## 🎯 Documentation by Purpose

### Getting Started

| Document                                                       | Description                                                    | Audience                  |
| -------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------- |
| [CLAUDE.md](./CLAUDE.md)                                       | **Start here** - Complete project overview, services, workflow | AI Agents, New Developers |
| [swimbuddz-backend/README.md](./swimbuddz-backend/README.md)   | Backend setup and getting started                              | Backend Developers        |
| [swimbuddz-frontend/README.md](./swimbuddz-frontend/README.md) | Frontend setup and getting started                             | Frontend Developers       |
| [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)                       | Authentication and database configuration                      | DevOps, Full Stack        |

### Architecture & Design

| Document                                                                   | Description                   | Key Content                                    |
| -------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------- |
| [swimbuddz-backend/ARCHITECTURE.md](./swimbuddz-backend/ARCHITECTURE.md)   | Microservices architecture    | Gateway pattern, service boundaries, data flow |
| [swimbuddz-frontend/ARCHITECTURE.md](./swimbuddz-frontend/ARCHITECTURE.md) | Next.js app structure         | App Router, layouts, component patterns        |
| [docs/reference/SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md) | **Complete service registry** | All 11 services with ports, status, models     |
| [docs/store/STORE_ARCHITECTURE.md](./docs/store/STORE_ARCHITECTURE.md)     | E-commerce module design      | Product models, cart, orders, inventory        |

### API & Data

| Document                                                                               | Description                        | Coverage                                      |
| -------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------------------------- |
| [swimbuddz-backend/API_ENDPOINTS.md](./swimbuddz-backend/API_ENDPOINTS.md)             | HTTP API endpoints                 | Core services (Members, Sessions, Attendance) |
| [swimbuddz-backend/API_TYPE_GENERATION.md](./swimbuddz-backend/API_TYPE_GENERATION.md) | Type generation workflow           | OpenAPI → TypeScript types                    |
| [docs/reference/SERVICE_COMMUNICATION.md](./docs/reference/SERVICE_COMMUNICATION.md)   | **Service communication patterns** | HTTP APIs, forbidden patterns, examples       |
| [docs/reference/DATABASE_SCHEMA.md](./docs/reference/DATABASE_SCHEMA.md)               | Database schema reference          | _TODO: Tables, columns, relationships_        |

### Domain-Specific Documentation

| Domain        | README                                                 | Key Documentation                                  |
| ------------- | ------------------------------------------------------ | -------------------------------------------------- |
| **Community** | [docs/community/README.md](./docs/community/README.md) | Events, social swimming, WhatsApp, tier boundaries |
| **Club**      | [docs/club/README.md](./docs/club/README.md)           | Training sessions, peer leaders, pricing strategy  |
| **Academy**   | [docs/academy/README.md](./docs/academy/README.md)     | Programs, cohorts, curriculum, coaches, milestones |
| **Store**     | [docs/store/README.md](./docs/store/README.md)         | E-commerce, products, orders, supplier system      |

### Company, Brand & Strategy

| Document                                                                                         | Description                                                         | Audience            |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ------------------- |
| [docs/company/ABOUT_SWIMBUDDZ.md](./docs/company/ABOUT_SWIMBUDDZ.md)                             | Strategic vision: Trinity model (Community → Academy → Club)        | Exec, All           |
| [docs/company/VOICE_AND_TONE.md](./docs/company/VOICE_AND_TONE.md)                               | Brand voice guidelines                                              | All, Marketing      |
| [docs/company/ADULT_LEARNING_PRINCIPLES.md](./docs/company/ADULT_LEARNING_PRINCIPLES.md)         | Andragogy framework for adult swim instruction                      | Coaches, Trainers   |
| [docs/company/ADVISOR_INSIGHTS_ROLF_FEB2026.md](./docs/company/ADVISOR_INSIGHTS_ROLF_FEB2026.md) | Advisor feedback on roadmap and priorities                          | Exec                |
| [docs/company/SEASONALITY_MODEL.md](./docs/company/SEASONALITY_MODEL.md)                         | Lagos seasonality model (rainy/dry, school calendar, salary cycles) | Operator, Exec      |
| [docs/company/POOL_PARTNERSHIP_AGREEMENT.md](./docs/company/POOL_PARTNERSHIP_AGREEMENT.md)       | Pool access & partnership agreement template (legal)                | Partnerships, Legal |

### Design & Feature Architecture

| Document                                                                                       | Description                                                              | Audience          |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------------- |
| [docs/design/HOMEPAGE_UX_AUDIT.md](./docs/design/HOMEPAGE_UX_AUDIT.md)                         | UX audit of homepage conversion and messaging                            | Designer, Product |
| [docs/design/HOMEPAGE_IMPLEMENTATION_GUIDE.md](./docs/design/HOMEPAGE_IMPLEMENTATION_GUIDE.md) | Frontend specs for homepage sections                                     | Engineer          |
| [docs/design/NOTIFICATION_ARCHITECTURE.md](./docs/design/NOTIFICATION_ARCHITECTURE.md)         | In-app/email/SMS/push notification system design                         | Engineer          |
| [docs/design/CHAT_SERVICE_DESIGN.md](./docs/design/CHAT_SERVICE_DESIGN.md)                     | In-app real-time chat service (cohorts, pods, events, DMs, safeguarding) | Engineer, Product |
| [docs/design/REWARDS_ENGINE_DESIGN.md](./docs/design/REWARDS_ENGINE_DESIGN.md)                 | Event-driven Bubbles rewards engine                                      | Engineer, Product |
| [docs/design/WALLET_SERVICE_DESIGN.md](./docs/design/WALLET_SERVICE_DESIGN.md)                 | Backend design for Bubbles closed-loop wallet                            | Engineer          |
| [docs/design/WALLET_FRONTEND_PLAN.md](./docs/design/WALLET_FRONTEND_PLAN.md)                   | Frontend specs for Bubbles wallet UI                                     | Engineer          |

### Marketing & Content

| Document                                                                                                             | Description                                                     | Audience        |
| -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------- |
| [docs/marketing/swimbuddz_social_media_playbook.docx](./docs/marketing/swimbuddz_social_media_playbook.docx)         | Growth strategy: IG + TikTok, funnel, launch plan, DM scripts   | Marketer        |
| [docs/marketing/swimbuddz_content_calendar.xlsx](./docs/marketing/swimbuddz_content_calendar.xlsx)                   | 12-week content calendar with captions and metrics tracker      | Marketer        |
| [docs/marketing/swimbuddz_content_templates.docx](./docs/marketing/swimbuddz_content_templates.docx)                 | Caption templates by pillar, filming briefs, WhatsApp repurpose | Marketer        |
| [docs/marketing/SwimBuddz_Content_Creator_Agreement.docx](./docs/marketing/SwimBuddz_Content_Creator_Agreement.docx) | Legal agreement template for content creators                   | Legal, Creators |

### Launch & Go-Live

| Document                                                             | Description                                                    | Audience     |
| -------------------------------------------------------------------- | -------------------------------------------------------------- | ------------ |
| [docs/launch/launch_readiness.md](./docs/launch/launch_readiness.md) | Pre-launch checklist (legal, onboarding, trust/safety, footer) | Product, Ops |

### Guides

| Document                                                                             | Description                                                   | Audience |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------- | -------- |
| [docs/guides/SUPABASE_EMAIL_TEMPLATES.md](./docs/guides/SUPABASE_EMAIL_TEMPLATES.md) | Transactional email templates (welcome, password reset, etc.) | Engineer |

### Feature Documentation

| Document                                                               | Description                         | Lines | Status  |
| ---------------------------------------------------------------------- | ----------------------------------- | ----- | ------- |
| [docs/academy/ACADEMY_REVIEW.md](./docs/academy/ACADEMY_REVIEW.md)     | Comprehensive academy feature audit | 784   | Current |
| [docs/store/STORE_ARCHITECTURE.md](./docs/store/STORE_ARCHITECTURE.md) | Store design and data model         | -     | Current |
| [docs/store/STORE_OPERATIONS.md](./docs/store/STORE_OPERATIONS.md)     | Store operations playbook           | -     | Current |
| [docs/store/STORE_FRONTEND.md](./docs/store/STORE_FRONTEND.md)         | Store UI/UX planning                | -     | Current |

### Coach Operations Documentation

| Document                                                                                   | Description                                                                 | Audience                     | Status  |
| ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ---------------------------- | ------- |
| [docs/academy/COACH_OPERATIONS_FRAMEWORK.md](./docs/academy/COACH_OPERATIONS_FRAMEWORK.md) | **Master framework** - Coach engagement, grading, compensation, progression | Academy Managers, Leadership | Current |
| [docs/academy/COACH_AGREEMENT.md](./docs/academy/COACH_AGREEMENT.md)                       | Legal agreement template for coach contractors                              | HR, Legal, Coaches           | Current |
| [docs/academy/COHORT_SCORING_TOOL.md](./docs/academy/COHORT_SCORING_TOOL.md)               | Manual forms + system spec for cohort complexity scoring                    | Academy Managers, Developers | Current |
| [docs/academy/COACH_HANDBOOK.md](./docs/academy/COACH_HANDBOOK.md)                         | Coach-facing guide with system integration spec                             | Coaches, Developers          | Current |

### Frontend Routes & UX

| Document                                                                           | Description                  | Coverage                            |
| ---------------------------------------------------------------------------------- | ---------------------------- | ----------------------------------- |
| [swimbuddz-frontend/ROUTES_AND_PAGES.md](./swimbuddz-frontend/ROUTES_AND_PAGES.md) | **Complete route reference** | All 103 pages across 6 route groups |
| [swimbuddz-frontend/UI_FLOWS.md](./swimbuddz-frontend/UI_FLOWS.md)                 | User journey documentation   | Member flows, admin workflows       |

### Coding Standards

| Document                                                                 | Description               | Covers                               |
| ------------------------------------------------------------------------ | ------------------------- | ------------------------------------ |
| [swimbuddz-backend/CONVENTIONS.md](./swimbuddz-backend/CONVENTIONS.md)   | Backend coding standards  | Python, FastAPI, SQLAlchemy patterns |
| [swimbuddz-frontend/CONVENTIONS.md](./swimbuddz-frontend/CONVENTIONS.md) | Frontend coding standards | TypeScript, React, Next.js patterns  |

### Deployment & Operations

| Document                                                                     | Description               | Environment           |
| ---------------------------------------------------------------------------- | ------------------------- | --------------------- |
| [swimbuddz-backend/DEPLOY_ENV_GPG.md](./swimbuddz-backend/DEPLOY_ENV_GPG.md) | Environment configuration | Production, Staging   |
| [swimbuddz-frontend/DEPLOYMENT.md](./swimbuddz-frontend/DEPLOYMENT.md)       | Vercel deployment guide   | Production            |
| [docs/store/STORE_OPERATIONS.md](./docs/store/STORE_OPERATIONS.md)           | Store operations playbook | Day-to-day operations |

### AI Agent Guides

| Document                                                                               | Description                | Purpose                       |
| -------------------------------------------------------------------------------------- | -------------------------- | ----------------------------- |
| [CLAUDE.md](./CLAUDE.md)                                                               | **Primary AI guide**       | Complete context and workflow |
| [swimbuddz-backend/AGENT_INSTRUCTIONS.md](./swimbuddz-backend/AGENT_INSTRUCTIONS.md)   | Backend-specific guidance  | Service patterns, testing     |
| [swimbuddz-frontend/AGENT_INSTRUCTIONS.md](./swimbuddz-frontend/AGENT_INSTRUCTIONS.md) | Frontend-specific guidance | Component patterns, routing   |
| [ANTIGRAVITY_PLAYBOOK.md](./ANTIGRAVITY_PLAYBOOK.md)                                   | Overall AI workflow        | Agent collaboration           |

### Task Tracking

| Document                                                   | Description        |
| ---------------------------------------------------------- | ------------------ |
| [swimbuddz-backend/TODO.md](./swimbuddz-backend/TODO.md)   | Backend task list  |
| [swimbuddz-frontend/TODO.md](./swimbuddz-frontend/TODO.md) | Frontend task list |

---

## 🔍 Quick Reference by Role

### Backend Developer

**Start:**

1. [swimbuddz-backend/README.md](./swimbuddz-backend/README.md) - Setup
2. [swimbuddz-backend/ARCHITECTURE.md](./swimbuddz-backend/ARCHITECTURE.md) - Design patterns
3. [docs/reference/SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md) - All services

**Reference:**

- [swimbuddz-backend/CONVENTIONS.md](./swimbuddz-backend/CONVENTIONS.md) - Coding standards
- [swimbuddz-backend/API_ENDPOINTS.md](./swimbuddz-backend/API_ENDPOINTS.md) - API contracts
- [swimbuddz-backend/API_TYPE_GENERATION.md](./swimbuddz-backend/API_TYPE_GENERATION.md) - Type workflow

### Frontend Developer

**Start:**

1. [swimbuddz-frontend/README.md](./swimbuddz-frontend/README.md) - Setup
2. [swimbuddz-frontend/ARCHITECTURE.md](./swimbuddz-frontend/ARCHITECTURE.md) - App structure
3. [swimbuddz-frontend/ROUTES_AND_PAGES.md](./swimbuddz-frontend/ROUTES_AND_PAGES.md) - All routes

**Reference:**

- [swimbuddz-frontend/CONVENTIONS.md](./swimbuddz-frontend/CONVENTIONS.md) - Coding standards
- [swimbuddz-frontend/UI_FLOWS.md](./swimbuddz-frontend/UI_FLOWS.md) - User journeys

### Full Stack Developer

**Start:**

1. [CLAUDE.md](./CLAUDE.md) - Complete overview
2. [docs/reference/SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md) - Backend services
3. [swimbuddz-frontend/ROUTES_AND_PAGES.md](./swimbuddz-frontend/ROUTES_AND_PAGES.md) - Frontend routes

**Integration:**

- [swimbuddz-backend/API_TYPE_GENERATION.md](./swimbuddz-backend/API_TYPE_GENERATION.md) - Type sync workflow
- [swimbuddz-backend/API_ENDPOINTS.md](./swimbuddz-backend/API_ENDPOINTS.md) - API contracts

### DevOps / SRE

**Setup:**

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Auth and database
- [swimbuddz-backend/DEPLOY_ENV_GPG.md](./swimbuddz-backend/DEPLOY_ENV_GPG.md) - Environment config
- [swimbuddz-frontend/DEPLOYMENT.md](./swimbuddz-frontend/DEPLOYMENT.md) - Frontend deployment

### Product / Store Operators

**Operations:**

- [docs/store/STORE_OPERATIONS.md](./docs/store/STORE_OPERATIONS.md) - Daily workflows
- [docs/store/STORE_ARCHITECTURE.md](./docs/store/STORE_ARCHITECTURE.md) - System understanding

### Academy / Coach Operations

**Start:**

- [docs/academy/COACH_OPERATIONS_FRAMEWORK.md](./docs/academy/COACH_OPERATIONS_FRAMEWORK.md) - **Master framework** for all coach operations
- [docs/academy/README.md](./docs/academy/README.md) - Academy layer overview

**Operations:**

- [docs/academy/COACH_HANDBOOK.md](./docs/academy/COACH_HANDBOOK.md) - Coach-facing guide
- [docs/academy/COHORT_SCORING_TOOL.md](./docs/academy/COHORT_SCORING_TOOL.md) - Program/cohort complexity scoring
- [docs/academy/COACH_AGREEMENT.md](./docs/academy/COACH_AGREEMENT.md) - Legal agreement template

### AI Assistant

**Primary:**

- [CLAUDE.md](./CLAUDE.md) - **Read this first** - Complete context
- [ANTIGRAVITY_PLAYBOOK.md](./ANTIGRAVITY_PLAYBOOK.md) - Workflow guidelines

**Domain-Specific:**

- [swimbuddz-backend/AGENT_INSTRUCTIONS.md](./swimbuddz-backend/AGENT_INSTRUCTIONS.md) - Backend work
- [swimbuddz-frontend/AGENT_INSTRUCTIONS.md](./swimbuddz-frontend/AGENT_INSTRUCTIONS.md) - Frontend work
- [docs/reference/SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md) - Service reference

---

## 📊 Platform Overview

### Backend Services (11 total)

| Service        | Port | Status         | Documentation                                                                                                                                        |
| -------------- | ---- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gateway        | 8000 | Production     | [SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md#1-gateway-service-port-8000)                                                              |
| Members        | 8001 | Production     | [SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md#2-members-service-port-8001)                                                              |
| Sessions       | 8002 | Production     | [SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md#3-sessions-service-port-8002)                                                             |
| Attendance     | 8003 | Production     | [SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md#4-attendance-service-port-8003)                                                           |
| Communications | 8004 | Production     | [SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md#5-communications-service-port-8004)                                                       |
| Payments       | 8005 | Production     | [SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md#6-payments-service-port-8005)                                                             |
| **Academy**    | 8006 | **Production** | [SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md#7-academy-service-port-8006-) + [ACADEMY_REVIEW.md](./docs/academy/ACADEMY_REVIEW.md)     |
| Events         | 8007 | Minimal        | [SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md#8-events-service-port-8007)                                                               |
| Media          | 8008 | Minimal        | [SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md#9-media-service-port-8008)                                                                |
| Transport      | 8009 | Production     | [SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md#10-transport-service-port-8009)                                                           |
| Store          | 8010 | Minimal        | [SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md#11-store-service-port-8010) + [STORE_ARCHITECTURE.md](./docs/store/STORE_ARCHITECTURE.md) |

### Frontend (103 pages)

| Route Group | Pages | Documentation                                                                                   |
| ----------- | ----- | ----------------------------------------------------------------------------------------------- |
| Public      | 19    | [ROUTES_AND_PAGES.md#public-routes](./swimbuddz-frontend/ROUTES_AND_PAGES.md#public-routes)     |
| Auth        | 7     | [ROUTES_AND_PAGES.md#auth-routes](./swimbuddz-frontend/ROUTES_AND_PAGES.md#auth-routes)         |
| Member      | 26    | [ROUTES_AND_PAGES.md#member-routes](./swimbuddz-frontend/ROUTES_AND_PAGES.md#member-routes)     |
| Coach       | 2     | [ROUTES_AND_PAGES.md#coach-routes](./swimbuddz-frontend/ROUTES_AND_PAGES.md#coach-routes)       |
| Sessions    | 1     | [ROUTES_AND_PAGES.md#sessions-routes](./swimbuddz-frontend/ROUTES_AND_PAGES.md#sessions-routes) |
| Admin       | 48    | [ROUTES_AND_PAGES.md#admin-routes](./swimbuddz-frontend/ROUTES_AND_PAGES.md#admin-routes)       |

---

## ⚠️ Documentation Status

### ✅ Current & Complete

- CLAUDE.md - Project overview
- SERVICE_REGISTRY.md - All backend services
- ROUTES_AND_PAGES.md - All 103 frontend routes
- ARCHITECTURE.md (both backend and frontend)
- README.md (both backend and frontend)
- ACADEMY_REVIEW.md - Academy feature audit
- API_TYPE_GENERATION.md - Type generation workflow
- COACH_OPERATIONS_FRAMEWORK.md - Coach engagement, grading, compensation
- COACH_AGREEMENT.md - Legal agreement template
- COHORT_SCORING_TOOL.md - Complexity scoring system
- COACH_HANDBOOK.md - Coach-facing operational guide

### ⚠️ Needs Expansion

- API_ENDPOINTS.md - Only covers core services (needs Academy, Payments, Store, Events, Media, Transport)
- DATABASE_SCHEMA.md - Not yet created (TODO)

---

## 🔄 Keeping Documentation Current

### When Adding a Backend Service

1. Implement service in `services/<service_name>/`
2. Add to docker-compose.yml with port
3. Update [SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md)
4. Update [ARCHITECTURE.md](./swimbuddz-backend/ARCHITECTURE.md)
5. Update [README.md](./swimbuddz-backend/README.md)
6. Add endpoints to [API_ENDPOINTS.md](./swimbuddz-backend/API_ENDPOINTS.md)

### When Adding a Frontend Route

1. Create page in `src/app/(group)/`
2. Add to [ROUTES_AND_PAGES.md](./swimbuddz-frontend/ROUTES_AND_PAGES.md)
3. Update [UI_FLOWS.md](./swimbuddz-frontend/UI_FLOWS.md) if affects user journey

### When Changing API Schemas

1. Update Pydantic models in backend
2. Regenerate OpenAPI: `python scripts/generate_openapi.py > openapi.json`
3. Regenerate frontend types: `npm run generate:types`
4. Update [API_ENDPOINTS.md](./swimbuddz-backend/API_ENDPOINTS.md) if needed

---

## 📧 Support & Questions

- **Architecture Questions:** Check [ARCHITECTURE.md](./swimbuddz-backend/ARCHITECTURE.md) or [frontend ARCHITECTURE.md](./swimbuddz-frontend/ARCHITECTURE.md)
- **Service Questions:** See [SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md)
- **Route Questions:** See [ROUTES_AND_PAGES.md](./swimbuddz-frontend/ROUTES_AND_PAGES.md)
- **AI Agent Questions:** Start with [CLAUDE.md](./CLAUDE.md)

---

_Last updated: April 2026_
