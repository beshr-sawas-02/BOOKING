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
let EmbassyService = class EmbassyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    db() { return this.prisma; }
    async submitBookingToEmbassy(bookingId) {
        const booking = await this.db().booking.findUnique({
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
            .filter((p) => p && p.verified_by_admin && !p.sent_to_embassy);
        if (passports.length === 0) {
            throw new common_1.BadRequestException('No verified unsubmitted passports found');
        }
        const createResults = passports.map((p) => this.db().embassyResult.create({
            data: {
                booking_id: BigInt(bookingId),
                passport_id: p.passport_id,
                embassy_status: enums_1.EmbassyStatus.PENDING,
            },
        }));
        const markSent = passports.map((p) => this.db().passport.update({
            where: { passport_id: p.passport_id },
            data: { sent_to_embassy: true },
        }));
        const results = await this.prisma.$transaction([...createResults, ...markSent]);
        return {
            message: `Submitted ${passports.length} passport(s) to embassy`,
            results: results.slice(0, passports.length),
        };
    }
    async updateResult(resultId, dto) {
        const result = await this.db().embassyResult.findUnique({
            where: { result_id: BigInt(resultId) },
        });
        if (!result)
            throw new common_1.NotFoundException('Embassy result not found');
        return this.db().embassyResult.update({
            where: { result_id: BigInt(resultId) },
            data: dto,
            include: { booking: true, passport: true },
        });
    }
    async findByBooking(bookingId) {
        return this.db().embassyResult.findMany({
            where: { booking_id: BigInt(bookingId) },
            include: {
                passport: {
                    select: {
                        passport_id: true, full_name_en: true, full_name_ar: true,
                        passport_number: true, nationality: true,
                    },
                },
            },
            orderBy: { uploaded_at: 'desc' },
        });
    }
    async findAll(status) {
        return this.db().embassyResult.findMany({
            where: status ? { embassy_status: status } : undefined,
            include: {
                booking: { include: { user: { select: { full_name: true, email: true } } } },
                passport: { select: { full_name_en: true, passport_number: true } },
            },
            orderBy: { uploaded_at: 'desc' },
        });
    }
    async getStats() {
        const [total, pending, approved, rejected] = await Promise.all([
            this.db().embassyResult.count(),
            this.db().embassyResult.count({ where: { embassy_status: 'PENDING' } }),
            this.db().embassyResult.count({ where: { embassy_status: 'APPROVED' } }),
            this.db().embassyResult.count({ where: { embassy_status: 'REJECTED' } }),
        ]);
        return { total, pending, approved, rejected };
    }
};
exports.EmbassyService = EmbassyService;
exports.EmbassyService = EmbassyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EmbassyService);
//# sourceMappingURL=embassy.service.js.map