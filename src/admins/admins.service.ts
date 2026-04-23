import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminsService {
  constructor(private prisma: PrismaService) {}

  private db(): any { return this.prisma as any; }

  async create(dto: CreateAdminDto) {
    const existing = await this.db().admin.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');
    const hashed = await bcrypt.hash(dto.password, 10);
    const admin = await this.db().admin.create({ data: { ...dto, password: hashed } });
    const { password, ...result } = admin;
    return { ...result, admin_id: result.admin_id.toString() };
  }

  async findAll() {
    return this.db().admin.findMany({
      select: {
        admin_id: true, full_name: true, email: true,
        role: true, last_login: true, created_at: true,
      },
    });
  }

  async findOne(id: number) {
    const admin = await this.db().admin.findUnique({
      where: { admin_id: BigInt(id) },
      select: {
        admin_id: true, full_name: true, email: true,
        role: true, last_login: true, created_at: true,
      },
    });
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async getDashboardStats() {
    const [totalUsers, totalBookings, pendingBookings, totalPackages] = await Promise.all([
      this.db().user.count(),
      this.db().booking.count(),
      this.db().booking.count({ where: { booking_status: 'PENDING' } }),
      this.db().package.count(),
    ]);

    const bookingsByStatus = await this.db().booking.groupBy({
      by: ['booking_status'],
      _count: { booking_status: true },
    });

    const pendingPassports = await this.db().passport.count({
      where: { verified_by_admin: false },
    });

    const pendingEmbassy = await this.db().embassyResult.count({
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
