import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminsService } from './admins.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { GrowthQueryDto } from './dto/stats-query.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SuperAdminGuard } from '../common/guards/super-admin.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('admins')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminsController {
  constructor(private adminsService: AdminsService) {}

  // ─────────────────────────────────────────────────────────
  // Dashboard & Stats
  // ─────────────────────────────────────────────────────────

  /**
   * GET /api/admins/dashboard
   * إحصائيات الـ dashboard الرئيسية مع نسب التغير
   */
  @Get('dashboard')
  getDashboard() {
    return this.adminsService.getDashboardStats();
  }

  /**
   * GET /api/admins/stats/comparison
   * مقارنة هذا الشهر مع الشهر الماضي
   */
  @Get('stats/comparison')
  getStatsComparison() {
    return this.adminsService.getStatsComparison();
  }

  /**
   * GET /api/admins/stats/users-growth?period=monthly
   * بيانات chart نمو المستخدمين (آخر 12 فترة)
   */
  @Get('stats/users-growth')
  getUsersGrowth(@Query() query: GrowthQueryDto) {
    return this.adminsService.getUsersGrowth(query.period!);
  }

  /**
   * GET /api/admins/stats/bookings-growth?period=monthly
   * بيانات chart نمو الحجوزات
   */
  @Get('stats/bookings-growth')
  getBookingsGrowth(@Query() query: GrowthQueryDto) {
    return this.adminsService.getBookingsGrowth(query.period!);
  }

  // ─────────────────────────────────────────────────────────
  // إدارة الأدمنز
  // ─────────────────────────────────────────────────────────

  /**
   * GET /api/admins?page=1&limit=10&search=...
   * قائمة كل الأدمنز
   */
  @Get()
  findAll(@Query() query: PaginationDto) {
    return this.adminsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.adminsService.findOne(id);
  }

  /**
   * POST /api/admins
   * إضافة أدمن جديد — SUPER_ADMIN فقط
   */
  @Post()
  @UseGuards(SuperAdminGuard)
  create(@Body() dto: CreateAdminDto) {
    return this.adminsService.create(dto);
  }

  /**
   * PATCH /api/admins/:id/toggle-active
   * تفعيل/تعطيل أدمن — SUPER_ADMIN فقط
   */
  @Patch(':id/toggle-active')
  @UseGuards(SuperAdminGuard)
  toggleActive(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() current: any,
  ) {
    return this.adminsService.toggleActive(id, current.admin_id);
  }

  /**
   * DELETE /api/admins/:id
   * حذف أدمن — SUPER_ADMIN فقط
   */
  @Delete(':id')
  @UseGuards(SuperAdminGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() current: any,
  ) {
    return this.adminsService.remove(id, current.admin_id);
  }
}