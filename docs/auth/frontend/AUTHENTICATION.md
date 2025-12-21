# Frontend Authentication Documentation

## Overview

The frontend authentication system integrates seamlessly with the NestJS backend authentication API. It provides a complete user authentication flow with a beautiful, responsive UI that matches the MindfulSpace design system.

## Features

- ✅ **Email/Password Registration** with validation
- ✅ **Email Verification** flow
- ✅ **Login** with credentials
- ✅ **OAuth** (Google + GitHub)
- ✅ **Password Reset** flow
- ✅ **Persistent Authentication** with cookies
- ✅ **User Menu** with dropdown
- ✅ **Responsive Design** (mobile + desktop)
- ✅ **Loading States** and error handling
- ✅ **Matches App Design** (brandGreen, cards, etc.)

## File Structure

```
apps/frontend-next/src/
├── lib/
│   └── api/
│       └── auth.ts                    # API client for auth endpoints
├── contexts/
│   └── AuthContext.tsx                # Authentication state management
├── components/
│   └── auth/
│       ├── AuthCard.tsx               # Container card for auth forms
│       ├── AuthInput.tsx              # Styled input field
│       ├── AuthButton.tsx             # Primary action button
│       ├── AuthDivider.tsx            # Divider with text
│       ├── OAuthButtons.tsx           # Google/GitHub login buttons
│       ├── UserMenu.tsx               # Authenticated user dropdown
│       └── AuthButtons.tsx            # Login/Register buttons
├── app/[locale]/(public)/auth/
│   ├── login/page.tsx                 # Login page
│   ├── register/page.tsx              # Registration page
│   ├── verify-email/page.tsx          # Email verification
│   ├── forgot-password/page.tsx       # Request password reset
│   ├── reset-password/page.tsx        # Reset password with token
│   └── callback/page.tsx              # OAuth callback handler
└── components/layout/
    └── PublicNavbar.tsx               # Updated with auth buttons
```

## Authentication Flow

### Registration Flow

1. User fills out registration form (`/auth/register`)
2. Form validates password requirements
3. API creates user account
4. Success screen prompts to check email
5. User clicks verification link in email
6. Redirected to `/auth/verify-email?token=xxx`
7. Email verified, user can login

### Login Flow

1. User enters credentials (`/auth/login`)
2. API validates and returns JWT + cookies
3. AuthContext updates with user data
4. User redirected to `/member/dashboard`
5. Navigation shows user menu instead of login buttons

### OAuth Flow

1. User clicks "Continue with Google/GitHub"
2. Redirected to OAuth provider
3. After approval, redirected to API `/auth/google/callback`
4. API sets cookies and redirects to `/auth/callback?success=true`
5. Frontend fetches user data and redirects to dashboard

### Password Reset Flow

1. User visits `/auth/forgot-password`
2. Enters email address
3. Receives reset email with token
4. Clicks link → `/auth/reset-password?token=xxx`
5. Enters new password
6. Password updated, redirected to login

## Using Authentication in Your App

### Accessing User Data

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, loading, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <div>Please login</div>;

  return (
    <div>
      <h1>Welcome, {user.displayName}!</h1>
      <p>Email: {user.email}</p>
      <p>Roles: {user.roles.join(', ')}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protecting Routes (Client-Side)

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

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <div>Protected content here</div>;
}
```

### Role-Based Rendering

```tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const isAdmin = user?.roles.includes('admin');
  const isCoach = user?.roles.includes('coach');
  const isPremium = user?.roles.includes('premium');

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Everyone sees this */}
      <section>Basic content</section>

      {/* Only premium users */}
      {isPremium && (
        <section>Premium content</section>
      )}

      {/* Only coaches */}
      {isCoach && (
        <section>Coach tools</section>
      )}

      {/* Only admins */}
      {isAdmin && (
        <section>Admin panel</section>
      )}
    </div>
  );
}
```

## API Integration

The frontend uses the API client in `lib/api/auth.ts` which handles all authentication requests with the backend.

### Example: Custom Login Handler

```tsx
'use client';

