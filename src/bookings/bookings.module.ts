import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { FamilyProofService } from './family-proof.service';
import { FamilyProofController } from './family-proof.controller';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [UploadModule],
  controllers: [BookingsController, FamilyProofController],
  providers: [BookingsService, FamilyProofService],
  exports: [BookingsService],
})
export class BookingsModule {}