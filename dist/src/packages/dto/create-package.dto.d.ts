import { PackageType } from '../../common/enums';
export declare class CreatePackageDto {
    package_title: string;
    package_type: PackageType;
    category: string;
    description?: string;
    duration_days: number;
    price_per_person: number;
    max_participants: number;
    hotel_ids?: number[];
    supervisor_name?: string | null;
    supervisor_phone?: string | null;
    supervisor_email?: string | null;
}
