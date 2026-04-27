import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateAdminDto } from './dto/create-admin.dto';
import { GrowthPeriod } from './dto/stats-query.dto';
import {
  PaginationDto,
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/dto/pagination.dto';

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────
  // CRUD للأدمنز
  // ─────────────────────────────────────────────────────────

  async create(dto: CreateAdminDto) {
    const existing = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const admin = await this.prisma.admin.create({
      data: { ...dto, password: hashed },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = admin;
    return { ...result, admin_id: result.admin_id.toString() };
  }

  async findAll(query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    const where: Prisma.AdminWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { full_name: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const { skip, take } = getPaginationParams(page, limit);

    const [total, admins] = await Promise.all([
      this.prisma.admin.count({ where }),
      this.prisma.admin.findMany({
        where,
        skip,
        take,
        select: {
          admin_id: true,
          full_name: true,
          email: true,
          role: true,
          is_active: true,
          last_login: true,
          created_at: true,
        },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    const data = admins.map((a) => ({
      ...a,
      admin_id: a.admin_id.toString(),
    }));

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { admin_id: BigInt(id) },
      select: {
        admin_id: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true,
        last_login: true,
        created_at: true,
      },
    });
    if (!admin) throw new NotFoundException('Admin not found');
    return { ...admin, admin_id: admin.admin_id.toString() };
  }

  /**
   * تفعيل/تعطيل أدمن
   * - لا يمكن للـ SUPER_ADMIN تعطيل نفسه
   * - لا يمكن تعطيل آخر SUPER_ADMIN في النظام
   */
  async toggleActive(id: number, currentAdminId: string) {
    if (id.toString() === currentAdminId) {
      throw new BadRequestException('لا يمكنك تعطيل حسابك بنفسك');
    }

    const target = await this.prisma.admin.findUnique({
      where: { admin_id: BigInt(id) },
    });
    if (!target) throw new NotFoundException('Admin not found');

    // إذا كنا نحاول تعطيل SUPER_ADMIN → تأكد إنه مو الوحيد
    if (target.role === 'SUPER_ADMIN' && target.is_active) {
      const activeSuperAdmins = await this.prisma.admin.count({
        where: { role: 'SUPER_ADMIN', is_active: true },
      });
      if (activeSuperAdmins <= 1) {
        throw new BadRequestException(
          'لا يمكن تعطيل آخر Super Admin في النظام',
        );
      }
    }

    const updated = await this.prisma.admin.update({
      where: { admin_id: BigInt(id) },
      data: { is_active: !target.is_active },
      select: {
        admin_id: true,
        full_name: true,
        email: true,
        role: true,
        is_active: true,
      },
    });

    return {
      ...updated,
      admin_id: updated.admin_id.toString(),
      message: updated.is_active
        ? 'تم تفعيل الأدمن بنجاح'
        : 'تم تعطيل الأدمن بنجاح',
    };
  }

  /**
   * حذف أدمن
   * - لا يمكن للـ SUPER_ADMIN حذف نفسه
   * - لا يمكن حذف آخر SUPER_ADMIN في النظام
   */
  async remove(id: number, currentAdminId: string) {
    if (id.toString() === currentAdminId) {
      throw new BadRequestException('لا يمكنك حذف حسابك بنفسك');
    }

    const target = await this.prisma.admin.findUnique({
      where: { admin_id: BigInt(id) },
    });
    if (!target) throw new NotFoundException('Admin not found');

    if (target.role === 'SUPER_ADMIN') {
      const superAdminsCount = await this.prisma.admin.count({
        where: { role: 'SUPER_ADMIN' },
      });
      if (superAdminsCount <= 1) {
        throw new BadRequestException(
          'لا يمكن حذف آخر Super Admin في النظام',
        );
      }
    }

    await this.prisma.admin.delete({ where: { admin_id: BigInt(id) } });
    return { message: 'تم حذف الأدمن بنجاح' };
  }

  // ─────────────────────────────────────────────────────────
  // Dashboard Stats
  // ─────────────────────────────────────────────────────────

  /**
   * إحصائيات الـ dashboard الرئيسية
   */
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      totalPackages,
      pendingPassports,
      pendingEmbassy,
      pendingFamilyProofs,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { is_active: true } }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { booking_status: 'PENDING' } }),
      this.prisma.booking.count({ where: { booking_status: 'CONFIRMED' } }),
      this.prisma.package.count(),
      this.prisma.passport.count({ where: { verified_by_admin: false } }),
      this.prisma.embassyResult.count({
        where: { embassy_status: 'PENDING' },
      }),
      this.prisma.familyProofDocument.count({
        where: { verification_status: 'PENDING' },
      }),
    ]);

    const bookingsByStatus = await this.prisma.booking.groupBy({
      by: ['booking_status'],
      _count: { booking_status: true },
    });

    return {
      users: { total: totalUsers, active: activeUsers },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        confirmed: confirmedBookings,
        byStatus: bookingsByStatus.map((b) => ({
          status: b.booking_status,
          count: b._count.booking_status,
        })),
      },
      packages: totalPackages,
      pending: {
        passports: pendingPassports,
        embassy: pendingEmbassy,
        familyProofs: pendingFamilyProofs,
      },
    };
  }

  /**
   * مقارنة هذا الشهر مع الشهر الماضي
   * يعطي نسبة التغير لكل KPI
   */
  async getStatsComparison() {
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    const [
      thisMonthUsers,
      lastMonthUsers,
      thisMonthBookings,
      lastMonthBookings,
      thisMonthRevenue,
      lastMonthRevenue,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { created_at: { gte: startOfThisMonth } },
      }),
      this.prisma.user.count({
        where: {
          created_at: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      this.prisma.booking.count({
        where: { created_at: { gte: startOfThisMonth } },
      }),
      this.prisma.booking.count({
        where: {
          created_at: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
      }),
      this.prisma.booking.aggregate({
        where: {
          created_at: { gte: startOfThisMonth },
          booking_status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
        _sum: { total_price: true },
      }),
      this.prisma.booking.aggregate({
        where: {
          created_at: { gte: startOfLastMonth, lte: endOfLastMonth },
          booking_status: { in: ['CONFIRMED', 'COMPLETED'] },
        },
        _sum: { total_price: true },
      }),
    ]);

    const thisRevenue = Number(thisMonthRevenue._sum.total_price ?? 0);
    const lastRevenue = Number(lastMonthRevenue._sum.total_price ?? 0);

    return {
      users: {
        current: thisMonthUsers,
        previous: lastMonthUsers,
        change: this.calcChange(thisMonthUsers, lastMonthUsers),
      },
      bookings: {
        current: thisMonthBookings,
        previous: lastMonthBookings,
        change: this.calcChange(thisMonthBookings, lastMonthBookings),
      },
      revenue: {
        current: thisRevenue,
        previous: lastRevenue,
        change: this.calcChange(thisRevenue, lastRevenue),
      },
    };
  }

  /**
   * نمو المستخدمين عبر الزمن
   * يرجع آخر 12 فترة (شهر/أسبوع/يوم)
   */
  async getUsersGrowth(period: GrowthPeriod) {
    return this.getGrowthData('users', period);
  }

  /**
   * نمو الحجوزات عبر الزمن
   */
  async getBookingsGrowth(period: GrowthPeriod) {
    return this.getGrowthData('bookings', period);
  }

  // ─────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────

  /**
   * احسب نسبة التغير بين قيمتين
   * - من 0 إلى N → +100% (لتجنب القسمة على صفر)
   * - من N إلى 0 → -100%
   */
  private calcChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 10) / 10;
  }

  /**
   * استعلام عام لحساب النمو عبر الفترات
   * يستخدم raw SQL لأن Prisma ما بيدعم date_trunc بشكل مباشر
   */
  private async getGrowthData(
    table: 'users' | 'bookings',
    period: GrowthPeriod,
  ) {
    const periodMap: Record<GrowthPeriod, string> = {
      [GrowthPeriod.DAILY]: 'day',
      [GrowthPeriod.WEEKLY]: 'week',
      [GrowthPeriod.MONTHLY]: 'month',
    };
    const intervalMap: Record<GrowthPeriod, string> = {
      [GrowthPeriod.DAILY]: '12 days',
      [GrowthPeriod.WEEKLY]: '12 weeks',
      [GrowthPeriod.MONTHLY]: '12 months',
    };

    const truncUnit = periodMap[period];
    const interval = intervalMap[period];

    const sql = `
      SELECT
        date_trunc('${truncUnit}', created_at) AS period,
        COUNT(*)::bigint AS count
      FROM ${table}
      WHERE created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY period
      ORDER BY period ASC
    `;

    type GrowthRow = { period: Date; count: bigint };
    const results = (await this.prisma.$queryRawUnsafe(sql)) as GrowthRow[];

    return results.map((r) => ({
      period: r.period.toISOString(),
      count: Number(r.count),
    }));
  }
}