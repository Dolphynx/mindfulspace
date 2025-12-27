import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SubscriptionRequestsService } from './subscription-requests.service';
import { CreateSubscriptionRequestDto } from './dto/create-subscription-request.dto';
import { ReviewSubscriptionRequestDto } from './dto/review-subscription-request.dto';
import { QuerySubscriptionRequestsDto } from './dto/query-subscription-requests.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('subscription-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionRequestsController {
  constructor(private readonly service: SubscriptionRequestsService) {}

  /**
   * Create a new subscription request
   */
  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateSubscriptionRequestDto,
  ) {
    return this.service.create(userId, dto);
  }

  /**
   * Get all requests (admin only)
   */
  @Get()
  @Roles('admin')
  findAll(@Query() query: QuerySubscriptionRequestsDto) {
    return this.service.findAll(query);
  }

  /**
   * Get current user's requests
   */
  @Get('my-requests')
  findMyRequests(@CurrentUser('id') userId: string) {
    return this.service.findMyRequests(userId);
  }

  /**
   * Get unread notification decisions (for notification system)
   */
  @Get('notifications')
  async myNotifications(@Req() req: any) {
    return this.service.getUnreadDecisions(req.user.id);
  }

  /**
   * Get specific request
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  /**
   * Review a request (admin only)
   */
  @Put(':id/review')
  @Roles('admin')
  review(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: ReviewSubscriptionRequestDto,
  ) {
    return this.service.review(id, adminId, dto);
  }

  /**
   * Mark specific request as read
   */
  @Patch(':id/read')
  async markRead(@Req() req: any, @Param('id') id: string) {
    return this.service.markAsRead(req.user.id, id);
  }

  /**
   * Mark all unread decisions as read
   */
  @Patch('read-all')
  async markAllRead(@Req() req: any) {
    return this.service.markAllAsRead(req.user.id);
  }

  /**
   * Cancel own pending request
   */
  @Put(':id/cancel')
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.cancel(id, userId);
  }
}
