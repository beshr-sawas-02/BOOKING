import { PrismaService } from '../prisma/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
export declare class PackagesService {
    private prisma;
    constructor(prisma: PrismaService);
    private db;
    create(dto: CreatePackageDto): Promise<any>;
    findAll(type?: string): Promise<any>;
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdatePackageDto): Promise<any>;
    remove(id: number): Promise<any>;
    addHotel(packageId: number, hotelId: number): Promise<any>;
    removeHotel(packageId: number, hotelId: number): Promise<any>;
}
