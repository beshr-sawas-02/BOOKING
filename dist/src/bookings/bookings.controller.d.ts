import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingStatus } from '../common/enums';
export declare class BookingsController {
    private bookingsService;
    constructor(bookingsService: BookingsService);
    create(user: any, dto: CreateBookingDto): Promise<any>;
    myBookings(user: any): Promise<any>;
    findAll(status?: BookingStatus): Promise<any>;
    findOne(id: number): Promise<any>;
    updateStatus(id: number, dto: UpdateBookingStatusDto): Promise<any>;
    cancel(id: number, user: any): Promise<any>;
    update(id: number, user: any, dto: {
        trip_end_date?: string;
        deposit_due_date?: string;
        final_payment_due_date?: string;
    }): Promise<any>;
}
