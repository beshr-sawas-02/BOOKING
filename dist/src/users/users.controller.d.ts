import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    getProfile(user: any): Promise<{
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
    updateProfile(user: any, dto: UpdateUserDto): Promise<{
        user_id: string;
        email: string;
        full_name: string;
        is_active: boolean;
        phone_number: string | null;
        updated_at: Date;
    }>;
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
    toggleActive(id: number): Promise<{
        user_id: string;
        message: string;
        email: string;
        full_name: string;
        is_active: boolean;
    }>;
}
