import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly fromEmail: string;
  private readonly frontendUrl: string;
  private readonly isEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get('SENDGRID_API_KEY');
    this.fromEmail = this.configService.get('EMAIL_FROM') || 'noreply@mindfulspace.com';
    this.frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    this.isEnabled = !!apiKey;

    if (this.isEnabled) {
      sgMail.setApiKey(apiKey);
      this.logger.log('SendGrid email service initialized');
    } else {
      this.logger.warn('SendGrid API key not found - email sending is disabled (development mode)');
    }
  }

  /**
   * Send email verification email
   */
  async sendVerificationEmail(email: string, displayName: string, token: string): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;

    const msg = {
      to: email,
      from: this.fromEmail,
      subject: 'Verify your MindfulSpace account',
      text: `Hello ${displayName},\n\nPlease verify your email by clicking this link: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to MindfulSpace!</h2>
          <p>Hello ${displayName},</p>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #4F46E5; color: white; padding: 12px 30px;
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            If you didn't create an account with MindfulSpace, please ignore this email.
          </p>
        </div>
      `,
    };

    await this.sendEmail(msg);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, displayName: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;

    const msg = {
      to: email,
      from: this.fromEmail,
      subject: 'Reset your MindfulSpace password',
      text: `Hello ${displayName},\n\nYou requested to reset your password. Click this link to reset it: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>Hello ${displayName},</p>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #4F46E5; color: white; padding: 12px 30px;
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link into your browser:<br>
            <a href="${resetUrl}">${resetUrl}</a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            If you didn't request a password reset, please ignore this email or contact support if you're concerned.
          </p>
        </div>
      `,
    };

    await this.sendEmail(msg);
  }

  /**
   * Send email (with fallback to console in development)
   */
  private async sendEmail(msg: sgMail.MailDataRequired): Promise<void> {
    try {
      if (this.isEnabled) {
        await sgMail.send(msg);
        this.logger.log(`Email sent successfully to ${msg.to}`);
      } else {
        // Development mode - log to console
        this.logger.log('===== EMAIL (Development Mode) =====');
        this.logger.log(`To: ${msg.to}`);
        this.logger.log(`From: ${msg.from}`);
        this.logger.log(`Subject: ${msg.subject}`);
        this.logger.log(`Body: ${msg.text}`);
        this.logger.log('====================================');
      }
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      throw error;
    }
  }
}
