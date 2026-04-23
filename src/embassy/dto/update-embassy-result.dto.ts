import { IsEnum, IsOptional, IsString } from 'class-validator';
import { EmbassyStatus } from '../../common/enums';

export class UpdateEmbassyResultDto {
  @IsEnum(EmbassyStatus)
  embassy_status!: EmbassyStatus;
  @IsOptional()
  @IsString()
  notes?: string;
}
