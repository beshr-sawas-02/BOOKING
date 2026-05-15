import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma, NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PaginationDto,
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/dto/pagination.dto';

export interface CreateNotificationParams {
  userId: number | bigint;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: number | bigint;
  relatedType?: 'booking' | 'passport' | 'document';
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * إنشاء إشعار جديد للمستخدم
   * تُستدعى من services أخرى (bookings, embassy, إلخ)
   */
  async create(params: CreateNotificationParams) {
    return this.prisma.notification.create({
      data: {
        user_id: BigInt(params.userId),
        type: params.type,
        title: params.title,
        message: params.message,
        related_id: params.relatedId ? BigInt(params.relatedId) : null,
        related_type: params.relatedType ?? null,
      },
    });
  }

  /**
   * إنشاء عدة إشعارات دفعة وحدة (للسفارة لما ترفع Excel)
   */
  async createMany(notifications: CreateNotificationParams[]) {
    if (notifications.length === 0) return { count: 0 };

    return this.prisma.notification.createMany({
      data: notifications.map((n) => ({
        user_id: BigInt(n.userId),
        type: n.type,
        title: n.title,
        message: n.message,
        related_id: n.relatedId ? BigInt(n.relatedId) : null,
        related_type: n.relatedType ?? null,
      })),
    });
  }

  /**
   * جلب إشعارات المستخدم مع pagination
   */
  async findMyNotifications(
    userId: number,
    query: PaginationDto & { unreadOnly?: boolean },
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.NotificationWhereInput = {
      user_id: BigInt(userId),
      ...(query.unreadOnly && { is_read: false }),
    };

    const { skip, take } = getPaginationParams(page, limit);

    const [total, notifications, unreadCount] = await Promise.all([
      this.prisma.notification.count({ where }),
      this.prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.notification.count({
        where: { user_id: BigInt(userId), is_read: false },
      }),
    ]);

    const response = buildPaginatedResponse(notifications, total, page, limit);
    return { ...response, unreadCount };
  }

  /**
   * عدد الإشعارات غير المقروءة (للبادج)
   */
  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: { user_id: BigInt(userId), is_read: false },
    });
    return { unreadCount: count };
  }

  /**
   * تعليم إشعار كمقروء
   */
  async markAsRead(notificationId: number, userId: number) {
    const notif = await this.prisma.notification.findUnique({
      where: { notification_id: BigInt(notificationId) },
    });
    if (!notif) throw new NotFoundException('Notification not found');
    if (notif.user_id.toString() !== userId.toString())
      throw new ForbiddenException('ليس إشعارك');

    return this.prisma.notification.update({
      where: { notification_id: BigInt(notificationId) },
      data: { is_read: true },
    });
  }

  /**
   * تعليم كل الإشعارات كمقروءة
   */
  async markAllAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { user_id: BigInt(userId), is_read: false },
      data: { is_read: true },
    });
    return { message: 'تم تعليم الكل كمقروء', count: result.count };
  }

  /**
   * حذف إشعار
   */
  async delete(notificationId: number, userId: number) {
    const notif = await this.prisma.notification.findUnique({
      where: { notification_id: BigInt(notificationId) },
    });
    if (!notif) throw new NotFoundException('Notification not found');
    if (notif.user_id.toString() !== userId.toString())
      throw new ForbiddenException('ليس إشعارك');

    await this.prisma.notification.delete({
      where: { notification_id: BigInt(notificationId) },
    });
    return { message: 'تم حذف الإشعار' };
  }

  /**
   * حذف كل إشعارات المستخدم
   */
  async deleteAll(userId: number) {
    const result = await this.prisma.notification.deleteMany({
      where: { user_id: BigInt(userId) },
    });
    return { message: 'تم حذف كل الإشعارات', count: result.count };
  }
}