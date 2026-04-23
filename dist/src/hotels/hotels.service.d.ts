import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { MulterFile } from '../common/types/multer.type';
export declare class HotelsService {
    private prisma;
    private cloudinary;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    private db;
    create(dto: CreateHotelDto): Promise<any>;
    findAll(location?: string): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateHotelDto): Promise<any>;
    remove(id: number): Promise<any>;
    uploadImage(id: number, file: MulterFile, order: number): Promise<any>;
    deleteImage(imageId: number): Promise<any>;
}
