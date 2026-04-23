import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private db(): any { return this.prisma as any; }

  async findAll() {
    return this.db().user.findMany({
      select: {
        user_id: true, email: true, full_name: true, phone_number: true,
        email_verified: true, created_at: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const user = await this.db().user.findUnique({
      where: { user_id: BigInt(id) },
      select: {
        user_id: true, email: true, full_name: true,
        phone_number: true, email_verified: true,
        created_at: true, updated_at: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);
    return this.db().user.update({
      where: { user_id: BigInt(id) },
      data: dto,
      select: {
        user_id: true, email: true, full_name: true,
        phone_number: true, updated_at: true,
      },
    });
  }

  async getProfile(userId: number) {
    return this.db().user.findUnique({
      where: { user_id: BigInt(userId) },
      select: {
        user_id: true, email: true, full_name: true, phone_number: true,
        email_verified: true, created_at: true,
        _count: { select: { bookings: true, passports: true } },
      },
    });
  }
}
