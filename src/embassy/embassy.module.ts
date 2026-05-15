import { Module } from '@nestjs/common';
import { EmbassyService } from './embassy.service';
import { EmbassyController } from './embassy.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [EmbassyController],
  providers: [EmbassyService],
  exports: [EmbassyService],
})
export class EmbassyModule {}