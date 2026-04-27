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
exports.EmbassyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const enums_1 = require("../common/enums");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let EmbassyService = class EmbassyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async submitBookingToEmbassy(bookingId) {
        const booking = await this.prisma.booking.findUnique({
            where: { booking_id: BigInt(bookingId) },
            include: { booking_participants: { include: { passport: true } } },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.booking_status !== 'CONFIRMED') {
            throw new common_1.BadRequestException('Only confirmed bookings can be submitted to embassy');
        }
        const passports = booking.booking_participants
            .map((p) => p.passport)
            .filter((p) => p !== null && p.verified_by_admin && !p.sent_to_embassy);
        if (passports.length === 0) {
            throw new common_1.BadRequestException('No verified unsubmitted passports found in this booking');
        }
        const results = await this.prisma.$transaction(async (tx) => {
            const createdResults = await Promise.all(passports.map((p) => tx.embassyResult.create({
                data: {
                    booking_id: BigInt(bookingId),
                    passport_id: p.passport_id,
                    embassy_status: enums_1.EmbassyStatus.PENDING,
                },
                include: {
                    passport: {
                        select: {
                            passport_id: true,
                            full_name_en: true,
                            passport_number: true,
                        },
                    },
                },
            })));
            await Promise.all(passports.map((p) => tx.passport.update({
                where: { passport_id: p.passport_id },
                data: { sent_to_embassy: true },
            })));
            return createdResults;
        });
        return {
            message: `تم إرسال ${passports.length} جواز إلى السفارة`,
            count: passports.length,
            results,
        };
    }
    async updateResult(resultId, dto) {
        const result = await this.prisma.embassyResult.findUnique({
            where: { result_id: BigInt(resultId) },
        });
        if (!result)
            throw new common_1.NotFoundException('Embassy result not found');
        if (dto.embassy_status === enums_1.EmbassyStatus.REJECTED &&
            (!dto.rejection_reason || !dto.rejection_reason.trim())) {
            throw new common_1.BadRequestException('سبب الرفض مطلوب');
        }
        return this.prisma.embassyResult.update({
            where: { result_id: BigInt(resultId) },
            data: {
                embassy_status: dto.embassy_status,
                notes: dto.notes,
                rejection_reason: dto.embassy_status === enums_1.EmbassyStatus.REJECTED
                    ? dto.rejection_reason.trim()
                    : null,
            },
            include: {
                booking: {
                    include: {
                        user: { select: { full_name: true, email: true } },
                        package: { select: { package_title: true } },
                    },
                },
                passport: {
                    select: {
                        passport_id: true,
                        full_name_en: true,
                        full_name_ar: true,
                        passport_number: true,
                    },
                },
            },
        });
    }
    async findByBooking(bookingId) {
        return this.prisma.embassyResult.findMany({
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
    async findAll(filters) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 10;
        const search = filters.search?.trim();
        const where = this.buildWhereClause(filters, search);
        const { skip, take } = (0, pagination_dto_1.getPaginationParams)(page, limit);
        const [total, results] = await Promise.all([
            this.prisma.embassyResult.count({ where }),
            this.prisma.embassyResult.findMany({
                where,
                skip,
                take,
                include: {
                    booking: {
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
                                },
                            },
                        },
                    },
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
            }),
        ]);
        return (0, pagination_dto_1.buildPaginatedResponse)(results, total, page, limit);
    }
    async findOne(resultId) {
        const result = await this.prisma.embassyResult.findUnique({
            where: { result_id: BigInt(resultId) },
            include: {
                booking: {
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
                    },
                },
                passport: { include: { passport_images: true } },
            },
        });
        if (!result)
            throw new common_1.NotFoundException('Embassy result not found');
        return result;
    }
    async getStats() {
        const [total, pending, approved, rejected] = await Promise.all([
            this.prisma.embassyResult.count(),
            this.prisma.embassyResult.count({
                where: { embassy_status: enums_1.EmbassyStatus.PENDING },
            }),
            this.prisma.embassyResult.count({
                where: { embassy_status: enums_1.EmbassyStatus.APPROVED },
            }),
            this.prisma.embassyResult.count({
                where: { embassy_status: enums_1.EmbassyStatus.REJECTED },
            }),
        ]);
        const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
        const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;
        return {
            total,
            pending,
            approved,
            rejected,
            approvalRate,
            rejectionRate,
        };
    }
    buildWhereClause(filters, search) {
        const where = {};
        if (filters.status) {
            where.embassy_status = filters.status;
        }
        if (filters.booking_id) {
            where.booking_id = BigInt(filters.booking_id);
        }
        if (filters.from_date || filters.to_date) {
            where.uploaded_at = {
                ...(filters.from_date && { gte: new Date(filters.from_date) }),
                ...(filters.to_date && { lte: new Date(filters.to_date) }),
            };
        }
        if (search) {
            where.OR = [
                {
                    passport: {
                        OR: [
                            { passport_number: { contains: search, mode: 'insensitive' } },
                            { full_name_en: { contains: search, mode: 'insensitive' } },
                            { full_name_ar: { contains: search, mode: 'insensitive' } },
                        ],
                    },
                },
                {
                    booking: {
                        user: {
                            OR: [
                                { full_name: { contains: search, mode: 'insensitive' } },
                                { email: { contains: search, mode: 'insensitive' } },
                            ],
                        },
                    },
                },
            ];
        }
        return where;
    }
};
exports.EmbassyService = EmbassyService;
exports.EmbassyService = EmbassyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmbassyService);
//# sourceMappingURL=embassy.service.js.map