import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingStatus } from '../common/enums';
export declare class BookingsService {
    private prisma;
    constructor(prisma: PrismaService);
    private mahramValidator;
    create(userId: number, dto: CreateBookingDto): Promise<{
        warnings: string[];
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
    }>;
    findAll(filters?: {
        status?: BookingStatus;
        userId?: number;
    }): Promise<({
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
            package_title: string;
            package_type: import(".prisma/client").$Enums.PackageType;
            category: string;
            description: string | null;
            duration_days: number;
            price_per_person: import("@prisma/client/runtime/library").Decimal;
            max_participants: number;
        };
        booking_participants: ({
            passport: {
                created_at: Date;
                user_id: bigint;
                updated_at: Date;
                verified_by_admin: boolean;
                gender: import(".prisma/client").$Enums.Gender | null;
                date_of_birth: Date | null;
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
            } | null;
            family_proof: {
                created_at: Date;
                updated_at: Date;
                booking_id: bigint;
                document_type: string;
                father_name: string | null;
                mother_name: string | null;
                document_id: bigint;
                uploaded_by: bigint;
                document_url: string;
                im_extracted: boolean;
                verification_status: import(".prisma/client").$Enums.VerificationStatus;
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
        })[];
        embassy_results: {
            booking_id: bigint;
            embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
            passport_id: bigint;
            notes: string | null;
            result_id: bigint;
            uploaded_at: Date;
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
    })[]>;
    findOne(id: number): Promise<{
        user: {
            email: string;
            full_name: string;
            phone_number: string | null;
            user_id: bigint;
        };
        package: {
            package_hotels: ({
                hotel: {
                    created_at: Date;
                    updated_at: Date;
                    description: string | null;
                    hotel_name: string;
                    stars: number;
                    room_types: string | null;
                    location: string;
                    latitude: number | null;
                    longitude: number | null;
                    hotel_id: bigint;
                };
            } & {
                id: bigint;
                package_id: bigint;
                hotel_id: bigint;
            })[];
        } & {
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
        booking_participants: ({
            passport: ({
                passport_images: {
                    passport_id: bigint;
                    image_url: string;
                    uploaded_at: Date;
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
            }) | null;
            family_proof: {
                created_at: Date;
                updated_at: Date;
                booking_id: bigint;
                document_type: string;
                father_name: string | null;
                mother_name: string | null;
                document_id: bigint;
                uploaded_by: bigint;
                document_url: string;
                im_extracted: boolean;
                verification_status: import(".prisma/client").$Enums.VerificationStatus;
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
        })[];
        family_proof_documents: {
            created_at: Date;
            updated_at: Date;
            booking_id: bigint;
            document_type: string;
            father_name: string | null;
            mother_name: string | null;
            document_id: bigint;
            uploaded_by: bigint;
            document_url: string;
            im_extracted: boolean;
            verification_status: import(".prisma/client").$Enums.VerificationStatus;
        }[];
        embassy_results: {
            booking_id: bigint;
            embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
            passport_id: bigint;
            notes: string | null;
            result_id: bigint;
            uploaded_at: Date;
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
    }>;
    findMyBookings(userId: number): Promise<({
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
            package_title: string;
            package_type: import(".prisma/client").$Enums.PackageType;
            category: string;
            description: string | null;
            duration_days: number;
            price_per_person: import("@prisma/client/runtime/library").Decimal;
            max_participants: number;
        };
        booking_participants: ({
            passport: {
                created_at: Date;
                user_id: bigint;
                updated_at: Date;
                verified_by_admin: boolean;
                gender: import(".prisma/client").$Enums.Gender | null;
                date_of_birth: Date | null;
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
            } | null;
            family_proof: {
                created_at: Date;
                updated_at: Date;
                booking_id: bigint;
                document_type: string;
                father_name: string | null;
                mother_name: string | null;
                document_id: bigint;
                uploaded_by: bigint;
                document_url: string;
                im_extracted: boolean;
                verification_status: import(".prisma/client").$Enums.VerificationStatus;
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
        })[];
        embassy_results: {
            booking_id: bigint;
            embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
            passport_id: bigint;
            notes: string | null;
            result_id: bigint;
            uploaded_at: Date;
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
    })[]>;
    updateStatus(id: number, dto: UpdateBookingStatusDto): Promise<{
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
    }>;
    cancel(id: number, userId: number): Promise<{
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
    }>;
    updateByUser(bookingId: number, userId: number, dto: {
        trip_end_date?: string;
        deposit_due_date?: string;
        final_payment_due_date?: string;
    }): Promise<{
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
    }>;
}
