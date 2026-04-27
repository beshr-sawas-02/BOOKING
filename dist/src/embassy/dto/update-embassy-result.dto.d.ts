import { EmbassyStatus } from '../../common/enums';
export declare class UpdateEmbassyResultDto {
    embassy_status: EmbassyStatus;
    notes?: string;
    rejection_reason?: string;
}
