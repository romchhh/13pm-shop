import { unstable_noStore as noStore } from "next/cache";
import { getReviewMedia } from "@/lib/getReviewMedia";
import ReviewsCarousel from "./ReviewsCarousel";

/** Завжди читати актуальні файли з public/images/reviews */
export default function Reviews() {
  noStore();
  const media = getReviewMedia();
  return <ReviewsCarousel media={media} />;
}
