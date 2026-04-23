import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) { return this.authService.registerUser(dto); }

  @Post('login')
  login(@Body() dto: LoginDto) { return this.authService.loginUser(dto); }

  @Post('admin/login')
  adminLogin(@Body() dto: LoginDto) { return this.authService.loginAdmin(dto); }
}
