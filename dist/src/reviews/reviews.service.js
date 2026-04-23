"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    db() { return this.prisma; }
    async create(userId, dto) {
        const booking = await this.db().booking.findUnique({
            where: { booking_id: BigInt(dto.booking_id) },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.user_id.toString() !== userId.toString())
            throw new common_1.ForbiddenException('ليس حجزك');
        if (booking.booking_status !== 'COMPLETED')
            throw new common_1.BadRequestException('يمكنك التقييم فقط بعد اكتمال الرحلة');
        const existing = await this.db().packageReview.findUnique({
            where: { booking_id: BigInt(dto.booking_id) },
        });
        if (existing)
            throw new common_1.BadRequestException('قيّمت هذه الرحلة مسبقاً');
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
    async getByPackage(packageId) {
        const reviews = await this.db().packageReview.findMany({
            where: { package_id: BigInt(packageId) },
            include: {
                user: { select: { full_name: true } },
            },
            orderBy: { created_at: 'desc' },
        });
        const avgRating = reviews.length
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;
        return {
            package_id: packageId,
            total_reviews: reviews.length,
            average_rating: Math.round(avgRating * 10) / 10,
            reviews,
        };
    }
    async getTopPackages(limit = 5) {
        const results = await this.db().packageReview.groupBy({
            by: ['package_id'],
            _avg: { rating: true },
            _count: { rating: true },
            orderBy: { _avg: { rating: 'desc' } },
            take: limit,
            having: { rating: { _count: { gte: 1 } } },
        });
        const packages = await Promise.all(results.map(async (r) => {
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
        }));
        return packages;
    }
    async getMyReviews(userId) {
        return this.db().packageReview.findMany({
            where: { user_id: BigInt(userId) },
            include: {
                package: { select: { package_title: true, package_type: true } },
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async delete(reviewId, userId) {
        const review = await this.db().packageReview.findUnique({
            where: { review_id: BigInt(reviewId) },
        });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        if (review.user_id.toString() !== userId.toString())
            throw new common_1.ForbiddenException('ليس تقييمك');
        await this.db().packageReview.delete({
            where: { review_id: BigInt(reviewId) },
        });
        return { message: 'تم حذف التقييم' };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map