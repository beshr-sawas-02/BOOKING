import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'default-secret'),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    if (payload.role === 'admin') {
      const admin = await this.prisma.admin.findUnique({
        where: { admin_id: BigInt(payload.sub) },
      });
      if (!admin) throw new UnauthorizedException();

      // ✨ التحقق من أن الأدمن مفعّل
      if (!admin.is_active) {
        throw new UnauthorizedException('تم تعطيل هذا الحساب');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...rest } = admin;
      return {
        ...rest,
        admin_id: rest.admin_id.toString(),
        role: 'admin',           // JWT role (للـ RolesGuard)
        admin_role: rest.role,   // الـ role الفعلي (SUPER_ADMIN/ADMIN) للـ SuperAdminGuard
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { user_id: BigInt(payload.sub) },
    });
    if (!user) throw new UnauthorizedException();

    // ✨ التحقق من أن المستخدم مفعّل
    if (!user.is_active) {
      throw new UnauthorizedException('تم تعطيل هذا الحساب');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...rest } = user;
    return { ...rest, user_id: rest.user_id.toString(), role: 'user' };
  }
}