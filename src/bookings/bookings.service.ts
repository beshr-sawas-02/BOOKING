import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingStatus } from '../common/enums';
import {
  MahramValidator,
  calcAge,
  Gender,
} from './validators/mahram.validator';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  private mahramValidator = new MahramValidator();

  async create(userId: number, dto: CreateBookingDto) {
    // ── 1. تحقق من الباقة ─────────────────────────────────
    const pkg = await this.prisma.package.findUnique({
      where: { package_id: BigInt(dto.package_id) },
    });
    if (!pkg) throw new NotFoundException('Package not found');

    const totalParticipants = dto.participants.length + 1; // +1 for primary
    if (totalParticipants > pkg.max_participants) {
      throw new BadRequestException(
        `الحد الأقصى للمشاركين في هذه الباقة هو ${pkg.max_participants}`,
      );
    }

    // ── 2. تحقق من قواعد المحارم (للحج فقط) ─────────────
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

    // ── 3. تحقق من وجود PRIMARY واحد على الأقل ──────────
    const hasPrimary = dto.participants.some((p) => p.is_primary);
    if (!hasPrimary) dto.participants[0].is_primary = true;

    // ── 4. احسب السعر الإجمالي ────────────────────────────
    const totalPrice = Number(pkg.price_per_person) * dto.participants.length;

    // ── 5. أنشئ الحجز ─────────────────────────────────────
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

    return {
      ...booking,
      warnings,
    };
  }

  async findAll(filters?: { status?: BookingStatus; userId?: number }) {
    return this.prisma.booking.findMany({
      where: {
        ...(filters?.status && { booking_status: filters.status }),
        ...(filters?.userId && { user_id: BigInt(filters.userId) }),
      },
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
          include: { passport: true, family_proof: true },
        },
        embassy_results: true,
      },
      orderBy: { created_at: 'desc' },
    });
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
          },
        },
        package: { include: { package_hotels: { include: { hotel: true } } } },
        booking_participants: {
          include: {
            passport: { include: { passport_images: true } },
            family_proof: true,
          },
        },
        embassy_results: true,
        family_proof_documents: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async findMyBookings(userId: number) {
    return this.findAll({ userId });
  }

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

    return this.prisma.booking.update({
      where: { booking_id: BigInt(id) },
      data: { booking_status: dto.booking_status },
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

  // ─────────────────────────────────────────────────────────
  // تعديل الحجز من المستخدم — فقط إذا PENDING
  // ─────────────────────────────────────────────────────────
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
}
