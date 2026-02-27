# CLAUDE.MD - AI Assistant Guide for SwimBuddz

This document provides essential context for AI assistants working on the SwimBuddz platform.

## Quick Reference Card

**Before ANY task:** Read relevant `AGENT_INSTRUCTIONS.md` → `CONVENTIONS.md` → `TODO.md`

**Common Commands:**
```bash
# Backend: Database management (use scripts, NOT docker exec)
cd swimbuddz-backend
./scripts/db/migrate.sh <service>_service "description"  # Generate migration after model change
./scripts/db/reset.sh dev                                 # Reset DB using existing migrations
./scripts/db/full-reset.sh dev                            # Nuclear: regenerate all migrations

# Frontend: Regenerate types
cd swimbuddz-frontend && npm run generate:types

# Run tests
cd swimbuddz-backend && pytest tests/
cd swimbuddz-frontend && npm test
```

**Service Ports:** Gateway (8000) | Members (8001) | Sessions (8002) | Attendance (8003) | Communications (8004) | Payments (8005) | Academy (8006) | Events (8007) | Media (8008) | Transport (8009) | Store (8010)

**Decision Tree:**
1. Does it touch auth? → Check Supabase docs + `libs/auth`
2. Database change? → Create migration + Update schema docs
3. New API endpoint? → Update service → Regenerate types → Update `API_ENDPOINTS.md`
4. Frontend change? → Check `UI_FLOWS.md` → Follow `CONVENTIONS.md` patterns

---

## Project Overview

**SwimBuddz** is a swimming community platform designed for Lagos, Nigeria with three distinct layers:

1. **Community Layer** - Social swimming, open meets, and casual engagement
2. **Club Layer** - Structured training sessions with strict attendance tracking
3. **Academy Layer** - Formal swim education with cohort-based programs

### Tech Stack

**Backend** (Python FastAPI Microservices)
- FastAPI with microservices architecture
- PostgreSQL + Supabase for auth
- SQLAlchemy ORM with Alembic migrations
- Docker containerization
- Model Context Protocol (MCP) for AI agent integration

**Frontend** (Next.js 14)
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + Mantine UI
- Supabase client (@supabase/ssr)
- FullCalendar for scheduling
- BlockNote for rich text editing

## Repository Structure

```
swimbuddz/
├── swimbuddz-backend/       # Python FastAPI microservices
│   ├── services/            # Domain services (gateway, members, sessions, etc.)
│   ├── libs/                # Shared libraries (auth, db, common)
│   ├── mcp/                 # Model Context Protocol server
│   └── tests/               # Backend tests
├── swimbuddz-frontend/      # Next.js 14 application
│   └── src/
│       ├── app/             # App router pages
│       ├── components/      # React components
│       └── lib/             # Utilities and API client
├── docs/                    # Centralized documentation
└── supabase/                # Supabase configuration
```

## Critical Documentation

Before making changes, read these files:

### Architecture & Patterns
- [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) - Master index of all docs
- [swimbuddz-backend/ARCHITECTURE.md](./swimbuddz-backend/ARCHITECTURE.md) - Microservices design
- [swimbuddz-frontend/ARCHITECTURE.md](./swimbuddz-frontend/ARCHITECTURE.md) - Next.js app structure
- [PRODUCT_ANALYSIS.md](./PRODUCT_ANALYSIS.md) - Product vision and risks

### Coding Standards
- [swimbuddz-backend/CONVENTIONS.md](./swimbuddz-backend/CONVENTIONS.md) - Python/FastAPI standards
- [swimbuddz-frontend/CONVENTIONS.md](./swimbuddz-frontend/CONVENTIONS.md) - TypeScript/React patterns

### API & Data
- [swimbuddz-backend/API_ENDPOINTS.md](./swimbuddz-backend/API_ENDPOINTS.md) - API endpoints reference
- [swimbuddz-backend/API_TYPE_GENERATION.md](./swimbuddz-backend/API_TYPE_GENERATION.md) - TypeScript type generation workflow
- [docs/reference/SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md) - Complete service registry
- [docs/reference/DATABASE_SCHEMA.md](./docs/reference/DATABASE_SCHEMA.md) - Database schema documentation

