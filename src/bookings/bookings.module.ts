import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { FamilyProofService } from './family-proof.service';
import { FamilyProofController } from './family-proof.controller';
import { UploadModule } from '../upload/upload.module';
import { PdfModule } from '../pdf/pdf.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [UploadModule, PdfModule, NotificationsModule],
  controllers: [BookingsController, FamilyProofController],
  providers: [BookingsService, FamilyProofService],
  exports: [BookingsService],
})
export class BookingsModule {}