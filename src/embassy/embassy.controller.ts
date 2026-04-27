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
} from '@nestjs/common';
import { EmbassyService } from './embassy.service';
import { UpdateEmbassyResultDto } from './dto/update-embassy-result.dto';
import { EmbassyFilterDto } from './dto/embassy-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('embassy')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class EmbassyController {
  constructor(private embassyService: EmbassyService) {}

  // ─────────────────────────────────────────────────────────
  // Stats
  // ─────────────────────────────────────────────────────────

  /**
   * GET /api/embassy/stats
   * إحصائيات نتائج السفارة
   */
  @Get('stats')
  getStats() {
    return this.embassyService.getStats();
  }

  // ─────────────────────────────────────────────────────────
  // Listing
  // ─────────────────────────────────────────────────────────

  /**
   * GET /api/embassy?page=1&limit=10&status=PENDING&search=...
   */
  @Get()
  findAll(@Query() query: EmbassyFilterDto) {
    return this.embassyService.findAll(query);
  }

  /**
   * GET /api/embassy/booking/:bookingId
   * نتائج السفارة لحجز معين
   */
  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.embassyService.findByBooking(bookingId);
  }

  /**
   * GET /api/embassy/:resultId
   * تفاصيل نتيجة واحدة
   */
  @Get(':resultId')
  findOne(@Param('resultId', ParseIntPipe) resultId: number) {
    return this.embassyService.findOne(resultId);
  }

  // ─────────────────────────────────────────────────────────
  // Actions
  // ─────────────────────────────────────────────────────────

  /**
   * POST /api/embassy/submit/:bookingId
   * إرسال جوازات الحجز للسفارة
   */
  @Post('submit/:bookingId')
  submitToEmbassy(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.embassyService.submitBookingToEmbassy(bookingId);
  }

  /**
   * PATCH /api/embassy/results/:resultId
   * تحديث نتيجة السفارة (قبول/رفض مع سبب)
   */
  @Patch('results/:resultId')
  updateResult(
    @Param('resultId', ParseIntPipe) resultId: number,
    @Body() dto: UpdateEmbassyResultDto,
  ) {
    return this.embassyService.updateResult(resultId, dto);
  }
}