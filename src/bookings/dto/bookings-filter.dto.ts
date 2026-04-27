import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { BookingStatus } from '../../common/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class BookingsFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsString()
  package_type?: string; // HAJJ | UMRAH

  @IsOptional()
  @IsDateString()
  from_date?: string;

  @IsOptional()
  @IsDateString()
  to_date?: string;
}