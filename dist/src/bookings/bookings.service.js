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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const enums_1 = require("../common/enums");
const pagination_dto_1 = require("../common/dto/pagination.dto");
const mahram_validator_1 = require("./validators/mahram.validator");
let BookingsService = class BookingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    mahramValidator = new mahram_validator_1.MahramValidator();
    async create(userId, dto) {
        const pkg = await this.prisma.package.findUnique({
            where: { package_id: BigInt(dto.package_id) },
        });
        if (!pkg)
            throw new common_1.NotFoundException('Package not found');
        const totalParticipants = dto.participants.length + 1;
        if (totalParticipants > pkg.max_participants) {
            throw new common_1.BadRequestException(`الحد الأقصى للمشاركين في هذه الباقة هو ${pkg.max_participants}`);
        }
        const warnings = [];
        if (pkg.package_type === 'HAJJ') {
            const companions = dto.participants
                .filter((p) => !p.is_primary)
                .map((p) => ({
                relation_type: p.relation_type,
                gender: p.gender || mahram_validator_1.Gender.MALE,
                age: p.date_of_birth ? (0, mahram_validator_1.calcAge)(p.date_of_birth) : undefined,
            }));
            const primaryGender = dto.primary_gender;
            const primaryAge = dto.primary_date_of_birth
                ? (0, mahram_validator_1.calcAge)(dto.primary_date_of_birth)
                : undefined;
            if (this.mahramValidator.isForbiddenCombination({ gender: primaryGender, age: primaryAge }, companions)) {
                throw new common_1.BadRequestException('هذه التركيبة من المرافقين غير مسموح بها وفق قرار تسجيل الحجاج السوريين');
            }
            const validationResult = this.mahramValidator.validate({ gender: primaryGender, age: primaryAge }, companions);
            if (!validationResult.valid) {
                throw new common_1.BadRequestException({
                    message: 'المرافقون لا يستوفون شروط المحارم',
                    errors: validationResult.errors,
                    warnings: validationResult.warnings,
                });
            }
            warnings.push(...(validationResult.warnings || []));
        }
        const hasPrimary = dto.participants.some((p) => p.is_primary);
        if (!hasPrimary)
            dto.participants[0].is_primary = true;
        const totalPrice = Number(pkg.price_per_person) * dto.participants.length;
        const booking = await this.prisma.booking.create({
            data: {
                user_id: BigInt(userId),
                package_id: BigInt(dto.package_id),
                total_price: totalPrice,
                deposit_due_date: dto.deposit_due_date
                    ? new Date(dto.deposit_due_date)
                    : undefined,
                final_payment_due_date: dto.final_payment_due_date
                    ? new Date(dto.final_payment_due_date)
                    : undefined,
                trip_end_date: dto.trip_end_date
                    ? new Date(dto.trip_end_date)
                    : undefined,
                booking_participants: {
                    create: dto.participants.map((p) => ({
                        full_name: p.full_name,
                        relation_type: p.relation_type,
                        is_primary: p.is_primary ?? false,
                        user_id: p.is_primary ? BigInt(userId) : undefined,
                    })),
                },
            },
            include: {
                booking_participants: true,
                package: true,
            },
        });
        return { ...booking, warnings };
    }
    async findAll(filters) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 10;
        const search = filters.search?.trim();
        const where = this.buildWhereClause(filters, search);
        const { skip, take } = (0, pagination_dto_1.getPaginationParams)(page, limit);
        const [total, bookings] = await Promise.all([
            this.prisma.booking.count({ where }),
            this.prisma.booking.findMany({
                where,
                skip,
                take,
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
                            duration_days: true,
                        },
                    },
                    booking_participants: {
                        select: {
                            participant_id: true,
                            full_name: true,
                            relation_type: true,
                            is_primary: true,
                            passport_id: true,
                            passport: {
                                select: {
                                    passport_id: true,
                                    verified_by_admin: true,
                                    rejection_reason: true,
                                },
                            },
                        },
                    },
                    family_proof_documents: {
                        select: {
                            document_id: true,
                            verification_status: true,
                        },
                    },
                    embassy_results: {
                        select: {
                            result_id: true,
                            embassy_status: true,
                        },
                    },
                    _count: {
                        select: {
                            booking_participants: true,
                            embassy_results: true,
                            family_proof_documents: true,
                        },
                    },
                },
                orderBy: { created_at: 'desc' },
            }),
        ]);
        return (0, pagination_dto_1.buildPaginatedResponse)(bookings, total, page, limit);
    }
    async findMyBookings(userId, filters) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 10;
        const where = {
            user_id: BigInt(userId),
            ...(filters.status && { booking_status: filters.status }),
        };
        const { skip, take } = (0, pagination_dto_1.getPaginationParams)(page, limit);
        const [total, bookings] = await Promise.all([
            this.prisma.booking.count({ where }),
            this.prisma.booking.findMany({
                where,
                skip,
                take,
                include: {
                    package: true,
                    booking_participants: {
                        include: { passport: true, family_proof: true },
                    },
                    embassy_results: true,
                    review: true,
                },
                orderBy: { created_at: 'desc' },
            }),
        ]);
        return (0, pagination_dto_1.buildPaginatedResponse)(bookings, total, page, limit);
    }
    async findOne(id) {
        const booking = await this.prisma.booking.findUnique({
            where: { booking_id: BigInt(id) },
            include: {
                user: {
                    select: {
                        user_id: true,
                        full_name: true,
                        email: true,
                        phone_number: true,
                        is_active: true,
                    },
                },
                package: {
                    include: { package_hotels: { include: { hotel: true } } },
                },
                booking_participants: {
                    include: {
                        passport: { include: { passport_images: true } },
                        family_proof: true,
                    },
                    orderBy: { is_primary: 'desc' },
                },
                embassy_results: {
                    include: {
                        passport: {
                            select: {
                                passport_id: true,
                                full_name_en: true,
                                full_name_ar: true,
                                passport_number: true,
                            },
                        },
                    },
                },
                family_proof_documents: {
                    include: {
                        uploader: {
                            select: { user_id: true, full_name: true, email: true },
                        },
                    },
                },
                review: true,
            },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const workflow = this.computeWorkflowStatus(booking);
        return { ...booking, workflow };
    }
    computeWorkflowStatus(booking) {
        const participants = booking.booking_participants || [];
        const docs = booking.family_proof_documents || [];
        const embassyResults = booking.embassy_results || [];
        const passportsTotal = participants.length;
        const passportsUploaded = participants.filter((p) => p.passport).length;
        const passportsVerified = participants.filter((p) => p.passport?.verified_by_admin === true).length;
        const passportsRejected = participants.filter((p) => p.passport?.rejection_reason !== null && p.passport?.rejection_reason !== undefined).length;
        const passportsPending = participants.filter((p) => p.passport &&
            !p.passport.verified_by_admin &&
            !p.passport.rejection_reason).length;
        const docsTotal = docs.length;
        const docsApproved = docs.filter((d) => d.verification_status === 'APPROVED').length;
        const docsRejected = docs.filter((d) => d.verification_status === 'REJECTED').length;
        const docsPending = docs.filter((d) => d.verification_status === 'PENDING').length;
        const embassyTotal = embassyResults.length;
        const embassyApproved = embassyResults.filter((e) => e.embassy_status === 'APPROVED').length;
        const embassyRejected = embassyResults.filter((e) => e.embassy_status === 'REJECTED').length;
        const embassyPending = embassyResults.filter((e) => e.embassy_status === 'PENDING').length;
        const allPassportsVerified = passportsTotal > 0 &&
            passportsUploaded === passportsTotal &&
            passportsVerified === passportsTotal;
        const allDocsApproved = docsTotal === 0 ||
            (docsTotal > 0 && docsApproved === docsTotal);
        const canConfirmBooking = booking.booking_status === 'PENDING' &&
            allPassportsVerified &&
            allDocsApproved;
        const canSendToEmbassy = booking.booking_status === 'CONFIRMED' &&
            passportsVerified > 0 &&
            embassyTotal === 0;
        const canCompleteBooking = booking.booking_status === 'CONFIRMED';
        const suggestions = [];
        if (passportsTotal > 0 && passportsRejected === passportsTotal) {
            suggestions.push('كل الجوازات مرفوضة، يُنصح برفض الحجز أو طلب جوازات جديدة من المستخدم');
        }
        if (docsTotal > 0 && docsRejected === docsTotal) {
            suggestions.push('كل الوثائق مرفوضة، يُنصح برفض الحجز أو طلب وثائق جديدة');
        }
        if (embassyTotal > 0 && embassyRejected === embassyTotal) {
            suggestions.push('السفارة رفضت جميع الجوازات، يُنصح برفض الحجز كاملاً');
        }
        return {
            passports: {
                total: passportsTotal,
                uploaded: passportsUploaded,
                verified: passportsVerified,
                rejected: passportsRejected,
                pending: passportsPending,
            },
            documents: {
                total: docsTotal,
                approved: docsApproved,
                rejected: docsRejected,
                pending: docsPending,
            },
            embassy: {
                total: embassyTotal,
                approved: embassyApproved,
                rejected: embassyRejected,
                pending: embassyPending,
            },
            canConfirmBooking,
            canSendToEmbassy,
            canCompleteBooking,
            suggestions,
            blockReasons: this.getBlockReasons(booking.booking_status, passportsTotal, passportsUploaded, passportsVerified, passportsPending, passportsRejected, docsTotal, docsApproved, docsPending, docsRejected),
        };
    }
    getBlockReasons(status, pTotal, pUploaded, pVerified, pPending, pRejected, dTotal, dApproved, dPending, dRejected) {
        if (status !== 'PENDING')
            return [];
        const reasons = [];
        if (pTotal === 0) {
            reasons.push('لا يوجد مشاركون في الحجز');
        }
        if (pUploaded < pTotal) {
            reasons.push(`${pTotal - pUploaded} مشارك لم يرفع جوازه بعد`);
        }
        if (pPending > 0) {
            reasons.push(`${pPending} جواز بانتظار المراجعة`);
        }
        if (pRejected > 0) {
            reasons.push(`${pRejected} جواز مرفوض - يجب طلب صور جديدة`);
        }
        if (dPending > 0) {
            reasons.push(`${dPending} وثيقة عائلية بانتظار المراجعة`);
        }
        if (dRejected > 0) {
            reasons.push(`${dRejected} وثيقة عائلية مرفوضة`);
        }
        return reasons;
    }
    async updateStatus(id, dto) {
        const booking = await this.findOne(id);
        const validTransitions = {
            [enums_1.BookingStatus.PENDING]: [
                enums_1.BookingStatus.CONFIRMED,
                enums_1.BookingStatus.REJECTED,
                enums_1.BookingStatus.CANCELLED,
            ],
            [enums_1.BookingStatus.CONFIRMED]: [
                enums_1.BookingStatus.COMPLETED,
                enums_1.BookingStatus.CANCELLED,
            ],
            [enums_1.BookingStatus.REJECTED]: [],
            [enums_1.BookingStatus.CANCELLED]: [],
            [enums_1.BookingStatus.COMPLETED]: [],
        };
        if (!validTransitions[booking.booking_status].includes(dto.booking_status)) {
            throw new common_1.BadRequestException(`لا يمكن التحول من ${booking.booking_status} إلى ${dto.booking_status}`);
        }
        if (dto.booking_status === enums_1.BookingStatus.CONFIRMED) {
            const workflow = booking.workflow;
            if (!workflow?.canConfirmBooking) {
                throw new common_1.BadRequestException({
                    message: 'لا يمكن قبول الحجز قبل اكتمال مراجعة الجوازات والوثائق',
                    reasons: workflow?.blockReasons || [],
                });
            }
        }
        if (dto.booking_status === enums_1.BookingStatus.REJECTED) {
            const reason = dto.rejection_reason || dto.reason;
            if (!reason || !reason.trim()) {
                throw new common_1.BadRequestException('سبب الرفض مطلوب');
            }
        }
        return this.prisma.booking.update({
            where: { booking_id: BigInt(id) },
            data: { booking_status: dto.booking_status },
            include: {
                user: { select: { full_name: true, email: true } },
                package: { select: { package_title: true } },
            },
        });
    }
    async cancel(id, userId) {
        const booking = await this.findOne(id);
        if (booking.user_id.toString() !== userId.toString()) {
            throw new common_1.ForbiddenException('ليس حجزك');
        }
        if (booking.booking_status !== enums_1.BookingStatus.PENDING &&
            booking.booking_status !== enums_1.BookingStatus.CONFIRMED) {
            throw new common_1.BadRequestException('لا يمكن إلغاء هذا الحجز');
        }
        return this.prisma.booking.update({
            where: { booking_id: BigInt(id) },
            data: { booking_status: enums_1.BookingStatus.CANCELLED },
        });
    }
    async updateByUser(bookingId, userId, dto) {
        const booking = await this.prisma.booking.findUnique({
            where: { booking_id: BigInt(bookingId) },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.user_id.toString() !== userId.toString())
            throw new common_1.ForbiddenException('ليس حجزك');
        if (booking.booking_status !== enums_1.BookingStatus.PENDING)
            throw new common_1.BadRequestException('لا يمكن تعديل الحجز بعد مراجعته من الأدمن');
        return this.prisma.booking.update({
            where: { booking_id: BigInt(bookingId) },
            data: {
                trip_end_date: dto.trip_end_date
                    ? new Date(dto.trip_end_date)
                    : undefined,
                deposit_due_date: dto.deposit_due_date
                    ? new Date(dto.deposit_due_date)
                    : undefined,
                final_payment_due_date: dto.final_payment_due_date
                    ? new Date(dto.final_payment_due_date)
                    : undefined,
            },
        });
    }
    buildWhereClause(filters, search) {
        const where = {};
        if (filters.status) {
            where.booking_status = filters.status;
        }
        if (filters.package_type) {
            where.package = { package_type: filters.package_type };
        }
        if (filters.from_date || filters.to_date) {
            where.created_at = {
                ...(filters.from_date && { gte: new Date(filters.from_date) }),
                ...(filters.to_date && { lte: new Date(filters.to_date) }),
            };
        }
        if (search) {
            where.OR = [
                { user: { full_name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { user: { phone_number: { contains: search, mode: 'insensitive' } } },
                {
                    package: {
                        package_title: { contains: search, mode: 'insensitive' },
                    },
                },
            ];
        }
        return where;
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map