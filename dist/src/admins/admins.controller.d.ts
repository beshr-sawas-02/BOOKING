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
    getInbox(): Promise<{
        counts: {
            passports: number;
            documents: number;
            embassy: number;
            total: number;
        };
        passports: ({
            passport_images: {
                passport_id: bigint;
                uploaded_at: Date;
                image_id: bigint;
                image_url: string;
                image_type: import(".prisma/client").$Enums.ImageType;
            }[];
            participant: ({
                booking: {
                    user: {
                        email: string;
                        full_name: string;
                    };
                    package: {
                        package_title: string;
                        package_type: import(".prisma/client").$Enums.PackageType;
                    };
                } & {
                    created_at: Date;
                    user_id: bigint;
                    updated_at: Date;
                    booking_status: import(".prisma/client").$Enums.BookingStatus;
                    booking_id: bigint;
                    package_id: bigint;
                    total_price: import("@prisma/client/runtime/library").Decimal;
                    deposit_due_date: Date | null;
                    final_payment_due_date: Date | null;
                    trip_end_date: Date | null;
                    rejection_reason: string | null;
                    sent_to_embassy_at: Date | null;
                };
            } & {
                full_name: string;
                created_at: Date;
                user_id: bigint | null;
                updated_at: Date;
                booking_id: bigint;
                passport_id: bigint | null;
                participant_id: bigint;
                relation_type: import(".prisma/client").$Enums.RelationType;
                is_primary: boolean;
                family_proof_id: bigint | null;
            }) | null;
        } & {
            created_at: Date;
            user_id: bigint;
            updated_at: Date;
            verified_by_admin: boolean;
            rejection_reason: string | null;
            passport_id: bigint;
            participant_id: bigint | null;
            full_name_en: string | null;
            full_name_ar: string | null;
            passport_number: string;
            nationality: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            date_of_birth: Date | null;
            issue_date: Date | null;
            expiry_date: Date | null;
            ai_extracted: boolean;
            extraction_confidence: number | null;
            sent_to_embassy: boolean;
        })[];
        documents: ({
            booking: {
                user: {
                    email: string;
                    full_name: string;
                };
                package: {
                    package_title: string;
                    package_type: import(".prisma/client").$Enums.PackageType;
                };
            } & {
                created_at: Date;
                user_id: bigint;
                updated_at: Date;
                booking_status: import(".prisma/client").$Enums.BookingStatus;
                booking_id: bigint;
                package_id: bigint;
                total_price: import("@prisma/client/runtime/library").Decimal;
                deposit_due_date: Date | null;
                final_payment_due_date: Date | null;
                trip_end_date: Date | null;
                rejection_reason: string | null;
                sent_to_embassy_at: Date | null;
            };
            uploader: {
                full_name: string;
            };
        } & {
            created_at: Date;
            updated_at: Date;
            verification_status: import(".prisma/client").$Enums.VerificationStatus;
            booking_id: bigint;
            rejection_reason: string | null;
            document_id: bigint;
            uploaded_by: bigint;
            document_url: string;
            document_type: string;
            father_name: string | null;
            mother_name: string | null;
            im_extracted: boolean;
        })[];
        embassy: {
            result_id: number;
            booking_id: any;
            embassy_status: string;
            notes: null;
            rejection_reason: null;
            matched_name: null;
            uploaded_at: any;
            updated_at: null;
            booking: {
                booking_id: any;
                user: any;
                package: any;
                booking_participants: never[];
            };
        }[];
    }>;
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
