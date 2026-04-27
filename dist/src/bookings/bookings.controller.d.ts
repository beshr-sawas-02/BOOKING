import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingsFilterDto } from './dto/bookings-filter.dto';
import type { CurrentUserType } from '../common/types/current-user.type';
export declare class BookingsController {
    private bookingsService;
    constructor(bookingsService: BookingsService);
    create(user: CurrentUserType, dto: CreateBookingDto): Promise<{
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
            booking_id: bigint;
            created_at: Date;
            updated_at: Date;
            user_id: bigint | null;
            participant_id: bigint;
            full_name: string;
            relation_type: import(".prisma/client").$Enums.RelationType;
            is_primary: boolean;
            passport_id: bigint | null;
            family_proof_id: bigint | null;
        }[];
        booking_id: bigint;
        booking_status: import(".prisma/client").$Enums.BookingStatus;
        total_price: import("@prisma/client/runtime/library").Decimal;
        deposit_due_date: Date | null;
        final_payment_due_date: Date | null;
        trip_end_date: Date | null;
        created_at: Date;
        updated_at: Date;
        user_id: bigint;
        package_id: bigint;
    }>;
    myBookings(user: CurrentUserType, query: BookingsFilterDto): Promise<import("../common/dto/pagination.dto").PaginatedResponse<{
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
                updated_at: Date;
                user_id: bigint;
                participant_id: bigint | null;
                passport_id: bigint;
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
            } | null;
            family_proof: {
                booking_id: bigint;
                created_at: Date;
                updated_at: Date;
                rejection_reason: string | null;
                document_id: bigint;
                uploaded_by: bigint;
                document_url: string;
                document_type: string;
                father_name: string | null;
                mother_name: string | null;
                im_extracted: boolean;
                verification_status: import(".prisma/client").$Enums.VerificationStatus;
            } | null;
        } & {
            booking_id: bigint;
            created_at: Date;
            updated_at: Date;
            user_id: bigint | null;
            participant_id: bigint;
            full_name: string;
            relation_type: import(".prisma/client").$Enums.RelationType;
            is_primary: boolean;
            passport_id: bigint | null;
            family_proof_id: bigint | null;
        })[];
        embassy_results: {
            booking_id: bigint;
            passport_id: bigint;
            rejection_reason: string | null;
            result_id: bigint;
            embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
            notes: string | null;
            uploaded_at: Date;
        }[];
        review: {
            booking_id: bigint;
            created_at: Date;
            user_id: bigint;
            package_id: bigint;
            review_id: bigint;
            rating: number;
            comment: string | null;
        } | null;
    } & {
        booking_id: bigint;
        booking_status: import(".prisma/client").$Enums.BookingStatus;
        total_price: import("@prisma/client/runtime/library").Decimal;
        deposit_due_date: Date | null;
        final_payment_due_date: Date | null;
        trip_end_date: Date | null;
        created_at: Date;
        updated_at: Date;
        user_id: bigint;
        package_id: bigint;
    }>>;
    findAll(query: BookingsFilterDto): Promise<import("../common/dto/pagination.dto").PaginatedResponse<{
        user: {
            user_id: bigint;
            full_name: string;
            email: string;
            phone_number: string | null;
        };
        package: {
            package_id: bigint;
            package_title: string;
            package_type: import(".prisma/client").$Enums.PackageType;
            duration_days: number;
        };
        booking_participants: {
            participant_id: bigint;
            full_name: string;
            relation_type: import(".prisma/client").$Enums.RelationType;
            is_primary: boolean;
            passport: {
                passport_id: bigint;
                verified_by_admin: boolean;
                rejection_reason: string | null;
            } | null;
            passport_id: bigint | null;
        }[];
        embassy_results: {
            result_id: bigint;
            embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
        }[];
        family_proof_documents: {
            document_id: bigint;
            verification_status: import(".prisma/client").$Enums.VerificationStatus;
        }[];
        _count: {
            booking_participants: number;
            embassy_results: number;
            family_proof_documents: number;
        };
    } & {
        booking_id: bigint;
        booking_status: import(".prisma/client").$Enums.BookingStatus;
        total_price: import("@prisma/client/runtime/library").Decimal;
        deposit_due_date: Date | null;
        final_payment_due_date: Date | null;
        trip_end_date: Date | null;
        created_at: Date;
        updated_at: Date;
        user_id: bigint;
        package_id: bigint;
    }>>;
    findOne(id: number): Promise<{
        workflow: {
            passports: {
                total: any;
                uploaded: any;
                verified: any;
                rejected: any;
                pending: any;
            };
            documents: {
                total: any;
                approved: any;
                rejected: any;
                pending: any;
            };
            embassy: {
                total: any;
                approved: any;
                rejected: any;
                pending: any;
            };
            canConfirmBooking: boolean;
            canSendToEmbassy: boolean;
            canCompleteBooking: boolean;
            suggestions: string[];
            blockReasons: string[];
        };
        user: {
            user_id: bigint;
            full_name: string;
            email: string;
            phone_number: string | null;
            is_active: boolean;
        };
        package: {
            package_hotels: ({
                hotel: {
                    created_at: Date;
                    updated_at: Date;
                    description: string | null;
                    hotel_id: bigint;
                    hotel_name: string;
                    stars: number;
                    room_types: string | null;
                    location: string;
                    latitude: number | null;
                    longitude: number | null;
                };
            } & {
                package_id: bigint;
                id: bigint;
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
                    uploaded_at: Date;
                    image_id: bigint;
                    image_url: string;
                    image_type: import(".prisma/client").$Enums.ImageType;
                }[];
            } & {
                created_at: Date;
                updated_at: Date;
                user_id: bigint;
                participant_id: bigint | null;
                passport_id: bigint;
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
            }) | null;
            family_proof: {
                booking_id: bigint;
                created_at: Date;
                updated_at: Date;
                rejection_reason: string | null;
                document_id: bigint;
                uploaded_by: bigint;
                document_url: string;
                document_type: string;
                father_name: string | null;
                mother_name: string | null;
                im_extracted: boolean;
                verification_status: import(".prisma/client").$Enums.VerificationStatus;
            } | null;
        } & {
            booking_id: bigint;
            created_at: Date;
            updated_at: Date;
            user_id: bigint | null;
            participant_id: bigint;
            full_name: string;
            relation_type: import(".prisma/client").$Enums.RelationType;
            is_primary: boolean;
            passport_id: bigint | null;
            family_proof_id: bigint | null;
        })[];
        embassy_results: ({
            passport: {
                passport_id: bigint;
                full_name_en: string | null;
                full_name_ar: string | null;
                passport_number: string;
            };
        } & {
            booking_id: bigint;
            passport_id: bigint;
            rejection_reason: string | null;
            result_id: bigint;
            embassy_status: import(".prisma/client").$Enums.EmbassyStatus;
            notes: string | null;
            uploaded_at: Date;
        })[];
        family_proof_documents: ({
            uploader: {
                user_id: bigint;
                full_name: string;
                email: string;
            };
        } & {
            booking_id: bigint;
            created_at: Date;
            updated_at: Date;
            rejection_reason: string | null;
            document_id: bigint;
            uploaded_by: bigint;
            document_url: string;
            document_type: string;
            father_name: string | null;
            mother_name: string | null;
            im_extracted: boolean;
            verification_status: import(".prisma/client").$Enums.VerificationStatus;
        })[];
        review: {
            booking_id: bigint;
            created_at: Date;
            user_id: bigint;
            package_id: bigint;
            review_id: bigint;
            rating: number;
            comment: string | null;
        } | null;
        booking_id: bigint;
        booking_status: import(".prisma/client").$Enums.BookingStatus;
        total_price: import("@prisma/client/runtime/library").Decimal;
        deposit_due_date: Date | null;
        final_payment_due_date: Date | null;
        trip_end_date: Date | null;
        created_at: Date;
        updated_at: Date;
        user_id: bigint;
        package_id: bigint;
    }>;
    updateStatus(id: number, dto: UpdateBookingStatusDto): Promise<{
        user: {
            full_name: string;
            email: string;
        };
        package: {
            package_title: string;
        };
    } & {
        booking_id: bigint;
        booking_status: import(".prisma/client").$Enums.BookingStatus;
        total_price: import("@prisma/client/runtime/library").Decimal;
        deposit_due_date: Date | null;
        final_payment_due_date: Date | null;
        trip_end_date: Date | null;
        created_at: Date;
        updated_at: Date;
        user_id: bigint;
        package_id: bigint;
    }>;
    cancel(id: number, user: CurrentUserType): Promise<{
        booking_id: bigint;
        booking_status: import(".prisma/client").$Enums.BookingStatus;
        total_price: import("@prisma/client/runtime/library").Decimal;
        deposit_due_date: Date | null;
        final_payment_due_date: Date | null;
        trip_end_date: Date | null;
        created_at: Date;
        updated_at: Date;
        user_id: bigint;
        package_id: bigint;
    }>;
    update(id: number, user: CurrentUserType, dto: {
        trip_end_date?: string;
        deposit_due_date?: string;
        final_payment_due_date?: string;
    }): Promise<{
        booking_id: bigint;
        booking_status: import(".prisma/client").$Enums.BookingStatus;
        total_price: import("@prisma/client/runtime/library").Decimal;
        deposit_due_date: Date | null;
        final_payment_due_date: Date | null;
        trip_end_date: Date | null;
        created_at: Date;
        updated_at: Date;
        user_id: bigint;
        package_id: bigint;
    }>;
}
