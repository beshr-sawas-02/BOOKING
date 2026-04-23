import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private db(): any {
    return this.prisma as any;
  }

  async registerUser(dto: RegisterDto) {
    const existing = await this.db().user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.db().user.create({ data: { ...dto, password: hashed } });

    const token = this.jwtService.sign({
      sub: user.user_id.toString(),
      email: user.email,
      role: 'user',
    });
    const { password, ...result } = user;
    return { access_token: token, user: { ...result, user_id: result.user_id.toString() } };
  }

  async loginUser(dto: LoginDto) {
    const user = await this.db().user.findUnique({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password)))
      throw new UnauthorizedException('Invalid credentials');

    const token = this.jwtService.sign({
      sub: user.user_id.toString(),
      email: user.email,
      role: 'user',
    });
    const { password, ...result } = user;
    return { access_token: token, user: { ...result, user_id: result.user_id.toString() } };
  }

  async loginAdmin(dto: LoginDto) {
    const admin = await this.db().admin.findUnique({ where: { email: dto.email } });
    if (!admin || !(await bcrypt.compare(dto.password, admin.password)))
      throw new UnauthorizedException('Invalid credentials');

    await this.db().admin.update({
      where: { admin_id: admin.admin_id },
      data: { last_login: new Date() },
    });

    const token = this.jwtService.sign({
      sub: admin.admin_id.toString(),
      email: admin.email,
      role: 'admin',
    });
    const { password, ...result } = admin;
    return { access_token: token, admin: { ...result, admin_id: result.admin_id.toString() } };
  }
}
