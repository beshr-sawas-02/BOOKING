import { PrismaService } from '../prisma/prisma.service';
import { UpdateEmbassyResultDto } from './dto/update-embassy-result.dto';
import { EmbassyStatus } from '../common/enums';
export declare class EmbassyService {
    private prisma;
    constructor(prisma: PrismaService);
    private db;
    submitBookingToEmbassy(bookingId: number): Promise<{
        message: string;
        results: any;
    }>;
    updateResult(resultId: number, dto: UpdateEmbassyResultDto): Promise<any>;
    findByBooking(bookingId: number): Promise<any>;
    findAll(status?: EmbassyStatus): Promise<any>;
    getStats(): Promise<{
        total: any;
        pending: any;
        approved: any;
        rejected: any;
    }>;
}
