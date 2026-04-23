import { Module } from '@nestjs/common';
import { EmbassyService } from './embassy.service';
import { EmbassyController } from './embassy.controller';

@Module({
  controllers: [EmbassyController],
  providers: [EmbassyService],
  exports: [EmbassyService],
})
export class EmbassyModule {}
