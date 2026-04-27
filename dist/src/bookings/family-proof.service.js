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
const enums_1 = require("../common/enums");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let FamilyProofService = class FamilyProofService {
    prisma;
    cloudinary;
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
    }
    async upload(userId, file, dto) {
        if (!file) {
            throw new common_1.BadRequestException('Document file is required');
        }
        const booking = await this.prisma.booking.findUnique({
            where: { booking_id: BigInt(dto.booking_id) },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.user_id.toString() !== userId.toString())
            throw new common_1.ForbiddenException('Access denied');
        const url = await this.cloudinary.uploadFile(file, 'family-proof');
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
    async findAll(filters) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 10;
        const search = filters.search?.trim();
        const where = this.buildWhereClause(filters, search);
        const { skip, take } = (0, pagination_dto_1.getPaginationParams)(page, limit);
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
        return (0, pagination_dto_1.buildPaginatedResponse)(docs, total, page, limit);
    }
    async findPending(filters) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 10;
        const where = {
            verification_status: enums_1.VerificationStatus.PENDING,
        };
        const { skip, take } = (0, pagination_dto_1.getPaginationParams)(page, limit);
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
        return (0, pagination_dto_1.buildPaginatedResponse)(docs, total, page, limit);
    }
    async getStats() {
        const [total, pending, approved, rejected] = await Promise.all([
            this.prisma.familyProofDocument.count(),
            this.prisma.familyProofDocument.count({
                where: { verification_status: enums_1.VerificationStatus.PENDING },
            }),
            this.prisma.familyProofDocument.count({
                where: { verification_status: enums_1.VerificationStatus.APPROVED },
            }),
            this.prisma.familyProofDocument.count({
                where: { verification_status: enums_1.VerificationStatus.REJECTED },
            }),
        ]);
        return { total, pending, approved, rejected };
    }
    async findByBooking(bookingId) {
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
    async findOne(id) {
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
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        return doc;
    }
    async verify(documentId, dto) {
        const doc = await this.prisma.familyProofDocument.findUnique({
            where: { document_id: BigInt(documentId) },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        if (dto.status === enums_1.VerificationStatus.REJECTED &&
            (!dto.rejection_reason || !dto.rejection_reason.trim())) {
            throw new common_1.BadRequestException('سبب الرفض مطلوب');
        }
        return this.prisma.familyProofDocument.update({
            where: { document_id: BigInt(documentId) },
            data: {
                verification_status: dto.status,
                rejection_reason: dto.status === enums_1.VerificationStatus.REJECTED
                    ? dto.rejection_reason.trim()
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
    async linkToParticipant(documentId, participantId) {
        const [doc, participant] = await Promise.all([
            this.prisma.familyProofDocument.findUnique({
                where: { document_id: BigInt(documentId) },
            }),
            this.prisma.bookingParticipant.findUnique({
                where: { participant_id: BigInt(participantId) },
            }),
        ]);
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        if (!participant)
            throw new common_1.NotFoundException('Participant not found');
        if (participant.booking_id.toString() !== doc.booking_id.toString()) {
            throw new common_1.BadRequestException('المشارك ليس من نفس الحجز');
        }
        return this.prisma.bookingParticipant.update({
            where: { participant_id: BigInt(participantId) },
            data: { family_proof_id: BigInt(documentId) },
            include: { family_proof: true },
        });
    }
    buildWhereClause(filters, search) {
        const where = {};
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
};
exports.FamilyProofService = FamilyProofService;
exports.FamilyProofService = FamilyProofService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        cloudinary_service_1.CloudinaryService])
], FamilyProofService);
//# sourceMappingURL=family-proof.service.js.map