import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { EmbassyStatus } from '../../common/enums';

export class UpdateEmbassyResultDto {
  @IsEnum(EmbassyStatus)
  embassy_status!: EmbassyStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  /**
   * سبب الرفض — مطلوب فقط إذا embassy_status = REJECTED
   */
  @ValidateIf((o) => o.embassy_status === EmbassyStatus.REJECTED)
  @IsString()
  rejection_reason?: string;
}