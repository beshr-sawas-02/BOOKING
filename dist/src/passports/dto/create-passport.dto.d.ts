import { Gender } from '../../common/enums';
export declare class CreatePassportDto {
    participant_id: number;
    passport_number: string;
    full_name_en?: string;
    full_name_ar?: string;
    nationality?: string;
    gender?: Gender;
    date_of_birth?: string;
    issue_date?: string;
    expiry_date?: string;
    image_url?: string;
}
