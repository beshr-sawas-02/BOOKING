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
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    db() {
        return this.prisma;
    }
    async findAll() {
        return this.db().user.findMany({
            select: {
                user_id: true,
                email: true,
                full_name: true,
                phone_number: true,
                email_verified: true,
                created_at: true,
                _count: { select: { bookings: true } },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async findOne(id) {
        const user = await this.db().user.findUnique({
            where: { user_id: BigInt(id) },
            select: {
                user_id: true,
                email: true,
                full_name: true,
                phone_number: true,
                email_verified: true,
                created_at: true,
                updated_at: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.db().user.update({
            where: { user_id: BigInt(id) },
            data: dto,
            select: {
                user_id: true,
                email: true,
                full_name: true,
                phone_number: true,
                updated_at: true,
            },
        });
    }
    async getProfile(userId) {
        return this.db().user.findUnique({
            where: { user_id: BigInt(userId) },
            select: {
                user_id: true,
                email: true,
                full_name: true,
                phone_number: true,
                email_verified: true,
                created_at: true,
                _count: { select: { bookings: true, passports: true } },
            },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map