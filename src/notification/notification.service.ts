import { Injectable } from '@nestjs/common';
import { NotificationType } from 'generated/prisma';
import { PrismaService } from 'src/prisma.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private notificationGateway: NotificationGateway,
  ) {}

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

    this.notificationGateway.sendNotificationToUser(userId, {
      type: 'NOTIFICATION_READ',
      notificationId,
    });

    return result;
  }

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

  async getUnreadNotificationsCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }
}
