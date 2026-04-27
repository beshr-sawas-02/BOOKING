import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import { CreateFamilyProofDto } from './dto/create-family-proof.dto';
import { VerifyFamilyProofDto } from './dto/verify-family-proof.dto';
import { FamilyProofFilterDto } from './dto/family-proof-filter.dto';
import { VerificationStatus } from '../common/enums';
import { MulterFile } from '../common/types/multer.type';
import {
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/dto/pagination.dto';

@Injectable()
export class FamilyProofService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  // ─────────────────────────────────────────────────────────
  // رفع وثيقة من المستخدم
  // ─────────────────────────────────────────────────────────
  async upload(userId: number, file: MulterFile, dto: CreateFamilyProofDto) {
    if (!file) {
      throw new BadRequestException('Document file is required');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { booking_id: BigInt(dto.booking_id) },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.user_id.toString() !== userId.toString())
      throw new ForbiddenException('Access denied');

    // 1. رفع الوثيقة على Cloudinary
    const url = await this.cloudinary.uploadFile(file, 'family-proof');

    // 2. حفظ في قاعدة البيانات
    const doc = await this.prisma.familyProofDocument.create({
      data: {
        uploaded_by: BigInt(userId),
        booking_id: BigInt(dto.booking_id),
        document_url: url,
        document_type: dto.document_type,
        father_name: dto.father_name,
        mother_name: dto.mother_name,
      },
    });

    return {
      ...doc,
      message: 'تم رفع الوثيقة بنجاح، بانتظار مراجعة الأدمن',
    };
  }

  // ─────────────────────────────────────────────────────────
  // قائمة كل الوثائق (للأدمن) — مع pagination + filters
  // ─────────────────────────────────────────────────────────
  async findAll(filters: FamilyProofFilterDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const search = filters.search?.trim();

    const where = this.buildWhereClause(filters, search);
    const { skip, take } = getPaginationParams(page, limit);

    const [total, docs] = await Promise.all([
      this.prisma.familyProofDocument.count({ where }),
      this.prisma.familyProofDocument.findMany({
        where,
        skip,
        take,
        include: {
          uploader: {
            select: {
              user_id: true,
              full_name: true,
              email: true,
              phone_number: true,
            },
          },
          booking: {
            select: {
              booking_id: true,
              booking_status: true,
              package: {
                select: {
                  package_id: true,
                  package_title: true,
                  package_type: true,
                },
              },
            },
          },
          _count: { select: { booking_participants: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
    ]);

    return buildPaginatedResponse(docs, total, page, limit);
  }

  // ─────────────────────────────────────────────────────────
  // وثائق تنتظر المراجعة (الأقدم أولاً للعدالة)
  // ─────────────────────────────────────────────────────────
  async findPending(filters: FamilyProofFilterDto) {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;

    const where: Prisma.FamilyProofDocumentWhereInput = {
      verification_status: VerificationStatus.PENDING,
    };

    const { skip, take } = getPaginationParams(page, limit);

    const [total, docs] = await Promise.all([
      this.prisma.familyProofDocument.count({ where }),
      this.prisma.familyProofDocument.findMany({
        where,
        skip,
        take,
        include: {
          uploader: {
            select: {
              user_id: true,
              full_name: true,
              email: true,
              phone_number: true,
            },
          },
          booking: {
            include: {
              package: true,
              booking_participants: {
                select: {
                  participant_id: true,
                  full_name: true,
                  relation_type: true,
                  is_primary: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'asc' },
      }),
    ]);

    return buildPaginatedResponse(docs, total, page, limit);
  }

  // ─────────────────────────────────────────────────────────
  // إحصائيات للـ dashboard
  // ─────────────────────────────────────────────────────────
  async getStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.familyProofDocument.count(),
      this.prisma.familyProofDocument.count({
        where: { verification_status: VerificationStatus.PENDING },
      }),
      this.prisma.familyProofDocument.count({
        where: { verification_status: VerificationStatus.APPROVED },
      }),
      this.prisma.familyProofDocument.count({
        where: { verification_status: VerificationStatus.REJECTED },
      }),
    ]);

    return { total, pending, approved, rejected };
  }

  // ─────────────────────────────────────────────────────────
  // وثائق حجز معين
  // ─────────────────────────────────────────────────────────
  async findByBooking(bookingId: number) {
    return this.prisma.familyProofDocument.findMany({
      where: { booking_id: BigInt(bookingId) },
      include: {
        uploader: {
          select: { user_id: true, full_name: true, email: true },
        },
        booking_participants: {
          select: {
            participant_id: true,
            full_name: true,
            relation_type: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ─────────────────────────────────────────────────────────
  // تفاصيل وثيقة واحدة
  // ─────────────────────────────────────────────────────────
  async findOne(id: number) {
    const doc = await this.prisma.familyProofDocument.findUnique({
      where: { document_id: BigInt(id) },
      include: {
        uploader: {
          select: {
            user_id: true,
            full_name: true,
            email: true,
            phone_number: true,
          },
        },
        booking: {
          include: {
            package: true,
            booking_participants: true,
          },
        },
        booking_participants: true,
      },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  // ─────────────────────────────────────────────────────────
  // مراجعة الوثيقة — قبول أو رفض مع سبب
  // ─────────────────────────────────────────────────────────
  async verify(documentId: number, dto: VerifyFamilyProofDto) {
    const doc = await this.prisma.familyProofDocument.findUnique({
      where: { document_id: BigInt(documentId) },
    });
    if (!doc) throw new NotFoundException('Document not found');

    // إذا الرفض → السبب مطلوب (DTO يتحقق منه، لكن double-check)
    if (
      dto.status === VerificationStatus.REJECTED &&
      (!dto.rejection_reason || !dto.rejection_reason.trim())
    ) {
      throw new BadRequestException('سبب الرفض مطلوب');
    }

    return this.prisma.familyProofDocument.update({
      where: { document_id: BigInt(documentId) },
      data: {
        verification_status: dto.status,
        // إذا رفض → خزّن السبب، إذا قبول → امسحه
        rejection_reason:
          dto.status === VerificationStatus.REJECTED
            ? dto.rejection_reason!.trim()
            : null,
      },
      include: {
        uploader: { select: { full_name: true, email: true } },
        booking: {
          select: { booking_id: true, package: { select: { package_title: true } } },
        },
      },
    });
  }

  // ─────────────────────────────────────────────────────────
  // ربط الوثيقة بمشارك (أدمن)
  // ─────────────────────────────────────────────────────────
  async linkToParticipant(documentId: number, participantId: number) {
    // تأكد من وجود الاثنين قبل الربط
    const [doc, participant] = await Promise.all([
      this.prisma.familyProofDocument.findUnique({
        where: { document_id: BigInt(documentId) },
      }),
      this.prisma.bookingParticipant.findUnique({
        where: { participant_id: BigInt(participantId) },
      }),
    ]);

    if (!doc) throw new NotFoundException('Document not found');
    if (!participant) throw new NotFoundException('Participant not found');

    // تأكد إن المشارك من نفس الحجز
    if (participant.booking_id.toString() !== doc.booking_id.toString()) {
      throw new BadRequestException('المشارك ليس من نفس الحجز');
    }

    return this.prisma.bookingParticipant.update({
      where: { participant_id: BigInt(participantId) },
      data: { family_proof_id: BigInt(documentId) },
      include: { family_proof: true },
    });
  }

  // ─────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────

  private buildWhereClause(
    filters: FamilyProofFilterDto,
    search?: string,
  ): Prisma.FamilyProofDocumentWhereInput {
    const where: Prisma.FamilyProofDocumentWhereInput = {};

    if (filters.status) {
      where.verification_status = filters.status;
    }

    if (filters.booking_id) {
      where.booking_id = BigInt(filters.booking_id);
    }

    if (search) {
      where.OR = [
        { document_type: { contains: search, mode: 'insensitive' } },
        { father_name: { contains: search, mode: 'insensitive' } },
        { mother_name: { contains: search, mode: 'insensitive' } },
        {
          uploader: {
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