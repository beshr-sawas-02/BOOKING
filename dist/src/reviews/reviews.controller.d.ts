import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(user: any, dto: CreateReviewDto): Promise<any>;
    getMyReviews(user: any): Promise<any>;
    getTopPackages(limit?: string): Promise<any[]>;
    getByPackage(id: number): Promise<{
        package_id: number;
        total_reviews: any;
        average_rating: number;
        reviews: any;
    }>;
    delete(id: number, user: any): Promise<{
        message: string;
    }>;
}
