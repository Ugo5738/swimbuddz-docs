# Notification & Announcement Architecture

> **Purpose:** Complete architecture for SwimBuddz's notification system — from current state through massive scale. Written as a handoff document so any agent or developer can pick up implementation.
>
> **Last updated:** 2026-03-17

---

## Table of Contents

1. [Current State](#1-current-state)
2. [Architecture Vision](#2-architecture-vision)
3. [System 1: Announcements (Built)](#3-system-1-announcements-built)
4. [System 2: Personal Notifications (To Build)](#4-system-2-personal-notifications-to-build)
5. [Unified Bell Component](#5-unified-bell-component)
6. [Multi-Channel Delivery](#6-multi-channel-delivery)
7. [Notification Dispatcher](#7-notification-dispatcher)
8. [Data Models](#8-data-models)
9. [API Endpoints](#9-api-endpoints)
10. [Frontend Components](#10-frontend-components)
11. [Phased Rollout](#11-phased-rollout)
12. [Anti-Patterns](#12-anti-patterns)

---

## 1. Current State

### What Exists Today

**Backend (communications_service):**

| Component | Status | Notes |
|-----------|--------|-------|
| `Announcement` model | Complete | title, summary, body, category, audience, status, pinning, scheduling, expiry |
| `AnnouncementRead` model | Complete | Per-member read + acknowledged tracking |
| `AnnouncementCategoryConfig` | Complete | Custom categories with auto-expire |
| `AnnouncementComment` | Complete | Comments on announcements |
| `NotificationPreferences` | Complete | 14+ granular per-member settings (email, push, subscriptions, timing, digests) |
| `ScheduledNotification` | Complete | Background job queue for session notifications |
| `SessionNotificationLog` | Complete | Audit trail of session notifications sent |
| `ContentPost` + `ContentComment` | Complete | Educational content articles with tier-based access |
| `MessageLog` | Complete | Audit trail for coach-to-student messages |
| Announcement CRUD endpoints | Complete | Create, list, update, delete, with audience filtering |
| Unread count endpoint | Complete | `GET /announcements/unread-count?member_id=X` |
| Read-tracking endpoints | Complete | Mark read, get read status, read stats |
| Comment endpoints | Complete | Add/list comments on announcements and content |
| Preference endpoints | Complete | Get/update preferences, check opt-in |
| Messaging endpoints | Complete | Coach → cohort/student messaging with logging |
| Email template system | Complete | 40+ templates (academy, coaching, members, payments, sessions, store) |
| Admin order email | Complete | `send_store_new_order_admin_email()` — notifies admins on paid orders |

**Frontend:**

| Component | Status | Notes |
|-----------|--------|-------|
| `NotificationBell` component | Complete | Dropdown with announcements, read-tracking, polling |
| `MemberLayout` integration | Complete | Bell in sidebar header with unread badge |
| `AdminLayout` bell | Partial | Shows new order count only — not connected to `NotificationBell` |
| `CoachLayout` bell | Missing | Bell icon navigates to `/announcements` page instead of dropdown |
| `/announcements` page | Complete | Full announcement list page |
| `/announcements/[id]` page | Exists | Individual announcement view |

### Key Files

```
swimbuddz-backend/
├── services/communications_service/
│   ├── models/core.py                    # All models (Announcement, NotificationPreferences, etc.)
│   ├── models/enums.py                   # AnnouncementCategory, Status, Audience, etc.
│   ├── routers/
│   │   ├── announcements.py             # Announcement CRUD + read tracking + unread count
│   │   ├── preferences.py              # Notification preferences
│   │   ├── messaging.py                # Coach → student messaging
│   │   ├── email.py                    # Service-to-service email API (40+ templates)
│   │   ├── content.py                  # Content posts CRUD
│   │   └── announcement_categories.py  # Custom category management
│   ├── templates/
│   │   ├── base.py                     # Branded HTML wrapper, colors, CTA button
│   │   ├── academy.py                  # 14+ academy email templates
│   │   ├── coaching.py                 # 5 coaching email templates
│   │   ├── members.py                  # 5 member email templates
│   │   ├── payments.py                 # Payment receipt template
│   │   ├── sessions.py                 # Session confirmation templates
│   │   ├── store.py                    # 3 store email templates
│   │   └── session_notifications.py    # 6 session notification templates
│   └── app/main.py                     # FastAPI app with 7 routers

swimbuddz-frontend/
├── src/components/notifications/
│   └── NotificationBell.tsx            # Reusable bell dropdown component
├── src/components/layout/
│   ├── MemberLayout.tsx                # Uses NotificationBell ✅
│   ├── AdminLayout.tsx                 # Has order-count bell (not NotificationBell) ⚠️
│   └── CoachLayout.tsx                 # Bell navigates to page (no dropdown) ❌
```

---

## 2. Architecture Vision

SwimBuddz needs **two distinct systems** feeding into **one unified inbox**:

```
┌─────────────────────────────────────────────────────┐
│              UNIFIED NOTIFICATION INBOX              │
│         (what the user sees in the bell)             │
│                                                      │
│  ┌──────────────────┐     ┌───────────────────────┐ │
│  │  ANNOUNCEMENTS   │     │    NOTIFICATIONS      │ │
│  │  (broadcast)     │     │    (personal)          │ │
│  │                  │     │                        │ │
│  │  Admin writes    │     │  System generates      │ │
│  │  → audience tier │     │  → individual member   │ │
│  │                  │     │                        │ │
│  │  STATUS: BUILT   │     │  STATUS: TO BUILD      │ │
│  └──────────────────┘     └───────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Announcements** = admin-authored content broadcast to audience tiers. Nobody triggers these automatically.

**Notifications** = system-generated personal alerts triggered by platform events. Nobody writes these manually.

---

## 3. System 1: Announcements (Built)

### What It Does

Admin-authored content broadcast to filtered audiences.

**Examples:**
- "Pool closed Saturday for maintenance"
- "New academy cohort starting in April"
- "Rain update: evening session cancelled"
- "Competition results from last weekend"

### Characteristics

- Created manually by admins via dashboard
- Audience-filtered: community / club / academy (with inheritance — academy sees club + community)
- Long-lived, commentable
- Has own page (`/announcements`) and detail page (`/announcements/[id]`)
- Categories with configurable auto-expiry (rain updates = 24h)
- Supports email delivery on publish (respects preferences)
- Read + acknowledged tracking per member

### What Needs Fixing (Quick Wins)

1. **CoachLayout:** Replace bell icon's `href="/announcements"` with `<NotificationBell>` component
2. **AdminLayout:** Replace custom order-count bell with `<NotificationBell>` (keep order count as a separate concern — see Section 5)
3. **Announcement list endpoint:** Currently returns ALL announcements — should accept `?limit=` and `?unread_only=true` params for the dropdown use case

---

## 4. System 2: Personal Notifications (To Build)

### What It Is

System-generated, personal alerts triggered by events across the platform. Nobody writes these — they're created automatically when things happen.

### Notification Types by Domain

#### Store & Payments
| Event | Recipient | Type Key | Category |
|-------|-----------|----------|----------|
| Order confirmed (payment received) | Buyer | `order_confirmed` | `store` |
| Order ready for pickup | Buyer | `order_ready_pickup` | `store` |
| Order shipped | Buyer | `order_shipped` | `store` |
| New order received | Admins | `admin_new_order` | `store` |
| Payment received | Member | `payment_received` | `payments` |
| Subscription renews in 3 days | Member | `subscription_renewal_reminder` | `payments` |
| Payment failed | Member | `payment_failed` | `payments` |

#### Sessions & Attendance
| Event | Recipient | Type Key | Category |
|-------|-----------|----------|----------|
| Session reminder (24h before) | Registered members | `session_reminder_24h` | `sessions` |
| Session reminder (3h before) | Registered members | `session_reminder_3h` | `sessions` |
| Session cancelled | Registered members | `session_cancelled` | `sessions` |
| Session details updated | Registered members | `session_updated` | `sessions` |
| New session published | Subscribed members | `session_published` | `sessions` |
| Checked in to session | Member | `session_checkin` | `sessions` |
| Ride-share driver en route | Rider | `rideshare_driver_enroute` | `transport` |
| Ride-share confirmed | Rider | `rideshare_confirmed` | `transport` |

#### Academy
| Event | Recipient | Type Key | Category |
|-------|-----------|----------|----------|
| Enrolled in cohort | Student | `academy_enrolled` | `academy` |
| Waitlist promoted | Student | `academy_waitlist_promoted` | `academy` |
| New lesson plan posted | Cohort students | `academy_lesson_posted` | `academy` |
| Assessment results available | Student | `academy_assessment_result` | `academy` |
| Student completed level | Coach | `academy_level_completed` | `academy` |
| Low attendance alert | Coach/Admin | `academy_low_attendance` | `academy` |
| Installment payment due | Student | `academy_payment_due` | `academy` |
| Cohort starting soon | Students | `academy_cohort_starting` | `academy` |

#### Community & Events
| Event | Recipient | Type Key | Category |
|-------|-----------|----------|----------|
| New community event | Community members | `event_new` | `events` |
| RSVP confirmed | Member | `event_rsvp_confirmed` | `events` |
| Earned bubbles reward | Member | `reward_earned` | `community` |
| Referral signup | Referrer | `referral_signup` | `community` |

#### Admin & Coach
| Event | Recipient | Type Key | Category |
|-------|-----------|----------|----------|
| New coach application | Admins | `admin_coach_application` | `admin` |
| Coach agreement expiring | Coach | `coach_agreement_expiring` | `coaching` |
| Members pending approval | Admins | `admin_members_pending` | `admin` |
| Coach assigned to cohort | Coach | `coach_assigned` | `coaching` |

---

## 5. Unified Bell Component

The bell dropdown merges both data sources into one chronological feed:

```
┌──────────────────────────────────────────────────┐
│  🔔 Notifications                            ✕   │
│  ┌────────────────────────────────────────────┐  │
│  │ ● [Academy]  New cohort starting April     │  │  ← Announcement
│  │ ● [Store]    Order #SB-1234 confirmed      │  │  ← Notification
│  │ ● [Session]  Morning Swim tomorrow 6AM     │  │  ← Notification
│  │   [Payment]  ₦15,000 payment received      │  │  ← Notification (read)
│  │   [General]  Pool hours update              │  │  ← Announcement (read)
│  │                                             │  │
│  │         View all notifications →            │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### How It Works

1. **Fetch** latest 8 items from two sources:
   - `GET /announcements/?limit=5` (existing, needs `limit` param)
   - `GET /notifications/?limit=5` (new endpoint)
2. **Merge** by date, take latest 8 combined
3. **Unread count** = unread announcements + unread notifications (two API calls, summed client-side)
4. **Click** an item → marks as read + navigates to `action_url` (notification) or `/announcements/{id}` (announcement)

### Admin Bell (Special Case)

The admin bell shows the same unified feed PLUS admin-specific notifications (new orders, pending approvals, coach applications). These come from the same notification system — they're just notifications with admin-targeted `member_id`.

The current admin-only "new order count" badge on the Store sidebar should remain as a separate concern — it's a quick-glance indicator, not part of the notification system.

---

## 6. Multi-Channel Delivery

Each notification can be delivered through multiple channels:

```
                    ┌──────────────┐
                    │  Event fires  │
                    │  (order paid) │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ Notification  │
                    │  Dispatcher   │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──┐  ┌──────▼──┐  ┌─────▼────┐
       │ In-App  │  │  Email  │  │  Push /   │
       │ (bell)  │  │         │  │  Browser  │
       └─────────┘  └─────────┘  └──────────┘
       Always        Based on      Based on
       created       member's      member's
                     preferences   preferences
```

### Channel Behavior

| Channel | When | Cost | Latency |
|---------|------|------|---------|
| **In-app** (bell) | Always — every notification creates a DB row | Zero | Instant (next poll) |
| **Email** | Respects `NotificationPreferences` | Per-email cost | Seconds |
| **Browser push** | Urgent only (cancellations, ready for pickup) | Zero | Instant |
| **Sound** | Admin-only for new orders | Zero | Instant |

### Preference Mapping

The existing `NotificationPreferences` model already has most of the flags needed:

| Preference Field | Maps To |
|-----------------|---------|
| `email_announcements` | Email channel for announcements |
| `email_session_reminders` | Email for session_reminder_* notifications |
| `email_academy_updates` | Email for academy_* notifications |
| `email_payment_receipts` | Email for payment_* and order_* notifications |
| `email_coach_messages` | Email for coach-to-student messages |
| `push_announcements` | Browser push for announcements |
| `push_session_reminders` | Browser push for session notifications |
| `push_academy_updates` | Browser push for academy notifications |
| `push_coach_messages` | Browser push for coach messages |

**New preference fields to add** (when needed):
- `email_store_updates` — for order status emails to buyers
- `email_community_updates` — for events and rewards
- `push_store_updates` — browser push for order ready

---

## 7. Notification Dispatcher

### Architecture

The dispatcher lives in **communications_service** and is called by other services through the gateway.

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│   Store     │     │  Sessions  │     │  Academy   │
│  Service    │     │  Service   │     │  Service   │
└─────┬──────┘     └─────┬──────┘     └─────┬──────┘
      │                  │                   │
      │  POST /notify    │  POST /notify     │  POST /notify
      │  (via gateway)   │  (via gateway)    │  (via gateway)
      │                  │                   │
      └────────────┬─────┴───────────────────┘
                   │
            ┌──────▼───────────┐
            │  Communications  │
            │    Service       │
            │                  │
            │ • Create notif   │
            │   row in DB      │
            │ • Check prefs    │
            │ • Send email     │
            │   (if opted in)  │
            │ • Track delivery │
            └──────────────────┘
```

### Dispatcher Endpoint

```
POST /api/v1/communications/notifications/dispatch
Authorization: Bearer <service_role_token>

{
  "type": "order_confirmed",
  "category": "store",
  "member_ids": ["uuid-1"],           // WHO gets notified
  "title": "Order Confirmed",
  "body": "Your order #SB-1234 has been confirmed and is being processed.",
  "action_url": "/account/orders/SB-1234",
  "icon": "shopping-bag",
  "metadata": {                       // Optional extra context
    "order_id": "uuid-xxx",
    "order_number": "SB-1234",
    "amount": 15000
  },
  "channels": ["in_app", "email"],    // Which channels to use
  "email_template": "store_order_confirmation",  // Which email template
  "email_data": { ... }              // Template-specific data
}
```

### Dispatcher Logic (Pseudocode)

```python
async def dispatch_notification(payload):
    for member_id in payload.member_ids:
        # 1. Always create in-app notification
        notification = Notification(
            member_id=member_id,
            type=payload.type,
            category=payload.category,
            title=payload.title,
            body=payload.body,
            action_url=payload.action_url,
            icon=payload.icon,
            metadata=payload.metadata,
        )
        db.add(notification)

        # 2. Check email preference + send if opted in
        if "email" in payload.channels:
            prefs = await get_preferences(member_id)
            pref_field = CATEGORY_TO_PREF_MAP[payload.category]
            if getattr(prefs, f"email_{pref_field}", True):
                await send_template_email(
                    template_type=payload.email_template,
                    member_id=member_id,
                    template_data=payload.email_data,
                )

    await db.commit()
    return {"dispatched": len(payload.member_ids)}
```

### Calling From Other Services

Services call the dispatcher via HTTP through the gateway, using the existing `service_client` pattern:

```python
# In store_service/routers/checkout.py
from libs.common.service_client import post_to_service

async def _notify_buyer_order_confirmed(order, member):
    await post_to_service(
        "communications",
        "/notifications/dispatch",
        json={
            "type": "order_confirmed",
            "category": "store",
            "member_ids": [str(order.member_id)],
            "title": "Order Confirmed",
            "body": f"Your order #{order.order_number} has been confirmed.",
            "action_url": f"/account/orders/{order.order_number}",
            "icon": "shopping-bag",
            "channels": ["in_app", "email"],
            "email_template": "store_order_confirmation",
            "email_data": {
                "order_number": order.order_number,
                "items": [...],
                "total": float(order.total),
            },
        },
    )
```

---

## 8. Data Models

### New Model: `Notification`

Add to `services/communications_service/models/core.py`:

```python
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # Classification
    type = Column(String(100), nullable=False, index=True)       # e.g. "order_confirmed"
    category = Column(String(50), nullable=False, index=True)    # e.g. "store", "sessions"

    # Display
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)                     # Lucide icon name

    # Action
    action_url = Column(String(500), nullable=True)              # Where clicking navigates

    # Extra context
    metadata = Column(JSONB, nullable=True)

    # State
    read_at = Column(DateTime(timezone=True), nullable=True)     # null = unread
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)  # Auto-cleanup
```

**Key design decisions:**
- **One row per member** — broadcasting to 100 members = 100 rows (unlike announcements which are one row with audience filtering)
- **`read_at` instead of separate table** — simpler than AnnouncementRead since notifications are already per-member
- **`action_url`** — clicking navigates somewhere useful (order page, session detail, etc.)
- **`type`** — machine-readable, used for deduplication and grouping
- **`category`** — human grouping for filtering UI
- **`metadata` (JSONB)** — flexible bag for any extra context the frontend might need
- **`expires_at`** — enables periodic cleanup of old notifications

### Indexes

```python
# Composite index for the main query pattern: "get unread for member, newest first"
Index("ix_notifications_member_unread", "member_id", "read_at", "created_at")

# For cleanup jobs
Index("ix_notifications_expires", "expires_at", postgresql_where=text("expires_at IS NOT NULL"))
```

### Migration Checklist

1. Import `Notification` in `services/communications_service/alembic/env.py`
2. Add `"notifications"` to `SERVICE_TABLES` set
3. Generate: `./scripts/db/migrate.sh communications_service "add notifications table"`
4. Review generated migration
5. Apply: `./scripts/db/reset.sh dev`

---

## 9. API Endpoints

### New Endpoints (communications_service)

Add a new router: `services/communications_service/routers/notifications.py`

```
# Member-facing
GET  /notifications/                    # List notifications for current user
GET  /notifications/unread-count        # Unread count for current user
POST /notifications/{id}/read           # Mark single notification as read
POST /notifications/read-all            # Mark all as read
DELETE /notifications/{id}              # Dismiss/delete a notification

# Service-to-service (requires service_role)
POST /notifications/dispatch            # Create + deliver notification(s)

# Admin
GET  /notifications/admin/stats         # Notification volume stats
POST /notifications/admin/cleanup       # Purge expired notifications
```

### Endpoint Details

#### `GET /notifications/`

```
Query params:
  - category (optional): filter by category ("store", "sessions", etc.)
  - unread_only (optional, bool): only return unread
  - limit (optional, int): default 20, max 50
  - offset (optional, int): pagination

Response:
{
  "items": [
    {
      "id": "uuid",
      "type": "order_confirmed",
      "category": "store",
      "title": "Order Confirmed",
      "body": "Your order #SB-1234 has been confirmed.",
      "icon": "shopping-bag",
      "action_url": "/account/orders/SB-1234",
      "read_at": null,
      "created_at": "2026-03-17T10:30:00Z"
    }
  ],
  "total": 42,
  "unread_count": 5
}
```

#### `GET /notifications/unread-count`

```
Response:
{
  "unread_count": 5
}
```

#### `POST /notifications/dispatch`

See Section 7 for request/response format.

### Existing Endpoint Changes

#### `GET /announcements/` — Add query params:

```
New params:
  - limit (optional, int): default 50, max 100
  - unread_only (optional, bool): requires member_id param
```

### Register Router in App

In `services/communications_service/app/main.py`:

```python
from routers.notifications import router as notifications_router
app.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
```

---

## 10. Frontend Components

### Updated `NotificationBell` Component

The existing `NotificationBell.tsx` needs to be extended to merge both data sources:

```typescript
// Pseudocode for the merged fetch
const fetchItems = async () => {
  const [announcements, notifications] = await Promise.all([
    apiGet<Announcement[]>("/api/v1/communications/announcements/?limit=5"),
    apiGet<NotificationItem[]>("/api/v1/communications/notifications/?limit=5"),
  ]);

  // Normalize to common shape
  const announcementItems = announcements.map(a => ({
    id: a.id,
    source: "announcement" as const,
    category: a.category,
    title: a.title,
    summary: a.summary,
    isRead: a._isRead,
    actionUrl: `/announcements/${a.id}`,
    createdAt: a.published_at || a.created_at,
  }));

  const notificationItems = notifications.items.map(n => ({
    id: n.id,
    source: "notification" as const,
    category: n.category,
    title: n.title,
    summary: n.body,
    isRead: !!n.read_at,
    actionUrl: n.action_url,
    icon: n.icon,
    createdAt: n.created_at,
  }));

  // Merge and sort by date, take latest 8
  const merged = [...announcementItems, ...notificationItems]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  setItems(merged);
};
```

### Unified Unread Count

```typescript
const fetchUnreadCount = async () => {
  const [annCount, notifCount] = await Promise.all([
    apiGet<{ unread_count: number }>(`/api/v1/communications/announcements/unread-count?member_id=${memberId}`),
    apiGet<{ unread_count: number }>("/api/v1/communications/notifications/unread-count"),
  ]);
  setUnreadCount(annCount.unread_count + notifCount.unread_count);
};
```

### Layout Integration Checklist

| Layout | Current State | Target State |
|--------|--------------|--------------|
| `MemberLayout` | Uses `<NotificationBell>` | No changes needed (already correct) |
| `CoachLayout` | Bell navigates to `/announcements` | Replace with `<NotificationBell>` |
| `AdminLayout` | Custom order-count bell | Replace with `<NotificationBell>` + keep order badge on sidebar |

### Notification Center Page (Future)

`/account/notifications` — full-page view of all notifications with:
- Category filter tabs (All / Store / Sessions / Academy / Payments)
- Mark all as read
- Pagination
- Click to navigate to action_url

---

## 11. Phased Rollout

### Phase 1: Fix Current UX (Quick Wins) ✅ Mostly Done

**Effort:** Small | **Impact:** High

- [x] Build `NotificationBell` dropdown component
- [x] Integrate into `MemberLayout`
- [x] Admin order email notifications
- [x] Admin order count badge + notification sound
- [ ] Integrate `NotificationBell` into `CoachLayout`
- [ ] Integrate `NotificationBell` into `AdminLayout` (replacing custom bell)
- [ ] Add `limit` param to announcements list endpoint

### Phase 2: Personal Notifications Foundation

**Effort:** Medium | **Impact:** High

- [ ] Create `Notification` model + migration
- [ ] Create notifications router (CRUD endpoints)
- [ ] Create notification dispatcher endpoint
- [ ] Update `NotificationBell` to merge announcements + notifications
- [ ] Wire store order → dispatch notification to buyer
- [ ] Wire store order → dispatch notification to admins (replace direct email logic)

### Phase 3: Wire Up All Domains

**Effort:** Medium | **Impact:** Medium

- [ ] Wire session reminders → notifications (extend existing `ScheduledNotification` system)
- [ ] Wire academy enrollment → notifications
- [ ] Wire payment receipts → notifications
- [ ] Wire ride-share events → notifications
- [ ] Build notification center page (`/account/notifications`)

### Phase 4: Preference Controls UI

**Effort:** Medium | **Impact:** Medium

- [ ] Build notification preferences page in member settings
- [ ] Per-category channel toggles (in-app / email / push)
- [ ] Add new preference fields for store and community
- [ ] Weekly digest email (leverages existing `weekly_digest` preference)

### Phase 5: Real-Time (When DAU Demands It)

**Effort:** Large | **Impact:** High at scale

- [ ] Replace polling with **Server-Sent Events (SSE)**
  - SSE is simpler than WebSocket and sufficient (one-directional server→client)
  - Gateway holds SSE connections, pushes events when notifications created
  - Instant badge updates, no 60-second polling delay
- [ ] Add Web Push API support (service workers for mobile browser push)
- [ ] Push notification permission flow in onboarding

### Phase 6: At Massive Scale (1000+ DAU)

**Effort:** Large | **Impact:** Infrastructure

- [ ] **Message queue** (Redis Streams or RabbitMQ) between services and dispatcher
  - Services publish events → queue → dispatcher creates notifications + sends emails
  - Decouples services from communications_service availability
- [ ] **Batch digest emails** — "You have 5 unread notifications" weekly
- [ ] **Notification TTL + cleanup job** — purge expired notifications nightly
- [ ] **Rate limiting** — prevent notification storms (max N per member per hour)
- [ ] **Notification grouping** — collapse similar notifications ("3 new orders" instead of 3 separate)

---

## 12. Anti-Patterns

### Don't: Create Notifications in Every Service

Each service should NOT create notification records directly in the database. Always go through the dispatcher endpoint.

**Why:** Centralized delivery logic, preference checking, and audit trail.

### Don't: Send Emails Without Checking Preferences

Every email must check `NotificationPreferences` first. The dispatcher handles this automatically — direct email sends bypass preference checks.

**Exception:** Transactional emails (password reset, payment confirmation) always send regardless of preferences.

### Don't: Store Notification Content in Multiple Places

Notifications are the source of truth for "what happened." Don't also store notification text in order records, session records, etc.

### Don't: Poll More Frequently Than Necessary

60-second polling is sufficient for Phase 1-4. Don't reduce to 5-10 seconds — it wastes bandwidth on Lagos mobile networks. If real-time is needed, implement SSE (Phase 5).

### Don't: Create One Notification Model Per Domain

There should be ONE `Notification` model in communications_service, not `StoreNotification`, `SessionNotification`, `AcademyNotification` in separate services. The `type` and `category` fields handle domain distinction.

### Don't: Bypass the Gateway for Notification Dispatch

Services must call `POST /api/v1/communications/notifications/dispatch` through the gateway, not import communications_service code directly. This maintains service isolation.

---

## Appendix A: Category-to-Icon Mapping

For the frontend bell dropdown:

```typescript
const CATEGORY_ICONS: Record<string, string> = {
  store: "shopping-bag",
  payments: "credit-card",
  sessions: "calendar",
  academy: "graduation-cap",
  coaching: "clipboard",
  transport: "car",
  events: "users",
  community: "heart",
  admin: "shield",
  general: "bell",
};
```

## Appendix B: Category-to-Color Mapping

```typescript
const CATEGORY_COLORS: Record<string, string> = {
  store: "bg-amber-100 text-amber-700",
  payments: "bg-green-100 text-green-700",
  sessions: "bg-blue-100 text-blue-700",
  academy: "bg-purple-100 text-purple-700",
  coaching: "bg-indigo-100 text-indigo-700",
  transport: "bg-teal-100 text-teal-700",
  events: "bg-pink-100 text-pink-700",
  community: "bg-rose-100 text-rose-700",
  admin: "bg-slate-100 text-slate-700",
  general: "bg-slate-100 text-slate-600",
};
```

## Appendix C: Existing NotificationPreferences Fields

From `communications_service/models/core.py`:

```
Email flags:
  email_announcements, email_session_reminders, email_academy_updates,
  email_payment_receipts, email_coach_messages, email_marketing

Push flags:
  push_announcements, push_session_reminders, push_academy_updates,
  push_coach_messages

Session subscriptions:
  subscribe_community_sessions, subscribe_club_sessions, subscribe_event_sessions

Timing:
  reminder_24h_enabled, reminder_3h_enabled

Digest:
  weekly_digest, weekly_session_digest
```

All default to `True` except `email_marketing` (defaults to `False`).
