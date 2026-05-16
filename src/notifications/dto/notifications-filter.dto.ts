import { IsOptional, IsBooleanString } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class NotificationsFilterDto extends PaginationDto {
  @IsOptional()
  @IsBooleanString()
  unreadOnly?: string;
}