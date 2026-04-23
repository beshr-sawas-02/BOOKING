import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
export declare class AdminsController {
    private adminsService;
    constructor(adminsService: AdminsService);
    getDashboard(): Promise<{
        totalUsers: any;
        totalBookings: any;
        pendingBookings: any;
        totalPackages: any;
        pendingPassports: any;
        pendingEmbassy: any;
        bookingsByStatus: any;
    }>;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    create(dto: CreateAdminDto): Promise<any>;
}
