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
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingsFilterDto } from './dto/bookings-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/types/current-user.type';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  // ─────────────────────────────────────────────────────────
  // User endpoints
  // ─────────────────────────────────────────────────────────

  @Post()
  @UseGuards(RolesGuard)
  @Roles('user')
  create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(Number(user.user_id), dto);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles('user')
  myBookings(
    @CurrentUser() user: CurrentUserType,
    @Query() query: BookingsFilterDto,
  ) {
    return this.bookingsService.findMyBookings(Number(user.user_id), query);
  }

  // ─────────────────────────────────────────────────────────
  // ✨ جديد: حساب العربون قبل الإنشاء (لعرضه في شاشة الدفع)
  // ─────────────────────────────────────────────────────────
  @Get('calculate-deposit/:packageId/:participantsCount')
  @UseGuards(RolesGuard)
  @Roles('user')
  calculateDeposit(
    @Param('packageId', ParseIntPipe) packageId: number,
    @Param('participantsCount', ParseIntPipe) participantsCount: number,
  ) {
    return this.bookingsService.calculateDeposit(packageId, participantsCount);
  }

  // ─────────────────────────────────────────────────────────
  // Admin endpoints
  // ─────────────────────────────────────────────────────────

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll(@Query() query: BookingsFilterDto) {
    return this.bookingsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOne(id);
  }

  @Get(':id/itinerary-pdf')
  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  async downloadItinerary(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const isAdmin = user.role === 'admin';
    const userId = isAdmin ? Number(user.admin_id) : Number(user.user_id);

    const pdfBuffer = await this.bookingsService.generateItineraryPdf(
      id,
      userId,
      isAdmin,
    );

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="itinerary-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });

    res.end(pdfBuffer);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles('user')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.bookingsService.cancel(id, Number(user.user_id));
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('user')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserType,
    @Body()
    dto: {
      trip_end_date?: string;
      deposit_due_date?: string;
      final_payment_due_date?: string;
    },
  ) {
    return this.bookingsService.updateByUser(id, Number(user.user_id), dto);
  }
}