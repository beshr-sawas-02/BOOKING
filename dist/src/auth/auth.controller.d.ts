import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: {
            user_id: string;
            email: string;
            full_name: string;
            created_at: Date;
            phone_number: string | null;
            email_verified: boolean;
            updated_at: Date;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            user_id: string;
            email: string;
            full_name: string;
            created_at: Date;
            phone_number: string | null;
            email_verified: boolean;
            updated_at: Date;
        };
    }>;
    adminLogin(dto: LoginDto): Promise<{
        access_token: string;
        admin: {
            admin_id: string;
            email: string;
            full_name: string;
            role: import(".prisma/client").$Enums.AdminRole;
            last_login: Date | null;
            created_at: Date;
        };
    }>;
}
