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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const pagination_dto_1 = require("../common/dto/pagination.dto");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
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
                    { phone_number: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        const { skip, take } = (0, pagination_dto_1.getPaginationParams)(page, limit);
        const [total, users] = await Promise.all([
            this.prisma.user.count({ where }),
            this.prisma.user.findMany({
                where,
                skip,
                take,
                select: {
                    user_id: true,
                    email: true,
                    full_name: true,
                    phone_number: true,
                    email_verified: true,
                    is_active: true,
                    created_at: true,
                    _count: { select: { bookings: true } },
                },
                orderBy: { created_at: 'desc' },
            }),
        ]);
        const data = users.map((u) => ({
            ...u,
            user_id: u.user_id.toString(),
        }));
        return (0, pagination_dto_1.buildPaginatedResponse)(data, total, page, limit);
    }
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { user_id: BigInt(id) },
            select: {
                user_id: true,
                email: true,
                full_name: true,
                phone_number: true,
                email_verified: true,
                is_active: true,
                created_at: true,
                updated_at: true,
                _count: {
                    select: {
                        bookings: true,
                        passports: true,
                        family_proof_documents: true,
                    },
                },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return { ...user, user_id: user.user_id.toString() };
    }
    async update(id, dto) {
        await this.findOne(id);
        const user = await this.prisma.user.update({
            where: { user_id: BigInt(id) },
            data: dto,
            select: {
                user_id: true,
                email: true,
                full_name: true,
                phone_number: true,
                is_active: true,
                updated_at: true,
            },
        });
        return { ...user, user_id: user.user_id.toString() };
    }
    async toggleActive(id) {
        const current = await this.prisma.user.findUnique({
            where: { user_id: BigInt(id) },
            select: { is_active: true },
        });
        if (!current)
            throw new common_1.NotFoundException('User not found');
        const updated = await this.prisma.user.update({
            where: { user_id: BigInt(id) },
            data: { is_active: !current.is_active },
            select: {
                user_id: true,
                email: true,
                full_name: true,
                is_active: true,
            },
        });
        return {
            ...updated,
            user_id: updated.user_id.toString(),
            message: updated.is_active
                ? 'تم تفعيل الحساب بنجاح'
                : 'تم تعطيل الحساب بنجاح',
        };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { user_id: BigInt(userId) },
            select: {
                user_id: true,
                email: true,
                full_name: true,
                phone_number: true,
                email_verified: true,
                is_active: true,
                created_at: true,
                _count: { select: { bookings: true, passports: true } },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return { ...user, user_id: user.user_id.toString() };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map