import { Injectable } from '@nestjs/common';
import { NotificationType } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';
import { NotificationGateway } from './notification.gateway';
import { CatchException } from 'src/common/decorators/catch-exception.decorator';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

  @CatchException('NotificationService.createNotification')
  async createNotification(
    userId: string,
    type: NotificationType,
    content: string,
    relatedEntityId?: string,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type,
        content,
        relatedEntityId,
      },
    });

    this.notificationGateway.sendNotificationToUser(userId, {
      id: notification.id,
      type: notification.type,
      content: notification.content,
      relatedEntityId: notification.relatedEntityId,
      createdAt: notification.createdAt,
      isRead: notification.isRead,
    });

    return notification;
  }

  @CatchException('NotificationService.getUserNotifications')
  async getUserNotifications(userId: string, page = 1, pageSize = 10) {
    const [total, notifications] = await Promise.all([
      this.prisma.notification.count({
        where: { userId },
      }),
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      data: notifications,
    };
  }

  @CatchException('NotificationService.markNotificationAsRead')
  async markNotificationAsRead(notificationId: string, userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    });

    if (result.count === 0) {
      throw new BadRequestException('通知不存在或无权限标记');
    }

    this.notificationGateway.sendNotificationToUser(userId, {
      type: 'NOTIFICATION_READ',
      notificationId,
    });

    return result;
  }

  @CatchException('NotificationService.markAllNotificationsAsRead')
  async markAllNotificationsAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    this.notificationGateway.sendNotificationToUser(userId, {
      type: 'ALL_NOTIFICATIONS_READ',
    });

    return result;
  }

  @CatchException('NotificationService.getUnreadNotificationsCount')
  async getUnreadNotificationsCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }
}
