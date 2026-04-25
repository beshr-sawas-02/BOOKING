import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../upload/cloudinary.service';
import { AiService } from '../ai/ai.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { VerifyPassportDto } from './dto/verify-passport.dto';
import { ImageType } from '../common/enums';
import { MulterFile } from '../common/types/multer.type';
export declare class PassportsService {
    private prisma;
    private cloudinary;
    private aiService;
    constructor(prisma: PrismaService, cloudinary: CloudinaryService, aiService: AiService);
    create(userId: number, dto: CreatePassportDto): Promise<{
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
    previewOcr(file: MulterFile): Promise<{
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
                total_price: Prisma.Decimal;
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
    findPendingVerification(): Promise<({
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
                    price_per_person: Prisma.Decimal;
                    max_participants: number;
                };
            } & {
                booking_id: bigint;
                user_id: bigint;
                created_at: Date;
                updated_at: Date;
                package_id: bigint;
                booking_status: import(".prisma/client").$Enums.BookingStatus;
                total_price: Prisma.Decimal;
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
                total_price: Prisma.Decimal;
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
    uploadImage(passportId: number, userId: number, file: MulterFile, imageType: ImageType, isAdmin: boolean): Promise<{
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
                    total_price: Prisma.Decimal;
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
    private runAiExtraction;
    verifyPassport(id: number, dto: VerifyPassportDto): Promise<{
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
    markSentToEmbassy(id: number): Promise<{
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
    saveAiExtraction(id: number, extractedData: Partial<CreatePassportDto>, confidence: number): Promise<{
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
