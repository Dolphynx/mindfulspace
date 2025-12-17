# Authentication Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Set Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
# Generate secure secrets
JWT_ACCESS_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# For development, you can use console logging for emails (no SendGrid needed)
# Just leave SENDGRID_API_KEY empty, and verification/reset tokens will be logged to console

# Optional: OAuth (skip for now if you want to test basic auth first)
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
GITHUB_CLIENT_ID=your-github-id
GITHUB_CLIENT_SECRET=your-github-secret

FRONTEND_URL=http://localhost:3000
```

### Step 2: Start Database & Run Migrations

```bash
# Start PostgreSQL
docker compose -f docker-compose.db.yml up -d

# Run authentication migration
cd apps/api-nest
pnpm db:migrate:dev --name add_authentication_system

# Seed default roles (user, premium, coach, admin)
pnpm db:seed:auth
```

### Step 3: Start API

```bash
# From project root
pnpm --filter api start:dev

# API will be available at: http://localhost:3001
```

### Step 4: Test It!

```bash
# Register a new user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "displayName": "Test User"
  }'

# Check console for verification token (since SendGrid is not configured)
# Look for: "Email verification token: abc123..."

# Verify email
curl -X POST http://localhost:3001/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "paste-token-from-console"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }' \
  -c cookies.txt

# Get current user (using cookies)
curl http://localhost:3001/auth/me -b cookies.txt
```

## 📖 Key Endpoints

```
POST   /auth/register          Register new user
POST   /auth/verify-email      Verify email with token
POST   /auth/login             Login (get tokens + cookies)
POST   /auth/logout            Logout (clear tokens)
POST   /auth/refresh           Refresh access token
POST   /auth/forgot-password   Request password reset
POST   /auth/reset-password    Reset password with token
GET    /auth/me                Get current user
GET    /auth/google            OAuth with Google
GET    /auth/github            OAuth with GitHub
```

## 🛡️ Using in Your Controllers

### Protect entire controller:
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CurrentUser } from './auth/decorators/current-user.decorator';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  @Get()
  findAll(@CurrentUser() user: any) {
    // user.id, user.email, user.roles available
    return this.sessionsService.findAllForUser(user.id);
  }
}
```

### Public routes:
```typescript
import { Public } from './auth/decorators/public.decorator';

@Public()
@Get('public-tips')
getTips() {
  // No auth required
}
```

### Require specific roles:
```typescript
import { Roles } from './auth/decorators/roles.decorator';
import { RolesGuard } from './auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Delete(':id')
deleteUser() {
  // Only admins
}
```

## 🎯 Default Roles

After running the seed script, these roles are available:

- **user**: Default role for new registrations
- **premium**: Access to premium content
- **coach**: Can manage resources and clients
- **admin**: Full system access

## 🔧 Troubleshooting

**"Can't reach database server"**
- Start database: `docker compose -f docker-compose.db.yml up -d`

**"Email not verified"**
- Check console for verification token (in development mode)
- Or configure SendGrid in .env for production

**"Invalid token"**
- Access tokens expire in 15 minutes
- Use `/auth/refresh` endpoint to get new token

**OAuth not working**
- Make sure callback URLs match exactly in Google/GitHub console
- Check FRONTEND_URL is set correctly

## 📚 Full Documentation

See [AUTHENTICATION.md](AUTHENTICATION.md) for complete documentation including:
- Detailed API reference
- Security features
- Frontend integration examples
- Production deployment guide
- Troubleshooting

## 🌐 Frontend Integration Example

### React/Next.js with cookies:
```typescript
// Login
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:3001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important!
    body: JSON.stringify({ email, password }),
  });
  return response.json();
};

// Get current user
const getCurrentUser = async () => {
  const response = await fetch('http://localhost:3001/auth/me', {
    credentials: 'include',
  });
  return response.json();
};

// Logout
const logout = async () => {
  await fetch('http://localhost:3001/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
};
```

## ✅ You're Ready!

Your authentication system is now configured with:
- ✅ Email/password authentication
- ✅ Email verification
- ✅ JWT tokens (access + refresh)
- ✅ Cookie + Bearer token support
- ✅ OAuth (Google + GitHub)
- ✅ RBAC with 4 default roles
- ✅ Password reset
- ✅ Rate limiting
- ✅ Secure password hashing (Argon2)

Need help? Check [AUTHENTICATION.md](AUTHENTICATION.md) for full documentation!
