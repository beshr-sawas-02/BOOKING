import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUrl,
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

  // ✨ جديد: رابط الصورة من OCR preview (اختياري)
  // إذا أُرسل، يعني الصورة مرفوعة مسبقاً على Cloudinary من OCR preview
  // وستُحفظ في passport_images عند إنشاء الجواز
  @IsOptional()
  @IsUrl()
  image_url?: string;
}