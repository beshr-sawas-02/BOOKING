import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { GrowthQueryDto } from './dto/stats-query.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class AdminsController {
    private adminsService;
    constructor(adminsService: AdminsService);
    getDashboard(): Promise<{
        users: {
            total: number;
            active: number;
        };
        bookings: {
            total: number;
            pending: number;
            confirmed: number;
            byStatus: {
                status: import(".prisma/client").$Enums.BookingStatus;
                count: number;
            }[];
        };
        packages: number;
        pending: {
            passports: number;
            embassy: number;
            familyProofs: number;
        };
    }>;
    getStatsComparison(): Promise<{
        users: {
            current: number;
            previous: number;
            change: number;
        };
        bookings: {
            current: number;
            previous: number;
            change: number;
        };
        revenue: {
            current: number;
            previous: number;
            change: number;
        };
    }>;
    getUsersGrowth(query: GrowthQueryDto): Promise<{
        period: string;
        count: number;
    }[]>;
    getBookingsGrowth(query: GrowthQueryDto): Promise<{
        period: string;
        count: number;
    }[]>;
    findAll(query: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResponse<{
        admin_id: string;
        email: string;
        full_name: string;
        role: import(".prisma/client").$Enums.AdminRole;
        is_active: boolean;
        last_login: Date | null;
        created_at: Date;
    }>>;
    findOne(id: number): Promise<{
        admin_id: string;
        email: string;
        full_name: string;
        role: import(".prisma/client").$Enums.AdminRole;
        is_active: boolean;
        last_login: Date | null;
        created_at: Date;
    }>;
    create(dto: CreateAdminDto): Promise<{
        admin_id: string;
        email: string;
        full_name: string;
        role: import(".prisma/client").$Enums.AdminRole;
        is_active: boolean;
        last_login: Date | null;
        created_at: Date;
    }>;
    toggleActive(id: number, current: any): Promise<{
        admin_id: string;
        message: string;
        email: string;
        full_name: string;
        role: import(".prisma/client").$Enums.AdminRole;
        is_active: boolean;
    }>;
    remove(id: number, current: any): Promise<{
        message: string;
    }>;
}
