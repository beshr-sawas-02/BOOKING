import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { MulterFile } from '../common/types/multer.type';

@Injectable()
export class HotelsService {
  constructor(private prisma: PrismaService, private cloudinary: CloudinaryService) {}

  private db(): any { return this.prisma as any; }

  async create(dto: CreateHotelDto) {
    return this.db().hotel.create({ data: dto });
  }

  async findAll(location?: string) {
    return this.db().hotel.findMany({
      where: location ? { location: { contains: location, mode: 'insensitive' } } : undefined,
      include: { hotel_images: { orderBy: { image_order: 'asc' } } },
      orderBy: { stars: 'desc' },
    });
  }

  async findOne(id: number) {
    const hotel = await this.db().hotel.findUnique({
      where: { hotel_id: BigInt(id) },
      include: { hotel_images: { orderBy: { image_order: 'asc' } } },
    });
    if (!hotel) throw new NotFoundException('Hotel not found');
    return hotel;
  }

  async update(id: number, dto: UpdateHotelDto) {
    await this.findOne(id);
    return this.db().hotel.update({ where: { hotel_id: BigInt(id) }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.db().hotel.delete({ where: { hotel_id: BigInt(id) } });
  }

  async uploadImage(id: number, file: MulterFile, order: number) {
    await this.findOne(id);
    const url = await this.cloudinary.uploadFile(file, 'hotels');
    return this.db().hotelImage.create({
      data: { hotel_id: BigInt(id), image_url: url, image_order: order },
    });
  }

  async deleteImage(imageId: number) {
    const img = await this.db().hotelImage.findUnique({
      where: { image_id: BigInt(imageId) },
    });
    if (!img) throw new NotFoundException('Image not found');
    return this.db().hotelImage.delete({ where: { image_id: BigInt(imageId) } });
  }
}