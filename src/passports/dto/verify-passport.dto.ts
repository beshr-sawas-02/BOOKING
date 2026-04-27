import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { Gender } from '../../common/enums';

export class VerifyPassportDto {
  @IsOptional()
  @IsString()
  full_name_en?: string;

  @IsOptional()
  @IsString()
  full_name_ar?: string;

  @IsOptional()
  @IsString()
  passport_number?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsDateString()
  issue_date?: string;

  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  /**
   * true = الجواز موثّق ومقبول
   * false = الجواز مرفوض (rejection_reason مطلوب)
   */
  @IsBoolean()
  verified_by_admin!: boolean;

  /**
   * سبب الرفض — مطلوب فقط إذا verified_by_admin = false
   */
  @ValidateIf((o) => o.verified_by_admin === false)
  @IsString()
  rejection_reason?: string;
}