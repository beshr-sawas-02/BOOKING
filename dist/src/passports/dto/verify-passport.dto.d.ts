import { Gender } from '../../common/enums';
export declare class VerifyPassportDto {
    full_name_en?: string;
    full_name_ar?: string;
    passport_number?: string;
    nationality?: string;
    gender?: Gender;
    date_of_birth?: string;
    issue_date?: string;
    expiry_date?: string;
    verified_by_admin: boolean;
    rejection_reason?: string;
}
