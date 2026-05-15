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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { EmbassyService } from './embassy.service';
import { UpdateEmbassyResultDto } from './dto/update-embassy-result.dto';
import { EmbassyFilterDto } from './dto/embassy-filter.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

// إعدادات رفع Excel
const excelUploadOptions = {
  storage: memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/octet-stream', // أحياناً Excel
    ];
    if (
      !allowed.includes(file.mimetype) &&
      !file.originalname.match(/\.(xlsx|xls)$/i)
    ) {
      return cb(
        new BadRequestException('يُسمح فقط بملفات Excel (.xlsx, .xls)'),
        false,
      );
    }
    cb(null, true);
  },
};

@Controller('embassy')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class EmbassyController {
  constructor(private embassyService: EmbassyService) {}

  /**
   * ✨ POST /api/embassy/upload-excel
   * رفع ملف Excel من السفارة
   *
   * الـ Excel لازم يكون فيه:
   * - العمود الأول: اسم مقدم الحجز
   * - العمود الثاني: الحالة (مقبول/مرفوض)
   * - العمود الثالث: سبب الرفض (اختياري - مطلوب فقط للرفض)
   *
   * الصف الأول = هيدر (يتم تجاوزه)
   */
  @Post('upload-excel')
  @UseInterceptors(FileInterceptor('file', excelUploadOptions))
  uploadExcel(@UploadedFile() file: any) {
    return this.embassyService.uploadEmbassyExcel(file);
  }

  /**
   * GET /api/embassy/stats
   */
  @Get('stats')
  getStats() {
    return this.embassyService.getStats();
  }

  /**
   * GET /api/embassy?page=1&limit=10&status=PENDING&search=...
   */
  @Get()
  findAll(@Query() query: EmbassyFilterDto) {
    return this.embassyService.findAll(query);
  }

  /**
   * GET /api/embassy/booking/:bookingId
   */
  @Get('booking/:bookingId')
  findByBooking(@Param('bookingId', ParseIntPipe) bookingId: number) {
    return this.embassyService.findByBooking(bookingId);
  }

  /**
   * GET /api/embassy/:resultId
   */
  @Get(':resultId')
  findOne(@Param('resultId', ParseIntPipe) resultId: number) {
    return this.embassyService.findOne(resultId);
  }

  /**
   * PATCH /api/embassy/results/:resultId
   * تحديث يدوي لنتيجة السفارة (في حال الحاجة)
   */
  @Patch('results/:resultId')
  updateResult(
    @Param('resultId', ParseIntPipe) resultId: number,
    @Body() dto: UpdateEmbassyResultDto,
  ) {
    return this.embassyService.updateResult(resultId, dto);
  }
}