import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(
    @Request() req,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    return this.notificationService.getUserNotifications(
      req.user.id,
      pageNum,
      pageSizeNum,
    );
  }

  @Get('unread/count')
  async getUnreadNotificationsCount(@Request() req) {
    return {
      count: await this.notificationService.getUnreadNotificationsCount(
        req.user.id,
      ),
    };
  }

  @Patch(':id/read')
  async markNotificationAsRead(
    @Param('id') notificationId: string,
    @Request() req,
  ) {
    return this.notificationService.markNotificationAsRead(
      notificationId,
      req.user.id,
    );
  }

  @Patch('read/all')
  async markAllNotificationsAsRead(@Request() req) {
    return this.notificationService.markAllNotificationsAsRead(req.user.id);
  }
}
