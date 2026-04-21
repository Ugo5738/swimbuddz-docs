# Swimbuddz Roles and Positions Structure

This document outlines all the roles, jobs, and positions required to ensure the "best outcome" for the Swimbuddz platform. It covers technical system roles (RBAC), operational staff positions, and community engagement roles.

## 1. System Roles (Technical/RBAC)
These are roles defined within the software platform that control access to features and data.

| Role | Access Level | Responsibilities |
|------|--------------|------------------|
| **Platform Admin** | Full Access | Global system configuration, user management, sensitive data access (`require_admin`). |
| **Safeguarding Admin** | Safeguarding queue | Reviews reported content, approves/quarantines flagged media, verifies guardian links, manages code-of-conduct acceptance. **Not automatically granted to Platform Admins** — assigned explicitly. Gated by `require_safeguarding_admin`. See [CHAT_SERVICE_DESIGN.md](../design/CHAT_SERVICE_DESIGN.md) §6. |
| **Coach** | Coach Dashboard | Managing assigned cohorts, tracking student progress, marking attendance (`require_coach`). |
| **Member** | Member Dashboard | Basic user role. Can enroll in programs, view personal progress. |
| **Guardian/Parent** | Linked Account | An adult member linked to a minor member via `GuardianLink` (members_service). Must be verified by an admin before granting safeguarding-sensitive access (e.g. entering a coach–minor DM). |

### Role storage

Roles are stored as a Postgres `TEXT[]` array on `members.roles`. A member can hold multiple roles simultaneously (e.g. `["member", "coach", "safeguarding_admin"]`). Role strings are lowercase, snake_case. No schema change is required to introduce a new role — document it here and add the corresponding `require_*` dependency under `libs/auth/dependencies.py`.

---

## 2. Operational Jobs & Positions
These are the human workforce positions required to run the business and platform operations effectively.

### A. Leadership & Administration
*   **Platform Administrator**: High-level overseer of the digital platform. Handles technical issues, user bans, and high-level configuration.
*   **Operations Manager**: Oversees physical operations, including facility partnerships and staff scheduling.
*   **Financial/Payment Administrator**: Reconciles Paystack payments, manages coach payouts, and handles refunds.

### B. Academy Operations
*   **Head Coach**: Sets curriculum standards, approves new coach applications, and manages quality control.
*   **Academy Manager**: Oversees cohort schedules, capacity planning, and student communications.
*   **Cohort Coach**:
    *   **Senior Coach**: Leads sessions, assesses milestones, provides student feedback.
    *   **Assistant Coach**: Supports session logistics and safety.
*   **Curriculum Developer**: Creates and updates program content, lesson plans, and skill trees.

### C. Store & E-Commerce Operations
*   **Store Manager**: Responsible for catalog management, pricing strategies, and "Product Issues".
*   **Inventory Clerk**: Monitors stock levels, handles restocking, and performs physical inventory counts.
*   **Fulfillment Coordinator**: Processes "Paid" orders to "Processing", assigns drivers, and manages packaging.
*   **Pickup Location Staff**: Verified staff at physical locations (Rowe Park, Lekki, VI) who verify identity and hand over orders.
*   **Delivery Driver**: Third-party or internal drivers responsible for "Shipped" order delivery validation.

### D. Club & Community Operations
*   **Pool/Facility Coordinator**: On-site manager at partner pools (Yaba, etc.) ensuring facility readiness.
*   **Lane Marshal**: Volunteers or staff who manage swim lane safety and etiquette during open sessions.
*   **Check-in / Attendance Staff**: Uses the standard admin/coach tablet to mark attendance at the gate.
*   **Media Team**: Photographers/Videographers for capturing session highlights and marketing content.

### E. Digital Workforce (AI-Assisted Roles)
These roles are primarily executed by the Founder/Leadership team using specialized AI "Employees" (Skills).

*   **Curriculum Architect (AI)**:
    *   **Function**: Designs pedagogical structures, weekly lesson plans, and drill progressions.
    *   **Human Overseer**: Head of Content / Founder.
*   **Policy & Ops Specialist (AI)**:
    *   **Function**: Drafts legal, safety, and operational policy documents based on raw constraints.
    *   **Human Overseer**: Platform Administrator.
*   **Content Repurposer (AI)**:
    *   **Function**: Contextualizes raw inputs (notes, videos) into multi-platform marketing assets.
    *   **Human Overseer**: Content Manager.

---

## 3. Membership Tiers & Segments (Community Roles)
These describe the customer segments within the platform.

*   **Community Member**: Casual swimmer, social engagement focus.
*   **Club Member**: Performance-oriented, committed regular swimmer (paid subscription).
*   **Academy Student**: Learner enrolled in specific educational cohorts.
*   **Alumni**: Graduated Academy student (potential future mentor/volunteer).

---

## 4. Volunteer Roles
Opportunities for members to contribute to the community.

*   **Event Logisticians**: Help run community meets and social events.
*   **Peer Mentors**: Experienced Club members assisting beginners.
*   **Social Ambassadors**: manage sub-community groups or "pods".

---

## 5. External Support
*   **Technical Support (Dev Team)**: Resolves software bugs and maintains uptime.
*   **Paystack Support**: External contact for payment gateway resolutions.
