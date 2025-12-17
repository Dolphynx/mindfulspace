# Authentication System Documentation

## Overview

This authentication system provides a comprehensive, secure solution for user authentication and authorization in the MindfulSpace application. It implements industry best practices including JWT tokens, OAuth, RBAC (Role-Based Access Control), and email verification.

## Features

- **Email/Password Authentication** with Argon2 password hashing
- **Email Verification** (required before login)
- **JWT Tokens** (short-lived access tokens + long-lived refresh tokens)
- **Hybrid Token Delivery**: HttpOnly cookies for web + Bearer tokens for mobile
- **OAuth Integration**: Google and GitHub
- **RBAC** (Role-Based Access Control) with permissions
- **Password Reset** via email
- **Rate Limiting** to prevent brute force attacks
- **CSRF Protection** for cookie-based authentication
- **Refresh Token Rotation** stored in database

## Architecture

### Database Schema

The authentication system uses the following Prisma models:

- **User**: Core user model with email, password, and profile info
- **EmailVerificationToken**: Tokens for email verification (24h expiry)
- **RefreshToken**: Long-lived tokens stored in DB for security (7 days)
- **PasswordResetToken**: One-time tokens for password reset (1h expiry)
- **OAuthAccount**: Links users to OAuth providers (Google, GitHub)
- **Role**: User roles (user, premium, coach, admin)
- **UserRole**: Join table for user-role relationships (many-to-many)
- **Permission**: Fine-grained permissions (e.g., "sessions:create")
- **RolePermission**: Join table for role-permission relationships

### Security Features

1. **Password Hashing**: Argon2id with 64MB memory cost
2. **Token Expiry**: Access tokens (15min), Refresh tokens (7 days)
3. **Rate Limiting**: 3 req/sec, 20 req/10sec, 100 req/min
4. **HttpOnly Cookies**: Prevents XSS attacks
5. **CSRF Protection**: For cookie-based authentication
6. **Token Rotation**: Refresh tokens are rotated on each use
7. **Email Verification**: Required before login
8. **Password Requirements**: Min 8 chars, uppercase, lowercase, number, special char

## API Endpoints

### Public Endpoints (No Auth Required)

#### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe"
}

Response: 201 Created
{
  "message": "User registered successfully. Please verify your email.",
  "userId": "clxxx..."
}
```

#### Verify Email
```
POST /auth/verify-email
Content-Type: application/json

{
  "token": "abc123..."
}

