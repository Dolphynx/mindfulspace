# Subscription Request System - Setup Guide for Team

**Branch**: `feature/admin-panel` → merged to `dev`
**Date**: December 27, 2024
**Status**: ✅ **READY FOR TEAM**

---

## 🚀 Quick Setup for Teammates

When you pull the latest changes from `dev`, follow these steps:

### 1. Run Prisma Migration ⚠️ **REQUIRED**

```bash
cd apps/api-nest
pnpm prisma migrate deploy
```

**What this does:**
- Creates the `subscription_request` table
- Adds 3 new enums: `SubscriptionRequestType`, `SubscriptionRequestStatus`, `CoachTier`
- Sets up indexes for performance
- Adds foreign keys to `User` table

**Migration file**: `20251226223321_add_subscription_requests`

### 2. Regenerate Prisma Client (if needed)

```bash
cd apps/api-nest
pnpm prisma generate
```

### 3. Install Dependencies

```bash
# From root
pnpm install
```

### 4. Restart Dev Servers

```bash
# Backend
pnpm dev:api

# Frontend
pnpm dev:front
```

---

## ✅ No Seed Data Needed

**Important**: The subscription request system does **NOT** require any seed data. The table starts empty and requests are created by users via the UI.

---

## 📋 What Was Added

### Backend (NestJS)

#### New Module: `subscription-requests`

**Location**: `apps/api-nest/src/subscription-requests/`

**API Endpoints**:
```
POST   /subscription-requests                    Create request (authenticated users)
GET    /subscription-requests                    Get all requests (admin only)
GET    /subscription-requests/my-requests        Get user's requests
GET    /subscription-requests/notifications      Get unread decisions
GET    /subscription-requests/:id                Get specific request
PUT    /subscription-requests/:id/review         Review request (admin only)
PATCH  /subscription-requests/:id/read           Mark as read
PATCH  /subscription-requests/read-all           Mark all as read
PUT    /subscription-requests/:id/cancel         Cancel pending request
```

### Frontend (Next.js)

#### New Features

1. **User Profile** (`/[locale]/member/profile`):
   - Subscription section with upgrade buttons
   - My subscription requests list
   - Request cancellation

2. **Upgrade Request Modal**:
   - Two-step modal (marketing + form)
   - Rich content from becomePremium/becomeCoach pages
   - Tier selection for coach requests

3. **Admin Dashboard** (`/[locale]/admin`):
   - New "Subscription Requests" tab
   - Review, approve, reject requests
   - Automatic role assignment on approval
   - Logout button in sidebar

---

## 🔔 Notification System Integration

Ready for notification integration with these endpoints:

```typescript
GET   /subscription-requests/notifications  // Get unread decisions
PATCH /subscription-requests/:id/read       // Mark as read
PATCH /subscription-requests/read-all       // Mark all as read
```

---

## 🧪 Testing After Setup

Verify everything works:

- [ ] Backend compiles: `cd apps/api-nest && npx tsc --noEmit`
- [ ] Frontend compiles: `cd apps/frontend-next && npm run build`
- [ ] Can access user profile
- [ ] Can create subscription request
- [ ] Admin can review requests
- [ ] Role assignment works on approval

---

## ⚠️ Key Point

**YES, your teammates need to run the migration!**

The migration `20251226223321_add_subscription_requests` is required to create the new database tables and enums.

**NO seed data needed** - the system works with an empty subscription_request table.

---

## 📞 Troubleshooting

- **Database errors**: Run `pnpm prisma migrate deploy`
- **TypeScript errors**: Run `pnpm prisma generate`
- **Missing dependencies**: Run `pnpm install`

---

**Summary**: After pulling from `dev`, just run `pnpm prisma migrate deploy` and you're ready! 🚀
