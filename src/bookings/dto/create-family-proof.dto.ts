import { IsInt, IsString, IsOptional } from 'class-validator';
export class CreateFamilyProofDto {
  @IsInt()
  booking_id!: number;
  @IsString()
  document_type!: string;
  @IsOptional()
  @IsString()
  father_name?: string;
  @IsOptional()
  @IsString()
  mother_name?: string;
}
