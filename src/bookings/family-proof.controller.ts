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
import { FamilyProofService } from './family-proof.service';
import { CreateFamilyProofDto } from './dto/create-family-proof.dto';
import { VerifyFamilyProofDto } from './dto/verify-family-proof.dto';
import { FamilyProofFilterDto } from './dto/family-proof-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { documentUploadOptions } from '../upload/multer.config';

@Controller('family-proof')
@UseGuards(JwtAuthGuard)
export class FamilyProofController {
  constructor(private familyProofService: FamilyProofService) {}

  // ─────────────────────────────────────────────────────────
  // User endpoints
  // ─────────────────────────────────────────────────────────

  @Post('upload')
  @UseGuards(RolesGuard)
  @Roles('user')
  @UseInterceptors(FileInterceptor('document', documentUploadOptions))
  upload(
    @CurrentUser() user: any,
    @UploadedFile() file: any,
    @Body() dto: CreateFamilyProofDto,
  ) {
    return this.familyProofService.upload(Number(user.user_id), file, dto);
  }

  // ─────────────────────────────────────────────────────────
  // Admin endpoints
  // ─────────────────────────────────────────────────────────

  /**
   * GET /api/family-proof?page=1&limit=10&status=PENDING
   * قائمة كل الوثائق مع pagination + filter
   */
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll(@Query() query: FamilyProofFilterDto) {
    return this.familyProofService.findAll(query);
  }

  /**
   * GET /api/family-proof/pending
   * وثائق تنتظر المراجعة
   */
  @Get('pending')
  @UseGuards(RolesGuard)
  @Roles('admin')
  findPending(@Query() query: FamilyProofFilterDto) {
    return this.familyProofService.findPending(query);
  }

  /**
   * GET /api/family-proof/stats
   * إحصائيات للـ dashboard
   */
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('admin')
  getStats() {
    return this.familyProofService.getStats();
  }

  /**
   * GET /api/family-proof/booking/:bookingId
   * كل وثائق حجز معين
   */
  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.familyProofService.findByBooking(bookingId);
  }

  /**
   * GET /api/family-proof/:id
   * تفاصيل وثيقة واحدة
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.familyProofService.findOne(id);
  }

  /**
   * PATCH /api/family-proof/:id/verify
   * مراجعة الوثيقة — قبول أو رفض مع سبب
   */
  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles('admin')
  verify(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyFamilyProofDto,
  ) {
    return this.familyProofService.verify(id, dto);
  }

  /**
   * PATCH /api/family-proof/:id/link/:participantId
   * ربط الوثيقة بمشارك معين (أدمن)
   */
  @Patch(':id/link/:participantId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  link(
    @Param('id', ParseIntPipe) id: number,
    @Param('participantId', ParseIntPipe) participantId: number,
  ) {
    return this.familyProofService.linkToParticipant(id, participantId);
  }
}