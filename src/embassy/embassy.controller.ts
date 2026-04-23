import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { EmbassyService } from './embassy.service';
import { UpdateEmbassyResultDto } from './dto/update-embassy-result.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { EmbassyStatus } from '../common/enums';

@Controller('embassy')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class EmbassyController {
  constructor(private embassyService: EmbassyService) {}

  @Get('stats')
  getStats() { return this.embassyService.getStats(); }

  @Get()
  findAll(@Query('status') status?: EmbassyStatus) { return this.embassyService.findAll(status); }

  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.embassyService.findByBooking(bookingId);
  }

  @Post('submit/:bookingId')
  submitToEmbassy(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.embassyService.submitBookingToEmbassy(bookingId);
  }

  @Patch('results/:resultId')
  updateResult(@Param('resultId', ParseIntPipe) resultId: number, @Body() dto: UpdateEmbassyResultDto) {
    return this.embassyService.updateResult(resultId, dto);
  }
}
