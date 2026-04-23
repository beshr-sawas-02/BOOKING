import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingStatus } from '../common/enums';
export declare class BookingsService {
    private prisma;
    constructor(prisma: PrismaService);
    private db;
    private mahramValidator;
    create(userId: number, dto: CreateBookingDto): Promise<any>;
    findAll(filters?: {
        status?: BookingStatus;
        userId?: number;
    }): Promise<any>;
    findOne(id: number): Promise<any>;
    findMyBookings(userId: number): Promise<any>;
    updateStatus(id: number, dto: UpdateBookingStatusDto): Promise<any>;
    cancel(id: number, userId: number): Promise<any>;
    updateByUser(bookingId: number, userId: number, dto: {
        trip_end_date?: string;
        deposit_due_date?: string;
        final_payment_due_date?: string;
    }): Promise<any>;
}
