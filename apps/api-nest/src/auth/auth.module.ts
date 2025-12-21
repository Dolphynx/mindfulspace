import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CryptoService } from './crypto.service';
import { EmailService } from './email.service';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';

// Build providers array conditionally based on environment variables
const providers: Array<any> = [
  AuthService,
  CryptoService,
  EmailService,
  JwtAccessStrategy,
  JwtRefreshStrategy,
  // Apply JWT auth guard globally (use @Public() decorator to exclude routes)
  {
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  },
  // Apply Roles guard globally (use @Roles() decorator to activate role-based protection)
  {
    provide: APP_GUARD,
    useClass: RolesGuard,
  },
  // Permissions guard (use @Permissions() decorator to activate permission-based protection)
  PermissionsGuard,
];

// Only add OAuth strategies if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(GoogleStrategy);
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(GithubStrategy);
}

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '2h' }, // 2 hours for PWA/mobile compatibility
      }),
      inject: [ConfigService],
    }),
    // Rate limiting for auth endpoints
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000, // 1 second
        limit: 3, // 3 requests per second
      },
      {
        name: 'medium',
        ttl: 10000, // 10 seconds
        limit: 20, // 20 requests per 10 seconds
      },
      {
        name: 'long',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
  ],
  controllers: [AuthController],
  providers,
  exports: [AuthService, CryptoService],
})
export class AuthModule {}
