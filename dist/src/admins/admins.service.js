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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcryptjs"));
const stats_query_dto_1 = require("./dto/stats-query.dto");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let AdminsService = class AdminsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        const existing = await this.prisma.admin.findUnique({
            where: { email: dto.email },
        });
        if (existing)
            throw new common_1.ConflictException('Email already in use');
        const hashed = await bcrypt.hash(dto.password, 10);
        const admin = await this.prisma.admin.create({
            data: { ...dto, password: hashed },
        });
        const { password, ...result } = admin;
        return { ...result, admin_id: result.admin_id.toString() };
    }
    async findAll(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const search = query.search?.trim();
        const where = search
            ? {
                OR: [
                    { email: { contains: search, mode: 'insensitive' } },
                    { full_name: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        const { skip, take } = (0, pagination_dto_1.getPaginationParams)(page, limit);
        const [total, admins] = await Promise.all([
            this.prisma.admin.count({ where }),
            this.prisma.admin.findMany({
                where,
                skip,
                take,
                select: {
                    admin_id: true,
                    full_name: true,
                    email: true,
                    role: true,
                    is_active: true,
                    last_login: true,
                    created_at: true,
                },
                orderBy: { created_at: 'desc' },
            }),
        ]);
        const data = admins.map((a) => ({
            ...a,
            admin_id: a.admin_id.toString(),
        }));
        return (0, pagination_dto_1.buildPaginatedResponse)(data, total, page, limit);
    }
    async findOne(id) {
        const admin = await this.prisma.admin.findUnique({
            where: { admin_id: BigInt(id) },
            select: {
                admin_id: true,
                full_name: true,
                email: true,
                role: true,
                is_active: true,
                last_login: true,
                created_at: true,
            },
        });
        if (!admin)
            throw new common_1.NotFoundException('Admin not found');
        return { ...admin, admin_id: admin.admin_id.toString() };
    }
    async toggleActive(id, currentAdminId) {
        if (id.toString() === currentAdminId) {
            throw new common_1.BadRequestException('لا يمكنك تعطيل حسابك بنفسك');
        }
        const target = await this.prisma.admin.findUnique({
            where: { admin_id: BigInt(id) },
        });
        if (!target)
            throw new common_1.NotFoundException('Admin not found');
        if (target.role === 'SUPER_ADMIN' && target.is_active) {
            const activeSuperAdmins = await this.prisma.admin.count({
                where: { role: 'SUPER_ADMIN', is_active: true },
            });
            if (activeSuperAdmins <= 1) {
                throw new common_1.BadRequestException('لا يمكن تعطيل آخر Super Admin في النظام');
            }
        }
        const updated = await this.prisma.admin.update({
            where: { admin_id: BigInt(id) },
            data: { is_active: !target.is_active },
            select: {
                admin_id: true,
                full_name: true,
                email: true,
                role: true,
                is_active: true,
            },
        });
        return {
            ...updated,
            admin_id: updated.admin_id.toString(),
            message: updated.is_active
                ? 'تم تفعيل الأدمن بنجاح'
                : 'تم تعطيل الأدمن بنجاح',
        };
    }
    async remove(id, currentAdminId) {
        if (id.toString() === currentAdminId) {
            throw new common_1.BadRequestException('لا يمكنك حذف حسابك بنفسك');
        }
        const target = await this.prisma.admin.findUnique({
            where: { admin_id: BigInt(id) },
        });
        if (!target)
            throw new common_1.NotFoundException('Admin not found');
        if (target.role === 'SUPER_ADMIN') {
            const superAdminsCount = await this.prisma.admin.count({
                where: { role: 'SUPER_ADMIN' },
            });
            if (superAdminsCount <= 1) {
                throw new common_1.BadRequestException('لا يمكن حذف آخر Super Admin في النظام');
            }
        }
        await this.prisma.admin.delete({ where: { admin_id: BigInt(id) } });
        return { message: 'تم حذف الأدمن بنجاح' };
    }
    async getDashboardStats() {
        const [totalUsers, activeUsers, totalBookings, pendingBookings, confirmedBookings, totalPackages, pendingPassports, pendingEmbassy, pendingFamilyProofs,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { is_active: true } }),
            this.prisma.booking.count(),
            this.prisma.booking.count({ where: { booking_status: 'PENDING' } }),
            this.prisma.booking.count({ where: { booking_status: 'CONFIRMED' } }),
            this.prisma.package.count(),
            this.prisma.passport.count({ where: { verified_by_admin: false } }),
            this.prisma.embassyResult.count({
                where: { embassy_status: 'PENDING' },
            }),
            this.prisma.familyProofDocument.count({
                where: { verification_status: 'PENDING' },
            }),
        ]);
        const bookingsByStatus = await this.prisma.booking.groupBy({
            by: ['booking_status'],
            _count: { booking_status: true },
        });
        return {
            users: { total: totalUsers, active: activeUsers },
            bookings: {
                total: totalBookings,
                pending: pendingBookings,
                confirmed: confirmedBookings,
                byStatus: bookingsByStatus.map((b) => ({
                    status: b.booking_status,
                    count: b._count.booking_status,
                })),
            },
            packages: totalPackages,
            pending: {
                passports: pendingPassports,
                embassy: pendingEmbassy,
                familyProofs: pendingFamilyProofs,
            },
        };
    }
    async getStatsComparison() {
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
        const [thisMonthUsers, lastMonthUsers, thisMonthBookings, lastMonthBookings, thisMonthRevenue, lastMonthRevenue,] = await Promise.all([
            this.prisma.user.count({
                where: { created_at: { gte: startOfThisMonth } },
            }),
            this.prisma.user.count({
                where: {
                    created_at: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
            }),
            this.prisma.booking.count({
                where: { created_at: { gte: startOfThisMonth } },
            }),
            this.prisma.booking.count({
                where: {
                    created_at: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
            }),
            this.prisma.booking.aggregate({
                where: {
                    created_at: { gte: startOfThisMonth },
                    booking_status: { in: ['CONFIRMED', 'COMPLETED'] },
                },
                _sum: { total_price: true },
            }),
            this.prisma.booking.aggregate({
                where: {
                    created_at: { gte: startOfLastMonth, lte: endOfLastMonth },
                    booking_status: { in: ['CONFIRMED', 'COMPLETED'] },
                },
                _sum: { total_price: true },
            }),
        ]);
        const thisRevenue = Number(thisMonthRevenue._sum.total_price ?? 0);
        const lastRevenue = Number(lastMonthRevenue._sum.total_price ?? 0);
        return {
            users: {
                current: thisMonthUsers,
                previous: lastMonthUsers,
                change: this.calcChange(thisMonthUsers, lastMonthUsers),
            },
            bookings: {
                current: thisMonthBookings,
                previous: lastMonthBookings,
                change: this.calcChange(thisMonthBookings, lastMonthBookings),
            },
            revenue: {
                current: thisRevenue,
                previous: lastRevenue,
                change: this.calcChange(thisRevenue, lastRevenue),
            },
        };
    }
    async getUsersGrowth(period) {
        return this.getGrowthData('users', period);
    }
    async getBookingsGrowth(period) {
        return this.getGrowthData('bookings', period);
    }
    calcChange(current, previous) {
        if (previous === 0)
            return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100 * 10) / 10;
    }
    async getGrowthData(table, period) {
        const periodMap = {
            [stats_query_dto_1.GrowthPeriod.DAILY]: 'day',
            [stats_query_dto_1.GrowthPeriod.WEEKLY]: 'week',
            [stats_query_dto_1.GrowthPeriod.MONTHLY]: 'month',
        };
        const intervalMap = {
            [stats_query_dto_1.GrowthPeriod.DAILY]: '12 days',
            [stats_query_dto_1.GrowthPeriod.WEEKLY]: '12 weeks',
            [stats_query_dto_1.GrowthPeriod.MONTHLY]: '12 months',
        };
        const truncUnit = periodMap[period];
        const interval = intervalMap[period];
        const sql = `
      SELECT
        date_trunc('${truncUnit}', created_at) AS period,
        COUNT(*)::bigint AS count
      FROM ${table}
      WHERE created_at >= NOW() - INTERVAL '${interval}'
      GROUP BY period
      ORDER BY period ASC
    `;
        const results = (await this.prisma.$queryRawUnsafe(sql));
        return results.map((r) => ({
            period: r.period.toISOString(),
            count: Number(r.count),
        }));
    }
};
exports.AdminsService = AdminsService;
exports.AdminsService = AdminsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminsService);
//# sourceMappingURL=admins.service.js.map