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
exports.HotelsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const cloudinary_service_1 = require("../upload/cloudinary.service");
let HotelsService = class HotelsService {
    prisma;
    cloudinary;
    constructor(prisma, cloudinary) {
        this.prisma = prisma;
        this.cloudinary = cloudinary;
    }
    db() { return this.prisma; }
    async create(dto) {
        return this.db().hotel.create({ data: dto });
    }
    async findAll(location) {
        return this.db().hotel.findMany({
            where: location ? { location: { contains: location, mode: 'insensitive' } } : undefined,
            include: { hotel_images: { orderBy: { image_order: 'asc' } } },
            orderBy: { stars: 'desc' },
        });
    }
    async findOne(id) {
        const hotel = await this.db().hotel.findUnique({
            where: { hotel_id: BigInt(id) },
            include: { hotel_images: { orderBy: { image_order: 'asc' } } },
        });
        if (!hotel)
            throw new common_1.NotFoundException('Hotel not found');
        return hotel;
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.db().hotel.update({ where: { hotel_id: BigInt(id) }, data: dto });
    }
    async remove(id) {
        await this.findOne(id);
        return this.db().hotel.delete({ where: { hotel_id: BigInt(id) } });
    }
    async uploadImage(id, file, order) {
        await this.findOne(id);
        const url = await this.cloudinary.uploadFile(file, 'hotels');
        return this.db().hotelImage.create({
            data: { hotel_id: BigInt(id), image_url: url, image_order: order },
        });
    }
    async deleteImage(imageId) {
        const img = await this.db().hotelImage.findUnique({
            where: { image_id: BigInt(imageId) },
        });
        if (!img)
            throw new common_1.NotFoundException('Image not found');
        return this.db().hotelImage.delete({ where: { image_id: BigInt(imageId) } });
    }
};
exports.HotelsService = HotelsService;
exports.HotelsService = HotelsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, cloudinary_service_1.CloudinaryService])
], HotelsService);
//# sourceMappingURL=hotels.service.js.map