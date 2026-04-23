import { AdminRole } from '../../common/enums';
export declare class CreateAdminDto {
    full_name: string;
    email: string;
    password: string;
    role: AdminRole;
}
