import { IsOptional, IsBoolean, IsNumberString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class PassportsFilterDto extends PaginationDto {
  /**
   * فلتر حسب حالة المراجعة:
   * - true → جوازات مراجَعة
   * - false → جوازات تنتظر المراجعة
   * - undefined → الكل
   */
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  verified?: boolean;

  /**
   * فلتر حسب الإرسال للسفارة
   */
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  sent_to_embassy?: boolean;

  /**
   * فلتر حسب الـ confidence:
   * - low → confidence < 0.6 (أولوية المراجعة)
   * - high → confidence >= 0.8
   */
  @IsOptional()
  confidence_level?: 'low' | 'medium' | 'high';

  /**
   * فلتر حسب الحجز
   */
  @IsOptional()
  @IsNumberString()
  booking_id?: string;
}