Response: 200 OK
{
  "message": "Email verified successfully"
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
Set-Cookie: access_token=...; HttpOnly; Secure; SameSite=Strict
Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict

{
  "user": {
    "id": "clxxx...",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": true,
    "roles": ["user"]
  },
  "tokens": {
    "accessToken": "eyJhbG...",
    "refreshToken": "abc123..."
  }
}
```

#### Refresh Token
```
POST /auth/refresh
Cookie: refresh_token=...
OR
Content-Type: application/json
{
  "refreshToken": "abc123..."
}

Response: 200 OK
{
  "accessToken": "eyJhbG...",
  "refreshToken": "def456..."
}
```

#### Forgot Password
```
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response: 200 OK
{
  "message": "If the email exists, a password reset link has been sent"
}
```

#### Reset Password
```
POST /auth/reset-password
Content-Type: application/json

{
  "token": "abc123...",
  "newPassword": "NewSecurePass123!"
}

Response: 200 OK
{
  "message": "Password reset successfully"
}
```

#### OAuth - Google
```
GET /auth/google
→ Redirects to Google OAuth consent screen
→ After approval, redirects back to: /auth/google/callback
→ Sets cookies and redirects to: ${FRONTEND_URL}/auth/callback?success=true
```

#### OAuth - GitHub
```
GET /auth/github
→ Redirects to GitHub OAuth authorization
→ After approval, redirects back to: /auth/github/callback
→ Sets cookies and redirects to: ${FRONTEND_URL}/auth/callback?success=true
```

### Protected Endpoints (Auth Required)

#### Get Current User
```
GET /auth/me
Authorization: Bearer <accessToken>
OR
Cookie: access_token=...

Response: 200 OK
{
  "id": "clxxx...",
  "email": "user@example.com",
  "displayName": "John Doe",
  "emailVerified": true,
  "isActive": true,
  "roles": [
    {
      "name": "user",
      "description": "Regular user with basic permissions"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Logout
```
POST /auth/logout
Authorization: Bearer <accessToken>
Cookie: refresh_token=...

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

## Usage in Controllers

### Protecting Routes

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CurrentUser } from './auth/decorators/current-user.decorator';

@Controller('sessions')
@UseGuards(JwtAuthGuard) // Protect entire controller
export class SessionsController {

  @Get()
  findAll(@CurrentUser() user: any) {
    // user contains: { id, email, roles }
    console.log('Current user:', user);
  }
}
```

### Public Routes

```typescript
import { Public } from './auth/decorators/public.decorator';

@Controller('public')
export class PublicController {

  @Public() // No authentication required
  @Get('tips')
  getTips() {
    return ['Tip 1', 'Tip 2'];
  }
}
```

### Role-Based Access Control

```typescript
import { Roles } from './auth/decorators/roles.decorator';
import { RolesGuard } from './auth/guards/roles.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {

  @Roles('admin') // Only admins can access
  @Get('users')
  getAllUsers() {
    // ...
  }

  @Roles('admin', 'coach') // Admins and coaches can access
  @Get('reports')
  getReports() {
    // ...
  }
}
```

### Permission-Based Access Control

```typescript
import { Permissions } from './auth/decorators/permissions.decorator';
import { PermissionsGuard } from './auth/guards/permissions.guard';

@Controller('resources')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ResourcesController {

  @Permissions('resources:create') // Requires specific permission
  @Post()
  create() {
    // Only users with 'resources:create' permission
  }

  @Permissions('resources:update', 'resources:delete')
  @Delete(':id')
  delete() {
    // Requires BOTH permissions
  }
}
```

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
# Generate JWT secrets
openssl rand -base64 32  # For JWT_ACCESS_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET

# SendGrid
SENDGRID_API_KEY=your-key  # Get from https://app.sendgrid.com/settings/api_keys
EMAIL_FROM=noreply@mindfulspace.com

# Google OAuth
GOOGLE_CLIENT_ID=your-id
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
# Get from: https://console.cloud.google.com/apis/credentials

# GitHub OAuth
GITHUB_CLIENT_ID=your-id
GITHUB_CLIENT_SECRET=your-secret
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
# Get from: https://github.com/settings/developers

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000
```

### 2. Database Setup

```bash
# Start database
docker compose -f docker-compose.db.yml up -d

# Run migration
pnpm --filter api db:migrate:dev --name add_authentication_system

# Seed roles and permissions
pnpm --filter api db:seed:auth
```

### 3. Verify Setup

```bash
# Start API
pnpm --filter api start:dev

# Test registration
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "displayName": "Test User"
  }'
```

## Default Roles & Permissions

The system comes with 4 default roles:

### 1. User (default for new registrations)
- Basic permissions for personal data
- Can create/read/update/delete own sessions and objectives
- Can read resources

### 2. Premium
- All user permissions
- Access to premium content

### 3. Coach
- All premium permissions
- Can create and manage resources
- Can manage client sessions

### 4. Admin
- All permissions
- Full system access
- User management
- Content management

## Testing

### Manual Testing with cURL

```bash
# Register
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#","displayName":"Test"}'

# Login (save cookies)
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!@#"}' \
  -c cookies.txt

# Get current user
curl http://localhost:3001/auth/me \
  -b cookies.txt

# Logout
curl -X POST http://localhost:3001/auth/logout \
  -b cookies.txt
```

### Testing OAuth Flows

1. Open browser: `http://localhost:3001/auth/google`
2. Sign in with Google
3. Should redirect to: `http://localhost:3000/auth/callback?success=true`
4. Cookies are set automatically

## Frontend Integration

### Using Cookies (Recommended for Web)

```typescript
// Login
const response = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important: includes cookies
  body: JSON.stringify({ email, password }),
});

// Subsequent requests
const user = await fetch('http://localhost:3001/auth/me', {
  credentials: 'include', // Cookies sent automatically
});

// Refresh token (automatic)
const newTokens = await fetch('http://localhost:3001/auth/refresh', {
  method: 'POST',
  credentials: 'include',
});
```

### Using Bearer Tokens (For Mobile/SPA)

```typescript
// Login and save tokens
const { tokens } = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
}).then(r => r.json());

localStorage.setItem('accessToken', tokens.accessToken);
localStorage.setItem('refreshToken', tokens.refreshToken);

// Use in requests
const user = await fetch('http://localhost:3001/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  },
});

// Refresh when access token expires
const { accessToken } = await fetch('http://localhost:3001/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refreshToken: localStorage.getItem('refreshToken')
  }),
}).then(r => r.json());

localStorage.setItem('accessToken', accessToken);
```

## Troubleshooting

### "Invalid or expired token"
- Access token expired (15min lifetime) → Use refresh endpoint
- Refresh token expired (7 days) → User must login again
- Token was revoked (e.g., after password reset) → User must login again

### "Please verify your email before logging in"
- Check email for verification link
- In development, token is logged to console
- Resend verification: (feature not implemented yet, manually create new user)

### OAuth redirect not working
- Check callback URLs match exactly (http vs https, port numbers)
- Verify OAuth credentials in Google/GitHub console
- Check FRONTEND_URL environment variable

### Rate limiting errors
- Wait a few seconds between requests
- In development, you can temporarily disable rate limiting in `auth.module.ts`

## Security Best Practices

1. **Never commit `.env` files** - use `.env.example` as template
2. **Use strong JWT secrets** - minimum 32 characters, random
3. **HTTPS in production** - cookies with `secure: true` flag
4. **Monitor failed login attempts** - implement alerting for brute force
5. **Regular token rotation** - refresh tokens are automatically rotated
6. **Validate environment variables** - ensure all required vars are set
7. **Keep dependencies updated** - especially security-related packages

## Future Enhancements

- [ ] Multi-Factor Authentication (MFA/2FA)
- [ ] Session management UI (view/revoke active sessions)
- [ ] Account deletion/deactivation
- [ ] Password change (while logged in)
- [ ] Resend email verification
- [ ] Social login: Facebook, Twitter, etc.
- [ ] API key authentication for integrations
- [ ] Audit logs for security events

## Support

For issues or questions:
1. Check this documentation
2. Review the code comments in `apps/api-nest/src/auth/`
3. Check environment variables in `.env`
4. Review Prisma logs for database issues
