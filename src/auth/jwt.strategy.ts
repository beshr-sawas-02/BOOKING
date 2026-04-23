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
      const admin = await (this.prisma as any).admin.findUnique({
        where: { admin_id: BigInt(payload.sub) },
      });
      if (!admin) throw new UnauthorizedException();
      const { password, ...rest } = admin;
      return { ...rest, admin_id: rest.admin_id.toString(), role: 'admin' };
    }

    const user = await (this.prisma as any).user.findUnique({
      where: { user_id: BigInt(payload.sub) },
    });
    if (!user) throw new UnauthorizedException();
    const { password, ...rest } = user;
    return { ...rest, user_id: rest.user_id.toString(), role: 'user' };
  }
}
