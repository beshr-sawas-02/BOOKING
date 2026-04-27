import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  PaginationDto,
  buildPaginatedResponse,
  getPaginationParams,
} from '../common/dto/pagination.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * قائمة المستخدمين مع pagination + search
   * البحث يشمل: email, full_name, phone_number
   */
  async findAll(query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const search = query.search?.trim();

    // بناء where clause للبحث
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { full_name: { contains: search, mode: 'insensitive' } },
            { phone_number: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const { skip, take } = getPaginationParams(page, limit);

    // تنفيذ متوازي للـ count و findMany (أسرع)
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

    // تحويل BigInt إلى string
    const data = users.map((u) => ({
      ...u,
      user_id: u.user_id.toString(),
    }));

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: number) {
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
    if (!user) throw new NotFoundException('User not found');
    return { ...user, user_id: user.user_id.toString() };
  }

  async update(id: number, dto: UpdateUserDto) {
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

  /**
   * تفعيل / تعطيل المستخدم (toggle)
   * إذا كان مفعّل → نعطّله، والعكس
   */
  async toggleActive(id: number) {
    const current = await this.prisma.user.findUnique({
      where: { user_id: BigInt(id) },
      select: { is_active: true },
    });
    if (!current) throw new NotFoundException('User not found');

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

  async getProfile(userId: number) {
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
    if (!user) throw new NotFoundException('User not found');
    return { ...user, user_id: user.user_id.toString() };
  }
}