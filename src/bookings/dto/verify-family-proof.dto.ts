import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import { VerificationStatus } from '../../common/enums';

export class VerifyFamilyProofDto {
  @IsEnum(VerificationStatus)
  status!: VerificationStatus;

  /**
   * سبب الرفض — مطلوب فقط إذا status = REJECTED
   */
  @ValidateIf((o) => o.status === VerificationStatus.REJECTED)
  @IsString()
  rejection_reason?: string;
}