### Deployment
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Authentication setup
- [swimbuddz-backend/DEPLOY_ENV_GPG.md](./swimbuddz-backend/DEPLOY_ENV_GPG.md) - Environment config
- [swimbuddz-frontend/DEPLOYMENT.md](./swimbuddz-frontend/DEPLOYMENT.md) - Frontend deployment

## AI Agent Workflow

### 1. Before Starting Any Task

**MANDATORY READING CHECKLIST:**
- [ ] Read relevant `AGENT_INSTRUCTIONS.md` file (backend or frontend)
- [ ] Read `CONVENTIONS.md` for the area you're working in
- [ ] Read `TODO.md` to understand current priorities
- [ ] Check domain-specific docs (e.g., `STORE_ARCHITECTURE.md` for e-commerce)
- [ ] Review existing code in the same area for patterns
- [ ] Check if related tests exist to understand expected behavior

### 2. Understanding the Codebase

**Backend Services** (Ports 8000-8010):
- `gateway_service` (8000) - API Gateway (single entry point, proxies to all services)
- `members_service` (8001) - Member registration and profiles
- `sessions_service` (8002) - Swim sessions and events
- `attendance_service` (8003) - Session check-ins and tracking
- `communications_service` (8004) - Announcements and notifications
- `payments_service` (8005) - Payment records and Paystack integration
- `academy_service` (8006) - **Production-ready** cohort-based programs, curriculum, enrollment
- `events_service` (8007) - Community events and RSVPs (minimal implementation)
- `media_service` (8008) - Photo/video galleries and site assets (minimal implementation)
- `transport_service` (8009) - Ride-sharing system and route management
- `store_service` (8010) - E-commerce platform (minimal routes, extensive models)

**Service Communication Pattern:**
```
Client → Gateway (8000) → Individual Service (800X)
                ↓
         Supabase Auth Validation (libs/auth)
                ↓
         Database (PostgreSQL)
```

**Note:** `identity_service` exists as an empty directory but is **not implemented**. Authentication is handled via Supabase JWT validation in `libs/auth`.

**Complete Service Details:** See [docs/reference/SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md)

**Frontend Routes**:
- `/` - Public landing page
- `/auth/*` - Authentication flows
- `/account/*` - Member dashboards
- `/admin/*` - Administrative tools
- See [ROUTES_AND_PAGES.md](./swimbuddz-frontend/ROUTES_AND_PAGES.md) for complete list

### 3. Making Changes

**Backend Changes - Complete Checklist:**

- [ ] **Identify** the correct domain service (see [SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md))
- [ ] **Plan** if database migration is needed
- [ ] **Update** models in `services/<service>/models.py`
  - Follow SQLAlchemy best practices
  - Add proper indexes for frequently queried fields
  - Include `__repr__` methods for debugging
- [ ] **Update** routes in `services/<service>/router.py` or `app.py`
  - Use proper HTTP methods (GET/POST/PUT/DELETE)
  - Add request/response validation with Pydantic
  - Include proper error handling
- [ ] **Create** migration if needed:
  ```bash
  cd swimbuddz-backend
  ./scripts/db/migrate.sh <service>_service "description"
  # IMPORTANT: Review the generated migration file carefully!
  ./scripts/db/reset.sh dev  # Apply migrations and seed data
  ```
  **⚠️ CRITICAL - Migration Checklist:**
  1. **Update alembic env.py** - When adding NEW models:
     - Import the model in `services/<service>/alembic/env.py`
     - Add the table name to `SERVICE_TABLES` set
     - Without this, Alembic won't detect the new table!
  2. **Review generated migration** - Check for correctness
  3. **Verify all changes captured** - Compare migration to model changes
  4. **Check for data loss** - Watch for DROP, ALTER operations
  5. **DO NOT manually edit** - Fix model code and regenerate instead
  - **Reason:** Manual edits can cause migration history inconsistencies
