# API Keys Setup Guide

This guide walks you through getting API keys for SendGrid, Google OAuth, and GitHub OAuth.

## ✅ JWT Secrets - Already Done!

The `.env.example` file already has strong JWT secrets generated. You can use them as-is for development.

For production, generate new ones:
```bash
openssl rand -base64 32  # JWT_ACCESS_SECRET
openssl rand -base64 32  # JWT_REFRESH_SECRET
```

---

## 📧 SendGrid API Key (Email Service)

**Note:** This is **OPTIONAL** for development. If you skip this, emails will be logged to the console instead.

### Free Tier: 100 emails/day

### Steps:

1. **Sign up** at https://sendgrid.com (free account)

2. **Verify your email** (check your inbox)

3. **Create API Key:**
   - Go to https://app.sendgrid.com/settings/api_keys
   - Click "Create API Key"
   - Name: `MindfulSpace Development`
   - Permissions: Select "Full Access"
   - Click "Create & View"

4. **Copy the API key** (shown only once!)
   ```
   SG.xxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyy
   ```

5. **Add to `.env`:**
   ```bash
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyy
   ```

6. **Verify sender email** (required to send emails):
   - Go to https://app.sendgrid.com/settings/sender_auth/senders
   - Click "Create New Sender"
   - Fill in your details
   - Verify the email address
   - Update `.env`:
     ```bash
     EMAIL_FROM=youremail@example.com
     ```

### Testing without SendGrid:

Just leave `SENDGRID_API_KEY` empty in `.env`, and all emails will be logged to console:
```
===== EMAIL (Development Mode) =====
To: user@example.com
Subject: Verify your MindfulSpace account
Body: Hello User, Please verify your email by clicking this link: ...
====================================
```

---

## 🔐 Google OAuth (Sign in with Google)

**Note:** This is **OPTIONAL**. Only needed if you want "Sign in with Google" feature.

### Steps:

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com

2. **Create a new project** (or select existing):
   - Click project dropdown at top
   - Click "New Project"
   - Name: `MindfulSpace`
   - Click "Create"

3. **Enable Google+ API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. **Configure OAuth consent screen:**
   - Go to "APIs & Services" > "OAuth consent screen"
   - User Type: "External"
   - App name: `MindfulSpace`
   - User support email: your email
   - Developer contact: your email
   - Click "Save and Continue"
   - Scopes: Click "Save and Continue" (default scopes are fine)
   - Test users: Add your email
   - Click "Save and Continue"

5. **Create OAuth 2.0 Client ID:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: `MindfulSpace Web`
   - Authorized JavaScript origins:
     - `http://localhost:3001`
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3001/auth/google/callback`
   - Click "Create"

6. **Copy credentials:**
   - Client ID: `xxxxxx.apps.googleusercontent.com`
   - Client Secret: `GOCSPX-xxxxxxxxxxxxxxxx`

7. **Add to `.env`:**
   ```bash
   GOOGLE_CLIENT_ID=xxxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxx
   GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
   ```

### For Production:

Add your production URLs to "Authorized redirect URIs":
- `https://yourdomain.com/auth/google/callback`
- `https://api.yourdomain.com/auth/google/callback`

---

## 🐙 GitHub OAuth (Sign in with GitHub)

**Note:** This is **OPTIONAL**. Only needed if you want "Sign in with GitHub" feature.

### Steps:

1. **Go to GitHub Settings:**
   https://github.com/settings/developers

2. **Create OAuth App:**
   - Click "OAuth Apps" in left sidebar
   - Click "New OAuth App"

3. **Fill in details:**
   - Application name: `MindfulSpace`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3001/auth/github/callback`
   - Click "Register application"

4. **Get credentials:**
   - Client ID: `Iv1.xxxxxxxxxxxxxxxx` (shown immediately)
   - Client Secret: Click "Generate a new client secret"
     - Copy the secret (shown only once!)
     - `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

5. **Add to `.env`:**
   ```bash
   GITHUB_CLIENT_ID=Iv1.xxxxxxxxxxxxxxxx
   GITHUB_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
   ```

### For Production:

Create a separate OAuth App for production:
- Homepage URL: `https://yourdomain.com`
- Authorization callback URL: `https://api.yourdomain.com/auth/github/callback`

---

## 🚀 Quick Start (Minimal Setup)

You can start testing authentication **right now** with just the JWT secrets (already set)!

1. **Copy `.env.example` to `.env`:**
   ```bash
   cp .env.example .env
   ```

2. **Start database:**
   ```bash
   docker compose -f docker-compose.db.yml up -d
   ```

3. **Run migrations and seeds:**
   ```bash
   cd apps/api-nest
   pnpm db:migrate:dev --name add_authentication_system
   pnpm db:seed:auth
   ```

4. **Start API:**
   ```bash
   pnpm --filter api start:dev
   ```

5. **Test registration:**
   ```bash
   curl -X POST http://localhost:3001/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test123!@#",
       "displayName": "Test User"
     }'
   ```

6. **Check console for verification token** (since SendGrid is not configured)

7. **Verify email:**
   ```bash
   curl -X POST http://localhost:3001/auth/verify-email \
     -H "Content-Type: application/json" \
     -d '{"token": "paste-token-from-console"}'
   ```

8. **Login:**
   ```bash
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "Test123!@#"
     }' -c cookies.txt
   ```

**That's it!** Email/password authentication works without any external API keys.

---

## 📋 Summary

| Service | Required? | Free Tier | Setup Time |
|---------|-----------|-----------|------------|
| **JWT Secrets** | ✅ Required | N/A | ✅ Done! |
| **SendGrid** | ⚠️ Optional | 100/day | 5 min |
| **Google OAuth** | ⚠️ Optional | Unlimited | 10 min |
| **GitHub OAuth** | ⚠️ Optional | Unlimited | 5 min |

### What works without external APIs:
- ✅ Registration
- ✅ Login
- ✅ Email verification (tokens logged to console)
- ✅ Password reset (tokens logged to console)
- ✅ JWT authentication
- ✅ RBAC (roles and permissions)
- ✅ All protected endpoints

### What needs external APIs:
- ❌ Sending actual emails (needs SendGrid)
- ❌ "Sign in with Google" (needs Google OAuth)
- ❌ "Sign in with GitHub" (needs GitHub OAuth)

---

## 🔒 Production Checklist

Before deploying to production:

- [ ] Generate new JWT secrets (don't use the example ones)
- [ ] Set up SendGrid API key
- [ ] Configure OAuth apps for production domains
- [ ] Use environment variables (not `.env` file)
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Update CORS origins to production domains
- [ ] Review rate limiting settings
- [ ] Set up monitoring and alerts
- [ ] Back up database regularly

---

## 🆘 Need Help?

- SendGrid: https://docs.sendgrid.com
- Google OAuth: https://developers.google.com/identity/protocols/oauth2
- GitHub OAuth: https://docs.github.com/en/developers/apps/building-oauth-apps

Or check the main documentation: [AUTHENTICATION.md](./AUTHENTICATION.md)
