import { RelationType } from '../../common/enums';
export declare class CreateParticipantDto {
    full_name: string;
    relation_type: RelationType;
    is_primary?: boolean;
    gender?: string;
    date_of_birth?: string;
}
export declare class CreateBookingDto {
    package_id: number;
    participants: CreateParticipantDto[];
    primary_gender: string;
    primary_date_of_birth?: string;
    deposit_due_date?: string;
    final_payment_due_date?: string;
    trip_end_date?: string;
}
