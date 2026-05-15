import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UpdateEmbassyResultDto } from './dto/update-embassy-result.dto';
import { EmbassyFilterDto } from './dto/embassy-filter.dto';
import { EmbassyStatus, BookingStatus } from '../common/enums';
import { MulterFile } from '../common/types/multer.type';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/dto/pagination.dto';
import { ExcelRow, ProcessResult } from './embassy.types';

@Injectable()
export class EmbassyService {
  private readonly logger = new Logger(EmbassyService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // ─────────────────────────────────────────────────────────
  // ✨ رفع ملف Excel من السفارة
  // ─────────────────────────────────────────────────────────
  async uploadEmbassyExcel(file: MulterFile): Promise<ProcessResult> {
    if (!file) {
      throw new BadRequestException('ملف Excel مطلوب');
    }

    // 1. قراءة الملف
    const rows = this.parseExcelFile(file);
    if (rows.length === 0) {
      throw new BadRequestException('الملف فارغ أو الصيغة غير صحيحة');
    }

    this.logger.log(`📊 Excel parsed: ${rows.length} rows`);

    // 2. معالجة كل صف
    const result: ProcessResult = {
      matched: 0,
      approved: 0,
      rejected: 0,
      notMatched: [],
      alreadyProcessed: [],
      errors: [],
    };

    for (const row of rows) {
      try {
        await this.processExcelRow(row, result);
      } catch (err) {
        this.logger.error(
          `Row ${row.rowNumber} error: ${(err as Error).message}`,
        );
        result.errors.push({
          row: row.rowNumber,
          reason: (err as Error).message,
        });
      }
    }

    this.logger.log(
      `✅ Done: matched=${result.matched}, approved=${result.approved}, rejected=${result.rejected}, notMatched=${result.notMatched.length}`,
    );

    return result;
  }

  /**
   * قراءة ملف Excel وتحويله لـ ExcelRow[]
   * الأعمدة المتوقعة:
   * - العمود الأول: الاسم
   * - العمود الثاني: الحالة (مقبول/مرفوض)
   * - العمود الثالث (اختياري): سبب الرفض
   */
  private parseExcelFile(file: MulterFile): ExcelRow[] {
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(file.buffer, { type: 'buffer' });
    } catch {
      throw new BadRequestException('فشل في قراءة الملف - تأكد أنه Excel صحيح');
    }

    const firstSheet = workbook.SheetNames[0];
    if (!firstSheet) {
      throw new BadRequestException('الملف لا يحتوي على أوراق');
    }

    const sheet = workbook.Sheets[firstSheet];
    const data: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: '',
      raw: false,
    });

    if (data.length < 2) {
      throw new BadRequestException(
        'الملف فارغ - يجب أن يحتوي على هيدر وبيانات على الأقل',
      );
    }

    // الصف الأول هيدر، نتجاوزه
    const rows: ExcelRow[] = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const name = String(row[0] ?? '').trim();
      const status = String(row[1] ?? '').trim();
      const reason = row[2] ? String(row[2]).trim() : undefined;

      // تجاوز الصفوف الفارغة
      if (!name && !status) continue;

      rows.push({
        name,
        status,
        reason,
        rowNumber: i + 1,
      });
    }

    return rows;
  }

  /**
   * معالجة صف واحد من Excel
   */
  private async processExcelRow(row: ExcelRow, result: ProcessResult) {
    // 1. تحقق من البيانات الأساسية
    if (!row.name) {
      result.errors.push({
        row: row.rowNumber,
        reason: 'الاسم فارغ',
      });
      return;
    }

    // 2. تحويل الحالة لـ enum
    const status = this.normalizeStatus(row.status);
    if (!status) {
      result.errors.push({
        row: row.rowNumber,
        reason: `حالة غير معروفة: "${row.status}"`,
      });
      return;
    }

    // 3. تحقق من سبب الرفض إذا الحالة REJECTED
    if (status === EmbassyStatus.REJECTED && !row.reason) {
      result.errors.push({
        row: row.rowNumber,
        reason: `الاسم "${row.name}" مرفوض بدون سبب`,
      });
      return;
    }

    // 4. إيجاد الحجز المطابق
    const booking = await this.prisma.booking.findFirst({
      where: {
        booking_status: BookingStatus.CONFIRMED,
        user: {
          full_name: {
            equals: row.name,
            mode: 'insensitive',
          },
        },
      },
      include: {
        user: { select: { user_id: true, full_name: true } },
        embassy_result: true,
        package: { select: { package_title: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    if (!booking) {
      result.notMatched.push(row.name);
      return;
    }

    // 5. تحقق إن النتيجة لسه ما نزلت
    if (
      booking.embassy_result &&
      booking.embassy_result.embassy_status !== EmbassyStatus.PENDING
    ) {
      result.alreadyProcessed.push(row.name);
      return;
    }

    // 6. تنفيذ التحديث في transaction
    await this.prisma.$transaction(async (tx) => {
      // أ. إنشاء أو تحديث embassy_result
      await tx.embassyResult.upsert({
        where: { booking_id: booking.booking_id },
        create: {
          booking_id: booking.booking_id,
          embassy_status: status,
          rejection_reason:
            status === EmbassyStatus.REJECTED ? row.reason : null,
          matched_name: row.name,
        },
        update: {
          embassy_status: status,
          rejection_reason:
            status === EmbassyStatus.REJECTED ? row.reason : null,
          matched_name: row.name,
        },
      });

      // ب. إذا رفضت السفارة → الحجز يصير REJECTED نهائي
      if (status === EmbassyStatus.REJECTED) {
        await tx.booking.update({
          where: { booking_id: booking.booking_id },
          data: {
            booking_status: BookingStatus.REJECTED,
            rejection_reason: `رفض من السفارة: ${row.reason}`,
          },
        });
      }

      // ج. تعليم الجوازات إنها أُرسلت للسفارة
      await tx.passport.updateMany({
        where: {
          participant: { booking_id: booking.booking_id },
          verified_by_admin: true,
        },
        data: { sent_to_embassy: true },
      });
    });

    // 7. إنشاء إشعار للمستخدم
    if (status === EmbassyStatus.APPROVED) {
      await this.notificationsService.create({
        userId: booking.user.user_id,
        type: 'EMBASSY_APPROVED',
        title: '🎉 قبلت السفارة طلبك',
        message: `تم قبول طلبك للرحلة "${booking.package.package_title}" من السفارة. مبروك!`,
        relatedId: booking.booking_id,
        relatedType: 'booking',
      });
      result.approved++;
    } else {
      await this.notificationsService.create({
        userId: booking.user.user_id,
        type: 'EMBASSY_REJECTED',
        title: '❌ رفضت السفارة طلبك',
        message: `للأسف تم رفض طلبك للرحلة "${booking.package.package_title}" من السفارة. السبب: ${row.reason}`,
        relatedId: booking.booking_id,
        relatedType: 'booking',
      });
      result.rejected++;
    }

    result.matched++;
  }

  /**
   * تحويل نص الحالة من Excel إلى enum
   */
  private normalizeStatus(raw: string): EmbassyStatus | null {
    const normalized = raw.toLowerCase().trim();

    const approvedKeywords = [
      'approved',
      'accepted',
      'accept',
      'مقبول',
      'موافق',
      'قبول',
      'نعم',
      'yes',
      'ok',
      '1',
      'true',
    ];
    const rejectedKeywords = [
      'rejected',
      'reject',
      'denied',
      'مرفوض',
      'رفض',
      'مرفوضة',
      'no',
      '0',
      'false',
    ];

    if (approvedKeywords.some((k) => normalized.includes(k))) {
      return EmbassyStatus.APPROVED;
    }
    if (rejectedKeywords.some((k) => normalized.includes(k))) {
      return EmbassyStatus.REJECTED;
    }
    return null;
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
              booking_participants: {
                select: {
                  participant_id: true,
                  full_name: true,
                  is_primary: true,
                },
              },
            },
          },
        },
        orderBy: { uploaded_at: 'desc' },
      }),
    ]);

    return buildPaginatedResponse(results, total, page, limit);
  }

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
            booking_participants: {
              include: { passport: true },
            },
          },
        },
      },
    });
    if (!result) throw new NotFoundException('Embassy result not found');
    return result;
  }

  async findByBooking(bookingId: number) {
    return this.prisma.embassyResult.findUnique({
      where: { booking_id: BigInt(bookingId) },
      include: {
        booking: {
          include: {
            user: { select: { full_name: true, email: true } },
          },
        },
      },
    });
  }

  // ─────────────────────────────────────────────────────────
  // تحديث يدوي لنتيجة السفارة (في حال الحاجة)
  // ─────────────────────────────────────────────────────────
  async updateResult(resultId: number, dto: UpdateEmbassyResultDto) {
    const existing = await this.prisma.embassyResult.findUnique({
      where: { result_id: BigInt(resultId) },
      include: {
        booking: {
          include: {
            user: { select: { user_id: true, full_name: true } },
            package: { select: { package_title: true } },
          },
        },
      },
    });
    if (!existing) throw new NotFoundException('Embassy result not found');

    if (
      dto.embassy_status === EmbassyStatus.REJECTED &&
      (!dto.rejection_reason || !dto.rejection_reason.trim())
    ) {
      throw new BadRequestException('سبب الرفض مطلوب');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.embassyResult.update({
        where: { result_id: BigInt(resultId) },
        data: {
          embassy_status: dto.embassy_status,
          notes: dto.notes,
          rejection_reason:
            dto.embassy_status === EmbassyStatus.REJECTED
              ? dto.rejection_reason!.trim()
              : null,
        },
      });

      // إذا انتقل لـ REJECTED → الحجز يصير REJECTED
      if (dto.embassy_status === EmbassyStatus.REJECTED) {
        await tx.booking.update({
          where: { booking_id: existing.booking_id },
          data: {
            booking_status: BookingStatus.REJECTED,
            rejection_reason: `رفض من السفارة: ${dto.rejection_reason}`,
          },
        });
      }

      return result;
    });

    // إشعار للمستخدم
    if (dto.embassy_status === EmbassyStatus.APPROVED) {
      await this.notificationsService.create({
        userId: existing.booking.user.user_id,
        type: 'EMBASSY_APPROVED',
        title: '🎉 قبلت السفارة طلبك',
        message: `تم قبول طلبك للرحلة "${existing.booking.package.package_title}" من السفارة.`,
        relatedId: existing.booking_id,
        relatedType: 'booking',
      });
    } else if (dto.embassy_status === EmbassyStatus.REJECTED) {
      await this.notificationsService.create({
        userId: existing.booking.user.user_id,
        type: 'EMBASSY_REJECTED',
        title: '❌ رفضت السفارة طلبك',
        message: `للأسف تم رفض طلبك للرحلة "${existing.booking.package.package_title}". السبب: ${dto.rejection_reason}`,
        relatedId: existing.booking_id,
        relatedType: 'booking',
      });
    }

    return updated;
  }

  // ─────────────────────────────────────────────────────────
  // إحصائيات
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

    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

    return {
      total,
      pending,
      approved,
      rejected,
      approvalRate,
      rejectionRate,
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

    if (filters.from_date || filters.to_date) {
      where.uploaded_at = {
        ...(filters.from_date && { gte: new Date(filters.from_date) }),
        ...(filters.to_date && { lte: new Date(filters.to_date) }),
      };
    }

    if (search) {
      where.OR = [
        { matched_name: { contains: search, mode: 'insensitive' } },
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