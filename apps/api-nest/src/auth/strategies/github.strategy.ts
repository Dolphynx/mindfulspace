import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL') || 'http://localhost:3001/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const { id, emails, displayName, username } = profile;
    const email = emails?.[0]?.value;

    if (!email) {
      throw new Error('No email found in GitHub profile');
    }

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
            displayName: displayName || username,
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
        (account) => account.provider === 'github' && account.providerId === id,
      );

      if (!existingOAuthAccount) {
        // Link OAuth account to user
        await this.prisma.oAuthAccount.create({
          data: {
            provider: 'github',
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
        throw new Error('User not found after OAuth');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}
