import dynamic from "next/dynamic";
import Hero from "@/components/main-page/Hero";
import TopSaleServer from "@/components/main-page/TopSaleServer";
import { Suspense } from "react";

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

export const revalidate = 300; // ISR every 5 minutes

export default function Home() {
  return (
    <>
      <Hero />
      <Suspense fallback={<div className="text-center py-20 text-lg">Завантаження топових товарів...</div>}>
        <TopSaleServer />
      </Suspense>
      <AboutUs />
      <WhyChooseUs />
      <SocialMedia />
      <LimitedEdition />
      <FAQ />
      <Reviews />
    </>
  );
}
