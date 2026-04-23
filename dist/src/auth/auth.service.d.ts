import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    private db;
    registerUser(dto: RegisterDto): Promise<{
        access_token: string;
        user: any;
    }>;
    loginUser(dto: LoginDto): Promise<{
        access_token: string;
        user: any;
    }>;
    loginAdmin(dto: LoginDto): Promise<{
        access_token: string;
        admin: any;
    }>;
}
