import { IsString, IsInt, IsOptional, Min, Max, IsNumber } from 'class-validator';

export class CreateHotelDto {
  @IsString()
  hotel_name!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  stars!: number;

  @IsOptional()
  @IsString()
  room_types?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  location!: string;

  // إحداثيات للخريطة
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;
}