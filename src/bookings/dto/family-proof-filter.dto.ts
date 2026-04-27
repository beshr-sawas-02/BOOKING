import { IsEnum, IsOptional, IsNumberString } from 'class-validator';
import { VerificationStatus } from '../../common/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class FamilyProofFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(VerificationStatus)
  status?: VerificationStatus;

  @IsOptional()
  @IsNumberString()
  booking_id?: string;
}