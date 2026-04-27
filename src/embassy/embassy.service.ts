import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateEmbassyResultDto } from './dto/update-embassy-result.dto';
import { EmbassyFilterDto } from './dto/embassy-filter.dto';
import { EmbassyStatus } from '../common/enums';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/dto/pagination.dto';

@Injectable()
export class EmbassyService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────
  // إرسال جوازات حجز معتمد للسفارة
  // ─────────────────────────────────────────────────────────
  async submitBookingToEmbassy(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { booking_id: BigInt(bookingId) },
      include: { booking_participants: { include: { passport: true } } },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.booking_status !== 'CONFIRMED') {
      throw new BadRequestException(
        'Only confirmed bookings can be submitted to embassy',
      );
    }

    // الجوازات المؤهلة: موثّقة من الأدمن + لم تُرسل بعد
    const passports = booking.booking_participants
      .map((p) => p.passport)
      .filter(
        (p): p is NonNullable<typeof p> =>
          p !== null && p.verified_by_admin && !p.sent_to_embassy,
      );

    if (passports.length === 0) {
      throw new BadRequestException(
        'No verified unsubmitted passports found in this booking',
      );
    }

    // استخدام transaction واحد للعمليتين (إنشاء results + تحديث passports)
    const results = await this.prisma.$transaction(async (tx) => {
      // 1. إنشاء embassy_result لكل جواز
      const createdResults = await Promise.all(
        passports.map((p) =>
          tx.embassyResult.create({
            data: {
              booking_id: BigInt(bookingId),
              passport_id: p.passport_id,
              embassy_status: EmbassyStatus.PENDING,
            },
            include: {
              passport: {
                select: {
                  passport_id: true,
                  full_name_en: true,
                  passport_number: true,
                },
              },
            },
          }),
        ),
      );

      // 2. تحديث الجوازات (sent_to_embassy = true)
      await Promise.all(
        passports.map((p) =>
          tx.passport.update({
            where: { passport_id: p.passport_id },
            data: { sent_to_embassy: true },
          }),
        ),
      );

      return createdResults;
    });

    return {
      message: `تم إرسال ${passports.length} جواز إلى السفارة`,
      count: passports.length,
      results,
    };
  }

  // ─────────────────────────────────────────────────────────
  // تحديث نتيجة السفارة (قبول/رفض)
  // ─────────────────────────────────────────────────────────
  async updateResult(resultId: number, dto: UpdateEmbassyResultDto) {
    const result = await this.prisma.embassyResult.findUnique({
      where: { result_id: BigInt(resultId) },
    });
    if (!result) throw new NotFoundException('Embassy result not found');

    // إذا الرفض → السبب مطلوب (DTO يتحقق منه، لكن double-check)
    if (
      dto.embassy_status === EmbassyStatus.REJECTED &&
      (!dto.rejection_reason || !dto.rejection_reason.trim())
    ) {
      throw new BadRequestException('سبب الرفض مطلوب');
    }

    return this.prisma.embassyResult.update({
      where: { result_id: BigInt(resultId) },
      data: {
        embassy_status: dto.embassy_status,
        notes: dto.notes,
        // إذا رفض → خزّن السبب، إذا قبول → امسحه
        rejection_reason:
          dto.embassy_status === EmbassyStatus.REJECTED
            ? dto.rejection_reason!.trim()
            : null,
      },
      include: {
        booking: {
          include: {
            user: { select: { full_name: true, email: true } },
            package: { select: { package_title: true } },
          },
        },
        passport: {
          select: {
            passport_id: true,
            full_name_en: true,
            full_name_ar: true,
            passport_number: true,
          },
        },
      },
    });
  }

  // ─────────────────────────────────────────────────────────
  // نتائج السفارة لحجز معين
  // ─────────────────────────────────────────────────────────
  async findByBooking(bookingId: number) {
    return this.prisma.embassyResult.findMany({
      where: { booking_id: BigInt(bookingId) },
      include: {
        passport: {
          select: {
            passport_id: true,
            full_name_en: true,
            full_name_ar: true,
            passport_number: true,
            nationality: true,
          },
        },
      },
      orderBy: { uploaded_at: 'desc' },
    });
  }

  // ─────────────────────────────────────────────────────────
  // قائمة كل النتائج (للأدمن) — مع pagination + filters
  // ─────────────────────────────────────────────────────────
  async findAll(filters: EmbassyFilterDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const search = filters.search?.trim();

    const where = this.buildWhereClause(filters, search);
    const { skip, take } = getPaginationParams(page, limit);

    const [total, results] = await Promise.all([
      this.prisma.embassyResult.count({ where }),
      this.prisma.embassyResult.findMany({
        where,
        skip,
        take,
        include: {
          booking: {
            include: {
              user: {
                select: {
                  user_id: true,
                  full_name: true,
                  email: true,
                  phone_number: true,
                },
              },
              package: {
                select: {
                  package_id: true,
                  package_title: true,
                  package_type: true,
                },
              },
            },
          },
          passport: {
            select: {
              passport_id: true,
              full_name_en: true,
              full_name_ar: true,
              passport_number: true,
              nationality: true,
            },
          },
        },
        orderBy: { uploaded_at: 'desc' },
      }),
    ]);

    return buildPaginatedResponse(results, total, page, limit);
  }

  // ─────────────────────────────────────────────────────────
  // تفاصيل نتيجة واحدة
  // ─────────────────────────────────────────────────────────
  async findOne(resultId: number) {
    const result = await this.prisma.embassyResult.findUnique({
      where: { result_id: BigInt(resultId) },
      include: {
        booking: {
          include: {
            user: {
              select: {
                user_id: true,
                full_name: true,
                email: true,
                phone_number: true,
              },
            },
            package: true,
          },
        },
        passport: { include: { passport_images: true } },
      },
    });
    if (!result) throw new NotFoundException('Embassy result not found');
    return result;
  }

  // ─────────────────────────────────────────────────────────
  // إحصائيات للـ dashboard
  // ─────────────────────────────────────────────────────────
  async getStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.embassyResult.count(),
      this.prisma.embassyResult.count({
        where: { embassy_status: EmbassyStatus.PENDING },
      }),
      this.prisma.embassyResult.count({
        where: { embassy_status: EmbassyStatus.APPROVED },
      }),
      this.prisma.embassyResult.count({
        where: { embassy_status: EmbassyStatus.REJECTED },
      }),
    ]);

    // نسب
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

    return {
      total,
      pending,
      approved,
      rejected,
      approvalRate, // %
      rejectionRate, // %
    };
  }

  // ─────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────

  private buildWhereClause(
    filters: EmbassyFilterDto,
    search?: string,
  ): Prisma.EmbassyResultWhereInput {
    const where: Prisma.EmbassyResultWhereInput = {};

    if (filters.status) {
      where.embassy_status = filters.status;
    }

    if (filters.booking_id) {
      where.booking_id = BigInt(filters.booking_id);
    }

    if (filters.from_date || filters.to_date) {
      where.uploaded_at = {
        ...(filters.from_date && { gte: new Date(filters.from_date) }),
        ...(filters.to_date && { lte: new Date(filters.to_date) }),
      };
    }

    if (search) {
      where.OR = [
        {
          passport: {
            OR: [
              { passport_number: { contains: search, mode: 'insensitive' } },
              { full_name_en: { contains: search, mode: 'insensitive' } },
              { full_name_ar: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
        {
          booking: {
            user: {
              OR: [
                { full_name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    return where;
  }
}