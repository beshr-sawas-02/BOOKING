import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  private db() {
    return this.prisma as any;
  }

  // ─────────────────────────────────────────────────────────
  // إضافة تقييم — فقط بعد اكتمال الرحلة
  // ─────────────────────────────────────────────────────────
  async create(userId: number, dto: CreateReviewDto) {
    // 1. تحقق من الحجز
    const booking = await this.db().booking.findUnique({
      where: { booking_id: BigInt(dto.booking_id) },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.user_id.toString() !== userId.toString())
      throw new ForbiddenException('ليس حجزك');

    // 2. فقط بعد اكتمال الرحلة (COMPLETED)
    if (booking.booking_status !== 'COMPLETED')
      throw new BadRequestException('يمكنك التقييم فقط بعد اكتمال الرحلة');

    // 3. تحقق إن ما قيّم من قبل
    const existing = await this.db().packageReview.findUnique({
      where: { booking_id: BigInt(dto.booking_id) },
    });
    if (existing) throw new BadRequestException('قيّمت هذه الرحلة مسبقاً');

    // 4. أنشئ التقييم
    return this.db().packageReview.create({
      data: {
        package_id: booking.package_id,
        user_id: BigInt(userId),
        booking_id: BigInt(dto.booking_id),
        rating: dto.rating,
        comment: dto.comment,
      },
      include: {
        user: { select: { full_name: true } },
        package: { select: { package_title: true } },
      },
    });
  }

  // ─────────────────────────────────────────────────────────
  // جلب تقييمات باقة معينة
  // ─────────────────────────────────────────────────────────
  async getByPackage(packageId: number) {
    const reviews = await this.db().packageReview.findMany({
      where: { package_id: BigInt(packageId) },
      include: {
        user: { select: { full_name: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    const avgRating = reviews.length
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        reviews.length
      : 0;

    return {
      package_id: packageId,
      total_reviews: reviews.length,
      average_rating: Math.round(avgRating * 10) / 10,
      reviews,
    };
  }

  // ─────────────────────────────────────────────────────────
  // جلب أفضل الباقات حسب التقييم (للفرونت)
  // ─────────────────────────────────────────────────────────
  async getTopPackages(limit = 5) {
    const results = await this.db().packageReview.groupBy({
      by: ['package_id'],
      _avg: { rating: true },
      _count: { rating: true },
      orderBy: { _avg: { rating: 'desc' } },
      take: limit,
      having: { rating: { _count: { gte: 1 } } },
    });

    // جيب تفاصيل كل باقة
    const packages = await Promise.all(
      results.map(async (r: any) => {
        const pkg = await this.db().package.findUnique({
          where: { package_id: r.package_id },
          include: {
            package_hotels: {
              include: {
                hotel: {
                  include: { hotel_images: { take: 1 } },
                },
              },
            },
          },
        });
        return {
          ...pkg,
          average_rating: Math.round(r._avg.rating * 10) / 10,
          total_reviews: r._count.rating,
        };
      }),
    );

    return packages;
  }

  // ─────────────────────────────────────────────────────────
  // تقييماتي أنا
  // ─────────────────────────────────────────────────────────
  async getMyReviews(userId: number) {
    return this.db().packageReview.findMany({
      where: { user_id: BigInt(userId) },
      include: {
        package: { select: { package_title: true, package_type: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ─────────────────────────────────────────────────────────
  // حذف تقييم (صاحبه فقط)
  // ─────────────────────────────────────────────────────────
  async delete(reviewId: number, userId: number) {
    const review = await this.db().packageReview.findUnique({
      where: { review_id: BigInt(reviewId) },
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.user_id.toString() !== userId.toString())
      throw new ForbiddenException('ليس تقييمك');

    await this.db().packageReview.delete({
      where: { review_id: BigInt(reviewId) },
    });
    return { message: 'تم حذف التقييم' };
  }
}