- [ ] **Maintain** consistency in codebase (favour patterns over quick fixes)
- [ ] **Update** `API_ENDPOINTS.md` if adding/changing endpoints
- [ ] **Regenerate** OpenAPI spec and frontend types (see [API_TYPE_GENERATION.md](./swimbuddz-backend/API_TYPE_GENERATION.md))
- [ ] **Write** tests in `tests/`
  - Unit tests for business logic
  - Integration tests for endpoints
  - Aim for >80% coverage on new code
- [ ] **Update** relevant documentation

**Frontend Changes - Complete Checklist:**

- [ ] **Identify** the correct route/component
- [ ] **Check** `UI_FLOWS.md` for user journey context
- [ ] **Follow** component patterns in `CONVENTIONS.md`
  - Use Server Components by default
  - Client components only when needed (interactivity, hooks, browser APIs)
- [ ] **Reuse** existing UI components from `src/components/`
- [ ] **Update** API types with `npm run generate:types` if backend changed
- [ ] **Test** on mobile viewport (primary user base)
- [ ] **Optimize** images and assets for bandwidth
- [ ] **Add** loading states and error boundaries
- [ ] **Write** tests for complex logic

### 4. Common Task Patterns

**Adding a new API endpoint:**
```bash
# Backend
1. Add route to appropriate service app.py
   # Example:
   @app.get("/api/v1/members/{member_id}")
   async def get_member(member_id: int, db: Session = Depends(get_db)):
       ...

2. Add Pydantic model if needed (request/response validation)
   # Example in schemas.py:
   class MemberResponse(BaseModel):
       id: int
       name: str
       email: EmailStr

3. Update API_ENDPOINTS.md with new endpoint details

4. Create migration if database changes
   ./scripts/db/migrate.sh <service>_service "add member fields"
   ./scripts/db/reset.sh dev  # Apply and test

# Frontend
5. Regenerate types: cd swimbuddz-frontend && npm run generate:types

6. Use typed API client from lib/api-client.ts
   # Example:
   const member = await apiClient.members.getMember(memberId);
```

**Adding a new page:**
```bash
# Frontend
1. Create page in src/app/<route>/page.tsx
   # Follow App Router conventions
   # Use proper metadata export

2. Add to ROUTES_AND_PAGES.md

3. Update UI_FLOWS.md if it affects user journey

4. Use layout from src/components/Layout/
   # Or create route-specific layout.tsx

5. Add loading.tsx and error.tsx for the route
```

**Database schema changes:**
```bash
# Backend
1. Update model in services/<service>/models.py
   # Add proper relationships, indexes, constraints

2. If adding a NEW model/table, update alembic env.py:
   # services/<service>/alembic/env.py
   # - Add import: from services.<service>.models import NewModel
   # - Add to SERVICE_TABLES: "new_table_name"

3. Generate migration:
   ./scripts/db/migrate.sh <service>_service "description"

4. REVIEW migration file manually
   # Check for data migrations needed
   # Verify indexes are created
   # Ensure proper foreign key constraints

5. Apply and test:
   ./scripts/db/reset.sh dev

6. Update DATABASE_SCHEMA.md or SCHEMA_REGISTRY.md

7. Update API types and regenerate frontend types
```

**Adding a new microservice:**
```bash
# This is a rare operation - consult with team first!
1. Copy template from existing service
2. Update docker-compose.yml with new port
3. Create database connection in libs/db
4. Add to gateway proxy configuration
5. Update SERVICE_REGISTRY.md
6. Create initial Alembic migration
7. Add to documentation index
```

## Model Context Protocol (MCP) Integration

**What is MCP?**
The Model Context Protocol allows AI agents to interact with the SwimBuddz backend programmatically. Located in `swimbuddz-backend/mcp/`, it provides:
- Structured access to database queries
- Safe execution of read operations
- Tool definitions for AI agents

**When to use MCP:**
- Exploring database schema
- Querying data for analysis
- Testing API behavior
- Understanding relationships between models

**When NOT to use MCP:**
- Making production changes (use standard API)
- Writing to database (MCP is read-only)
- Building user-facing features

## Current Development Status

