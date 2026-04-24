"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PassportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../upload/cloudinary.service");
const ai_service_1 = require("../ai/ai.service");
const enums_1 = require("../common/enums");
let PassportsService = class PassportsService {
    prisma;
    cloudinary;
    aiService;
    constructor(prisma, cloudinary, aiService) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
        this.aiService = aiService;
    }
    db() {
        return this.prisma;
    }
    async create(userId, dto) {
        const participant = await this.db().bookingParticipant.findUnique({
            where: { participant_id: BigInt(dto.participant_id) },
            include: { booking: true },
        });
        if (!participant)
            throw new common_1.NotFoundException('Participant not found');
        if (participant.booking.user_id.toString() !== userId.toString())
            throw new common_1.ForbiddenException('Access denied');
        if (participant.passport_id)
            throw new common_1.BadRequestException('Participant already has a passport');
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
    async findByBooking(bookingId) {
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
    async findOne(id) {
        const passport = await this.db().passport.findUnique({
            where: { passport_id: BigInt(id) },
            include: {
                passport_images: true,
                participant: { include: { booking: true } },
                embassy_results: true,
            },
        });
        if (!passport)
            throw new common_1.NotFoundException('Passport not found');
        return passport;
    }
    async uploadImage(passportId, userId, file, imageType, isAdmin) {
        const passport = await this.findOne(passportId);
        if (!isAdmin && passport.user_id.toString() !== userId.toString())
            throw new common_1.ForbiddenException('Access denied');
        const url = await this.cloudinary.uploadFile(file, 'passports');
        await this.db().passportImage.deleteMany({
            where: { passport_id: BigInt(passportId), image_type: imageType },
        });
        const image = await this.db().passportImage.create({
            data: {
                passport_id: BigInt(passportId),
                image_url: url,
                image_type: imageType,
            },
        });
        if (imageType === enums_1.ImageType.FRONT) {
            try {
                await this.runAiExtraction(passportId, url);
            }
            catch (err) {
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
    async runAiExtraction(passportId, imageUrl) {
        const extracted = await this.aiService.extractPassportData(imageUrl);
        if (extracted.confidence === 0) {
            console.warn(`[OCR] Failed to extract passport ${passportId} — confidence 0, skipping save`);
            return;
        }
        const updateData = {
            ai_extracted: true,
            extraction_confidence: extracted.confidence,
        };
        if (extracted.full_name_en)
            updateData.full_name_en = extracted.full_name_en;
        if (extracted.nationality)
            updateData.nationality = extracted.nationality;
        if (extracted.gender)
            updateData.gender = extracted.gender;
        if (extracted.date_of_birth)
            updateData.date_of_birth = new Date(extracted.date_of_birth);
        if (extracted.issue_date)
            updateData.issue_date = new Date(extracted.issue_date);
        if (extracted.expiry_date)
            updateData.expiry_date = new Date(extracted.expiry_date);
        if (extracted.passport_number) {
            updateData.passport_number = extracted.passport_number;
        }
        await this.db().passport.update({
            where: { passport_id: BigInt(passportId) },
            data: updateData,
        });
    }
    async verifyPassport(id, dto) {
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
    async markSentToEmbassy(id) {
        const passport = await this.findOne(id);
        if (!passport.verified_by_admin)
            throw new common_1.BadRequestException('Passport must be verified first');
        return this.db().passport.update({
            where: { passport_id: BigInt(id) },
            data: { sent_to_embassy: true },
        });
    }
    async saveAiExtraction(id, extractedData, confidence) {
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
    async runAiExtractionFromBuffer(passportId, buffer, mimetype) {
        const extracted = await this.aiService.extractPassportDataFromBuffer(buffer, mimetype);
        if (extracted.confidence > 0) {
            const updateData = {
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
            if (extracted.passport_number) {
                updateData.passport_number = extracted.passport_number;
            }
            await this.db().passport.update({
                where: { passport_id: BigInt(passportId) },
                data: updateData,
            });
        }
    }
};
exports.PassportsService = PassportsService;
exports.PassportsService = PassportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService,
        ai_service_1.AiService])
], PassportsService);
//# sourceMappingURL=passports.service.js.map