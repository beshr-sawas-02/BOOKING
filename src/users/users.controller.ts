import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // ─────────────────────────────────────────────────────────
  // User endpoints
  // ─────────────────────────────────────────────────────────

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return this.usersService.getProfile(Number(user.user_id));
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.update(Number(user.user_id), dto);
  }

  // ─────────────────────────────────────────────────────────
  // Admin endpoints
  // ─────────────────────────────────────────────────────────

  /**
   * GET /api/users?page=1&limit=10&search=ahmad
   * قائمة المستخدمين مع pagination + search (للأدمن فقط)
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll(@Query() query: PaginationDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  /**
   * PATCH /api/users/:id/toggle-active
   * تفعيل / تعطيل المستخدم (للأدمن فقط)
   */
  @Patch(':id/toggle-active')
  @UseGuards(RolesGuard)
  @Roles('admin')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.toggleActive(id);
  }
}