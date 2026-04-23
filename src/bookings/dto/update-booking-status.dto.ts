import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '../../common/enums';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  booking_status!: BookingStatus;
  @IsOptional()
  @IsString()
  reason?: string;
}
