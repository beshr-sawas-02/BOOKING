import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingsFilterDto } from './dto/bookings-filter.dto';
import { BookingStatus } from '../common/enums';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/dto/pagination.dto';
import {
  MahramValidator,
  calcAge,
  Gender,
} from './validators/mahram.validator';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  private mahramValidator = new MahramValidator();

  // ─────────────────────────────────────────────────────────
  // إنشاء حجز جديد (للمستخدم)
  // ─────────────────────────────────────────────────────────
  async create(userId: number, dto: CreateBookingDto) {
    const pkg = await this.prisma.package.findUnique({
      where: { package_id: BigInt(dto.package_id) },
    });
    if (!pkg) throw new NotFoundException('Package not found');

    const totalParticipants = dto.participants.length + 1;
    if (totalParticipants > pkg.max_participants) {
      throw new BadRequestException(
        `الحد الأقصى للمشاركين في هذه الباقة هو ${pkg.max_participants}`,
      );
    }

    const warnings: string[] = [];
    if (pkg.package_type === 'HAJJ') {
      const companions = dto.participants
        .filter((p) => !p.is_primary)
        .map((p) => ({
          relation_type: p.relation_type,
          gender: (p.gender as Gender) || Gender.MALE,
          age: p.date_of_birth ? calcAge(p.date_of_birth) : undefined,
        }));

      const primaryGender = dto.primary_gender as Gender;
      const primaryAge = dto.primary_date_of_birth
        ? calcAge(dto.primary_date_of_birth)
        : undefined;

      if (
        this.mahramValidator.isForbiddenCombination(
          { gender: primaryGender, age: primaryAge },
          companions,
        )
      ) {
        throw new BadRequestException(
          'هذه التركيبة من المرافقين غير مسموح بها وفق قرار تسجيل الحجاج السوريين',
        );
      }

      const validationResult = this.mahramValidator.validate(
        { gender: primaryGender, age: primaryAge },
        companions,
      );

      if (!validationResult.valid) {
        throw new BadRequestException({
          message: 'المرافقون لا يستوفون شروط المحارم',
          errors: validationResult.errors,
          warnings: validationResult.warnings,
        });
      }
      warnings.push(...(validationResult.warnings || []));
    }

    const hasPrimary = dto.participants.some((p) => p.is_primary);
    if (!hasPrimary) dto.participants[0].is_primary = true;

    const totalPrice = Number(pkg.price_per_person) * dto.participants.length;

    const booking = await this.prisma.booking.create({
      data: {
        user_id: BigInt(userId),
        package_id: BigInt(dto.package_id),
        total_price: totalPrice,
        deposit_due_date: dto.deposit_due_date
          ? new Date(dto.deposit_due_date)
          : undefined,
        final_payment_due_date: dto.final_payment_due_date
          ? new Date(dto.final_payment_due_date)
          : undefined,
        trip_end_date: dto.trip_end_date
          ? new Date(dto.trip_end_date)
          : undefined,
        booking_participants: {
          create: dto.participants.map((p) => ({
            full_name: p.full_name,
            relation_type: p.relation_type,
            is_primary: p.is_primary ?? false,
            user_id: p.is_primary ? BigInt(userId) : undefined,
          })),
        },
      },
      include: {
        booking_participants: true,
        package: true,
      },
    });

    return { ...booking, warnings };
  }

  // ─────────────────────────────────────────────────────────
  // قائمة الحجوزات للأدمن
  // ─────────────────────────────────────────────────────────
  async findAll(filters: BookingsFilterDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const search = filters.search?.trim();

    const where = this.buildWhereClause(filters, search);
    const { skip, take } = getPaginationParams(page, limit);

    const [total, bookings] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        skip,
        take,
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
              duration_days: true,
            },
          },
          booking_participants: {
            select: {
              participant_id: true,
              full_name: true,
              relation_type: true,
              is_primary: true,
              passport_id: true,
              passport: {
                select: {
                  passport_id: true,
                  verified_by_admin: true,
                  rejection_reason: true,
                },
              },
            },
          },
          family_proof_documents: {
            select: {
              document_id: true,
              verification_status: true,
            },
          },
          embassy_results: {
            select: {
              result_id: true,
              embassy_status: true,
            },
          },
          _count: {
            select: {
              booking_participants: true,
              embassy_results: true,
              family_proof_documents: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return buildPaginatedResponse(bookings, total, page, limit);
  }

  async findMyBookings(userId: number, filters: BookingsFilterDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    const where: Prisma.BookingWhereInput = {
      user_id: BigInt(userId),
      ...(filters.status && { booking_status: filters.status }),
    };

    const { skip, take } = getPaginationParams(page, limit);

    const [total, bookings] = await Promise.all([
      this.prisma.booking.count({ where }),
      this.prisma.booking.findMany({
        where,
        skip,
        take,
        include: {
          package: true,
          booking_participants: {
            include: { passport: true, family_proof: true },
          },
          embassy_results: true,
          review: true,
        },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return buildPaginatedResponse(bookings, total, page, limit);
  }

  // ─────────────────────────────────────────────────────────
  // ✨ تفاصيل حجز كاملة + workflow status
  // ─────────────────────────────────────────────────────────
  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { booking_id: BigInt(id) },
      include: {
        user: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
            phone_number: true,
            is_active: true,
          },
        },
        package: {
          include: { package_hotels: { include: { hotel: true } } },
        },
        booking_participants: {
          include: {
            passport: { include: { passport_images: true } },
            family_proof: true,
          },
          orderBy: { is_primary: 'desc' },
        },
        embassy_results: {
          include: {
            passport: {
              select: {
                passport_id: true,
                full_name_en: true,
                full_name_ar: true,
                passport_number: true,
              },
            },
          },
        },
        family_proof_documents: {
          include: {
            uploader: {
              select: { user_id: true, full_name: true, email: true },
            },
          },
        },
        review: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    // ✨ احسب الـ workflow status
    const workflow = this.computeWorkflowStatus(booking);

    return { ...booking, workflow };
  }

  // ─────────────────────────────────────────────────────────
  // ✨ حساب حالة سير العمل (Workflow)
  // ─────────────────────────────────────────────────────────
  private computeWorkflowStatus(booking: any) {
    const participants = booking.booking_participants || [];
    const docs = booking.family_proof_documents || [];
    const embassyResults = booking.embassy_results || [];

    // 1. حالة الجوازات
    const passportsTotal = participants.length;
    const passportsUploaded = participants.filter((p: any) => p.passport).length;
    const passportsVerified = participants.filter(
      (p: any) => p.passport?.verified_by_admin === true,
    ).length;
    const passportsRejected = participants.filter(
      (p: any) => p.passport?.rejection_reason !== null && p.passport?.rejection_reason !== undefined,
    ).length;
    const passportsPending = participants.filter(
      (p: any) =>
        p.passport &&
        !p.passport.verified_by_admin &&
        !p.passport.rejection_reason,
    ).length;

    // 2. حالة الوثائق
    const docsTotal = docs.length;
    const docsApproved = docs.filter(
      (d: any) => d.verification_status === 'APPROVED',
    ).length;
    const docsRejected = docs.filter(
      (d: any) => d.verification_status === 'REJECTED',
    ).length;
    const docsPending = docs.filter(
      (d: any) => d.verification_status === 'PENDING',
    ).length;

    // 3. حالة السفارة
    const embassyTotal = embassyResults.length;
    const embassyApproved = embassyResults.filter(
      (e: any) => e.embassy_status === 'APPROVED',
    ).length;
    const embassyRejected = embassyResults.filter(
      (e: any) => e.embassy_status === 'REJECTED',
    ).length;
    const embassyPending = embassyResults.filter(
      (e: any) => e.embassy_status === 'PENDING',
    ).length;

    // 4. الشروط للأزرار
    const allPassportsVerified =
      passportsTotal > 0 &&
      passportsUploaded === passportsTotal &&
      passportsVerified === passportsTotal;

    const allDocsApproved =
      docsTotal === 0 || // قد لا تكون مطلوبة
      (docsTotal > 0 && docsApproved === docsTotal);

    const canConfirmBooking =
      booking.booking_status === 'PENDING' &&
      allPassportsVerified &&
      allDocsApproved;

    const canSendToEmbassy =
      booking.booking_status === 'CONFIRMED' &&
      passportsVerified > 0 &&
      embassyTotal === 0; // لم يُرسل بعد

    const canCompleteBooking = booking.booking_status === 'CONFIRMED';

    // 5. اقتراحات للأدمن
    const suggestions: string[] = [];

    // اقتراح: لو كل الجوازات رُفضت → اقترح رفض الحجز
    if (passportsTotal > 0 && passportsRejected === passportsTotal) {
      suggestions.push(
        'كل الجوازات مرفوضة، يُنصح برفض الحجز أو طلب جوازات جديدة من المستخدم',
      );
    }

    // اقتراح: لو كل وثائق العائلة مرفوضة
    if (docsTotal > 0 && docsRejected === docsTotal) {
      suggestions.push(
        'كل الوثائق مرفوضة، يُنصح برفض الحجز أو طلب وثائق جديدة',
      );
    }

    // اقتراح: لو السفارة رفضت كل الجوازات (حالة هجين)
    if (embassyTotal > 0 && embassyRejected === embassyTotal) {
      suggestions.push(
        'السفارة رفضت جميع الجوازات، يُنصح برفض الحجز كاملاً',
      );
    }

    return {
      // عدّادات الجوازات
      passports: {
        total: passportsTotal,
        uploaded: passportsUploaded,
        verified: passportsVerified,
        rejected: passportsRejected,
        pending: passportsPending,
      },
      // عدّادات الوثائق
      documents: {
        total: docsTotal,
        approved: docsApproved,
        rejected: docsRejected,
        pending: docsPending,
      },
      // عدّادات السفارة
      embassy: {
        total: embassyTotal,
        approved: embassyApproved,
        rejected: embassyRejected,
        pending: embassyPending,
      },
      // أزرار ذكية
      canConfirmBooking,
      canSendToEmbassy,
      canCompleteBooking,
      // اقتراحات
      suggestions,
      // أسباب عدم القدرة على القبول
      blockReasons: this.getBlockReasons(
        booking.booking_status,
        passportsTotal,
        passportsUploaded,
        passportsVerified,
        passportsPending,
        passportsRejected,
        docsTotal,
        docsApproved,
        docsPending,
        docsRejected,
      ),
    };
  }

  private getBlockReasons(
    status: string,
    pTotal: number,
    pUploaded: number,
    pVerified: number,
    pPending: number,
    pRejected: number,
    dTotal: number,
    dApproved: number,
    dPending: number,
    dRejected: number,
  ): string[] {
    if (status !== 'PENDING') return [];

    const reasons: string[] = [];

    if (pTotal === 0) {
      reasons.push('لا يوجد مشاركون في الحجز');
    }
    if (pUploaded < pTotal) {
      reasons.push(
        `${pTotal - pUploaded} مشارك لم يرفع جوازه بعد`,
      );
    }
    if (pPending > 0) {
      reasons.push(`${pPending} جواز بانتظار المراجعة`);
    }
    if (pRejected > 0) {
      reasons.push(`${pRejected} جواز مرفوض - يجب طلب صور جديدة`);
    }
    if (dPending > 0) {
      reasons.push(`${dPending} وثيقة عائلية بانتظار المراجعة`);
    }
    if (dRejected > 0) {
      reasons.push(`${dRejected} وثيقة عائلية مرفوضة`);
    }

    return reasons;
  }

  // ─────────────────────────────────────────────────────────
  // ✨ تحديث حالة الحجز (مع التحقق من اكتمال المراجعة)
  // ─────────────────────────────────────────────────────────
  async updateStatus(id: number, dto: UpdateBookingStatusDto) {
    const booking = await this.findOne(id);

    const validTransitions: Record<BookingStatus, BookingStatus[]> = {
      [BookingStatus.PENDING]: [
        BookingStatus.CONFIRMED,
        BookingStatus.REJECTED,
        BookingStatus.CANCELLED,
      ],
      [BookingStatus.CONFIRMED]: [
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
      ],
      [BookingStatus.REJECTED]: [],
      [BookingStatus.CANCELLED]: [],
      [BookingStatus.COMPLETED]: [],
    };

    if (
      !validTransitions[booking.booking_status].includes(dto.booking_status)
    ) {
      throw new BadRequestException(
        `لا يمكن التحول من ${booking.booking_status} إلى ${dto.booking_status}`,
      );
    }

    // ✨ القاعدة الجديدة: لا يمكن قبول الحجز إلا بعد اكتمال المراجعة
    if (dto.booking_status === BookingStatus.CONFIRMED) {
      const workflow = (booking as any).workflow;
      if (!workflow?.canConfirmBooking) {
        throw new BadRequestException({
          message: 'لا يمكن قبول الحجز قبل اكتمال مراجعة الجوازات والوثائق',
          reasons: workflow?.blockReasons || [],
        });
      }
    }

    if (dto.booking_status === BookingStatus.REJECTED) {
      const reason = dto.rejection_reason || dto.reason;
      if (!reason || !reason.trim()) {
        throw new BadRequestException('سبب الرفض مطلوب');
      }
    }

    return this.prisma.booking.update({
      where: { booking_id: BigInt(id) },
      data: { booking_status: dto.booking_status },
      include: {
        user: { select: { full_name: true, email: true } },
        package: { select: { package_title: true } },
      },
    });
  }

  async cancel(id: number, userId: number) {
    const booking = await this.findOne(id);
    if (booking.user_id.toString() !== userId.toString()) {
      throw new ForbiddenException('ليس حجزك');
    }
    if (
      booking.booking_status !== BookingStatus.PENDING &&
      booking.booking_status !== BookingStatus.CONFIRMED
    ) {
      throw new BadRequestException('لا يمكن إلغاء هذا الحجز');
    }
    return this.prisma.booking.update({
      where: { booking_id: BigInt(id) },
      data: { booking_status: BookingStatus.CANCELLED },
    });
  }

  async updateByUser(
    bookingId: number,
    userId: number,
    dto: {
      trip_end_date?: string;
      deposit_due_date?: string;
      final_payment_due_date?: string;
    },
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { booking_id: BigInt(bookingId) },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.user_id.toString() !== userId.toString())
      throw new ForbiddenException('ليس حجزك');
    if (booking.booking_status !== BookingStatus.PENDING)
      throw new BadRequestException(
        'لا يمكن تعديل الحجز بعد مراجعته من الأدمن',
      );

    return this.prisma.booking.update({
      where: { booking_id: BigInt(bookingId) },
      data: {
        trip_end_date: dto.trip_end_date
          ? new Date(dto.trip_end_date)
          : undefined,
        deposit_due_date: dto.deposit_due_date
          ? new Date(dto.deposit_due_date)
          : undefined,
        final_payment_due_date: dto.final_payment_due_date
          ? new Date(dto.final_payment_due_date)
          : undefined,
      },
    });
  }

  private buildWhereClause(
    filters: BookingsFilterDto,
    search?: string,
  ): Prisma.BookingWhereInput {
    const where: Prisma.BookingWhereInput = {};

    if (filters.status) {
      where.booking_status = filters.status;
    }

    if (filters.package_type) {
      where.package = { package_type: filters.package_type as any };
    }

    if (filters.from_date || filters.to_date) {
      where.created_at = {
        ...(filters.from_date && { gte: new Date(filters.from_date) }),
        ...(filters.to_date && { lte: new Date(filters.to_date) }),
      };
    }

    if (search) {
      where.OR = [
        { user: { full_name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { phone_number: { contains: search, mode: 'insensitive' } } },
        {
          package: {
            package_title: { contains: search, mode: 'insensitive' },
          },
        },
      ];
    }

    return where;
  }
}