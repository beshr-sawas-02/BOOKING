import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import { AiService } from '../ai/ai.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { VerifyPassportDto } from './dto/verify-passport.dto';
import { PassportsFilterDto } from './dto/passports-filter.dto';
import { ImageType, Gender } from '../common/enums';
import { MulterFile } from '../common/types/multer.type';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/dto/pagination.dto';

@Injectable()
export class PassportsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private aiService: AiService,
  ) {}

  // ─────────────────────────────────────────────────────────
  // إنشاء جواز جديد + ربطه بالمشارك
  // ─────────────────────────────────────────────────────────
  async create(userId: number, dto: CreatePassportDto) {
    const participant = await this.prisma.bookingParticipant.findUnique({
      where: { participant_id: BigInt(dto.participant_id) },
      include: { booking: true },
    });
    if (!participant) throw new NotFoundException('Participant not found');
    if (participant.booking.user_id.toString() !== userId.toString())
      throw new ForbiddenException('Access denied');
    if (participant.passport_id)
      throw new BadRequestException('Participant already has a passport');

    // فصل image_url عن باقي بيانات الجواز
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { image_url, participant_id: _ignore, ...passportData } = dto;

    const passport = await this.prisma.passport.create({
      data: {
        ...passportData,
        user_id: BigInt(userId),
        passport_number: dto.passport_number,
        date_of_birth: dto.date_of_birth
          ? new Date(dto.date_of_birth)
          : undefined,
        issue_date: dto.issue_date ? new Date(dto.issue_date) : undefined,
        expiry_date: dto.expiry_date ? new Date(dto.expiry_date) : undefined,
        ai_extracted: !!image_url,
      },
    });

    await this.prisma.bookingParticipant.update({
      where: { participant_id: BigInt(dto.participant_id) },
      data: { passport_id: passport.passport_id },
    });

    if (image_url) {
      await this.prisma.passportImage.create({
        data: {
          passport_id: passport.passport_id,
          image_url: image_url,
          image_type: ImageType.FRONT,
        },
      });
    }

    return passport;
  }

  // ─────────────────────────────────────────────────────────
  // معاينة OCR بدون حفظ
  // ─────────────────────────────────────────────────────────
  async previewOcr(file: MulterFile) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const url = await this.cloudinary.uploadFile(file, 'passports/preview');
    const extracted = await this.aiService.extractPassportData(url);

    return {
      image_url: url,
      confidence: extracted.confidence,
      needs_review: extracted.needs_review ?? false,
      extracted_data: {
        passport_number: extracted.passport_number,
        full_name_en: extracted.full_name_en,
        full_name_ar: extracted.full_name_ar,
        nationality: extracted.nationality,
        gender: extracted.gender,
        date_of_birth: extracted.date_of_birth,
        issue_date: extracted.issue_date,
        expiry_date: extracted.expiry_date,
      },
    };
  }

  // ─────────────────────────────────────────────────────────
  // قائمة كل الجوازات للأدمن — مع pagination + filters
  // ─────────────────────────────────────────────────────────
  async findAll(filters: PassportsFilterDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const search = filters.search?.trim();

    const where = this.buildWhereClause(filters, search);
    const { skip, take } = getPaginationParams(page, limit);

    const [total, passports] = await Promise.all([
      this.prisma.passport.count({ where }),
      this.prisma.passport.findMany({
        where,
        skip,
        take,
        include: {
          passport_images: { orderBy: { uploaded_at: 'desc' } },
          participant: {
            include: {
              booking: {
                select: {
                  booking_id: true,
                  booking_status: true,
                  package: { select: { package_title: true } },
                },
              },
            },
          },
          user: {
            select: { user_id: true, full_name: true, email: true },
          },
        },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return buildPaginatedResponse(passports, total, page, limit);
  }

  // ─────────────────────────────────────────────────────────
  // جوازات تنتظر المراجعة — مرتبة حسب الأولوية
  // الجوازات بـ confidence منخفض تظهر أولاً (أولوية المراجعة)
  // ─────────────────────────────────────────────────────────
  async findPendingVerification(filters: PassportsFilterDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    const where: Prisma.PassportWhereInput = {
      verified_by_admin: false,
      rejection_reason: null,
    };

    const { skip, take } = getPaginationParams(page, limit);

    const [total, passports] = await Promise.all([
      this.prisma.passport.count({ where }),
      this.prisma.passport.findMany({
        where,
        skip,
        take,
        include: {
          passport_images: true,
          participant: {
            include: {
              booking: { include: { package: true } },
            },
          },
          user: {
            select: { user_id: true, full_name: true, email: true },
          },
        },
        // الأولوية: confidence منخفض أولاً (nulls last)
        orderBy: [
          { extraction_confidence: { sort: 'asc', nulls: 'last' } },
          { created_at: 'asc' },
        ],
      }),
    ]);

    return buildPaginatedResponse(passports, total, page, limit);
  }

  // ─────────────────────────────────────────────────────────
  // إحصائيات الجوازات للـ dashboard
  // ─────────────────────────────────────────────────────────
  async getStats() {
    const [
      total,
      verified,
      pending,
      rejected,
      sentToEmbassy,
      lowConfidence,
      aiExtracted,
    ] = await Promise.all([
      this.prisma.passport.count(),
      this.prisma.passport.count({ where: { verified_by_admin: true } }),
      this.prisma.passport.count({
        where: { verified_by_admin: false, rejection_reason: null },
      }),
      this.prisma.passport.count({
        where: { rejection_reason: { not: null } },
      }),
      this.prisma.passport.count({ where: { sent_to_embassy: true } }),
      this.prisma.passport.count({
        where: {
          extraction_confidence: { lt: 0.6 },
          verified_by_admin: false,
        },
      }),
      this.prisma.passport.count({ where: { ai_extracted: true } }),
    ]);

    return {
      total,
      verified,
      pending,
      rejected,
      sentToEmbassy,
      lowConfidence,
      aiExtracted,
    };
  }

  async findByBooking(bookingId: number) {
    return this.prisma.passport.findMany({
      where: { participant: { booking_id: BigInt(bookingId) } },
      include: { passport_images: true, participant: true },
    });
  }

  async findOne(id: number) {
    const passport = await this.prisma.passport.findUnique({
      where: { passport_id: BigInt(id) },
      include: {
        passport_images: { orderBy: { uploaded_at: 'desc' } },
        participant: {
          include: {
            booking: {
              include: {
                package: true,
                user: {
                  select: {
                    user_id: true,
                    full_name: true,
                    email: true,
                    phone_number: true,
                  },
                },
              },
            },
          },
        },
        embassy_results: true,
      },
    });
    if (!passport) throw new NotFoundException('Passport not found');
    return passport;
  }

  // ─────────────────────────────────────────────────────────
  // رفع صورة الجواز + استدعاء AI تلقائياً
  // ─────────────────────────────────────────────────────────
  async uploadImage(
    passportId: number,
    userId: number,
    file: MulterFile,
    imageType: ImageType,
    isAdmin: boolean,
  ) {
    const passport = await this.findOne(passportId);
    if (!isAdmin && passport.user_id.toString() !== userId.toString())
      throw new ForbiddenException('Access denied');

    const url = await this.cloudinary.uploadFile(file, 'passports');

    await this.prisma.passportImage.deleteMany({
      where: { passport_id: BigInt(passportId), image_type: imageType },
    });

    const image = await this.prisma.passportImage.create({
      data: {
        passport_id: BigInt(passportId),
        image_url: url,
        image_type: imageType,
      },
    });

    if (imageType === ImageType.FRONT) {
      try {
        await this.runAiExtraction(passportId, url);
      } catch (err) {
        console.error('AI extraction error:', err);
      }
    }

    const updatedPassport = await this.findOne(passportId);
    return {
      image,
      passport: updatedPassport,
      message: 'تم رفع الصورة بنجاح وتحليلها',
    };
  }

  private async runAiExtraction(passportId: number, imageUrl: string) {
    const extracted = await this.aiService.extractPassportData(imageUrl);

    if (extracted.confidence === 0) {
      console.warn(
        `[OCR] Failed to extract passport ${passportId} — confidence 0, skipping save`,
      );
      return;
    }

    const updateData: Prisma.PassportUpdateInput = {
      ai_extracted: true,
      extraction_confidence: extracted.confidence,
    };

    if (extracted.full_name_en)
      updateData.full_name_en = extracted.full_name_en;
    if (extracted.nationality) updateData.nationality = extracted.nationality;
    if (extracted.gender) updateData.gender = extracted.gender as Gender;
    if (extracted.date_of_birth)
      updateData.date_of_birth = new Date(extracted.date_of_birth);
    if (extracted.issue_date)
      updateData.issue_date = new Date(extracted.issue_date);
    if (extracted.expiry_date)
      updateData.expiry_date = new Date(extracted.expiry_date);

    if (extracted.passport_number) {
      updateData.passport_number = extracted.passport_number;
    }

    await this.prisma.passport.update({
      where: { passport_id: BigInt(passportId) },
      data: updateData,
    });
  }

  // ─────────────────────────────────────────────────────────
  // مراجعة الجواز — قبول أو رفض مع سبب
  // ─────────────────────────────────────────────────────────
  async verifyPassport(id: number, dto: VerifyPassportDto) {
    await this.findOne(id);

    // إذا الرفض → السبب مطلوب (DTO يتحقق منه، لكن double-check)
    if (
      dto.verified_by_admin === false &&
      (!dto.rejection_reason || !dto.rejection_reason.trim())
    ) {
      throw new BadRequestException('سبب الرفض مطلوب');
    }

    // فصل rejection_reason عن باقي البيانات
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { rejection_reason, verified_by_admin, ...passportData } = dto;

    const updateData: Prisma.PassportUpdateInput = {
      ...passportData,
      verified_by_admin,
      // إذا رفض → خزّن السبب، إذا قبول → امسحه (في حال كان مرفوض سابقاً)
      rejection_reason: verified_by_admin
        ? null
        : rejection_reason?.trim() ?? null,
      date_of_birth: dto.date_of_birth
        ? new Date(dto.date_of_birth)
        : undefined,
      issue_date: dto.issue_date ? new Date(dto.issue_date) : undefined,
      expiry_date: dto.expiry_date ? new Date(dto.expiry_date) : undefined,
    };

    return this.prisma.passport.update({
      where: { passport_id: BigInt(id) },
      data: updateData,
      include: {
        passport_images: true,
        participant: {
          include: {
            booking: {
              select: {
                booking_id: true,
                user: { select: { full_name: true, email: true } },
              },
            },
          },
        },
      },
    });
  }

  async markSentToEmbassy(id: number) {
    const passport = await this.findOne(id);
    if (!passport.verified_by_admin)
      throw new BadRequestException('Passport must be verified first');
    return this.prisma.passport.update({
      where: { passport_id: BigInt(id) },
      data: { sent_to_embassy: true },
    });
  }

  async saveAiExtraction(
    id: number,
    extractedData: Partial<CreatePassportDto>,
    confidence: number,
  ) {
    return this.prisma.passport.update({
      where: { passport_id: BigInt(id) },
      data: {
        ...extractedData,
        participant_id: undefined,
        ai_extracted: true,
        extraction_confidence: confidence,
        date_of_birth: extractedData.date_of_birth
          ? new Date(extractedData.date_of_birth)
          : undefined,
        issue_date: extractedData.issue_date
          ? new Date(extractedData.issue_date)
          : undefined,
        expiry_date: extractedData.expiry_date
          ? new Date(extractedData.expiry_date)
          : undefined,
      },
    });
  }

  // ─────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────

  private buildWhereClause(
    filters: PassportsFilterDto,
    search?: string,
  ): Prisma.PassportWhereInput {
    const where: Prisma.PassportWhereInput = {};

    if (filters.verified !== undefined) {
      where.verified_by_admin = filters.verified;
    }

    if (filters.sent_to_embassy !== undefined) {
      where.sent_to_embassy = filters.sent_to_embassy;
    }

    if (filters.confidence_level === 'low') {
      where.extraction_confidence = { lt: 0.6 };
    } else if (filters.confidence_level === 'medium') {
      where.extraction_confidence = { gte: 0.6, lt: 0.8 };
    } else if (filters.confidence_level === 'high') {
      where.extraction_confidence = { gte: 0.8 };
    }

    if (filters.booking_id) {
      where.participant = {
        booking_id: BigInt(filters.booking_id),
      };
    }

    if (search) {
      where.OR = [
        { passport_number: { contains: search, mode: 'insensitive' } },
        { full_name_en: { contains: search, mode: 'insensitive' } },
        { full_name_ar: { contains: search, mode: 'insensitive' } },
        { nationality: { contains: search, mode: 'insensitive' } },
        {
          user: {
            OR: [
              { full_name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }

    return where;
  }
}