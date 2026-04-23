import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsService {
    private prisma;
    constructor(prisma: PrismaService);
    private db;
    create(userId: number, dto: CreateReviewDto): Promise<any>;
    getByPackage(packageId: number): Promise<{
        package_id: number;
        total_reviews: any;
        average_rating: number;
        reviews: any;
    }>;
    getTopPackages(limit?: number): Promise<any[]>;
    getMyReviews(userId: number): Promise<any>;
    delete(reviewId: number, userId: number): Promise<{
        message: string;
    }>;
}
