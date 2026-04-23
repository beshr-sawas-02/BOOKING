import { EmbassyService } from './embassy.service';
import { UpdateEmbassyResultDto } from './dto/update-embassy-result.dto';
import { EmbassyStatus } from '../common/enums';
export declare class EmbassyController {
    private embassyService;
    constructor(embassyService: EmbassyService);
    getStats(): Promise<{
        total: any;
        pending: any;
        approved: any;
        rejected: any;
    }>;
    findAll(status?: EmbassyStatus): Promise<any>;
    findByBooking(bookingId: number): Promise<any>;
    submitToEmbassy(bookingId: number): Promise<{
        message: string;
        results: any;
    }>;
    updateResult(resultId: number, dto: UpdateEmbassyResultDto): Promise<any>;
}
