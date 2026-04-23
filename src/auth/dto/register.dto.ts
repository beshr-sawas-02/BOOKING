import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
export class RegisterDto {
  @IsEmail()
  email!: string;
  @IsString()
  @MinLength(6)
  password!: string;
  @IsString()
  full_name!: string;
  @IsOptional()
  @IsString()
  phone_number?: string;
}
