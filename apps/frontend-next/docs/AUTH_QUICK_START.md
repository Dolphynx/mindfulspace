# Frontend Authentication - Quick Start

## 🚀 Get Started in 3 Minutes

### Prerequisites

- Backend API running on `http://localhost:3001`
- Backend authentication configured (see API docs)

### Step 1: Verify Configuration

The authentication system is already set up! Just make sure you have the environment variable:

```bash
# apps/frontend-next/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 2: Start the Frontend

```bash
pnpm --filter frontend start:dev
```

Visit: http://localhost:3000

### Step 3: Test It!

1. **Click "Sign Up"** in the navigation
2. Fill out the form and submit
3. Check your backend console for the verification token
4. Visit the verification link
5. **Click "Sign In"** and login
6. See your user menu in the navbar!

## 📍 All Auth Pages

| Page | URL | Description |
|------|-----|-------------|
| Login | `/auth/login` | Email/password + OAuth |
| Register | `/auth/register` | Create new account |
| Verify Email | `/auth/verify-email?token=xxx` | Email verification |
| Forgot Password | `/auth/forgot-password` | Request reset |
| Reset Password | `/auth/reset-password?token=xxx` | Change password |
| OAuth Callback | `/auth/callback?success=true` | After OAuth |

## 🎨 Design Features

All auth pages match your existing MindfulSpace design:

- ✅ Same color scheme (brandGreen, etc.)
- ✅ Same card styling (rounded-2xl, borders)
- ✅ Same button styles
- ✅ Responsive design
- ✅ Mobile-friendly

## 🔧 Using Auth in Your Pages

### Get Current User

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function MyPage() {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;

  return <h1>Welcome, {user.displayName}!</h1>;
}
```

### Protect a Route

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (!user) return null;

  return <div>Protected content</div>;
}
```

### Check User Roles

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const isAdmin = user?.roles.includes('admin');
  const isPremium = user?.roles.includes('premium');

  return (
    <div>
      <h1>Dashboard</h1>
      {isPremium && <div>Premium content</div>}
      {isAdmin && <div>Admin tools</div>}
    </div>
  );
}
```

## 🔑 API Methods

All available in `@/lib/api/auth`:

```typescript
import { login, register, logout, getCurrentUser, forgotPassword, resetPassword } from '@/lib/api/auth';

// Register
await register({ email, password, displayName });

// Login
const { user, tokens } = await login({ email, password });

// Get current user
const user = await getCurrentUser();

// Logout
await logout();

// Forgot password
await forgotPassword(email);

// Reset password
await resetPassword(token, newPassword);
```

## 📱 Navigation

The `PublicNavbar` automatically handles authentication:

**Not logged in:**
- Shows "Sign In" button
- Shows "Sign Up" button

**Logged in:**
- Shows user avatar
- Dropdown menu with:
  - User info
  - Role badges
  - Dashboard link
  - Profile link
  - Logout button

## 🎯 What Works Out of the Box

- ✅ Registration with email verification
- ✅ Login with credentials
- ✅ OAuth (Google + GitHub)
- ✅ Password reset
- ✅ User menu
- ✅ Persistent sessions (cookies)
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Mobile responsive

## 🐛 Troubleshooting

**"Network error"**
- Check API is running: `http://localhost:3001`
- Verify `.env.local` has correct `NEXT_PUBLIC_API_URL`

**OAuth not working**
- Configure OAuth in backend first
- Check redirect URIs match

**User menu not showing**
- Clear cookies and login again
- Check browser console for errors
- Verify AuthProvider is in layout (already done!)

## 📚 Full Documentation

See [AUTHENTICATION.md](./AUTHENTICATION.md) for:
- Complete API reference
- Advanced usage examples
- Styling customization
- Production deployment
- Troubleshooting guide

## ✅ You're Ready!

The authentication system is fully integrated and ready to use. Just start the frontend and visit any auth page to test!

Quick test URLs:
- http://localhost:3000/auth/register
- http://localhost:3000/auth/login
