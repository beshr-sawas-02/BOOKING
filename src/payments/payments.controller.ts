import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  /**
   * POST /api/payments/bookings/:id/pay-final
   * دفع المبلغ النهائي
   */
  @Post('bookings/:id/pay-final')
  @UseGuards(RolesGuard)
  @Roles('user')
  payFinal(
    @Param('id', ParseIntPipe) bookingId: number,
    @CurrentUser() user: any,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.payFinal(bookingId, Number(user.user_id), dto);
  }

  /**
   * GET /api/payments/bookings/:id
   * تاريخ الدفعات لحجز معيّن
   */
  @Get('bookings/:id')
  @UseGuards(RolesGuard)
  @Roles('user', 'admin')
  findByBooking(
    @Param('id', ParseIntPipe) bookingId: number,
    @CurrentUser() user: any,
  ) {
    const isAdmin = user.role === 'admin';
    const userId = isAdmin ? Number(user.admin_id) : Number(user.user_id);
    return this.paymentsService.findByBooking(bookingId, userId, isAdmin);
  }
}