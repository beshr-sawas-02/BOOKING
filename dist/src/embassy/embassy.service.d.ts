import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateEmbassyResultDto } from './dto/update-embassy-result.dto';
import { EmbassyFilterDto } from './dto/embassy-filter.dto';
export declare class EmbassyService {
    private prisma;
    constructor(prisma: PrismaService);
    submitBookingToEmbassy(bookingId: number): Promise<{
        message: string;
        count: number;
        results: ({
            passport: {
                passport_id: bigint;
                full_name_en: string | null;
                passport_number: string;
            };
        } & {
            embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
            booking_id: bigint;
            rejection_reason: string | null;
            passport_id: bigint;
            result_id: bigint;
            notes: string | null;
            uploaded_at: Date;
        })[];
    }>;
    updateResult(resultId: number, dto: UpdateEmbassyResultDto): Promise<{
        booking: {
            user: {
                email: string;
                full_name: string;
            };
            package: {
                package_title: string;
            };
        } & {
            created_at: Date;
            user_id: bigint;
            updated_at: Date;
            booking_status: import(".prisma/client").$Enums.BookingStatus;
            booking_id: bigint;
            package_id: bigint;
            total_price: Prisma.Decimal;
            deposit_due_date: Date | null;
            final_payment_due_date: Date | null;
            trip_end_date: Date | null;
        };
        passport: {
            passport_id: bigint;
            full_name_en: string | null;
            full_name_ar: string | null;
            passport_number: string;
        };
    } & {
        embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
        booking_id: bigint;
        rejection_reason: string | null;
        passport_id: bigint;
        result_id: bigint;
        notes: string | null;
        uploaded_at: Date;
    }>;
    findByBooking(bookingId: number): Promise<({
        passport: {
            passport_id: bigint;
            full_name_en: string | null;
            full_name_ar: string | null;
            passport_number: string;
            nationality: string | null;
        };
    } & {
        embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
        booking_id: bigint;
        rejection_reason: string | null;
        passport_id: bigint;
        result_id: bigint;
        notes: string | null;
        uploaded_at: Date;
    })[]>;
    findAll(filters: EmbassyFilterDto): Promise<import("../common/dto/pagination.dto").PaginatedResponse<{
        booking: {
            user: {
                email: string;
                full_name: string;
                phone_number: string | null;
                user_id: bigint;
            };
            package: {
                package_id: bigint;
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
            total_price: Prisma.Decimal;
            deposit_due_date: Date | null;
            final_payment_due_date: Date | null;
            trip_end_date: Date | null;
        };
        passport: {
            passport_id: bigint;
            full_name_en: string | null;
            full_name_ar: string | null;
            passport_number: string;
            nationality: string | null;
        };
    } & {
        embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
        booking_id: bigint;
        rejection_reason: string | null;
        passport_id: bigint;
        result_id: bigint;
        notes: string | null;
        uploaded_at: Date;
    }>>;
    findOne(resultId: number): Promise<{
        booking: {
            user: {
                email: string;
                full_name: string;
                phone_number: string | null;
                user_id: bigint;
            };
            package: {
                created_at: Date;
                updated_at: Date;
                package_id: bigint;
                description: string | null;
                package_title: string;
                package_type: import(".prisma/client").$Enums.PackageType;
                category: string;
                duration_days: number;
                price_per_person: Prisma.Decimal;
                max_participants: number;
            };
        } & {
            created_at: Date;
            user_id: bigint;
            updated_at: Date;
            booking_status: import(".prisma/client").$Enums.BookingStatus;
            booking_id: bigint;
            package_id: bigint;
            total_price: Prisma.Decimal;
            deposit_due_date: Date | null;
            final_payment_due_date: Date | null;
            trip_end_date: Date | null;
        };
        passport: {
            passport_images: {
                passport_id: bigint;
                uploaded_at: Date;
                image_url: string;
                image_id: bigint;
                image_type: import(".prisma/client").$Enums.ImageType;
            }[];
        } & {
            created_at: Date;
            user_id: bigint;
            updated_at: Date;
            verified_by_admin: boolean;
            gender: import(".prisma/client").$Enums.Gender | null;
            date_of_birth: Date | null;
            rejection_reason: string | null;
            participant_id: bigint | null;
            passport_id: bigint;
            full_name_en: string | null;
            full_name_ar: string | null;
            passport_number: string;
            nationality: string | null;
            issue_date: Date | null;
            expiry_date: Date | null;
            ai_extracted: boolean;
            extraction_confidence: number | null;
            sent_to_embassy: boolean;
        };
    } & {
        embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
        booking_id: bigint;
        rejection_reason: string | null;
        passport_id: bigint;
        result_id: bigint;
        notes: string | null;
        uploaded_at: Date;
    }>;
    getStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        approvalRate: number;
        rejectionRate: number;
    }>;
    private buildWhereClause;
}
