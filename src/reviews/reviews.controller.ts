import {
  Controller, Get, Post, Delete,
  Param, Body, UseGuards, ParseIntPipe, Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // POST /api/reviews — أضف تقييم
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(Number(user.user_id), dto);
  }

  // GET /api/reviews/my — تقييماتي
  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyReviews(@CurrentUser() user: any) {
    return this.reviewsService.getMyReviews(Number(user.user_id));
  }

  // GET /api/reviews/top?limit=5 — أفضل الباقات
  @Get('top')
  getTopPackages(@Query('limit') limit?: string) {
    return this.reviewsService.getTopPackages(limit ? parseInt(limit) : 5);
  }

  // GET /api/reviews/package/:id — تقييمات باقة
  @Get('package/:id')
  getByPackage(@Param('id', ParseIntPipe) id: number) {
    return this.reviewsService.getByPackage(id);
  }

  // DELETE /api/reviews/:id — احذف تقييمي
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.reviewsService.delete(id, Number(user.user_id));
  }
}