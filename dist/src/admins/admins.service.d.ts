import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
export declare class AdminsService {
    private prisma;
    constructor(prisma: PrismaService);
    private db;
    create(dto: CreateAdminDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    getDashboardStats(): Promise<{
        totalUsers: any;
        totalBookings: any;
        pendingBookings: any;
        totalPackages: any;
        pendingPassports: any;
        pendingEmbassy: any;
        bookingsByStatus: any;
    }>;
}
