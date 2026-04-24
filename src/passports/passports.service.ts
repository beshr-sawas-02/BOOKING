import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import { AiService } from '../ai/ai.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { VerifyPassportDto } from './dto/verify-passport.dto';
import { ImageType } from '../common/enums';
import { MulterFile } from '../common/types/multer.type';

@Injectable()
export class PassportsService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
    private aiService: AiService,
  ) {}

  private db(): any {
    return this.prisma as any;
  }

  async create(userId: number, dto: CreatePassportDto) {
    const participant = await this.db().bookingParticipant.findUnique({
      where: { participant_id: BigInt(dto.participant_id) },
      include: { booking: true },
    });
    if (!participant) throw new NotFoundException('Participant not found');
    if (participant.booking.user_id.toString() !== userId.toString())
      throw new ForbiddenException('Access denied');
    if (participant.passport_id)
      throw new BadRequestException('Participant already has a passport');

    const passport = await this.db().passport.create({
      data: {
        ...dto,
        participant_id: undefined,
        user_id: BigInt(userId),
        passport_number: dto.passport_number,
        date_of_birth: dto.date_of_birth
          ? new Date(dto.date_of_birth)
          : undefined,
        issue_date: dto.issue_date ? new Date(dto.issue_date) : undefined,
        expiry_date: dto.expiry_date ? new Date(dto.expiry_date) : undefined,
      },
    });

    await this.db().bookingParticipant.update({
      where: { participant_id: BigInt(dto.participant_id) },
      data: { passport_id: passport.passport_id },
    });

    return passport;
  }

  async findByBooking(bookingId: number) {
    return this.db().passport.findMany({
      where: { participant: { booking_id: BigInt(bookingId) } },
      include: { passport_images: true, participant: true },
    });
  }

  async findAll() {
    return this.db().passport.findMany({
      include: {
        passport_images: true,
        participant: { include: { booking: true } },
        user: { select: { user_id: true, full_name: true, email: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findPendingVerification() {
    return this.db().passport.findMany({
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
    const passport = await this.db().passport.findUnique({
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

    // 1. ارفع الصورة على Cloudinary
    const url = await this.cloudinary.uploadFile(file, 'passports');

    // 2. احذف الصورة القديمة من نفس النوع
    await this.db().passportImage.deleteMany({
      where: { passport_id: BigInt(passportId), image_type: imageType },
    });

    // 3. احفظ الصورة الجديدة
    const image = await this.db().passportImage.create({
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

    // نبني updateData فقط بالحقول اللي استخرجها OCR فعلاً (لا نكتب undefined)
    const updateData: any = {
      ai_extracted: true,
      extraction_confidence: extracted.confidence,
    };

    if (extracted.full_name_en)
      updateData.full_name_en = extracted.full_name_en;
    if (extracted.nationality) updateData.nationality = extracted.nationality;
    if (extracted.gender) updateData.gender = extracted.gender as any;
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

    await this.db().passport.update({
      where: { passport_id: BigInt(passportId) },
      data: updateData,
    });
  }

  async verifyPassport(id: number, dto: VerifyPassportDto) {
    await this.findOne(id);
    return this.db().passport.update({
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
    return this.db().passport.update({
      where: { passport_id: BigInt(id) },
      data: { sent_to_embassy: true },
    });
  }

  async saveAiExtraction(
    id: number,
    extractedData: Partial<CreatePassportDto>,
    confidence: number,
  ) {
    return this.db().passport.update({
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

  // استخدام الـ buffer مباشرة بدل URL (يتجاوز مشكلة Cloudinary allowlist)
  private async runAiExtractionFromBuffer(
    passportId: number,
    buffer: Buffer,
    mimetype: string,
  ) {
    const extracted = await this.aiService.extractPassportDataFromBuffer(
      buffer,
      mimetype,
    );
    if (extracted.confidence > 0) {
      // لا نحدّث passport_number من الـ AI إذا كان undefined — منعاً لتعارض الـ unique constraint
      const updateData: any = {
        full_name_en: extracted.full_name_en,
        nationality: extracted.nationality,
        gender: extracted.gender,
        date_of_birth: extracted.date_of_birth
          ? new Date(extracted.date_of_birth)
          : undefined,
        issue_date: extracted.issue_date
          ? new Date(extracted.issue_date)
          : undefined,
        expiry_date: extracted.expiry_date
          ? new Date(extracted.expiry_date)
          : undefined,
        ai_extracted: true,
        extraction_confidence: extracted.confidence,
      };
      // نحدّث رقم الجواز فقط إذا استخرجه الـ AI فعلاً (مش Mock)
      if (extracted.passport_number) {
        updateData.passport_number = extracted.passport_number;
      }
      await this.db().passport.update({
        where: { passport_id: BigInt(passportId) },
        data: updateData,
      });
    }
  }
}
