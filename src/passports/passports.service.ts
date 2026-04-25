import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import { AiService } from '../ai/ai.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { VerifyPassportDto } from './dto/verify-passport.dto';
import { ImageType, Gender } from '../common/enums';
import { MulterFile } from '../common/types/multer.type';

@Injectable()
export class PassportsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private aiService: AiService,
  ) {}

  // ─────────────────────────────────────────────────────────
  // إنشاء جواز جديد + ربطه بالمشارك
  // يدعم حالتين:
  //   1. إنشاء عادي (المستخدم يكتب البيانات يدوياً)
  //   2. إنشاء بعد OCR preview (مع image_url من الـ preview)
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
        // إذا الصورة جاية من OCR preview، نفعّل ai_extracted
        ai_extracted: !!image_url,
      },
    });

    // ربط الجواز بالمشارك
    await this.prisma.bookingParticipant.update({
      where: { participant_id: BigInt(dto.participant_id) },
      data: { passport_id: passport.passport_id },
    });

    // إذا في image_url من preview → احفظ الصورة في passport_images
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
  // ✨ جديد: تحليل صورة جواز بـ OCR بدون حفظ في DB
  // يستخدم لمعاينة النتائج قبل إنشاء الجواز
  // ─────────────────────────────────────────────────────────
  async previewOcr(file: MulterFile) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    // 1. ارفع الصورة على Cloudinary مؤقتاً
    const url = await this.cloudinary.uploadFile(file, 'passports/preview');

    // 2. شغّل OCR
    const extracted = await this.aiService.extractPassportData(url);

    // 3. أرجع النتائج مع رابط الصورة
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

  async findByBooking(bookingId: number) {
    return this.prisma.passport.findMany({
      where: { participant: { booking_id: BigInt(bookingId) } },
      include: { passport_images: true, participant: true },
    });
  }

  async findAll() {
    return this.prisma.passport.findMany({
      include: {
        passport_images: true,
        participant: { include: { booking: true } },
        user: { select: { user_id: true, full_name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findPendingVerification() {
    return this.prisma.passport.findMany({
      where: { verified_by_admin: false },
      include: {
        passport_images: true,
        participant: { include: { booking: { include: { package: true } } } },
        user: { select: { user_id: true, full_name: true, email: true } },
      },
      orderBy: { created_at: 'asc' },
    });
  }

  async findOne(id: number) {
    const passport = await this.prisma.passport.findUnique({
      where: { passport_id: BigInt(id) },
      include: {
        passport_images: true,
        participant: { include: { booking: true } },
        embassy_results: true,
      },
    });
    if (!passport) throw new NotFoundException('Passport not found');
    return passport;
  }

  // ─────────────────────────────────────────────────────────
  // رفع صورة الجواز + استدعاء AI تلقائياً (للجوازات الموجودة)
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

    // 1. ارفع الصورة على Cloudinary
    const url = await this.cloudinary.uploadFile(file, 'passports');

    // 2. احذف الصورة القديمة من نفس النوع
    await this.prisma.passportImage.deleteMany({
      where: { passport_id: BigInt(passportId), image_type: imageType },
    });

    // 3. احفظ الصورة الجديدة
    const image = await this.prisma.passportImage.create({
      data: {
        passport_id: BigInt(passportId),
        image_url: url,
        image_type: imageType,
      },
    });

    // 4. إذا كانت صورة الوجه (FRONT) → شغّل AI عبر Python service
    if (imageType === ImageType.FRONT) {
      try {
        await this.runAiExtraction(passportId, url);
      } catch (err) {
        console.error('AI extraction error:', err);
      }
    }

    // أرجع الجواز المحدّث مع بيانات الـ AI
    const updatedPassport = await this.findOne(passportId);
    return {
      image,
      passport: updatedPassport,
      message: 'تم رفع الصورة بنجاح وتحليلها',
    };
  }

  // ─────────────────────────────────────────────────────────
  // AI يشتغل في الخلفية بعد رفع الصورة
  // ─────────────────────────────────────────────────────────
  private async runAiExtraction(passportId: number, imageUrl: string) {
    const extracted = await this.aiService.extractPassportData(imageUrl);

    // إذا confidence = 0 → OCR فشل أو Python مش شغّال → لا نحفظ شي
    if (extracted.confidence === 0) {
      console.warn(
        `[OCR] Failed to extract passport ${passportId} — confidence 0, skipping save`,
      );
      return;
    }

    // نبني updateData فقط بالحقول اللي استخرجها OCR فعلاً
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

    // رقم الجواز — نحدّث فقط إذا استخرجناه (منعاً لتعارض unique constraint)
    if (extracted.passport_number) {
      updateData.passport_number = extracted.passport_number;
    }

    await this.prisma.passport.update({
      where: { passport_id: BigInt(passportId) },
      data: updateData,
    });
  }

  async verifyPassport(id: number, dto: VerifyPassportDto) {
    await this.findOne(id);
    return this.prisma.passport.update({
      where: { passport_id: BigInt(id) },
      data: {
        ...dto,
        date_of_birth: dto.date_of_birth
          ? new Date(dto.date_of_birth)
          : undefined,
        issue_date: dto.issue_date ? new Date(dto.issue_date) : undefined,
        expiry_date: dto.expiry_date ? new Date(dto.expiry_date) : undefined,
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
}