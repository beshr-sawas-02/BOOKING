import { IsString, IsEnum, IsNumber, IsOptional, IsInt, Min, IsArray } from 'class-validator';
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
}
