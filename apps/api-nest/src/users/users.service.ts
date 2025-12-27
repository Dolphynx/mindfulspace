import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CryptoService } from '../auth/crypto.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
  ) {}

  /**
   * Get user profile with all details
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        oauthAccounts: {
          select: {
            provider: true,
            createdAt: true,
          },
        },
        refreshTokens: {
          select: {
            id: true,
            userAgent: true,
            ipAddress: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Don't send password hash to frontend
    const { password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      roles: user.userRoles.map((ur: any) => ur.role.name),
      hasPassword: !!password,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Change user password
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException('Cannot change password for OAuth-only accounts');
    }

    // Verify current password
    const isValid = await this.cryptoService.verifyPassword(dto.currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await this.cryptoService.hashPassword(dto.newPassword);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Revoke a specific refresh token (session)
   */
  async revokeSession(userId: string, tokenId: string) {
    const token = await this.prisma.refreshToken.findUnique({
      where: { id: tokenId },
    });

    if (!token) {
      throw new NotFoundException('Session not found');
    }

    if (token.userId !== userId) {
      throw new UnauthorizedException('Not authorized to revoke this session');
    }

    await this.prisma.refreshToken.delete({
      where: { id: tokenId },
    });

    return { message: 'Session revoked successfully' };
  }

  /**
   * Revoke all refresh tokens except current
   */
  async revokeAllOtherSessions(userId: string, currentTokenId?: string) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        ...(currentTokenId && { id: { not: currentTokenId } }),
      },
    });

    return { message: 'All other sessions revoked successfully' };
  }

  /**
   * Unlink OAuth account
   */
  async unlinkOAuthProvider(userId: string, provider: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        oauthAccounts: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent unlinking if it's the only auth method
    if (!user.password && user.oauthAccounts.length === 1) {
      throw new BadRequestException('Cannot unlink the only authentication method. Set a password first.');
    }

    const oauthAccount = user.oauthAccounts.find((acc: any) => acc.provider === provider);
    if (!oauthAccount) {
      throw new NotFoundException('OAuth account not found');
    }

    await this.prisma.oAuthAccount.delete({
      where: { id: oauthAccount.id },
    });

    return { message: `${provider} account unlinked successfully` };
  }

  /**
   * Get user data export (GDPR compliance)
   */
  async exportUserData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        oauthAccounts: true,
        meditationSessions: true,
        sleepSessions: true,
        exerciceSessions: {
          include: {
            exerciceSerie: true,
          },
        },
        badges: {
          include: {
            badge: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive data
    const { password, ...userData } = user;

    return {
      personalInfo: {
        id: userData.id,
        email: userData.email,
        displayName: userData.displayName,
        emailVerified: userData.emailVerified,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      },
      roles: userData.userRoles.map((ur: any) => ur.role.name),
      connectedAccounts: userData.oauthAccounts.map((acc: any) => ({
        provider: acc.provider,
        createdAt: acc.createdAt,
      })),
      meditationSessions: userData.meditationSessions,
      sleepSessions: userData.sleepSessions,
      exerciseSessions: userData.exerciceSessions,
      badges: userData.badges.map((b: any) => ({
        badgeSlug: b.badge.slug,
        earnedAt: b.earnedAt,
        metricValue: b.metricValueAtEarn,
      })),
    };
  }

  /**
   * Delete user account permanently (GDPR compliance)
   */
  async deleteAccount(userId: string, password?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password if user has one
    if (user.password) {
      if (!password) {
        throw new BadRequestException('Password required to delete account');
      }

      const isValid = await this.cryptoService.verifyPassword(password, user.password);
      if (!isValid) {
        throw new UnauthorizedException('Password is incorrect');
      }
    }

    // Delete user (cascade will handle related records)
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Account deleted successfully' };
  }
}
