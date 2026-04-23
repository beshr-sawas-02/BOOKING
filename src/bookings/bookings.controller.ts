import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, ParseIntPipe,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BookingStatus } from '../common/enums';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('user')
  create(@CurrentUser() user: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(Number(user.user_id), dto);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles('user')
  myBookings(@CurrentUser() user: any) {
    return this.bookingsService.findMyBookings(Number(user.user_id));
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  findAll(@Query('status') status?: BookingStatus) {
    return this.bookingsService.findAll({ status });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookingStatusDto) {
    return this.bookingsService.updateStatus(id, dto);
  }

  @Patch(':id/cancel')
  @UseGuards(RolesGuard)
  @Roles('user')
  cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.bookingsService.cancel(id, Number(user.user_id));
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('user')
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: { trip_end_date?: string; deposit_due_date?: string; final_payment_due_date?: string },
  ) {
    return this.bookingsService.updateByUser(id, Number(user.user_id), dto);
  }
}