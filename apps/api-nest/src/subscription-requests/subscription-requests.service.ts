import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSubscriptionRequestDto } from './dto/create-subscription-request.dto';
import { ReviewSubscriptionRequestDto } from './dto/review-subscription-request.dto';
import { QuerySubscriptionRequestsDto } from './dto/query-subscription-requests.dto';
import {
  SubscriptionRequestStatus,
  SubscriptionRequestType,
} from '@prisma/client';

@Injectable()
export class SubscriptionRequestsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new subscription request
   * Users can only have one PENDING request per type at a time
   */
  async create(userId: string, dto: CreateSubscriptionRequestDto) {
    // Check if user already has the target role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user) throw new NotFoundException('User not found');

    const hasRole = user.userRoles.some((ur: any) => {
      if (dto.requestType === SubscriptionRequestType.PREMIUM) {
        return ['premium', 'coach', 'admin'].includes(ur.role.name);
      }
      if (dto.requestType === SubscriptionRequestType.COACH) {
        return ['coach', 'admin'].includes(ur.role.name);
      }
      return false;
    });

    if (hasRole) {
      throw new BadRequestException(
        `You already have ${dto.requestType.toLowerCase()} access`,
      );
    }

    // Check for existing pending request
    const existingPending = await this.prisma.subscriptionRequest.findFirst({
      where: {
        userId,
        requestType: dto.requestType,
        status: SubscriptionRequestStatus.PENDING,
      },
    });

    if (existingPending) {
      throw new BadRequestException(
        `You already have a pending ${dto.requestType.toLowerCase()} request`,
      );
    }

    // Validate coach tier is provided for coach requests
    if (
      dto.requestType === SubscriptionRequestType.COACH &&
      !dto.coachTier
    ) {
      throw new BadRequestException(
        'Coach tier must be specified for coach requests',
      );
    }

    // Create the request
    return this.prisma.subscriptionRequest.create({
      data: {
        userId,
        requestType: dto.requestType,
        coachTier: dto.coachTier,
        motivation: dto.motivation,
        experience: dto.experience,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });
  }

  /**
   * Get all subscription requests (admin only)
   * Supports filtering by status and type
   */
  async findAll(query: QuerySubscriptionRequestsDto) {
    return this.prisma.subscriptionRequest.findMany({
      where: {
        ...(query.status && { status: query.status }),
        ...(query.requestType && { requestType: query.requestType }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        reviewedByUser: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // PENDING first
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Get current user's subscription requests
   */
  async findMyRequests(userId: string) {
    return this.prisma.subscriptionRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a specific request by ID
   */
  async findOne(id: string) {
    const request = await this.prisma.subscriptionRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        reviewedByUser: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Subscription request not found');
    }

    return request;
  }

  /**
   * Review a subscription request (admin only)
   * On approval, automatically assigns the role
   */
  async review(
    id: string,
    adminId: string,
    dto: ReviewSubscriptionRequestDto,
  ) {
    const request = await this.findOne(id);

    if (request.status !== SubscriptionRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be reviewed');
    }

    if (
      dto.status !== SubscriptionRequestStatus.APPROVED &&
      dto.status !== SubscriptionRequestStatus.REJECTED
    ) {
      throw new BadRequestException('Status must be APPROVED or REJECTED');
    }

    // Update request status
    const updatedRequest = await this.prisma.subscriptionRequest.update({
      where: { id },
      data: {
        status: dto.status,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        adminNotes: dto.adminNotes,
        isRead: false, // Reset isRead so user gets notified
      },
    });

    // If approved, assign the role
    if (dto.status === SubscriptionRequestStatus.APPROVED) {
      await this.assignRole(request.userId, request.requestType);
    }

    return updatedRequest;
  }

  /**
   * Assign role based on request type
   */
  private async assignRole(
    userId: string,
    requestType: SubscriptionRequestType,
  ) {
    let roleName: string;

    if (requestType === SubscriptionRequestType.PREMIUM) {
      roleName = 'premium';
    } else if (requestType === SubscriptionRequestType.COACH) {
      roleName = 'coach';
    } else {
      throw new BadRequestException('Invalid request type');
    }

    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new NotFoundException(`Role ${roleName} not found`);
    }

    // Check if user already has this role
    const existingUserRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId: role.id,
        },
      },
    });

    if (!existingUserRole) {
      await this.prisma.userRole.create({
        data: {
          userId,
          roleId: role.id,
        },
      });
    }
  }

  /**
   * Get unread decisions for user (for notification system)
   */
  async getUnreadDecisions(userId: string) {
    const items = await this.prisma.subscriptionRequest.findMany({
      where: {
        userId,
        isRead: false,
        status: { not: SubscriptionRequestStatus.PENDING },
      },
      orderBy: { reviewedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        requestType: true,
        status: true,
        coachTier: true,
        reviewedAt: true,
      },
    });

    return { unreadCount: items.length, items };
  }

  /**
   * Mark request as read (user acknowledges decision)
   */
  async markAsRead(userId: string, id: string) {
    const found = await this.prisma.subscriptionRequest.findUnique({
      where: { id },
      select: { userId: true },
    });
    if (!found || found.userId !== userId) throw new ForbiddenException();

    return this.prisma.subscriptionRequest.update({
      where: { id },
      data: { isRead: true },
      select: { id: true, isRead: true },
    });
  }

  /**
   * Mark all unread decisions as read for user
   */
  async markAllAsRead(userId: string) {
    await this.prisma.subscriptionRequest.updateMany({
      where: {
        userId,
        isRead: false,
        status: { not: SubscriptionRequestStatus.PENDING },
      },
      data: { isRead: true },
    });
    return { ok: true };
  }

  /**
   * Cancel a pending request (user can cancel their own)
   */
  async cancel(id: string, userId: string) {
    const request = await this.findOne(id);

    if (request.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own requests');
    }

    if (request.status !== SubscriptionRequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be cancelled');
    }

    return this.prisma.subscriptionRequest.update({
      where: { id },
      data: {
        status: SubscriptionRequestStatus.CANCELLED,
      },
    });
  }
}
