# Service Communication Patterns

**Critical guidelines for inter-service communication in the SwimBuddz microservices architecture.**

---

## Overview

SwimBuddz uses a **microservices architecture** with strict service isolation. Services must remain independent and communicate only through well-defined interfaces.

**Purpose of this document:**
- Define allowed and forbidden communication patterns
- Provide code examples for correct patterns
- Explain the rationale behind these rules
- Document exceptions and edge cases

---

## Core Principles

### 1. Service Independence

Each service owns its data and business logic:
- Services have separate database schemas
- Services can be deployed independently
- Services can scale independently
- Services can fail independently without cascading failures

### 2. No Direct Coupling

**Services must NOT:**
- Import code from other services
- Access other services' database tables directly
- Share models between services (except through shared libs)
- Have circular dependencies

### 3. Communication via Defined Interfaces

**Services communicate through:**
- HTTP/REST APIs
- Shared libraries (`libs/`)
- Message queues (future implementation)

---

## ❌ Forbidden Patterns

### 1. Direct Service Imports

**DON'T DO THIS:**

```python
# ❌ WRONG: Importing from another service
from services.members_service.models import Member
from services.academy_service.schemas import ProgramRead

# This creates tight coupling and deployment issues
```

**Why it's forbidden:**
- Creates deployment dependencies (must deploy services together)
- Breaks service independence
- Makes testing difficult
- Prevents independent scaling
- Causes circular dependency issues

### 2. Cross-Service Database Queries

**DON'T DO THIS:**

```python
# ❌ WRONG: Querying another service's table directly
from services.members_service.models import Member

def get_enrollment_with_member(enrollment_id: str, db: Session):
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()

    # DON'T query Member table from academy service
    member = db.query(Member).filter(Member.id == enrollment.member_id).first()

    return {"enrollment": enrollment, "member": member}
```

**Why it's forbidden:**
- Violates service boundaries
- Breaks encapsulation
- Makes schema changes dangerous (affects multiple services)
- Prevents service-level database optimization
- Makes database sharding/splitting impossible

### 3. Shared Models (Outside libs/)

**DON'T DO THIS:**

```python
# ❌ WRONG: Sharing models between services
# In services/common/shared_models.py
class Member(Base):
    __tablename__ = "members"
    id = Column(UUID, primary_key=True)
    # ...

# Then importing in multiple services
from services.common.shared_models import Member  # DON'T DO THIS
```

**Why it's forbidden:**
- Creates hidden dependencies
- Makes versioning difficult
- Couples database schemas across services

---

## ✅ Correct Patterns

### 1. HTTP API Calls

**The primary communication method between services.**

#### Example: Academy Service Needs Member Info

```python
# ✅ CORRECT: services/academy_service/app.py
import httpx
from typing import Optional, Dict, Any

# Get service URLs from environment
MEMBERS_SERVICE_URL = os.getenv("MEMBERS_SERVICE_URL", "http://members-service:8001")

async def get_member_info(member_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch member information from Members Service.

    Returns None if member not found or service unavailable.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{MEMBERS_SERVICE_URL}/api/v1/members/{member_id}",
                timeout=5.0  # Don't wait forever
            )

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 404:
                return None
            else:
                # Log error but don't crash
                print(f"Error fetching member {member_id}: {response.status_code}")
                return None

    except httpx.TimeoutException:
        print(f"Timeout fetching member {member_id}")
        return None
    except Exception as e:
        print(f"Error fetching member {member_id}: {e}")
        return None

# Use in endpoint
@app.get("/api/v1/academy/enrollments/{enrollment_id}")
async def get_enrollment(enrollment_id: str, db: Session = Depends(get_db)):
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()

    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    # Fetch member info from Members Service
    member_info = await get_member_info(enrollment.member_id)

    return {
        "enrollment": enrollment,
        "member": member_info  # May be None if service down
    }
```

