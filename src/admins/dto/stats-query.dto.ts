import { IsEnum, IsOptional } from 'class-validator';

export enum GrowthPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class GrowthQueryDto {
  @IsOptional()
  @IsEnum(GrowthPeriod)
  period?: GrowthPeriod = GrowthPeriod.MONTHLY;
}