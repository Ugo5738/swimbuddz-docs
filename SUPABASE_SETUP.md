# Supabase Configuration Guide

## Current Setup

The SwimBuddz application uses **Cloud Supabase** for authentication.

### Frontend Configuration
- **Location**: `.env.local` (gitignored)
- **Supabase URL**: `https://ciwpbfwevigjqzubkumo.supabase.co`
- **Required Variables**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Backend Configuration
- **Location**: `.env.dev` (gitignored)
- **Required Variables**:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_JWT_SECRET`
  - `SUPABASE_PROJECT_ID`

## ⚠️ CRITICAL: Both Must Use Same Supabase Instance

For authentication to work, **frontend and backend must share the same Supabase credentials**:

1. Same `SUPABASE_URL`
2. Same JWT secret (for token validation)
3. Same database (for user lookups)

## Setup Options

### Option A: Cloud Supabase (Current/Recommended) ✅

**Pros:**
- Real email confirmations work
- Production-ready
- Easier testing

**Backend Setup:**
Update `.env.dev` with your cloud Supabase credentials:
```bash
SUPABASE_URL=https://ciwpbfwevigjqzubkumo.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_JWT_SECRET=<your-jwt-secret>
SUPABASE_PROJECT_ID=ciwpbfwevigjqzubkumo
```

Get these from: Supabase Dashboard → Project Settings → API

---

### Option B: Local Supabase CLI

**Pros:**
- Fully offline development
- No cloud dependencies

**Cons:**
- Email confirmations logged to console (not sent)
- More complex setup
- Need to disable email verification or manually confirm users

**Setup:**
```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Initialize in project
supabase init

# Start local Supabase
supabase start

# This gives you local URLs and keys - use these in both .env files
```

**Email Handling:**
- Emails appear in terminal console
- Copy confirmation links manually
- OR disable email confirmation in Supabase settings

---

## Registration Flow

### With Cloud Supabase:
1. User submits registration form
2. Backend creates pending registration
3. Frontend calls Supabase sign-up
4. **Email sent with confirmation link**
5. User clicks link → redirected to `/auth/callback`
6. Frontend completes registration via backend

### With Local Supabase:
1. Same steps 1-3
2. **Email logged to console** (not sent)
3. Copy link from console and open manually
4. Same redirect flow

---

## Recommended Configuration

**For Development**: Use **Cloud Supabase** (current setup)
**For CI/CD**: Use Cloud Supabase with test project
**For Team**: Each developer can use same cloud instance or their own

## Security Notes

- ✅ `.env.local` and `.env.dev` are gitignored
- ✅ Never commit Supabase credentials
- ✅ Use `.env.example` for templates only
- ⚠️ Rotate keys if accidentally committed
