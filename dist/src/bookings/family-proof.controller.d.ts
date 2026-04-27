import { FamilyProofService } from './family-proof.service';
import { CreateFamilyProofDto } from './dto/create-family-proof.dto';
import { VerifyFamilyProofDto } from './dto/verify-family-proof.dto';
import { FamilyProofFilterDto } from './dto/family-proof-filter.dto';
export declare class FamilyProofController {
    private familyProofService;
    constructor(familyProofService: FamilyProofService);
    upload(user: any, file: any, dto: CreateFamilyProofDto): Promise<{
        message: string;
        created_at: Date;
        updated_at: Date;
        verification_status: import(".prisma/client").$Enums.VerificationStatus;
        booking_id: bigint;
        rejection_reason: string | null;
        document_type: string;
        father_name: string | null;
        mother_name: string | null;
        document_id: bigint;
        document_url: string;
        im_extracted: boolean;
        uploaded_by: bigint;
    }>;
    findAll(query: FamilyProofFilterDto): Promise<import("../common/dto/pagination.dto").PaginatedResponse<{
        booking: {
            package: {
                package_id: bigint;
                package_title: string;
                package_type: import(".prisma/client").$Enums.PackageType;
            };
            booking_status: import(".prisma/client").$Enums.BookingStatus;
            booking_id: bigint;
        };
        _count: {
            booking_participants: number;
        };
        uploader: {
            email: string;
            full_name: string;
            phone_number: string | null;
            user_id: bigint;
        };
    } & {
        created_at: Date;
        updated_at: Date;
        verification_status: import(".prisma/client").$Enums.VerificationStatus;
        booking_id: bigint;
        rejection_reason: string | null;
        document_type: string;
        father_name: string | null;
        mother_name: string | null;
        document_id: bigint;
        document_url: string;
        im_extracted: boolean;
        uploaded_by: bigint;
    }>>;
    findPending(query: FamilyProofFilterDto): Promise<import("../common/dto/pagination.dto").PaginatedResponse<{
        booking: {
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
            };
            booking_participants: {
                full_name: string;
                relation_type: import(".prisma/client").$Enums.RelationType;
                is_primary: boolean;
                participant_id: bigint;
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
        };
        uploader: {
            email: string;
            full_name: string;
            phone_number: string | null;
            user_id: bigint;
        };
    } & {
        created_at: Date;
        updated_at: Date;
        verification_status: import(".prisma/client").$Enums.VerificationStatus;
        booking_id: bigint;
        rejection_reason: string | null;
        document_type: string;
        father_name: string | null;
        mother_name: string | null;
        document_id: bigint;
        document_url: string;
        im_extracted: boolean;
        uploaded_by: bigint;
    }>>;
    getStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    }>;
    findByBooking(bookingId: number): Promise<({
        booking_participants: {
            full_name: string;
            relation_type: import(".prisma/client").$Enums.RelationType;
            participant_id: bigint;
        }[];
        uploader: {
            email: string;
            full_name: string;
            user_id: bigint;
        };
    } & {
        created_at: Date;
        updated_at: Date;
        verification_status: import(".prisma/client").$Enums.VerificationStatus;
        booking_id: bigint;
        rejection_reason: string | null;
        document_type: string;
        father_name: string | null;
        mother_name: string | null;
        document_id: bigint;
        document_url: string;
        im_extracted: boolean;
        uploaded_by: bigint;
    })[]>;
    findOne(id: number): Promise<{
        booking: {
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
            };
            booking_participants: {
                full_name: string;
                created_at: Date;
                user_id: bigint | null;
                updated_at: Date;
                booking_id: bigint;
                relation_type: import(".prisma/client").$Enums.RelationType;
                is_primary: boolean;
                participant_id: bigint;
                passport_id: bigint | null;
                family_proof_id: bigint | null;
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
        };
        booking_participants: {
            full_name: string;
            created_at: Date;
            user_id: bigint | null;
            updated_at: Date;
            booking_id: bigint;
            relation_type: import(".prisma/client").$Enums.RelationType;
            is_primary: boolean;
            participant_id: bigint;
            passport_id: bigint | null;
            family_proof_id: bigint | null;
        }[];
        uploader: {
            email: string;
            full_name: string;
            phone_number: string | null;
            user_id: bigint;
        };
    } & {
        created_at: Date;
        updated_at: Date;
        verification_status: import(".prisma/client").$Enums.VerificationStatus;
        booking_id: bigint;
        rejection_reason: string | null;
        document_type: string;
        father_name: string | null;
        mother_name: string | null;
        document_id: bigint;
        document_url: string;
        im_extracted: boolean;
        uploaded_by: bigint;
    }>;
    verify(id: number, dto: VerifyFamilyProofDto): Promise<{
        booking: {
            package: {
                package_title: string;
            };
            booking_id: bigint;
        };
        uploader: {
            email: string;
            full_name: string;
        };
    } & {
        created_at: Date;
        updated_at: Date;
        verification_status: import(".prisma/client").$Enums.VerificationStatus;
        booking_id: bigint;
        rejection_reason: string | null;
        document_type: string;
        father_name: string | null;
        mother_name: string | null;
        document_id: bigint;
        document_url: string;
        im_extracted: boolean;
        uploaded_by: bigint;
    }>;
    link(id: number, participantId: number): Promise<{
        family_proof: {
            created_at: Date;
            updated_at: Date;
            verification_status: import(".prisma/client").$Enums.VerificationStatus;
            booking_id: bigint;
            rejection_reason: string | null;
            document_type: string;
            father_name: string | null;
            mother_name: string | null;
            document_id: bigint;
            document_url: string;
            im_extracted: boolean;
            uploaded_by: bigint;
        } | null;
    } & {
        full_name: string;
        created_at: Date;
        user_id: bigint | null;
        updated_at: Date;
        booking_id: bigint;
        relation_type: import(".prisma/client").$Enums.RelationType;
        is_primary: boolean;
        participant_id: bigint;
        passport_id: bigint | null;
        family_proof_id: bigint | null;
    }>;
}
