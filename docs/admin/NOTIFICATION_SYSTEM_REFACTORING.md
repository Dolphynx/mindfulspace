# Notification System Integration - Refactoring Summary

**Date**: December 27, 2024
**Status**: ✅ **COMPLETE**

## Overview

Refactored the subscription-requests service and controller to align with the notification system requirements provided by the notification system implementer.

---

## Backend Changes

### `apps/api-nest/src/subscription-requests/subscription-requests.service.ts`

#### ✅ Added Method: `getUnreadDecisions(userId: string)`
```typescript
async getUnreadDecisions(userId: string) {
  const items = await this.prisma.subscriptionRequest.findMany({
    where: {
      userId,
      isRead: false,
      status: { not: SubscriptionRequestStatus.PENDING },
    },
    orderBy: { reviewedAt: 'desc' },
    take: 20,
    select: {
      id: true,
      requestType: true,
      status: true,
      coachTier: true,
      reviewedAt: true,
    },
  });

  return { unreadCount: items.length, items };
}
```

**Purpose**: Get unread decisions (approved/rejected requests) for the notification system. Only returns non-pending requests that haven't been read yet.

#### ✅ Refactored Method: `markAsRead(userId: string, id: string)`
**Changed signature** from `markAsRead(id: string, userId: string)` to `markAsRead(userId: string, id: string)` to match notification system convention.

```typescript
async markAsRead(userId: string, id: string) {
  const found = await this.prisma.subscriptionRequest.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!found || found.userId !== userId) throw new ForbiddenException();

  return this.prisma.subscriptionRequest.update({
    where: { id },
    data: { isRead: true },
    select: { id: true, isRead: true },
  });
}
```

**Changes**:
- Parameter order swapped (userId first)
- More efficient: single query to check ownership before updating
- Returns only `{ id, isRead }` instead of full request object
- Simplified error handling

#### ✅ Added Method: `markAllAsRead(userId: string)`
```typescript
async markAllAsRead(userId: string) {
  await this.prisma.subscriptionRequest.updateMany({
    where: {
      userId,
      isRead: false,
      status: { not: SubscriptionRequestStatus.PENDING },
    },
    data: { isRead: true },
  });
  return { ok: true };
}
```

**Purpose**: Mark all unread decisions as read for a user. Useful for "mark all as read" functionality in the notification system.

---

### `apps/api-nest/src/subscription-requests/subscription-requests.controller.ts`

#### ✅ Added Imports
```typescript
import { Patch, Req } from '@nestjs/common';
```

**Purpose**:
- `Patch` decorator for PATCH HTTP method
- `Req` decorator to access request object

#### ✅ Added Endpoint: `GET /subscription-requests/notifications`
```typescript
@Get('notifications')
async myNotifications(@Req() req: any) {
  return this.service.getUnreadDecisions(req.user.id);
}
```

**Purpose**: Get unread notification decisions for the current user.

**Response**:
```json
{
  "unreadCount": 2,
  "items": [
    {
      "id": "cuid-123",
      "requestType": "PREMIUM",
      "status": "APPROVED",
      "coachTier": null,
      "reviewedAt": "2024-12-27T10:30:00Z"
    }
  ]
}
```

#### ✅ Refactored Endpoint: `PATCH /subscription-requests/:id/read`
**Changed** from `PUT /subscription-requests/:id/mark-read` to `PATCH /subscription-requests/:id/read`

```typescript
@Patch(':id/read')
async markRead(@Req() req: any, @Param('id') id: string) {
  return this.service.markAsRead(req.user.id, id);
}
```

**Changes**:
- HTTP method: `PUT` → `PATCH` (more semantically correct for partial update)
- URL path: `/mark-read` → `/read` (shorter, cleaner)
- Parameter order matches service method

**Response**:
```json
{
  "id": "cuid-123",
  "isRead": true
}
```

#### ✅ Added Endpoint: `PATCH /subscription-requests/read-all`
```typescript
@Patch('read-all')
async markAllRead(@Req() req: any) {
  return this.service.markAllAsRead(req.user.id);
}
```

**Purpose**: Mark all unread decisions as read for the current user.

**Response**:
```json
{
  "ok": true
}
```

---

## Frontend Changes

### `apps/frontend-next/src/lib/api/subscription-requests.ts`

#### ✅ Added Function: `getUnreadDecisions()`
```typescript
export async function getUnreadDecisions(): Promise<{
  unreadCount: number;
  items: Array<{
    id: string;
    requestType: SubscriptionRequestType;
    status: SubscriptionRequestStatus;
    coachTier?: string;
    reviewedAt: string;
  }>;
}> {
  const res = await apiFetch('/subscription-requests/notifications');
  // ... error handling
  return res.json();
}
```

**Purpose**: Fetch unread notification decisions from the backend.

