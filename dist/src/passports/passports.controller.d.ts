import { PassportsService } from './passports.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { VerifyPassportDto } from './dto/verify-passport.dto';
import { PassportsFilterDto } from './dto/passports-filter.dto';
import { ImageType } from '../common/enums';
export declare class PassportsController {
    private passportsService;
    constructor(passportsService: PassportsService);
    create(user: any, dto: CreatePassportDto): Promise<{
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
    findAll(query: PassportsFilterDto): Promise<import("../common/dto/pagination.dto").PaginatedResponse<{
        user: {
            email: string;
            full_name: string;
            user_id: bigint;
        };
        passport_images: {
            passport_id: bigint;
            uploaded_at: Date;
            image_url: string;
            image_id: bigint;
            image_type: import(".prisma/client").$Enums.ImageType;
        }[];
        participant: ({
            booking: {
                package: {
                    package_title: string;
                };
                booking_status: import(".prisma/client").$Enums.BookingStatus;
                booking_id: bigint;
            };
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
        }) | null;
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
    }>>;
    findPending(query: PassportsFilterDto): Promise<import("../common/dto/pagination.dto").PaginatedResponse<{
        user: {
            email: string;
            full_name: string;
            user_id: bigint;
        };
        passport_images: {
            passport_id: bigint;
            uploaded_at: Date;
            image_url: string;
            image_id: bigint;
            image_type: import(".prisma/client").$Enums.ImageType;
        }[];
        participant: ({
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
        }) | null;
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
    }>>;
    getStats(): Promise<{
        total: number;
        verified: number;
        pending: number;
        rejected: number;
        sentToEmbassy: number;
        lowConfidence: number;
        aiExtracted: number;
    }>;
    findByBooking(bookingId: number): Promise<({
        passport_images: {
            passport_id: bigint;
            uploaded_at: Date;
            image_url: string;
            image_id: bigint;
            image_type: import(".prisma/client").$Enums.ImageType;
        }[];
        participant: {
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
        } | null;
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
    })[]>;
    findOne(id: number): Promise<{
        embassy_results: {
            embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
            booking_id: bigint;
            rejection_reason: string | null;
            passport_id: bigint;
            result_id: bigint;
            notes: string | null;
            uploaded_at: Date;
        }[];
        passport_images: {
            passport_id: bigint;
            uploaded_at: Date;
            image_url: string;
            image_id: bigint;
            image_type: import(".prisma/client").$Enums.ImageType;
        }[];
        participant: ({
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
            };
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
        }) | null;
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
    }>;
    uploadImage(id: number, file: any, imageType: ImageType | undefined, user: any): Promise<{
        image: {
            passport_id: bigint;
            uploaded_at: Date;
            image_url: string;
            image_id: bigint;
            image_type: import(".prisma/client").$Enums.ImageType;
        };
        passport: {
            embassy_results: {
                embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
                booking_id: bigint;
                rejection_reason: string | null;
                passport_id: bigint;
                result_id: bigint;
                notes: string | null;
                uploaded_at: Date;
            }[];
            passport_images: {
                passport_id: bigint;
                uploaded_at: Date;
                image_url: string;
                image_id: bigint;
                image_type: import(".prisma/client").$Enums.ImageType;
            }[];
            participant: ({
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
                };
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
            }) | null;
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
        message: string;
    }>;
    verify(id: number, dto: VerifyPassportDto): Promise<{
        passport_images: {
            passport_id: bigint;
            uploaded_at: Date;
            image_url: string;
            image_id: bigint;
            image_type: import(".prisma/client").$Enums.ImageType;
        }[];
        participant: ({
            booking: {
                user: {
                    email: string;
                    full_name: string;
                };
                booking_id: bigint;
            };
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
        }) | null;
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
    }>;
    sendToEmbassy(id: number): Promise<{
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
    }>;
}
