import { PassportsService } from './passports.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { VerifyPassportDto } from './dto/verify-passport.dto';
import { PassportsFilterDto } from './dto/passports-filter.dto';
import { ImageType } from '../common/enums';
export declare class PassportsController {
    private passportsService;
    constructor(passportsService: PassportsService);
    create(user: any, dto: CreatePassportDto): Promise<{
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
        verified_by_admin: boolean;
        rejection_reason: string | null;
        sent_to_embassy: boolean;
        created_at: Date;
        updated_at: Date;
        user_id: bigint;
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
            user_id: bigint;
            email: string;
            full_name: string;
        };
        passport_images: {
            passport_id: bigint;
            image_url: string;
            uploaded_at: Date;
            image_id: bigint;
            image_type: import(".prisma/client").$Enums.ImageType;
        }[];
        participant: ({
            booking: {
                booking_id: bigint;
                booking_status: import(".prisma/client").$Enums.BookingStatus;
                package: {
                    package_title: string;
                };
            };
        } & {
            passport_id: bigint | null;
            participant_id: bigint;
            created_at: Date;
            updated_at: Date;
            user_id: bigint | null;
            booking_id: bigint;
            full_name: string;
            relation_type: import(".prisma/client").$Enums.RelationType;
            is_primary: boolean;
            family_proof_id: bigint | null;
        }) | null;
    } & {
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
        verified_by_admin: boolean;
        rejection_reason: string | null;
        sent_to_embassy: boolean;
        created_at: Date;
        updated_at: Date;
        user_id: bigint;
    }>>;
    findPending(query: PassportsFilterDto): Promise<import("../common/dto/pagination.dto").PaginatedResponse<{
        user: {
            user_id: bigint;
            email: string;
            full_name: string;
        };
        passport_images: {
            passport_id: bigint;
            image_url: string;
            uploaded_at: Date;
            image_id: bigint;
            image_type: import(".prisma/client").$Enums.ImageType;
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
                    supervisor_name: string | null;
                    supervisor_phone: string | null;
                    supervisor_email: string | null;
                };
            } & {
                rejection_reason: string | null;
                created_at: Date;
                updated_at: Date;
                user_id: bigint;
                booking_id: bigint;
                package_id: bigint;
                booking_status: import(".prisma/client").$Enums.BookingStatus;
                total_price: import("@prisma/client/runtime/library").Decimal;
                deposit_due_date: Date | null;
                final_payment_due_date: Date | null;
                trip_end_date: Date | null;
                sent_to_embassy_at: Date | null;
            };
        } & {
            passport_id: bigint | null;
            participant_id: bigint;
            created_at: Date;
            updated_at: Date;
            user_id: bigint | null;
            booking_id: bigint;
            full_name: string;
            relation_type: import(".prisma/client").$Enums.RelationType;
            is_primary: boolean;
            family_proof_id: bigint | null;
        }) | null;
    } & {
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
        verified_by_admin: boolean;
        rejection_reason: string | null;
        sent_to_embassy: boolean;
        created_at: Date;
        updated_at: Date;
        user_id: bigint;
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
            image_url: string;
            uploaded_at: Date;
            image_id: bigint;
            image_type: import(".prisma/client").$Enums.ImageType;
        }[];
        participant: {
            passport_id: bigint | null;
            participant_id: bigint;
            created_at: Date;
            updated_at: Date;
            user_id: bigint | null;
            booking_id: bigint;
            full_name: string;
            relation_type: import(".prisma/client").$Enums.RelationType;
            is_primary: boolean;
            family_proof_id: bigint | null;
        } | null;
    } & {
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
        verified_by_admin: boolean;
        rejection_reason: string | null;
        sent_to_embassy: boolean;
        created_at: Date;
        updated_at: Date;
        user_id: bigint;
    })[]>;
    findOne(id: number): Promise<{
        passport_images: {
            passport_id: bigint;
            image_url: string;
            uploaded_at: Date;
            image_id: bigint;
            image_type: import(".prisma/client").$Enums.ImageType;
        }[];
        participant: ({
            booking: {
                user: {
                    user_id: bigint;
                    email: string;
                    full_name: string;
                    phone_number: string | null;
                };
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
                    supervisor_name: string | null;
                    supervisor_phone: string | null;
                    supervisor_email: string | null;
                };
                embassy_result: {
                    rejection_reason: string | null;
                    updated_at: Date;
                    uploaded_at: Date;
                    booking_id: bigint;
                    result_id: bigint;
                    embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
                    notes: string | null;
                    matched_name: string | null;
                } | null;
            } & {
                rejection_reason: string | null;
                created_at: Date;
                updated_at: Date;
                user_id: bigint;
                booking_id: bigint;
                package_id: bigint;
                booking_status: import(".prisma/client").$Enums.BookingStatus;
                total_price: import("@prisma/client/runtime/library").Decimal;
                deposit_due_date: Date | null;
                final_payment_due_date: Date | null;
                trip_end_date: Date | null;
                sent_to_embassy_at: Date | null;
            };
        } & {
            passport_id: bigint | null;
            participant_id: bigint;
            created_at: Date;
            updated_at: Date;
            user_id: bigint | null;
            booking_id: bigint;
            full_name: string;
            relation_type: import(".prisma/client").$Enums.RelationType;
            is_primary: boolean;
            family_proof_id: bigint | null;
        }) | null;
    } & {
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
        verified_by_admin: boolean;
        rejection_reason: string | null;
        sent_to_embassy: boolean;
        created_at: Date;
        updated_at: Date;
        user_id: bigint;
    }>;
    uploadImage(id: number, file: any, imageType: ImageType | undefined, user: any): Promise<{
        image: {
            passport_id: bigint;
            image_url: string;
            uploaded_at: Date;
            image_id: bigint;
            image_type: import(".prisma/client").$Enums.ImageType;
        };
        passport: {
            passport_images: {
                passport_id: bigint;
                image_url: string;
                uploaded_at: Date;
                image_id: bigint;
                image_type: import(".prisma/client").$Enums.ImageType;
            }[];
            participant: ({
                booking: {
                    user: {
                        user_id: bigint;
                        email: string;
                        full_name: string;
                        phone_number: string | null;
                    };
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
                        supervisor_name: string | null;
                        supervisor_phone: string | null;
                        supervisor_email: string | null;
                    };
                    embassy_result: {
                        rejection_reason: string | null;
                        updated_at: Date;
                        uploaded_at: Date;
                        booking_id: bigint;
                        result_id: bigint;
                        embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
                        notes: string | null;
                        matched_name: string | null;
                    } | null;
                } & {
                    rejection_reason: string | null;
                    created_at: Date;
                    updated_at: Date;
                    user_id: bigint;
                    booking_id: bigint;
                    package_id: bigint;
                    booking_status: import(".prisma/client").$Enums.BookingStatus;
                    total_price: import("@prisma/client/runtime/library").Decimal;
                    deposit_due_date: Date | null;
                    final_payment_due_date: Date | null;
                    trip_end_date: Date | null;
                    sent_to_embassy_at: Date | null;
                };
            } & {
                passport_id: bigint | null;
                participant_id: bigint;
                created_at: Date;
                updated_at: Date;
                user_id: bigint | null;
                booking_id: bigint;
                full_name: string;
                relation_type: import(".prisma/client").$Enums.RelationType;
                is_primary: boolean;
                family_proof_id: bigint | null;
            }) | null;
        } & {
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
            verified_by_admin: boolean;
            rejection_reason: string | null;
            sent_to_embassy: boolean;
            created_at: Date;
            updated_at: Date;
            user_id: bigint;
        };
        message: string;
    }>;
    verify(id: number, dto: VerifyPassportDto): Promise<{
        passport_images: {
            passport_id: bigint;
            image_url: string;
            uploaded_at: Date;
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
            passport_id: bigint | null;
            participant_id: bigint;
            created_at: Date;
            updated_at: Date;
            user_id: bigint | null;
            booking_id: bigint;
            full_name: string;
            relation_type: import(".prisma/client").$Enums.RelationType;
            is_primary: boolean;
            family_proof_id: bigint | null;
        }) | null;
    } & {
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
        verified_by_admin: boolean;
        rejection_reason: string | null;
        sent_to_embassy: boolean;
        created_at: Date;
        updated_at: Date;
        user_id: bigint;
    }>;
    sendToEmbassy(id: number): Promise<{
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
        verified_by_admin: boolean;
        rejection_reason: string | null;
        sent_to_embassy: boolean;
        created_at: Date;
        updated_at: Date;
        user_id: bigint;
    }>;
}