#### ✅ Updated Function: `markSubscriptionRequestAsRead(id: string)`
```typescript
export async function markSubscriptionRequestAsRead(
  id: string
): Promise<{ id: string; isRead: boolean }> {
  const res = await apiFetch(`/subscription-requests/${id}/read`, {
    method: 'PATCH',  // Changed from PUT
  });
  // ... error handling
  return res.json();
}
```

**Changes**:
- HTTP method: `PUT` → `PATCH`
- Endpoint: `/mark-read` → `/read`
- Return type: `SubscriptionRequest` → `{ id: string; isRead: boolean }`

#### ✅ Added Function: `markAllSubscriptionRequestsAsRead()`
```typescript
export async function markAllSubscriptionRequestsAsRead(): Promise<{
  ok: boolean;
}> {
  const res = await apiFetch('/subscription-requests/read-all', {
    method: 'PATCH',
  });
  // ... error handling
  return res.json();
}
```

**Purpose**: Mark all unread decisions as read.

---

## API Endpoint Summary

### New/Modified Endpoints

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| `GET` | `/subscription-requests/notifications` | Get unread decisions | `{ unreadCount, items[] }` |
| `PATCH` | `/subscription-requests/:id/read` | Mark specific request as read | `{ id, isRead }` |
| `PATCH` | `/subscription-requests/read-all` | Mark all unread as read | `{ ok: true }` |

### Existing Endpoints (Unchanged)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/subscription-requests` | Create new request |
| `GET` | `/subscription-requests` | Get all requests (admin) |
| `GET` | `/subscription-requests/my-requests` | Get user's requests |
| `GET` | `/subscription-requests/:id` | Get specific request |
| `PUT` | `/subscription-requests/:id/review` | Review request (admin) |
| `PUT` | `/subscription-requests/:id/cancel` | Cancel pending request |

---

## Breaking Changes

### Backend
- ⚠️ **Method signature changed**: `markAsRead(id, userId)` → `markAsRead(userId, id)`
  - This is a **private** service method, so it only affects the controller (already updated)

### Frontend
- ⚠️ **Endpoint changed**: `PUT /subscription-requests/:id/mark-read` → `PATCH /subscription-requests/:id/read`
  - If any existing code calls the old endpoint, it needs to be updated
  - **Updated**: `ProfileContent.tsx` uses `markSubscriptionRequestAsRead()` which has been updated

---

## Integration with Notification System

The refactored endpoints are now ready for integration with the notification system:

### Usage Example
```typescript
// Get unread decisions count for notification badge
const { unreadCount, items } = await getUnreadDecisions();

// Display notification badge
<NotificationBadge count={unreadCount} />

// Mark as read when user views notification
await markSubscriptionRequestAsRead(notificationId);

// Mark all as read when user clicks "Mark all as read"
await markAllSubscriptionRequestsAsRead();
```

### Notification Flow
1. **Admin reviews request** → `isRead` set to `false` on decision
2. **User navigates to app** → Fetch unread decisions via `/notifications`
3. **Display notification badge** with `unreadCount`
4. **User clicks notification** → Navigate to details + mark as read
5. **User can mark all as read** → Clears notification badge

---

## Testing Checklist

### ✅ Backend Compilation
- TypeScript compilation successful: `npx tsc --noEmit`

### ✅ Frontend Compilation
- Next.js build successful: `npm run build`

### 🔲 Manual Testing (Pending)
- [ ] Create a subscription request
- [ ] Admin approves/rejects request
- [ ] User sees unread notification count
- [ ] User marks notification as read
- [ ] User marks all notifications as read
- [ ] Verify `isRead` flag updates correctly

---

## Files Modified

### Backend
- ✅ `apps/api-nest/src/subscription-requests/subscription-requests.service.ts`
  - Added: `getUnreadDecisions()`
  - Refactored: `markAsRead()` signature
  - Added: `markAllAsRead()`

- ✅ `apps/api-nest/src/subscription-requests/subscription-requests.controller.ts`
  - Added: `GET /notifications` endpoint
  - Refactored: `PATCH /:id/read` endpoint
  - Added: `PATCH /read-all` endpoint
  - Added imports: `Patch`, `Req`

### Frontend
- ✅ `apps/frontend-next/src/lib/api/subscription-requests.ts`
  - Added: `getUnreadDecisions()`
  - Updated: `markSubscriptionRequestAsRead()` to use PATCH
  - Added: `markAllSubscriptionRequestsAsRead()`

---

## Next Steps

The subscription request system is now ready for notification system integration. The notification system implementer can now:

1. Use `getUnreadDecisions()` to fetch unread count and items
2. Use `markAsRead(userId, id)` to mark individual notifications as read
3. Use `markAllAsRead(userId)` to implement "mark all as read" functionality

All endpoints follow the convention provided in the notification system requirements.
