import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FamilyProofService } from './family-proof.service';
import { CreateFamilyProofDto } from './dto/create-family-proof.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { VerificationStatus } from '../common/enums';
import { documentUploadOptions } from '../upload/multer.config';

@Controller('family-proof')
@UseGuards(JwtAuthGuard)
export class FamilyProofController {
  constructor(private familyProofService: FamilyProofService) {}

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

  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.familyProofService.findByBooking(bookingId);
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles('admin')
  verify(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: VerificationStatus,
  ) {
    return this.familyProofService.verify(id, status);
  }

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
