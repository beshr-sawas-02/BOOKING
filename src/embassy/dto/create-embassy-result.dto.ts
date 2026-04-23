import { IsInt, IsEnum, IsOptional, IsString } from 'class-validator';
import { EmbassyStatus } from '../../common/enums';

export class CreateEmbassyResultDto {
  @IsInt()
  booking_id!: number;
  @IsInt()
  passport_id!: number;
  @IsEnum(EmbassyStatus)
  embassy_status!: EmbassyStatus;
  @IsOptional()
  @IsString()
  notes?: string;
}
