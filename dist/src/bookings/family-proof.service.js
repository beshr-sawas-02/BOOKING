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
exports.FamilyProofService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../upload/cloudinary.service");
let FamilyProofService = class FamilyProofService {
    prisma;
    cloudinary;
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
    }
    db() {
        return this.prisma;
    }
    async upload(userId, file, dto) {
        const booking = await this.db().booking.findUnique({
            where: { booking_id: BigInt(dto.booking_id) },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.user_id.toString() !== userId.toString())
            throw new common_1.ForbiddenException('Access denied');
        const url = await this.cloudinary.uploadFile(file, 'family-proof');
        const doc = await this.db().familyProofDocument.create({
            data: {
                uploaded_by: BigInt(userId),
                booking_id: BigInt(dto.booking_id),
                document_url: url,
                document_type: dto.document_type,
                father_name: dto.father_name,
                mother_name: dto.mother_name,
            },
        });
        return { ...doc, message: 'تم رفع الوثيقة بنجاح، بانتظار مراجعة الأدمن' };
    }
    async findByBooking(bookingId) {
        return this.db().familyProofDocument.findMany({
            where: { booking_id: BigInt(bookingId) },
            include: { uploader: { select: { full_name: true, email: true } } },
        });
    }
    async verify(documentId, status) {
        const doc = await this.db().familyProofDocument.findUnique({
            where: { document_id: BigInt(documentId) },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        return this.db().familyProofDocument.update({
            where: { document_id: BigInt(documentId) },
            data: { verification_status: status },
        });
    }
    async linkToParticipant(documentId, participantId) {
        return this.db().bookingParticipant.update({
            where: { participant_id: BigInt(participantId) },
            data: { family_proof_id: BigInt(documentId) },
        });
    }
};
exports.FamilyProofService = FamilyProofService;
exports.FamilyProofService = FamilyProofService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], FamilyProofService);
//# sourceMappingURL=family-proof.service.js.map