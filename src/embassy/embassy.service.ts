import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateEmbassyResultDto } from './dto/update-embassy-result.dto';
import { EmbassyStatus } from '../common/enums';

@Injectable()
export class EmbassyService {
  constructor(private prisma: PrismaService) {}

  private db(): any {
    return this.prisma as any;
  }

  async submitBookingToEmbassy(bookingId: number) {
    const booking = await this.db().booking.findUnique({
      where: { booking_id: BigInt(bookingId) },
      include: { booking_participants: { include: { passport: true } } },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.booking_status !== 'CONFIRMED') {
      throw new BadRequestException(
        'Only confirmed bookings can be submitted to embassy',
      );
    }

    const passports = booking.booking_participants
      .map((p: any) => p.passport)
      .filter((p: any) => p && p.verified_by_admin && !p.sent_to_embassy);

    if (passports.length === 0) {
      throw new BadRequestException('No verified unsubmitted passports found');
    }

    const createResults = passports.map((p: any) =>
      this.db().embassyResult.create({
        data: {
          booking_id: BigInt(bookingId),
          passport_id: p.passport_id,
          embassy_status: EmbassyStatus.PENDING,
        },
      }),
    );

    const markSent = passports.map((p: any) =>
      this.db().passport.update({
        where: { passport_id: p.passport_id },
        data: { sent_to_embassy: true },
      }),
    );

    const results = await (this.prisma as any).$transaction([
      ...createResults,
      ...markSent,
    ]);

    return {
      message: `Submitted ${passports.length} passport(s) to embassy`,
      results: results.slice(0, passports.length),
    };
  }

  async updateResult(resultId: number, dto: UpdateEmbassyResultDto) {
    const result = await this.db().embassyResult.findUnique({
      where: { result_id: BigInt(resultId) },
    });
    if (!result) throw new NotFoundException('Embassy result not found');

    return this.db().embassyResult.update({
      where: { result_id: BigInt(resultId) },
      data: dto,
      include: { booking: true, passport: true },
    });
  }

  async findByBooking(bookingId: number) {
    return this.db().embassyResult.findMany({
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

  async findAll(status?: EmbassyStatus) {
    return this.db().embassyResult.findMany({
      where: status ? { embassy_status: status } : undefined,
      include: {
        booking: {
          include: { user: { select: { full_name: true, email: true } } },
        },
        passport: { select: { full_name_en: true, passport_number: true } },
      },
      orderBy: { uploaded_at: 'desc' },
    });
  }

  async getStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.db().embassyResult.count(),
      this.db().embassyResult.count({ where: { embassy_status: 'PENDING' } }),
      this.db().embassyResult.count({ where: { embassy_status: 'APPROVED' } }),
      this.db().embassyResult.count({ where: { embassy_status: 'REJECTED' } }),
    ]);
    return { total, pending, approved, rejected };
  }
}
