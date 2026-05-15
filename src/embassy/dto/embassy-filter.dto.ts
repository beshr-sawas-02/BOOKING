import { IsEnum, IsOptional, IsNumberString, IsDateString } from 'class-validator';
import { EmbassyStatus } from '../../common/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class EmbassyFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(EmbassyStatus)
  status?: EmbassyStatus;

  @IsOptional()
  @IsDateString()
  from_date?: string;

  @IsOptional()
  @IsDateString()
  to_date?: string;
}