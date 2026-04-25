import { PassportsService } from './passports.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { VerifyPassportDto } from './dto/verify-passport.dto';
import { ImageType } from '../common/enums';
export declare class PassportsController {
    private passportsService;
    constructor(passportsService: PassportsService);
    create(user: any, dto: CreatePassportDto): Promise<{
        full_name_en: string | null;
        full_name_ar: string | null;
        passport_number: string;
        nationality: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        date_of_birth: Date | null;
        issue_date: Date | null;
        expiry_date: Date | null;
        participant_id: bigint | null;
        passport_id: bigint;
        user_id: bigint;
        created_at: Date;
        updated_at: Date;
        ai_extracted: boolean;
        extraction_confidence: number | null;
        verified_by_admin: boolean;
        sent_to_embassy: boolean;
    }>;
    previewOcr(file: any): Promise<{
        image_url: string;
        confidence: number;
        needs_review: boolean;
        extracted_data: {
            passport_number: string | undefined;
            full_name_en: string | undefined;
            full_name_ar: string | undefined;
            nationality: string | undefined;
            gender: string | undefined;
            date_of_birth: string | undefined;
            issue_date: string | undefined;
            expiry_date: string | undefined;
        };
    }>;
    findAll(): Promise<({
        user: {
            user_id: bigint;
            full_name: string;
            email: string;
        };
        passport_images: {
            image_url: string;
            passport_id: bigint;
            image_id: bigint;
            image_type: import(".prisma/client").$Enums.ImageType;
            uploaded_at: Date;
        }[];
        participant: ({
            booking: {
                booking_id: bigint;
                user_id: bigint;
                created_at: Date;
                updated_at: Date;
                package_id: bigint;
                booking_status: import(".prisma/client").$Enums.BookingStatus;
                total_price: import("@prisma/client/runtime/library").Decimal;
                deposit_due_date: Date | null;
                final_payment_due_date: Date | null;
                trip_end_date: Date | null;
            };
        } & {
            participant_id: bigint;
            passport_id: bigint | null;
            booking_id: bigint;
            user_id: bigint | null;
            full_name: string;
            relation_type: import(".prisma/client").$Enums.RelationType;
            is_primary: boolean;
            family_proof_id: bigint | null;
            created_at: Date;
            updated_at: Date;
        }) | null;
    } & {
        full_name_en: string | null;
        full_name_ar: string | null;
        passport_number: string;
        nationality: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        date_of_birth: Date | null;
        issue_date: Date | null;
        expiry_date: Date | null;
        participant_id: bigint | null;
        passport_id: bigint;
        user_id: bigint;
        created_at: Date;
        updated_at: Date;
        ai_extracted: boolean;
        extraction_confidence: number | null;
        verified_by_admin: boolean;
        sent_to_embassy: boolean;
    })[]>;
    findPending(): Promise<({
        user: {
            user_id: bigint;
            full_name: string;
            email: string;
        };
        passport_images: {
            image_url: string;
            passport_id: bigint;
            image_id: bigint;
            image_type: import(".prisma/client").$Enums.ImageType;
            uploaded_at: Date;
        }[];
        participant: ({
            booking: {
                package: {
                    created_at: Date;
                    updated_at: Date;
                    package_id: bigint;
                    package_title: string;
                    package_type: import(".prisma/client").$Enums.PackageType;
                    category: string;
                    description: string | null;
                    duration_days: number;
                    price_per_person: import("@prisma/client/runtime/library").Decimal;
                    max_participants: number;
                };
            } & {
                booking_id: bigint;
                user_id: bigint;
                created_at: Date;
                updated_at: Date;
                package_id: bigint;
                booking_status: import(".prisma/client").$Enums.BookingStatus;
                total_price: import("@prisma/client/runtime/library").Decimal;
                deposit_due_date: Date | null;
                final_payment_due_date: Date | null;
                trip_end_date: Date | null;
            };
        } & {
            participant_id: bigint;
            passport_id: bigint | null;
            booking_id: bigint;
            user_id: bigint | null;
            full_name: string;
            relation_type: import(".prisma/client").$Enums.RelationType;
            is_primary: boolean;
            family_proof_id: bigint | null;
            created_at: Date;
            updated_at: Date;
        }) | null;
    } & {
        full_name_en: string | null;
        full_name_ar: string | null;
        passport_number: string;
        nationality: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        date_of_birth: Date | null;
        issue_date: Date | null;
        expiry_date: Date | null;
        participant_id: bigint | null;
        passport_id: bigint;
        user_id: bigint;
        created_at: Date;
        updated_at: Date;
        ai_extracted: boolean;
        extraction_confidence: number | null;
        verified_by_admin: boolean;
        sent_to_embassy: boolean;
    })[]>;
    findByBooking(bookingId: number): Promise<({
        passport_images: {
            image_url: string;
            passport_id: bigint;
            image_id: bigint;
            image_type: import(".prisma/client").$Enums.ImageType;
            uploaded_at: Date;
        }[];
        participant: {
            participant_id: bigint;
            passport_id: bigint | null;
            booking_id: bigint;
            user_id: bigint | null;
            full_name: string;
            relation_type: import(".prisma/client").$Enums.RelationType;
            is_primary: boolean;
            family_proof_id: bigint | null;
            created_at: Date;
            updated_at: Date;
        } | null;
    } & {
        full_name_en: string | null;
        full_name_ar: string | null;
        passport_number: string;
        nationality: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        date_of_birth: Date | null;
        issue_date: Date | null;
        expiry_date: Date | null;
        participant_id: bigint | null;
        passport_id: bigint;
        user_id: bigint;
        created_at: Date;
        updated_at: Date;
        ai_extracted: boolean;
        extraction_confidence: number | null;
        verified_by_admin: boolean;
        sent_to_embassy: boolean;
    })[]>;
    findOne(id: number): Promise<{
        embassy_results: {
            passport_id: bigint;
            booking_id: bigint;
            uploaded_at: Date;
            result_id: bigint;
            embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
            notes: string | null;
        }[];
        passport_images: {
            image_url: string;
            passport_id: bigint;
            image_id: bigint;
            image_type: import(".prisma/client").$Enums.ImageType;
            uploaded_at: Date;
        }[];
        participant: ({
            booking: {
                booking_id: bigint;
                user_id: bigint;
                created_at: Date;
                updated_at: Date;
                package_id: bigint;
                booking_status: import(".prisma/client").$Enums.BookingStatus;
                total_price: import("@prisma/client/runtime/library").Decimal;
                deposit_due_date: Date | null;
                final_payment_due_date: Date | null;
                trip_end_date: Date | null;
            };
        } & {
            participant_id: bigint;
            passport_id: bigint | null;
            booking_id: bigint;
            user_id: bigint | null;
            full_name: string;
            relation_type: import(".prisma/client").$Enums.RelationType;
            is_primary: boolean;
            family_proof_id: bigint | null;
            created_at: Date;
            updated_at: Date;
        }) | null;
    } & {
        full_name_en: string | null;
        full_name_ar: string | null;
        passport_number: string;
        nationality: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        date_of_birth: Date | null;
        issue_date: Date | null;
        expiry_date: Date | null;
        participant_id: bigint | null;
        passport_id: bigint;
        user_id: bigint;
        created_at: Date;
        updated_at: Date;
        ai_extracted: boolean;
        extraction_confidence: number | null;
        verified_by_admin: boolean;
        sent_to_embassy: boolean;
    }>;
    uploadImage(id: number, file: any, imageType: ImageType | undefined, user: any): Promise<{
        image: {
            image_url: string;
            passport_id: bigint;
            image_id: bigint;
            image_type: import(".prisma/client").$Enums.ImageType;
            uploaded_at: Date;
        };
        passport: {
            embassy_results: {
                passport_id: bigint;
                booking_id: bigint;
                uploaded_at: Date;
                result_id: bigint;
                embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
                notes: string | null;
            }[];
            passport_images: {
                image_url: string;
                passport_id: bigint;
                image_id: bigint;
                image_type: import(".prisma/client").$Enums.ImageType;
                uploaded_at: Date;
            }[];
            participant: ({
                booking: {
                    booking_id: bigint;
                    user_id: bigint;
                    created_at: Date;
                    updated_at: Date;
                    package_id: bigint;
                    booking_status: import(".prisma/client").$Enums.BookingStatus;
                    total_price: import("@prisma/client/runtime/library").Decimal;
                    deposit_due_date: Date | null;
                    final_payment_due_date: Date | null;
                    trip_end_date: Date | null;
                };
            } & {
                participant_id: bigint;
                passport_id: bigint | null;
                booking_id: bigint;
                user_id: bigint | null;
                full_name: string;
                relation_type: import(".prisma/client").$Enums.RelationType;
                is_primary: boolean;
                family_proof_id: bigint | null;
                created_at: Date;
                updated_at: Date;
            }) | null;
        } & {
            full_name_en: string | null;
            full_name_ar: string | null;
            passport_number: string;
            nationality: string | null;
            gender: import(".prisma/client").$Enums.Gender | null;
            date_of_birth: Date | null;
            issue_date: Date | null;
            expiry_date: Date | null;
            participant_id: bigint | null;
            passport_id: bigint;
            user_id: bigint;
            created_at: Date;
            updated_at: Date;
            ai_extracted: boolean;
            extraction_confidence: number | null;
            verified_by_admin: boolean;
            sent_to_embassy: boolean;
        };
        message: string;
    }>;
    verify(id: number, dto: VerifyPassportDto): Promise<{
        full_name_en: string | null;
        full_name_ar: string | null;
        passport_number: string;
        nationality: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        date_of_birth: Date | null;
        issue_date: Date | null;
        expiry_date: Date | null;
        participant_id: bigint | null;
        passport_id: bigint;
        user_id: bigint;
        created_at: Date;
        updated_at: Date;
        ai_extracted: boolean;
        extraction_confidence: number | null;
        verified_by_admin: boolean;
        sent_to_embassy: boolean;
    }>;
    sendToEmbassy(id: number): Promise<{
        full_name_en: string | null;
        full_name_ar: string | null;
        passport_number: string;
        nationality: string | null;
        gender: import(".prisma/client").$Enums.Gender | null;
        date_of_birth: Date | null;
        issue_date: Date | null;
        expiry_date: Date | null;
        participant_id: bigint | null;
        passport_id: bigint;
        user_id: bigint;
        created_at: Date;
        updated_at: Date;
        ai_extracted: boolean;
        extraction_confidence: number | null;
        verified_by_admin: boolean;
        sent_to_embassy: boolean;
    }>;
}
