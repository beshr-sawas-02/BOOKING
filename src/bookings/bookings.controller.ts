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
  // Admin endpoints
  // ─────────────────────────────────────────────────────────

  /**
   * GET /api/bookings?page=1&limit=10&status=PENDING&search=ahmad
   *   &package_type=HAJJ&from_date=2026-01-01&to_date=2026-12-31
   */
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