import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAdminDto) {
    const existing = await this.prisma.admin.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(dto.password, 10);
    const admin = await this.prisma.admin.create({
      data: { ...dto, password: hashed },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = admin;
    return { ...result, admin_id: result.admin_id.toString() };
  }

  async findAll() {
    const admins = await this.prisma.admin.findMany({
      select: {
        admin_id: true,
        full_name: true,
        email: true,
        role: true,
        last_login: true,
        created_at: true,
      },
    });
    return admins.map((a) => ({ ...a, admin_id: a.admin_id.toString() }));
  }

  async findOne(id: number) {
    const admin = await this.prisma.admin.findUnique({
      where: { admin_id: BigInt(id) },
      select: {
        admin_id: true,
        full_name: true,
        email: true,
        role: true,
        last_login: true,
        created_at: true,
      },
    });
    if (!admin) throw new NotFoundException('Admin not found');
    return { ...admin, admin_id: admin.admin_id.toString() };
  }

  async getDashboardStats() {
    const [totalUsers, totalBookings, pendingBookings, totalPackages] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.booking.count(),
        this.prisma.booking.count({ where: { booking_status: 'PENDING' } }),
        this.prisma.package.count(),
      ]);

    const bookingsByStatus = await this.prisma.booking.groupBy({
      by: ['booking_status'],
      _count: { booking_status: true },
    });

    const pendingPassports = await this.prisma.passport.count({
      where: { verified_by_admin: false },
    });

    const pendingEmbassy = await this.prisma.embassyResult.count({
      where: { embassy_status: 'PENDING' },
    });

    return {
      totalUsers,
      totalBookings,
      pendingBookings,
      totalPackages,
      pendingPassports,
      pendingEmbassy,
      bookingsByStatus,
    };
  }
}
