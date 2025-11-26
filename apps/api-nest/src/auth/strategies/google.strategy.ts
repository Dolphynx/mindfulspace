import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || 'http://localhost:3001/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    const { id, emails, displayName, photos } = profile;
    const email = emails[0].value;

    try {
      // Check if user exists with this email
      let user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          oauthAccounts: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email,
            displayName,
            emailVerified: true, // OAuth emails are already verified
            password: null, // No password for OAuth-only users
          },
          include: {
            oauthAccounts: true,
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        });

        // Assign default "user" role
        const userRole = await this.prisma.role.findUnique({
          where: { name: 'user' },
        });

        if (userRole) {
          await this.prisma.userRole.create({
            data: {
              userId: user.id,
              roleId: userRole.id,
            },
          });
        }
      }

      // Check if OAuth account exists
      const existingOAuthAccount = user.oauthAccounts.find(
        (account) => account.provider === 'google' && account.providerId === id,
      );

      if (!existingOAuthAccount) {
        // Link OAuth account to user
        await this.prisma.oAuthAccount.create({
          data: {
            provider: 'google',
            providerId: id,
            userId: user.id,
            accessToken,
            refreshToken,
          },
        });
      } else {
        // Update tokens
        await this.prisma.oAuthAccount.update({
          where: { id: existingOAuthAccount.id },
          data: {
            accessToken,
            refreshToken,
          },
        });
      }

      // Reload user with updated data
      user = await this.prisma.user.findUnique({
        where: { id: user.id },
        include: {
          oauthAccounts: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        return done(new Error('User not found after OAuth'), false);
      }

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
