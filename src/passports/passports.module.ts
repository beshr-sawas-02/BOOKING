import { Module } from '@nestjs/common';
import { PassportsService } from './passports.service';
import { PassportsController } from './passports.controller';
import { UploadModule } from '../upload/upload.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [UploadModule, AiModule],
  controllers: [PassportsController],
  providers: [PassportsService],
  exports: [PassportsService],
})
export class PassportsModule {}