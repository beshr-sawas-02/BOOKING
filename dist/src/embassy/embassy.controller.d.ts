import { EmbassyService } from './embassy.service';
import { UpdateEmbassyResultDto } from './dto/update-embassy-result.dto';
import { EmbassyFilterDto } from './dto/embassy-filter.dto';
export declare class EmbassyController {
    private embassyService;
    constructor(embassyService: EmbassyService);
    uploadExcel(file: any): Promise<import("./embassy.types").ProcessResult>;
    getStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        approvalRate: number;
        rejectionRate: number;
    }>;
    findAll(query: EmbassyFilterDto): Promise<import("../common/dto/pagination.dto").PaginatedResponse<{
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
            booking_participants: {
                full_name: string;
                participant_id: bigint;
                is_primary: boolean;
            }[];
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
        updated_at: Date;
        embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
        booking_id: bigint;
        rejection_reason: string | null;
        result_id: bigint;
        notes: string | null;
        matched_name: string | null;
        uploaded_at: Date;
    }>>;
    findByBooking(bookingId: number): Promise<({
        booking: {
            user: {
                email: string;
                full_name: string;
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
        updated_at: Date;
        embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
        booking_id: bigint;
        rejection_reason: string | null;
        result_id: bigint;
        notes: string | null;
        matched_name: string | null;
        uploaded_at: Date;
    }) | null>;
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
                price_per_person: import("@prisma/client/runtime/library").Decimal;
                max_participants: number;
                supervisor_name: string | null;
                supervisor_phone: string | null;
                supervisor_email: string | null;
            };
            booking_participants: ({
                passport: {
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
                } | null;
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
            })[];
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
        updated_at: Date;
        embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
        booking_id: bigint;
        rejection_reason: string | null;
        result_id: bigint;
        notes: string | null;
        matched_name: string | null;
        uploaded_at: Date;
    }>;
    updateResult(resultId: number, dto: UpdateEmbassyResultDto): Promise<{
        updated_at: Date;
        embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
        booking_id: bigint;
        rejection_reason: string | null;
        result_id: bigint;
        notes: string | null;
        matched_name: string | null;
        uploaded_at: Date;
    }>;
}
