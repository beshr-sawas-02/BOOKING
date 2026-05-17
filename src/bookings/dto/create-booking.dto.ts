import {
  IsInt,
  IsArray,
  IsString,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RelationType } from '../../common/enums';
import { CreatePaymentDto } from '../../payments/dto/create-payment.dto'; // ✨ جديد

export class CreateParticipantDto {
  @IsString()
  full_name!: string;

  @IsEnum(RelationType)
  relation_type!: RelationType;

  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;
}

export class CreateBookingDto {
  @IsInt()
  package_id!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateParticipantDto)
  participants!: CreateParticipantDto[];

  @IsString()
  primary_gender!: string;

  @IsOptional()
  @IsDateString()
  primary_date_of_birth?: string;

  @IsOptional()
  @IsString()
  deposit_due_date?: string;

  @IsOptional()
  @IsString()
  final_payment_due_date?: string;

  @IsOptional()
  @IsString()
  trip_end_date?: string;

  // ✨ جديد: بيانات دفع العربون (مطلوب لإنشاء الحجز)
  @ValidateNested()
  @Type(() => CreatePaymentDto)
  payment!: CreatePaymentDto;
}