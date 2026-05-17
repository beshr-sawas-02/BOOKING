import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  PaymentsService,
  DEPOSIT_PERCENTAGE,
} from '../payments/payments.service'; // ✨ جديد
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingsFilterDto } from './dto/bookings-filter.dto';
import { BookingStatus, PaymentType } from '../common/enums';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/dto/pagination.dto';
import {
  MahramValidator,
  calcAge,
  Gender,
} from './validators/mahram.validator';
import { generateItineraryHtml } from './templates/itinerary.template';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private pdfService: PdfService,
    private notificationsService: NotificationsService,
    private paymentsService: PaymentsService, // ✨ جديد
  ) {}

  private mahramValidator = new MahramValidator();

  // ─────────────────────────────────────────────────────────
  // ✨ جديد: حساب العربون قبل الإنشاء
  // ─────────────────────────────────────────────────────────
  async calculateDeposit(packageId: number, participantsCount: number) {
    const pkg = await this.prisma.package.findUnique({
      where: { package_id: BigInt(packageId) },
    });
    if (!pkg) throw new NotFoundException('Package not found');

    if (participantsCount < 1) {
      throw new BadRequestException('عدد المشاركين يجب أن يكون 1 على الأقل');
    }

    if (participantsCount > pkg.max_participants) {
      throw new BadRequestException(
        `الحد الأقصى للمشاركين في هذه الباقة هو ${pkg.max_participants}`,
      );
    }

    const totalPrice = Number(pkg.price_per_person) * participantsCount;
    const depositAmount = totalPrice * DEPOSIT_PERCENTAGE;
    const finalAmount = totalPrice - depositAmount;

    return {
      package_id: pkg.package_id.toString(),
      package_title: pkg.package_title,
      price_per_person: Number(pkg.price_per_person),
      participants_count: participantsCount,
      total_price: totalPrice,
      deposit_percentage: DEPOSIT_PERCENTAGE * 100, // 20
      deposit_amount: depositAmount,
      final_amount: finalAmount,
    };
  }

  // ─────────────────────────────────────────────────────────
  // ✨ معدّل: إنشاء حجز + دفع العربون في transaction واحد
  // ─────────────────────────────────────────────────────────
  async create(userId: number, dto: CreateBookingDto) {
    const pkg = await this.prisma.package.findUnique({
      where: { package_id: BigInt(dto.package_id) },
    });
    if (!pkg) throw new NotFoundException('Package not found');

    const totalParticipants = dto.participants.length;
    if (totalParticipants > pkg.max_participants) {
      throw new BadRequestException(
        `الحد الأقصى للمشاركين في هذه الباقة هو ${pkg.max_participants}`,
      );
    }

    // ✅ التحقق من المحارم (للحج)
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

    // ✅ حساب الأسعار
    const totalPrice = Number(pkg.price_per_person) * dto.participants.length;
    const depositAmount = totalPrice * DEPOSIT_PERCENTAGE;

    // ✅ التحقق من مبلغ العربون قبل إنشاء الحجز
    if (dto.payment.amount !== depositAmount) {
      throw new BadRequestException(
        `مبلغ العربون غير صحيح. المطلوب: ${depositAmount}, تم إرسال: ${dto.payment.amount}`,
      );
    }

    // ✨ إنشاء الحجز + دفع العربون في transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. إنشاء الحجز
      const booking = await tx.booking.create({
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

      return booking;
    });

    // 2. إنشاء سجل الدفع (خارج الـ transaction لأن PaymentsService يستخدم prisma)
    try {
      await this.paymentsService.createPayment({
        bookingId: result.booking_id,
        userId,
        amount: depositAmount,
        paymentType: PaymentType.DEPOSIT,
        paymentData: dto.payment,
      });

      // 3. إشعار "تم استلام العربون"
      await this.notificationsService.create({
        userId,
        type: 'PAYMENT_RECEIVED',
        title: '💰 تم استلام دفعة العربون',
        message: `تم استلام دفعة العربون (${this.formatCurrency(depositAmount)}) لحجزك "${result.package.package_title}". الحجز الآن قيد المراجعة من الإدارة.`,
        relatedId: result.booking_id,
        relatedType: 'booking',
      });
    } catch (paymentError) {
      // لو فشل الدفع، نلغي الحجز
      await this.prisma.booking.delete({
        where: { booking_id: result.booking_id },
      });
      throw paymentError;
    }

    return { ...result, warnings };
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
              price_per_person: true,
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
          embassy_result: {
            select: {
              result_id: true,
              embassy_status: true,
              rejection_reason: true,
            },
          },
          payments: true, // ✨ جديد
          _count: {
            select: {
              booking_participants: true,
              family_proof_documents: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    const bookingsWithWorkflow = bookings.map((b: any) => ({
      ...b,
      workflow: this.computeWorkflowStatus(b),
    }));

    return buildPaginatedResponse(bookingsWithWorkflow, total, page, limit);
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
          embassy_result: true,
          payments: true, // ✨ جديد
          review: true,
        },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return buildPaginatedResponse(bookings, total, page, limit);
  }

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
        embassy_result: true,
        family_proof_documents: {
          include: {
            uploader: {
              select: { user_id: true, full_name: true, email: true },
            },
          },
        },
        payments: { orderBy: { paid_at: 'desc' } }, // ✨ جديد
        review: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const workflow = this.computeWorkflowStatus(booking);

    return { ...booking, workflow };
  }

  // ─────────────────────────────────────────────────────────
  // توليد PDF لجدول الرحلة
  // ─────────────────────────────────────────────────────────
  async generateItineraryPdf(
    bookingId: number,
    userId: number,
    isAdmin: boolean,
  ): Promise<Buffer> {
    const booking = await this.prisma.booking.findUnique({
      where: { booking_id: BigInt(bookingId) },
      include: {
        user: true,
        package: {
          include: {
            package_hotels: { include: { hotel: true } },
          },
        },
        booking_participants: true,
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (!isAdmin && booking.user_id.toString() !== userId.toString()) {
      throw new ForbiddenException('Access denied');
    }

    const html = generateItineraryHtml({
      booking_id: booking.booking_id.toString(),
      user_name: booking.user.full_name,
      package_title: booking.package.package_title,
      package_type: booking.package.package_type as 'HAJJ' | 'UMRAH',
      duration_days: booking.package.duration_days,
      total_price: Number(booking.total_price),
      participants: booking.booking_participants.map((p) => ({
        name: p.full_name,
        relation: this.translateRelation(p.relation_type),
      })),
      hotels: booking.package.package_hotels.map((ph) => ({
        name: ph.hotel.hotel_name,
        location: ph.hotel.location,
        stars: ph.hotel.stars,
      })),
      supervisor_name: booking.package.supervisor_name ?? undefined,
      supervisor_phone: booking.package.supervisor_phone ?? undefined,
      days: [],
      generated_at: new Date(),
    });

    return await this.pdfService.generateFromHtml(html);
  }

  private translateRelation(rel: string): string {
    const map: Record<string, string> = {
      PRIMARY: 'صاحب الطلب',
      SPOUSE: 'زوج/زوجة',
      SON: 'ابن',
      DAUGHTER: 'بنت',
      MOTHER: 'أم',
      FATHER: 'أب',
      BROTHER: 'أخ',
      SISTER: 'أخت',
      GRANDSON: 'حفيد',
      GRANDDAUGHTER: 'حفيدة',
      SON_WIFE: 'زوجة الابن',
      DAUGHTER_HUSBAND: 'زوج البنت',
      NEPHEW: 'ابن الأخ/الأخت',
      NIECE: 'بنت الأخ/الأخت',
      BROTHER_WIFE: 'زوجة الأخ',
      SISTER_HUSBAND: 'زوج الأخت',
      OTHER: 'أخرى',
    };
    return map[rel] ?? rel;
  }

  // ─────────────────────────────────────────────────────────
  // ✨ workflow معدّل - يشمل payment status
  // ─────────────────────────────────────────────────────────
  private computeWorkflowStatus(booking: any) {
    const participants = booking.booking_participants || [];
    const docs = booking.family_proof_documents || [];
    const embassyResult = booking.embassy_result || null;
    const payments = booking.payments || []; // ✨ جديد

    const passportsTotal = participants.length;
    const passportsUploaded = participants.filter((p: any) => p.passport).length;
    const passportsVerified = participants.filter(
      (p: any) => p.passport?.verified_by_admin === true,
    ).length;
    const passportsRejected = participants.filter(
      (p: any) =>
        p.passport?.rejection_reason !== null &&
        p.passport?.rejection_reason !== undefined,
    ).length;
    const passportsPending = participants.filter(
      (p: any) =>
        p.passport &&
        !p.passport.verified_by_admin &&
        !p.passport.rejection_reason,
    ).length;

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

    // ✨ حساب حالة الدفع
    const totalPrice = Number(booking.total_price);
    const depositAmount = totalPrice * DEPOSIT_PERCENTAGE;
    const finalAmount = totalPrice - depositAmount;

    const depositPaid = payments.some(
      (p: any) =>
        p.payment_type === 'DEPOSIT' && p.payment_status === 'COMPLETED',
    );
    const finalPaid = payments.some(
      (p: any) =>
        p.payment_type === 'FINAL' && p.payment_status === 'COMPLETED',
    );
    const totalPaid = payments
      .filter((p: any) => p.payment_status === 'COMPLETED')
      .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    const allPassportsVerified =
      passportsTotal > 0 &&
      passportsUploaded === passportsTotal &&
      passportsVerified === passportsTotal;

    const allDocsApproved =
      docsTotal === 0 || (docsTotal > 0 && docsApproved === docsTotal);

    const canConfirmBooking =
      booking.booking_status === 'PENDING' &&
      allPassportsVerified &&
      allDocsApproved &&
      depositPaid; // ✨ لازم العربون مدفوع

    const canCompleteBooking =
      booking.booking_status === 'CONFIRMED' &&
      embassyResult?.embassy_status === 'APPROVED' &&
      finalPaid; // ✨ لازم الدفعة النهائية مدفوعة

    // ✨ هل يجب أن يدفع المبلغ النهائي؟
    const needsFinalPayment =
      booking.booking_status === 'CONFIRMED' && !finalPaid;

    const suggestions: string[] = [];

    if (passportsTotal > 0 && passportsRejected === passportsTotal) {
      suggestions.push(
        'كل الجوازات مرفوضة، يُنصح برفض الحجز أو طلب جوازات جديدة من المستخدم',
      );
    }

    if (docsTotal > 0 && docsRejected === docsTotal) {
      suggestions.push('كل الوثائق مرفوضة، يُنصح برفض الحجز');
    }

    return {
      passports: {
        total: passportsTotal,
        uploaded: passportsUploaded,
        verified: passportsVerified,
        rejected: passportsRejected,
        pending: passportsPending,
      },
      documents: {
        total: docsTotal,
        approved: docsApproved,
        rejected: docsRejected,
        pending: docsPending,
      },
      embassy: embassyResult
        ? {
            status: embassyResult.embassy_status,
            rejection_reason: embassyResult.rejection_reason,
          }
        : null,
      // ✨ جديد: حالة الدفع
      payment: {
        total_price: totalPrice,
        deposit_amount: depositAmount,
        final_amount: finalAmount,
        total_paid: totalPaid,
        remaining: totalPrice - totalPaid,
        deposit_paid: depositPaid,
        final_paid: finalPaid,
        is_fully_paid: depositPaid && finalPaid,
        needs_final_payment: needsFinalPayment,
      },
      canConfirmBooking,
      canCompleteBooking,
      suggestions,
      blockReasons: this.getBlockReasons(
        booking.booking_status,
        passportsTotal,
        passportsUploaded,
        passportsVerified,
        passportsPending,
        passportsRejected,
        docsTotal,
        docsPending,
        docsRejected,
        depositPaid,
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
    dPending: number,
    dRejected: number,
    depositPaid: boolean,
  ): string[] {
    if (status !== 'PENDING') return [];

    const reasons: string[] = [];

    if (!depositPaid) {
      reasons.push('العربون غير مدفوع');
    }
    if (pTotal === 0) {
      reasons.push('لا يوجد مشاركون في الحجز');
    }
    if (pUploaded < pTotal) {
      reasons.push(`${pTotal - pUploaded} مشارك لم يرفع جوازه بعد`);
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
  // ✨ معدّل: تحديث حالة الحجز + إشعار طلب الدفع النهائي
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
        BookingStatus.REJECTED,
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

    if (dto.booking_status === BookingStatus.CONFIRMED) {
      const workflow = (booking as any).workflow;
      if (!workflow?.canConfirmBooking) {
        throw new BadRequestException({
          message:
            'لا يمكن قبول الحجز قبل اكتمال مراجعة الجوازات والوثائق ودفع العربون',
          reasons: workflow?.blockReasons || [],
        });
      }
    }

    const reason = dto.rejection_reason || dto.reason;

    if (dto.booking_status === BookingStatus.REJECTED) {
      if (!reason || !reason.trim()) {
        throw new BadRequestException('سبب الرفض مطلوب');
      }
    }

    const updated = await this.prisma.booking.update({
      where: { booking_id: BigInt(id) },
      data: {
        booking_status: dto.booking_status,
        rejection_reason:
          dto.booking_status === BookingStatus.REJECTED
            ? reason?.trim()
            : null,
      },
      include: {
        user: { select: { user_id: true, full_name: true, email: true } },
        package: { select: { package_title: true } },
      },
    });

    // ✨ إرسال إشعار للمستخدم
    if (dto.booking_status === BookingStatus.CONFIRMED) {
      // إشعار القبول
      await this.notificationsService.create({
        userId: updated.user.user_id,
        type: 'BOOKING_CONFIRMED',
        title: '✅ تم قبول حجزك',
        message: `تم قبول حجزك للرحلة "${updated.package.package_title}". سيتم الآن إرسال البيانات للسفارة.`,
        relatedId: updated.booking_id,
        relatedType: 'booking',
      });

      // ✨ جديد: إشعار "ادفع المبلغ المتبقي"
      const totalPrice = Number(booking.total_price);
      const finalAmount = totalPrice * (1 - DEPOSIT_PERCENTAGE);
      await this.notificationsService.create({
        userId: updated.user.user_id,
        type: 'PAYMENT_REQUIRED',
        title: '💳 مطلوب دفع المبلغ المتبقي',
        message: `حجزك مقبول! يرجى دفع المبلغ المتبقي (${this.formatCurrency(finalAmount)}) لإكمال الحجز.`,
        relatedId: updated.booking_id,
        relatedType: 'booking',
      });
    } else if (dto.booking_status === BookingStatus.REJECTED) {
      await this.notificationsService.create({
        userId: updated.user.user_id,
        type: 'BOOKING_REJECTED',
        title: '❌ تم رفض حجزك',
        message: `للأسف تم رفض حجزك للرحلة "${updated.package.package_title}". السبب: ${reason}`,
        relatedId: updated.booking_id,
        relatedType: 'booking',
      });
    }

    return updated;
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

  // ─────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-SY', {
      maximumFractionDigits: 0,
    }).format(amount) + ' ل.س';
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