import { useState } from 'react';
import { login } from '@/lib/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function CustomLoginForm() {
  const { refreshUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Call API directly
      await login({ email, password });

      // Refresh user data in context
      await refreshUser();

      // Redirect
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

## Styling & Theming

The authentication UI uses your existing design tokens:

```css
brandGreen: #3b7a48       /* Primary action color */
brandBg: #f7fcf8          /* Light background */
brandBorder: #d9eadf      /* Soft borders */
brandSurface: #eefaf2     /* Surface color */
brandText: #2f3a2f        /* Primary text */
```

### Component Styling Patterns

- **Cards**: `rounded-2xl border border-brandBorder bg-white/80 shadow-sm`
- **Primary Buttons**: `bg-brandGreen text-white hover:bg-brandGreen/90`
- **Secondary Buttons**: `border border-brandBorder bg-white hover:bg-brandSurface`
- **Inputs**: `rounded-xl border border-brandBorder focus:border-brandGreen focus:ring-2 focus:ring-brandGreen/20`

## Environment Variables

Required in `apps/frontend-next/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

For production:

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Navigation Integration

The `PublicNavbar` component automatically shows:

- **Not Authenticated**: "Sign In" and "Sign Up" buttons
- **Authenticated**: User avatar with dropdown menu

The dropdown includes:
- User name and email
- Role badges
- Link to dashboard
- Link to profile settings
- Logout button

## Testing

### Local Development

1. Start the backend API:
   ```bash
   pnpm --filter api start:dev
   ```

2. Start the frontend:
   ```bash
   pnpm --filter frontend start:dev
   ```

3. Visit `http://localhost:3000`

### Test User Flow

1. Click "Sign Up" in navbar
2. Fill out registration form
3. Check API console for verification token (or email)
4. Visit verification link
5. Login with credentials
6. See user menu in navbar
7. Click avatar → "Sign Out"

## OAuth Configuration

### Google OAuth

1. Visit https://console.cloud.google.com/apis/credentials
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3001/auth/google/callback`
4. Update backend `.env` with Client ID and Secret

### GitHub OAuth

1. Visit https://github.com/settings/developers
2. Create new OAuth App
3. Authorization callback URL: `http://localhost:3001/auth/github/callback`
4. Update backend `.env` with Client ID and Secret

## Error Handling

All auth components handle errors gracefully:

- **Network errors**: "Failed to connect to server"
- **Validation errors**: Field-specific error messages
- **API errors**: User-friendly error messages
- **Loading states**: Spinner animations

Example error display:

```tsx
{error && (
  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
    {error}
  </div>
)}
```

## Accessibility

All components follow accessibility best practices:

- ✅ Semantic HTML
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Focus states on interactive elements
- ✅ Form labels and error associations
- ✅ Loading states announced

## Mobile Responsiveness

The auth UI is fully responsive:

- Mobile: Full-width forms, stacked buttons
- Tablet: Centered cards, 2-column layouts
- Desktop: Centered cards with max-width

Responsive classes used:
- `lg:flex-row` for desktop horizontal layouts
- `md:inline` for conditional display
- `sm:px-6` for responsive padding

## Troubleshooting

### "Network error" on login

- Check that API is running on port 3001
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

### OAuth not working

- Verify redirect URIs match exactly in OAuth provider settings
- Check that backend has OAuth credentials configured
- Ensure cookies are enabled in browser

### User menu not showing after login

- Check AuthProvider is in layout
- Verify cookies are being set (check browser DevTools)
- Check for console errors in AuthContext

### Styling looks different

- Verify Tailwind is processing auth components
- Check that globals.css is imported
- Ensure custom colors are in tailwind.config.js

## Production Deployment

### Frontend

1. Update `NEXT_PUBLIC_API_URL` to production API URL
2. Build: `pnpm --filter frontend build`
3. Deploy to hosting provider (Vercel, Netlify, etc.)

### Backend

1. Update OAuth redirect URIs to production domains
2. Update `FRONTEND_URL` in backend `.env`
3. Ensure CORS origins include production frontend URL

## Future Enhancements

Potential additions to consider:

- [ ] Remember me checkbox
- [ ] Two-factor authentication (2FA)
- [ ] Email change flow
- [ ] Account deletion
- [ ] Session management (view/revoke active sessions)
- [ ] Social login: Facebook, Twitter
- [ ] Password strength meter
- [ ] Captcha for registration

## Support

For issues:
1. Check this documentation
2. Review console errors
3. Verify API is running and accessible
4. Check backend authentication docs: `apps/api-nest/docs/AUTHENTICATION.md`
