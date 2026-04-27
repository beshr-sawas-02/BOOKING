import { BookingStatus } from '../../common/enums';
export declare class UpdateBookingStatusDto {
    booking_status: BookingStatus;
    rejection_reason?: string;
    reason?: string;
}
