import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
    @IsInt()
    booking_id!: number;

    @IsInt()
    @Min(1)
    @Max(5)
    rating!: number;

    @IsOptional()
    @IsString()
    comment?: string;
}