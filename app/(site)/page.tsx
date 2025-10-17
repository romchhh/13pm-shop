import dynamic from "next/dynamic";
import Hero from "@/components/main-page/Hero";
import TopSale from "@/components/main-page/TopSale";

// Lazy load components that are below the fold
const AboutUs = dynamic(() => import("@/components/main-page/AboutUs"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});
const LimitedEdition = dynamic(() => import("@/components/main-page/LimitedEdition"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});
const FAQ = dynamic(() => import("@/components/main-page/FAQ"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});
const SocialMedia = dynamic(() => import("@/components/main-page/SocialMedia"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});
const WhyChooseUs = dynamic(() => import("@/components/main-page/WhyChooseUs"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});
const Reviews = dynamic(() => import("@/components/main-page/Reviews"), {
  loading: () => <div className="h-96 animate-pulse bg-gray-100" />
});

export default function Home() {
  return (
    <>
      <Hero />
      <TopSale />
      <AboutUs />
      <WhyChooseUs />
      <SocialMedia />
      <LimitedEdition />
      <FAQ />
      <Reviews />
    </>
  );
}
