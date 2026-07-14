# Community Layer Documentation

Documentation for the **Community Layer** - social swimming, open meets, and casual engagement.

---

## Overview

The Community Layer serves casual swimmers who want social connection and flexible participation without formal commitments. This is the entry point for most members.

### Key Characteristics

- **Open Access** - Low barrier to entry, minimal requirements
- **Flexible Participation** - Drop-in style, no long-term commitments
- **Social Focus** - Emphasis on community building and networking
- **Event-Based** - Community meetups, social swims, open water trips

---

## Related Services

| Service | Purpose |
|---------|---------|
| **Events Service** | Community event creation and RSVP management |
| **Sessions Service** | Open swim sessions (session_type: community) |
| **Media Service** | Event photo galleries and community content |
| **Communications Service** | Community announcements and newsletters |

---

## Documentation Files

Current Community Layer documentation:

- **[ANNUAL_ACTIVITY_CALENDAR.md](./ANNUAL_ACTIVITY_CALENDAR.md)** - Annual operating calendar across Community, Club, and Academy; online talks; website visibility; private pod rules
- **[COMMUNITY_EXPERIENCE_DESIGN.md](./COMMUNITY_EXPERIENCE_DESIGN.md)** - Community tier strategy, member buckets, WhatsApp-first value, conversion flows
- **[WHATSAPP_PLAYBOOK.md](./WHATSAPP_PLAYBOOK.md)** - WhatsApp Community structure, weekly rhythm, prompts, moderation, prospect group rules
- **[TIER_BOUNDARY_POLICY.md](./TIER_BOUNDARY_POLICY.md)** - Tier access rules, open meetups, and warm boundary handling
- **[POOL_AMBASSADOR_PROGRAM.md](./POOL_AMBASSADOR_PROGRAM.md)** - Poolside prospect engagement, volunteer scripts, and conversion tracking
- **[VOLUNTEER_ROLES.md](./VOLUNTEER_ROLES.md)** - Volunteer roles, tiers, recognition, and reliability model
- **[SUNSCREEN_GUIDE.md](./SUNSCREEN_GUIDE.md)** - Community-facing sunscreen and swim skincare guide

### Planned Documentation

- **COMMUNITY_ARCHITECTURE.md** - Community layer design and patterns
- **COMMUNITY_EVENTS.md** - Event types, creation workflow, RSVP management
- **COMMUNITY_ENGAGEMENT.md** - Member engagement strategies, retention
- **COMMUNITY_MODERATION.md** - Community guidelines, moderation tools

---

## Key Differences from Club/Academy

| Aspect | Community | Club | Academy |
|--------|-----------|------|---------|
| **Commitment** | Drop-in | Regular attendance | Cohort-based enrollment |
| **Cost** | Low/Pay-per-event | Membership + session fees | Program fees |
| **Structure** | Informal | Structured training | Formal curriculum |
| **Goals** | Social, fitness | Performance improvement | Skill acquisition |
| **Attendance** | Optional | Tracked, consequences | Required, tracked |

---

## Frontend Routes

### Public Routes
- `/events` - Browse community events
- `/events/[id]` - Event details and RSVP

### Member Routes
- `/account/events` - My RSVP'd events
- `/account/community` - Community participation dashboard

### Admin Routes
- `/admin/events` - Manage community events
- `/admin/events/create` - Create new event
- `/admin/events/[id]` - Edit event

---

## API Endpoints

See [API_ENDPOINTS.md](../../swimbuddz-backend/API_ENDPOINTS.md) for complete API reference.

**Key Endpoints:**
- `GET /api/v1/events` - List community events
- `POST /api/v1/events` - Create event (admin)
- `POST /api/v1/events/{id}/rsvp` - RSVP to event
- `GET /api/v1/events/{id}/attendees` - View event attendees

---

## Related Documentation

- [SERVICE_REGISTRY.md](../reference/SERVICE_REGISTRY.md) - Events service details
- [ROUTES_AND_PAGES.md](../../swimbuddz-frontend/ROUTES_AND_PAGES.md) - Community routes
- [UI_FLOWS.md](../../swimbuddz-frontend/UI_FLOWS.md) - Community user flows

---

*Last updated: January 2026*
