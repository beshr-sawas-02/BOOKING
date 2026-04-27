import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '../../common/enums';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  booking_status!: BookingStatus;

  /**
   * سبب الرفض/الإلغاء
   * مطلوب إذا كان الـ status هو REJECTED أو CANCELLED
   */
  @IsOptional()
  @IsString()
  rejection_reason?: string;

  // للـ backward compatibility (نفس reason بس باسم مختلف)
  @IsOptional()
  @IsString()
  reason?: string;
}