import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user's profile
   * GET /users/profile
   */
  @Get('profile')
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.getProfile(userId);
  }

  /**
   * Update user profile
   * PUT /users/profile
   */
  @Put('profile')
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  /**
   * Change password
   * POST /users/change-password
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(@CurrentUser('id') userId: string, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(userId, dto);
  }

  /**
   * Revoke a specific session
   * DELETE /users/sessions/:tokenId
   */
  @Delete('sessions/:tokenId')
  @HttpCode(HttpStatus.OK)
  async revokeSession(@CurrentUser('id') userId: string, @Param('tokenId') tokenId: string) {
    return this.usersService.revokeSession(userId, tokenId);
  }

  /**
   * Revoke all other sessions
   * POST /users/sessions/revoke-all
   */
  @Post('sessions/revoke-all')
  @HttpCode(HttpStatus.OK)
  async revokeAllOtherSessions(@CurrentUser('id') userId: string) {
    return this.usersService.revokeAllOtherSessions(userId);
  }

  /**
   * Unlink OAuth provider
   * DELETE /users/oauth/:provider
   */
  @Delete('oauth/:provider')
  @HttpCode(HttpStatus.OK)
  async unlinkOAuthProvider(@CurrentUser('id') userId: string, @Param('provider') provider: string) {
    return this.usersService.unlinkOAuthProvider(userId, provider);
  }

  /**
   * Export user data (GDPR)
   * GET /users/export-data
   */
  @Get('export-data')
  async exportUserData(@CurrentUser('id') userId: string) {
    return this.usersService.exportUserData(userId);
  }

  /**
   * Delete account (GDPR)
   * DELETE /users/account
   */
  @Delete('account')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@CurrentUser('id') userId: string, @Body('password') password?: string) {
    return this.usersService.deleteAccount(userId, password);
  }
}
