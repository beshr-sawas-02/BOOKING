import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  private db(): any { return this.prisma as any; }

  async create(dto: CreatePackageDto) {
    const { hotel_ids, ...data } = dto;
    return this.db().package.create({
      data: {
        ...data,
        package_hotels: hotel_ids?.length
          ? { create: hotel_ids.map((id) => ({ hotel_id: BigInt(id) })) }
          : undefined,
      },
      include: { package_hotels: { include: { hotel: true } } },
    });
  }

  async findAll(type?: string) {
    return this.db().package.findMany({
      where: type ? { package_type: type } : undefined,
      include: {
        package_hotels: {
          include: { hotel: { include: { hotel_images: { orderBy: { image_order: 'asc' } } } } },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: number) {
    const pkg = await this.db().package.findUnique({
      where: { package_id: BigInt(id) },
      include: {
        package_hotels: {
          include: { hotel: { include: { hotel_images: { orderBy: { image_order: 'asc' } } } } },
        },
        _count: { select: { bookings: true } },
      },
    });
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async update(id: number, dto: UpdatePackageDto) {
    await this.findOne(id);
    const { hotel_ids, ...data } = dto as any;
    return this.db().package.update({
      where: { package_id: BigInt(id) },
      data,
      include: { package_hotels: { include: { hotel: true } } },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.db().package.delete({ where: { package_id: BigInt(id) } });
  }

  async addHotel(packageId: number, hotelId: number) {
    return this.db().packageHotel.create({
      data: { package_id: BigInt(packageId), hotel_id: BigInt(hotelId) },
    });
  }

  async removeHotel(packageId: number, hotelId: number) {
    return this.db().packageHotel.deleteMany({
      where: { package_id: BigInt(packageId), hotel_id: BigInt(hotelId) },
    });
  }
}
