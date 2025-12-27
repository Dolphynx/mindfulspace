import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  UseGuards,
  Get,
  Query,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { GithubOAuthGuard } from './guards/github-oauth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * POST /auth/register
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(ValidationPipe) dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Verify email with token
   * POST /auth/verify-email
   */
  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body(ValidationPipe) dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto.token);
  }

  /**
   * Login user
   * POST /auth/login
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(ValidationPipe) dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const result = await this.authService.login(dto, userAgent, ipAddress);

    // Set httpOnly cookies for web clients
    this.setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);

    // Also return tokens in response body for mobile/API clients
    return result;
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() dto?: RefreshTokenDto,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    // Try to get refresh token from cookie or body
    const refreshToken = req.cookies?.['refresh_token'] || dto?.refreshToken;

    if (!refreshToken) {
      throw new BadRequestException('Refresh token not provided');
    }

    const tokens = await this.authService.refreshTokens(refreshToken, userAgent, ipAddress);

    // Set new cookies
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

    // Also return tokens in response body
    return tokens;
  }

  /**
   * Logout user
   * POST /auth/logout
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.['refresh_token'];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Clear cookies
    this.clearAuthCookies(res);

    return { message: 'Logged out successfully' };
  }

  /**
   * Request password reset
   * POST /auth/forgot-password
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body(ValidationPipe) dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body(ValidationPipe) dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  /**
   * Get current authenticated user
   * GET /auth/me
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@CurrentUser() user: any) {
    const fullUser = await this.authService.getUserById(user.id);

    return {
      id: fullUser.id,
      email: fullUser.email,
      displayName: fullUser.displayName,
      emailVerified: fullUser.emailVerified,
      isActive: fullUser.isActive,
      roles: fullUser.userRoles.map((ur) => ur.role.name),
      createdAt: fullUser.createdAt,
      updatedAt: fullUser.updatedAt,
    };
  }

  /**
   * Google OAuth - Initiate
   * GET /auth/google
   */
  @Public()
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Query('redirectTo') redirectTo?: string, @Req() req?: any) {
    // Store redirectTo in session/state if provided
    if (redirectTo && req) {
      const state = Buffer.from(JSON.stringify({ redirectTo })).toString('base64');
      req.query.state = state;
    }
    // Initiates the Google OAuth flow
  }

  /**
   * Google OAuth - Callback
   * GET /auth/google/callback
   */
  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('state') state?: string,
  ) {
    const user = req.user as any;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    // Extract roles
    const roles = user.userRoles.map((ur: any) => ur.role.name);

    // Generate tokens
    const payload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    const accessToken = await this.authService['jwtService'].signAsync(payload, {
      secret: this.authService['configService'].get('JWT_ACCESS_SECRET'),
      expiresIn: '2h',
    });

    const refreshToken = this.authService['cryptoService'].generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.authService['prisma'].refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    // Set cookies
    this.setAuthCookies(res, accessToken, refreshToken);

    // Redirect to frontend with success, preserving redirectTo if present
    const frontendUrl = this.authService['configService'].get('FRONTEND_URL') || 'http://localhost:3000';
    let redirectUrl = `${frontendUrl}/auth/callback?success=true`;

    // Parse state to extract redirectTo if present
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
        if (stateData.redirectTo) {
          redirectUrl += `&redirectTo=${encodeURIComponent(stateData.redirectTo)}`;
        }
      } catch (err) {
        // If state parsing fails, just continue without redirectTo
      }
    }

    res.redirect(redirectUrl);
  }

  /**
   * GitHub OAuth - Initiate
   * GET /auth/github
   */
  @Public()
  @Get('github')
  @UseGuards(GithubOAuthGuard)
  async githubAuth(@Query('redirectTo') redirectTo?: string, @Req() req?: any) {
    // Store redirectTo in session/state if provided
    if (redirectTo && req) {
      const state = Buffer.from(JSON.stringify({ redirectTo })).toString('base64');
      req.query.state = state;
    }
    // Initiates the GitHub OAuth flow
  }

  /**
   * GitHub OAuth - Callback
   * GET /auth/github/callback
   */
  @Public()
  @Get('github/callback')
  @UseGuards(GithubOAuthGuard)
  async githubAuthCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Query('state') state?: string,
  ) {
    const user = req.user as any;
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    // Extract roles
    const roles = user.userRoles.map((ur: any) => ur.role.name);

    // Generate tokens
    const payload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    const accessToken = await this.authService['jwtService'].signAsync(payload, {
      secret: this.authService['configService'].get('JWT_ACCESS_SECRET'),
      expiresIn: '2h',
    });

    const refreshToken = this.authService['cryptoService'].generateRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.authService['prisma'].refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
        userAgent,
        ipAddress,
      },
    });

    // Set cookies
    this.setAuthCookies(res, accessToken, refreshToken);

    // Redirect to frontend with success, preserving redirectTo if present
    const frontendUrl = this.authService['configService'].get('FRONTEND_URL') || 'http://localhost:3000';
    let redirectUrl = `${frontendUrl}/auth/callback?success=true`;

    // Parse state to extract redirectTo if present
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
        if (stateData.redirectTo) {
          redirectUrl += `&redirectTo=${encodeURIComponent(stateData.redirectTo)}`;
        }
      } catch (err) {
        // If state parsing fails, just continue without redirectTo
      }
    }

    res.redirect(redirectUrl);
  }

  /**
   * Helper method to set auth cookies
   */
  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    // Access token cookie (2 hours for PWA/mobile)
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      path: '/',
    });

    // Refresh token cookie (30 days for PWA/mobile)
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    });
  }

  /**
   * Helper method to clear auth cookies
   */
  private clearAuthCookies(res: Response) {
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
  }
}
