import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: PaginationDto): Promise<import("../common/dto/pagination.dto").PaginatedResponse<{
        user_id: string;
        email: string;
        full_name: string;
        is_active: boolean;
        created_at: Date;
        phone_number: string | null;
        email_verified: boolean;
        _count: {
            bookings: number;
        };
    }>>;
    findOne(id: number): Promise<{
        user_id: string;
        email: string;
        full_name: string;
        is_active: boolean;
        created_at: Date;
        phone_number: string | null;
        email_verified: boolean;
        updated_at: Date;
        _count: {
            bookings: number;
            passports: number;
            family_proof_documents: number;
        };
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        user_id: string;
        email: string;
        full_name: string;
        is_active: boolean;
        phone_number: string | null;
        updated_at: Date;
    }>;
    toggleActive(id: number): Promise<{
        user_id: string;
        message: string;
        email: string;
        full_name: string;
        is_active: boolean;
    }>;
    getProfile(userId: number): Promise<{
        user_id: string;
        email: string;
        full_name: string;
        is_active: boolean;
        created_at: Date;
        phone_number: string | null;
        email_verified: boolean;
        _count: {
            bookings: number;
            passports: number;
        };
    }>;
}