**Best Practices:**
- Use async HTTP clients (httpx, aiohttp)
- Set reasonable timeouts (5-10 seconds)
- Handle errors gracefully (don't crash if service unavailable)
- Cache responses when appropriate
- Log failures for monitoring

#### Example: Payments Service Validates Member

```python
# ✅ CORRECT: services/payments_service/app.py
import httpx

async def validate_member_exists(member_id: str) -> bool:
    """Check if member exists before processing payment."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{MEMBERS_SERVICE_URL}/api/v1/members/{member_id}",
                timeout=5.0
            )
            return response.status_code == 200
    except Exception:
        # If we can't reach members service, fail safely
        return False

@app.post("/api/v1/payments")
async def create_payment(payment_data: PaymentCreate, db: Session = Depends(get_db)):
    # Validate member exists
    if not await validate_member_exists(payment_data.member_id):
        raise HTTPException(status_code=400, detail="Invalid member ID")

    # Create payment record
    payment = Payment(**payment_data.dict())
    db.add(payment)
    db.commit()

    return payment
```

### 2. Foreign Key References (Without Joins)

**Store IDs, but don't join across services.**

```python
# ✅ CORRECT: Store member_id as UUID, but don't join to members table
class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(UUID, primary_key=True, default=uuid.uuid4)
    cohort_id = Column(UUID, ForeignKey("cohorts.id"), nullable=False)

    # Store member_id, but NO relationship to Member model
    member_id = Column(UUID, nullable=False, index=True)  # Reference only

    # Don't do this:
    # member = relationship("Member")  # ❌ Member is in another service
```

**When you need member data:**

```python
# Fetch enrollment
enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()

# Then fetch member via API (not database join)
member_info = await get_member_info(enrollment.member_id)
```

### 3. Shared Libraries

**Use `libs/` for truly common code.**

```python
# ✅ CORRECT: libs/auth/auth.py
# Authentication logic used by ALL services
from fastapi import Depends, HTTPException
from jose import jwt, JWTError

def get_current_user(token: str = Depends(oauth2_scheme)):
    """Validate JWT token - used by all services."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

```python
# ✅ CORRECT: libs/db/database.py
# Database connection logic used by ALL services
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**What belongs in shared libs:**
- Authentication/authorization logic
- Database connection management
- Common utilities (date formatting, validation)
- API response models (if truly generic)

**What does NOT belong in shared libs:**
- Business logic specific to one service
- Database models (each service owns its models)
- Service-specific schemas

### 4. Event-Driven Communication (Future)

**For async operations, use message queues.**

```python
# ✅ FUTURE PATTERN: Using message queue (RabbitMQ, Redis)
# services/academy_service/app.py
import aio_pika

async def publish_enrollment_created(enrollment_id: str, member_id: str):
    """Publish event when student enrolls."""
    connection = await aio_pika.connect_robust("amqp://localhost/")
    async with connection:
        channel = await connection.channel()

        await channel.default_exchange.publish(
            aio_pika.Message(
                body=json.dumps({
                    "event": "enrollment.created",
                    "enrollment_id": enrollment_id,
                    "member_id": member_id
                }).encode()
            ),
            routing_key="enrollments"
        )
```

```python
# services/communications_service/app.py
async def consume_enrollment_events():
    """Listen for enrollment events and send emails."""
    connection = await aio_pika.connect_robust("amqp://localhost/")
    async with connection:
        channel = await connection.channel()
        queue = await channel.declare_queue("enrollments")

        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                async with message.process():
                    data = json.loads(message.body)
                    await send_enrollment_confirmation_email(data["member_id"])
```

**Benefits of message queues:**
- Decouples services (no need to know each other's URLs)
- Async processing (don't wait for email to send)
- Retry logic built-in
- Can add new subscribers without changing publisher

---

## Common Scenarios

### Scenario 1: Display Enrollment with Member Name

**Need:** Show enrollment details including member's full name.

**Solution:**

```python
@app.get("/api/v1/academy/enrollments/{id}")
async def get_enrollment(id: str, db: Session = Depends(get_db)):
    # 1. Fetch enrollment from our database
    enrollment = db.query(Enrollment).filter(Enrollment.id == id).first()
    if not enrollment:
        raise HTTPException(status_code=404)

    # 2. Fetch member info via API
    member_info = await get_member_info(enrollment.member_id)

    # 3. Combine and return
    return {
        "id": enrollment.id,
        "cohort_id": enrollment.cohort_id,
        "member": {
            "id": enrollment.member_id,
            "full_name": member_info.get("full_name") if member_info else "Unknown",
            "email": member_info.get("email") if member_info else None
        },
        "status": enrollment.status,
        "enrolled_at": enrollment.enrolled_at
    }
```

### Scenario 2: Validate Payment Before Enrollment

**Need:** Ensure payment exists before allowing enrollment.

**Solution:**

```python
@app.post("/api/v1/academy/enrollments")
async def create_enrollment(data: EnrollmentCreate, db: Session = Depends(get_db)):
    # 1. Validate payment via Payments Service API
    payment_valid = await check_payment_status(data.payment_id)
    if not payment_valid:
        raise HTTPException(status_code=400, detail="Invalid or unpaid payment")

    # 2. Create enrollment
    enrollment = Enrollment(
        cohort_id=data.cohort_id,
        member_id=data.member_id,
        payment_id=data.payment_id
    )
    db.add(enrollment)
    db.commit()

    return enrollment

async def check_payment_status(payment_id: str) -> bool:
    """Check if payment is confirmed."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{PAYMENTS_SERVICE_URL}/api/v1/payments/{payment_id}"
            )
            if response.status_code == 200:
                payment = response.json()
                return payment.get("status") == "confirmed"
            return False
    except Exception:
        return False
```

### Scenario 3: List Enrollments with Cohort and Member Names

**Need:** Admin view showing all enrollments with related data.

**Solution:**

```python
@app.get("/api/v1/academy/enrollments")
async def list_enrollments(db: Session = Depends(get_db)):
    # 1. Fetch enrollments from our database
    enrollments = db.query(Enrollment).all()

    # 2. Collect unique member IDs
    member_ids = list(set([e.member_id for e in enrollments]))

    # 3. Batch fetch members (more efficient than one-by-one)
    members_map = await batch_get_members(member_ids)

    # 4. Combine data
    result = []
    for enrollment in enrollments:
        cohort = db.query(Cohort).filter(Cohort.id == enrollment.cohort_id).first()
        member = members_map.get(enrollment.member_id)

        result.append({
            "id": enrollment.id,
            "cohort_name": cohort.name if cohort else "Unknown",
            "member_name": member.get("full_name") if member else "Unknown",
            "status": enrollment.status
        })

    return result

async def batch_get_members(member_ids: list) -> dict:
    """Fetch multiple members in one request."""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{MEMBERS_SERVICE_URL}/api/v1/members/batch",
                json={"ids": member_ids}
            )
            if response.status_code == 200:
                members = response.json()
                return {m["id"]: m for m in members}
            return {}
    except Exception:
        return {}
```

---

## Performance Considerations

### 1. Caching

Cache responses to reduce API calls:

```python
from functools import lru_cache
import asyncio

# Simple in-memory cache (for short-lived data)
@lru_cache(maxsize=1000)
async def get_member_info_cached(member_id: str):
    """Cache member info for 5 minutes."""
    return await get_member_info(member_id)

# Use Redis for distributed caching (better for production)
import aioredis

async def get_member_info_redis_cached(member_id: str):
    redis = await aioredis.create_redis_pool('redis://localhost')

    # Check cache
    cached = await redis.get(f"member:{member_id}")
    if cached:
        return json.loads(cached)

    # Fetch from API
    member = await get_member_info(member_id)

    # Cache for 5 minutes
    await redis.setex(f"member:{member_id}", 300, json.dumps(member))

    return member
```

### 2. Batch Requests

Instead of N+1 API calls, create batch endpoints:

```python
# In Members Service - create batch endpoint
@app.post("/api/v1/members/batch")
async def get_members_batch(member_ids: list[str], db: Session = Depends(get_db)):
    """Fetch multiple members in one request."""
    members = db.query(Member).filter(Member.id.in_(member_ids)).all()
    return [member.to_dict() for member in members]
```

### 3. Async/Await

Use async for non-blocking API calls:

```python
import asyncio

async def get_enrollment_with_details(enrollment_id: str, db: Session):
    # Fetch enrollment
    enrollment = db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()

    # Fetch member and cohort details in parallel
    member_info, cohort_info = await asyncio.gather(
        get_member_info(enrollment.member_id),
        get_cohort_info(enrollment.cohort_id)
    )

    return {
        "enrollment": enrollment,
        "member": member_info,
        "cohort": cohort_info
    }
```

---

## Testing Service Communication

### 1. Mock External Services in Tests

```python
# tests/test_enrollments.py
import pytest
from unittest.mock import patch, AsyncMock

@pytest.mark.asyncio
@patch('services.academy_service.app.get_member_info')
async def test_create_enrollment(mock_get_member):
    # Mock the API call to Members Service
    mock_get_member.return_value = {
        "id": "member-123",
        "full_name": "John Doe",
        "email": "john@example.com"
    }

    # Test enrollment creation
    response = await client.post("/api/v1/academy/enrollments", json={
        "cohort_id": "cohort-123",
        "member_id": "member-123"
    })

    assert response.status_code == 200
    assert mock_get_member.called_once_with("member-123")
```

### 2. Integration Tests with Test Services

For integration tests, use docker-compose with all services:

```yaml
# docker-compose.test.yml
services:
  members-service:
    build: ./services/members_service
    environment:
      - DATABASE_URL=postgresql://test:test@db/test_members

  academy-service:
    build: ./services/academy_service
    environment:
      - DATABASE_URL=postgresql://test:test@db/test_academy
      - MEMBERS_SERVICE_URL=http://members-service:8001
    depends_on:
      - members-service
```

---

## Monitoring & Debugging

### 1. Log API Calls

```python
import logging

logger = logging.getLogger(__name__)

async def get_member_info(member_id: str):
    logger.info(f"Fetching member {member_id} from Members Service")

    try:
        response = await client.get(f"{MEMBERS_SERVICE_URL}/api/v1/members/{member_id}")

        if response.status_code == 200:
            logger.info(f"Successfully fetched member {member_id}")
            return response.json()
        else:
            logger.warning(f"Failed to fetch member {member_id}: {response.status_code}")
            return None

    except Exception as e:
        logger.error(f"Error fetching member {member_id}: {e}")
        return None
```

### 2. Circuit Breaker Pattern

Prevent cascading failures:

```python
from circuitbreaker import circuit

@circuit(failure_threshold=5, recovery_timeout=60)
async def get_member_info(member_id: str):
    """
    If 5 failures occur, circuit opens for 60 seconds.
    Prevents hammering a down service.
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{MEMBERS_SERVICE_URL}/api/v1/members/{member_id}",
            timeout=5.0
        )
        response.raise_for_status()
        return response.json()
```

---

## Summary

### Key Takeaways

1. **Services must remain independent** - No imports between services
2. **Communicate via HTTP APIs** - Primary communication method
3. **Handle failures gracefully** - Services can be unavailable
4. **Use shared libs for common code** - Auth, DB, utilities only
5. **Cache when appropriate** - Reduce unnecessary API calls
6. **Batch requests when possible** - Avoid N+1 queries
7. **Test with mocks** - Don't require all services for unit tests

### Quick Reference

| Pattern | Status | Use Case |
|---------|--------|----------|
| HTTP API calls | ✅ Use this | Primary communication |
| Shared libraries | ✅ Use this | Common utilities only |
| Foreign key references | ✅ Use this | Store IDs, don't join |
| Message queues | ✅ Use this | Async operations (future) |
| Direct imports | ❌ Never | Creates tight coupling |
| Cross-service DB queries | ❌ Never | Violates boundaries |
| Shared models | ❌ Never | Use APIs instead |

---

## Related Documentation

- [ARCHITECTURE.md](../../swimbuddz-backend/ARCHITECTURE.md) - System architecture overview
- [CONVENTIONS.md](../../swimbuddz-backend/CONVENTIONS.md) - Backend coding standards
- [SERVICE_REGISTRY.md](./SERVICE_REGISTRY.md) - Complete service list and details
- [CLAUDE.md](../../CLAUDE.md) - AI assistant guidelines

---

*Last updated: January 2026*
