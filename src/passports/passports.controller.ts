import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PassportsService } from './passports.service';
import { CreatePassportDto } from './dto/create-passport.dto';
import { VerifyPassportDto } from './dto/verify-passport.dto';
import { PassportsFilterDto } from './dto/passports-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ImageType } from '../common/enums';
import { imageUploadOptions } from '../upload/multer.config';

@Controller('passports')
@UseGuards(JwtAuthGuard)
export class PassportsController {
  constructor(private passportsService: PassportsService) {}

  // ─────────────────────────────────────────────────────────
  // User endpoints
  // ─────────────────────────────────────────────────────────

  @Post()
  @UseGuards(RolesGuard)
  @Roles('user')
  create(@CurrentUser() user: any, @Body() dto: CreatePassportDto) {
    return this.passportsService.create(Number(user.user_id), dto);
  }

  @Post('ocr-preview')
  @UseGuards(RolesGuard)
  @Roles('user')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  previewOcr(@UploadedFile() file: any) {
    return this.passportsService.previewOcr(file);
  }

  // ─────────────────────────────────────────────────────────
  // Admin endpoints
  // ─────────────────────────────────────────────────────────

  /**
   * GET /api/passports?page=1&limit=10&verified=false&confidence_level=low
   * قائمة كل الجوازات مع pagination + filters
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll(@Query() query: PassportsFilterDto) {
    return this.passportsService.findAll(query);
  }

  /**
   * GET /api/passports/pending?page=1&limit=10
   * جوازات تنتظر المراجعة — مرتبة حسب الأولوية (confidence منخفض أولاً)
   */
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findPending(@Query() query: PassportsFilterDto) {
    return this.passportsService.findPendingVerification(query);
  }

  /**
   * GET /api/passports/stats
   * إحصائيات سريعة للجوازات (للـ dashboard)
   */
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getStats() {
    return this.passportsService.getStats();
  }

  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.passportsService.findByBooking(bookingId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.passportsService.findOne(id);
  }

  // ─────────────────────────────────────────────────────────
  // Shared (user + admin)
  // ─────────────────────────────────────────────────────────

  @Post(':id/images')
  @UseInterceptors(FileInterceptor('image', imageUploadOptions))
  uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
    @Query('type') imageType: ImageType = ImageType.FRONT,
    @CurrentUser() user: any,
  ) {
    const isAdmin = user.role === 'admin';
    const userId = isAdmin ? user.admin_id : user.user_id;
    return this.passportsService.uploadImage(
      id,
      Number(userId),
      file,
      imageType,
      isAdmin,
    );
  }

  /**
   * PATCH /api/passports/:id/verify
   * مراجعة الجواز — قبول مع تعديل البيانات أو رفض مع سبب
   */
  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles('admin')
  verify(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyPassportDto,
  ) {
    return this.passportsService.verifyPassport(id, dto);
  }

  @Patch(':id/send-to-embassy')
  @UseGuards(RolesGuard)
  @Roles('admin')
  sendToEmbassy(@Param('id', ParseIntPipe) id: number) {
    return this.passportsService.markSentToEmbassy(id);
  }
}