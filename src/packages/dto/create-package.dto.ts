import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  IsEmail,
  ValidateIf,
} from 'class-validator';
import { PackageType } from '../../common/enums';

export class CreatePackageDto {
  @IsString()
  package_title!: string;

  @IsEnum(PackageType)
  package_type!: PackageType;

  @IsString()
  category!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  duration_days!: number;

  @IsNumber()
  @Min(0)
  price_per_person!: number;

  @IsInt()
  @Min(1)
  max_participants!: number;

  @IsOptional()
  @IsArray()
  hotel_ids?: number[];

  // ─────────────────────────────────────────────────────────
  // ✨ بيانات مشرف الرحلة (مشرف واحد لكل باقة)
  // ─────────────────────────────────────────────────────────

  /**
   * اسم مشرف الرحلة
   * يقبل: string | null | undefined
   */
  @IsOptional()
  @ValidateIf((o, value) => value !== null)
  @IsString()
  supervisor_name?: string | null;

  /**
   * رقم هاتف المشرف بالصيغة الدولية (مثلاً: +963991234567)
   */
  @IsOptional()
  @ValidateIf((o, value) => value !== null)
  @IsString()
  supervisor_phone?: string | null;

  /**
   * البريد الإلكتروني للمشرف (اختياري)
   */
  @IsOptional()
  @ValidateIf((o, value) => value !== null)
  @IsEmail()
  supervisor_email?: string | null;
}