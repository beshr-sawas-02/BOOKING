import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private prisma;
    private config;
    constructor(prisma: PrismaService, config: ConfigService);
    validate(payload: {
        sub: string;
        email: string;
        role: string;
    }): Promise<{
        admin_id: string;
        role: string;
        admin_role: import(".prisma/client").$Enums.AdminRole;
        email: string;
        full_name: string;
        is_active: boolean;
        last_login: Date | null;
        created_at: Date;
    } | {
        user_id: string;
        role: string;
        email: string;
        full_name: string;
        is_active: boolean;
        created_at: Date;
        phone_number: string | null;
        email_verified: boolean;
        updated_at: Date;
    }>;
}
export {};
