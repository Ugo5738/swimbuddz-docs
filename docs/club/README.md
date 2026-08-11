# Club Layer Documentation

Documentation for the **Club Layer** - structured training sessions with strict attendance tracking.

---

## Overview

The Club Layer serves committed swimmers with performance goals who want structured training and accountability. Club members have regular attendance requirements and tracked participation.

### Key Characteristics

- **Structured Training** - Regular sessions with coaches and training plans
- **Attendance Requirements** - Members expected to attend regularly
- **Performance Focus** - Technical improvement and fitness goals
- **Accountability** - Tracked attendance, payment requirements
- **Membership-Based** - Monthly/annual membership fees + session fees

---

## Related Services

| Service | Purpose |
|---------|---------|
| **Sessions Service** | Club training sessions (session_type: club) |
| **Attendance Service** | Session sign-in, attendance tracking, no-show management |
| **Members Service** | Club membership status and profiles |
| **Payments Service** | Membership fees, session fees, payment verification |
| **Transport Service** | Ride-sharing for club sessions |

---

## Documentation Files

- **[POD_OPERATIONS.md](./POD_OPERATIONS.md)** - How Club pods are constituted, named, and run (size, naming, lifecycle, backend model)
- **[POD_ROSTER_DESIGN.md](./POD_ROSTER_DESIGN.md)** - Admin roster, assignment history, privacy, capacity, quarter review, and delivery sequence
- **[POD_LEAD_GUIDE.md](./POD_LEAD_GUIDE.md)** - What a Pod Lead does at and around the Saturday session (formerly PEER_LEADER_GUIDE.md)
- **[PRICING_STRATEGY.md](./PRICING_STRATEGY.md)** - Club membership fees, transition bridges, Pod Lead perks
- **[SESSION_COSTING_AND_LOCATION_PRICING.md](./SESSION_COSTING_AND_LOCATION_PRICING.md)** - Operating areas, effective-dated pool/refreshment rates, session budget snapshots, and location pricing

### Planned Documentation

- **CLUB_ARCHITECTURE.md** - Club layer design and membership model
- **CLUB_ATTENDANCE.md** - Attendance policies, tracking, consequences
- **CLUB_TRAINING.md** - Training structure and pod-led progression

---

## Key Differences from Community/Academy

| Aspect | Community | Club | Academy |
|--------|-----------|------|---------|
| **Commitment** | Drop-in | Regular attendance | Cohort-based enrollment |
| **Cost** | Low/Pay-per-event | Membership + session fees | Program fees |
| **Structure** | Informal | Structured training | Formal curriculum |
| **Goals** | Social, fitness | Performance improvement | Skill acquisition |
| **Attendance** | Optional | Tracked, consequences | Required, tracked |
| **Duration** | Event-based | Ongoing membership | Fixed program duration |

---

## Frontend Routes

### Public Routes
- `/club` - Club overview and benefits
- `/club/schedule` - Club training schedule

### Member Routes
- `/account/club` - Club membership dashboard
- `/account/attendance` - Attendance history and stats
- `/sessions/[id]/sign-in` - Session sign-in (3-step flow)

### Admin Routes
- `/admin/sessions` - Manage club sessions
- `/admin/sessions/create` - Create session
- `/admin/sessions/[id]/attendance` - View/manage session attendance
- `/admin/members/attendance` - Member attendance reports

---

## API Endpoints

See [API_ENDPOINTS.md](../../swimbuddz-backend/API_ENDPOINTS.md) for complete API reference.

**Key Endpoints:**
- `GET /api/v1/sessions` - List sessions (filter by type: club)
- `POST /api/v1/sessions` - Create session (admin)
- `POST /api/v1/sessions/{id}/sign-in` - Sign in to session
- `GET /api/v1/members/me/attendance` - View my attendance
- `PATCH /api/v1/attendance/{id}` - Update attendance record (admin)

---

## Session Sign-In Flow

The 3-step session sign-in flow is core to the Club experience:

1. **Step 1: Session Overview**
   - View session details (date, time, location, fees)

2. **Step 2: Identity**
   - Authenticate or confirm identity

3. **Step 3: Options & Submit**
   - Select time variant (full session, late, early)
   - Select ride-share option (none, passenger, driver)
   - Submit sign-in

See [UI_FLOWS.md](../../swimbuddz-frontend/UI_FLOWS.md#2-existing-member--session-sign-in-3-step-flow) for detailed flow.

---

## Ride-Sharing Integration

Club members can coordinate rides to sessions:

- **Passengers** - Request rides from specific pickup locations
- **Drivers** - Offer seats with pickup location and fee
- **Admin Coordination** - Match passengers to drivers

See [Transport Service README](../../swimbuddz-backend/services/transport_service/README.md) for details.

---

## Related Documentation

- [SERVICE_REGISTRY.md](../reference/SERVICE_REGISTRY.md) - Sessions, Attendance, Transport services
- [ROUTES_AND_PAGES.md](../../swimbuddz-frontend/ROUTES_AND_PAGES.md) - Club routes
- [UI_FLOWS.md](../../swimbuddz-frontend/UI_FLOWS.md) - Club user flows

---

*Last updated: January 2026*