### Production Services (Fully Implemented)
- Member registration and authentication (Supabase + Members Service)
- Session scheduling and management (Sessions Service)
- Attendance tracking with ride-share (Attendance Service)
- Announcements and communications (Communications Service)
- Payment processing and Paystack integration (Payments Service)
- Academy programs with cohort management (Academy Service - see [ACADEMY_REVIEW.md](./docs/ACADEMY_REVIEW.md))
- Transport/ride-sharing system (Transport Service)
- Admin dashboards for all domains

### Minimal Implementation (Models exist, limited routes)
- **Events Service** - Community events and RSVPs (basic endpoints only)
- **Media Service** - Photo/video galleries (basic endpoints only)
- **Store Service** - E-commerce platform (extensive models, basic routes)

### Implementation Gaps
- **Academy Service gaps:** Coach dashboard, capacity enforcement, waitlist automation, enrollment notifications
- **Club vs Community distinction:** Session model is generic, needs type-based filtering
- **Identity Service:** Planned but not implemented (Supabase auth used instead)

See [TODO.md files](./DOCUMENTATION_INDEX.md#task-tracking) for detailed task lists and [SERVICE_REGISTRY.md](./docs/reference/SERVICE_REGISTRY.md) for complete service status.

## Key Architecture Decisions

### Backend

1. **Microservices over monolith** - Independent services for scalability
   - Each service has its own database schema
   - Services communicate via HTTP (through gateway)
   - Shared code lives in `libs/`

2. **Gateway pattern** - Single entry point (port 8000) proxies to services
   - Handles CORS and common middleware
   - Routes requests to appropriate service
   - Centralizes authentication validation

3. **Shared libraries** - `libs/` for common auth, db, and config
   - `libs/auth` - Supabase JWT validation
   - `libs/db` - Database connection management
   - `libs/common` - Shared utilities and constants

4. **Alembic for migrations** - All schema changes via migrations
   - Never modify database directly
   - Always review auto-generated migrations
   - Keep migrations reversible when possible

5. **Supabase for auth** - JWT validation in `libs/auth`
   - No password handling in our code
   - Row-level security handled in Supabase
   - User management via Supabase Admin API

6. **Service isolation** - No direct service-to-service imports or coupling
   - Services communicate only via HTTP APIs
   - No importing models/code from other services
   - No direct database access to other services' tables
   - See [SERVICE_COMMUNICATION.md](./docs/reference/SERVICE_COMMUNICATION.md) for patterns

### Frontend

1. **App Router** - Next.js 14 app directory structure
   - File-based routing
   - Server Components by default
   - Nested layouts for shared UI

2. **Server Components by default** - Client components only when needed
   - Reduces bundle size
   - Improves initial page load
   - Use `"use client"` sparingly

3. **Typed API client** - Generated from OpenAPI spec
   - Type safety across frontend/backend
   - Regenerate after backend changes
   - Located in `lib/api-client.ts`

4. **Mantine + Tailwind** - Mantine components with Tailwind utilities
   - Mantine for complex components (forms, modals, tables)
   - Tailwind for layout and custom styling
   - Consistent design system

5. **Supabase SSR** - Server-side auth with `@supabase/ssr`
   - Auth state on server and client
   - Secure cookie-based sessions
   - Middleware for protected routes

## Anti-Patterns to Avoid

Based on [PRODUCT_ANALYSIS.md](./PRODUCT_ANALYSIS.md):

### ❌ DON'T: Create "god objects"
The `Session` model shouldn't handle Community, Club, AND Academy use cases.

**Instead:** Use proper domain separation or discriminator patterns.

### ❌ DON'T: Blur layer boundaries
Community members shouldn't see Club-only content.

**Instead:** Implement proper RBAC and filter queries by user roles.

### ❌ DON'T: Skip proper RBAC
Users can have multiple simultaneous roles (Community + Club + Academy).

**Instead:** Check all relevant roles, not just the "primary" one.

### ❌ DON'T: Manage cohorts manually
Admins shouldn't manually track enrollment and boundaries.

**Instead:** System should enforce enrollment limits and automation.

### ❌ DON'T: Add fields to existing models for new domains
Extending `Session` for Store products breaks separation of concerns.

**Instead:** Create new models/services for new domains.

### ❌ DON'T: Bypass the gateway
Never call services directly from frontend (except in development).

**Instead:** Always route through gateway at port 8000.

### ❌ DON'T: Hardcode configuration
No hardcoded URLs, API keys, or environment-specific values.

**Instead:** Use environment variables and config management.

### ❌ DON'T: Ignore mobile performance
Primary users are on mobile with limited bandwidth.

**Instead:** Optimize images, minimize bundle size, lazy load components.

## Common Pitfalls & Solutions

### Backend

**Pitfall:** Forgetting to update `API_ENDPOINTS.md` after adding routes
**Solution:** Add it to your checklist. Frontend developers rely on this doc.

**Pitfall:** Not reviewing auto-generated migrations
**Solution:** Always check migration files for correctness before applying.

**Pitfall:** Returning sensitive data in API responses
**Solution:** Use Pydantic response models to control exactly what's returned.

**Pitfall:** Missing database indexes on foreign keys
**Solution:** Add `index=True` to relationship columns that are queried often.

**Pitfall:** Not handling database transactions properly
**Solution:** Use `db.commit()` and `db.rollback()` in try/except blocks.

### Frontend

**Pitfall:** Using Client Components when Server Components would work
**Solution:** Default to Server Components; only use "use client" when you need:
- Event handlers (onClick, onChange)
- Hooks (useState, useEffect)
- Browser APIs

**Pitfall:** Not handling loading and error states
**Solution:** Always provide loading.tsx and error.tsx for routes.

**Pitfall:** Forgetting to regenerate types after backend changes
**Solution:** Run `npm run generate:types` after any API changes.

**Pitfall:** Not testing on mobile viewport
**Solution:** Use Chrome DevTools mobile emulation; test on actual device if possible.

**Pitfall:** Importing entire Mantine library
**Solution:** Import specific components: `import { Button } from '@mantine/core'`

## Security Best Practices

### Authentication & Authorization
- **Never** validate JWTs client-side only
- **Always** validate auth on server (middleware or per-route)
- **Check** user roles before returning sensitive data
- **Use** Supabase Row Level Security (RLS) policies

### Data Handling
- **Sanitize** user input before database queries
- **Validate** request bodies with Pydantic models
- **Never** expose internal IDs if avoidable (use UUIDs or hashed IDs)
- **Limit** query results (pagination) to prevent data dumps

### API Security
- **Rate limit** endpoints (especially auth and payments)
- **Use** HTTPS in production (enforced by Vercel/hosting)
- **Validate** file uploads (type, size, content)
- **Log** security events (failed auth, suspicious queries)

### Environment Variables
- **Never** commit `.env` files to git
- **Use** `.env.example` files to document required variables
- **Encrypt** sensitive configs (see `DEPLOY_ENV_GPG.md`)
- **Rotate** API keys and secrets regularly

## Git Workflow & Version Control

### Branch Naming
```
feature/add-payment-webhook
bugfix/fix-attendance-timestamp
hotfix/critical-auth-issue
docs/update-api-endpoints
```

### Commit Messages
Follow conventional commits:
```
feat(payments): add Paystack webhook handler
fix(sessions): correct timezone handling in calendar
docs(api): update endpoint documentation
refactor(members): simplify profile query logic
test(academy): add cohort enrollment tests
```

### Before Committing
- [ ] Run tests locally
- [ ] Update relevant documentation
- [ ] Remove debugging code (console.logs, breakpoints)
- [ ] Check for sensitive data (API keys, passwords)
- [ ] Format code (prettier/black)

### Pull Request Checklist
- [ ] PR title describes the change clearly
- [ ] Description explains WHY the change was made
- [ ] Tests pass in CI
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Reviewed own code first

## Performance Considerations

### Mobile-First Guidelines

**Page Load:**
- Target: <3s on 3G connection
- Use Next.js Image component for automatic optimization
- Lazy load below-the-fold content
- Minimize JavaScript bundle size

**Images:**
- Compress images before uploading
- Use WebP format when possible
- Provide multiple sizes for responsive images
- Use blur placeholders for loading states

**API Calls:**
- Paginate results (max 50 items per page)
- Use caching headers appropriately
- Debounce search inputs
- Implement optimistic UI updates

**Database Queries:**
- Add indexes for frequently queried fields
- Use `select_related()` / `joinedload()` to avoid N+1 queries
- Paginate database queries
- Cache expensive computations

## Testing Requirements

### Backend Testing

**Coverage Target:** >80% for new code

**Test Types:**
```python
# Unit Tests (test business logic)
def test_calculate_session_cost():
    assert calculate_cost(duration=60, rate=1000) == 1000

# Integration Tests (test endpoints)
def test_create_member(client):
    response = client.post("/api/v1/members", json={...})
    assert response.status_code == 201

# Database Tests (test models and relationships)
def test_member_sessions_relationship(db):
    member = Member(...)
    db.add(member)
    assert member.sessions == []
```

**Run Tests:**
```bash
cd swimbuddz-backend
pytest tests/ -v
pytest tests/ --cov=services --cov-report=html
```

### Frontend Testing

**Test Types:**
- Component tests (React Testing Library)
- Integration tests (user flows)
- E2E tests (Playwright/Cypress for critical paths)

**Run Tests:**
```bash
cd swimbuddz-frontend
npm test
npm run test:coverage
npm run test:e2e
```

## Error Handling Patterns

### Backend

```python
# Consistent error responses
from fastapi import HTTPException

# Not Found
raise HTTPException(status_code=404, detail="Member not found")

# Validation Error
raise HTTPException(status_code=400, detail="Invalid email format")

# Authorization Error
raise HTTPException(status_code=403, detail="Insufficient permissions")

# Server Error
try:
    # risky operation
except Exception as e:
    logger.error(f"Error processing payment: {e}")
    raise HTTPException(status_code=500, detail="Internal server error")
```

### Frontend

```typescript
// Use error boundaries for component errors
// Use try/catch for API calls

try {
  const member = await apiClient.members.getMember(id);
  setMember(member);
} catch (error) {
  if (error.status === 404) {
    showNotification({ message: "Member not found", color: "red" });
  } else {
    showNotification({ message: "Something went wrong", color: "red" });
  }
}
```

## Documentation Update Workflow

### When to Update Docs

**Always update when:**
- Adding new API endpoints → `API_ENDPOINTS.md`
- Changing database schema → `DATABASE_SCHEMA.md`
- Adding new service → `SERVICE_REGISTRY.md`
- Creating new route → `ROUTES_AND_PAGES.md`
- Changing user flow → `UI_FLOWS.md`
- Major architectural decision → Relevant `ARCHITECTURE.md`

### Documentation Standards

- Use clear, concise language
- Include code examples where applicable
- Keep docs close to the code they describe
- Update date at bottom of doc
- Link to related documentation

## Troubleshooting Guide

### Common Issues

**Backend won't start:**
```bash
# Check if ports are in use
lsof -i :8000-8010

# Restart Docker
docker-compose down && docker-compose up --build

# Check logs
docker-compose logs <service_name>
```

**Database migration fails:**
```bash
# Reset database with existing migrations
./scripts/db/reset.sh dev

# If that doesn't work, regenerate all migrations (nuclear option)
./scripts/db/full-reset.sh dev

# Check database status
python scripts/db/status.py
```

**Migration doesn't detect new model/table:**
```bash
# Check that the model is imported in alembic env.py:
# services/<service>/alembic/env.py
# 1. Add import: from services.<service>.models import NewModel
# 2. Add to SERVICE_TABLES: "new_table_name"
# Then regenerate:
./scripts/db/migrate.sh <service>_service "description"
```

**Frontend type errors after backend changes:**
```bash
# Regenerate types
cd swimbuddz-frontend
npm run generate:types

# Clear Next.js cache
rm -rf .next
npm run dev
```

**Supabase auth issues:**
```bash
# Check environment variables
# Verify SUPABASE_URL and SUPABASE_ANON_KEY

# Check JWT in browser DevTools → Application → Cookies
# Should see sb-<project>-auth-token

# Verify user in Supabase dashboard
```

## Local Development

### Backend Scripts (swimbuddz-backend/scripts/)

**IMPORTANT:** Use the provided scripts for database management, NOT direct docker exec commands.

| Task | Command |
|------|---------|
| Generate migration after model change | `./scripts/db/migrate.sh <service>_service "description"` |
| Reset DB (apply existing migrations) | `./scripts/db/reset.sh dev` |
| Nuclear reset (regenerate all migrations) | `./scripts/db/full-reset.sh dev` |
| Seed data only | `./scripts/seed/all.sh dev` |
| Backup migrations | `./scripts/db/backup-migrations.sh` |
| Generate OpenAPI spec | `python scripts/api/generate-openapi.py` |
| Create admin user | `python scripts/auth/create-admin.py` |

**Full documentation:** See `swimbuddz-backend/scripts/README.md`

### Backend Setup
```bash
cd swimbuddz-backend

# Start all services
docker compose up

# Start specific service
docker compose up gateway academy-service members-service

# View logs
docker compose logs -f <service_name>

# Gateway available at localhost:8000
# Individual services at localhost:8001-8010
```

### Frontend Setup
```bash
cd swimbuddz-frontend

# Install dependencies
npm install

# Start development server
npm run dev  # localhost:3000

# Build for production
npm run build
npm run start

# Type checking
npm run type-check

# Linting
npm run lint
```

### Environment Variables

**Backend (.env):**
```bash
DATABASE_URL=postgresql://user:pass@localhost/swimbuddz
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
PAYSTACK_SECRET_KEY=sk_test_xxx
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Important Context

### Product Vision
SwimBuddz serves three distinct personas with different needs:
- **Community Members** - Casual swimmers seeking social connection
- **Club Members** - Committed swimmers with performance goals
- **Academy Students** - Learners in structured cohort-based programs

### Geographic Context
- Primary market: Lagos, Nigeria, Scaling across Africa
- Pool locations: Yaba (Club), multiple community pools
- Currency: Nigerian Naira (₦)
- Mobile-first design (bandwidth-conscious for lower-end devices)
- Consider intermittent internet connectivity

### Business Model
- Community: Low-cost participation, open access
- Club: Membership fees + session fees, structured training
- Academy: Cohort-based program fees (duration varies by program)
- Store: Merchandise and swim gear sales
- Events: Community meets with organizer margin
- Transport: Ride-sharing with optional fees

### User Demographics
- Age range: 6-60+ (different programs for different age groups)
- Tech proficiency: Varies (design for non-technical users)
- Device types: Primarily Android smartphones (mid-range)
- Network: Often 3G, sometimes 4G in Lagos

## Getting Help

If you need clarification:
1. Check [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) for relevant docs
2. Look for examples in existing code
3. Review test files for usage patterns
4. Check `TODO.md` files for related planned work
5. Search commit history for context: `git log --grep="keyword"`
6. Check GitHub issues/PRs for discussions

## Working with This Project

As an AI assistant:
- ✅ **Always verify** before making assumptions about architecture
- ✅ **Read documentation** before suggesting changes
- ✅ **Follow conventions** strictly - consistency matters
- ✅ **Update documentation** when making significant changes
- ✅ **Think in domains** - changes should respect service boundaries
- ✅ **Consider mobile users** - performance and UX matter
- ✅ **Ask questions** if product requirements are unclear
- ✅ **Test your changes** - don't just write code
- ✅ **Review your own work** - check for common pitfalls
- ✅ **Think about edge cases** - what could go wrong?
- ✅ **Consider backwards compatibility** - will this break existing features?
- ✅ **Write clear commit messages** - explain WHY, not just WHAT

### Code Review Checklist (Self-Review)

Before submitting:
- [ ] Does this follow existing patterns in the codebase?
- [ ] Have I updated all relevant documentation?
- [ ] Have I written/updated tests?
- [ ] Have I considered mobile performance?
- [ ] Have I handled error cases?
- [ ] Have I checked for security issues?
- [ ] Is this change backwards compatible?
- [ ] Have I removed debugging code?
- [ ] Does this respect service boundaries?
- [ ] Would I be proud to show this code to a senior developer?

---

*Last updated: January 2026*
*Version: 2.0*