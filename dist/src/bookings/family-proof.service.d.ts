import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import { CreateFamilyProofDto } from './dto/create-family-proof.dto';
import { VerifyFamilyProofDto } from './dto/verify-family-proof.dto';
import { FamilyProofFilterDto } from './dto/family-proof-filter.dto';
import { MulterFile } from '../common/types/multer.type';
export declare class FamilyProofService {
    private prisma;
    private cloudinary;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService);
    upload(userId: number, file: MulterFile, dto: CreateFamilyProofDto): Promise<{
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
    findAll(filters: FamilyProofFilterDto): Promise<import("../common/dto/pagination.dto").PaginatedResponse<{
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
    findPending(filters: FamilyProofFilterDto): Promise<import("../common/dto/pagination.dto").PaginatedResponse<{
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
                price_per_person: Prisma.Decimal;
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
            total_price: Prisma.Decimal;
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
                price_per_person: Prisma.Decimal;
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
            total_price: Prisma.Decimal;
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
    verify(documentId: number, dto: VerifyFamilyProofDto): Promise<{
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
    linkToParticipant(documentId: number, participantId: number): Promise<{
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
    private buildWhereClause;
}
