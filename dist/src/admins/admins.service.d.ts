import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminDto } from './dto/create-admin.dto';
export declare class AdminsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateAdminDto): Promise<{
        admin_id: string;
        email: string;
        full_name: string;
        role: import(".prisma/client").$Enums.AdminRole;
        last_login: Date | null;
        created_at: Date;
    }>;
    findAll(): Promise<{
        admin_id: string;
        email: string;
        full_name: string;
        role: import(".prisma/client").$Enums.AdminRole;
        last_login: Date | null;
        created_at: Date;
    }[]>;
    findOne(id: number): Promise<{
        admin_id: string;
        email: string;
        full_name: string;
        role: import(".prisma/client").$Enums.AdminRole;
        last_login: Date | null;
        created_at: Date;
    }>;
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalBookings: number;
        pendingBookings: number;
        totalPackages: number;
        pendingPassports: number;
        pendingEmbassy: number;
        bookingsByStatus: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.BookingGroupByOutputType, "booking_status"[]> & {
            _count: {
                booking_status: number;
            };
        })[];
    }>;
}
