import { EmbassyStatus } from '../../common/enums';
export declare class CreateEmbassyResultDto {
    booking_id: number;
    passport_id: number;
    embassy_status: EmbassyStatus;
    notes?: string;
}
