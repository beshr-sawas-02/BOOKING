import { IsString, IsEmail, IsEnum, MinLength } from 'class-validator';
import { AdminRole } from '../../common/enums';

export class CreateAdminDto {
  @IsString()
  full_name!: string;
  @IsEmail()
  email!: string;
  @IsString()
  @MinLength(6)
  password!: string;
  @IsEnum(AdminRole)
  role!: AdminRole;
}
