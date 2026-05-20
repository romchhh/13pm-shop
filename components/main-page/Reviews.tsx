import { getReviewMedia } from "@/lib/getReviewMedia";
import ReviewsCarousel from "./ReviewsCarousel";

export default function Reviews() {
  const media = getReviewMedia();
  return <ReviewsCarousel media={media} />;
}
