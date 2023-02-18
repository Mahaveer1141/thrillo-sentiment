import { PrismaClient } from "@prisma/client";

// Utils
import sentimentalService from "./sentimentalService";

// Params
type ReviewInput = {
  Rating: number;
  "Review Content": string;
}[];

// Review Service
class ReviewsService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async addReview(input: ReviewInput) {
    const reviewData = await this.getReviewData(input);

    const reviews = await this.prisma.reviews.createMany({
      data: reviewData,
    });

    return reviews;
  }

  private async getReviewData(input: ReviewInput) {
    const reviewData = await Promise.all(
      input.map(async (review) => {
        const sentiment_id =
          await sentimentalService.createReviewSentimental(
            review["Review Content"]
          );
        return {
          rating: review.Rating,
          content: review["Review Content"],
          // Note: hardcoding other fields for now
          customer_id: 1,
          product_id: 1,
          sentiment_id: sentiment_id,
        };
      })
    );

    return reviewData;
  }
}

const reviewsService = new ReviewsService();
export default reviewsService;