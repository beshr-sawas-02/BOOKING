"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmbassyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmbassyService = void 0;
const common_1 = require("@nestjs/common");
const XLSX = __importStar(require("xlsx"));
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
const enums_1 = require("../common/enums");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let EmbassyService = EmbassyService_1 = class EmbassyService {
    prisma;
    notificationsService;
    logger = new common_1.Logger(EmbassyService_1.name);
    constructor(prisma, notificationsService) {
        this.prisma = prisma;
        this.notificationsService = notificationsService;
    }
    async uploadEmbassyExcel(file) {
        if (!file) {
            throw new common_1.BadRequestException('ملف Excel مطلوب');
        }
        const rows = this.parseExcelFile(file);
        if (rows.length === 0) {
            throw new common_1.BadRequestException('الملف فارغ أو الصيغة غير صحيحة');
        }
        this.logger.log(`📊 Excel parsed: ${rows.length} rows`);
        const result = {
            matched: 0,
            approved: 0,
            rejected: 0,
            notMatched: [],
            alreadyProcessed: [],
            errors: [],
        };
        for (const row of rows) {
            try {
                await this.processExcelRow(row, result);
            }
            catch (err) {
                this.logger.error(`Row ${row.rowNumber} error: ${err.message}`);
                result.errors.push({
                    row: row.rowNumber,
                    reason: err.message,
                });
            }
        }
        this.logger.log(`✅ Done: matched=${result.matched}, approved=${result.approved}, rejected=${result.rejected}, notMatched=${result.notMatched.length}`);
        return result;
    }
    parseExcelFile(file) {
        let workbook;
        try {
            workbook = XLSX.read(file.buffer, { type: 'buffer' });
        }
        catch {
            throw new common_1.BadRequestException('فشل في قراءة الملف - تأكد أنه Excel صحيح');
        }
        const firstSheet = workbook.SheetNames[0];
        if (!firstSheet) {
            throw new common_1.BadRequestException('الملف لا يحتوي على أوراق');
        }
        const sheet = workbook.Sheets[firstSheet];
        const data = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: '',
            raw: false,
        });
        if (data.length < 2) {
            throw new common_1.BadRequestException('الملف فارغ - يجب أن يحتوي على هيدر وبيانات على الأقل');
        }
        const rows = [];
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0)
                continue;
            const name = String(row[0] ?? '').trim();
            const status = String(row[1] ?? '').trim();
            const reason = row[2] ? String(row[2]).trim() : undefined;
            if (!name && !status)
                continue;
            rows.push({
                name,
                status,
                reason,
                rowNumber: i + 1,
            });
        }
        return rows;
    }
    async processExcelRow(row, result) {
        if (!row.name) {
            result.errors.push({
                row: row.rowNumber,
                reason: 'الاسم فارغ',
            });
            return;
        }
        const status = this.normalizeStatus(row.status);
        if (!status) {
            result.errors.push({
                row: row.rowNumber,
                reason: `حالة غير معروفة: "${row.status}"`,
            });
            return;
        }
        if (status === enums_1.EmbassyStatus.REJECTED && !row.reason) {
            result.errors.push({
                row: row.rowNumber,
                reason: `الاسم "${row.name}" مرفوض بدون سبب`,
            });
            return;
        }
        const booking = await this.prisma.booking.findFirst({
            where: {
                booking_status: enums_1.BookingStatus.CONFIRMED,
                user: {
                    full_name: {
                        equals: row.name,
                        mode: 'insensitive',
                    },
                },
            },
            include: {
                user: { select: { user_id: true, full_name: true } },
                embassy_result: true,
                package: { select: { package_title: true } },
            },
            orderBy: { created_at: 'desc' },
        });
        if (!booking) {
            result.notMatched.push(row.name);
            return;
        }
        if (booking.embassy_result &&
            booking.embassy_result.embassy_status !== enums_1.EmbassyStatus.PENDING) {
            result.alreadyProcessed.push(row.name);
            return;
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.embassyResult.upsert({
                where: { booking_id: booking.booking_id },
                create: {
                    booking_id: booking.booking_id,
                    embassy_status: status,
                    rejection_reason: status === enums_1.EmbassyStatus.REJECTED ? row.reason : null,
                    matched_name: row.name,
                },
                update: {
                    embassy_status: status,
                    rejection_reason: status === enums_1.EmbassyStatus.REJECTED ? row.reason : null,
                    matched_name: row.name,
                },
            });
            if (status === enums_1.EmbassyStatus.REJECTED) {
                await tx.booking.update({
                    where: { booking_id: booking.booking_id },
                    data: {
                        booking_status: enums_1.BookingStatus.REJECTED,
                        rejection_reason: `رفض من السفارة: ${row.reason}`,
                    },
                });
            }
            await tx.passport.updateMany({
                where: {
                    participant: { booking_id: booking.booking_id },
                    verified_by_admin: true,
                },
                data: { sent_to_embassy: true },
            });
        });
        if (status === enums_1.EmbassyStatus.APPROVED) {
            await this.notificationsService.create({
                userId: booking.user.user_id,
                type: 'EMBASSY_APPROVED',
                title: '🎉 قبلت السفارة طلبك',
                message: `تم قبول طلبك للرحلة "${booking.package.package_title}" من السفارة. مبروك!`,
                relatedId: booking.booking_id,
                relatedType: 'booking',
            });
            result.approved++;
        }
        else {
            await this.notificationsService.create({
                userId: booking.user.user_id,
                type: 'EMBASSY_REJECTED',
                title: '❌ رفضت السفارة طلبك',
                message: `للأسف تم رفض طلبك للرحلة "${booking.package.package_title}" من السفارة. السبب: ${row.reason}`,
                relatedId: booking.booking_id,
                relatedType: 'booking',
            });
            result.rejected++;
        }
        result.matched++;
    }
    normalizeStatus(raw) {
        const normalized = raw.toLowerCase().trim();
        const approvedKeywords = [
            'approved',
            'accepted',
            'accept',
            'مقبول',
            'موافق',
            'قبول',
            'نعم',
            'yes',
            'ok',
            '1',
            'true',
        ];
        const rejectedKeywords = [
            'rejected',
            'reject',
            'denied',
            'مرفوض',
            'رفض',
            'مرفوضة',
            'no',
            '0',
            'false',
        ];
        if (approvedKeywords.some((k) => normalized.includes(k))) {
            return enums_1.EmbassyStatus.APPROVED;
        }
        if (rejectedKeywords.some((k) => normalized.includes(k))) {
            return enums_1.EmbassyStatus.REJECTED;
        }
        return null;
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
                            booking_participants: {
                                select: {
                                    participant_id: true,
                                    full_name: true,
                                    is_primary: true,
                                },
                            },
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
                        booking_participants: {
                            include: { passport: true },
                        },
                    },
                },
            },
        });
        if (!result)
            throw new common_1.NotFoundException('Embassy result not found');
        return result;
    }
    async findByBooking(bookingId) {
        return this.prisma.embassyResult.findUnique({
            where: { booking_id: BigInt(bookingId) },
            include: {
                booking: {
                    include: {
                        user: { select: { full_name: true, email: true } },
                    },
                },
            },
        });
    }
    async updateResult(resultId, dto) {
        const existing = await this.prisma.embassyResult.findUnique({
            where: { result_id: BigInt(resultId) },
            include: {
                booking: {
                    include: {
                        user: { select: { user_id: true, full_name: true } },
                        package: { select: { package_title: true } },
                    },
                },
            },
        });
        if (!existing)
            throw new common_1.NotFoundException('Embassy result not found');
        if (dto.embassy_status === enums_1.EmbassyStatus.REJECTED &&
            (!dto.rejection_reason || !dto.rejection_reason.trim())) {
            throw new common_1.BadRequestException('سبب الرفض مطلوب');
        }
        const updated = await this.prisma.$transaction(async (tx) => {
            const result = await tx.embassyResult.update({
                where: { result_id: BigInt(resultId) },
                data: {
                    embassy_status: dto.embassy_status,
                    notes: dto.notes,
                    rejection_reason: dto.embassy_status === enums_1.EmbassyStatus.REJECTED
                        ? dto.rejection_reason.trim()
                        : null,
                },
            });
            if (dto.embassy_status === enums_1.EmbassyStatus.REJECTED) {
                await tx.booking.update({
                    where: { booking_id: existing.booking_id },
                    data: {
                        booking_status: enums_1.BookingStatus.REJECTED,
                        rejection_reason: `رفض من السفارة: ${dto.rejection_reason}`,
                    },
                });
            }
            return result;
        });
        if (dto.embassy_status === enums_1.EmbassyStatus.APPROVED) {
            await this.notificationsService.create({
                userId: existing.booking.user.user_id,
                type: 'EMBASSY_APPROVED',
                title: '🎉 قبلت السفارة طلبك',
                message: `تم قبول طلبك للرحلة "${existing.booking.package.package_title}" من السفارة.`,
                relatedId: existing.booking_id,
                relatedType: 'booking',
            });
        }
        else if (dto.embassy_status === enums_1.EmbassyStatus.REJECTED) {
            await this.notificationsService.create({
                userId: existing.booking.user.user_id,
                type: 'EMBASSY_REJECTED',
                title: '❌ رفضت السفارة طلبك',
                message: `للأسف تم رفض طلبك للرحلة "${existing.booking.package.package_title}". السبب: ${dto.rejection_reason}`,
                relatedId: existing.booking_id,
                relatedType: 'booking',
            });
        }
        return updated;
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
        if (filters.from_date || filters.to_date) {
            where.uploaded_at = {
                ...(filters.from_date && { gte: new Date(filters.from_date) }),
                ...(filters.to_date && { lte: new Date(filters.to_date) }),
            };
        }
        if (search) {
            where.OR = [
                { matched_name: { contains: search, mode: 'insensitive' } },
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
exports.EmbassyService = EmbassyService = EmbassyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], EmbassyService);
//# sourceMappingURL=embassy.service.js.map