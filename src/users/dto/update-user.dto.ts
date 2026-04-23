import { IsString, IsOptional } from 'class-validator';
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  full_name?: string;
  @IsOptional()
  @IsString()
  phone_number?: string;
}
