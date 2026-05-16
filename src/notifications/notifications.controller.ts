import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationsFilterDto } from './dto/notifications-filter.dto'; // ✨ جديد

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  /**
   * GET /api/notifications?page=1&limit=20&unreadOnly=true
   * إشعارات المستخدم الحالي
   */
  @Get()
  findMine(
    @CurrentUser() user: any,
    @Query() query: NotificationsFilterDto, // ✨ تغيّر النوع
  ) {
    return this.notificationsService.findMyNotifications(
      Number(user.user_id ?? user.admin_id),
      {
        ...query,
        unreadOnly: query.unreadOnly === 'true',
      },
    );
  }

  /**
   * GET /api/notifications/unread-count
   */
  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: any) {
    return this.notificationsService.getUnreadCount(
      Number(user.user_id ?? user.admin_id),
    );
  }

  /**
   * PATCH /api/notifications/:id/read
   */
  @Patch(':id/read')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
  ) {
    return this.notificationsService.markAsRead(
      id,
      Number(user.user_id ?? user.admin_id),
    );
  }

  /**
   * PATCH /api/notifications/read-all
   */
  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(
      Number(user.user_id ?? user.admin_id),
    );
  }

  /**
   * DELETE /api/notifications/:id
   */
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.notificationsService.delete(
      id,
      Number(user.user_id ?? user.admin_id),
    );
  }

  /**
   * DELETE /api/notifications
   */
  @Delete()
  deleteAll(@CurrentUser() user: any) {
    return this.notificationsService.deleteAll(
      Number(user.user_id ?? user.admin_id),
    );
  }
}