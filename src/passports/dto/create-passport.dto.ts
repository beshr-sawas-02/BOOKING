import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Gender } from '../../common/enums';

export class CreatePassportDto {
  @IsInt()
  participant_id!: number;
  @IsString()
  passport_number!: string;
  @IsOptional()
  @IsString()
  full_name_en?: string;
  @IsOptional()
  @IsString()
  full_name_ar?: string;
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
}
