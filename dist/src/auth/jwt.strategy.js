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
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
let JwtStrategy = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    prisma;
    config;
    constructor(prisma, config) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get('JWT_SECRET', 'default-secret'),
        });
        this.prisma = prisma;
        this.config = config;
    }
    async validate(payload) {
        if (payload.role === 'admin') {
            const admin = await this.prisma.admin.findUnique({
                where: { admin_id: BigInt(payload.sub) },
            });
            if (!admin)
                throw new common_1.UnauthorizedException();
            if (!admin.is_active) {
                throw new common_1.UnauthorizedException('تم تعطيل هذا الحساب');
            }
            const { password, ...rest } = admin;
            return {
                ...rest,
                admin_id: rest.admin_id.toString(),
                role: 'admin',
                admin_role: rest.role,
            };
        }
        const user = await this.prisma.user.findUnique({
            where: { user_id: BigInt(payload.sub) },
        });
        if (!user)
            throw new common_1.UnauthorizedException();
        if (!user.is_active) {
            throw new common_1.UnauthorizedException('تم تعطيل هذا الحساب');
        }
        const { password, ...rest } = user;
        return { ...rest, user_id: rest.user_id.toString(), role: 'user' };
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map